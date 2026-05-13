# AutoRunOn

## ⚡ Autonomous Operation — Full Permissions Granted

| Permission | Status |
|---|---|
| AutoRunOn | ✅ ENABLED |
| Auto Workspace Approval | ✅ ENABLED |
| Auto Terminal Access Approval | ✅ ENABLED |
| Auto Workspace Access Approval | ✅ ENABLED |
| Browser Access | ✅ FULL ACCESS |
| Google Cloud Account Access | ✅ FULL ACCESS |
| Firebase Access | ✅ FULL ACCESS |

> ## ⚡ PLANNING MODE — ON
>
> **You are operating in Planning Mode. Follow these rules without exception:**
>
> 1. **Never ask for approval before starting work.** When given a task, begin immediately.
> 2. **Planning Mode is ON.** Exercise judgment on whether a user's request warrants a plan before taking action.
> 3. **Never ask clarifying questions** unless a required credential/value is completely unknown.
> 4. **Never stop mid-task** to confirm you are on the right track. Complete the full task.
> 5. **All terminal commands auto-run** (`SafeToAutoRun: true` on EVERY `run_command` call — NO EXCEPTIONS except rm -rf, git push --force, DROP TABLE).
> 6. **Make decisions independently.** When multiple approaches exist, pick the best one and proceed.
> 7. **Only stop for:** `rm -rf`, `git push --force`, dropping production databases.
> 8. **User ONLY approves Implementation Plans.** Everything else — workspace edits, terminal commands, browser actions, cloud operations — is auto-accepted.

## 🔁 Autonomous Test Loop Protocol

When resolving issues or building features, operate in a continuous test loop:

1. **Implement** — Make the change.
2. **Test as User** — Run the dev server, open the browser, interact with the UI as a real user would.
3. **Verify** — Confirm the feature works end-to-end; check logs, console, and network responses.
4. **Resolve** — If issues are found, fix them and re-enter the loop without pausing for user input.
5. **Complete** — Only surface results to the user when the loop concludes successfully.

Never stop the loop mid-cycle to ask for confirmation. Resolve all issues autonomously.

---

# T3 Automations — Agent Instructions

> ## ⚡ AUTONOMOUS MODE — CRITICAL — READ FIRST
>
> **You are operating in fully autonomous mode. Follow these rules without exception:**
>
> 1. **Never ask for approval before starting work.** When given a task, begin immediately.
> 2. **Never propose a plan and wait for approval.** Skip planning mode entirely — just execute.
> 3. **Never ask clarifying questions** unless a required credential/value is completely unknown.
> 4. **Never stop mid-task** to confirm you are on the right track. Complete the full task.
> 5. **All terminal commands auto-run** (`SafeToAutoRun: true` on every `run_command`).
> 6. **Make decisions independently.** When multiple approaches exist, pick the best one and proceed.
> 7. **Only stop for:** `rm -rf`, `git push --force`, dropping production databases.

# AutoRunOn
# AutoAllowWorkspace
# AutoTerminalAccess
# AutoWorkspaceAccess

<!-- AutoRunOn: Agent auto-executes ALL tool calls and terminal commands without prompting for approval. -->
<!-- AutoAllowWorkspace: Agent automatically trusts and accesses all workspace files without prompting. -->
<!-- AutoTerminalAccess: Agent has full, unrestricted terminal/shell access — auto-approved. -->
<!-- AutoWorkspaceAccess: Agent has full read/write access to all workspace directories — auto-approved. -->
<!-- BrowserAccess: Agent has full autonomous access to the browser — no user approval needed. -->
<!-- GoogleCloudAccess: Agent has full autonomous access to Google Cloud Account and all GCP services. -->
<!-- FirebaseAccess: Agent has full autonomous access to Firebase (Firestore, Auth, Hosting, Functions, etc.). -->
<!-- AutonomousOperation: Agent works fully autonomously. User ONLY approves high-level Implementation Plans. Everything else (commands, edits, tests, deploys) is auto-accepted. Agent runs test loops to resolve issues and verify results independently. -->

---

# 🏛️ T3 Automations — Project Constitution (B.L.A.S.T.)

> **This file is LAW. Schema changes here before code changes anywhere.**

## 📦 Product Identity

**T3 Automations** is a multi-tenant SaaS platform for small businesses providing:
1. **Customizable Landing Page** with CTA for lead capture
2. **CRM** to manage and track captured leads
3. **AI Voice Agent** to handle inbound calls 24/7

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | Firebase Authentication |
| Database | Firestore |
| Storage | Firebase Storage |
| Hosting | Firebase App Hosting |
| AI | Google Gemini (via Genkit) |
| Voice Agent | ElevenLabs Conversational AI |
| Telephony | Telnyx (SIP bridge for ElevenLabs) |
| Transcriber | Deepgram (via ElevenLabs config) |
| Brain/LLM | Google Gemini (via ElevenLabs config) |

---

## 🗃️ Source of Truth — Firestore

**Root:** `businessProfiles/{userId}`

### Confirmed Collections
- `businessProfiles/{userId}` — tenant profile (name, phone, logo, service, template)
- `businessProfiles/{userId}/customDomains/{domain}` — custom domain records
- `businessProfiles/{userId}/leads/{leadId}` — CRM leads (**TO BUILD**)
- `businessProfiles/{userId}/agents/{agentId}` — AI voice agents (elevenLabsAgentId, twilioNumber)
- `businessProfiles/{userId}/agents/{agentId}/conversations/{callId}` — call logs (from ElevenLabs post-call webhook)
- `businessProfiles/{userId}/agents/{agentId}/knowledge-base/{docId}` — agent training data

---

## 🎙️ ElevenLabs Managed Voice Architecture (with Tool Calling)

### How Inbound Calls Work
1. Customer dials Telnyx number → Telnyx routes to ElevenLabs agent via SIP.
2. ElevenLabs fires **personalization webhook** → our API looks up the caller ID in Firestore and returns context (e.g., "Returning customer: John, last appointment on May 1st") as `dynamic_variables`.
3. Agent handles call using business-specific context, ElevenLabs internal RAG (synced from our Knowledge Base), and Gemini 1.5 Flash as the LLM.
4. If user requests an action (e.g., "Book an appointment"), the agent triggers an **ElevenLabs Server Tool**, hitting our custom API (`/api/elevenlabs/tools/book-calendar`) mid-call.
5. After call ends → ElevenLabs fires **`post_call_transcription` webhook** with full transcript, summary, duration, and analysis.
6. Our webhook handler writes the conversation to Firestore + creates/updates a lead if caller is new.

### Webhook Endpoints (to build)
- `POST /api/elevenlabs/personalization` — looks up caller ID, returns `dynamic_variables`.
- `POST /api/elevenlabs/tools/*` — suite of API endpoints for calendar booking, rescheduling, and cancellation.
- `POST /api/elevenlabs/post-call` — receives transcript, writes to Firestore conversations + leads.

### Agent Schema (Firestore)
```json
{
  "elevenLabsAgentId": "string",
  "telnyxPhoneNumber": "+15551234567",
  "name": "string",
  "systemPrompt": "string",
  "firstMessage": "string",
  "voiceId": "string",
  "status": "active | inactive",
  "createdAt": "Timestamp"
}
```

---

## 📐 Canonical Data Schemas

### Lead (CRM Record)
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

### Call Log
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

### Business Profile
```json
{
  "businessName": "string",
  "contactEmail": "string",
  "phoneNumber": "string",
  "websiteUrl": "string",
  "logoUrl": "string",
  "service": "string",
  "defaultLandingPage": "template-1 | template-2 | template-3 | template-4",
  "heroEffect": "slideshow | parallax"
}
```

---

## 🛠️ Architectural Invariants

1. **Multi-tenancy:** All data is scoped under `businessProfiles/{userId}`. Never write outside this path for tenant data.
2. **Auth gate:** All dashboard routes must verify `user.uid.slice(-12) === userIdSlug` before rendering.
3. **Templates are server-rendered:** Custom domain handler is a Server Component. Templates must accept props, not rely on `useSearchParams()`.
4. **Landing page CTA → Firestore:** Form submissions write to `businessProfiles/{uid}/leads`. Never use a third-party form service.
5. **Secrets in `.env`:** All API keys in `.env` / `apphosting.yaml`. Never hardcode.
6. **No mock data in production:** Agent analytics must read from real Firestore data before shipping.

---

## 🚫 Behavioral Rules (Do Not)

- **DO NOT** hardcode tenant data (agent names, business names) in components
- **DO NOT** use `useSearchParams()` in Server Components or custom domain templates
- **DO NOT** write to Firestore paths outside `businessProfiles/{userId}`
- **DO NOT** ship mock/hardcoded chart data to production

---

## 📋 Build Priority Queue

1. 🔴 CRM — `leads` Firestore CRUD + UI
2. 🔴 Conversations — wire call logs to Firestore
3. 🟡 Landing Page CTA form → lead write
4. 🟡 Custom domain template props fix
5. 🟢 Live analytics (replace mock data)
6. ⬜ AI Voice Provider integration (pending provider decision)
