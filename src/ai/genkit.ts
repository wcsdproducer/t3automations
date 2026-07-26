import { genkit } from 'genkit';
import { vertexAI } from '@genkit-ai/vertexai';
import { anthropic } from 'genkitx-anthropic';

export const ai = genkit({
  plugins: [
    vertexAI({
      location: 'us-central1',
      projectId: 'studio-1410114603-9e1f6',
    }),
    anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || 'dummy-key',
    }),
  ],
  model: 'vertexai/gemini-1.5-flash',
});
