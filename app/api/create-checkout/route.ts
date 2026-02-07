import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail } = await request.json();

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'User ID und Email erforderlich' },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      console.log('⚠️ Stripe nicht konfiguriert');
      return NextResponse.json({ needsConfig: true }, { status: 200 });
    }

    let customer;
    const existingCustomers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          clerkUserId: userId,
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          clerkUserId: userId,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://hep-quickwrite.vercel.app'}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://hep-quickwrite.vercel.app'}?canceled=true`,
      metadata: {
        clerkUserId: userId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json(
      { error: error.message || 'Checkout-Fehler' },
      { status: 500 }
    );
  }
}
