import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Login erforderlich' }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'id fehlt' }, { status: 400 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const reports = (user.publicMetadata.reports as any[]) || [];
    const updated = reports.filter((r) => r.id !== id);

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...user.publicMetadata,
        reports: updated,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete Report Error:', error);
    return NextResponse.json({ error: error.message || 'Fehler' }, { status: 500 });
  }
}
