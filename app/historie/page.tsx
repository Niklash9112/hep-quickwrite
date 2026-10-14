'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Copy, Download, Moon, Sun, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';

interface Report {
  id: string;
  clientName: string;
  date: string;
  mode: string;
  documentType: string;
  notes: string;
  report: string;
}

type Theme = 'light' | 'dark';

const MODE_NAMES: Record<string, string> = {
  hep: 'Heilerziehungspfleger:in',
  ergo: 'Erzieher:in',
  altenpflege: 'Altenpfleger:in',
  logopaedie: 'Logopäde:in',
  physio: 'Physiotherapeut:in',
  ergotherapie: 'Ergotherapeut:in',
  ambulant: 'Ambulante Pflegefachkraft',
  cm_hep: 'Case Manager:in',
  sozialpaedagogik: 'Sozialpädagoge:in',
  heilpaedagogik: 'Heilpädagoge:in',
  arbeitserziehung: 'Arbeitserzieher:in',
  krankenpflege: 'Gesundheits- und Krankenpfleger:in',
};

export default function Historie() {
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>('light');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Auf dem Handy sind vollstaendig ausgerollte Berichte unbrauchbar lang:
  // pro Karte nur Kopfdaten, der Berichtstext klappt auf Klick auf.
  const [offen, setOffen] = useState<string | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) setTheme(savedTheme);
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch('/api/reports', { cache: 'no-store' });
        if (res.status === 401) {
          router.push('/sign-in');
          return;
        }
        const data = await res.json();
        if (res.ok) {
          setReports(data.reports || []);
        } else {
          setError(data.error || 'Fehler beim Laden');
        }
      } catch (e) {
        setError('Fehler beim Laden der Historie');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [router]);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
  };

  const card = theme === 'light' ? 'bg-white' : 'bg-gray-800';
  const cardBorder = theme === 'light' ? 'border-gray-200' : 'border-gray-700';
  const textMain = theme === 'light' ? 'text-gray-900' : 'text-gray-100';
  const textSoft = theme === 'light' ? 'text-gray-500' : 'text-gray-400';
  const textReport = theme === 'light' ? 'text-gray-700' : 'text-gray-200';

  const deleteReport = async (id: string) => {
    if (!confirm('Bericht wirklich löschen?')) return;
    try {
      const res = await fetch('/api/reports/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setReports(reports.filter((r) => r.id !== id));
      }
    } catch (e) {
      alert('Fehler beim Löschen');
    }
  };

  const copyReport = async (report: string) => {
    await navigator.clipboard.writeText(report);
    alert('Bericht kopiert!');
  };

  const downloadPdf = (report: Report) => {
    const doc = new jsPDF();
    const margin = 15;
    const maxWidth = 180;
    doc.setFontSize(16);
    doc.text('HEP-QuickWrite', margin, 15);
    doc.setFontSize(11);
    doc.text(`Klient:in: ${report.clientName || '-'}`, margin, 25);
    doc.text(`Datum: ${new Date(report.date).toLocaleDateString('de-DE')}`, margin, 31);
    doc.text(`Dokument: ${report.documentType}`, margin, 37);
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(report.report, maxWidth);
    doc.text(lines, margin, 45);
    doc.save(`Bericht_${report.clientName || 'ohne-name'}.pdf`);
  };

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
            className="h-11 w-11 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Thema umschalten"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-gray-200" />}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => router.push('/')}
          className={`flex items-center gap-2 mb-6 min-h-11 -ml-2 px-2 rounded-lg transition-colors ${textSoft}`}
        >
          <ArrowLeft className="w-5 h-5" />
          Zurück zur Startseite
        </button>

        <h1 className={`text-3xl font-bold ${textMain} mb-8`}>Historie</h1>

        {loading && <p className={textSoft}>Lade Berichte...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && reports.length === 0 && (
          <div className={`${card} ${cardBorder} border rounded-lg shadow-md p-8 text-center`}>
            <p className={textSoft}>Noch keine Berichte gespeichert.</p>
            <p className={`${textSoft} text-sm mt-2 opacity-70`}>Generiere deinen ersten Bericht auf der Startseite.</p>
          </div>
        )}

        <div className="space-y-4">
          {reports.map((report) => {
            const istOffen = offen === report.id;
            return (
              <div key={report.id} className={`${card} ${cardBorder} border rounded-lg shadow-md p-4 sm:p-6`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className={`text-lg font-semibold truncate ${textMain}`}>
                      {report.clientName || 'Ohne Name'}
                    </h2>
                    <p className={`text-sm ${textSoft}`}>
                      {new Date(report.date).toLocaleDateString('de-DE')} · {MODE_NAMES[report.mode] || report.mode}
                    </p>
                    <p className={`text-sm ${textSoft}`}>{report.documentType}</p>
                  </div>
                  <button
                    onClick={() => setOffen(istOffen ? null : report.id)}
                    aria-expanded={istOffen}
                    className={`shrink-0 min-h-11 px-4 flex items-center gap-2 rounded-lg text-sm font-medium transition-colors ${
                      theme === 'light'
                        ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                        : 'bg-indigo-900/40 text-indigo-200 hover:bg-indigo-900/60'
                    }`}
                  >
                    <ChevronDown className={`w-5 h-5 transition-transform ${istOffen ? 'rotate-180' : ''}`} />
                    {istOffen ? 'Zuklappen' : 'Anzeigen'}
                  </button>
                </div>

                {/* Aktionen: immer sichtbar, beschriftet und mit 44px Tap-Hoehe */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={() => copyReport(report.report)}
                    className={`min-h-11 px-4 flex items-center gap-2 rounded-lg text-sm font-medium transition-colors ${
                      theme === 'light'
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    }`}
                  >
                    <Copy className="w-5 h-5" /> Kopieren
                  </button>
                  <button
                    onClick={() => downloadPdf(report)}
                    className="min-h-11 px-4 flex items-center gap-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                  >
                    <Download className="w-5 h-5" /> PDF
                  </button>
                  <button
                    onClick={() => deleteReport(report.id)}
                    className={`min-h-11 px-4 flex items-center gap-2 rounded-lg text-sm font-medium transition-colors ${
                      theme === 'light'
                        ? 'bg-red-50 hover:bg-red-100 text-red-700'
                        : 'bg-red-900/40 hover:bg-red-900/60 text-red-200'
                    }`}
                  >
                    <Trash2 className="w-5 h-5" /> Löschen
                  </button>
                </div>

                {istOffen && (
                  <div className={`mt-4 pt-4 border-t ${cardBorder} prose prose-sm max-w-none ${textReport}`}>
                    <ReactMarkdown>{report.report}</ReactMarkdown>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
