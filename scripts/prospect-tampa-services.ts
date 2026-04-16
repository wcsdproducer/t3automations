#!/usr/bin/env npx tsx
/**
 * T3kniQ Lead Prospecting — Tampa Bay Local Services
 *
 * Scrapes, audits, and scores local service businesses
 * from search engine data, then populates the T3kniQ CRM (Firestore).
 *
 * Features:
 * - Website audit (SSL, mobile-friendliness, tech stack detection)
 * - Social media presence check
 * - AI-powered scorecard generation via Gemini
 * - Automatic CRM population
 *
 * Usage:
 *   npx tsx scripts/prospect-tampa-services.ts
 *   npx tsx scripts/prospect-tampa-services.ts --dry-run
 *   npx tsx scripts/prospect-tampa-services.ts --audit-only  (just audit, no Firestore write)
 */

import "dotenv/config";
import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

// ──────────────────────────────────────────────
// Configuration
// ──────────────────────────────────────────────

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const FIREBASE_PROJECT_ID = "studio-1410114603-9e1f6";
const FIRESTORE_COLLECTION = "t3kniq_leads";
const CAMPAIGN = "tampa-bay-services-2026-04";

// ──────────────────────────────────────────────
// Raw Lead Data (from web search results)
// ──────────────────────────────────────────────

interface RawLead {
  businessName: string;
  phone: string;
  website: string;
  category: string;
  city: string;
}

const RAW_LEADS: RawLead[] = [
  // ── Auto Repair ──
  { businessName: "Bay Brothers Automotive", phone: "(813) 491-7439", website: "https://baybrothersauto.com/", category: "Auto Repair", city: "Tampa" },
  { businessName: "A & D Automotive Center", phone: "(813) 226-0654", website: "http://aanddautocenter.com/", category: "Auto Repair", city: "Tampa" },
  { businessName: "Lightning Auto Repair and Tires", phone: "(813) 488-1548", website: "https://lightningautorepair.com/", category: "Auto Repair", city: "Tampa" },
  { businessName: "AutoWorks of Tampa", phone: "(813) 442-5645", website: "https://autoworksoftampa.com/", category: "Auto Repair", city: "Tampa" },
  { businessName: "Running Great", phone: "(813) 971-0642", website: "https://runninggreatauto.com/", category: "Auto Repair", city: "Tampa" },
  { businessName: "Greg Bailey Automotive", phone: "(813) 229-1265", website: "https://automotiverepairtampa.com/", category: "Auto Repair", city: "Tampa" },

  // ── Dental ──
  { businessName: "Jackson Dental, PA", phone: "(813) 701-3141", website: "https://jacksondentaltampa.com/", category: "Dental", city: "Tampa" },
  { businessName: "Heights Dental Tampa", phone: "", website: "https://heightsdentaltampa.com/", category: "Dental", city: "Tampa" },
  { businessName: "Lakewood Dental Excellence", phone: "", website: "https://lakewooddentalexcellence.com/", category: "Dental", city: "Tampa" },

  // ── Law Firms ──
  { businessName: "The Suarez Law Firm, P.A.", phone: "", website: "https://thesuarezlawfirm.com/", category: "Law Firm", city: "Tampa" },
  { businessName: "Turkel Cuva Barrios P.A.", phone: "", website: "https://www.turkelcuva.com/", category: "Law Firm", city: "Tampa" },
  { businessName: "Johnson Jackson PLLC", phone: "", website: "https://www.johnsonjackson.com/", category: "Law Firm", city: "Tampa" },

  // ── Hair Salons ──
  { businessName: "Salon Halo", phone: "(813) 286-7100", website: "https://salon-halo.com/", category: "Hair Salon", city: "Tampa" },
  { businessName: "Haas Salon", phone: "(813) 892-0813", website: "https://haassalon.com/", category: "Hair Salon", city: "Tampa" },
  { businessName: "Tribeca Salons", phone: "(813) 250-0222", website: "https://tribecasalon.com/", category: "Hair Salon", city: "Tampa" },
  { businessName: "Monaco Hair Salon", phone: "(813) 870-1709", website: "https://monacosalon.com/", category: "Hair Salon", city: "Tampa" },
  { businessName: "Shampoo The Salon", phone: "(813) 251-3838", website: "https://shampoo-thesalon.com/", category: "Hair Salon", city: "Tampa" },

  // ── Pet Grooming ──
  { businessName: "Pawphoria", phone: "(813) 954-9528", website: "https://pawphoriagrooming.com/", category: "Pet Grooming", city: "Tampa" },
  { businessName: "Pet Glam Spa", phone: "(813) 405-4105", website: "https://petglamspa.com/", category: "Pet Grooming", city: "Tampa" },
  { businessName: "Onyva Dog Spa", phone: "", website: "https://onyvadogspa.com/", category: "Pet Grooming", city: "Tampa" },
  { businessName: "Aussie Pet Mobile Tampa Bay", phone: "(727) 741-7612", website: "https://aussiepetmobile.com/", category: "Pet Grooming", city: "Tampa Bay" },
  { businessName: "Rover Done Over Mobile Pet Grooming", phone: "", website: "https://roverdoneover.net/", category: "Pet Grooming", city: "Tampa" },

  // ── Real Estate ──
  { businessName: "The Duncan Duo Team", phone: "", website: "https://duncanduo.com/", category: "Real Estate", city: "Tampa" },
  { businessName: "The Lewkowicz Group", phone: "", website: "https://thelewkowiczgroup.com/", category: "Real Estate", city: "Tampa" },

  // ── Insurance ──
  { businessName: "Seibert Insurance Agency", phone: "(813) 960-4672", website: "https://seibertagency.com/", category: "Insurance", city: "Tampa" },
  { businessName: "Jaffe Tilchin Insurance", phone: "(866) 218-7906", website: "https://jaffetilchin.com/", category: "Insurance", city: "Tampa" },
  { businessName: "Professional Insurance Services", phone: "", website: "https://proinsuranceflorida.com/", category: "Insurance", city: "Tampa" },
  { businessName: "Brier Grieves Insurance", phone: "", website: "https://briergrievesinsurance.com/", category: "Insurance", city: "Tampa" },

  // ── Fitness / Gyms ──
  { businessName: "Gold's Gym Gas Worx", phone: "", website: "https://goldsgymgasworx.com/", category: "Fitness", city: "Tampa" },
  { businessName: "Fit24 Gym", phone: "(813) 579-3324", website: "https://fit24tampa.com/", category: "Fitness", city: "Tampa" },
  { businessName: "Cigar City CrossFit", phone: "(813) 603-3099", website: "", category: "Fitness", city: "Tampa" },
  { businessName: "Coastal Family Fitness", phone: "(813) 935-2639", website: "", category: "Fitness", city: "Tampa" },
  { businessName: "Powerhouse Gym Tampa", phone: "(813) 284-7777", website: "", category: "Fitness", city: "Tampa" },

  // ── Photography ──
  { businessName: "WTR COOLER STUDIO", phone: "", website: "https://wtrcooler.studio/", category: "Photography", city: "Tampa" },
  { businessName: "MMG Studios", phone: "", website: "https://mmgstudiostpa.com/", category: "Photography", city: "Tampa" },
  { businessName: "Green Room Creative Studio", phone: "", website: "https://greenroomtpa.com/", category: "Photography", city: "Tampa" },
  { businessName: "Jessica McKnight Photography", phone: "", website: "https://jessicamcknight.com/", category: "Photography", city: "St Petersburg" },
  { businessName: "Allie Serrano Portraits", phone: "", website: "https://allieserranoportraits.com/", category: "Photography", city: "Tampa" },
  { businessName: "The Gallery Studios", phone: "", website: "https://thegallerystudios.com/", category: "Photography", city: "Tampa" },

  // ── CPA / Accounting ──
  { businessName: "SK Financial CPA LLC", phone: "", website: "https://skfinancial.com/", category: "Accounting", city: "Tampa" },
  { businessName: "Hacker Johnson & Smith P.A.", phone: "", website: "https://hackerjohnson.com/", category: "Accounting", city: "Tampa" },
  { businessName: "Cherry Bekaert", phone: "(813) 251-1010", website: "https://cbh.com/", category: "Accounting", city: "Tampa" },

  // ── Additional local services (diversify pipeline) ──
  { businessName: "Tampa Auto Doctor", phone: "", website: "https://tampaautodoctor.com/", category: "Auto Repair", city: "Tampa" },
  { businessName: "Members Insurance Center", phone: "(888) 238-7511", website: "https://floridamic.org/", category: "Insurance", city: "Tampa" },
  { businessName: "Snap Fitness Westchase", phone: "(813) 814-1984", website: "https://snapfitness.com/", category: "Fitness", city: "Tampa" },
  { businessName: "Vertical Ventures Tampa", phone: "(727) 304-6290", website: "", category: "Fitness", city: "Tampa" },
  { businessName: "Sedation Dentistry Tampa", phone: "", website: "https://sedationdentistrytampa.com/", category: "Dental", city: "Tampa" },
  { businessName: "Rivero Gordimer & Company", phone: "", website: "", category: "Accounting", city: "Tampa" },
  { businessName: "Groomit Tampa", phone: "", website: "https://groomit.me/", category: "Pet Grooming", city: "Tampa" },
  { businessName: "Hall Booth Smith Tampa", phone: "", website: "https://www.hallboothsmith.com/", category: "Law Firm", city: "Tampa" },
];

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface WebsiteAudit {
  isLive: boolean;
  usesHttps: boolean;
  hasSSL: boolean;
  loadTimeMs: number;
  title: string;
  description: string;
  hasSocialLinks: boolean;
  socialProfiles: string[];
  hasChatWidget: boolean;
  hasBookingSystem: boolean;
  hasContactForm: boolean;
  techStack: string[];
  mobileHints: string[];
  rawHtml: string;
}

interface AIScorecard {
  overallScore: number;
  websiteScore: number;
  socialMediaScore: number;
  onlinePresenceScore: number;
  aiOpportunityScore: number;
  weaknesses: string[];
  opportunities: string[];
  recommendedServices: string[];
  outreachAngle: string;
  priority: "high" | "medium" | "low";
}

interface CRMLead {
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  googleMapsUrl: string;
  googleRating: number | null;
  reviewCount: number;
  category: string;
  categories: string[];
  placeId: string;
  source: string;
  sourceQuery: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
  priority: "high" | "medium" | "low";
  tags: string[];
  leadScore: number;
  hasWebsite: boolean;
  hasEmail: boolean;
  websiteNeeded: boolean;
  aiVoiceAgentFit: boolean;
  notes: string;
  createdAt: admin.firestore.FieldValue;
  updatedAt: admin.firestore.FieldValue;
  lastContactedAt: null;
  campaign: string;

  // New scorecard fields
  scorecard?: {
    websiteScore: number;
    socialMediaScore: number;
    onlinePresenceScore: number;
    aiOpportunityScore: number;
    weaknesses: string[];
    opportunities: string[];
    recommendedServices: string[];
    outreachAngle: string;
    auditedAt: string;
  };
}

// ──────────────────────────────────────────────
// Website Auditor
// ──────────────────────────────────────────────

async function auditWebsite(url: string): Promise<WebsiteAudit> {
  const defaultAudit: WebsiteAudit = {
    isLive: false,
    usesHttps: url.startsWith("https"),
    hasSSL: url.startsWith("https"),
    loadTimeMs: 0,
    title: "",
    description: "",
    hasSocialLinks: false,
    socialProfiles: [],
    hasChatWidget: false,
    hasBookingSystem: false,
    hasContactForm: false,
    techStack: [],
    mobileHints: [],
    rawHtml: "",
  };

  if (!url || url.length < 5) return defaultAudit;

  try {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);
    const loadTimeMs = Date.now() - startTime;
    const html = await response.text();
    const htmlLower = html.toLowerCase();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch?.[1]?.trim() || "";

    // Extract meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
    const description = descMatch?.[1]?.trim() || "";

    // Social profiles
    const socialPatterns = [
      /https?:\/\/(www\.)?facebook\.com\/[^\s"'<>]+/gi,
      /https?:\/\/(www\.)?instagram\.com\/[^\s"'<>]+/gi,
      /https?:\/\/(www\.)?twitter\.com\/[^\s"'<>]+/gi,
      /https?:\/\/(www\.)?x\.com\/[^\s"'<>]+/gi,
      /https?:\/\/(www\.)?linkedin\.com\/[^\s"'<>]+/gi,
      /https?:\/\/(www\.)?youtube\.com\/[^\s"'<>]+/gi,
      /https?:\/\/(www\.)?tiktok\.com\/[^\s"'<>]+/gi,
      /https?:\/\/(www\.)?yelp\.com\/[^\s"'<>]+/gi,
    ];
    const socialProfiles: string[] = [];
    for (const pat of socialPatterns) {
      const matches = html.match(pat) || [];
      socialProfiles.push(...matches.map(m => m.replace(/["'>\s]/g, "")));
    }
    const uniqueSocials = [...new Set(socialProfiles)];

    // Chat widgets
    const chatWidgets = ["intercom", "drift", "tawk", "livechat", "zendesk", "hubspot", "crisp", "olark", "tidio"];
    const hasChatWidget = chatWidgets.some(w => htmlLower.includes(w));

    // Booking systems
    const bookingSystems = ["calendly", "acuity", "square appointments", "booksy", "vagaro", "mindbody", "schedulicity", "setmore"];
    const hasBookingSystem = bookingSystems.some(b => htmlLower.includes(b));

    // Contact form
    const hasContactForm = htmlLower.includes("<form") && (htmlLower.includes("contact") || htmlLower.includes("message") || htmlLower.includes("email"));

    // Tech stack detection
    const techStack: string[] = [];
    if (htmlLower.includes("wordpress") || htmlLower.includes("wp-content")) techStack.push("WordPress");
    if (htmlLower.includes("wix.com")) techStack.push("Wix");
    if (htmlLower.includes("squarespace")) techStack.push("Squarespace");
    if (htmlLower.includes("shopify")) techStack.push("Shopify");
    if (htmlLower.includes("react") || htmlLower.includes("__next")) techStack.push("React/Next.js");
    if (htmlLower.includes("webflow")) techStack.push("Webflow");
    if (htmlLower.includes("godaddy")) techStack.push("GoDaddy");
    if (htmlLower.includes("weebly")) techStack.push("Weebly");
    if (htmlLower.includes("google analytics") || htmlLower.includes("gtag") || htmlLower.includes("ga.js")) techStack.push("Google Analytics");
    if (htmlLower.includes("google tag manager") || htmlLower.includes("gtm.js")) techStack.push("GTM");
    if (htmlLower.includes("facebook pixel") || htmlLower.includes("fbevents")) techStack.push("Facebook Pixel");
    if (htmlLower.includes("schema.org")) techStack.push("Schema.org");

    // Mobile hints
    const mobileHints: string[] = [];
    if (htmlLower.includes("viewport")) mobileHints.push("has-viewport");
    else mobileHints.push("no-viewport");
    if (htmlLower.includes("responsive") || htmlLower.includes("@media")) mobileHints.push("responsive-css");

    return {
      isLive: true,
      usesHttps: url.startsWith("https"),
      hasSSL: url.startsWith("https"),
      loadTimeMs,
      title,
      description,
      hasSocialLinks: uniqueSocials.length > 0,
      socialProfiles: uniqueSocials.slice(0, 10),
      hasChatWidget,
      hasBookingSystem,
      hasContactForm,
      techStack,
      mobileHints,
      rawHtml: html.slice(0, 15000), // Keep first 15k chars for AI analysis
    };
  } catch (err: any) {
    console.log(`    ⚠️  Website audit failed for ${url}: ${err.message}`);
    return defaultAudit;
  }
}

// ──────────────────────────────────────────────
// AI Scorecard Generation (Gemini)
// ──────────────────────────────────────────────

async function generateScorecard(lead: RawLead, audit: WebsiteAudit): Promise<AIScorecard> {
  const prompt = `You are an AI marketing consultant for T3kniQ, an AI Automations Agency. Analyze this local business and generate a marketing opportunity scorecard.

BUSINESS:
- Name: ${lead.businessName}
- Category: ${lead.category}
- City: ${lead.city}, Florida
- Phone: ${lead.phone || "Not found"}
- Website: ${lead.website || "NO WEBSITE"}

WEBSITE AUDIT:
- Live: ${audit.isLive}
- HTTPS: ${audit.usesHttps}
- Load Time: ${audit.loadTimeMs}ms
- Title: ${audit.title || "None"}
- Meta Description: ${audit.description || "None"}
- Social Profiles Found: ${audit.socialProfiles.length} (${audit.socialProfiles.slice(0, 5).join(", ") || "None"})
- Chat Widget: ${audit.hasChatWidget}
- Booking System: ${audit.hasBookingSystem}
- Contact Form: ${audit.hasContactForm}
- Tech Stack: ${audit.techStack.join(", ") || "Unknown"}
- Mobile: ${audit.mobileHints.join(", ")}
- Has Google Analytics: ${audit.techStack.includes("Google Analytics")}
- Has Schema.org: ${audit.techStack.includes("Schema.org")}

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "overallScore": <0-100>,
  "websiteScore": <0-100 based on quality, SSL, speed, SEO>,
  "socialMediaScore": <0-100 based on social presence>,
  "onlinePresenceScore": <0-100 based on overall digital footprint>,
  "aiOpportunityScore": <0-100 chance they need AI automation services>,
  "weaknesses": ["<weakness 1>", "<weakness 2>", ...],
  "opportunities": ["<service T3kniQ could sell>", ...],
  "recommendedServices": ["AI Voice Agent", "Website Redesign", "SEO", "Social Media Management", "Chatbot", "Review Management", "Paid Ads", "Email Marketing"],
  "outreachAngle": "<1-2 sentence personalized pitch angle for outreach>",
  "priority": "high" | "medium" | "low"
}

Scoring guide:
- No website = aiOpportunityScore 90+, websiteScore 0
- HTTP only (no HTTPS) = websiteScore -20
- No social media = socialMediaScore 20 or less
- No chat widget or booking = aiOpportunityScore +15
- ${lead.category} businesses benefit from: AI voice agents for appointment booking, automated follow-ups, review management
- Consider the LOCAL market context — Tampa Bay small businesses`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1024,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      console.log(`    ⚠️  Gemini API error: ${response.status}`);
      return getDefaultScorecard(lead, audit);
    }

    const data = await response.json() as any;

    // Handle multi-part responses (thinking models return thought + text parts)
    let text = "";
    const parts = data.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.text) text = part.text; // Use the last text part (non-thought)
    }

    if (!text) {
      console.log(`    ⚠️  Empty Gemini response`);
      return getDefaultScorecard(lead, audit);
    }

    // Strip markdown code fences if present
    let cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

    // Extract JSON object
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log(`    ⚠️  Could not parse Gemini response`);
      return getDefaultScorecard(lead, audit);
    }

    const scorecard = JSON.parse(jsonMatch[0]) as AIScorecard;

    // Validate scores are in range
    scorecard.overallScore = Math.min(100, Math.max(0, scorecard.overallScore || 50));
    scorecard.websiteScore = Math.min(100, Math.max(0, scorecard.websiteScore || 50));
    scorecard.socialMediaScore = Math.min(100, Math.max(0, scorecard.socialMediaScore || 50));
    scorecard.onlinePresenceScore = Math.min(100, Math.max(0, scorecard.onlinePresenceScore || 50));
    scorecard.aiOpportunityScore = Math.min(100, Math.max(0, scorecard.aiOpportunityScore || 50));

    return scorecard;
  } catch (err: any) {
    console.log(`    ⚠️  Scorecard generation error: ${err.message}`);
    return getDefaultScorecard(lead, audit);
  }
}

function getDefaultScorecard(lead: RawLead, audit: WebsiteAudit): AIScorecard {
  const hasWebsite = !!(lead.website && lead.website.length > 5);
  const websiteScore = hasWebsite ? (audit.usesHttps ? 50 : 30) : 0;
  const socialScore = audit.socialProfiles.length > 3 ? 60 : audit.socialProfiles.length > 0 ? 35 : 10;
  const aiOpp = hasWebsite ? (audit.hasChatWidget ? 40 : 65) : 90;

  return {
    overallScore: Math.round((websiteScore + socialScore + aiOpp) / 3),
    websiteScore,
    socialMediaScore: socialScore,
    onlinePresenceScore: Math.round((websiteScore + socialScore) / 2),
    aiOpportunityScore: aiOpp,
    weaknesses: hasWebsite ? ["Could improve digital presence"] : ["No website detected"],
    opportunities: ["AI Voice Agent", "Digital Marketing"],
    recommendedServices: hasWebsite ? ["AI Voice Agent", "SEO"] : ["Website Design", "AI Voice Agent"],
    outreachAngle: `${lead.businessName} could benefit from AI-powered customer engagement solutions for their ${lead.category.toLowerCase()} business.`,
    priority: aiOpp >= 70 ? "high" : aiOpp >= 50 ? "medium" : "low",
  };
}

// ──────────────────────────────────────────────
// Build CRM Lead
// ──────────────────────────────────────────────

function buildCRMLead(raw: RawLead, audit: WebsiteAudit, scorecard: AIScorecard): CRMLead {
  const hasWebsite = !!(raw.website && raw.website.length > 5);
  const tags: string[] = [];

  // Category tag
  tags.push(raw.category.toLowerCase().replace(/\s+/g, "-"));

  // Website tags
  if (!hasWebsite) tags.push("needs-website");
  else if (!audit.usesHttps) tags.push("weak-website");
  if (audit.hasChatWidget) tags.push("has-chat");
  if (audit.hasBookingSystem) tags.push("has-booking");
  if (!audit.hasSocialLinks) tags.push("no-social-media");

  // Contact tags
  if (raw.phone) tags.push("phone-available");

  // Opportunity tags
  if (scorecard.aiOpportunityScore >= 70) tags.push("high-ai-opportunity");
  if (scorecard.recommendedServices.includes("AI Voice Agent")) tags.push("ai-voice-fit");
  if (scorecard.recommendedServices.includes("Website Redesign") || scorecard.recommendedServices.includes("Website Design")) tags.push("website-service-fit");
  if (scorecard.recommendedServices.includes("SEO")) tags.push("seo-fit");

  // Build notes from scorecard
  const noteLines: string[] = [];
  if (scorecard.weaknesses.length > 0) {
    noteLines.push(`⚠️ Weaknesses: ${scorecard.weaknesses.join("; ")}`);
  }
  if (scorecard.opportunities.length > 0) {
    noteLines.push(`💡 Opportunities: ${scorecard.opportunities.join("; ")}`);
  }
  if (scorecard.outreachAngle) {
    noteLines.push(`🎯 Outreach: ${scorecard.outreachAngle}`);
  }

  // Build Google Maps URL
  const mapsQuery = encodeURIComponent(`${raw.businessName} ${raw.city} FL`);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  return {
    businessName: raw.businessName,
    contactName: "",
    phone: raw.phone || "",
    email: "",
    website: raw.website || "",
    address: "",
    city: raw.city || "Tampa",
    state: "Florida",
    zip: "",

    googleMapsUrl,
    googleRating: null,
    reviewCount: 0,
    category: raw.category,
    categories: [raw.category],
    placeId: "",

    source: "web-search-audit",
    sourceQuery: `${raw.category} Tampa Bay FL`,
    status: "new",
    priority: scorecard.priority,
    tags,

    leadScore: scorecard.overallScore,
    hasWebsite,
    hasEmail: false,
    websiteNeeded: !hasWebsite,
    aiVoiceAgentFit: scorecard.recommendedServices.includes("AI Voice Agent"),

    notes: noteLines.join("\n"),

    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastContactedAt: null,
    campaign: CAMPAIGN,

    scorecard: {
      websiteScore: scorecard.websiteScore,
      socialMediaScore: scorecard.socialMediaScore,
      onlinePresenceScore: scorecard.onlinePresenceScore,
      aiOpportunityScore: scorecard.aiOpportunityScore,
      weaknesses: scorecard.weaknesses,
      opportunities: scorecard.opportunities,
      recommendedServices: scorecard.recommendedServices,
      outreachAngle: scorecard.outreachAngle,
      auditedAt: new Date().toISOString(),
    },
  };
}

// ──────────────────────────────────────────────
// Firestore Writer (batched)
// ──────────────────────────────────────────────

async function writeLeadsToFirestore(leads: CRMLead[], dryRun: boolean): Promise<void> {
  if (dryRun) {
    console.log("\n🏃 DRY RUN — not writing to Firestore\n");
    return;
  }

  if (!admin.apps.length) {
    admin.initializeApp({ projectId: FIREBASE_PROJECT_ID });
  }

  const db = admin.firestore();
  const BATCH_LIMIT = 500;
  let written = 0;

  console.log(`\n🔥 Writing ${leads.length} leads to Firestore (${FIRESTORE_COLLECTION})...\n`);

  for (let i = 0; i < leads.length; i += BATCH_LIMIT) {
    const batch = db.batch();
    const chunk = leads.slice(i, i + BATCH_LIMIT);

    for (const lead of chunk) {
      // Create a stable doc ID from business name
      const docId = lead.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 64);

      const ref = db.collection(FIRESTORE_COLLECTION).doc(docId);
      batch.set(ref, lead, { merge: true });
    }

    await batch.commit();
    written += chunk.length;
    console.log(`  ✅ Committed batch: ${written}/${leads.length}`);
  }

  console.log(`\n🎉 Successfully wrote ${leads.length} leads to Firestore!\n`);
}

// ──────────────────────────────────────────────
// Summary Report
// ──────────────────────────────────────────────

function printSummary(leads: CRMLead[]) {
  const high = leads.filter(l => l.priority === "high");
  const medium = leads.filter(l => l.priority === "medium");
  const low = leads.filter(l => l.priority === "low");
  const needsWebsite = leads.filter(l => l.websiteNeeded);
  const hasPhone = leads.filter(l => l.phone.length > 0);
  const aiVoiceFit = leads.filter(l => l.aiVoiceAgentFit);

  // Category breakdown
  const categories = new Map<string, number>();
  for (const l of leads) {
    categories.set(l.category, (categories.get(l.category) || 0) + 1);
  }

  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║  📊 T3kniQ Lead Prospecting Report           ║");
  console.log("║  📍 Tampa Bay Local Services                  ║");
  console.log("╚══════════════════════════════════════════════╝");
  console.log(`  Total leads:         ${leads.length}`);
  console.log(`  🔴 High priority:    ${high.length}`);
  console.log(`  🟡 Medium priority:  ${medium.length}`);
  console.log(`  🟢 Low priority:     ${low.length}`);
  console.log(`  🌐 Need websites:    ${needsWebsite.length}`);
  console.log(`  📞 Have phone:       ${hasPhone.length}`);
  console.log(`  🤖 AI voice fit:     ${aiVoiceFit.length}`);
  console.log("");
  console.log("  📂 Category Breakdown:");
  for (const [cat, count] of [...categories.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`     ${cat}: ${count}`);
  }
  console.log("═══════════════════════════════════════════════");

  // Top leads
  if (high.length > 0) {
    console.log("\n🔴 TOP HIGH-PRIORITY LEADS:\n");
    high.slice(0, 15).forEach((l, i) => {
      console.log(`  ${i + 1}. ${l.businessName} [${l.category}] (Score: ${l.leadScore})`);
      console.log(`     📞 ${l.phone || "N/A"} | 🌐 ${l.website || "NO WEBSITE"}`);
      if (l.scorecard) {
        console.log(`     🎯 AI Opportunity: ${l.scorecard.aiOpportunityScore}/100 | Web: ${l.scorecard.websiteScore}/100 | Social: ${l.scorecard.socialMediaScore}/100`);
        console.log(`     📋 Services: ${l.scorecard.recommendedServices.join(", ")}`);
        console.log(`     💬 "${l.scorecard.outreachAngle}"`);
      }
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
  const auditOnly = args.includes("--audit-only");

  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║  🔍 T3kniQ Lead Prospecting Pipeline             ║");
  console.log("║  📍 Tampa Bay Local Services                      ║");
  console.log("║  🎯 AI Audit + Scorecard + CRM                   ║");
  console.log("╚══════════════════════════════════════════════════╝");
  console.log("");

  if (dryRun) console.log("🏃 DRY RUN mode — no writes to Firestore\n");
  if (auditOnly) console.log("🔍 AUDIT ONLY mode — audit + scorecard, skip Firestore\n");

  console.log(`📋 Processing ${RAW_LEADS.length} leads across ${new Set(RAW_LEADS.map(l => l.category)).size} categories\n`);

  const allLeads: CRMLead[] = [];

  for (let i = 0; i < RAW_LEADS.length; i++) {
    const raw = RAW_LEADS[i];
    const progress = `[${i + 1}/${RAW_LEADS.length}]`;

    console.log(`${progress} 🔍 ${raw.businessName} (${raw.category})`);

    // Step 1: Website audit
    console.log(`  📡 Auditing website: ${raw.website || "NONE"}`);
    const audit = await auditWebsite(raw.website);

    if (audit.isLive) {
      console.log(`  ✅ Live | ${audit.loadTimeMs}ms | SSL: ${audit.hasSSL} | Social: ${audit.socialProfiles.length} | Tech: ${audit.techStack.join(", ") || "?"}`);
    } else if (raw.website) {
      console.log(`  ❌ Website not reachable`);
    } else {
      console.log(`  ⚠️  No website — high opportunity target`);
    }

    // Step 2: AI Scorecard
    console.log(`  🤖 Generating AI scorecard...`);
    const scorecard = await generateScorecard(raw, audit);
    console.log(`  📊 Score: ${scorecard.overallScore}/100 | Priority: ${scorecard.priority} | AI Opp: ${scorecard.aiOpportunityScore}/100`);

    // Step 3: Build CRM lead
    const lead = buildCRMLead(raw, audit, scorecard);
    allLeads.push(lead);

    // Rate limit: 300ms between Gemini calls
    await new Promise(r => setTimeout(r, 300));
    console.log("");
  }

  // Sort by score
  allLeads.sort((a, b) => b.leadScore - a.leadScore);

  // Save to cache
  const cacheDir = path.join(process.cwd(), "scripts", ".cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

  // Save JSON
  const jsonOutput = allLeads.map(l => ({
    ...l,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
  fs.writeFileSync(path.join(cacheDir, "tampa-services-leads.json"), JSON.stringify(jsonOutput, null, 2));
  console.log("💾 Saved JSON to scripts/.cache/tampa-services-leads.json");

  // Save CSV
  const csvHeader = "Business Name,Category,Phone,Website,Score,Priority,AI Opportunity,Website Score,Social Score,Recommended Services,Outreach Angle\n";
  const csvRows = allLeads.map(l =>
    `"${l.businessName}","${l.category}","${l.phone}","${l.website}",${l.leadScore},"${l.priority}",${l.scorecard?.aiOpportunityScore || ""},${l.scorecard?.websiteScore || ""},${l.scorecard?.socialMediaScore || ""},"${l.scorecard?.recommendedServices.join("; ") || ""}","${l.scorecard?.outreachAngle?.replace(/"/g, '""') || ""}"`
  ).join("\n");
  fs.writeFileSync(path.join(cacheDir, "tampa-services-leads.csv"), csvHeader + csvRows);
  console.log("💾 Saved CSV to scripts/.cache/tampa-services-leads.csv\n");

  // Print report
  printSummary(allLeads);

  // Write to Firestore
  if (!auditOnly) {
    await writeLeadsToFirestore(allLeads, dryRun);
  }
}

main().catch(err => {
  console.error("❌ Fatal error:", err.message || err);
  process.exit(1);
});
