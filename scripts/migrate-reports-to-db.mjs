#!/usr/bin/env node
// Einmal-Migration: Berichte aus der Clerk-Metadata in die Postgres-Datenbank.
//
// Aufruf (im Projektverzeichnis, DB-URL aus .env.local oder Vercel):
//   node scripts/migrate-reports-to-db.mjs            # migrieren
//   node scripts/migrate-reports-to-db.mjs --cleanup  # zusaetzlich Clerk-reports leeren
//
// Idempotent: derselbe Bericht (id) wird per ON CONFLICT aktualisiert, nicht doppelt angelegt.
import { readFileSync } from 'node:fs';
import { Pool } from 'pg';

function envAusEnvLocal(name) {
  try {
    const txt = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
    const m = txt.match(new RegExp('^' + name + '=(.*)$', 'm'));
    return m ? m[1].trim().replace(/^["']|["']$/g, '') : '';
  } catch {
    return '';
  }
}

const DB_URL =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  envAusEnvLocal('POSTGRES_URL') ||
  envAusEnvLocal('DATABASE_URL');

const CLERK_KEY = process.env.CLERK_SECRET_KEY || envAusEnvLocal('CLERK_SECRET_KEY');
const CLEANUP = process.argv.includes('--cleanup');

if (!DB_URL) {
  console.error('FEHLER: keine POSTGRES_URL/DATABASE_URL gesetzt (weder in der Umgebung noch in .env.local).');
  process.exit(1);
}
if (!CLERK_KEY) {
  console.error('FEHLER: CLERK_SECRET_KEY fehlt.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DB_URL,
  ssl: DB_URL.includes('localhost') ? undefined : { rejectUnauthorized: false },
});

async function clerk(path, init = {}) {
  const res = await fetch(`https://api.clerk.com/v1${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${CLERK_KEY}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  return res.json();
}

async function main() {
  await pool.query(`
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
  await pool.query(`CREATE INDEX IF NOT EXISTS reports_user_created_idx ON reports (user_id, created_at DESC);`);

  const users = await clerk('/users?limit=100');
  if (!Array.isArray(users)) {
    console.error('Clerk-Antwort unerwartet:', users);
    process.exit(1);
  }

  let total = 0;
  for (const u of users) {
    const meta = u.public_metadata || u.publicMetadata || {};
    const reports = meta.reports || [];
    const mail = (u.email_addresses || [])[0]?.email_address || u.id;
    if (!reports.length) {
      console.log(`- ${mail}: keine Berichte in Clerk`);
      continue;
    }
    for (const r of reports) {
      await pool.query(
        `INSERT INTO reports (id, user_id, client_name, report_date, mode, document_type, notes, report)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (id) DO UPDATE SET
           client_name = EXCLUDED.client_name, report_date = EXCLUDED.report_date,
           mode = EXCLUDED.mode, document_type = EXCLUDED.document_type,
           notes = EXCLUDED.notes, report = EXCLUDED.report`,
        [
          String(r.id || Date.now()),
          u.id,
          r.clientName || '',
          r.date ? new Date(r.date) : new Date(),
          r.mode || '',
          r.documentType || '',
          r.notes || '',
          r.report || '',
        ]
      );
      total += 1;
    }
    console.log(`- ${mail}: ${reports.length} Bericht(e) übernommen`);

    if (CLEANUP) {
      delete meta.reports;
      await clerk(`/users/${u.id}/metadata`, {
        method: 'PATCH',
        body: JSON.stringify({ public_metadata: meta }),
      });
      console.log(`  Clerk-Metadata geleert (reports entfernt)`);
    }
  }

  const n = await pool.query('SELECT COUNT(*)::int AS n FROM reports');
  console.log(`\nFertig: ${total} Bericht(e) migriert, ${n.rows[0].n} Zeilen in der Tabelle.`);
  if (!CLEANUP) console.log('Hinweis: Clerk-reports noch vorhanden — mit --cleanup entfernen, sobald die Historie in der App stimmt.');
  await pool.end();
}

main().catch(async (e) => {
  console.error('Migration fehlgeschlagen:', e.message);
  await pool.end();
  process.exit(1);
});
