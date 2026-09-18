import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

const FREE_REPORT_LIMIT = 3;

// Admin-Account zählt in reportCount (Gesamt-Nutzung fürs Admin-Panel),
// aber das Freemium-Limit (limitReached) bleibt für Admin aufgehoben.
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

    if (isAdminEmail(user)) {
      // Admin zählt mit, aber Limit bleibt aufgehoben (nie Paywall)
      const currentCount = (user.publicMetadata.reportCount as number) || 0;
      const newCount = currentCount + 1;
      await client.users.updateUserMetadata(clerkUserId, {
        publicMetadata: { ...user.publicMetadata, reportCount: newCount },
      });
      return NextResponse.json({
        reportCount: newCount,
        limitReached: false,
        isAdmin: true,
      });
    }

    // Prüfe Abo-Status (zahlende User: unbegrenzt)
    const subscriptionStatus = user.publicMetadata.subscriptionStatus as string | undefined;
    if (subscriptionStatus === 'active') {
      return NextResponse.json({
        reportCount: 0,
        limitReached: false,
        hasSubscription: true,
      });
    }

    // Freemium-User: Counter erhöhen
    const currentCount = (user.publicMetadata.reportCount as number) || 0;
    const newCount = currentCount + 1;
    await client.users.updateUserMetadata(clerkUserId, {
      publicMetadata: { ...user.publicMetadata, reportCount: newCount },
    });
    return NextResponse.json({
      reportCount: newCount,
      limitReached: newCount >= FREE_REPORT_LIMIT,
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

    if (isAdminEmail(user)) {
      // Admin: lesen, Limit aufgehoben
      const currentCount = (user.publicMetadata.reportCount as number) || 0;
      return NextResponse.json({
        reportCount: currentCount,
        limitReached: false,
        isAdmin: true,
      });
    }

    // Prüfe Abo-Status (zahlende User: unbegrenzt)
    const subscriptionStatus = user.publicMetadata.subscriptionStatus as string | undefined;
    if (subscriptionStatus === 'active') {
      return NextResponse.json({
        reportCount: 0,
        limitReached: false,
        hasSubscription: true,
      });
    }

    const currentCount = (user.publicMetadata.reportCount as number) || 0;
    return NextResponse.json({
      reportCount: currentCount,
      limitReached: currentCount >= FREE_REPORT_LIMIT,
    });
  } catch (error: any) {
    console.error('Get Report Count Error:', error);
    return NextResponse.json(
      { error: error.message || 'Tracking-Fehler' },
      { status: 500 }
    );
  }
}
