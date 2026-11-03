import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { berichtLoeschen, berichteLesen } from '@/lib/reports-store';

// POST /api/delete-account — löscht alle Berichte UND das Clerk-Konto.
// Google Play verlangt für Apps mit Benutzerkonten einen Löschweg in der App
// und eine öffentlich erreichbare Web-Seite dafür.
export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Login erforderlich' }, { status: 401 });
    }

    const client = await clerkClient();

    // 1) Berichte entfernen (Blob/Postgres-Pfad)
    let berichteGeloescht = 0;
    const berichte = await berichteLesen(userId, 500);
    if (berichte) {
      for (const b of berichte) {
        const ok = await berichtLoeschen(userId, b.id);
        if (ok) berichteGeloescht++;
      }
    }

    // 2) Clerk-Konto löschen
    await client.users.deleteUser(userId);

    return NextResponse.json({ success: true, berichteGeloescht });
  } catch (error: any) {
    console.error('Delete Account Error:', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'Konto konnte nicht gelöscht werden' },
      { status: 500 }
    );
  }
}
