interface Template {
  id: string;
  name: string;
  content: string;
  category: 'standard' | 'notfall' | 'entwicklung';
  mode: 'hep' | 'ergo';
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

export const ALL_TEMPLATES: Template[] = [...HEP_TEMPLATES, ...ERGO_TEMPLATES];

export function getTemplatesByCategory(mode: 'hep' | 'ergo', category: string): Template[] {
  const modeTemplates = mode === 'hep' ? HEP_TEMPLATES : ERGO_TEMPLATES;
  if (category === 'all') return modeTemplates;
  return modeTemplates.filter(t => t.category === category);
}

export function getTemplatesByMode(mode: 'hep' | 'ergo'): Template[] {
  return mode === 'hep' ? HEP_TEMPLATES : ERGO_TEMPLATES;
}
