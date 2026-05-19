import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-04-22.dahlia',
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Look up or create Stripe customer
    const profileDoc = await db.collection('businessProfiles').doc(userId).get();
    const profile = profileDoc.data();
    let customerId = profile?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { firebaseUserId: userId },
        email: profile?.contactEmail || undefined,
      });
      customerId = customer.id;

      await db.collection('businessProfiles').doc(userId).set(
        { stripeCustomerId: customerId },
        { merge: true }
      );
    }

    // Create a SetupIntent for the customer
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    });

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      customerId,
    });
  } catch (error: any) {
    console.error('[Stripe] Error creating setup intent:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
