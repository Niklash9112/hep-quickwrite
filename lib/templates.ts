export interface Template {
  id: string;
  name: string;
  // Leerer Struktur-Rahmen optional — der Dokument-Typ liefert die Struktur über den Prompt.
  content: string;
  category: 'standard' | 'notfall' | 'entwicklung';
  mode: 'hep' | 'ergo' | 'altenpflege' | 'logopaedie' | 'physio' | 'ergotherapie' | 'ambulant' | 'cm_hep' | 'sozialpaedagogik' | 'heilpaedagogik' | 'arbeitserziehung';
  // Der Berichtstyp, den die KI beim Generieren erzeugen soll (= Prompt-Steuerung, Variante B).
  documentType: string;
}

const HEP_TEMPLATES: Template[] = [
  { id: 'hep-1', name: 'Fachbericht (ICF)', category: 'standard', mode: 'hep', documentType: 'Fachbericht (ICF)', content: '' },
  { id: 'hep-2', name: 'Hilfeplangespräch', category: 'standard', mode: 'hep', documentType: 'Verlaufsbericht Hilfeplangespräch', content: '' },
  { id: 'hep-3', name: 'Rückmeldung Bezugspersonen', category: 'standard', mode: 'hep', documentType: 'Rückmeldung Bezugspersonen', content: '' },
  { id: 'hep-4', name: 'Herausforderndes Verhalten', category: 'notfall', mode: 'hep', documentType: 'Dokumentation herausforderndes Verhalten', content: '' },
];

const ERGO_TEMPLATES: Template[] = [
  { id: 'ergo-1', name: 'Entwicklungsbericht', category: 'standard', mode: 'ergo', documentType: 'Entwicklungsbericht', content: '' },
  { id: 'ergo-2', name: 'Förderplan (SGB VIII)', category: 'entwicklung', mode: 'ergo', documentType: 'Förderplan (SGB VIII)', content: '' },
  { id: 'ergo-3', name: 'Rückmeldung Eltern', category: 'standard', mode: 'ergo', documentType: 'Rückmeldung Eltern', content: '' },
  { id: 'ergo-4', name: 'Herausforderndes Verhalten', category: 'notfall', mode: 'ergo', documentType: 'Dokumentation herausforderndes Verhalten', content: '' },
];

const ALTENPFLEGE_TEMPLATES: Template[] = [
  { id: 'alt-1', name: 'Pflegebericht', category: 'standard', mode: 'altenpflege', documentType: 'Pflegebericht', content: '' },
  { id: 'alt-2', name: 'Entlassbericht', category: 'standard', mode: 'altenpflege', documentType: 'Entlassbericht', content: '' },
  { id: 'alt-3', name: 'Wunddokumentation', category: 'notfall', mode: 'altenpflege', documentType: 'Wunddokumentation', content: '' },
  { id: 'alt-4', name: 'Sturzprotokoll', category: 'notfall', mode: 'altenpflege', documentType: 'Sturzprotokoll', content: '' },
];

const LOGOPAEDIE_TEMPLATES: Template[] = [
  { id: 'logo-1', name: 'Befundbericht', category: 'standard', mode: 'logopaedie', documentType: 'Befundbericht', content: '' },
  { id: 'logo-2', name: 'Therapiebericht', category: 'standard', mode: 'logopaedie', documentType: 'Therapiebericht', content: '' },
  { id: 'logo-3', name: 'Therapieverlaufsbogen', category: 'entwicklung', mode: 'logopaedie', documentType: 'Therapieverlaufsbogen', content: '' },
  { id: 'logo-4', name: 'Entlassbericht Verordner', category: 'standard', mode: 'logopaedie', documentType: 'Entlassbericht Verordner', content: '' },
];

const PHYSIO_TEMPLATES: Template[] = [
  { id: 'physio-1', name: 'Befundbericht', category: 'standard', mode: 'physio', documentType: 'Befundbericht (Physio)', content: '' },
  { id: 'physio-2', name: 'Therapiebericht', category: 'standard', mode: 'physio', documentType: 'Therapiebericht (Physio)', content: '' },
  { id: 'physio-3', name: 'Therapieverlaufsbogen', category: 'entwicklung', mode: 'physio', documentType: 'Therapieverlaufsbogen', content: '' },
  { id: 'physio-4', name: 'Entlassbericht Verordner', category: 'standard', mode: 'physio', documentType: 'Entlassbericht Verordner', content: '' },
];

const ERGOTHERAPIE_TEMPLATES: Template[] = [
  { id: 'ergothera-1', name: 'Befundbericht', category: 'standard', mode: 'ergotherapie', documentType: 'Befundbericht (Ergotherapie)', content: '' },
  { id: 'ergothera-2', name: 'Therapiebericht', category: 'standard', mode: 'ergotherapie', documentType: 'Therapiebericht (Ergotherapie)', content: '' },
  { id: 'ergothera-3', name: 'Therapieverlaufsbogen', category: 'entwicklung', mode: 'ergotherapie', documentType: 'Therapieverlaufsbogen', content: '' },
  { id: 'ergothera-4', name: 'Entlassbericht Verordner', category: 'standard', mode: 'ergotherapie', documentType: 'Entlassbericht Verordner', content: '' },
];

const AMBULANT_TEMPLATES: Template[] = [
  { id: 'amb-1', name: 'Pflegebericht', category: 'standard', mode: 'ambulant', documentType: 'Pflegebericht (ambulant)', content: '' },
  { id: 'amb-2', name: 'Überleitungsbericht', category: 'standard', mode: 'ambulant', documentType: 'Entlassbericht', content: '' },
  { id: 'amb-3', name: 'Leistungsnachweis', category: 'standard', mode: 'ambulant', documentType: 'Leistungsnachweis', content: '' },
  { id: 'amb-4', name: 'Sturzprotokoll', category: 'notfall', mode: 'ambulant', documentType: 'Sturzprotokoll', content: '' },
];

const CM_HEP_TEMPLATES: Template[] = [
  { id: 'cm-1', name: 'Teilhabeplan (ICF)', category: 'standard', mode: 'cm_hep', documentType: 'Teilhabeplan (ICF)', content: '' },
  { id: 'cm-2', name: 'Antrag Kostenträger', category: 'standard', mode: 'cm_hep', documentType: 'Teilhabeplan-Antrag Kostenträger', content: '' },
  { id: 'cm-3', name: 'Hilfeplanbericht', category: 'standard', mode: 'cm_hep', documentType: 'Hilfeplanbericht', content: '' },
  { id: 'cm-4', name: 'Runder Tisch', category: 'standard', mode: 'cm_hep', documentType: 'Runder Tisch Protokoll', content: '' },
  { id: 'cm-5', name: 'Verlaufsbericht', category: 'entwicklung', mode: 'cm_hep', documentType: 'Verlaufsbericht CM', content: '' },
];

const SOZIALPAEDAGOGIK_TEMPLATES: Template[] = [
  { id: 'sopaed-1', name: 'Fachbericht (Sozialpädagogik)', category: 'standard', mode: 'sozialpaedagogik', documentType: 'Fachbericht (Sozialpädagogik)', content: '' },
  { id: 'sopaed-2', name: 'Hilfeplangespräch (SGB VIII)', category: 'standard', mode: 'sozialpaedagogik', documentType: 'Verlaufsbericht Hilfeplangespräch', content: '' },
  { id: 'sopaed-3', name: 'Förderplan (SGB VIII)', category: 'entwicklung', mode: 'sozialpaedagogik', documentType: 'Förderplan (SGB VIII)', content: '' },
  { id: 'sopaed-4', name: 'Herausforderndes Verhalten', category: 'notfall', mode: 'sozialpaedagogik', documentType: 'Dokumentation herausforderndes Verhalten', content: '' },
];

const HEILPAEDAGOGIK_TEMPLATES: Template[] = [
  { id: 'heil-1', name: 'Heilpäd. Förderbericht', category: 'standard', mode: 'heilpaedagogik', documentType: 'Heilpädagogischer Förderbericht', content: '' },
  { id: 'heil-2', name: 'Teilhabeplan (ICF)', category: 'standard', mode: 'heilpaedagogik', documentType: 'Teilhabeplan (ICF)', content: '' },
  { id: 'heil-3', name: 'Entwicklungsbericht', category: 'entwicklung', mode: 'heilpaedagogik', documentType: 'Entwicklungsbericht', content: '' },
  { id: 'heil-4', name: 'Herausforderndes Verhalten', category: 'notfall', mode: 'heilpaedagogik', documentType: 'Dokumentation herausforderndes Verhalten', content: '' },
];

const ARBEITSERZIEHUNG_TEMPLATES: Template[] = [
  { id: 'arbei-1', name: 'Arbeitspädagogischer Bericht', category: 'standard', mode: 'arbeitserziehung', documentType: 'Arbeitspädagogischer Bericht', content: '' },
  { id: 'arbei-2', name: 'Teilhabeplan (WfbM)', category: 'standard', mode: 'arbeitserziehung', documentType: 'Teilhabeplan (WfbM)', content: '' },
  { id: 'arbei-3', name: 'Entwicklungsbericht Arbeit', category: 'entwicklung', mode: 'arbeitserziehung', documentType: 'Entwicklungsbericht Arbeit', content: '' },
  { id: 'arbei-4', name: 'Herausforderndes Verhalten', category: 'notfall', mode: 'arbeitserziehung', documentType: 'Dokumentation herausforderndes Verhalten', content: '' },
];

// Universelle Dokumente, gelten für jede Berufsgruppe
const UNIVERSAL_TEMPLATES: Template[] = [
  { id: 'univ-1', name: 'Tagesdokumentation', category: 'standard', mode: 'hep', documentType: 'Tagesdokumentation', content: '' },
  { id: 'univ-2', name: 'Leichte Sprache', category: 'standard', mode: 'hep', documentType: 'Leichte Sprache', content: '' },
];

type ModeKey = 'hep' | 'ergo' | 'altenpflege' | 'logopaedie' | 'physio' | 'ergotherapie' | 'ambulant' | 'cm_hep' | 'sozialpaedagogik' | 'heilpaedagogik' | 'arbeitserziehung';

export const ALL_TEMPLATES: Template[] = [...HEP_TEMPLATES, ...ERGO_TEMPLATES, ...ALTENPFLEGE_TEMPLATES, ...LOGOPAEDIE_TEMPLATES, ...PHYSIO_TEMPLATES, ...ERGOTHERAPIE_TEMPLATES, ...AMBULANT_TEMPLATES, ...CM_HEP_TEMPLATES, ...SOZIALPAEDAGOGIK_TEMPLATES, ...HEILPAEDAGOGIK_TEMPLATES, ...ARBEITSERZIEHUNG_TEMPLATES];

export function getTemplatesByCategory(mode: ModeKey, category: string): Template[] {
  const modeTemplates = getTemplatesByMode(mode);
  if (category === 'all') return modeTemplates;
  return modeTemplates.filter(t => t.category === category);
}

export function getTemplatesByMode(mode: ModeKey): Template[] {
  const specific =
    mode === 'hep' ? HEP_TEMPLATES
    : mode === 'ergo' ? ERGO_TEMPLATES
    : mode === 'altenpflege' ? ALTENPFLEGE_TEMPLATES
    : mode === 'logopaedie' ? LOGOPAEDIE_TEMPLATES
    : mode === 'physio' ? PHYSIO_TEMPLATES
    : mode === 'ergotherapie' ? ERGOTHERAPIE_TEMPLATES
    : mode === 'ambulant' ? AMBULANT_TEMPLATES
    : mode === 'cm_hep' ? CM_HEP_TEMPLATES
    : mode === 'sozialpaedagogik' ? SOZIALPAEDAGOGIK_TEMPLATES
    : mode === 'heilpaedagogik' ? HEILPAEDAGOGIK_TEMPLATES
    : ARBEITSERZIEHUNG_TEMPLATES;
  // Universelle Dokumente (Tagesdokumentation, Leichte Sprache) für jede Berufsgruppe anhängen
  const universal = UNIVERSAL_TEMPLATES.map(u => ({ ...u, mode: mode as ModeKey }));
  return [...specific, ...universal];
}
