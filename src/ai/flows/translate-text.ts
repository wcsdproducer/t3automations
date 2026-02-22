'use server';

/**
 * @fileOverview A flow for translating text to a specified language.
 *
 * - translateText - A function that handles single text translation.
 * - batchTranslateText - A function that handles batch text translation.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 * - BatchTranslateTextInput - The input type for the batchTranslateText function.
 * - BatchTranslateTextOutput - The return type for the batchTranslateText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { 
  TranslateTextInputSchema, 
  TranslateTextOutputSchema,
  BatchTranslateTextInputSchema,
  BatchTranslateTextOutputSchema,
} from '@/lib/types';

export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;
export type BatchTranslateTextInput = z.infer<typeof BatchTranslateTextInputSchema>;
export type BatchTranslateTextOutput = z.infer<typeof BatchTranslateTextOutputSchema>;

export async function translateText(
  input: TranslateTextInput
): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

export async function batchTranslateText(
  input: BatchTranslateTextInput
): Promise<BatchTranslateTextOutput> {
  return batchTranslateTextFlow(input);
}

const translateTextPrompt = ai.definePrompt({
  name: 'translateTextPrompt',
  input: { schema: TranslateTextInputSchema },
  output: { schema: TranslateTextOutputSchema },
  prompt: `Translate the following text to {{targetLanguage}}. Only return the translated text.

Text to translate:
"{{{text}}}"
`,
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async (input) => {
    const { output } = await translateTextPrompt(input);
    return output!;
  }
);


const batchTranslateTextPrompt = ai.definePrompt({
  name: 'batchTranslateTextPrompt',
  input: { schema: BatchTranslateTextInputSchema },
  output: { schema: BatchTranslateTextOutputSchema },
  prompt: `Translate the following JSON array of strings to {{targetLanguage}}.
Return a JSON array of the translated strings, maintaining the same order.
Only return the JSON array of translated strings.

Example input: { "texts": ["Hello", "How are you?"], "targetLanguage": "Spanish" }
Example output: { "translatedTexts": ["Hola", "¿Cómo estás?"] }

Texts to translate:
{{{json texts}}}
`,
});

const batchTranslateTextFlow = ai.defineFlow(
  {
    name: 'batchTranslateTextFlow',
    inputSchema: BatchTranslateTextInputSchema,
    outputSchema: BatchTranslateTextOutputSchema,
  },
  async (input) => {
    // In case the model fails to return valid JSON, we have a fallback.
    try {
       const { output } = await batchTranslateTextPrompt(input);
       if (output?.translatedTexts && output.translatedTexts.length === input.texts.length) {
         return output;
       }
    } catch(e) {
      console.error("Batch translation failed, falling back to individual translations.", e);
    }
    
    // Fallback to individual translations if batch fails
    const translations = await Promise.all(
      input.texts.map(text => translateText({ text, targetLanguage: input.targetLanguage }))
    );
    return { translatedTexts: translations.map(t => t.translatedText) };
  }
);
