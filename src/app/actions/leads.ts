'use server';

import { admin } from '@/lib/firebase-admin';
import { z } from 'zod';
import { triggerLeadAlerts } from '@/lib/alerts';

const leadSchema = z.object({
  businessProfileId: z.string().min(1, 'Business profile ID is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export async function submitLead(formData: z.infer<typeof leadSchema>) {
  try {
    const validatedData = leadSchema.parse(formData);
    const db = admin.firestore();
    
    const leadRef = db
      .collection('businessProfiles')
      .doc(validatedData.businessProfileId)
      .collection('leads')
      .doc();

    const newLead = {
      id: leadRef.id,
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone || '',
      source: 'landing-page',
      status: 'new',
      notes: validatedData.notes || '',
      agentSummary: '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await leadRef.set(newLead);

    // Trigger alerts in background
    triggerLeadAlerts(validatedData.businessProfileId, newLead).catch(err => {
      console.error('Failed to trigger lead alert:', err);
    });

    return { success: true };
  } catch (error) {
    console.error('Error submitting lead:', error);
    return { success: false, error: 'Failed to submit lead' };
  }
}
