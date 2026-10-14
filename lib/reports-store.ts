// Einheitlicher Zugriff auf den Bericht-Speicher.
// Reihenfolge: Postgres (falls konfiguriert) -> Vercel Blob -> Clerk-Metadata (Notbetrieb).
import {
  dbAktiv,
  berichtSpeichern as pgSpeichern,
  berichteLesen as pgLesen,
  berichtLoeschen as pgLoeschen,
  berichteZaehlen as pgZaehlen,
} from './reports-db';
import {
  blobsAktiv,
  blobBerichtSpeichern,
  blobBerichteLesen,
  blobBerichtLoeschen,
} from './reports-blob';

export type Speicher = 'db' | 'blob' | 'clerk';

export function aktiverSpeicher(): Speicher {
  if (dbAktiv()) return 'db';
  if (blobsAktiv()) return 'blob';
  return 'clerk';
}

export async function berichtSpeichern(
  userId: string,
  r: any
): Promise<{ id: string; count: number } | null> {
  const s = aktiverSpeicher();
  if (s === 'db') {
    const id = await pgSpeichern(userId, r);
    return { id, count: await pgZaehlen(userId) };
  }
  if (s === 'blob') {
    return blobBerichtSpeichern(userId, r);
  }
  return null; // Clerk-Fallback macht die Route selbst
}

export async function berichteLesen(userId: string, limit = 50): Promise<any[] | null> {
  const s = aktiverSpeicher();
  if (s === 'db') return pgLesen(userId, limit);
  if (s === 'blob') return blobBerichteLesen(userId);
  return null;
}

export async function berichtLoeschen(userId: string, id: string): Promise<boolean | null> {
  const s = aktiverSpeicher();
  if (s === 'db') return pgLoeschen(userId, id);
  if (s === 'blob') return blobBerichtLoeschen(userId, id);
  return null;
}
