import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_BASE_URL = 'https://ollama.com/api/chat';

const SYSTEM_PROMPTS = {
  hep: `Du bist ein erfahrener Heilerziehungspfleger:in und hilfst bei der Erstellung professioneller Fachberichte.

WICHTIGE REGELN:
- Schreibe nach ICF-Kriterien (International Classification of Functioning)
- Nutze ressourcenorientierte Sprache
- Fokussiere auf Teilhabe und Selbstbestimmung
- Vermeide pathologisierende Begriffe
- Strukturiere nach: Aktuelle Situation → Ressourcen → Unterstützungsbedarfe → Ziele

FORMALE ANFORDERUNGEN:
- Professioneller, sachlicher Ton
- Klare Gliederung mit Absätzen
- Konkrete Beispiele aus den Notizen
- Maximal 500 Wörter
- Antwort auf Deutsch`,

  ergo: `Du bist eine erfahrene Erzieher:in und hilfst bei der Erstellung professioneller pädagogischer Fachberichte.

WICHTIGE REGELN:
- Fokussiere auf die ganzheitliche Entwicklung des Kindes (kognitiv, sozial-emotional, motorisch, sprachlich)
- Nutze die ICF-Terminologie und pädagogische Fachbegriffe
- Beschreibe Beobachtungen konkret und ressourcenorientiert
- Verbinde Beobachtungen mit erzieherischen Zielen und Maßnahmen
- Strukturiere nach: Beobachtung → Analyse → Ziel → Maßnahme

FORMALE ANFORDERUNGEN:
- Professioneller, sachlicher Ton
- Klare Gliederung mit Absätzen
- Konkrete Beispiele aus den Notizen
- Maximal 500 Wörter
- Antwort auf Deutsch`
};

const DOCUMENT_TYPE_PROMPTS: Record<string, string> = {
  'Fachbericht (ICF)': 'Erstelle einen vollständigen Fachbericht nach ICF-Kriterien mit allen relevanten Aspekten.',
  'Tagesdokumentation': 'Erstelle eine kompakte Tagesdokumentation mit den wichtigsten Ereignissen und Beobachtungen des Tages.',
  'Leichte Sprache': 'Erstelle eine vereinfachte Dokumentation in leichter Sprache (B1-Niveau), kurze Sätze, einfache Wörter, verständlich für Laien.'
};

export async function POST(request: NextRequest) {
  try {
    const { notes, mode, documentType } = await request.json();

    if (!notes || !mode) {
      return NextResponse.json(
        { error: 'Fehlende Pflichtfelder: notes und mode' },
        { status: 400 }
      );
    }

    if (!process.env.OLLAMA_API_KEY) {
      return NextResponse.json(
        { error: 'OLLAMA_API_KEY nicht konfiguriert' },
        { status: 500 }
      );
    }

    const systemPrompt = SYSTEM_PROMPTS[mode as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.hep;
    const typePrompt = DOCUMENT_TYPE_PROMPTS[documentType] || DOCUMENT_TYPE_PROMPTS['Fachbericht (ICF)'];
    
    const userPrompt = `${typePrompt}

NOTIZEN DES THERAPEUTEN:
${notes}

Bitte erstelle nun den professionellen Bericht:`;

    const response = await fetch(OLLAMA_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OLLAMA_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistral-large-3:675b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        options: {
          temperature: 0.7,
          num_predict: 1500,
        },
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Ollama API Error:', errorData);
      return NextResponse.json(
        { error: `Ollama API Fehler: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    if (!data.message?.content) {
      return NextResponse.json(
        { error: 'Keine Antwort vom Modell erhalten' },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: data.message.content.trim() });

  } catch (error: any) {
    console.error('Generate API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Fehler bei der Berichtserstellung' },
      { status: 500 }
    );
  }
}

export const maxDuration = 120;
