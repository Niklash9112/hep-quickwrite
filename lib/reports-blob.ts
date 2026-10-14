// Bericht-Speicher auf Vercel Blob (privater Store) — EIN Blob pro Bericht.
//
// Warum nicht eine Sammeldatei pro Nutzer: Vercel Blob cached jede Blob-URL
// (`cacheControlMaxAge`, Default ein Monat, Minimum 60 s). Beim Überschreiben derselben
// Datei liest die App bis zu 60 s den ALTEN Stand — genau das passierte beim ersten
// Versuch: POST meldete count 4, der direkte GET lieferte weiter 3, und ein Löschen
// „griff" scheinbar nicht. Mit einem eigenen Pfad pro Bericht gibt es keinen Cache-Treffer:
// neue Berichte sind sofort da, gelöschte sofort weg.
//
// Struktur: reports/<userId>/<berichtId>.json  (privat, nur mit BLOB_READ_WRITE_TOKEN lesbar)
import { put, get, del, list } from '@vercel/blob';

const MAX_REPORTS = 50;

export function blobsAktiv(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function ordner(userId: string): string {
  return `reports/${userId}/`;
}

function pfad(userId: string, id: string): string {
  return `${ordner(userId)}${id}.json`;
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

async function blobInhaltLesen(pathname: string): Promise<BlobBericht | null> {
  try {
    const res: any = await get(pathname, { access: 'private' });
    if (!res || res.statusCode !== 200 || !res.stream) return null;
    const text = await new Response(res.stream).text();
    const obj = JSON.parse(text || 'null');
    return obj && typeof obj === 'object' ? (obj as BlobBericht) : null;
  } catch {
    return null;
  }
}

export async function blobBerichteLesen(userId: string): Promise<BlobBericht[]> {
  try {
    const { blobs } = await list({ prefix: ordner(userId), limit: 200 });
    const berichte = await Promise.all(blobs.map((b) => blobInhaltLesen(b.pathname)));
    return berichte
      .filter((b): b is BlobBericht => Boolean(b && b.id))
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      .slice(0, MAX_REPORTS);
  } catch {
    return [];
  }
}

export async function blobBerichtSpeichern(
  userId: string,
  r: Partial<BlobBericht>
): Promise<{ id: string; count: number }> {
  const neu: BlobBericht = {
    id: r.id || Date.now().toString(),
    clientName: r.clientName || '',
    date: r.date || new Date().toISOString(),
    mode: r.mode || '',
    documentType: r.documentType || '',
    notes: r.notes || '',
    report: r.report || '',
  };
  await put(pfad(userId, neu.id), JSON.stringify(neu), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
  const alle = await blobBerichteLesen(userId);
  return { id: neu.id, count: alle.length };
}

export async function blobBerichtLoeschen(userId: string, id: string): Promise<boolean> {
  const { blobs } = await list({ prefix: `${ordner(userId)}${id}.json` });
  if (!blobs.length) return false;
  for (const b of blobs) {
    await del(b.url);
  }
  return true;
}

// Nur fuer Aufraeum-Migrationen: alles eines Nutzers entfernen.
export async function blobNutzerLeeren(userId: string): Promise<number> {
  const { blobs } = await list({ prefix: ordner(userId), limit: 500 });
  for (const b of blobs) await del(b.url);
  return blobs.length;
}
