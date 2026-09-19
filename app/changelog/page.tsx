'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import Image from 'next/image';

type Theme = 'light' | 'dark';

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  changes: string[];
}

const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.9',
    date: '19.09.2026',
    title: 'Dark Mode & Detail-Verbesserungen',
    changes: [
      'Dark Mode für die gesamte App (Startseite, Historie, Admin-Bereich) – umschaltbar über das 🌙/☀️-Symbol',
      'Neue Berufsgruppen: Sozialpädagoge:in, Heilpädagoge:in, Arbeitserzieher:in',
      'Berufsgruppen-Wechsel setzt die ausgewählte Vorlage zurück (keine Verwechslung mehr)',
      'Hinweise für KI-Entwurf & Datenschutz direkt unter den Eingabefeldern',
      'Admin-Bereich: User-ID-Spalte, Leere-Felder-Fallback, DSGVO-Klarstellung in der Datenschutzerklärung',
    ],
  },
  {
    version: '0.8',
    date: '17.09.2026',
    title: 'Case Management & Vorlagen-System',
    changes: [
      'Case-Management-Modus für Teilhabe- und Hilfeplanung',
      'Überarbeitetes Vorlagen-System: Vorlagen nach Kriterien, ein "Bericht generieren"-Button',
      'Berichtszähler: Nutzung wird plattformweit erfasst (für das Admin-Dashboard)',
      'Historien-Ansicht für generierte Berichte',
    ],
  },
  {
    version: '0.6',
    date: '16.09.2026',
    title: 'Neue Berufsgruppen: Physio, Ergo & Ambulante Pflege',
    changes: [
      'Physiotherapeut:in & Ergotherapeut:in mit Befund-/Therapie-Berichtstypen',
      'Ambulante Pflegefachkraft (Pflegebericht/Leistungsnachweis, AEDL- und SGB-Bezug)',
      'Berufsgruppen alphabetisch sortiert',
      'Vorlagen-Wechsel ersetzt künftig statt anzuhängen',
    ],
  },
  {
    version: '0.5',
    date: '09.09.2026',
    title: 'Groß-Umbau: Berufe, Historie & PWA',
    changes: [
      'Berufsgruppen Altenpfleger:in und Logopäde:in ergänzt',
      'Geschlechtsneutrale Berufsbezeichnungen (Heilerziehungspfleger:in, Erzieher:in, …)',
      'Berufsspezifische Dokumenttypen (Pflegebericht, Befundbericht, Therapiebericht, Entwicklungsbericht)',
      'Historie: Berichte speichern, anzeigen, kopieren, als PDF exportieren, löschen',
      'PWA: App auf dem Handy installierbar (Icon, Service Worker)',
      'Server-seitige Anmeldung + Freemium-Limit (nicht mehr umgehbar)',
      'KI-Modell auf Ollama Pro (mistral-large) umgestellt, Berichtskopf mit Klient, Datum & Verfasser',
    ],
  },
  {
    version: '0.1',
    date: '07.02.2026',
    title: 'Launch & Zahlungssystem',
    changes: [
      'Erste Version der App: Berichte für Heilerziehungspflege generieren lassen',
      'Stripe-Integration (Checkout, Webhooks, Abo)',
      'Bezahlmethoden: Kreditkarte, PayPal, SEPA-Lastschrift',
      'Auto-Paywall nach Freemium-Limit, 7-Tage-Testphase',
      'Anmelde-Pflicht für die Nutzung (Clerk) + Onboarding',
    ],
  },
];

export default function Changelog() {
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) setTheme(savedTheme);
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
  };

  const card = theme === 'light' ? 'bg-white' : 'bg-gray-800';
  const cardBorder = theme === 'light' ? 'border-gray-200' : 'border-gray-700';
  const textMain = theme === 'light' ? 'text-gray-900' : 'text-gray-100';
  const textSoft = theme === 'light' ? 'text-gray-500' : 'text-gray-400';

  return (
    <div className={`min-h-screen transition-colors ${
      theme === 'light' ? 'bg-gradient-to-br from-blue-50 to-indigo-100' : 'bg-gray-900'
    }`}>
      <header className={`${card} shadow-sm border-b ${cardBorder}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
            <Image src="/logo.jpg" alt="HEP-QuickWrite Logo" width={40} height={40} className="rounded-lg" />
            <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'}`}>HEP-QuickWrite</h1>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Thema umschalten"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-gray-200" />}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => router.push('/')}
          className={`flex items-center gap-2 mb-8 transition-colors ${textSoft}`}
        >
          <ArrowLeft className="w-5 h-5" />
          Zurück zur Startseite
        </button>

        <h1 className={`text-3xl font-bold ${textMain} mb-2`}>Update-Übersicht</h1>
        <p className={`${textSoft} mb-8`}>Was sich in der App zuletzt getan hat.</p>

        <div className="space-y-6">
          {CHANGELOG.map((entry) => (
            <div key={entry.version} className={`${card} ${cardBorder} border rounded-lg shadow-md p-6`}>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">v{entry.version}</span>
                <span className={`text-sm ${textSoft}`}>{entry.date}</span>
              </div>
              <h2 className={`text-lg font-semibold ${textMain} mb-3`}>{entry.title}</h2>
              <ul className="space-y-2">
                {entry.changes.map((c, i) => (
                  <li key={i} className={`flex items-start gap-2 ${textMain}`}>
                    <span className="text-indigo-500 dark:text-indigo-400 mt-0.5">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
