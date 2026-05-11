# T3 Automations — B.L.A.S.T. Blueprint
**Phase:** 1 — Blueprint  
**Status:** 🟡 Awaiting remaining Discovery answers  
**Last Updated:** 2026-05-11

---

## 🌟 North Star

> **T3 Automations is a multi-tenant SaaS platform that gives small businesses a complete inbound lead-capture and follow-up stack in one product:**
> 1. A customizable landing page with CTA (lead capture form)
> 2. A CRM to track and manage captured leads
> 3. An AI Voice Agent to handle inbound calls 24/7

---

## 🔍 Discovery Answers (Partial — from codebase audit + blueprint.md)

| Question | Answer |
|----------|--------|
| **North Star** | Give SMBs a turnkey virtual receptionist + lead-capture machine |
| **Integrations** | Firebase Auth, Firestore, Firebase Storage, Firebase App Hosting · Twilio/VAPI (AI voice — TBD) · Stripe (billing — TBD) · Telegram (dev bot) · Gmail OAuth2 |
| **Source of Truth** | Firestore `businessProfiles/{userId}` — all tenant data lives here |
| **Delivery Payload** | Dashboard UI (Next.js App Router) · Custom domain landing pages · Real-time CRM · Call analytics |
| **Behavioral Rules** | Professional/trust tone · Dark teal + soft orange palette · SMB-focused — must be simple enough for non-technical owners |

### ❓ Still Needed from User
- Which **AI Voice** provider? (VAPI, Twilio, Retell AI, ElevenLabs, other?)
- Which **phone number** provisioning API? (Twilio, Vonage, Telnyx?)
- Is **Stripe** integration already started or needs full setup?
- Should the CRM be a **standalone section** or embedded inside the Agent view?

---

## 🏗️ Tech Stack (Confirmed from Codebase)

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Auth** | Firebase Authentication |
| **Database** | Firestore (NoSQL, real-time) |
| **File Storage** | Firebase Storage |
| **Hosting** | Firebase App Hosting |
| **AI** | Google Gemini (via Genkit) |
| **Bot** | Telegram (Grammy) |
| **Email** | Gmail OAuth2 |
| **State Mgmt** | React hooks + Firestore real-time listeners |

---

## 🗃️ Source of Truth — Firestore Data Model

```
businessProfiles/{userId}                    ← TENANT ROOT
  ├── businessName: string
  ├── contactEmail: string
  ├── phoneNumber: string
  ├── websiteUrl: string
  ├── logoUrl: string
  ├── service: string                         ← Maps to landing page template
  ├── defaultLandingPage: string             ← 'template-1' | 'template-2' | 'template-3' | 'template-4'
  ├── heroEffect: string                     ← 'slideshow' | 'parallax'
  │
  ├── customDomains/{domain}                 ← Custom domain records
  │     ├── id: domain string
  │     ├── businessProfileId: userId
  │     ├── domain: string
  │     └── status: 'pending' | 'active'
  │
  ├── leads/{leadId}                         ← CRM leads (TO BUILD)
  │     ├── name: string
  │     ├── phone: string
  │     ├── email: string
  │     ├── source: 'landing-page' | 'inbound-call' | 'manual'
  │     ├── status: 'new' | 'contacted' | 'qualified' | 'closed'
  │     ├── notes: string
  │     ├── createdAt: Timestamp
  │     └── updatedAt: Timestamp
  │
  └── agents/{agentId}                       ← AI Voice Agents (PARTIAL)
        ├── name: string
        ├── voiceProvider: string            ← 'vapi' | 'twilio' | 'retell'
        ├── phoneNumber: string
        ├── systemPrompt: string
        ├── status: 'active' | 'inactive'
        ├── createdAt: Timestamp
        │
        ├── conversations/{callId}           ← Call logs (TO BUILD)
        │     ├── callSid: string
        │     ├── callerNumber: string
        │     ├── duration: number           ← seconds
        │     ├── transcript: string
        │     ├── summary: string
        │     ├── leadId: string             ← FK to leads (if captured)
        │     ├── outcome: 'answered' | 'voicemail' | 'missed'
        │     └── startedAt: Timestamp
        │
        └── knowledge-base/{docId}          ← Agent training data
              ├── title: string
              ├── content: string
              └── type: 'faq' | 'product' | 'policy'
```

---

## 📦 Delivery Payload — JSON Schemas

### Lead (Input — from landing page CTA form)
```json
{
  "name": "string",
  "phone": "string",
  "email": "string",
  "source": "landing-page",
  "businessProfileId": "string",
  "createdAt": "Timestamp"
}
```

### Lead (Output — CRM row)
```json
{
  "id": "string",
  "name": "string",
  "phone": "string",
  "email": "string",
  "source": "landing-page | inbound-call | manual",
  "status": "new | contacted | qualified | closed",
  "notes": "string",
  "agentSummary": "string",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

### Call Log (Output — from AI Voice Agent)
```json
{
  "callSid": "string",
  "agentId": "string",
  "callerNumber": "string",
  "duration": 120,
  "transcript": "string",
  "summary": "string",
  "outcome": "answered | voicemail | missed",
  "leadCaptured": true,
  "leadId": "string | null",
  "startedAt": "Timestamp"
}
```

---

## 🗺️ Route Map

| Route | Status | Description |
|-------|--------|-------------|
| `/` | ✅ Built | Marketing homepage |
| `/login`, `/signup` | ✅ Built | Firebase Auth |
| `/dashboard/[userId]` | ✅ Built | Agent list page |
| `/dashboard/[userId]/agents/[agentId]` | ✅ Built | Agent analytics (mock data) |
| `/dashboard/[userId]/agents/[agentId]/conversations` | ⚠️ Shell | Exists, needs real data |
| `/dashboard/[userId]/agents/[agentId]/leads` | ⚠️ Shell | Exists, needs CRM build |
| `/dashboard/[userId]/agents/[agentId]/knowledge-base` | ⚠️ Shell | Exists, needs build |
| `/dashboard/[userId]/agents/[agentId]/topics` | ⚠️ Shell | Exists, needs build |
| `/dashboard/[userId]/agents/[agentId]/campaigns` | ⚠️ Shell | Exists, needs build |
| `/dashboard/[userId]/page-editor` | ✅ Built | LandingPageManager component |
| `/dashboard/[userId]/landing-page` | ✅ Built | Same (legacy route) |
| `/dashboard/[userId]/domains` | ✅ Built | Custom domain manager |
| `/dashboard/[userId]/settings` | ✅ Built | Business profile form |
| `/landing-pages/template-[1-4]` | ✅ Built | 4 template pages |
| `/custom-domain/[domain]` | ✅ Built | Multi-tenant domain handler |

---

## 🐛 Known Issues (Priority Order)

| Priority | Issue | Fix |
|----------|-------|-----|
| 🔴 HIGH | Agent analytics uses mock/hardcoded data | Wire to Firestore `conversations` subcollection |
| 🔴 HIGH | CRM (Leads view) is a shell — no Firestore reads/writes | Build full CRM with Firestore |
| 🟡 MED | Custom domain handler doesn't pass profile props to templates | Refactor templates to accept server props |
| 🟡 MED | `/page-editor` vs `/landing-page` — two routes, same component | Consolidate |
| 🟢 LOW | Agent card is hardcoded "Solar London" | Make dynamic from Firestore |

---

## ⚙️ Phase 3 Build Order (A.N.T. Architecture)

### Priority 1 — CRM (Leads)
- `architecture/crm-sop.md`
- `src/app/dashboard/[userId]/agents/[agentId]/leads/page.tsx`
- Firestore: `businessProfiles/{uid}/leads` CRUD

### Priority 2 — Conversations (Call Logs)
- `architecture/conversations-sop.md`
- `src/app/dashboard/[userId]/agents/[agentId]/conversations/page.tsx`
- Firestore: `agents/{agentId}/conversations` reads

### Priority 3 — AI Voice Agent Wiring
- Depends on: voice provider answer (VAPI / Retell / Twilio)
- `architecture/voice-agent-sop.md`

### Priority 4 — Landing Page Lead Capture
- Add CTA form → writes to `businessProfiles/{uid}/leads`
- Wire confirmation flow

### Priority 5 — Analytics (Live Data)
- Replace mock chart data with real Firestore aggregations
