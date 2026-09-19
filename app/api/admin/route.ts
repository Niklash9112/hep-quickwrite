import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

const ADMIN_EMAIL = 'niklas.h112@gmail.com';

export async function GET(request: NextRequest) {
  // Admin-only
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Login erforderlich' }, { status: 401 });

  const client = await clerkClient();
  let me;
  try {
    me = await client.users.getUser(userId);
  } catch {
    return NextResponse.json({ error: 'Fehler' }, { status: 500 });
  }
  const myEmail = me.primaryEmailAddress?.emailAddress || me.emailAddresses[0]?.emailAddress || '';
  if (myEmail !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Nur für Admin' }, { status: 403 });
  }

  try {
    // Alle User laden (max 500; paginieren reicht für aktuellen Stand)
    const userList = await client.users.getUserList({ limit: 500 });
    const userListData = userList.data || userList;
    const now = Date.now();
    let abonnenten = 0;
    let neueAnmeldungen30 = 0;
    let summeNutzung = 0;

    const users = userListData.map((u) => {
      const email = u.primaryEmailAddress?.emailAddress || u.emailAddresses[0]?.emailAddress || '';
      const meta = u.publicMetadata || {};
      const sub = meta.subscriptionStatus;
      const subActive = sub === 'active' || sub === 'Active';
      if (subActive) abonnenten++;
      const createdAt = Number(u.createdAt) || (typeof u.createdAt === 'number' ? u.createdAt : 0);
      if (createdAt > 0 && now - createdAt < 30 * 24 * 3600 * 1000) neueAnmeldungen30++;
      const count = Number(meta.reportCount) || 0;
      summeNutzung += count;
      // Leere Identifikation abfangen: nie Blank-Zeilen, immer ein erkennbarer Wert
      const displayName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || email || '(ohne Name)';
      const displayEmail = email || '(keine E-Mail – ID ' + u.id.slice(-8) + ')';
      return {
        id: u.id,
        email: displayEmail,
        name: displayName,
        subscriptionStatus: subActive ? 'active' : (sub || 'none'),
        reportCount: count,
        createdAt: createdAt / 1000,
      };
    });

    return NextResponse.json({
      totalUsers: users.length,
      abonnenten,
      neueAnmeldungen30,
      summeNutzung,
      nutzungGesamt: summeNutzung,
      users,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Fehler beim Laden der User' },
      { status: 500 }
    );
  }
}
