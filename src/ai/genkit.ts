import { genkit } from 'genkit';
import { vertexAI } from '@genkit-ai/google-genai';
import { anthropic } from 'genkitx-anthropic';

export const ai = genkit({
  plugins: [
    vertexAI({
      projectId: 'studio-1410114603-9e1f6',
      location: 'us-central1',
    }),
    anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || 'dummy-key',
    }),
  ],
  model: 'vertexai/gemini-2.5-flash',
});
