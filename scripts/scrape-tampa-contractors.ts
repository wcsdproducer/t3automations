#!/usr/bin/env npx tsx
/**
 * T3kniQ Lead Scraping Campaign — Tampa Bay Contractors
 *
 * Uses Apify's Google Maps Email Extractor to find local contractors
 * in the Tampa Bay area, then populates the T3kniQ CRM (Firestore)
 * with qualified leads for websites and AI voice agent services.
 *
 * Usage:
 *   npx tsx scripts/scrape-tampa-contractors.ts
 *   npx tsx scripts/scrape-tampa-contractors.ts --dry-run   (preview without writing to Firestore)
 *   npx tsx scripts/scrape-tampa-contractors.ts --skip-scrape (use cached Apify results)
 */

import "dotenv/config";
import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

// ──────────────────────────────────────────────
// Configuration
// ──────────────────────────────────────────────

const APIFY_TOKEN = process.env.APIFY_TOKEN!;
const FIREBASE_PROJECT_ID = "studio-1410114603-9e1f6";
const FIRESTORE_COLLECTION = "t3kniq_leads";

// Apify actor for Google Maps with contact details
const APIFY_ACTOR = "lukaskrivka/google-maps-with-contact-details";

// Search queries — targeting contractors who need websites & AI voice agents
const SEARCH_QUERIES = [
  // General contractors
  "general contractor Tampa FL",
  "general contractor St Petersburg FL",
  "general contractor Clearwater FL",
  "general contractor Brandon FL",

  // Specialty trades (high-value targets for AI voice agents)
  "roofing contractor Tampa Bay FL",
  "plumbing contractor Tampa FL",
  "HVAC contractor Tampa Bay FL",
  "electrician contractor Tampa FL",
  "painting contractor Tampa Bay FL",
  "landscaping company Tampa FL",
  "pool contractor Tampa FL",

  // Remodeling
  "home remodeling Tampa FL",
  "kitchen remodeling Tampa Bay FL",
  "bathroom remodeling Tampa FL",

  // Construction
  "construction company Tampa FL",
  "commercial contractor Tampa Bay FL",
  "concrete contractor Tampa FL",

  // Additional high-value services
  "fence contractor Tampa FL",
  "flooring contractor Tampa FL",
  "pressure washing Tampa FL",
  "pest control Tampa Bay FL",
  "tree service Tampa FL",
];

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface ApifyResult {
  title?: string;
  address?: string;
  phone?: string;
  website?: string;
  url?: string;
  totalScore?: number;
  reviewsCount?: number;
  categoryName?: string;
  categories?: string[];
  emails?: string[];
  socialLinks?: string[];
  openingHours?: any;
  city?: string;
  state?: string;
  postalCode?: string;
  placeId?: string;
  // Contact details from website scrape
  contactEmails?: string[];
  contactPhones?: string[];
}

interface CRMLead {
  // Business Info
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zip: string;

  // Google Maps data
  googleMapsUrl: string;
  googleRating: number | null;
  reviewCount: number;
  category: string;
  categories: string[];
  placeId: string;

  // Lead metadata
  source: string;
  sourceQuery: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
  priority: "high" | "medium" | "low";
  tags: string[];

  // Scoring
  leadScore: number;
  hasWebsite: boolean;
  hasEmail: boolean;
  websiteNeeded: boolean;
  aiVoiceAgentFit: boolean;

  // Notes
  notes: string;

  // Timestamps
  createdAt: admin.firestore.FieldValue;
  updatedAt: admin.firestore.FieldValue;
  lastContactedAt: null;
  campaign: string;
}

// ──────────────────────────────────────────────
// Lead Scoring
// ──────────────────────────────────────────────

function scoreLead(result: ApifyResult): { score: number; priority: "high" | "medium" | "low"; tags: string[]; websiteNeeded: boolean; aiVoiceAgentFit: boolean; notes: string } {
  let score = 50; // Base score
  const tags: string[] = [];
  const noteLines: string[] = [];

  // Website analysis
  const hasWebsite = !!(result.website && result.website.length > 5);
  let websiteNeeded = false;

  if (!hasWebsite) {
    score += 25; // No website = HIGH opportunity
    tags.push("needs-website");
    websiteNeeded = true;
    noteLines.push("🎯 No website — strong candidate for web design services");
  } else {
    // Check for weak websites (no https, basic domains)
    const site = result.website || "";
    if (!site.startsWith("https://")) {
      score += 10;
      tags.push("weak-website");
      noteLines.push("⚠️ Website not using HTTPS — possible outdated site");
    }
    if (site.includes("facebook.com") || site.includes("yelp.com") || site.includes("google.com")) {
      score += 15;
      tags.push("needs-website");
      websiteNeeded = true;
      noteLines.push("🎯 Using social page as website — strong candidate for web design");
    }
  }

  // Review count analysis (high reviews = established business with budget)
  if (result.reviewsCount && result.reviewsCount > 50) {
    score += 15;
    tags.push("established");
    noteLines.push(`📊 ${result.reviewsCount} reviews — established business, likely has budget`);
  } else if (result.reviewsCount && result.reviewsCount > 20) {
    score += 10;
    tags.push("growing");
  }

  // Rating analysis
  if (result.totalScore && result.totalScore >= 4.5) {
    score += 5;
    tags.push("high-rated");
  }

  // AI Voice Agent fit — contractors get a LOT of phone calls
  const aiVoiceAgentFit = true; // All contractors benefit from AI phone handling
  tags.push("ai-voice-fit");
  noteLines.push("🤖 Contractors receive high call volume — AI voice agent upsell opportunity");

  // Phone number available = directly reachable
  if (result.phone) {
    score += 5;
    tags.push("phone-available");
  }

  // Email available = can do email outreach
  const emails = [...(result.emails || []), ...(result.contactEmails || [])];
  if (emails.length > 0) {
    score += 5;
    tags.push("email-available");
  }

  // Category bonuses (high-value trades)
  const highValueCategories = ["roofing", "hvac", "plumbing", "electrician", "remodeling", "construction", "pool"];
  const catLower = (result.categoryName || "").toLowerCase();
  if (highValueCategories.some(c => catLower.includes(c))) {
    score += 10;
    tags.push("high-value-trade");
    noteLines.push("💰 High-value trade — larger contract potential");
  }

  // Priority assignment
  let priority: "high" | "medium" | "low" = "medium";
  if (score >= 80) priority = "high";
  else if (score < 60) priority = "low";

  return {
    score: Math.min(score, 100),
    priority,
    tags,
    websiteNeeded,
    aiVoiceAgentFit,
    notes: noteLines.join("\n"),
  };
}

// ──────────────────────────────────────────────
// Apify Runner
// ──────────────────────────────────────────────

async function runApifyScrape(queries: string[]): Promise<ApifyResult[]> {
  console.log(`\n🕷️  Starting Apify scrape with ${queries.length} search queries...\n`);

  const input = {
    searchStringsArray: queries,
    maxCrawledPlacesPerSearch: 30,
    language: "en",
    includeWebResults: false,
    exportPlaceUrls: false,
    includeHistogram: false,
    includeOpeningHours: false,
    includePeopleAlsoSearch: false,
    additionalInfo: false,
    scrapeDirectories: false,
    // Website contact scraping
    maxImages: 0,
    maxReviews: 0,
    scrapeContacts: true,  // scrape emails from websites
    onlyDataFromSearchPage: false,
  };

  console.log("📋 Apify input config:", JSON.stringify(input, null, 2));

  // Start the actor run
  const startResp = await fetch(
    `https://api.apify.com/v2/acts/${encodeURIComponent(APIFY_ACTOR)}/runs?token=${APIFY_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );

  if (!startResp.ok) {
    const errText = await startResp.text();
    throw new Error(`Failed to start Apify run: ${startResp.status} ${errText}`);
  }

  const runData = (await startResp.json()) as any;
  const runId = runData.data.id;
  const datasetId = runData.data.defaultDatasetId;

  console.log(`✅ Apify run started: ${runId}`);
  console.log(`📦 Dataset: ${datasetId}`);
  console.log(`🔗 Monitor: https://console.apify.com/actors/runs/${runId}`);

  // Poll for completion
  let status = "RUNNING";
  let pollCount = 0;
  while (status === "RUNNING" || status === "READY") {
    pollCount++;
    await new Promise(r => setTimeout(r, 15000)); // 15s poll interval

    const statusResp = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`
    );
    const statusData = (await statusResp.json()) as any;
    status = statusData.data.status;

    const stats = statusData.data.stats || {};
    console.log(`  ⏳ [${pollCount}] Status: ${status} | CPU: ${stats.cpuAvgUsage?.toFixed(1) || "?"}% | Items: ${stats.outputItems || "?"}`);
  }

  if (status !== "SUCCEEDED") {
    throw new Error(`Apify run failed with status: ${status}`);
  }

  // Fetch results
  console.log(`\n📥 Fetching results from dataset ${datasetId}...`);
  const resultsResp = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}&format=json`
  );
  const results: ApifyResult[] = (await resultsResp.json()) as ApifyResult[];

  console.log(`✅ Scraped ${results.length} businesses\n`);

  // Cache results locally
  const cacheDir = path.join(process.cwd(), "scripts", ".cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(
    path.join(cacheDir, "tampa-contractors-raw.json"),
    JSON.stringify(results, null, 2)
  );
  console.log(`💾 Cached raw results to scripts/.cache/tampa-contractors-raw.json`);

  return results;
}

// ──────────────────────────────────────────────
// Transform & Deduplicate
// ──────────────────────────────────────────────

function transformResults(results: ApifyResult[], queryMap: Map<string, string>): CRMLead[] {
  const seen = new Set<string>();
  const leads: CRMLead[] = [];

  for (const r of results) {
    // Deduplicate by placeId or phone
    const dedupeKey = r.placeId || r.phone || r.title;
    if (!dedupeKey || seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    // Skip results outside Tampa Bay area
    const addr = (r.address || "").toLowerCase();
    const cityName = (r.city || "").toLowerCase();
    const tampaBayAreas = ["tampa", "st petersburg", "saint petersburg", "clearwater", "brandon", "lakeland", "largo", "palm harbor", "riverview", "wesley chapel", "lutz", "tarpon springs", "new port richey", "land o' lakes", "temple terrace", "plant city", "dunedin", "seminole", "pinellas", "hillsborough", "pasco"];
    const inTampaBay = tampaBayAreas.some(area => addr.includes(area) || cityName.includes(area));
    if (!inTampaBay && addr.length > 0) continue;

    // Extract best email
    const allEmails = [...(r.emails || []), ...(r.contactEmails || [])];
    const bestEmail = allEmails[0] || "";

    // Score the lead
    const scoring = scoreLead(r);

    const lead: CRMLead = {
      businessName: r.title || "Unknown",
      contactName: "", // Will be enriched later
      phone: r.phone || "",
      email: bestEmail,
      website: r.website || "",
      address: r.address || "",
      city: r.city || "",
      state: r.state || "FL",
      zip: r.postalCode || "",

      googleMapsUrl: r.url || "",
      googleRating: r.totalScore || null,
      reviewCount: r.reviewsCount || 0,
      category: r.categoryName || "Contractor",
      categories: r.categories || [],
      placeId: r.placeId || "",

      source: "apify-google-maps",
      sourceQuery: "", // Will be set from queryMap if applicable
      status: "new",
      priority: scoring.priority,
      tags: scoring.tags,

      leadScore: scoring.score,
      hasWebsite: !!(r.website && r.website.length > 5),
      hasEmail: allEmails.length > 0,
      websiteNeeded: scoring.websiteNeeded,
      aiVoiceAgentFit: scoring.aiVoiceAgentFit,

      notes: scoring.notes,

      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastContactedAt: null,
      campaign: "tampa-bay-contractors-2026-04",
    };

    leads.push(lead);
  }

  // Sort by score descending
  leads.sort((a, b) => b.leadScore - a.leadScore);

  return leads;
}

// ──────────────────────────────────────────────
// Firestore Writer
// ──────────────────────────────────────────────

async function writeLeadsToFirestore(leads: CRMLead[], dryRun: boolean): Promise<void> {
  if (dryRun) {
    console.log("\n🏃 DRY RUN — not writing to Firestore\n");
    printSummary(leads);
    return;
  }

  // Initialize Firebase Admin
  if (!admin.apps.length) {
    admin.initializeApp({ projectId: FIREBASE_PROJECT_ID });
  }

  const db = admin.firestore();
  const batch = db.batch();
  let batchCount = 0;
  const BATCH_LIMIT = 500;

  console.log(`\n🔥 Writing ${leads.length} leads to Firestore (${FIRESTORE_COLLECTION})...\n`);

  for (const lead of leads) {
    // Use placeId as doc ID for idempotency
    const docId = lead.placeId || `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const ref = db.collection(FIRESTORE_COLLECTION).doc(docId);
    batch.set(ref, lead, { merge: true });
    batchCount++;

    if (batchCount >= BATCH_LIMIT) {
      await batch.commit();
      console.log(`  ✅ Committed batch of ${batchCount} leads`);
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
    console.log(`  ✅ Committed final batch of ${batchCount} leads`);
  }

  console.log(`\n🎉 Successfully wrote ${leads.length} leads to Firestore!\n`);
  printSummary(leads);
}

// ──────────────────────────────────────────────
// Summary
// ──────────────────────────────────────────────

function printSummary(leads: CRMLead[]) {
  const high = leads.filter(l => l.priority === "high");
  const medium = leads.filter(l => l.priority === "medium");
  const low = leads.filter(l => l.priority === "low");
  const needsWebsite = leads.filter(l => l.websiteNeeded);
  const hasEmail = leads.filter(l => l.hasEmail);
  const hasPhone = leads.filter(l => l.phone.length > 0);

  console.log("═══════════════════════════════════════════");
  console.log("  📊 T3kniQ Lead Campaign Summary");
  console.log("═══════════════════════════════════════════");
  console.log(`  Total leads:         ${leads.length}`);
  console.log(`  🔴 High priority:    ${high.length}`);
  console.log(`  🟡 Medium priority:  ${medium.length}`);
  console.log(`  🟢 Low priority:     ${low.length}`);
  console.log(`  🌐 Need websites:    ${needsWebsite.length}`);
  console.log(`  📧 Have email:       ${hasEmail.length}`);
  console.log(`  📞 Have phone:       ${hasPhone.length}`);
  console.log(`  🤖 AI voice fit:     ${leads.filter(l => l.aiVoiceAgentFit).length}`);
  console.log("═══════════════════════════════════════════");

  if (high.length > 0) {
    console.log("\n🔴 TOP 10 HIGH-PRIORITY LEADS:\n");
    high.slice(0, 10).forEach((l, i) => {
      console.log(`  ${i + 1}. ${l.businessName} (Score: ${l.leadScore})`);
      console.log(`     📞 ${l.phone || "N/A"} | 📧 ${l.email || "N/A"}`);
      console.log(`     🌐 ${l.website || "NO WEBSITE"}`);
      console.log(`     ⭐ ${l.googleRating || "?"}/5 (${l.reviewCount} reviews)`);
      console.log(`     🏷️  ${l.tags.join(", ")}`);
      console.log("");
    });
  }
}

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const skipScrape = args.includes("--skip-scrape");

  console.log("╔══════════════════════════════════════════════╗");
  console.log("║  🕷️  T3kniQ Lead Scraping Campaign           ║");
  console.log("║  📍 Tampa Bay Contractors                    ║");
  console.log("║  🎯 Websites & AI Voice Agents               ║");
  console.log("╚══════════════════════════════════════════════╝");
  console.log("");

  if (dryRun) console.log("🏃 DRY RUN mode — no writes to Firestore\n");
  if (skipScrape) console.log("⏩ Skipping scrape — using cached results\n");

  let rawResults: ApifyResult[];

  if (skipScrape) {
    const cachePath = path.join(process.cwd(), "scripts", ".cache", "tampa-contractors-raw.json");
    if (!fs.existsSync(cachePath)) {
      console.error("❌ No cached results found. Run without --skip-scrape first.");
      process.exit(1);
    }
    rawResults = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
    console.log(`📂 Loaded ${rawResults.length} cached results\n`);
  } else {
    rawResults = await runApifyScrape(SEARCH_QUERIES);
  }

  // Transform and deduplicate
  const queryMap = new Map<string, string>();
  const leads = transformResults(rawResults, queryMap);

  console.log(`\n📊 After deduplication & filtering: ${leads.length} unique Tampa Bay leads\n`);

  // Save processed leads as CSV for backup
  const cacheDir = path.join(process.cwd(), "scripts", ".cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

  const csvHeader = "Business Name,Phone,Email,Website,Rating,Reviews,Category,Score,Priority,Tags,Address\n";
  const csvRows = leads.map(l =>
    `"${l.businessName}","${l.phone}","${l.email}","${l.website}",${l.googleRating || ""},${l.reviewCount},"${l.category}",${l.leadScore},"${l.priority}","${l.tags.join(";")}","${l.address}"`
  ).join("\n");
  fs.writeFileSync(path.join(cacheDir, "tampa-contractors-leads.csv"), csvHeader + csvRows);
  console.log("💾 Saved CSV backup to scripts/.cache/tampa-contractors-leads.csv\n");

  // Write to Firestore
  await writeLeadsToFirestore(leads, dryRun);
}

main().catch(err => {
  console.error("❌ Fatal error:", err.message || err);
  process.exit(1);
});
