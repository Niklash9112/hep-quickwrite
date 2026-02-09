import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

const FREE_REPORT_LIMIT = 3;

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    // Fall 1: Eingeloggter User
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

    // Fall 2: Anonymer User (Cookie-basiert)
    const cookies = request.cookies;
    const anonReportCount = parseInt(cookies.get('anonReportCount')?.value || '0', 10);
    const newAnonCount = anonReportCount + 1;

    const response = NextResponse.json({ 
      reportCount: newAnonCount, 
      limitReached: newAnonCount >= FREE_REPORT_LIMIT,
      isAnonymous: true 
    });

    // Setze Cookie (7 Tage gültig)
    response.cookies.set('anonReportCount', newAnonCount.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 Tage
    });

    return response;
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

    // Fall 1: Eingeloggter User
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

    // Fall 2: Anonymer User (Cookie-basiert)
    const cookies = request.cookies;
    const anonReportCount = parseInt(cookies.get('anonReportCount')?.value || '0', 10);

    return NextResponse.json({ 
      reportCount: anonReportCount, 
      limitReached: anonReportCount >= FREE_REPORT_LIMIT,
      isAnonymous: true 
    });
  } catch (error: any) {
    console.error('Get Report Count Error:', error);
    return NextResponse.json(
      { error: error.message || 'Tracking-Fehler' },
      { status: 500 }
    );
  }
}
