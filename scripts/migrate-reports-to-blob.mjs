#!/usr/bin/env node
// Einmal-Migration: Berichte aus der Clerk-Metadata in den Vercel-Blob-Store.
//
// Aufruf (im Projektverzeichnis):
//   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_... node scripts/migrate-reports-to-blob.mjs
//   ... --cleanup     # danach das reports-Feld aus der Clerk-Metadata entfernen (8-KB-Limit freigeben)
//
// Idempotent: derselbe Bericht (id) wird ersetzt, nicht doppelt angelegt.
import { readFileSync } from 'node:fs';
import { put } from '@vercel/blob';

function envAusEnvLocal(name) {
  try {
    const txt = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
    const m = txt.match(new RegExp('^' + name + '=(.*)$', 'm'));
    return m ? m[1].trim().replace(/^["']|["']$/g, '') : '';
  } catch {
    return '';
  }
}

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN || envAusEnvLocal('BLOB_READ_WRITE_TOKEN');
const CLERK_KEY = process.env.CLERK_SECRET_KEY || envAusEnvLocal('CLERK_SECRET_KEY');
const CLEANUP = process.argv.includes('--cleanup');

if (!TOKEN) {
  console.error('FEHLER: BLOB_READ_WRITE_TOKEN fehlt.');
  process.exit(1);
}
if (!CLERK_KEY) {
  console.error('FEHLER: CLERK_SECRET_KEY fehlt.');
  process.exit(1);
}
process.env.BLOB_READ_WRITE_TOKEN = TOKEN;

async function clerk(path, init = {}) {
  const res = await fetch(`https://api.clerk.com/v1${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${CLERK_KEY}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  return res.json();
}

async function main() {
  const users = await clerk('/users?limit=100');
  if (!Array.isArray(users)) {
    console.error('Clerk-Antwort unerwartet:', users);
    process.exit(1);
  }

  let gesamt = 0;
  for (const u of users) {
    const meta = u.public_metadata || {};
    const reports = meta.reports || [];
    const mail = (u.email_addresses || [])[0]?.email_address || u.id;
    if (!reports.length) {
      console.log(`- ${mail}: keine Berichte in Clerk`);
      continue;
    }
    const arr = [];
    for (const r of reports) {
      const id = String(r.id || Date.now());
      await put(`reports/${u.id}/${id}.json`, JSON.stringify(r), {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
      });
      arr.push(id);
    }
    gesamt += arr.length;
    console.log(`- ${mail}: ${arr.length} Bericht(e) -> reports/${u.id}/<id>.json`);

    if (CLEANUP) {
      // Clerk merged beim PATCH — ein Schluessel verschwindet nur, wenn man ihn
      // ausdruecklich auf null setzt. Ein blosses Weglassen laesst ihn stehen.
      await clerk(`/users/${u.id}/metadata`, {
        method: 'PATCH',
        body: JSON.stringify({ public_metadata: { reports: null } }),
      });
      console.log('  Clerk-Metadata bereinigt (reports = null)');
    }
  }

  console.log(`\nFertig: ${gesamt} Bericht(e) im Blob-Store.`);
  if (!CLEANUP) console.log('Hinweis: Clerk-reports noch vorhanden — mit --cleanup entfernen, sobald die Historie in der App stimmt.');
}

main().catch((e) => {
  console.error('Migration fehlgeschlagen:', e.message);
  process.exit(1);
});
