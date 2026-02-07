export interface Template {
  id: string;
  name: string;
  content: string;
  category: 'standard' | 'notfall' | 'entwicklung';
}

const templates: Record<string, Template[]> = {
  hep: [
    { id: '1', name: 'Tagesstruktur', category: 'standard', content: 'Der Klient nahm heute aktiv an der Tagesstruktur teil...' },
    { id: '2', name: 'Krisenintervention', category: 'notfall', content: 'Aufgrund einer akuten Überforderungssituation wurde...' }
  ],
  ergo: [
    { id: '3', name: 'Feinmotorik', category: 'standard', content: 'Im Fokus der heutigen Einheit stand die Verbesserung der...' }
  ]
};

export const getTemplatesForMode = (mode: 'hep' | 'ergo') => templates[mode] || [];
export const getTemplatesByCategory = (mode: 'hep' | 'ergo', category: string) => 
  (templates[mode] || []).filter(t => t.category === category);
