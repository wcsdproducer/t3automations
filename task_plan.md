# T3 Automations — Task Plan (B.L.A.S.T.)

**System Pilot:** Antigravity (Gemini)  
**Protocol:** B.L.A.S.T. v1  
**Status:** 🟢 Phase 1 COMPLETE — Moving to Phase 2: Link  
**Last Updated:** 2026-05-11

---

## 🟢 Protocol 0: Initialization

- [x] Create `task_plan.md` (this file)
- [x] Confirm `findings.md` exists and is populated
- [x] Confirm `progress.md` exists and is populated
- [x] Confirm `GEMINI.md` is the active Project Constitution
- [ ] Define JSON Data Schema in `GEMINI.md`
- [ ] Receive answers to 5 Discovery Questions
- [ ] Blueprint approved by user

---

## 🏗️ Phase 1: B — Blueprint

### Discovery Questions ✅ ALL ANSWERED
- [x] North Star: Multi-tenant SaaS — Landing Page + CRM + AI Voice Agent for SMBs
- [x] Integrations: Firebase, ElevenLabs Conversational AI, Twilio (telephony), Gemini AI
- [x] Source of Truth: Firestore `businessProfiles/{userId}`
- [x] Delivery Payload: Dashboard UI • Custom domain landing pages • CRM • Call analytics
- [x] Behavioral Rules: Professional/trust tone • No mock data in production • Multi-tenancy invariants

### Data Schema
- [x] Lead schema defined in GEMINI.md
- [x] Call Log schema defined in GEMINI.md
- [x] Business Profile schema defined in GEMINI.md
- [x] Agent schema defined in GEMINI.md
- [x] Blueprint approved

---

## ⚡ Phase 2: L — Link

- [ ] Confirm `ELEVENLABS_API_KEY` in `.env` / `apphosting.yaml`
- [ ] Confirm `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` in `.env`
- [ ] Verify ElevenLabs API responds (list agents endpoint)
- [ ] Verify Twilio account has a phone number provisioned
- [ ] Build `tools/verify-elevenlabs.ts` — test API auth + list agents
- [ ] Build `tools/verify-twilio.ts` — test credentials + list numbers
- [ ] Build `tools/verify-firestore.ts` — test read/write to `businessProfiles`

---

## ⚙️ Phase 3: A — Architect

- [ ] Create `architecture/` directory
- [ ] Write SOPs for each tool in Markdown
- [ ] Build Layer 3 tools (deterministic Python scripts)
- [ ] Set up `.tmp/` for intermediates

---

## ✨ Phase 4: S — Stylize

- [ ] Format output payloads (Slack / Notion / Email / UI)
- [ ] Apply UI/UX polish to any dashboard views
- [ ] Present stylized results to user for feedback

---

## 🛰️ Phase 5: T — Trigger

- [ ] Cloud transfer of finalized logic
- [ ] Set up automation triggers (Cron / Webhook / Listener)
- [ ] Finalize Maintenance Log in `GEMINI.md`

---

## 📋 Known Issues (Inherited from Workspace Audit)

| # | Issue | Status |
|---|-------|--------|
| 1 | `/page-editor` route → 404 | ⏳ Pending |
| 2 | Custom domain handler — template props not passed | ⏳ Pending |
| 3 | DnsRecords component — hardcoded IPs (now fixed) | ✅ Fixed |
| 4 | `aisalesrep.live` DNS propagation + Firebase SSL | ⏳ Awaiting propagation |

---

## 🔑 Key Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-11 | B.L.A.S.T. installed in T3 Automations | Standardize automation framework |
