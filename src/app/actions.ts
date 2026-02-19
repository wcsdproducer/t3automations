'use server';

import {
  intelligentCallTriage,
  IntelligentCallTriageOutput,
} from '@/ai/flows/intelligent-call-triage';
import {
  qualifyLeadAndRoute,
  LeadQualificationOutput,
} from '@/ai/flows/lead-qualification-and-routing';
import { leadQualificationSchema, contactFormSchema, assessmentFormSchema } from '@/lib/types';
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

interface ContactFormState {
  message: string;
  errors?: {
      name?: string[];
      email?: string[];
      message?: string[];
  };
  success: boolean;
}

export async function handleContactForm(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const validatedFields = contactFormSchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
  });

  if (!validatedFields.success) {
      return {
          errors: validatedFields.error.flatten().fieldErrors,
          message: 'Please fill out all the fields.',
          success: false,
      };
  }

  const { name, email, message } = validatedFields.data;

  // This is where you would integrate with an email sending service like SendGrid, Resend, etc.
  // For demonstration purposes, we are logging to the console.
  console.log('--- Website Inquiry ---');
  console.log(`To: info@t3automations.com`);
  console.log(`Subject: Website Inquiry`);
  console.log(`From: ${name} <${email}>`);
  console.log(`Message: ${message}`);
  console.log('---------------------');

  return { message: 'Email Sent Successfully!', success: true, errors: undefined };
}

interface AssessmentFormState {
    message: string;
    errors?: {
        name?: string[];
        email?: string[];
        phone?: string[];
        comment?: string[];
    };
    success: boolean;
}

export async function handleAssessmentForm(
    prevState: AssessmentFormState,
    formData: FormData
): Promise<AssessmentFormState> {
    const validatedFields = assessmentFormSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        comment: formData.get('comment'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Please fill out all fields.',
            success: false,
        };
    }

    const { name, email, phone, comment } = validatedFields.data;

    // TODO: Integrate with a backend service to store the assessment data
    console.log('--- Assessment Submission ---');
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Phone: ${phone}`);
    console.log(`Comment: ${comment}`);
    console.log('---------------------------');

    return { message: 'Assessment submitted successfully!', success: true, errors: undefined };
}
