---
name: website-designer
description: Enforces design guidelines and copy requirements for generating high-converting, responsive, and location-agnostic landing pages based on local service niches (Service Categories).
---
# Website Designer Skill

This skill guides the AI when generating, structuring, and designing universal local service landing pages. These sites are used in the "Rank and Rent" business model, meaning they must be extremely optimized for search conversion, responsive, and structured so they can easily represent any local business.

## 1. Landing Page Schema (Firestore: `businessProfiles/{userId}/website`)

Every landing page must be generated as a JSON configuration saved in Firestore at `businessProfiles/{userId}/website`. This configuration defines the copy, styling variables, and content components of the page.

### Schema Fields
- `serviceCategory`: string (e.g. "HVAC Maintenance & Repair", "Plumbing", "Junk Removal & Moving")
- `companyName`: string
- `phoneNumber`: string
- `logoUrl`: string
- `colorPalette`:
  - `primary`: string (Tailwind-compatible color or Hex code)
  - `secondary`: string
  - `accent`: string
  - `background`: string
- `typography`:
  - `headingFont`: string (e.g. "Inter", "Montserrat", "Playfair Display")
  - `bodyFont`: string (e.g. "Roboto", "Raleway", "Open Sans")
- `hero`:
  - `title`: string (high-impact, benefit-driven hook)
  - `subtitle`: string (supporting detail with a clear offer)
  - `ctaText`: string (e.g., "GET MY FREE ESTIMATE")
- `services`:
  - `title`: string
  - `subtitle`: string
  - `items`: Array of `{ title: string, description: string, iconName: string }` (3 service items specific to the niche)
- `about`:
  - `title`: string
  - `body`: string (niche-focused background story highlighting trust and service quality)
  - `points`: Array of strings (e.g. "Licensed & Insured", "24/7 Availability", "Upfront Pricing")
- `reviews`:
  - `title`: string
  - `items`: Array of `{ quote: string, author: string, location: string }` (5 realistic testimonials with client names and locations)
- `contact`:
  - `title`: string
  - `subtitle`: string

---

## 2. Copywriting Guidelines for High-Conversion

To ensure the landing page converts traffic into leads, use the following copywriting guidelines:
1. **Urgency & Emergency Callouts:** If the niche has emergency scenarios (e.g. HVAC, plumbing, locksmith), include a prominent 24/7 emergency repair tag in the hero and header.
2. **Clear Value Propositions:** The main H1 must immediately state what the service is and what the primary benefit is. Avoid generic tags like "Home Services." Use strong action verbs (e.g., "Keep Your Home Cool All Summer Long").
3. **Low-friction Lead Capture Form:** The final section should be a simple lead form containing fields: Name, Email Address, Phone Number, and Consent check for SMS communications.
4. **Trust Badges:** Highlight that the business has "Certified Professionals", "Upfront Pricing", and "100% Satisfaction Guarantee."
5. **Calls to Action (CTAs):** Integrate multiple CTAs on the page. The sticky header must have a direct click-to-call button with the dynamic phone number. The hero section must link directly to the contact form.

---

## 3. Dynamic UI Layout Guidelines

When rendering this page on the frontend (Next.js):
- **Sticky Header:** Keep the header sticky with the company logo or name, a basic navigation list, and a prominent phone icon/button.
- **Micro-Animations:** Use smooth CSS/Tailwind transitions (`hover:scale-105`, `duration-300`, `transition-all`) for buttons and cards.
- **Glassmorphism/Backdrops:** In the header or overlays, use `backdrop-blur-sm` and subtle semi-transparent backgrounds to maintain a modern, premium look.
- **Mobile First:** Ensure all layouts wrap perfectly to a single column on mobile screens. Touch targets for calls and forms must be at least 48px to prevent accidental taps.
