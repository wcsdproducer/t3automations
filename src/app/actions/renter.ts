'use server';

import { admin, db } from '@/lib/firebase-admin';

// Server Action to create a renter account and associate it with a business profile
export async function createRenterAccountAction(
  prevState: any,
  formData: FormData
) {
  const businessName = formData.get('businessName') as string;
  const niche = formData.get('niche') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const landlordUid = formData.get('landlordUid') as string;

  if (!businessName || !email || !password || !landlordUid) {
    return { success: false, message: 'All fields are required.' };
  }

  try {
    // 1. Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: businessName,
    });

    const userId = userRecord.uid;

    // 2. Create users/{userId} doc
    await db.collection('users').doc(userId).set({
      id: userId,
      email,
      role: 'renter',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 3. Create businessProfiles/{userId} doc
    await db.collection('businessProfiles').doc(userId).set({
      id: userId,
      businessName,
      contactEmail: email,
      service: niche || 'Lead Generation Site',
      phoneNumber: '',
      defaultLandingPage: 'template-3',
      ownerId: landlordUid,
      currentRenterId: userId,
      isPubliclyListed: true,
      monthlyRentPrice: 0,
      niche: niche || '',
      leadForwardingEnabled: false,
    });

    // 4. Create standard default assistant/agent skeleton for the new profile
    await db.collection(`businessProfiles/${userId}/agents`).doc('default').set({
      id: 'default',
      businessProfileId: userId,
      elevenLabsAgentId: '',
      name: `${businessName} Voice Assistant`,
      systemPrompt: `You are a helpful, professional scheduling voice agent for ${businessName}. Your goal is to gather caller name, phone number, interest, and schedule them into the calendar.`,
      firstMessage: `Hello, thanks for calling ${businessName}! How can I help you today?`,
      voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel
      status: 'active',
      createdAt: new Date().toISOString()
    });

    return { success: true, message: `Account and profile created successfully for ${email}.`, userId };
  } catch (error: any) {
    console.error('Error in createRenterAccountAction:', error);
    return { success: false, message: error.message || 'An error occurred during account creation.' };
  }
}
