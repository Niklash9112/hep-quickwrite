import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

const MAX_REPORTS = 50;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Login erforderlich' }, { status: 401 });
    }

    const { clientName, date, mode, documentType, notes, generatedReport } = await request.json();
    if (!generatedReport) {
      return NextResponse.json({ error: 'generatedReport fehlt' }, { status: 400 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const reports = (user.publicMetadata.reports as any[]) || [];

    const newReport = {
      id: Date.now().toString(),
      clientName: clientName || '',
      date: date || new Date().toISOString(),
      mode,
      documentType,
      notes: notes || '',
      report: generatedReport,
    };

    // Neueste zuerst, max 50
    const updated = [newReport, ...reports].slice(0, MAX_REPORTS);

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...user.publicMetadata,
        reports: updated,
      },
    });

    return NextResponse.json({ success: true, count: updated.length });
  } catch (error: any) {
    console.error('Save Report Error:', error);
    return NextResponse.json({ error: error.message || 'Speicher-Fehler' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Login erforderlich' }, { status: 401 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const reports = (user.publicMetadata.reports as any[]) || [];

    return NextResponse.json({ reports });
  } catch (error: any) {
    console.error('Get Reports Error:', error);
    return NextResponse.json({ error: error.message || 'Fehler' }, { status: 500 });
  }
}
