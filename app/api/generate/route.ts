import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

const OLLAMA_BASE_URL = 'https://ollama.com/api/chat';
const FREE_REPORT_LIMIT = 3;
const ADMIN_EMAIL = 'niklas.h112@gmail.com';

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
- Antwort auf Deutsch`,

  altenpflege: `Du bist eine erfahrene Pflegefachkraft in der Altenpflege und hilfst bei der Erstellung professioneller Pflegeberichte.

WICHTIGE REGELN:
- Fokussiere auf die Pflegeplanung nach dem Pflegeprozess (Assessment, Diagnose, Planung, Durchführung, Evaluation)
- Nutze die AEDL-Struktur (Aktivitäten und existenzielle Erfahrungen des Lebens) oder ATL (Aktivitäten des täglichen Lebens)
- Beschreibe den Pflegezustand, Ressourcen und Risiken (z. B. Sturzgefahr, Dekubitus, Mangelernährung)
- Ressourcenorientiert und wertschätzend formulieren
- Strukturiere nach: Aktuelle Situation → Ressourcen → Pflegebedarfe → Ziele → Maßnahmen

FORMALE ANFORDERUNGEN:
- Professioneller, sachlicher Ton
- Klare Gliederung mit Absätzen
- Konkrete Beispiele aus den Notizen
- Maximal 500 Wörter
- Antwort auf Deutsch`,

  logopaedie: `Du bist eine erfahrene Logopäde:in und hilfst bei der Erstellung professioneller logopädischer Befund- und Therapieberichte.

WICHTIGE REGELN:
- Fokussiere auf die Bereiche: Artikulation, Sprachentwicklung, Redefluss, Stimme, Schlucken (Dysphagie), auditive Wahrnehmung
- Nutze fachliche Terminologie (z. B. Dyslalie, Dysarthrie, Aphasie, Stottern, Sigmatismus)
- Beschreibe Befund, Diagnose, Therapieziele und -maßnahmen
- Ressourcenorientiert und konkret formulieren
- Strukturiere nach: Anamnese/Befund → Diagnose → Therapieziele → Maßnahmen → Prognose

FORMALE ANFORDERUNGEN:
- Professioneller, sachlicher Ton
- Klare Gliederung mit Absätzen
- Konkrete Beispiele aus den Notizen
- Maximal 500 Wörter
- Antwort auf Deutsch`,

  physio: `Du bist ein erfahrener Physiotherapeut:in und hilfst bei der Erstellung professioneller physiotherapeutischer Befund- und Therapieberichte.

WICHTIGE REGELN:
- Fokussiere auf die Bereiche: Mobilität, Bewegungsumfang, Kraft, Koordination, Schmerz, Gangbild, Bewegungsqualität
- Nutze fachliche Terminologie (z. B. Bewegungseinschränkung, Muskeldysbalance, Schonhaltung, Propriozeption)
- Beschreibe Befund, Diagnose, Therapieziele und -maßnahmen
- Strukturiere nach: Anamnese/Befund → Diagnose → Ziele → Maßnahmen → Verlauf/Prognose

FORMALE ANFORDERUNGEN:
- Professioneller, sachlicher Ton
- Klare Gliederung mit Absätzen
- Konkrete Beispiele aus den Notizen
- Maximal 500 Wörter
- Antwort auf Deutsch`,

  ergotherapie: `Du bist ein erfahrener Ergotherapeut:in und hilfst bei der Erstellung professioneller ergotherapeutischer Befund- und Therapieberichte.

WICHTIGE REGELN:
- Fokussiere auf die Bereiche: Alltagsaktivitäten (ADL/IADL), Betätigungsorientierung, Feinmotorik, Handlungsplanung, Selbstständigkeit, Sensomotorik
- Nutze fachliche Terminologie (z. B. Betätigungsanalyse, Kompensation, Handgeschicklichkeit, Alltagskompetenz)
- Beschreibe Befund, Therapieziele, Maßnahmen und den Transfer in den Alltag
- Ressourcenorientiert und konkret formulieren
- Strukturiere nach: Anamnese/Befund → Betätigungsprobleme → Ziele → Maßnahmen → Transfer/Prognose

FORMALE ANFORDERUNGEN:
- Professioneller, sachlicher Ton
- Klare Gliederung mit Absätzen
- Konkrete Beispiele aus den Notizen
- Maximal 500 Wörter
- Antwort auf Deutsch`,

  ambulant: `Du bist eine erfahrene Pflegefachkraft im ambulanten Pflegedienst und hilfst bei der Erstellung professioneller Berichte für die ambulante Pflege.

WICHTIGE REGELN:
- Fokussiere auf den Pflegeprozess und die AEDL/ABEDL-Struktur
- Berücksichtige den Pflegegrad (SGB XI) und verordnete Behandlungspflege (SGB V)
- Beschreibe Maßnahmen erbracht und ergebnisorientiert (wer, was, wann, wohin — Leistungs-/Abrechnungsbezug)
- Benenne Ressourcen und Risiken (Sturz, Dekubitus, Dehydration, Mangelernährung)
- WICHTIG: Der Bericht ist ein ENTWURF/Vorlage zur fachlichen Dokumentation, KEINE abrechnungsrelevante Abrechnungsgrundlage. Konkrete Leistungs- und Abrechnungspositionen nicht automatisch erzeugen.
- Strukturiere nach: Aktuelle Situation → Maßnahmen erbracht → Ressourcen → Risiken → Empfehlungen/Verlauf

FORMALE ANFORDERUNGEN:
- Professioneller, sachlicher Ton
- Klare Gliederung mit Absätzen
- Konkrete Beispiele aus den Notizen
- Maximal 500 Wörter
- Antwort auf Deutsch`,

  cm_hep: `Du bist ein erfahrener Case Manager:in in der Eingliederungshilfe (Heilerziehungspflege) und hilfst bei der Erstellung professioneller Teilhabe- und Hilfepläne nach SGB IX und ICF.

WICHTIGE REGELN:
- Fokussiere auf die Teilhabeplanung nach SGB IX (§§ 106 ff): Teilhabebezug, Bedarfsermittlung, personenzentrierte Ziele
- Nutze die ICF-Struktur: Körperfunktionen, Aktivität & Teilhabe, Kontextfaktoren, Ressourcen
- Beschreibe Ziele, Maßnahmen und die Koordination des Hilfenetzes (Ämter, Behörden, Leistungserbringer)
- Ressourcenorientiert, personenzentriert und selbstbestimmungsfördernd formulieren
- Strukturiere nach: Ausgangslage/Klärung → Assessment → Teilhabeziele → Maßnahmen/Netzwerk → Monitoring/Fortschritt

FORMALE ANFORDERUNGEN:
- Professioneller, sachlicher Ton
- Klare Gliederung mit Absätzen
- Konkrete Beispiele aus den Notizen
- Maximal 500 Wörter
- Antwort auf Deutsch`,

  sozialpaedagogik: `Du bist eine erfahrene Sozialpädagoge:in / Sozialarbeiter:in und hilfst bei der Erstellung professioneller fachpädagogischer Berichte.

WICHTIGE REGELN:
- Fokussiere auf die Soziale Arbeit nach SGB VIII und dem KJHG
- Nutze ressourcen- und lösungsorientierte Sprache
- Fokussiere auf Teilhabe, Selbstbestimmung und Sozialraumorientierung
- Verbinde Beobachtungen mit pädagogischen Zielen und Maßnahmen
- Strukturiere nach: aktuelle Situation → Ressourcen → Unterstützungsbedarf → Ziele → Maßnahmen

FORMALE ANFORDERUNGEN:
- Professioneller, sachlicher Ton
- Klare Gliederung mit Absätzen
- Konkrete Beispiele aus den Notizen
- Maximal 500 Wörter
- Antwort auf Deutsch`,

  heilpaedagogik: `Du bist eine erfahrene Heilpädagoge:in und hilfst bei der Erstellung professioneller heilpädagogischer Berichte.

WICHTIGE REGELN:
- Fokussiere auf die heilpädagogische Entwicklungsförderung und Teilhabe
- Nutze eine ressourcenorientierte, wertschätzende Sprache
- Beschreibe Förderbedarfe, heilpädagogische Ziele und Maßnahmen konkret
- Nutze den ICF-Bezug zur Beschreibung von Teilhabe und Aktivität
- Strukturiere nach: Entwicklungsbeobachtung → Förderbedarf → Ziele → Maßnahmen → Fortschritt

FORMALE ANFORDERUNGEN:
- Professioneller, sachlicher Ton
- Klare Gliederung mit Absätzen
- Konkrete Beispiele aus den Notizen
- Maximal 500 Wörter
- Antwort auf Deutsch`,

  arbeitserziehung: `Du bist eine erfahrene Arbeitserzieher:in / Arbeitspädagoge:in (Werkstatt für behinderte Menschen, WfbM) und hilfst bei der Erstellung professioneller arbeitspädagogischer Berichte.

WICHTIGE REGELN:
- Fokussiere auf berufliche Teilhabe und Arbeitsförderung nach SGB IX
- Beschreibe Arbeitsverhalten, Tätigkeitsbereiche und konkrete Fortschritte
- Nutze ressourcenorientierte Sprache und benenne Qualifikationsziele
- Benenne den Unterstützungsbedarf am Arbeitsplatz und Maßnahmen
- Berücksichtige die drei WfbM-Phasen: Eingangsverfahren (Eignungsprüfung), Berufsbildungsbereich (2 Jahre, Förderung der Leistungsfähigkeit) und Arbeitsbereich (Dauerarbeitsplätze) — und benenne, in welcher Phase der Mensch sich befindet
- Nenne ggf. den Übergang auf den allgemeinen Arbeitsmarkt als Ziel (ausgelagerte Plätze)
- Strukturiere nach: Arbeitsplatz/Lage (inkl. WfbM-Phase) → Arbeitsverhalten → Fortschritt → Ziele → Unterstützung/Maßnahmen

FORMALE ANFORDERUNGEN:
- Professioneller, sachlicher Ton
- Klare Gliederung mit Absätzen
- Konkrete Beispiele aus den Notizen
- Maximal 500 Wörter
- Antwort auf Deutsch`
};

const DOCUMENT_TYPE_PROMPTS: Record<string, string> = {
  'Fachbericht (ICF)': 'Erstelle einen vollständigen Fachbericht nach ICF-Kriterien mit allen relevanten Aspekten.',
  'Entwicklungsbericht': 'Erstelle einen Entwicklungsbericht mit Fokus auf die ganzheitliche Entwicklung, Beobachtungen und erzieherische Ziele.',
  'Pflegebericht': 'Erstelle einen Pflegebericht nach dem Pflegeprozess mit AEDL/ATL-Struktur, Pflegezustand, Ressourcen, Risiken, Zielen und Maßnahmen.',
  'Befundbericht': 'Erstelle einen logopädischen Befundbericht mit Anamnese, Befund, Diagnose und Empfehlungen.',
  'Therapiebericht': 'Erstelle einen logopädischen Therapiebericht mit Therapiezielen, durchgeführten Maßnahmen und Verlauf.',
  'Tagesdokumentation': 'Erstelle eine kompakte Tagesdokumentation mit den wichtigsten Ereignissen und Beobachtungen des Tages.',
  'Leichte Sprache': 'Erstelle eine vereinfachte Dokumentation in leichter Sprache (B1-Niveau), kurze Sätze, einfache Wörter, verständlich für Laien.',
  'Befundbericht (Physio)': 'Erstelle einen physiotherapeutischen Befundbericht mit Anamnese, Untersuchungsbefund, Beeinträchtigungen und Behandlungsplan.',
  'Therapiebericht (Physio)': 'Erstelle einen physiotherapeutischen Therapiebericht mit Therapiezielen, durchgeführten Maßnahmen und Verlauf.',
  'Befundbericht (Ergotherapie)': 'Erstelle einen ergotherapeutischen Befundbericht mit Anamnese, Betätigungsanalyse, Beeinträchtigungen und Behandlungsplan.',
  'Therapiebericht (Ergotherapie)': 'Erstelle einen ergotherapeutischen Therapiebericht mit Therapiezielen, durchgeführten Betätigungsmaßnahmen und Verlauf.',
  'Pflegebericht (ambulant)': 'Erstelle einen ambulanten Pflegebericht nach Pflegeprozess/AEDL mit erbrachten Maßnahmen, Ressourcen, Risiken und Empfehlungen. Als Dokumentations-ENTWURF, nicht als Abrechnungsgrundlage.',
  'Leistungsnachweis': 'Erstelle einen ansprechenden Leistungsnachweis/Verlaufsbericht für die ambulante Pflege: erbrachte Maßnahmen je Leistungsbereich, Zeitbezug, Ergebnis. Als Dokumentationsentwurf.',
  'Teilhabeplan (ICF)': 'Erstelle einen personenzentrierten Teilhabeplan nach SGB IX und ICF mit Bedarfsermittlung, Teilhabezielen, Maßnahmen und Ressourcen.',
  'Hilfeplanbericht': 'Erstelle einen Hilfeplanbericht für die Eingliederungshilfe: Ausgangslage, Ziele, Maßnahmen zur Teilhabe, Koordination des Hilfenetzes und Empfehlungen.',
  'Verlaufsbericht CM': 'Erstelle einen Case-Management-Verlaufsbericht: umgesetzte Leistungen, Fortschritt der Teilhabeziele, Netzwerkkoordination und nächste Schritte.',
  'Förderplan (SGB VIII)': 'Erstelle einen Förderplan nach SGB VIII: Ist-Stand der Entwicklung, Förderziele, pädagogische Maßnahmen und Verlaufskontrolle (ressourcenorientiert).',
  'Verlaufsbericht Hilfeplangespräch': 'Erstelle einen Verlaufsbericht für das Jugendamt-Hilfeplangespräch: Entwicklung seit letztem Gespräch, Zielerreichung, aktueller Hilfebedarf, Empfehlungen an das Jugendamt.',
  'Rückmeldung Bezugspersonen': 'Erstelle eine verständliche, wertschätzende Rückmeldung an die Bezugspersonen: aktueller Stand, positive Beobachtungen, fördernde Schritte im Alltag.',
  'Dokumentation herausforderndes Verhalten': 'Erstelle einen fachlichen Vermerk bei herausforderndem Verhalten: situationsbezogene Beschreibung des Vorfalls (wer, wann, wo, was), Auslöser, durchgeführte Deeskalationsmaßnahmen, Wirkung, nächste Schritte und ggf. Team-/Leitungsinformation.',
  'Rückmeldung Eltern': 'Erstelle eine verständliche Rückmeldung an die Eltern: Entwicklungsschritte des Kindes, Beobachtungen, Förderangebote und nächste Termine (wertschätzend, laienverständlich).',
  'Entlassbericht': 'Erstelle einen Entlass-/Überleitungsbericht: Aufnahmegrund, Entwicklung während des Aufenthalts, aktueller Pflege-/Unterstützungsbedarf, durchgeführte Maßnahmen, Empfehlungen für die weiterführende Versorgung.',
  'Wunddokumentation': 'Erstelle eine strukturierte Wunddokumentation: Wundart, Lokalisation, Größe, Aussehen, Wundzustand, durchgeführte Maßnahmen, Risikofaktoren und Verlauf (ohne Diagnosestellung).',
  'Sturzprotokoll': 'Erstelle ein Sturzprotokoll: Zeitpunkt/Ort/Umstände des Sturzes, Folgen, Reaktionen, durchgeführte Erstmaßnahmen und Information von Angehörigen/Arzt, Präventionsempfehlungen.',
  'Entlassbericht Verordner': 'Erstelle einen Entlassbericht an den verordnenden Arzt: durchgeführte Therapie, Verlauf, erreichte Ziele und Empfehlungen für die Weiterbehandlung.',
  'Therapieverlaufsbogen': 'Erstelle einen Therapieverlaufsbogen: Maßnahme, Therapieziel, durchgeführte Übungen/Inhalte je Termin, Fortschritt, aktuelle Einschränkung und weitere Planung.',
  'Teilhabeplan-Antrag Kostenträger': 'Erstelle einen Teilhabeplan-Antrag an den Kostenträger: Bedarfslage nach ICF, beantragte Leistungen, Begründung, Ziele der Teilhabe.',
  'Runder Tisch Protokoll': 'Erstelle ein Protokoll für einen Runden Tisch zum Hilfeprozess: Teilnehmende, behandelte Punkte, Entscheidungen, vereinbarte Maßnahmen mit Verantwortlichkeit und Fristen.',
  'Fachbericht (Sozialpädagogik)': 'Erstelle einen Fachbericht für die Sozialpädagogik/Soziale Arbeit: aktuelle Situation, Ressourcen, Unterstützungsbedarf, pädagogische Ziele und Maßnahmen. Fokus auf SGB VIII/Sozialraumorientierung.',
  'Heilpädagogischer Förderbericht': 'Erstelle einen heilpädagogischen Förderbericht: Beobachtung von Entwicklungsständen, Förderbedarfe, heilpädagogische Ziele und Maßnahmen, ressourcenorientiert, mit ICF-Bezug.',
  'Teilhabeplan (WfbM)': 'Erstelle einen Teilhabeplan für eine Werkstatt für behinderte Menschen (WfbM): Arbeitsplatz, Teilhabeziele am Arbeitsplatz, benötigte Unterstützung, berufliche Entwicklung und Teilhabe nach SGB IX.',
  'Arbeitspädagogischer Bericht': 'Erstelle einen arbeitspädagogischen (arbeitserzieherischen) Bericht: Arbeitsverhalten, Tätigkeitsbereiche, erzielte Fortschritte, Qualifikationsziele und Unterstützungsbedarf am Arbeitsplatz.',
  'Entwicklungsbericht Arbeit': 'Erstelle einen Entwicklungsbericht zur beruflichen Teilhabe: Entwicklung der Arbeitsfähigkeiten, Zielerreichung, Ressourcen und nächste Schritte für die Arbeitserziehung.'
};

export async function POST(request: NextRequest) {
  try {
    const { notes, mode, documentType, clientName, template } = await request.json();

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

    // --- AUTH + LIMIT-CHECK (server-seitig, nicht umgehbar) ---
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Login erforderlich', requiresLogin: true },
        { status: 401 }
      );
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const userEmail = user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress || '';
    const subscriptionStatus = user.publicMetadata.subscriptionStatus as string | undefined;
    const currentCount = (user.publicMetadata.reportCount as number) || 0;

    // Admin bekommt unbegrenzt
    const isAdmin = userEmail === ADMIN_EMAIL;
    // Abonnent bekommt unbegrenzt
    const hasSubscription = subscriptionStatus === 'active';

    if (!isAdmin && !hasSubscription && currentCount >= FREE_REPORT_LIMIT) {
      return NextResponse.json(
        { error: 'Freemium-Limit erreicht', limitReached: true },
        { status: 403 }
      );
    }

    // Verfasser aus dem angemeldeten Clerk-Profil holen
    let authorName = '';
    try {
      authorName = user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : (user.firstName || user.username || userEmail || '');
    } catch (e) {
      console.error('Clerk-Auth Fehler:', e);
    }

    const today = new Date().toLocaleDateString('de-DE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      timeZone: 'Europe/Berlin',
    });
    const nowTime = new Date().toLocaleTimeString('de-DE', {
      hour: '2-digit', minute: '2-digit',
      timeZone: 'Europe/Berlin',
    });

    const systemPrompt = SYSTEM_PROMPTS[mode as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.hep;
    const typePrompt = DOCUMENT_TYPE_PROMPTS[documentType] || DOCUMENT_TYPE_PROMPTS['Fachbericht (ICF)'];
    
    const userPrompt = `${typePrompt}

${template && template.content ? `GEWÄHLTE VORLAGE/STRUKTUR-VORGABE:
Die folgende Vorlage beschreibt die gewünschte Struktur und inhaltlichen Kriterien. Richte den Bericht an dieser Vorlagenlogik aus, übernimm aber NICHT den Vorlagentext wörtlich — nutze ihn als Rahmen und fülle ihn mit den konkreten Notizen:
"${template.content}"

` : ''}KOPFDATEN DES BERICHTS:
- Klient:in: ${clientName || '[Name]'}
- Datum: ${today}
- Uhrzeit: ${nowTime} Uhr
- Verfasser:in: ${authorName || '[Name]'}

NOTIZEN DES THERAPEUTEN:
${notes}

Bitte erstelle nun den professionellen Bericht. Übernimm die Kopfdaten (Klient:in, Datum, Uhrzeit, Verfasser:in) exakt in den Berichtskopf.

FORMATIERUNG:
- Jeder Abschnitt (Aktuelle Situation, Ressourcen, Unterstützungsbedarfe, Ziele) beginnt mit einer eigenen Überschrift
- Überschriften GENAU EINMAL mit ## markieren (NICHT ## ##, kein doppeltes Präfix)
- Zwischen allen Abschnitten und Absätzen eine LEERZEILE einfügen
- Keine Abschnitte in derselben Zeile zusammenfassen
- Trennlinien (---) IMMER auf einer eigenen Zeile, nie am Ende eines Listenpunkts
- Verwende Markdown-Überschriften (##) für Abschnitte und Aufzählungszeichen (-) für Listen`;

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

    // Nachbearbeitung: Markdown-Formatierung bereinigen
    let result = data.message.content.trim();
    // Doppelte Überschriften-Markierung entfernen: "## ## X" -> "## X"
    result = result.replace(/##\s*##/g, '##');
    // Trennlinie auf eigene Zeile: "...punkt. ---" -> "...punkt.\n\n---"
    result = result.replace(/([^\n])\s*---\s*/g, '$1\n\n---\n\n');
    // Mehrfache Leerzeilen auf eine reduzieren
    result = result.replace(/\n{3,}/g, '\n\n');

    return NextResponse.json({ result });

  } catch (error: any) {
    console.error('Generate API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Fehler bei der Berichtserstellung' },
      { status: 500 }
    );
  }
}

export const maxDuration = 120;
