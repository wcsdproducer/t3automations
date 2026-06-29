'use server';

import { admin } from '@/lib/firebase-admin';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { revalidatePath } from 'next/cache';

const GeoSiloOutputSchema = z.object({
  surroundingCities: z.array(z.string()).describe('List of 5-8 surrounding cities/towns in the same metropolitan area or county'),
  neighborhoods: z.array(z.string()).describe('List of 6-10 major neighborhoods, suburbs, or districts in the target city'),
});

export async function generateLocalSeoAndInterlinking(userId: string) {
  try {
    const db = admin.firestore();
    const profileRef = db.collection('businessProfiles').doc(userId);
    const profileDoc = await profileRef.get();
    
    if (!profileDoc.exists) {
      return { success: false, error: 'Business profile not found' };
    }
    
    const profile = profileDoc.data() || {};
    const targetCity = profile.targetCity || '';
    const serviceName = profile.service || profile.niche || 'Local Services';
    
    if (!targetCity) {
      return { success: false, error: 'Target city is not set on this business profile.' };
    }

    console.log(`[seo-generation] Resolving surrounding cities and neighborhoods for: "${targetCity}"`);

    // 1. Generate nearby suburbs & neighborhoods via Gemini
    const promptText = `You are a local SEO expert specializing in geo-targeting schemas.
List the major surrounding cities/towns and distinct neighborhoods for the following location:
- Location: ${targetCity}

Provide accurate, real local names. Do not hallucinate.`;

    const aiRes = await ai.generate({
      model: 'vertexai/gemini-2.5-flash',
      prompt: promptText,
      output: {
        schema: GeoSiloOutputSchema,
      },
    });

    const geoData = aiRes.output;
    if (!geoData) {
      throw new Error('AI failed to generate geo-silo data.');
    }

    // 2. Format Google Maps search URLs
    const surroundingCities = (geoData.surroundingCities || []).map((name) => ({
      name,
      mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${serviceName}`)}`,
    }));

    const neighborhoods = (geoData.neighborhoods || []).map((name) => ({
      name,
      mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${targetCity} ${serviceName}`)}`,
    }));

    // 3. Generate cross-linking network links from other owned sites in Firestore
    console.log('[seo-generation] Generating network interlinking across active websites...');
    const allProfilesSnap = await db.collection('businessProfiles').get();
    const networkLinks: Array<{ anchor: string; url: string }> = [];

    for (const doc of allProfilesSnap.docs) {
      // Exclude self, and only include profiles with a customDomain configured
      if (doc.id !== userId) {
        const data = doc.data();
        if (data.customDomain && data.customDomain.trim().length > 0) {
          const domain = data.customDomain.trim();
          const businessName = data.businessName || 'Partner Business';
          const niche = data.service || data.niche || 'Local Services';
          const city = data.targetCity || 'Tampa, FL';
          
          networkLinks.push({
            anchor: `${niche} in ${city.split(',')[0]} (${businessName})`,
            url: `https://${domain}`,
          });
        }
      }
    }

    // Limit network links to 4 random partner websites to create a natural linking pattern
    const shuffledNetwork = networkLinks.sort(() => 0.5 - Math.random()).slice(0, 4);

    const localSeoData = {
      surroundingCities,
      neighborhoods,
      networkLinks: shuffledNetwork,
      generatedAt: new Date().toISOString(),
    };

    console.log(`[seo-generation] Generated: ${surroundingCities.length} cities, ${neighborhoods.length} neighborhoods, ${shuffledNetwork.length} network links.`);

    // 4. Update the Firestore profile
    await profileRef.update({
      localSeoData,
      updatedAt: new Date().toISOString(),
    });

    revalidatePath(`/pages/${userId}`);
    if (profile.customDomain) {
      revalidatePath(`/custom-domain/${profile.customDomain}`);
    }

    return { success: true, localSeoData };
  } catch (error: any) {
    console.error('Error generating Local SEO strategy:', error);
    return { success: false, error: error.message || 'Failed to generate Local SEO strategy' };
  }
}
