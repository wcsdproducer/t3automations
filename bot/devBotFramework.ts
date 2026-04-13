import { Bot, Context } from "grammy";
import { execSync, exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { createMemoryStore, MemoryStore } from "./memoryStore.js";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface DevBotConfig {
  token: string;
  ownerId: number;
  workspaceRoot: string;
  workspaceName: string;
  devPassphrase?: string;       // defaults to "gravity"
  autoLockMinutes?: number;     // defaults to 60
  firebaseProjectId?: string;
}

type BotMode = "ops" | "dev";

interface BotState {
  mode: BotMode;
  lastDevActivity: number;
  autoLockTimer: NodeJS.Timeout | null;
  conversationHistory: Array<{ role: string; parts: any[] }>;
}

// ──────────────────────────────────────────────
// Browser Tools
// ──────────────────────────────────────────────

async function fetchPage(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36" },
    });
    clearTimeout(timeout);
    if (!resp.ok) return `Failed to fetch ${url}: HTTP ${resp.status}`;
    const html = await resp.text();
    // Strip HTML to plain text
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 6000);
    return `📄 Content from ${url}:\n\n${text}`;
  } catch (err: any) {
    return `Failed to fetch ${url}: ${err.message}`;
  }
}

async function webSearch(query: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const resp = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1&skip_disambig=1`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await resp.json() as any;
    const lines: string[] = [];
    if (data.AbstractText) lines.push(`📋 Summary: ${data.AbstractText}`);
    if (data.Answer) lines.push(`✅ Answer: ${data.Answer}`);
    const results = (data.RelatedTopics || [])
      .filter((t: any) => t.FirstURL && t.Text)
      .slice(0, 6)
      .map((t: any) => `• ${t.Text}\n  🔗 ${t.FirstURL}`);
    if (results.length > 0) lines.push("\nTop results:\n" + results.join("\n\n"));
    return lines.length > 0 ? lines.join("\n") : `No instant results for "${query}".`;
  } catch (err: any) {
    return `Search failed: ${err.message}`;
  }
}

const GEMINI_TOOLS = [
  {
    function_declarations: [
      {
        name: "web_search",
        description: "Search the web for real-time information, news, documentation, or facts.",
        parameters: { type: "object", properties: { query: { type: "string", description: "The search query" } }, required: ["query"] }
      },
      {
        name: "fetch_page",
        description: "Extract text content from a specific URL to read documentation or articles.",
        parameters: { type: "object", properties: { url: { type: "string", description: "The full URL to fetch" } }, required: ["url"] }
      }
    ]
  }
];

// ──────────────────────────────────────────────
// Whitelisted commands
// ──────────────────────────────────────────────

const WHITELISTED_COMMANDS = [
  "npm", "npx", "node", "tsx",
  "git", "tsc",
  "cat", "ls", "find", "grep", "head", "tail", "wc",
  "echo", "pwd",
  "firebase", "curl",
];

function safeExec(cmd: string, cwd: string, timeoutMs = 15000): string {
  const base = cmd.trim().split(/\s+/)[0];
  if (!WHITELISTED_COMMANDS.includes(base)) {
    throw new Error(`Command not allowed: ${base}`);
  }
  return execSync(cmd, {
    cwd,
    timeout: timeoutMs,
    maxBuffer: 10 * 1024 * 1024,
    encoding: "utf-8",
    env: { ...process.env, PATH: `/opt/homebrew/bin:/usr/local/bin:${process.env.HOME}/.nvm/versions/node/v22.22.1/bin:${process.env.PATH}` },
  });
}

// ──────────────────────────────────────────────
// Gemini Chat Helper
// ──────────────────────────────────────────────

async function callGemini(
  apiKey: string,
  systemInstruction: string,
  history: Array<{ role: string; parts: any[] }>,
  tools?: any[]
): Promise<any> {
  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: history,
        ...(tools ? { tools } : {}),
        generationConfig: { maxOutputTokens: 2000, temperature: 0.7 },
      }),
    }
  );
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Gemini API ${resp.status}: ${errText.slice(0, 300)}`);
  }
  return resp.json();
}

// ──────────────────────────────────────────────
// Safe Telegram reply (handles markdown parse failures)
// ──────────────────────────────────────────────

async function safeReply(ctx: Context, text: string): Promise<void> {
  // Telegram has a 4096 char limit per message
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    chunks.push(remaining.slice(0, 4000));
    remaining = remaining.slice(4000);
  }
  for (const chunk of chunks) {
    try {
      await ctx.reply(chunk, { parse_mode: "Markdown" });
    } catch {
      // Markdown parse failed, send as plain text
      await ctx.reply(chunk);
    }
  }
}

// ──────────────────────────────────────────────
// Main Framework
// ──────────────────────────────────────────────

export async function createDevBot(config: DevBotConfig) {
  const bot = new Bot(config.token);
  const memory = createMemoryStore(config.workspaceRoot);
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;

  if (!apiKey) {
    console.error(`[${config.workspaceName}] ❌ Missing GEMINI_API_KEY or GOOGLE_GENAI_API_KEY`);
  }

  const state: BotState = {
    mode: "ops",
    lastDevActivity: Date.now(),
    autoLockTimer: null,
    conversationHistory: [],
  };

  const autoLockMs = (config.autoLockMinutes || 60) * 60 * 1000;

  // Load soul.md
  const soulPath = path.join(config.workspaceRoot, "bot", "soul.md");
  let soulPrompt = `You are the ${config.workspaceName} Dev Bot. You help John Freeman manage this workspace.`;
  if (fs.existsSync(soulPath)) {
    try {
      soulPrompt = fs.readFileSync(soulPath, "utf-8");
      console.log(`👻 Soul loaded for ${config.workspaceName}`);
    } catch (err) {
      console.error(`[${config.workspaceName}] ❌ Failed to read soul.md:`, err);
    }
  } else {
    console.warn(`[${config.workspaceName}] ⚠️ No soul.md at ${soulPath}`);
  }

  // ── Auth middleware — only owner can interact ──
  bot.use(async (ctx, next) => {
    if (ctx.from?.id !== config.ownerId) return;
    return next();
  });

  // ── Error handler — catch all errors so bot doesn't crash ──
  bot.catch((err) => {
    console.error(`[${config.workspaceName}] Bot error:`, err.message || err);
  });

  // ── Helper: reset auto-lock ──
  function resetAutoLock() {
    if (state.autoLockTimer) clearTimeout(state.autoLockTimer);
    state.autoLockTimer = setTimeout(() => {
      state.mode = "ops";
      console.log(`🔒 Auto-locked ${config.workspaceName} due to inactivity`);
    }, autoLockMs);
  }

  // ════════════════════════════════════════════
  // COMMANDS
  // ════════════════════════════════════════════

  // ── /start ──
  bot.command("start", async (ctx) => {
    await safeReply(ctx,
      `👋 *${config.workspaceName} Dev Bot* is live!\n\n` +
      `📌 Mode: \`${state.mode}\`\n` +
      `📁 Workspace: \`${path.basename(config.workspaceRoot)}\`\n\n` +
      `*Commands:*\n` +
      `/status — Project status\n` +
      `/dev <pass> — Enter dev mode\n` +
      `/ops — Return to ops mode\n` +
      `/run <cmd> — Run a command (dev)\n` +
      `/read <file> — Read a file\n` +
      `/build — Build the project (dev)\n` +
      `/git <args> — Git operations (dev)\n` +
      `/remember <text> — Store a memory\n` +
      `/recall <query> — Search memories\n\n` +
      `Just send a message to chat with me!`
    );
  });

  // ── /dev <passphrase> ──
  bot.command("dev", async (ctx) => {
    const pass = ctx.match?.trim();
    const target = config.devPassphrase || "gravity";
    if (pass === target) {
      state.mode = "dev";
      resetAutoLock();
      await ctx.reply("🔓 Got it! Dev mode enabled. Full terminal and file access unlocked.");
    } else {
      await ctx.reply("❌ Incorrect passphrase.");
    }
  });

  // ── /ops ──
  bot.command("ops", async (ctx) => {
    state.mode = "ops";
    if (state.autoLockTimer) clearTimeout(state.autoLockTimer);
    await ctx.reply("🔒 Roger. Dev mode disabled. Back to ops mode.");
  });

  // ── /mode ──
  bot.command("mode", async (ctx) => {
    const icon = state.mode === "dev" ? "🔓" : "🔒";
    await ctx.reply(`${icon} Current mode: ${state.mode}`);
  });

  // ── /status ──
  bot.command("status", async (ctx) => {
    await ctx.reply("📊 Checking project status...");
    try {
      const branch = safeExec("git branch --show-current", config.workspaceRoot).trim();
      const gitStatus = safeExec("git status --short", config.workspaceRoot).trim();
      const nodeModules = fs.existsSync(path.join(config.workspaceRoot, "node_modules"));

      let status = `📊 ${config.workspaceName} Status\n\n`;
      status += `Branch: ${branch}\n`;
      status += `Node modules: ${nodeModules ? "✅" : "❌"}\n`;
      status += `Mode: ${state.mode}\n`;
      if (gitStatus) {
        status += `\nChanges:\n${gitStatus.slice(0, 1500)}`;
      } else {
        status += `\n✅ Working tree clean`;
      }
      await ctx.reply(status);
    } catch (err: any) {
      await ctx.reply(`❌ Error: ${err.message}`);
    }
  });

  // ── /run <cmd> ──
  bot.command("run", async (ctx) => {
    if (state.mode !== "dev") {
      await ctx.reply("🔒 Enter dev mode first: /dev <passphrase>");
      return;
    }
    const cmd = ctx.match?.trim();
    if (!cmd) {
      await ctx.reply("Usage: /run <command>");
      return;
    }
    resetAutoLock();
    await ctx.reply(`⚡ On it! Running: ${cmd}`);
    try {
      await ctx.replyWithChatAction("typing");
      const output = safeExec(cmd, config.workspaceRoot, 30000);
      const truncated = output.slice(0, 4000);
      await ctx.reply(truncated || "(no output)");
    } catch (err: any) {
      await ctx.reply(`❌ Error: ${(err.message || err).toString().slice(0, 2000)}`);
    }
  });

  // ── /read <file> ──
  bot.command("read", async (ctx) => {
    const filePath = ctx.match?.trim();
    if (!filePath) {
      await ctx.reply("Usage: /read <filepath>");
      return;
    }
    const fullPath = path.resolve(config.workspaceRoot, filePath);
    if (!fullPath.startsWith(path.resolve(config.workspaceRoot))) {
      await ctx.reply("❌ Access denied: Path outside workspace.");
      return;
    }
    await ctx.reply(`📖 Reading ${filePath}...`);
    try {
      const content = fs.readFileSync(fullPath, "utf-8");
      await ctx.reply(`📄 ${filePath}\n\n${content.slice(0, 4000)}`);
    } catch (err: any) {
      await ctx.reply(`❌ ${err.message}`);
    }
  });

  // ── /build ──
  bot.command("build", async (ctx) => {
    if (state.mode !== "dev") {
      await ctx.reply("🔒 Enter dev mode first.");
      return;
    }
    resetAutoLock();
    await ctx.reply("🏗️ Got it! Starting build — this may take a minute...");
    exec("npm run build 2>&1", { cwd: config.workspaceRoot, timeout: 120000 }, async (err, stdout) => {
      if (err) {
        await ctx.reply(`❌ Build failed:\n${(stdout || err.message).slice(-1500)}`);
      } else {
        await ctx.reply("✅ Build completed successfully.");
      }
    });
  });

  // ── /git <args> ──
  bot.command("git", async (ctx) => {
    if (state.mode !== "dev") {
      await ctx.reply("🔒 Enter dev mode first.");
      return;
    }
    const args = ctx.match?.trim();
    if (!args) {
      await ctx.reply("Usage: /git <args>");
      return;
    }
    resetAutoLock();
    await ctx.reply(`🔀 Running git ${args}...`);
    try {
      const output = safeExec(`git ${args}`, config.workspaceRoot);
      await ctx.reply(output.slice(0, 4000) || "(no output)");
    } catch (err: any) {
      await ctx.reply(`❌ Git error: ${err.message}`);
    }
  });

  // ── /remember <text> ──
  bot.command("remember", async (ctx) => {
    const content = ctx.match?.trim();
    if (!content) {
      await ctx.reply("Usage: /remember <what to remember>");
      return;
    }
    let category = "general";
    if (/note:/i.test(content)) category = "note";
    if (/todo:/i.test(content)) category = "todo";
    if (/fix:|bug:/i.test(content)) category = "bug";
    const id = memory.store(content, category);
    await ctx.reply(`🧠 Got it! Memory #${id} [${category}] stored.`);
  });

  // ── /recall <query> ──
  bot.command("recall", async (ctx) => {
    const query = ctx.match?.trim();
    if (!query) {
      await ctx.reply("Usage: /recall <search query>");
      return;
    }
    const results = memory.search(query);
    if (results.length === 0) {
      await ctx.reply("No matching memories found.");
      return;
    }
    const formatted = results.map(r => `#${r.id} [${r.category}] ${r.content}`).join("\n\n");
    await ctx.reply(`🧠 Found ${results.length} memories:\n\n${formatted.slice(0, 4000)}`);
  });

  // ════════════════════════════════════════════
  // FREE-TEXT CHAT → Gemini AI
  // ════════════════════════════════════════════

  bot.on("message:text", async (ctx) => {
    const text = ctx.message.text;
    if (text.startsWith("/")) return;

    // Build context
    const memoryContext = memory.search(text).map(m => `\nMemory #${m.id}: ${m.content}`).join("");
    let branchInfo = "";
    try {
      branchInfo = safeExec("git branch --show-current", config.workspaceRoot).trim();
    } catch { /* ignore */ }

    // Add user message to history (Gemini format: role + parts)
    state.conversationHistory.push({ role: "user", parts: [{ text }] });
    if (state.conversationHistory.length > 20) {
      state.conversationHistory = state.conversationHistory.slice(-20);
    }

    const systemInstruction = soulPrompt +
      `\n\nWorkspace: ${config.workspaceRoot}` +
      `\nFirebase: ${config.firebaseProjectId || "unknown"}` +
      `\nMode: ${state.mode}` +
      (branchInfo ? `\nBranch: ${branchInfo}` : "") +
      memoryContext +
      `\n\nKeep responses concise for Telegram. You have browser tools to search the web or fetch pages.`;

    if (!apiKey) {
      await ctx.reply("⚠️ No API key configured — AI chat unavailable.");
      return;
    }

    try {
      await ctx.replyWithChatAction("typing");

      // Tool-use loop (max 5 turns)
      for (let turn = 0; turn < 5; turn++) {
        const data = await callGemini(apiKey, systemInstruction, state.conversationHistory, GEMINI_TOOLS);
        const candidate = data.candidates?.[0];
        if (!candidate?.content?.parts?.length) {
          await ctx.reply("🤔 Got an empty response. Try rephrasing.");
          return;
        }

        const parts = candidate.content.parts;
        const textPart = parts.find((p: any) => p.text);
        const funcCallPart = parts.find((p: any) => p.functionCall);

        // If there's a text response, send it and we're done
        if (textPart?.text) {
          state.conversationHistory.push({ role: "model", parts: [{ text: textPart.text }] });
          await safeReply(ctx, textPart.text);
          return;
        }

        // If there's a tool call, execute it and continue the loop
        if (funcCallPart?.functionCall) {
          const call = funcCallPart.functionCall;
          console.log(`🔧 [${config.workspaceName}] Tool: ${call.name}(${JSON.stringify(call.args)})`);

          let result = "";
          if (call.name === "web_search") {
            result = await webSearch(call.args.query);
          } else if (call.name === "fetch_page") {
            result = await fetchPage(call.args.url);
          } else {
            result = `Unknown tool: ${call.name}`;
          }

          // Add model's function call to history
          state.conversationHistory.push({
            role: "model",
            parts: [{ functionCall: { name: call.name, args: call.args } }]
          });

          // Add function response to history (role must be "user" with functionResponse part)
          state.conversationHistory.push({
            role: "user",
            parts: [{ functionResponse: { name: call.name, response: { content: result } } }]
          });

          await ctx.replyWithChatAction("typing");
          continue;
        }

        // Neither text nor function call — bail
        await ctx.reply("🤔 Unexpected response format.");
        return;
      }

      await ctx.reply("⚠️ Too many tool calls — please try a simpler question.");
    } catch (err: any) {
      console.error(`❌ [${config.workspaceName}] Chat error:`, err.message);
      await ctx.reply(`⚠️ Error: ${(err.message || "unknown error").slice(0, 500)}`);
      // Reset conversation history on API errors to prevent poison state
      state.conversationHistory = [];
    }
  });

  return bot;
}
