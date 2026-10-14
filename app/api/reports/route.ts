import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { dbAktiv, berichtSpeichern, berichteLesen, berichteZaehlen } from '@/lib/reports-db';

const MAX_REPORTS = 50;

// POST /api/reports — Bericht speichern (Postgres; Fallback: Clerk-Metadata)
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

    const newReport = {
      id: Date.now().toString(),
      clientName: clientName || '',
      date: date || new Date().toISOString(),
      mode,
      documentType,
      notes: notes || '',
      report: generatedReport,
    };

    if (dbAktiv()) {
      const id = await berichtSpeichern(userId, newReport);
      const count = await berichteZaehlen(userId);
      return NextResponse.json({ success: true, count, id, storage: 'db' });
    }

    // ---- Fallback: Clerk-Metadata (nur solange keine DB konfiguriert ist) ----
    // Achtung: Clerk begrenzt Metadata auf 8 KB — ab dem zweiten grossen Bericht
    // scheitert das Speichern hier mit HTTP 422. Nur Notbetrieb.
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const reports = (user.publicMetadata.reports as any[]) || [];
    const updated = [newReport, ...reports].slice(0, MAX_REPORTS);

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...user.publicMetadata,
        reports: updated,
      },
    });

    return NextResponse.json({ success: true, count: updated.length, storage: 'clerk' });
  } catch (error: any) {
    console.error('Save Report Error:', error?.message || error);
    return NextResponse.json({ error: error.message || 'Speicher-Fehler' }, { status: 500 });
  }
}

// GET /api/reports — Historie laden
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Login erforderlich' }, { status: 401 });
    }

    if (dbAktiv()) {
      const reports = await berichteLesen(userId, MAX_REPORTS);
      return NextResponse.json({ reports, storage: 'db' });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const reports = (user.publicMetadata.reports as any[]) || [];

    return NextResponse.json({ reports, storage: 'clerk' });
  } catch (error: any) {
    console.error('Get Reports Error:', error?.message || error);
    return NextResponse.json({ error: error.message || 'Fehler' }, { status: 500 });
  }
}
