import { genkit } from 'genkit';
import { vertexAI } from '@genkit-ai/vertexai';
import { anthropic } from 'genkitx-anthropic';

export const ai = genkit({
  plugins: [
    vertexAI({
      location: 'us-central1',
    }),
    anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || 'dummy-key',
    }),
  ],
  model: 'vertexai/gemini-1.5-flash',
});
