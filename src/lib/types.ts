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
