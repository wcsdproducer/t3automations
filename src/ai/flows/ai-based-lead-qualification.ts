'use server';

/**
 * @fileOverview This file defines a Genkit flow for AI-based lead qualification.
 *
 * The flow qualifies leads based on predefined criteria by asking qualifying questions and analyzing responses.
 *
 * @ExportedInterface AiBasedLeadQualificationInput - The input type for the AI-based lead qualification flow.
 * @ExportedInterface AiBasedLeadQualificationOutput - The output type for the AI-based lead qualification flow.
 * @ExportedFunction aiQualifyLead - The main function to qualify leads using AI.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiBasedLeadQualificationInputSchema = z.object({
  callerName: z.string().describe('The name of the caller.'),
  callerPhoneNumber: z.string().describe('The phone number of the caller.'),
  callerEmail: z.string().email().optional().describe('The email address of the caller, if available.'),
  companyName: z.string().describe('The name of the company the caller represents.'),
  jobTitle: z.string().describe('The job title of the caller.'),
  predefinedCriteria: z.string().describe('Predefined criteria for lead qualification. Comma separated'),
  qualifyingQuestions: z.string().describe('Qualifying questions to ask the lead, comma separated.'),
});

export type AiBasedLeadQualificationInput = z.infer<typeof AiBasedLeadQualificationInputSchema>;

const AiBasedLeadQualificationOutputSchema = z.object({
  isQualified: z.boolean().describe('Whether the lead is qualified based on the predefined criteria and responses to qualifying questions.'),
  qualificationReason: z.string().describe('The reason for the qualification decision based on AI analysis.'),
  nextSteps: z.string().describe('Recommended next steps based on the qualification result, e.g., schedule a meeting with sales.'),
});

export type AiBasedLeadQualificationOutput = z.infer<typeof AiBasedLeadQualificationOutputSchema>;

export async function aiQualifyLead(input: AiBasedLeadQualificationInput): Promise<AiBasedLeadQualificationOutput> {
  return aiBasedLeadQualificationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiBasedLeadQualificationPrompt',
  input: {schema: AiBasedLeadQualificationInputSchema},
  output: {schema: AiBasedLeadQualificationOutputSchema},
  prompt: `You are an AI-powered lead qualification system.

You will receive information about a caller, predefined lead qualification criteria, and a set of qualifying questions. Your task is to analyze the caller's information and responses to the qualifying questions to determine if the lead is qualified. Provide a clear reason for your decision and suggest next steps.

Here's the caller information:
- Caller Name: {{{callerName}}}
- Caller Phone Number: {{{callerPhoneNumber}}}
- Caller Email: {{{callerEmail}}}
- Company Name: {{{companyName}}}
- Job Title: {{{jobTitle}}}

Here are the predefined lead qualification criteria: {{{predefinedCriteria}}}

Here are the qualifying questions:
{{{qualifyingQuestions}}}

Analyze the provided information, consider the predefined criteria and responses to qualifying questions, and determine if the lead is qualified. Provide a detailed reason for your decision, and suggest the next steps based on the outcome.

Is Qualified:
Reason:
Next Steps: `,
});

const aiBasedLeadQualificationFlow = ai.defineFlow(
  {
    name: 'aiBasedLeadQualificationFlow',
    inputSchema: AiBasedLeadQualificationInputSchema,
    outputSchema: AiBasedLeadQualificationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
