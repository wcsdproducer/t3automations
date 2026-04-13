#!/usr/bin/env npx tsx
/**
 * T3kniQ Email Digest — Gmail → AI Filter → Telegram
 *
 * Checks john@t3kniq.com for important emails, filters out noise,
 * and sends a beautifully formatted summary to Telegram.
 *
 * Setup (one-time):
 *   npx tsx scripts/email-digest.ts --auth    # Opens browser for Gmail OAuth
 *
 * Run manually:
 *   npx tsx scripts/email-digest.ts           # Check & send digest now
 *
 * Scheduled mode (runs 8 AM & 6 PM EST daily):
 *   npx tsx scripts/email-digest.ts --daemon  # Runs on schedule
 */

import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import * as http from "http";
import { google, gmail_v1 } from "googleapis";

// ──────────────────────────────────────────────
// Config
// ──────────────────────────────────────────────

const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID || "";
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET || "";
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_OWNER_ID = process.env.TELEGRAM_OWNER_ID || "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const TOKEN_PATH = path.join(process.cwd(), "scripts", ".cache", "gmail-token.json");
const STATE_PATH = path.join(process.cwd(), "scripts", ".cache", "email-digest-state.json");

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
const REDIRECT_URI = "http://localhost:3847/oauth2callback";

// ──────────────────────────────────────────────
// OAuth2
// ──────────────────────────────────────────────

function getOAuth2Client() {
  return new google.auth.OAuth2(GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, REDIRECT_URI);
}

async function authorize(): Promise<ReturnType<typeof getOAuth2Client>> {
  const oauth2 = getOAuth2Client();

  // Check for saved token
  if (fs.existsSync(TOKEN_PATH)) {
    const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
    oauth2.setCredentials(tokens);

    // Proactively refresh if expired
    if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
      console.log("🔄 Refreshing expired token...");
      const { credentials } = await oauth2.refreshAccessToken();
      oauth2.setCredentials(credentials);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(credentials));
    }

    return oauth2;
  }

  throw new Error("No Gmail token found. Run with --auth first.");
}

async function doAuthFlow(): Promise<void> {
  const oauth2 = getOAuth2Client();
  const authUrl = oauth2.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });

  console.log("\n📧 Gmail OAuth2 Authorization");
  console.log("═══════════════════════════════════════");
  console.log("\nOpening browser for authorization...\n");
  console.log(`If the browser doesn't open, visit:\n${authUrl}\n`);

  // Open browser
  const { exec } = await import("child_process");
  exec(`open "${authUrl}"`);

  // Start local server to catch the redirect
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      if (!req.url?.startsWith("/oauth2callback")) return;

      const url = new URL(req.url, "http://localhost:3847");
      const code = url.searchParams.get("code");

      if (!code) {
        res.writeHead(400);
        res.end("Missing authorization code");
        reject(new Error("No auth code received"));
        return;
      }

      try {
        const { tokens } = await oauth2.getToken(code);
        oauth2.setCredentials(tokens);

        // Save token
        const cacheDir = path.dirname(TOKEN_PATH);
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`
          <html><body style="font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; background: #0a0a0a; color: white;">
            <div style="text-align: center;">
              <h1>✅ Gmail Connected!</h1>
              <p>You can close this tab. The email digest is now configured.</p>
            </div>
          </body></html>
        `);

        console.log("✅ Gmail authorization successful!");
        console.log(`📝 Token saved to ${TOKEN_PATH}\n`);
        server.close();
        resolve();
      } catch (err: any) {
        res.writeHead(500);
        res.end("Authorization failed: " + err.message);
        reject(err);
      }
    });

    server.listen(3847, () => {
      console.log("🔐 Waiting for authorization on http://localhost:3847 ...\n");
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      server.close();
      reject(new Error("Authorization timed out (5 minutes)"));
    }, 300000);
  });
}

// ──────────────────────────────────────────────
// Gmail Reader
// ──────────────────────────────────────────────

interface EmailSummary {
  id: string;
  from: string;
  subject: string;
  date: string;
  snippet: string;
  body: string;
  labels: string[];
}

async function fetchRecentEmails(auth: any, sinceDate?: Date): Promise<EmailSummary[]> {
  const gmail = google.gmail({ version: "v1", auth });

  // Default to last 12 hours if no date provided
  const since = sinceDate || new Date(Date.now() - 12 * 60 * 60 * 1000);
  const afterEpoch = Math.floor(since.getTime() / 1000);

  console.log(`📥 Fetching emails since ${since.toISOString()}...`);

  const response = await gmail.users.messages.list({
    userId: "me",
    q: `after:${afterEpoch} in:inbox`,
    maxResults: 50,
  });

  const messageIds = response.data.messages || [];
  console.log(`   Found ${messageIds.length} messages`);

  if (messageIds.length === 0) return [];

  const emails: EmailSummary[] = [];

  for (const msg of messageIds) {
    try {
      const detail = await gmail.users.messages.get({
        userId: "me",
        id: msg.id!,
        format: "full",
      });

      const headers = detail.data.payload?.headers || [];
      const getHeader = (name: string) => headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || "";

      // Extract body text
      let bodyText = "";
      const payload = detail.data.payload;

      if (payload?.body?.data) {
        bodyText = Buffer.from(payload.body.data, "base64").toString("utf-8");
      } else if (payload?.parts) {
        const textPart = payload.parts.find(p => p.mimeType === "text/plain");
        if (textPart?.body?.data) {
          bodyText = Buffer.from(textPart.body.data, "base64").toString("utf-8");
        } else {
          // Try HTML part
          const htmlPart = payload.parts.find(p => p.mimeType === "text/html");
          if (htmlPart?.body?.data) {
            bodyText = Buffer.from(htmlPart.body.data, "base64").toString("utf-8")
              .replace(/<[^>]+>/g, " ")
              .replace(/\s+/g, " ")
              .trim();
          }
        }
      }

      const labels = detail.data.labelIds || [];

      emails.push({
        id: msg.id!,
        from: getHeader("From"),
        subject: getHeader("Subject"),
        date: getHeader("Date"),
        snippet: detail.data.snippet || "",
        body: bodyText.slice(0, 2000),
        labels,
      });
    } catch (err: any) {
      console.warn(`   ⚠️ Error fetching message ${msg.id}: ${err.message}`);
    }
  }

  return emails;
}

// ──────────────────────────────────────────────
// AI Classification
// ──────────────────────────────────────────────

interface ClassifiedEmail {
  id: string;
  from: string;
  subject: string;
  date: string;
  category: "important" | "actionable" | "informational" | "noise";
  relevanceScore: number;
  reason: string;
  oneLineSummary: string;
}

async function classifyBatch(batch: EmailSummary[], startIndex: number): Promise<Array<{
  index: number; category: string; relevanceScore: number; reason: string; oneLineSummary: string;
}>> {
  const emailDescriptions = batch.map((e, i) => (
    `--- Email ${startIndex + i} ---
From: ${e.from}
Subject: ${e.subject}
Date: ${e.date}
Snippet: ${e.snippet}
---`
  )).join("\n\n");

  const prompt = `You are an executive email assistant for John Freeman, CEO of T3kniQ (an AI Automations Agency).

Classify each email into ONE category:
- **important**: Direct business comms, client emails, partner emails, legal/financial matters, domain/hosting alerts, replies to things John sent, invoices, contracts.
- **actionable**: Requires action but not urgent — meeting invites, service notifications, account security, project updates.
- **informational**: Worth knowing but no action needed — newsletters John subscribed to, GitHub notifs, deploy status, analytics.
- **noise**: Marketing spam, promos, subscription emails, social media notifications, cold outreach, automated digests.

Return a JSON array:
[{"index":0,"category":"important","relevanceScore":95,"reason":"brief reason","oneLineSummary":"one line"}]

Keep reason and oneLineSummary SHORT (under 80 chars each).

Emails:

${emailDescriptions}`;

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          maxOutputTokens: 8192,
          temperature: 0.2,
        },
      }),
    }
  );

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Gemini API ${resp.status}: ${errText.slice(0, 200)}`);
  }

  const data = await resp.json() as any;
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!text) throw new Error("Empty Gemini response");

  // Resilient JSON parsing — handle truncated output
  try {
    return JSON.parse(text);
  } catch {
    // Try to repair: extract all complete JSON objects from the array
    const objects: any[] = [];
    const regex = /\{[^{}]*"index"\s*:\s*(\d+)[^{}]*\}/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      try {
        objects.push(JSON.parse(match[0]));
      } catch { /* skip malformed */ }
    }
    if (objects.length > 0) {
      console.log(`   ⚠️ Repaired truncated JSON: recovered ${objects.length}/${batch.length} classifications`);
      return objects;
    }
    throw new Error("Could not parse Gemini JSON response");
  }
}

async function classifyEmails(emails: EmailSummary[]): Promise<ClassifiedEmail[]> {
  if (emails.length === 0) return [];

  console.log(`🤖 Classifying ${emails.length} emails with Gemini...`);

  const BATCH_SIZE = 10;
  const allClassifications: Array<{
    index: number; category: string; relevanceScore: number; reason: string; oneLineSummary: string;
  }> = [];

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(emails.length / BATCH_SIZE);
    console.log(`   Batch ${batchNum}/${totalBatches} (${batch.length} emails)...`);

    try {
      const results = await classifyBatch(batch, i);
      // Remap indices to global
      for (const r of results) {
        allClassifications.push({ ...r, index: r.index + i });
      }
    } catch (err: any) {
      console.error(`   ❌ Batch ${batchNum} failed: ${err.message}`);
      // Fallback for this batch
      for (let j = 0; j < batch.length; j++) {
        allClassifications.push({
          index: i + j,
          category: "informational",
          relevanceScore: 50,
          reason: "Classification failed — review manually",
          oneLineSummary: batch[j].snippet.slice(0, 80),
        });
      }
    }
  }

  return allClassifications.map(c => {
    const email = emails[c.index] || emails[0];
    return {
      id: email.id,
      from: email.from,
      subject: email.subject,
      date: email.date,
      category: (c.category as any) || "informational",
      relevanceScore: c.relevanceScore || 50,
      reason: c.reason || "",
      oneLineSummary: c.oneLineSummary || email.snippet,
    };
  });
}

// ──────────────────────────────────────────────
// Telegram Notifier
// ──────────────────────────────────────────────

async function sendTelegramDigest(classified: ClassifiedEmail[]): Promise<void> {
  const important = classified.filter(e => e.category === "important");
  const actionable = classified.filter(e => e.category === "actionable");
  const informational = classified.filter(e => e.category === "informational");
  const noise = classified.filter(e => e.category === "noise");

  const now = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  let message = `📬 Email Digest — ${now}\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `${classified.length} emails checked\n`;
  message += `🔴 ${important.length} important | 🟡 ${actionable.length} action | ℹ️ ${informational.length} info | 🗑️ ${noise.length} filtered\n\n`;

  if (important.length > 0) {
    message += `🔴 IMPORTANT\n`;
    for (const e of important) {
      const fromName = e.from.split("<")[0].trim() || e.from;
      message += `\n• ${e.oneLineSummary}\n`;
      message += `  From: ${fromName}\n`;
      message += `  Score: ${e.relevanceScore}/100\n`;
    }
    message += "\n";
  }

  if (actionable.length > 0) {
    message += `🟡 ACTION NEEDED\n`;
    for (const e of actionable) {
      const fromName = e.from.split("<")[0].trim() || e.from;
      message += `\n• ${e.oneLineSummary}\n`;
      message += `  From: ${fromName}\n`;
    }
    message += "\n";
  }

  if (informational.length > 0) {
    message += `ℹ️ INFO (${informational.length})\n`;
    for (const e of informational.slice(0, 5)) {
      message += `• ${e.oneLineSummary}\n`;
    }
    if (informational.length > 5) {
      message += `  ...and ${informational.length - 5} more\n`;
    }
    message += "\n";
  }

  if (noise.length > 0) {
    message += `🗑️ Filtered: ${noise.length} (spam/marketing/subscriptions)\n`;
  }

  // Send via Telegram in chunks (4096 char limit)
  const chunks: string[] = [];
  let remaining = message;
  while (remaining.length > 0) {
    chunks.push(remaining.slice(0, 4000));
    remaining = remaining.slice(4000);
  }

  for (const chunk of chunks) {
    const resp = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_OWNER_ID,
          text: chunk,
        }),
      }
    );

    if (!resp.ok) {
      const errText = await resp.text();
      console.error(`❌ Telegram error: ${errText}`);
    }
  }

  console.log("📲 Digest sent to Telegram!");
}

// ──────────────────────────────────────────────
// State Management
// ──────────────────────────────────────────────

function loadState(): { lastCheckTime: string } {
  if (fs.existsSync(STATE_PATH)) {
    return JSON.parse(fs.readFileSync(STATE_PATH, "utf-8"));
  }
  return { lastCheckTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() };
}

function saveState(lastCheckTime: Date) {
  const dir = path.dirname(STATE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify({ lastCheckTime: lastCheckTime.toISOString() }));
}

// ──────────────────────────────────────────────
// Main Digest Flow
// ──────────────────────────────────────────────

async function runDigest(): Promise<void> {
  console.log("\n📬 Running email digest...\n");

  const state = loadState();
  const sinceDate = new Date(state.lastCheckTime);

  // Authorize Gmail
  const auth = await authorize();

  // Fetch emails since last check
  const emails = await fetchRecentEmails(auth, sinceDate);

  if (emails.length === 0) {
    console.log("📭 No new emails since last check.");

    // Still send a brief Telegram notification
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_OWNER_ID,
        text: `📭 Email Digest — No new emails since ${sinceDate.toLocaleString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit", weekday: "short" })}`,
      }),
    });

    saveState(new Date());
    return;
  }

  // Classify with Gemini
  const classified = await classifyEmails(emails);

  // Send Telegram digest
  await sendTelegramDigest(classified);

  // Save state
  saveState(new Date());

  // Log summary
  console.log("\n✅ Digest complete!");
  console.log(`   Processed: ${classified.length} emails`);
  console.log(`   Important: ${classified.filter(e => e.category === "important").length}`);
  console.log(`   Filtered:  ${classified.filter(e => e.category === "noise").length}`);
}

// ──────────────────────────────────────────────
// Daemon Mode (scheduled)
// ──────────────────────────────────────────────

async function runDaemon(): Promise<void> {
  const cron = await import("node-cron");

  console.log("🕐 Email Digest Daemon Started");
  console.log("   Schedule: 8:00 AM & 6:00 PM EST daily");
  console.log("   Press Ctrl+C to stop\n");

  // Run immediately on start
  await runDigest().catch(err => console.error("❌ Digest error:", err.message));

  // Schedule: 8 AM EST and 6 PM EST
  // node-cron uses server time, convert from EST
  cron.schedule("0 8 * * *", async () => {
    console.log(`\n⏰ Scheduled run: ${new Date().toISOString()}`);
    await runDigest().catch(err => console.error("❌ Digest error:", err.message));
  }, { timezone: "America/New_York" });

  cron.schedule("0 18 * * *", async () => {
    console.log(`\n⏰ Scheduled run: ${new Date().toISOString()}`);
    await runDigest().catch(err => console.error("❌ Digest error:", err.message));
  }, { timezone: "America/New_York" });

  // Keep process alive
  process.on("SIGINT", () => {
    console.log("\n👋 Email digest daemon stopped.");
    process.exit(0);
  });
}

// ──────────────────────────────────────────────
// Entry Point
// ──────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  // Validate config
  if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET) {
    console.error("❌ Missing GMAIL_CLIENT_ID or GMAIL_CLIENT_SECRET in .env");
    process.exit(1);
  }

  if (args.includes("--auth")) {
    await doAuthFlow();
    console.log("\n✅ You can now run the email digest:");
    console.log("   npx tsx scripts/email-digest.ts          # Run once");
    console.log("   npx tsx scripts/email-digest.ts --daemon  # Scheduled\n");
    return;
  }

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_OWNER_ID) {
    console.error("❌ Missing TELEGRAM_BOT_TOKEN or TELEGRAM_OWNER_ID in .env");
    process.exit(1);
  }

  if (args.includes("--daemon")) {
    await runDaemon();
  } else {
    await runDigest();
  }
}

main().catch(err => {
  console.error("❌ Fatal:", err.message || err);
  process.exit(1);
});
