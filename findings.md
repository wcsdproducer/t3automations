# T3 Automations — Workspace Audit Findings

**Date:** 2026-05-11
**Auditor:** System Pilot (B.L.A.S.T.)

---

## 🏗️ Architecture Overview

### Project Identity
- **Firebase Project:** `studio-1410114603-9e1f6`
- **App Hosting Backend:** `studio`
- **Primary URL:** `https://studio--studio-1410114603-9e1f6.us-central1.hosted.app`
- **Root Domains:** `t3automations.com`, `t3kniq.com`
- **Region:** `us-central1`

### App Structure (Next.js 14 App Router)
```
/app
├── page.tsx                         # Marketing homepage
├── login/ signup/                   # Auth pages
├── contact/ assessment/             # Lead capture
├── dashboard/[userId]/              # Per-user dashboard (auth-gated)
│   ├── layout.tsx                   # Sidebar nav with: Agents, Workflows, Phone Numbers, Landing Page, Settings
│   ├── page.tsx                     # Agents page
│   ├── landing-page/page.tsx        # Landing page management (LandingPageManager + CustomDomainManager + DnsRecords)
│   └── settings/                   # Company profile settings
├── landing-pages/                   # 4 template pages (template-1 through template-4)
│   ├── template-1/                  # Classic Professional
│   ├── template-2/                  # Modern Visual
│   ├── template-3/                  # Direct Response (default for HVAC)
│   └── template-4/                  # Friendly Local (cleaning)
├── custom-domain/[domain]/          # Custom domain handler (Server Component)
│   └── page.tsx                     # Looks up domain in Firestore → renders matched template
└── marketing-ads/                   # Additional pages
```

### Data Model (Firestore)
```
businessProfiles/{userId}
  ├── service: string                # Service category (maps to template)
  ├── defaultLandingPage: string    # 'template-1' through 'template-4'
  ├── heroEffect: string            # 'slideshow' | 'parallax'
  ├── businessName: string
  ├── phoneNumber: string
  ├── logoUrl: string
  └── customDomains/{domain}
        ├── id: domain string
        ├── businessProfileId: userId
        ├── domain: string
        └── status: 'pending' | 'active'
```

---

## 🐛 Issues Found

### 1. `page-editor` Route — 404 / Client Error
- **URL:** `t3automations.com/dashboard/{userId}/page-editor`
- **Status:** ❌ Route does not exist
- **Root cause:** Dashboard nav has no `/page-editor` route. The correct route is `/landing-page`. Something external is linking to the wrong slug.
- **Fix needed:** Audit any in-app links pointing to `/page-editor`. If it's a legacy URL, add a redirect.

### 2. Custom Domain Handler — Template SearchParams Not Passed
- **File:** `src/app/custom-domain/[domain]/page.tsx`
- **Issue:** Templates are Client Components that read `useSearchParams()` for `heroEffect`, `service`, `phone`, `logo`, `companyName`. When rendered via custom domain, the URL has no query params → all values fall back to defaults.
- **Status:** ⚠️ Acknowledged in code comments but unresolved.
- **Fix needed:** Refactor templates to accept props, OR pass the profile data via React Context/server props from the custom domain handler.

### 3. DnsRecords Component — Hardcoded IPs
- **File:** `src/app/dashboard/[userId]/landing-page/page.tsx` (lines 13-16)
- **Issue:** The `DnsRecords` UI shows hardcoded IPs (`151.101.1.195`, `151.101.65.195`) that may be outdated. The real Firebase App Hosting IP is `35.219.200.4`.
- **Fix needed:** Update the displayed DNS records to match the actual Firebase App Hosting A record.

### 4. Middleware — `aisalesrep.live` Not in rootDomains (FIXED ✅)
- Was treating `aisalesrep.live` as a client custom domain instead of a first-party test domain.
- **Fix applied:** The middleware now correctly lists root domains in a readable array with comments.

---

## ✅ What's Working

- Multi-tenant middleware rewrite pattern is correct
- Firestore security rules are well-structured (path-based ownership)
- Firebase Admin initialized correctly for App Hosting (auto ADC)
- 4 landing page templates exist and are functional
- LandingPageManager: template selection, service category, hero effect, live preview iframe
- CustomDomainManager: Firestore CRUD for custom domains (add/delete with validation)
- `collectionGroup` query on `customDomains` works for domain → profile lookup

---

## 🌐 Custom Domain Setup — `aisalesrep.live`

### Firebase Registration
- **Status:** Registered on Firebase App Hosting backend `studio` — "Needs setup"
- **Firebase Console:** https://console.firebase.google.com/project/studio-1410114603-9e1f6/apphosting

### DNS Records (Applied to Namecheap — 2026-05-11)

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | `35.219.200.4` | Automatic |
| A | www | `35.219.200.4` | 30 min |
| TXT | @ | `fah-claim=002-02-47754f26-2052-4cef-8820-dee7474dbf56` | Automatic |
| CNAME | `_acme-challenge_3vy6hxc24yw4ws5e` | `e4352792-2a31-4baf-9540-6129944c635d.9.authorize.certificatemanager.goog.` | Automatic |

**Previous A record removed:** `192.64.119.72` (Namecheap parking page)
**Registrar:** Namecheap
**Propagation:** Allow up to 48h. Firebase will auto-provision SSL once TXT + CNAME verify.

### How Custom Domains Work (End-to-End)
1. User visits `aisalesrep.live` → DNS resolves to `35.219.200.4` (Firebase App Hosting)
2. Firebase App Hosting receives request with `Host: aisalesrep.live`
3. Next.js middleware sees hostname NOT in `rootDomains` → rewrites to `/custom-domain/aisalesrep.live`
4. `custom-domain/[domain]/page.tsx` (Server Component) queries Firestore `collectionGroup('customDomains')` for `id == 'aisalesrep.live'`
5. Finds `businessProfileId` → fetches `businessProfiles/{id}`
6. Reads `defaultLandingPage` → renders matching template

**Note:** For `aisalesrep.live` to show a landing page, a Firestore document must exist at:
`businessProfiles/{userId}/customDomains/aisalesrep.live` with `businessProfileId: {userId}`
