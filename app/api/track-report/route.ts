import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

const FREE_REPORT_LIMIT = 3;

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    // Login-Zwang: Nur eingeloggte User dürfen Reports erstellen
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Login erforderlich', requiresLogin: true },
        { status: 401 }
      );
    }

    // Eingeloggter User
    if (clerkUserId) {
      const client = await clerkClient();
      const user = await client.users.getUser(clerkUserId);
      
      // Admin bekommt unbegrenzt
      const userEmail = user.primaryEmailAddress?.emailAddress || user.emailAddresses[0].emailAddress;
      if (userEmail === 'niklas.h112@gmail.com') {
        return NextResponse.json({ 
          reportCount: 0, 
          limitReached: false,
          isAdmin: true 
        });
      }

      // Prüfe Abo-Status
      const subscriptionStatus = user.publicMetadata.subscriptionStatus as string | undefined;
      if (subscriptionStatus === 'active') {
        return NextResponse.json({ 
          reportCount: 0, 
          limitReached: false,
          hasSubscription: true 
        });
      }

      // Erhöhe Counter in Clerk Metadata
      const currentCount = (user.publicMetadata.reportCount as number) || 0;
      const newCount = currentCount + 1;

      await client.users.updateUserMetadata(clerkUserId, {
        publicMetadata: {
          ...user.publicMetadata,
          reportCount: newCount,
        },
      });

      return NextResponse.json({ 
        reportCount: newCount, 
        limitReached: newCount >= FREE_REPORT_LIMIT 
      });
    }
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

    // Login-Zwang: Nur eingeloggte User
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Login erforderlich', requiresLogin: true },
        { status: 401 }
      );
    }

    // Eingeloggter User
    if (clerkUserId) {
      const client = await clerkClient();
      const user = await client.users.getUser(clerkUserId);
      
      // Admin bekommt unbegrenzt
      const userEmail = user.primaryEmailAddress?.emailAddress || user.emailAddresses[0].emailAddress;
      if (userEmail === 'niklas.h112@gmail.com') {
        return NextResponse.json({ 
          reportCount: 0, 
          limitReached: false,
          isAdmin: true 
        });
      }

      // Prüfe Abo-Status
      const subscriptionStatus = user.publicMetadata.subscriptionStatus as string | undefined;
      if (subscriptionStatus === 'active') {
        return NextResponse.json({ 
          reportCount: 0, 
          limitReached: false,
          hasSubscription: true 
        });
      }

      // Hole Counter aus Clerk Metadata
      const currentCount = (user.publicMetadata.reportCount as number) || 0;

      return NextResponse.json({ 
        reportCount: currentCount, 
        limitReached: currentCount >= FREE_REPORT_LIMIT 
      });
    }
  } catch (error: any) {
    console.error('Get Report Count Error:', error);
    return NextResponse.json(
      { error: error.message || 'Tracking-Fehler' },
      { status: 500 }
    );
  }
}
