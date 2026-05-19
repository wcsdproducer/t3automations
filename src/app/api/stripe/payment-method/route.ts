import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-04-22.dahlia',
});

// GET — fetch the customer's default payment method
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Look up Stripe customer ID from Firestore
    const profileDoc = await db.collection('businessProfiles').doc(userId).get();
    const profile = profileDoc.data();
    const customerId = profile?.stripeCustomerId;

    if (!customerId) {
      return NextResponse.json({ paymentMethod: null });
    }

    // Get the customer's default payment method
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
    
    if (customer.deleted) {
      return NextResponse.json({ paymentMethod: null });
    }

    const defaultPmId = typeof customer.invoice_settings?.default_payment_method === 'string'
      ? customer.invoice_settings.default_payment_method
      : customer.invoice_settings?.default_payment_method?.id;

    if (!defaultPmId) {
      // Try to get any attached payment method
      const methods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
        limit: 1,
      });

      if (methods.data.length === 0) {
        return NextResponse.json({ paymentMethod: null });
      }

      const pm = methods.data[0];
      return NextResponse.json({
        paymentMethod: {
          id: pm.id,
          brand: pm.card?.brand || 'unknown',
          last4: pm.card?.last4 || '****',
          expMonth: pm.card?.exp_month,
          expYear: pm.card?.exp_year,
        },
      });
    }

    const pm = await stripe.paymentMethods.retrieve(defaultPmId);
    return NextResponse.json({
      paymentMethod: {
        id: pm.id,
        brand: pm.card?.brand || 'unknown',
        last4: pm.card?.last4 || '****',
        expMonth: pm.card?.exp_month,
        expYear: pm.card?.exp_year,
      },
    });
  } catch (error: any) {
    console.error('[Stripe] Error fetching payment method:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — attach a new payment method and set as default
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, paymentMethodId } = body;

    if (!userId || !paymentMethodId) {
      return NextResponse.json({ error: 'userId and paymentMethodId are required' }, { status: 400 });
    }

    // Look up or create Stripe customer
    const profileDoc = await db.collection('businessProfiles').doc(userId).get();
    const profile = profileDoc.data();
    let customerId = profile?.stripeCustomerId;

    if (!customerId) {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        metadata: { firebaseUserId: userId },
        email: profile?.contactEmail || undefined,
      });
      customerId = customer.id;

      // Save to Firestore
      await db.collection('businessProfiles').doc(userId).set(
        { stripeCustomerId: customerId },
        { merge: true }
      );
    }

    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set as default
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Get card details to return
    const pm = await stripe.paymentMethods.retrieve(paymentMethodId);

    return NextResponse.json({
      success: true,
      paymentMethod: {
        id: pm.id,
        brand: pm.card?.brand || 'unknown',
        last4: pm.card?.last4 || '****',
        expMonth: pm.card?.exp_month,
        expYear: pm.card?.exp_year,
      },
    });
  } catch (error: any) {
    console.error('[Stripe] Error attaching payment method:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
