'use server';

import {
  intelligentCallTriage,
  IntelligentCallTriageOutput,
} from '@/ai/flows/intelligent-call-triage';
import {
  qualifyLeadAndRoute,
  LeadQualificationOutput,
} from '@/ai/flows/lead-qualification-and-routing';
import { leadQualificationSchema } from '@/lib/types';
import { z } from 'zod';

interface CallTriageState {
  message: string;
  data: IntelligentCallTriageOutput | null;
}

export async function handleCallTriage(
  prevState: CallTriageState,
  formData: FormData
): Promise<CallTriageState> {
  const callTranscript = formData.get('callTranscript') as string;
  const predefinedRules = formData.get('predefinedRules') as string;

  if (!callTranscript || !predefinedRules) {
    return { message: 'Missing required fields: Transcript and Rules are required.', data: null };
  }

  try {
    const result = await intelligentCallTriage({ callTranscript, predefinedRules });
    return { message: 'Triage complete', data: result };
  } catch (error) {
    console.error(error);
    return { message: 'An error occurred during triage. Please try again.', data: null };
  }
}


interface LeadQualificationState {
  message: string;
  data: LeadQualificationOutput | null;
  errors?: {
    [key: string]: string[] | undefined;
  };
}

export async function handleLeadQualification(
  prevState: LeadQualificationState,
  data: z.infer<typeof leadQualificationSchema>
): Promise<LeadQualificationState> {
  const validatedFields = leadQualificationSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Qualify Lead.',
      data: null,
    };
  }

  try {
    const result = await qualifyLeadAndRoute(validatedFields.data);
    return { message: 'Lead qualification complete', data: result };
  } catch (error) {
    console.error(error);
    return { message: 'An error occurred during qualification. Please try again.', data: null };
  }
}
