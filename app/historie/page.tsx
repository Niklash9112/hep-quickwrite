'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Copy, Download } from 'lucide-react';
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

const MODE_NAMES: Record<string, string> = {
  hep: 'Heilerziehungspfleger:in',
  ergo: 'Erzieher:in',
  altenpflege: 'Altenpfleger:in',
  logopaedie: 'Logopäde:in',
};

export default function Historie() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
            <Image src="/logo.jpg" alt="HEP-QuickWrite Logo" width={40} height={40} className="rounded-lg" />
            <h1 className="text-2xl font-bold text-indigo-600">HEP-QuickWrite</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Zurück zur Startseite
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Historie</h1>

        {loading && <p className="text-gray-500">Lade Berichte...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && reports.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">Noch keine Berichte gespeichert.</p>
            <p className="text-gray-400 text-sm mt-2">Generiere deinen ersten Bericht auf der Startseite.</p>
          </div>
        )}

        <div className="space-y-6">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {report.clientName || 'Ohne Name'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {new Date(report.date).toLocaleDateString('de-DE')} · {MODE_NAMES[report.mode] || report.mode} · {report.documentType}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyReport(report.report)}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
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
              <div className="prose prose-sm max-w-none text-gray-700">
                <ReactMarkdown>{report.report}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
