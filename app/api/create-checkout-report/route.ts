import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-02-24.acacia',
  });
}

/** Preis pro Einzelbericht in Cent (Niklas' Entscheidung 07.11.2026: 2 €). */
const PREIS_CENT = 200;

/**
 * Einzelkauf eines Berichts (2 €, kein Abo). Der Kauf legt Guthaben an: der Stripe-Webhook
 * (`checkout.session.completed` mit metadata.kauf === 'report') zählt `creditReports` hoch,
 * `/api/generate` verbraucht beim Erstellen einen. Abo bleibt unabhängig bestehen.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail } = await request.json();

    if (!userId || !userEmail) {
      return NextResponse.json({ error: 'User ID und Email erforderlich' }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      console.log('⚠️ Stripe nicht konfiguriert');
      return NextResponse.json({ needsConfig: true }, { status: 200 });
    }

    const stripe = getStripe();
    let customer;
    const bestehende = await stripe.customers.list({ email: userEmail, limit: 1 });
    if (bestehende.data.length > 0) {
      customer = bestehende.data[0];
    } else {
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: { clerkUserId: userId },
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hep-quickwrite.vercel.app';

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      // sepa_debit ist im Konto nicht aktiviert und liess den Checkout mit HTTP 400 scheitern
      // (verifiziert 14.10.2026) — nur die tatsächlich aktiven Zahlarten anbieten.
      payment_method_types: ['card', 'paypal'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: PREIS_CENT,
            product_data: {
              name: 'HEP-QuickWrite – ein Bericht',
              description: 'Einmaliger Bericht über die Web-App, kein Abo, unbegrenzt gültig',
            },
          },
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}?credits=1`,
      cancel_url: `${appUrl}?canceled=true`,
      metadata: {
        clerkUserId: userId,
        kauf: 'report',
        berichte: '1',
      },
      automatic_tax: { enabled: false },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Einzelkauf-Fehler:', error);
    return NextResponse.json({ error: error.message || 'Checkout-Fehler' }, { status: 500 });
  }
}
