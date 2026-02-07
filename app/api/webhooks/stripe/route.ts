import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { clerkClient } from '@clerk/nextjs/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Keine Stripe-Signatur' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook-Signatur-Fehler:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const clerkUserId = session.metadata?.clerkUserId;

        if (clerkUserId) {
          await clerkClient.users.updateUserMetadata(clerkUserId, {
            publicMetadata: {
              subscriptionStatus: 'trialing',
              stripeCustomerId: session.customer,
              trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
          });
          console.log('✅ Trial started for user:', clerkUserId);
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const customer = await stripe.customers.retrieve(customerId);
        if ('metadata' in customer) {
          const clerkUserId = customer.metadata?.clerkUserId;

          if (clerkUserId) {
            const status = subscription.status === 'active' || subscription.status === 'trialing' 
              ? 'active' 
              : 'inactive';

            await clerkClient.users.updateUserMetadata(clerkUserId, {
              publicMetadata: {
                subscriptionStatus: status,
                stripeCustomerId: customerId,
                subscriptionId: subscription.id,
              },
            });
            console.log('✅ Subscription updated for user:', clerkUserId, 'Status:', status);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const customer = await stripe.customers.retrieve(customerId);
        if ('metadata' in customer) {
          const clerkUserId = customer.metadata?.clerkUserId;

          if (clerkUserId) {
            await clerkClient.users.updateUserMetadata(clerkUserId, {
              publicMetadata: {
                subscriptionStatus: 'inactive',
              },
            });
            console.log('✅ Subscription cancelled for user:', clerkUserId);
          }
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook-Fehler' },
      { status: 500 }
    );
  }
}
