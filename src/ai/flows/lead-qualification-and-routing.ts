'use server';

/**
 * @fileOverview This file defines a Genkit flow for lead qualification and routing.
 *
 * The flow qualifies leads based on predefined criteria and routes qualified leads to the sales team,
 * while filtering out unqualified ones.
 *
 * @ExportedInterface LeadQualificationInput - The input type for the lead qualification flow.
 * @ExportedInterface LeadQualificationOutput - The output type for the lead qualification flow.
 * @ExportedFunction qualifyLeadAndRoute - The main function to qualify and route leads.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LeadQualificationInputSchema = z.object({
  callerName: z.string().describe('The name of the caller.'),
  callerPhoneNumber: z.string().describe('The phone number of the caller.'),
  callerEmail: z.string().email().optional().describe('The email address of the caller, if available.'),
  companyName: z.string().describe('The name of the company the caller represents.'),
  jobTitle: z.string().describe('The job title of the caller.'),
  reasonForCalling: z.string().describe('The reason the caller is calling.'),
  predefinedCriteria: z.string().describe('Predefined criteria for lead qualification. Comma separated'),
});

export type LeadQualificationInput = z.infer<typeof LeadQualificationInputSchema>;

const LeadQualificationOutputSchema = z.object({
  isQualified: z.boolean().describe('Whether the lead is qualified based on the predefined criteria.'),
  qualificationReason: z.string().describe('The reason for the qualification decision.'),
  routingInstructions: z.string().describe('Instructions for routing the lead, including the sales team to route to if qualified.'),
});

export type LeadQualificationOutput = z.infer<typeof LeadQualificationOutputSchema>;

export async function qualifyLeadAndRoute(input: LeadQualificationInput): Promise<LeadQualificationOutput> {
  return leadQualificationAndRoutingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'leadQualificationAndRoutingPrompt',
  input: {schema: LeadQualificationInputSchema},
  output: {schema: LeadQualificationOutputSchema},
  prompt: `You are an AI-powered lead qualification and routing system.

You will receive information about a caller and their reason for calling. Your task is to determine if the lead is qualified based on predefined criteria and provide routing instructions.

Here's the caller information:
- Caller Name: {{{callerName}}}
- Caller Phone Number: {{{callerPhoneNumber}}}
- Caller Email: {{{callerEmail}}}
- Company Name: {{{companyName}}}
- Job Title: {{{jobTitle}}}
- Reason for Calling: {{{reasonForCalling}}}

Here are the predefined lead qualification criteria: {{{predefinedCriteria}}}

Based on this information, determine if the lead is qualified. Provide a clear reason for your decision and detailed routing instructions, including which sales team to route the lead to if qualified.`,
});

const leadQualificationAndRoutingFlow = ai.defineFlow(
  {
    name: 'leadQualificationAndRoutingFlow',
    inputSchema: LeadQualificationInputSchema,
    outputSchema: LeadQualificationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
