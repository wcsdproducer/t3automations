'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import dns from 'dns';
import { promisify } from 'util';

const resolveNsAsync = promisify(dns.resolveNs);
const resolveSoaAsync = promisify(dns.resolveSoa);

async function checkDomainViaDns(domain: string): Promise<boolean> {
  try {
    await resolveNsAsync(domain);
    return false; // Has NS records, so it is taken
  } catch (e: any) {
    if (e.code === 'ENOTFOUND') {
      try {
        await resolveSoaAsync(domain);
        return false; // SOA exists, so it is taken
      } catch (e2) {
        return true; // No NS or SOA found, likely available
      }
    }
    return false; // Other errors mean it is registered but DNS is misconfigured
  }
}

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

function calculateScore(opp: { population: number; difficulty: 'Low' | 'Medium' | 'High'; available: boolean }) {
  let score = 0;

  // 1. Population Score (max 40 pts)
  const pop = opp.population;
  if (pop < 200000) score += 15;
  else if (pop >= 200000 && pop < 500000) score += 30;
  else if (pop >= 500000 && pop <= 1200000) score += 40; // Ideal range
  else score += 25; // Large city, high traffic but offsets competition

  // 2. Difficulty Score (max 30 pts)
  if (opp.difficulty === 'Low') score += 30;
  else if (opp.difficulty === 'Medium') score += 20;
  else score += 10;

  // 3. Domain Availability Score (max 30 pts)
  if (opp.available === true) {
    score += 30;
  } else {
    score += 0;
  }

  return score;
}

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

    const aiOpps = response.output?.opportunities || [];

    // Asynchronously perform DNS check and score calculation server-side
    const resolvedOpps = await Promise.all(
      aiOpps.map(async (o) => {
        const cleanDomain = o.domain.toLowerCase().trim();
        const available = await checkDomainViaDns(cleanDomain);
        const score = calculateScore({
          population: o.population,
          difficulty: o.difficulty,
          available
        });

        return {
          id: Math.random().toString(36).substring(2, 9),
          niche: o.niche,
          location: `${o.city}, ${o.state.toUpperCase()}`,
          population: o.population,
          difficulty: o.difficulty,
          domain: cleanDomain,
          available,
          score,
          isCustom: true,
          checking: false
        };
      })
    );

    // Sort descending by score
    const sorted = resolvedOpps.sort((a, b) => b.score - a.score);

    return {
      success: true,
      opportunities: sorted
    };
  } catch (err: any) {
    console.error('Failed to scout opportunities with AI:', err);
    return {
      success: false,
      error: err.message || 'Unknown error occurred'
    };
  }
}

