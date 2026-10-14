// Bericht-Speicher auf Vercel Blob (privater Store).
//
// Grund: Clerk-Metadata ist auf 8192 Bytes begrenzt (verifiziert: HTTP 422
// "exceeds the maximum allowed size of 8192 bytes"). Ein Bericht ist ~4,5 KB, damit
// gingen nur 1-2 Berichte — danach verschwand der Bericht still.
//
// Ein privater Blob-Store pro Nutzer-Datei: reports/<userId>.json enthaelt das Array
// der Berichte (max 50). Der Store ist "private" — Lesen nur mit BLOB_READ_WRITE_TOKEN
// serverseitig, keine oeffentlichen URLs auf Gesundheitsdaten.
import { put, get, del } from '@vercel/blob';

const MAX_REPORTS = 50;

export function blobsAktiv(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function pfad(userId: string): string {
  return `reports/${userId}.json`;
}

export interface BlobBericht {
  id: string;
  clientName: string;
  date: string;
  mode: string;
  documentType: string;
  notes: string;
  report: string;
}

export async function blobBerichteLesen(userId: string): Promise<BlobBericht[]> {
  try {
    const res: any = await get(pfad(userId), { access: 'private' });
    if (!res || res.statusCode !== 200 || !res.stream) return [];
    const text = await new Response(res.stream).text();
    const arr = JSON.parse(text || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch {
    // Datei existiert noch nicht o. Ä. — leere Historie
    return [];
  }
}

async function schreiben(userId: string, berichte: BlobBericht[]): Promise<void> {
  await put(pfad(userId), JSON.stringify(berichte), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
}

export async function blobBerichtSpeichern(
  userId: string,
  r: Partial<BlobBericht>
): Promise<{ id: string; count: number }> {
  const vorhanden = await blobBerichteLesen(userId);
  const neu: BlobBericht = {
    id: r.id || Date.now().toString(),
    clientName: r.clientName || '',
    date: r.date || new Date().toISOString(),
    mode: r.mode || '',
    documentType: r.documentType || '',
    notes: r.notes || '',
    report: r.report || '',
  };
  const updated = [neu, ...vorhanden.filter((x) => x.id !== neu.id)].slice(0, MAX_REPORTS);
  await schreiben(userId, updated);
  return { id: neu.id, count: updated.length };
}

export async function blobBerichtLoeschen(userId: string, id: string): Promise<boolean> {
  const vorhanden = await blobBerichteLesen(userId);
  const updated = vorhanden.filter((x) => x.id !== id);
  if (updated.length === vorhanden.length) return false;
  await schreiben(userId, updated);
  return true;
}

// Nur fuer die Aufraeum-Migration: Datei komplett entfernen.
export async function blobDateiLoeschen(userId: string): Promise<void> {
  try {
    await del(pfad(userId));
  } catch {
    /* egal */
  }
}
