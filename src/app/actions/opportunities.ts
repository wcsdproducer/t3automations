'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const OpportunitySchema = z.object({
  niche: z.string().describe('The name of the service niche (e.g. Drywall Repair, HVAC, Epoxy Flooring, Junk Removal, Gutter Services, Appliance Repair, Plumbing, Tree Removal, Pest Control)'),
  city: z.string().describe('The name of a target city (e.g. Knoxville, Chattanooga, Richmond, Spokane, Tacoma, Reno, Greensboro, Worcester)'),
  state: z.string().describe('The 2-letter state code (e.g. TN, WA, VA, NC, MA, NV)'),
  population: z.number().describe('The estimated metropolitan population (should try to hit the ideal 500,000 to 1,200,000 range or nearby hotspots)'),
  difficulty: z.enum(['Low', 'Medium', 'High']).describe('Estimated SEO difficulty based on typical local competition'),
  domain: z.string().describe('Suggested exact match domain for the service and city, ending in .com (e.g. knoxvillepestexperts.com, spokanegutterexperts.com, richmondjunkpros.com, tacomadrywallexperts.com, renolawncare.com, greensborojunkpros.com). Only suggest high-conversion domains.')
});

const ScoutOpportunitiesResponseSchema = z.object({
  opportunities: z.array(OpportunitySchema).describe('List of 5 to 8 suggested high-potential local service opportunities')
});

export async function scoutOpportunitiesWithAI() {
  try {
    const promptText = `Analyze local service business markets in the United States and identify 6 to 8 untapped, high-potential opportunities.
For each opportunity, find a mid-sized US city (ideally with a metropolitan population between 400,000 and 1,500,000, and particularly matching the 500k-1.2M sweet spot) and a high-yield local service niche (like Drywall Repair, HVAC, Epoxy Flooring, Junk Removal, Gutter Services, Appliance Repair, Plumbing, Tree Removal, Pest Control, Roof Repair, Lawn Care, Pressure Washing).

For each opportunity:
1. Brainstorm a logical exact match domain suggestion ending in .com. Examples:
   - "tacomadrywallexperts.com" (Tacoma, WA + Drywall Repair)
   - "greensborojunkpros.com" (Greensboro, NC + Junk Removal)
   - "spokanegutterexperts.com" (Spokane, WA + Gutter Services)
   - "richmondjunkpros.com" (Richmond, VA + Junk Removal)
   - "knoxvillepestexperts.com" (Knoxville, TN + Pest Control)
   - "renoepoxypros.com" (Reno, NV + Epoxy Flooring)
2. Estimate the metropolitan population.
3. Assess the difficulty level ("Low" or "Medium" is preferred, but "High" can be used if it's a massive opportunity).
4. Provide a realistic niche and location name.

Ensure the suggested domains are realistic, professional, and likely to be available (focusing on high-value but specific local service keywords). Make sure to return a diverse set of opportunities spanning different states and niches.`;

    const response = await ai.generate({
      model: 'vertexai/gemini-2.5-flash',
      prompt: promptText,
      output: {
        schema: ScoutOpportunitiesResponseSchema,
      },
    });

    return {
      success: true,
      opportunities: response.output?.opportunities || []
    };
  } catch (err: any) {
    console.error('Failed to scout opportunities with AI:', err);
    return {
      success: false,
      error: err.message || 'Unknown error occurred'
    };
  }
}
