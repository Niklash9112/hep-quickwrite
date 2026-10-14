// /api/ocr — Texterkennung aus einem Foto (handschriftliche/gedruckte Notizen).
//
// Läuft über den BESTEHENDEN Anbieter (Ollama Cloud), kein neuer Dienst:
// Der native /api/chat kann keine Bilder (Content-Array wird abgelehnt), deshalb der
// OpenAI-kompatible Endpoint /v1/chat/completions mit Content-Array und max_tokens.
//
// Das Bild wird NICHT gespeichert — es geht als Data-URL an den Anbieter und ist danach weg.
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const maxDuration = 60;

const ENDPOINT = 'https://ollama.com/v1/chat/completions';
// minimax-m3 liefert den Text direkt in content und ist am schnellsten (~4 s);
// gemma4:31b ist der gemessene Zweitversuch. qwen3.5:397b ist pensioniert (HTTP 410),
// mistral-large-4 kommentiert den Auftrag statt nur den Text zu liefern.
const MODELS = ['minimax-m3', 'gemma4:31b'];

const ANWEISUNG = `Lies den Text auf diesem Bild vollständig und exakt vor.
Regeln:
- Gib AUSSCHLIESSLICH den erkannten Text zurück — keine Einleitung, keine Kommentare, keine Bewertung.
- Behalte die Zeilenstruktur bei; jede Zeile/Stichpunkt auf eine eigene Zeile.
- Übernimm Namen, Zahlen, Uhrzeiten und Dosierungen so genau wie möglich.
- Ist eine Stelle unleserlich, schreibe [unleserlich] an diese Stelle (nicht raten).
- Sprache: Deutsch.`;

function fehler(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Login erforderlich' }, { status: 401 });
    }

    const body = await request.json();
    const image: string = body?.image || '';
    if (!image.startsWith('data:image/')) {
      return fehler('Kein Bild erhalten (data:image/... erwartet).');
    }
    if (image.length > 8_000_000) {
      return fehler('Das Bild ist zu groß (max. ~5 MB).');
    }

    const apiKey = process.env.OLLAMA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OLLAMA_API_KEY nicht konfiguriert' }, { status: 500 });
    }

    let letzterFehler = 'Unbekannter Fehler';
    for (const model of MODELS) {
      try {
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: ANWEISUNG },
                  { type: 'image_url', image_url: { url: image } },
                ],
              },
            ],
            max_tokens: 1500,
            temperature: 0.1,
          }),
        });

        if (!res.ok) {
          const t = await res.text();
          letzterFehler = `${model}: HTTP ${res.status} ${t.slice(0, 200)}`;
          continue;
        }

        const data = await res.json();
        const msg = data?.choices?.[0]?.message || {};
        // Manche Modelle schreiben den Text ins reasoning-Feld statt in content.
        const text = String(msg.content || '').trim() || String(msg.reasoning || '').trim();
        if (!text) {
          letzterFehler = `${model}: leere Antwort`;
          continue;
        }
        return NextResponse.json({ text, model });
      } catch (e: any) {
        letzterFehler = `${model}: ${e?.message || e}`;
      }
    }

    console.error('OCR fehlgeschlagen:', letzterFehler.slice(0, 300));
    return NextResponse.json(
      { error: 'Texterkennung fehlgeschlagen. Bitte nochmal versuchen oder den Text abtippen.' },
      { status: 502 }
    );
  } catch (error: any) {
    console.error('OCR Error:', error?.message || error);
    return NextResponse.json({ error: error.message || 'Fehler bei der Texterkennung' }, { status: 500 });
  }
}
