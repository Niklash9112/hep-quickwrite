export interface Template {
  id: string;
  name: string;
  content: string;
  category: 'standard' | 'notfall' | 'entwicklung';
  mode: 'hep' | 'ergo' | 'altenpflege' | 'logopaedie' | 'physio' | 'ergotherapie' | 'ambulant';
}

const HEP_TEMPLATES: Template[] = [
  {
    id: 'hep-1',
    name: 'Tägliche Beobachtung',
    category: 'standard',
    mode: 'hep',
    content: `Klient zeigt heute ausgeglichenes Verhalten. Interagiert positiv mit Bezugspersonen. Nahrungsaufnahme regelmäßig. Mobilität eigenständig.`,
  },
  {
    id: 'hep-2',
    name: 'ICF-Beobachtung',
    category: 'standard',
    mode: 'hep',
    content: `Im Bereich Teilhabe wurde eigenständiges Agieren in der Gruppe beobachtet. Kommunikation erfolgt auf B1-Niveau. Selbstversorgung weitgehend eigenständig.`,
  },
  {
    id: 'hep-3',
    name: 'Entwicklungsfortschritt',
    category: 'entwicklung',
    mode: 'hep',
    content: `Positiver Fortschritt in der sozialen Interaktion. Klient zeigt vermehrt Eigeninitiative bei Alltagsaufgaben. Ressourcen werden zunehmend erkannt und genutzt.`,
  },
  {
    id: 'hep-4',
    name: 'Notfallsituation',
    category: 'notfall',
    mode: 'hep',
    content: `Klient zeigt aktuell erhöhte emotionale Belastung. Verhalten ist unruhig, erhöhter Hilfebedarf in Basisfunktionen. Team wurde informiert, besondere Aufmerksamkeit erforderlich.`,
  },
];

const ERGO_TEMPLATES: Template[] = [
  {
    id: 'ergo-1',
    name: 'Beobachtung im Gruppenalltag',
    category: 'standard',
    mode: 'ergo',
    content: `Kind zeigt im Gruppenalltag zunehmend eigenständiges Verhalten. Beteiligt sich aktiv an gemeinsamen Aktivitäten. Soziale Interaktion mit Gleichaltrigen gelingt zunehmend.`,
  },
  {
    id: 'ergo-2',
    name: 'Entwicklungsbeobachtung',
    category: 'standard',
    mode: 'ergo',
    content: `Erzieherische Maßnahme fokussiert auf die ganzheitliche Entwicklung. Kind zeigt Motivation bei Aktivitäten wie Basteln, Bewegungsspielen und selbstständigem An- und Auskleiden.`,
  },
  {
    id: 'ergo-3',
    name: 'Entwicklungsschritt',
    category: 'entwicklung',
    mode: 'ergo',
    content: `Deutliche Verbesserung in der Selbstständigkeit beobachtet. Erzieherische Ziele werden zunehmend eigenständig erreicht. Transfer in Alltagssituationen erfolgreich.`,
  },
  {
    id: 'ergo-4',
    name: 'Rückschritt Notiz',
    category: 'notfall',
    mode: 'ergo',
    content: `Aktuell verminderte Interaktionsbereitschaft. Erzieherische Interventionen werden schwerer initiiert. Elterngespräch und Teambesprechung empfohlen.`,
  },
];

const ALTENPFLEGE_TEMPLATES: Template[] = [
  {
    id: 'alt-1',
    name: 'Tagespflege-Beobachtung',
    category: 'standard',
    mode: 'altenpflege',
    content: `Bewohner:in zeigt heute eine stabile körperliche Verfassung. Mobilität weitgehend eigenständig, benötigt bei der Körperpflege teilweise Unterstützung. Nahrungs- und Flüssigkeitsaufnahme regelmäßig. Stimmung ausgeglichen, soziale Interaktion aktiv.`,
  },
  {
    id: 'alt-2',
    name: 'Pflegezustand & Ressourcen',
    category: 'standard',
    mode: 'altenpflege',
    content: `Pflegezustand heute unverändert stabil. Ressourcen: gute Orientierung, eigenständige Nahrungsaufnahme, aktive Teilnahme an Beschäftigungsangeboten. Risiken: erhöhte Sturzgefahr bei schnellen Bewegungen, beobachtet.`,
  },
  {
    id: 'alt-3',
    name: 'Entwicklungsfortschritt',
    category: 'entwicklung',
    mode: 'altenpflege',
    content: `Positive Entwicklung in der Mobilität beobachtet. Bewohner:in legt kurze Strecken zunehmend selbstständig zurück. Selbstständigkeit bei der Körperpflege verbessert sich. Ressourcen werden gezielt gefördert.`,
  },
  {
    id: 'alt-4',
    name: 'Notfallsituation',
    category: 'notfall',
    mode: 'altenpflege',
    content: `Aktuell erhöhter Pflegebedarf beobachtet. Bewohner:in zeigt Verwirrtheit und erhöhte Unruhe. Sturzgefahr deutlich erhöht, besondere Aufsicht erforderlich. Team und Pflegedienstleitung wurden informiert.`,
  },
];

const LOGOPAEDIE_TEMPLATES: Template[] = [
  {
    id: 'logo-1',
    name: 'Befund-Beobachtung',
    category: 'standard',
    mode: 'logopaedie',
    content: `Patient:in zeigt heute eine deutliche Verbesserung der Artikulation. Laute werden zunehmend korrekt gebildet. Sprachverständnis unauffällig. Redefluss flüssig, keine Stottersymptome beobachtet.`,
  },
  {
    id: 'logo-2',
    name: 'Therapieverlauf',
    category: 'standard',
    mode: 'logopaedie',
    content: `Therapieverlauf positiv. Patient:in setzt die erlernten Übungen zur Lautbildung zunehmend selbstständig um. Transfer in den Alltag gelingt. Motivation und Mitarbeit sind hoch.`,
  },
  {
    id: 'logo-3',
    name: 'Entwicklungsschritt',
    category: 'entwicklung',
    mode: 'logopaedie',
    content: `Deutlicher Fortschritt in der Aussprache beobachtet. Ziel-Laute werden in der Spontansprache zunehmend korrekt verwendet. Selbstkorrektur greift. Therapieziele werden erreicht.`,
  },
  {
    id: 'logo-4',
    name: 'Rückschritt Notiz',
    category: 'notfall',
    mode: 'logopaedie',
    content: `Aktuell verminderte Sprechflüssigkeit beobachtet. Patient:in zeigt vermehrt Wortfindungsstörungen. Stimmliche Belastung erhöht. Angehörigengespräch und ärztliche Abklärung empfohlen.`,
  },
];

const PHYSIO_TEMPLATES: Template[] = [
  {
    id: 'physio-1',
    name: 'Befund-Beobachtung',
    category: 'standard',
    mode: 'physio',
    content: `Patient:in zeigt heute eine stabile Bewegungsfähigkeit. Gelenkbeweglichkeit im betroffenen Bereich leicht eingeschränkt, Mobilisation wird zunehmend toleriert. Schmerzangabe gering, Übungsdurchführung aktiv und motiviert.`,
  },
  {
    id: 'physio-2',
    name: 'Therapieverlauf',
    category: 'standard',
    mode: 'physio',
    content: `Therapieverlauf positiv. Patient:in setzt die erlernten Übungen zur Kräftigung und Mobilisation zunehmend eigenständig um. Transfer in den Alltag gelingt. Gangbild stabil und zunehmend sicher.`,
  },
  {
    id: 'physio-3',
    name: 'Entwicklungsschritt',
    category: 'entwicklung',
    mode: 'physio',
    content: `Deutlicher Fortschritt in der Mobilität beobachtet. Patient:in erreicht die Therapieziele zunehmend selbstständig. Kräftigung der Muskulatur verbessert, Bewegungsausmaß nimmt zu. Ressourcen werden gezielt genutzt.`,
  },
  {
    id: 'physio-4',
    name: 'Rückschritt Notiz',
    category: 'notfall',
    mode: 'physio',
    content: `Aktuell erhöhte Schmerzangabe und eingeschränkte Beweglichkeit beobachtet. Patient:in zeigt Vermeidungsverhalten bei bestimmten Übungen. Schonhaltung deutlich. Arztgespräch und Anpassung des Behandlungsplans empfohlen.`,
  },
];

const ERGOTHERAPIE_TEMPLATES: Template[] = [
  {
    id: 'ergothera-1',
    name: 'Befund-Beobachtung',
    category: 'standard',
    mode: 'ergotherapie',
    content: `Patient:in zeigt in den Alltagsaktivitäten (ADL) einen stabilen Zustand. Feinmotorik und Handgeschicklichkeit teilweise eingeschränkt. Selbstständigkeit bei der Bewältigung des Alltags nimmt zu. Kooperation und Motivation sind gut.`,
  },
  {
    id: 'ergothera-2',
    name: 'Therapieverlauf',
    category: 'standard',
    mode: 'ergotherapie',
    content: `Ergotherapeutischer Verlauf positiv. Patient:in setzt die erlernten Handlungsstrategien für den Alltag zunehmend um. Selbstständigkeit verbessert sich, Betätigungsorientierung wird gestärkt. Transfer in den Alltag gelingt.`,
  },
  {
    id: 'ergothera-3',
    name: 'Entwicklungsschritt',
    category: 'entwicklung',
    mode: 'ergotherapie',
    content: `Deutliche Verbesserung der Alltagskompetenz beobachtet. Patient:in bewältigt ausgewählte Aktivitäten zunehmend selbstständig. Handlungsplanung und Feinmotorik verbessern sich. Betätigungsziele werden erreicht.`,
  },
  {
    id: 'ergothera-4',
    name: 'Rückschritt Notiz',
    category: 'notfall',
    mode: 'ergotherapie',
    content: `Aktuell verminderte Selbstständigkeit bei Alltagsaktivitäten beobachtet. Patient:in zeigt erhöhte Unsicherheit und verminderte Handlungsfähigkeit. Rückgang der Feinmotorik. Team- und Arztgespräch zur Anpassung der Ziele empfohlen.`,
  },
];

const AMBULANT_TEMPLATES: Template[] = [
  {
    id: 'amb-1',
    name: 'Verlaufsbeobachtung (AEDL)',
    category: 'standard',
    mode: 'ambulant',
    content: `Körperpflege und Anziehen heute überwiegend selbstständig, Unterstützung untere Körperhälfte. Nahrungs- und Flüssigkeitsaufnahme regelmäßig. Mobilität innerhaus sicher, Gehstrecke außerhalb reduziert. Ressourcen: gute Orientierung, stabiler Gang. Risiken: Sturzgefahr bei Nässe. Maßnahmen nach Pflegeplan umgesetzt.`,
  },
  {
    id: 'amb-2',
    name: 'Pflegeplan & Leistungen',
    category: 'standard',
    mode: 'ambulant',
    content: `Leistungen nach Pflegeplan erbracht (Körperpflege, Mobilisation, Begleitung). Pflegezustand unverändert stabil. Risiken: erhöhte Sturzgefahr, beobachtet. Beratungseinsatz und Angehörigengespräch angezeigt.`,
  },
  {
    id: 'amb-3',
    name: 'Entwicklungsfortschritt',
    category: 'entwicklung',
    mode: 'ambulant',
    content: `Positive Entwicklung erlebt: Klient:in übernimmt zunehmend eigenständig Morgenroutine (Anziehen, Waschen). Selbstständigkeit bei der Körperpflege verbessert sich. Vereinbarte Ziele aus dem Pflegeplan werden erreicht, Maßnahmen können schrittweise reduziert werden.`,
  },
  {
    id: 'amb-4',
    name: 'Risiko / Veränderung (Notiz)',
    category: 'notfall',
    mode: 'ambulant',
    content: `Aktuell erhöhter Unterstützungsbedarf beobachtet. Klient:in zeigt Verwirrtheit und Unsicherheit beim Gang, Sturzgefahr erhöht. Verordnete Behandlungspflege (Medikament) nicht zuverlässig selbst durchführbar. Angehörige informiert, ärztliche Abklärung und ggf. Erhöhung des Pflegegrads empfohlen.`,
  },
];

export const ALL_TEMPLATES: Template[] = [...HEP_TEMPLATES, ...ERGO_TEMPLATES, ...ALTENPFLEGE_TEMPLATES, ...LOGOPAEDIE_TEMPLATES, ...PHYSIO_TEMPLATES, ...ERGOTHERAPIE_TEMPLATES, ...AMBULANT_TEMPLATES];

export function getTemplatesByCategory(mode: 'hep' | 'ergo' | 'altenpflege' | 'logopaedie' | 'physio' | 'ergotherapie' | 'ambulant', category: string): Template[] {
  const modeTemplates = getTemplatesByMode(mode);
  if (category === 'all') return modeTemplates;
  return modeTemplates.filter(t => t.category === category);
}

export function getTemplatesByMode(mode: 'hep' | 'ergo' | 'altenpflege' | 'logopaedie' | 'physio' | 'ergotherapie' | 'ambulant'): Template[] {
  switch (mode) {
    case 'hep': return HEP_TEMPLATES;
    case 'ergo': return ERGO_TEMPLATES;
    case 'altenpflege': return ALTENPFLEGE_TEMPLATES;
    case 'logopaedie': return LOGOPAEDIE_TEMPLATES;
    case 'physio': return PHYSIO_TEMPLATES;
    case 'ergotherapie': return ERGOTHERAPIE_TEMPLATES;
    case 'ambulant': return AMBULANT_TEMPLATES;
    default: return HEP_TEMPLATES;
  }
}

