// Bericht-Speicher auf Postgres.
//
// Grund: Clerk-Metadata ist auf 8192 Bytes begrenzt (per API verifiziert: HTTP 422
// "exceeds the maximum allowed size of 8192 bytes"). Ein einziger Bericht ist ~4,5 KB,
// damit liessen sich nur 1-2 Berichte speichern — ab dem zweiten ging der Bericht
// still verloren. Berichte gehoeren daher in eine Datenbank.
//
// Ohne konfigurierte Datenbank (keine POSTGRES_URL/DATABASE_URL) fallen die API-Routen
// auf den alten Clerk-Speicher zurueck, damit nichts bricht.
import { Pool } from 'pg';

const CONNECTION =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.NEON_DATABASE_URL ||
  '';

let pool: Pool | null = null;

export function dbAktiv(): boolean {
  return CONNECTION.length > 0;
}

function getPool(): Pool {
  if (!pool) {
    const lokal = CONNECTION.includes('localhost') || CONNECTION.includes('127.0.0.1');
    pool = new Pool({
      connectionString: CONNECTION,
      max: 3,
      ssl: lokal ? undefined : { rejectUnauthorized: false },
    });
  }
  return pool;
}

export async function schemaSicherstellen(): Promise<void> {
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS reports (
      id            TEXT PRIMARY KEY,
      user_id       TEXT NOT NULL,
      client_name   TEXT,
      report_date   TIMESTAMPTZ,
      mode          TEXT,
      document_type TEXT,
      notes         TEXT,
      report        TEXT,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  await getPool().query(`
    CREATE INDEX IF NOT EXISTS reports_user_created_idx
      ON reports (user_id, created_at DESC);
  `);
}

export interface BerichtEingabe {
  id?: string;
  clientName?: string;
  date?: string;
  mode?: string;
  documentType?: string;
  notes?: string;
  report?: string;
}

export async function berichtSpeichern(userId: string, r: BerichtEingabe): Promise<string> {
  await schemaSicherstellen();
  const id = r.id || `${Date.now()}`;
  await getPool().query(
    `INSERT INTO reports (id, user_id, client_name, report_date, mode, document_type, notes, report)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (id) DO UPDATE SET
       client_name = EXCLUDED.client_name,
       report_date = EXCLUDED.report_date,
       mode = EXCLUDED.mode,
       document_type = EXCLUDED.document_type,
       notes = EXCLUDED.notes,
       report = EXCLUDED.report`,
    [
      id,
      userId,
      r.clientName || '',
      r.date ? new Date(r.date) : new Date(),
      r.mode || '',
      r.documentType || '',
      r.notes || '',
      r.report || '',
    ]
  );
  return id;
}

export async function berichteLesen(userId: string, limit = 50): Promise<any[]> {
  await schemaSicherstellen();
  const res = await getPool().query(
    `SELECT id, client_name, report_date, mode, document_type, notes, report
       FROM reports WHERE user_id = $1
      ORDER BY report_date DESC NULLS LAST, created_at DESC
      LIMIT $2`,
    [userId, limit]
  );
  return res.rows.map((row) => ({
    id: row.id,
    clientName: row.client_name || '',
    date: row.report_date ? new Date(row.report_date).toISOString() : '',
    mode: row.mode || '',
    documentType: row.document_type || '',
    notes: row.notes || '',
    report: row.report || '',
  }));
}

export async function berichtLoeschen(userId: string, id: string): Promise<boolean> {
  await schemaSicherstellen();
  const res = await getPool().query(
    'DELETE FROM reports WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return (res.rowCount || 0) > 0;
}

export async function berichteZaehlen(userId: string): Promise<number> {
  await schemaSicherstellen();
  const res = await getPool().query('SELECT COUNT(*)::int AS n FROM reports WHERE user_id = $1', [userId]);
  return res.rows[0]?.n || 0;
}
