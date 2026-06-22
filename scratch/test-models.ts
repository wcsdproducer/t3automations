import { genkit } from 'genkit';
import { vertexAI } from '@genkit-ai/google-genai';

async function testModel(modelName: string) {
  console.log(`Testing model: ${modelName}...`);
  const ai = genkit({
    plugins: [
      vertexAI({
        projectId: 'studio-1410114603-9e1f6',
        location: 'us-central1',
      }),
    ],
  });

  try {
    const response = await ai.generate({
      model: `vertexai/${modelName}`,
      prompt: 'Hello, respond with exactly "success" if you receive this.',
    });
    console.log(`Model ${modelName} SUCCESS:`, response.text);
  } catch (error: any) {
    console.error(`Model ${modelName} FAILED:`, error.message || error);
  }
}

async function run() {
  await testModel('gemini-2.5-flash');
  await testModel('gemini-2.0-flash');
  await testModel('gemini-1.5-flash');
}

run();
