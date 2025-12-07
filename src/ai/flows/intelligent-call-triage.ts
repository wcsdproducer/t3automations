'use server';

/**
 * @fileOverview A flow for intelligent call triage, understanding caller intent and routing the call to the appropriate department.
 *
 * - intelligentCallTriage - A function that handles the intelligent call triage process.
 * - IntelligentCallTriageInput - The input type for the intelligentCallTriage function.
 * - IntelligentCallTriageOutput - The return type for the intelligentCallTriage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentCallTriageInputSchema = z.object({
  callTranscript: z
    .string()
    .describe('The transcript of the phone call with the customer.'),
  predefinedRules: z
    .string()
    .describe(
      'Predefined rules for routing calls based on intent and other criteria.'
    ),
});
export type IntelligentCallTriageInput = z.infer<typeof IntelligentCallTriageInputSchema>;

const IntelligentCallTriageOutputSchema = z.object({
  intent: z.string().describe('The identified intent of the caller.'),
  department:
    z.string()
    .describe(
      'The department or personnel to which the call should be routed.'
    ),
  notes: z.string().describe('Additional notes or information about the call.'),
});
export type IntelligentCallTriageOutput = z.infer<typeof IntelligentCallTriageOutputSchema>;

export async function intelligentCallTriage(
  input: IntelligentCallTriageInput
): Promise<IntelligentCallTriageOutput> {
  return intelligentCallTriageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentCallTriagePrompt',
  input: {schema: IntelligentCallTriageInputSchema},
  output: {schema: IntelligentCallTriageOutputSchema},
  prompt: `You are an AI assistant specializing in call triage. Analyze the call transcript and determine the caller's intent and the appropriate department to route the call to based on the predefined rules.\n\nCall Transcript:\n{{callTranscript}}\n\nPredefined Rules:\n{{predefinedRules}}\n\nBased on the call transcript and predefined rules, extract the intent of the caller, determine the appropriate department to route the call to, and provide any relevant notes.\n\nIntent: {{intent}}\nDepartment: {{department}}\nNotes: {{notes}}`,
});

const intelligentCallTriageFlow = ai.defineFlow(
  {
    name: 'intelligentCallTriageFlow',
    inputSchema: IntelligentCallTriageInputSchema,
    outputSchema: IntelligentCallTriageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
