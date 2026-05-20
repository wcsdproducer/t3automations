import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2026-04-22.dahlia',
    });

    const body = await req.json();
    const { userId, userEmail, renterId, price } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const rentAmount = price ? Math.round(Number(price) * 100) : 149700;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: userEmail,
      client_reference_id: userId,
      metadata: renterId ? { renterId } : undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'T3 Automations Pro Subscription',
              description: 'Includes a dedicated phone number and unlimited minutes for your AI agent.',
            },
            unit_amount: rentAmount,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: renterId
        ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/onboarding/${userId}?success=true`
        : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/dashboard/${userId}/billing?success=true`,
      cancel_url: renterId
        ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/marketplace?canceled=true`
        : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/dashboard/${userId}/billing?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
