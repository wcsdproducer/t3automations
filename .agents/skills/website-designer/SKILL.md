---
name: website-designer
description: Enforces design guidelines and copy requirements for generating high-converting, responsive, and location-agnostic landing pages based on local service niches (Service Categories).
---
# Website Designer Skill

This skill guides the AI when generating, structuring, and designing premium, high-converting local service landing pages. These sites are optimized for local search engine optimization (SEO) and lead conversion (Rank & Rent business model).

## 1. Landing Page Schema (Firestore: `businessProfiles/{userId}/websiteConfig`)

Every landing page configuration is saved as a JSON object inside `businessProfiles/{profileId}` under the `websiteConfig` field. The schema structure is as follows:

```json
{
  "serviceCategory": "string (e.g. 'Epoxy Flooring', 'Tree Services', 'Paving & Concrete')",
  "companyName": "string",
  "phoneNumber": "string",
  "logoUrl": "string (optional)",
  "fontPair": "modern-corporate | friendly-local | clean-minimal | bold-tech",
  "colorPalette": "deep-midnight | earthy-green | professional-blue | warm-amber",
  "heroEffect": "slideshow | parallax | minimal",
  "hero": {
    "title": "string (e.g. 'Premium Epoxy Flooring in Tampa, FL')",
    "subtitle": "string (e.g. 'Durable, slip-resistant, and stunning epoxy finishes for garages, commercial spaces, and patios. Get your free estimate today!')",
    "ctaText": "string (e.g. 'GET MY FREE ESTIMATE')",
    "secondaryCtaText": "string (e.g. 'CALL NOW')"
  },
  "trustBadges": [
    "Licensed, Bonded & Insured",
    "100% Satisfaction Guarantee",
    "Free Estimates & Quotes",
    "Local Tampa Specialists"
  ],
  "services": {
    "title": "Our Professional Services",
    "subtitle": "High-quality, reliable services tailored to your exact needs.",
    "items": [
      {
        "title": "string",
        "description": "string",
        "iconName": "string (Lucide icon key)"
      }
    ]
  },
  "process": {
    "title": "How It Works",
    "subtitle": "Getting started with us is quick, simple, and stress-free.",
    "steps": [
      {
        "number": "1",
        "title": "Request a Quote",
        "description": "Call us or fill out our simple online form to detail your project needs."
      },
      {
        "number": "2",
        "title": "On-Site Assessment",
        "description": "We'll review your site and provide a clear, upfront estimate with zero hidden fees."
      },
      {
        "number": "3",
        "title": "Expert Execution",
        "description": "Our certified local professionals complete the job to the highest industry standards."
      }
    ]
  },
  "about": {
    "title": "About Our Company",
    "body": "string (rich copy highlighting trust, years of local expertise, and customer focus)",
    "points": [
      "Licensed & Fully Insured",
      "Upfront & Transparent Rates",
      "Highly Rated Local Crew",
      "Top-Quality Materials & Equipment"
    ]
  },
  "faqs": [
    {
      "question": "string",
      "answer": "string"
    }
  ],
  "reviews": {
    "title": "What Our Clients Say",
    "items": [
      {
        "quote": "string",
        "author": "string",
        "location": "string (e.g. 'Tampa, FL')"
      }
    ]
  },
  "contact": {
    "title": "Get Your Free Quote Today",
    "subtitle": "Fill out the form below or call us directly to speak with a specialist."
  }
}
```

---

## 2. Copywriting & Content Guidelines (Unbounce & CXL Best Practices)

To achieve maximum conversion rates (>15% visitor-to-lead), follow these copy rules:
1. **Hyper-Local Targeting**: Always include the specific city name (e.g. "Tampa, FL") in the H1, sub-headlines, and body text.
2. **Intent-Aligned Headline (H1)**: The hero headline must state the service and the primary customer benefit immediately (e.g., "Transform Your Garage With Premium Epoxy Coatings in Tampa, FL" or "Professional Tampa Tree Service & Removal").
3. **The Local "Trust Trio"**:
   - **Click-to-Call Buttons**: Place a call button prominently in the hero and sticky header.
   - **Social Proof**: Provide at least 3-5 testimonials with full customer names and locations.
   - **Credentials**: Highlight licensing, insurance, and satisfaction guarantees.
4. **Remove Exit Links**: Do not include links that take visitors away from the landing page. Keep navigation minimal and make all navigation links scroll to corresponding sections on the same page.
5. **High-Converting CTAs**: Use actionable, high-contrast buttons (e.g., "GET MY FREE ESTIMATE" or "CLAIM FREE ESTIMATE NOW" instead of "Submit").
6. **No pricing tables**: For Rank & Rent service leads, emphasize affordability, upfront estimates, and value rather than generic pricing tiers.

---

## 3. Visual & UI Guidelines (Tailwind CSS)

1. **Conversion-Centered Layout**:
   - **Encapsulated Lead Form**: Wrap the contact form in a visually distinct container with custom shadows (`shadow-xl`), borders, and background color to draw the user's attention.
   - **Directional Cues**: Use subtle visual indicators (like card hover highlights or layouts that draw the eye toward the CTA).
2. **Aesthetics & Premium Styling**:
   - **Modern Typography**: Use distinct font pairings (e.g. Outfit / Inter, Montserrat / Open Sans) loaded dynamically.
   - **Visual Accents**: Implement smooth color gradients and subtle shadows on buttons and cards.
   - **Micro-Animations**: Apply transition classes (`transition-all duration-300 hover:scale-105`) for all clickable elements.
   - **Glassmorphism**: Use backdrop filters (`backdrop-blur-md bg-background/80`) on sticky headers to keep them readable over background media.
