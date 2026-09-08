import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-02-24.acacia',
  });
}

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
    const existingCustomers = await getStripe().customers.list({
      email: userEmail,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await getStripe().customers.create({
        email: userEmail,
        metadata: {
          clerkUserId: userId,
        },
      });
    }

    // Erstelle Checkout Session mit deutschen Zahlungsmethoden
    const session = await getStripe().checkout.sessions.create({
      customer: customer.id,
      payment_method_types: [
        'card',           // Kreditkarte
        'paypal',         // PayPal
        'sepa_debit',     // SEPA Lastschrift (sehr beliebt in DE!)
      ],
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
      // Automatisches Anzeigen von digitalen Wallets (Google Pay, Apple Pay)
      automatic_tax: { enabled: false },
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
