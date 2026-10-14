#!/usr/bin/env node
// Einmal-Umzug: Sammeldatei reports/<userId>.json -> ein Blob pro Bericht
// (reports/<userId>/<berichtId>.json). Nötig, weil die Sammeldatei beim Überschreiben
// bis zu 60 s lang veraltet aus dem Blob-Cache gelesen wurde.
import { readFileSync } from 'node:fs';
import { put, get, del, list } from '@vercel/blob';

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
if (!TOKEN) { console.error('FEHLER: BLOB_READ_WRITE_TOKEN fehlt.'); process.exit(1); }
process.env.BLOB_READ_WRITE_TOKEN = TOKEN;

const DRY = process.argv.includes('--dry');

async function main() {
  const { blobs } = await list({ prefix: 'reports/', limit: 500 });
  const sammel = blobs.filter((b) => /^reports\/[^/]+\.json$/.test(b.pathname));
  console.log(`${sammel.length} Sammeldatei(en) gefunden.`);

  let gesamt = 0;
  for (const b of sammel) {
    const res = await get(b.pathname, { access: 'private' });
    const text = res?.stream ? await new Response(res.stream).text() : '[]';
    const arr = JSON.parse(text || '[]');
    const userId = b.pathname.replace(/^reports\//, '').replace(/\.json$/, '');
    console.log(`- ${userId}: ${arr.length} Bericht(e)`);
    if (DRY) continue;
    for (const r of arr) {
      const id = String(r.id || Date.now());
      await put(`reports/${userId}/${id}.json`, JSON.stringify(r), {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
      });
      gesamt += 1;
    }
    await del(b.url);
    console.log(`  -> ${arr.length} Einzeldateien geschrieben, Sammeldatei entfernt`);
  }
  console.log(DRY ? 'Probelauf, nichts geändert.' : `Fertig: ${gesamt} Bericht(e) umgezogen.`);
}

main().catch((e) => { console.error('Umzug fehlgeschlagen:', e.message); process.exit(1); });
