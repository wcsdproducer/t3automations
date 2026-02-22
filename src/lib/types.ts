import { z } from 'zod';

export const leadQualificationSchema = z.object({
  callerName: z.string().min(2, 'Name must be at least 2 characters.'),
  callerPhoneNumber: z.string().min(10, 'Please enter a valid phone number.'),
  callerEmail: z.string().email('Please enter a valid email address.').optional().or(z.literal('')),
  companyName: z.string().min(2, 'Company name must be at least 2 characters.'),
  jobTitle: z.string().min(2, 'Job title must be at least 2 characters.'),
  reasonForCalling: z.string().min(10, 'Please provide a reason for calling.'),
  predefinedCriteria: z.string().min(10, 'Please provide qualification criteria.'),
});

export const contactFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  email: z.string().email({ message: "A valid email is required." }),
  message: z.string().min(1, { message: "Message is required." }),
});

export const assessmentFormSchema = z.object({
    name: z.string().min(1, { message: "Name is required." }),
    email: z.string().email({ message: "A valid email is required." }),
    phone: z.string().optional(),
    comment: z.string().optional(),
});

export const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  targetLanguage: z
    .string()
    .describe('The target language for translation (e.g., "Spanish", "French").'),
});

export const TranslateTextOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});

export const BatchTranslateTextInputSchema = z.object({
  texts: z.array(z.string()).describe('The texts to be translated.'),
  targetLanguage: z
    .string()
    .describe('The target language for translation (e.g., "Spanish", "French").'),
});

export const BatchTranslateTextOutputSchema = z.object({
  translatedTexts: z.array(z.string()).describe('The translated texts.'),
});
