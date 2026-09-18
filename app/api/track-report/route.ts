import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

const FREE_REPORT_LIMIT = 3;

// Admin-Account wird NICHT gezählt und zeigt nie ein Limit/Paywall.
// Alle anderen User (Freemium UND Abonnenten) zählen im reportCount —
// die Gesamt-Nutzung zeigt, wie viele Texte generiert werden (KI-Budget).
function isAdminEmail(user: any): boolean {
  const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress;
  return email === 'niklas.h112@gmail.com';
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Login erforderlich', requiresLogin: true },
        { status: 401 }
      );
    }

    const client = await clerkClient();
    const user = await client.users.getUser(clerkUserId);

    // Admin: wird NICHT gezählt, kein Limit, keine Paywall
    if (isAdminEmail(user)) {
      return NextResponse.json({
        reportCount: 0,
        limitReached: false,
        isAdmin: true,
      });
    }

    // Jeder andere User zählt (Freemium UND Abonnent) — Nutzung = generierte Texte
    const currentCount = (user.publicMetadata.reportCount as number) || 0;
    const newCount = currentCount + 1;
    await client.users.updateUserMetadata(clerkUserId, {
      publicMetadata: { ...user.publicMetadata, reportCount: newCount },
    });

    // Abonnenten: unbegrenzt (kein Limit), zählen aber trotzdem
    const subscriptionStatus = user.publicMetadata.subscriptionStatus as string | undefined;
    const isSubscriber = subscriptionStatus === 'active';

    return NextResponse.json({
      reportCount: newCount,
      limitReached: isSubscriber ? false : newCount >= FREE_REPORT_LIMIT,
      hasSubscription: isSubscriber,
    });
  } catch (error: any) {
    console.error('Track Report Error:', error);
    return NextResponse.json(
      { error: error.message || 'Tracking-Fehler' },
      { status: 500 }
    );
  }
}

// GET: Hole aktuellen Counter-Stand
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Login erforderlich', requiresLogin: true },
        { status: 401 }
      );
    }

    const client = await clerkClient();
    const user = await client.users.getUser(clerkUserId);

    // Admin: nicht gezählt, kein Limit
    if (isAdminEmail(user)) {
      return NextResponse.json({
        reportCount: 0,
        limitReached: false,
        isAdmin: true,
      });
    }

    const currentCount = (user.publicMetadata.reportCount as number) || 0;
    const subscriptionStatus = user.publicMetadata.subscriptionStatus as string | undefined;
    const isSubscriber = subscriptionStatus === 'active';

    return NextResponse.json({
      reportCount: currentCount,
      limitReached: isSubscriber ? false : currentCount >= FREE_REPORT_LIMIT,
      hasSubscription: isSubscriber,
    });
  } catch (error: any) {
    console.error('Get Report Count Error:', error);
    return NextResponse.json(
      { error: error.message || 'Tracking-Fehler' },
      { status: 500 }
    );
  }
}
