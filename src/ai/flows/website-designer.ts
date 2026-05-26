'use server';

/**
 * @fileOverview Genkit flow for generating professional, conversion-optimized landing page copy
 * and theme styling for a local service category/niche.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const WebsiteDesignerInputSchema = z.object({
  serviceCategory: z.string().describe('The niche/service category of the business (e.g. Plumbing, HVAC, Junk Removal).'),
  companyName: z.string().describe('The name of the company.'),
});

export type WebsiteDesignerInput = z.infer<typeof WebsiteDesignerInputSchema>;

const ServiceItemSchema = z.object({
  title: z.string().describe('Name of the sub-service (e.g. AC Repair)'),
  description: z.string().describe('Short explanation of what the sub-service entails (max 15 words)'),
});

const ReviewItemSchema = z.object({
  quote: z.string().describe('Realistic, benefit-driven customer review quote (e.g. fast response time, professionalism)'),
  author: z.string().describe('Customer name and location (e.g. Sarah M. from Dallas, TX)'),
});

const WebsiteDesignerOutputSchema = z.object({
  companyName: z.string().describe('The localized company name (e.g. Dallas Junk Removal Pros)'),
  hero: z.object({
    title: z.string().describe('High-impact, conversion-optimized H1 headline tailored specifically to the service category. Do not include place-holders.'),
    subtitle: z.string().describe('Supporting benefit-driven subheadline.'),
    cta: z.string().describe('Direct, action-oriented primary button call to action (e.g., "GET MY FREE ESTIMATE")'),
  }),
  services: z.object({
    title: z.string().describe('Niche-specific section title (e.g. Professional Plumbing Solutions)'),
    subtitle: z.string().describe('Section subtitle'),
    items: z.array(ServiceItemSchema).length(3).describe('Exactly 3 distinct, niche-specific sub-services'),
  }),
  about: z.object({
    title: z.string().describe('Niche-specific about section title'),
    body: z.string().describe('Background/about copy focusing on quality, responsiveness, and trust (2-3 sentences max)'),
    points: z.array(z.string()).length(3).describe('Exactly 3 trust-building highlights (e.g. "Licensed & Insured", "24/7 Availability", "Upfront Pricing")'),
  }),
  reviews: z.object({
    title: z.string().describe('Niche-specific reviews title (e.g. What Your Neighbors Say)'),
    items: z.array(ReviewItemSchema).length(5).describe('Exactly 5 reviews with realistic names and suburban locations'),
  }),
  contact: z.object({
    title: z.string().describe('Contact section title'),
    subtitle: z.string().describe('Contact section subtitle'),
  }),
  theme: z.object({
    fontPair: z.string().describe('Font pairing ID, select from: modern-corporate, bold-creative, elegant-luxury, friendly-local, tech-forward'),
    colorPalette: z.string().describe('Color palette ID, select from: luxury-purple, deep-midnight, professional-blue, sunny-yellow, earthy-green, vibrant-coral, soft-pastel, clean-minimal'),
  })
});

export type WebsiteDesignerOutput = z.infer<typeof WebsiteDesignerOutputSchema>;

export async function aiGenerateWebsiteContent(input: WebsiteDesignerInput): Promise<WebsiteDesignerOutput> {
  return websiteDesignerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'websiteDesignerPrompt',
  input: { schema: WebsiteDesignerInputSchema },
  output: { schema: WebsiteDesignerOutputSchema },
  prompt: `You are an expert Landing Page Designer and Copywriter specializing in Conversion Rate Optimization (CRO) for local service businesses.

Your goal is to write premium, high-converting copy and select professional theme stylings for a website based on the service category and company name provided.

Here is the business information:
- Company Name: {{{companyName}}}
- Service Category: {{{serviceCategory}}}

Rules for generating the content:
1. **Never use placeholders** like [City] or [Your Name]. Everything must be fully filled out and ready to go.
2. **Niche Specificity:** Write copy that speaks directly to the specific service category (e.g. if category is Junk Removal, write about decluttering, fast hauling, eco-friendly disposal. If HVAC, focus on comfort, 24/7 emergency service, heating/cooling systems).
3. **CRO Best Practices:** Ensure all headlines are benefit-driven.
4. **Theme Selection:** Pick a color palette and font pairing ID that match the service category (e.g. 'earthy-green' for landscaping/lawncare, 'professional-blue' or 'deep-midnight' for plumbing/HVAC/electrical, 'luxury-purple' or 'clean-minimal' for cleaning).

Analyze the company details and category, then generate the layout content.`,
});

const websiteDesignerFlow = ai.defineFlow(
  {
    name: 'websiteDesignerFlow',
    inputSchema: WebsiteDesignerInputSchema,
    outputSchema: WebsiteDesignerOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
