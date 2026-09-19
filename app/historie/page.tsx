'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Copy, Download, Moon, Sun } from 'lucide-react';
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
};

export default function Historie() {
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>('light');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

        <h1 className={`text-3xl font-bold ${textMain} mb-8`}>Historie</h1>

        {loading && <p className={textSoft}>Lade Berichte...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && reports.length === 0 && (
          <div className={`${card} ${cardBorder} border rounded-lg shadow-md p-8 text-center`}>
            <p className={textSoft}>Noch keine Berichte gespeichert.</p>
            <p className={`${textSoft} text-sm mt-2 opacity-70`}>Generiere deinen ersten Bericht auf der Startseite.</p>
          </div>
        )}

        <div className="space-y-6">
          {reports.map((report) => (
            <div key={report.id} className={`${card} ${cardBorder} border rounded-lg shadow-md p-6`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className={`text-lg font-semibold ${textMain}`}>
                    {report.clientName || 'Ohne Name'}
                  </h2>
                  <p className={`text-sm ${textSoft}`}>
                    {new Date(report.date).toLocaleDateString('de-DE')} · {MODE_NAMES[report.mode] || report.mode} · {report.documentType}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyReport(report.report)}
                    className={`p-2 rounded-lg ${
                      theme === 'light' ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    }`}
                    title="Kopieren"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => downloadPdf(report)}
                    className="p-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-700"
                    title="PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteReport(report.id)}
                    className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700"
                    title="Löschen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className={`prose prose-sm max-w-none ${textReport}`}>
                <ReactMarkdown>{report.report}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
