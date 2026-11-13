import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

const ADMIN_EMAIL = 'niklas.h112@gmail.com';

// Begrüßung für neue Nutzer:innen — EINMALIG.
// Ob sie schon gezeigt wurde, steht in den Clerk-Metadaten (publicMetadata.welcomeSeen).
// Bewusst nicht nur im localStorage: sonst poppt der Text auf jedem neuen Gerät erneut auf.
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Login erforderlich', requiresLogin: true }, { status: 401 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress;

    // Der Betreiber kennt den Text — bei ihm nicht anzeigen.
    if (email === ADMIN_EMAIL) {
      return NextResponse.json({ zeigen: false });
    }

    return NextResponse.json({ zeigen: user.publicMetadata.welcomeSeen !== true });
  } catch (error: any) {
    console.error('Welcome GET Error:', error);
    // Im Zweifel NICHT begrüßen: eine fehlende Begrüßung ist harmlos, eine bei jedem
    // Seitenaufruf aufpoppende ist nervig.
    return NextResponse.json({ zeigen: false, error: error.message || 'Fehler' }, { status: 200 });
  }
}

// Vermerkt, dass die Begrüßung gesehen wurde.
export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Login erforderlich', requiresLogin: true }, { status: 401 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    // Spread, weil Clerk beim PATCH merged — so bleibt der restliche Stand sicher erhalten.
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { ...user.publicMetadata, welcomeSeen: true },
    });

    return NextResponse.json({ gespeichert: true });
  } catch (error: any) {
    console.error('Welcome POST Error:', error);
    return NextResponse.json({ error: error.message || 'Fehler' }, { status: 500 });
  }
}
