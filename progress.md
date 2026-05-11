# Progress Log

## 2026-05-11 — Workspace Audit + DNS Setup

### ✅ Completed
1. **Full workspace audit** — Documented architecture, data model, routing, and all discovered issues in `findings.md`
2. **Firebase App Hosting domain registration** — `aisalesrep.live` registered on the `studio` backend via Firebase Console (status: Needs setup → pending DNS verification)
3. **Namecheap DNS updated** — All 4 required records applied:
   - A `@` → `35.219.200.4`
   - A `www` → `35.219.200.4`
   - TXT `@` → `fah-claim=002-02-47754f26-2052-4cef-8820-dee7474dbf56`
   - CNAME `_acme-challenge_3vy6hxc24yw4ws5e` → `e4352792-2a31-4baf-9540-6129944c635d.9.authorize.certificatemanager.goog.`
4. **Middleware** — Root domains array refactored for readability/maintainability
5. **DnsRecords UI component** — Updated from incorrect Fastly IPs to correct Firebase App Hosting IP and record structure
6. **B.L.A.S.T. framework installed** in Second Act workspace

### ⏳ Pending (Firebase verification)
- Firebase will auto-verify DNS + provision SSL within ~24–48h after propagation
- Once verified, `aisalesrep.live` status changes from "Needs setup" → "Connected"

### 🐛 Known Issues (Not Yet Fixed)
- `/page-editor` route crash — route doesn't exist, need to trace what's linking to it
- Custom domain handler doesn't pass business profile data as props to templates (searchParams issue)

### 🔑 Key Findings
- Registrar: **Namecheap**
- Firebase App Hosting target IP: `35.219.200.4`
- Old parking IP removed: `192.64.119.72`
- Domain → landing page flow works end-to-end **IF** a Firestore document exists at `businessProfiles/{uid}/customDomains/aisalesrep.live`
