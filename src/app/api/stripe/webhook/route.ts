import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-04-22.dahlia',
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (error: any) {
    console.error(`Webhook signature verification failed: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      
      if (userId) {
        await db.collection('businessProfiles').doc(userId).set({
          subscriptionStatus: 'active',
          stripeSubscriptionId: session.subscription,
          stripeCustomerId: session.customer,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      
      const profilesSnapshot = await db.collection('businessProfiles')
        .where('stripeSubscriptionId', '==', subscription.id)
        .get();
        
      if (!profilesSnapshot.empty) {
        const docId = profilesSnapshot.docs[0].id;
        await db.collection('businessProfiles').doc(docId).update({
          subscriptionStatus: 'canceled',
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return new NextResponse('Webhook handled successfully', { status: 200 });
  } catch (error: any) {
    console.error('Error handling webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
