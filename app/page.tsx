'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Lock, Sun, Moon, Copy, Loader2, Download, FileText, ChevronDown, History } from 'lucide-react';
import { UserButton, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import ReactMarkdown from 'react-markdown';
import { getTemplatesByCategory, Template } from '../lib/templates';

// ----------------------------------------------------------------------------------

type Mode = 'hep' | 'ergo';
type SubscriptionStatus = 'active' | 'inactive';
type Theme = 'light' | 'dark';
type DocumentType = 'Fachbericht (ICF)' | 'Tagesdokumentation' | 'Leichte Sprache';

export default function Home() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('hep');
  const [notes, setNotes] = useState('');
  const [clientName, setClientName] = useState('');
  
  const userEmail = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress;
  const isAdmin = userEmail === 'niklas.h112@gmail.com';
  
  const clerkSubscriptionStatus = user?.publicMetadata?.subscriptionStatus as string | undefined;
  const subscriptionStatus: SubscriptionStatus = 
    isAdmin || clerkSubscriptionStatus === 'active' ? 'active' : 'inactive';
  const [theme, setTheme] = useState<Theme>('light');
  const [generatedText, setGeneratedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [lastDocumentType, setLastDocumentType] = useState<DocumentType | null>(null);
  const [reportCount, setReportCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const FREE_REPORT_LIMIT = 3;
  const [showTemplates, setShowTemplates] = useState(false);

  // Speichert den Bericht (ruft track-report auf, um den Freemium-Counter zu erhöhen)
  const saveReport = async (data: any) => {
    try {
      const res = await fetch('/api/track-report', { method: 'POST' });
      const result = await res.json();
      if (result.reportCount !== undefined) {
        setReportCount(result.reportCount);
      }
      if (result.limitReached) {
        setShowPaywall(true);
      }
    } catch (e) {
      console.error('saveReport Fehler:', e);
    }
  };

  // Hole Report-Counter vom Server
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }

    // Hole aktuellen Counter vom Server
    const fetchReportCount = async () => {
      try {
        const response = await fetch('/api/track-report', {
          method: 'GET',
          cache: 'no-store',
        });
        const data = await response.json();
        if (response.ok) {
          setReportCount(data.reportCount || 0);
          // LocalStorage als Backup
          localStorage.setItem('reportCount', (data.reportCount || 0).toString());
        }
      } catch (error) {
        // Fallback: Nutze localStorage
        const savedCount = localStorage.getItem('reportCount');
        if (savedCount) {
          setReportCount(parseInt(savedCount, 10));
        }
      }
    };

    fetchReportCount();
  }, []);

  // Auto-Paywall: Zeige Paywall automatisch an, wenn Limit erreicht
  useEffect(() => {
    if (isLoaded && user && subscriptionStatus !== 'active' && reportCount >= FREE_REPORT_LIMIT) {
      // Warte 1 Sekunde, damit User die Seite sieht, bevor Paywall erscheint
      const timer = setTimeout(() => {
        setShowPaywall(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, user, subscriptionStatus, reportCount]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const insertTemplate = (template: Template) => {
    const currentNotes = notes;
    const newText = currentNotes ? `${currentNotes}\n\n${template.content}` : template.content;
    setNotes(newText);
    setShowTemplates(false);
  };

  const handleGenerate = async (documentType: DocumentType) => {
    if (subscriptionStatus !== 'active' && reportCount >= FREE_REPORT_LIMIT) {
      setShowPaywall(true);
      return;
    }

    setIsGenerating(true);
    setGeneratedText('');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes,
          mode,
          documentType,
          clientName,
        }),
        signal: controller.signal,
        cache: 'no-store',
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server gab kein JSON zurück. Content-Type: ${contentType}. Response: ${text.substring(0, 200)}`);
      }

      const data = await response.json();

      if (response.ok) {
        setGeneratedText(data.result);
        setLastDocumentType(documentType);
        
        if (clientName.trim()) {
          saveReport({
            clientName: clientName.trim(),
            date: new Date().toISOString(),
            mode,
            documentType,
            notes,
            generatedReport: data.result,
          });
        }
        
        // Erhöhe Counter über Server (robuster als localStorage!)
        if (subscriptionStatus !== 'active' && !isAdmin) {
          try {
            const trackResponse = await fetch('/api/track-report', {
              method: 'POST',
              cache: 'no-store',
            });
            const trackData = await trackResponse.json();
            if (trackResponse.ok) {
              setReportCount(trackData.reportCount || 0);
              localStorage.setItem('reportCount', (trackData.reportCount || 0).toString());
              
              // Zeige Paywall sofort, wenn Limit erreicht
              if (trackData.limitReached) {
                setTimeout(() => setShowPaywall(true), 2000);
              }
            }
          } catch (error) {
            // Fallback: LocalStorage
            const newCount = reportCount + 1;
            setReportCount(newCount);
            localStorage.setItem('reportCount', newCount.toString());
          }
        }
      } else {
        alert(`Fehler: ${data.error}`);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        alert('Timeout: Die Anfrage hat zu lange gedauert.');
      } else {
        alert(`Netzwerkfehler: ${error.message || 'Bitte versuchen Sie es erneut.'}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generatedText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      alert('Kopieren fehlgeschlagen');
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;

    const now = new Date();
    const dateStr = now.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    // Logo im PDF (Base64 - muss noch konvertiert werden, für jetzt nur Platzhalter)
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('HEP-QuickWrite', margin, 15);
    doc.text(dateStr, pageWidth - margin, 15, { align: 'right' });

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    const title = lastDocumentType || 'Dokumentation';
    doc.text(title, margin, 30);

    doc.setDrawColor(200, 200, 200);
    doc.line(margin, 35, pageWidth - margin, 35);

    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    
    const lines = doc.splitTextToSize(generatedText, maxWidth);
    
    let y = 45;
    const lineHeight = 7;

    lines.forEach((line: string) => {
      if (y + lineHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    });

    const timestamp = now.toISOString().split('T')[0];
    const filename = `Bericht_${timestamp}.pdf`;
    doc.save(filename);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Lädt...</p>
        </div>
      </div>
    );
  }

  // Login-Screen für nicht-eingeloggte User
  if (!user) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        theme === 'light' 
          ? 'bg-gradient-to-br from-blue-50 to-indigo-100' 
          : 'bg-gradient-to-br from-gray-900 to-gray-800'
      }`}>
        {/* Header mit Theme-Toggle */}
        <header className={`shadow-sm border-b transition-colors duration-300 ${
          theme === 'light' 
            ? 'bg-white border-gray-200' 
            : 'bg-gray-800 border-gray-700'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className={`text-2xl font-bold ${
                theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'
              }`}>HEP-QuickWrite</h1>
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all ${
                  theme === 'light'
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    : 'bg-gray-700 hover:bg-gray-600 text-yellow-300'
                }`}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Login-Screen Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className={`rounded-2xl shadow-2xl p-8 md:p-12 ${
            theme === 'light' ? 'bg-white' : 'bg-gray-800'
          }`}>
            {/* Hero */}
            <div className="text-center mb-10">
              <h2 className={`text-4xl font-bold mb-4 ${
                theme === 'light' ? 'text-gray-900' : 'text-gray-100'
              }`}>
                Willkommen bei HEP-QuickWrite! 👋
              </h2>
              <p className={`text-xl ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-300'
              }`}>
                KI-gestützte Fachberichte für Heilerziehungspflege und Erzieher
              </p>
            </div>

            {/* Vorteile */}
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <div className={`p-6 rounded-lg ${
                theme === 'light' ? 'bg-green-50' : 'bg-green-900/20'
              }`}>
                <CheckCircle className="w-8 h-8 text-green-600 mb-3" />
                <h3 className={`text-lg font-semibold mb-2 ${
                  theme === 'light' ? 'text-gray-900' : 'text-gray-100'
                }`}>
                  3 kostenlose Berichte
                </h3>
                <p className={`text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Nach Registrierung sofort 3 Fachberichte gratis erstellen
                </p>
              </div>

              <div className={`p-6 rounded-lg ${
                theme === 'light' ? 'bg-blue-50' : 'bg-blue-900/20'
              }`}>
                <FileText className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className={`text-lg font-semibold mb-2 ${
                  theme === 'light' ? 'text-gray-900' : 'text-gray-100'
                }`}>
                  ICF-konforme Dokumentation
                </h3>
                <p className={`text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Professionelle Berichte nach ICF-Kriterien
                </p>
              </div>

              <div className={`p-6 rounded-lg ${
                theme === 'light' ? 'bg-purple-50' : 'bg-purple-900/20'
              }`}>
                <History className="w-8 h-8 text-purple-600 mb-3" />
                <h3 className={`text-lg font-semibold mb-2 ${
                  theme === 'light' ? 'text-gray-900' : 'text-gray-100'
                }`}>
                  Klienten-Historie
                </h3>
                <p className={`text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Alle Berichte zentral gespeichert und jederzeit abrufbar
                </p>
              </div>

              <div className={`p-6 rounded-lg ${
                theme === 'light' ? 'bg-indigo-50' : 'bg-indigo-900/20'
              }`}>
                <Lock className="w-8 h-8 text-indigo-600 mb-3" />
                <h3 className={`text-lg font-semibold mb-2 ${
                  theme === 'light' ? 'text-gray-900' : 'text-gray-100'
                }`}>
                  Datenschutz-konform
                </h3>
                <p className={`text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  DSGVO-konforme Speicherung deiner Daten
                </p>
              </div>
            </div>

            {/* Trial Info */}
            <div className={`mb-8 p-6 rounded-lg border-2 ${
              theme === 'light' 
                ? 'bg-amber-50 border-amber-200' 
                : 'bg-amber-900/20 border-amber-700'
            }`}>
              <p className={`text-center font-semibold mb-2 ${
                theme === 'light' ? 'text-amber-800' : 'text-amber-300'
              }`}>
                ⚡ Nach den 3 gratis Berichten:
              </p>
              <p className={`text-center text-sm ${
                theme === 'light' ? 'text-amber-700' : 'text-amber-400'
              }`}>
                7 Tage kostenlos testen, dann nur 10€/Monat für unbegrenzte Berichte
              </p>
            </div>

            {/* Login-Buttons */}
            <div className="space-y-4">
              <a 
                href="/sign-in"
                className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg text-center"
              >
                🚀 Jetzt kostenlos anmelden & 3 Berichte gratis erstellen
              </a>

              <p className={`text-center text-sm ${
                theme === 'light' ? 'text-gray-500' : 'text-gray-400'
              }`}>
                Anmeldung mit Google, E-Mail oder anderen Diensten möglich
              </p>

              <p className={`text-center text-xs ${
                theme === 'light' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Bereits registriert? <a href="/sign-in" className="underline hover:text-indigo-600">Hier anmelden</a>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className={`text-sm ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              <a href="/impressum" className="hover:underline">Impressum</a>
              {' • '}
              <a href="/datenschutz" className="hover:underline">Datenschutz</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'light' 
        ? 'bg-gradient-to-br from-blue-50 to-indigo-100' 
        : 'bg-gradient-to-br from-gray-900 to-gray-800'
    }`}>
      <header className={`shadow-sm border-b transition-colors duration-300 ${
        theme === 'light' 
          ? 'bg-white border-gray-200' 
          : 'bg-gray-800 border-gray-700'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
              <h1 className={`hidden sm:block text-2xl font-bold ${
                theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'
              }`}>HEP-QuickWrite</h1>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-end">
              {user && (
                <span className={`hidden sm:block text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-300'
                }`}>
                  Hallo, {user.firstName || user.emailAddresses[0].emailAddress.split('@')[0]}
                </span>
              )}

              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all ${
                  theme === 'light'
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    : 'bg-gray-700 hover:bg-gray-600 text-yellow-300'
                }`}
              >
                {theme === 'light' ? <Moon className="w-4 h-4 sm:w-5 sm:h-5" /> : <Sun className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
              
              {subscriptionStatus !== 'active' && (
                <>
                  <span className={`text-xs sm:text-sm font-medium ${
                    reportCount >= FREE_REPORT_LIMIT 
                      ? 'text-red-600' 
                      : reportCount >= 2 
                      ? 'text-orange-600' 
                      : theme === 'light' ? 'text-gray-600' : 'text-gray-300'
                  }`}>
                    <span className="hidden sm:inline">Gratis-Berichte: </span>
                    {Math.max(0, FREE_REPORT_LIMIT - reportCount)}/{FREE_REPORT_LIMIT}
                  </span>
                  <button
                    onClick={async () => {
                      if (!user) return;
                      try {
                        const response = await fetch('/api/create-checkout', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            userId: user.id,
                            userEmail: user.primaryEmailAddress?.emailAddress || user.emailAddresses[0].emailAddress,
                          }),
                        });
                        
                        const data = await response.json();
                        
                        if (data.url) {
                          window.location.href = data.url;
                        } else {
                          alert('Fehler: ' + (data.error || 'Unbekannter Fehler'));
                        }
                      } catch (error) {
                        alert('Fehler beim Öffnen des Checkout.');
                      }
                    }}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 rounded-lg transition-all transform hover:scale-105 shadow-md whitespace-nowrap"
                  >
                    <span className="hidden sm:inline">⚡ Upgrade auf Pro</span>
                    <span className="sm:hidden">⚡ Pro</span>
                  </button>
                </>
              )}

              {subscriptionStatus === 'active' ? (
                <span className="flex items-center gap-1 sm:gap-2 text-green-600 text-xs sm:text-sm font-medium whitespace-nowrap">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Abo aktiv</span>
                  <span className="sm:hidden">Abo</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 sm:gap-2 text-orange-600 text-xs sm:text-sm font-medium whitespace-nowrap">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Gratis-Version</span>
                  <span className="sm:hidden">Free</span>
                </span>
              )}

              <button
                onClick={() => router.push('/historie')}
                className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2 ${
                  theme === 'light'
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">Historie</span>
              </button>

              {isAdmin && (
                <a
                  href="/admin"
                  className="px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2"
                >
                  <span>📊</span>
                  <span className="hidden sm:inline">Admin</span>
                </a>
              )}

              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 sm:w-10 sm:h-10"
                  }
                }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`rounded-lg shadow-md p-6 mb-6 transition-colors duration-300 ${
          theme === 'light' ? 'bg-white' : 'bg-gray-800'
        }`}>
          <h2 className={`text-lg font-semibold mb-4 ${
            theme === 'light' ? 'text-gray-800' : 'text-gray-100'
          }`}>Berufsgruppe wählen</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setMode('hep')}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                mode === 'hep'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : theme === 'light'
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-gray-600 text-gray-200 hover:bg-gray-500 border border-gray-500'
              }`}
            >
              Heilerziehungspfleger:in
            </button>
            <button
              onClick={() => setMode('ergo')}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                mode === 'ergo'
                  ? 'bg-teal-600 text-white shadow-lg'
                  : theme === 'light'
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-gray-600 text-gray-200 hover:bg-gray-500 border border-gray-500'
              }`}
            >
              Erzieher:in
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`rounded-lg shadow-md p-6 transition-colors duration-300 ${
            theme === 'light' ? 'bg-white' : 'bg-gray-800'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <label htmlFor="notes" className={`text-lg font-semibold ${
                theme === 'light' ? 'text-gray-800' : 'text-gray-100'
              }`}>
                Tägliche Notizen
              </label>
              
              <div className="relative">
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    theme === 'light'
                      ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                      : 'bg-indigo-900 text-indigo-200 hover:bg-indigo-800'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Vorlagen
                  <ChevronDown className={`w-4 h-4 transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
                </button>

                {showTemplates && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowTemplates(false)}
                    />
                    
                    <div className={`absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-lg shadow-xl z-20 ${
                      theme === 'light' ? 'bg-white border border-gray-200' : 'bg-gray-700 border border-gray-600'
                    }`}>
                      {['standard', 'notfall', 'entwicklung'].map(category => {
                        const templates = getTemplatesByCategory(mode, category);
                        if (templates.length === 0) return null;
                        
                        const categoryNames: Record<string, string> = {
                          standard: 'Standard',
                          notfall: 'Notfall',
                          entwicklung: 'Entwicklung',
                        };
                        
                        return (
                          <div key={category} className="p-2">
                            <div className={`px-3 py-2 text-xs font-semibold uppercase ${
                              theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                              {categoryNames[category]}
                            </div>
                            {templates.map(template => (
                              <button
                                key={template.id}
                                onClick={() => insertTemplate(template)}
                                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                  theme === 'light'
                                    ? 'hover:bg-indigo-50 text-gray-700'
                                    : 'hover:bg-gray-600 text-gray-200'
                                }`}
                              >
                                {template.name}
                              </button>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Klienten-Name (optional, für Historie)"
                className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 transition-all ${
                  theme === 'light'
                    ? 'bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-200 text-gray-900 placeholder-gray-400'
                    : 'bg-gray-700 border-gray-600 focus:border-indigo-400 focus:ring-indigo-900 text-gray-100 placeholder-gray-400'
                }`}
              />
            </div>
            
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                mode === 'hep'
                  ? 'Geben Sie hier Ihre täglichen Beobachtungen als Heilerziehungspfleger:in ein...'
                  : 'Notieren Sie Ihre pädagogischen Beobachtungen...'
              }
              className={`w-full h-64 p-4 border-2 rounded-lg focus:ring-2 transition-all resize-none ${
                theme === 'light'
                  ? 'bg-white border-gray-300 focus:border-indigo-500 focus:ring-indigo-200 text-gray-900 placeholder-gray-400'
                  : 'bg-gray-700 border-gray-600 focus:border-indigo-400 focus:ring-indigo-900 text-gray-100 placeholder-gray-400'
              }`}
            />
            <p className={`mt-2 text-sm ${
              theme === 'light' ? 'text-gray-500' : 'text-gray-400'
            }`}>{notes.length} Zeichen</p>
          </div>

          <div className={`rounded-lg shadow-md p-6 transition-colors duration-300 ${
            theme === 'light' ? 'bg-white' : 'bg-gray-800'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              theme === 'light' ? 'text-gray-800' : 'text-gray-100'
            }`}>Dokument erstellen</h3>
            <div className="space-y-4">
              <button
                onClick={() => {
                  if (!notes.trim()) return;
                  if (subscriptionStatus !== 'active' && reportCount >= FREE_REPORT_LIMIT) {
                    setShowPaywall(true); // Paywall automatisch öffnen!
                    return;
                  }
                  handleGenerate('Fachbericht (ICF)');
                }}
                disabled={!notes.trim()}
                className={`w-full py-4 px-6 rounded-lg font-medium transition-all ${
                  notes.trim()
                    ? (subscriptionStatus === 'active' || reportCount < FREE_REPORT_LIMIT)
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg'
                      : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-md hover:shadow-lg cursor-pointer'
                    : theme === 'light'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                }`}
              >
                📋 Fachbericht (ICF)
              </button>

              <button
                onClick={() => {
                  if (!notes.trim()) return;
                  if (subscriptionStatus !== 'active' && reportCount >= FREE_REPORT_LIMIT) {
                    setShowPaywall(true); // Paywall automatisch öffnen!
                    return;
                  }
                  handleGenerate('Tagesdokumentation');
                }}
                disabled={!notes.trim()}
                className={`w-full py-4 px-6 rounded-lg font-medium transition-all ${
                  notes.trim()
                    ? (subscriptionStatus === 'active' || reportCount < FREE_REPORT_LIMIT)
                      ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg'
                      : 'bg-teal-500 hover:bg-teal-600 text-white shadow-md hover:shadow-lg cursor-pointer'
                    : theme === 'light'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                }`}
              >
                📝 Tagesdokumentation
              </button>

              <button
                onClick={() => {
                  if (!notes.trim()) return;
                  if (subscriptionStatus !== 'active' && reportCount >= FREE_REPORT_LIMIT) {
                    setShowPaywall(true); // Paywall automatisch öffnen!
                    return;
                  }
                  handleGenerate('Leichte Sprache');
                }}
                disabled={!notes.trim()}
                className={`w-full py-4 px-6 rounded-lg font-medium transition-all ${
                  notes.trim()
                    ? (subscriptionStatus === 'active' || reportCount < FREE_REPORT_LIMIT)
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                      : 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg cursor-pointer'
                    : theme === 'light'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                }`}
              >
                💬 Leichte Sprache
              </button>
            </div>

            {subscriptionStatus !== 'active' && reportCount >= FREE_REPORT_LIMIT && (
              <div className={`mt-6 p-4 border rounded-lg ${
                theme === 'light'
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-amber-900/20 border-amber-700'
              }`}>
                <p className={`text-sm font-medium ${
                  theme === 'light' ? 'text-amber-800' : 'text-amber-200'
                }`}>
                  ⚡ Du hast deine 3 kostenlosen Berichte erstellt! Klicke auf einen Button für Pro-Upgrade.
                </p>
              </div>
            )}
          </div>
        </div>

        {(isGenerating || generatedText) && (
          <div className={`mt-6 rounded-lg shadow-md p-6 transition-colors duration-300 ${
            theme === 'light' ? 'bg-white' : 'bg-gray-800'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${
                theme === 'light' ? 'text-gray-800' : 'text-gray-100'
              }`}>
                Generierter Bericht
              </h3>
              {generatedText && !isGenerating && (
                <div className="flex gap-3">
                  <button
                    onClick={handleCopyText}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      copySuccess
                        ? 'bg-green-600 text-white'
                        : theme === 'light'
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                    }`}
                  >
                    <Copy className="w-4 h-4" />
                    {copySuccess ? 'Kopiert!' : 'Text kopieren'}
                  </button>
                  
                  <button
                    onClick={handleDownloadPDF}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      theme === 'light'
                        ? 'bg-teal-600 hover:bg-teal-700 text-white'
                        : 'bg-teal-500 hover:bg-teal-600 text-white'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    Als PDF herunterladen
                  </button>
                </div>
              )}
            </div>

            {isGenerating ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className={`w-12 h-12 animate-spin mx-auto mb-4 ${
                    theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'
                  }`} />
                  <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-300'}>
                    Bericht wird generiert...
                  </p>
                </div>
              </div>
            ) : (
              <div className={`p-4 rounded-lg font-serif leading-relaxed ${
                theme === 'light'
                  ? 'bg-gray-50 text-gray-800'
                  : 'bg-gray-700 text-gray-100'
              }`}>
                <ReactMarkdown>{generatedText}</ReactMarkdown>
              </div>
            )}
          </div>
        )}

        <div className={`mt-6 rounded-lg shadow-md p-6 transition-colors duration-300 ${
          theme === 'light' ? 'bg-white' : 'bg-gray-800'
        }`}>
          <h3 className={`text-lg font-semibold mb-3 ${
            theme === 'light' ? 'text-gray-800' : 'text-gray-100'
          }`}>
            {mode === 'hep' ? 'Heilerziehungspfleger:in' : 'Erzieher:in'} aktiv
          </h3>
          <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-300'}>
            {mode === 'hep'
              ? 'Ihre Notizen werden für Heilerziehungspflege optimiert: ICF-Kriterien, ressourcenorientierte Sprache und professionelle Dokumentation.'
              : 'Ihre Notizen werden für die Erzieher:in optimiert: Fokus auf ganzheitliche Entwicklung, Beobachtung und erzieherische Ziele.'}
          </p>
        </div>
      </main>

      {showPaywall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full rounded-lg shadow-2xl p-8 ${
            theme === 'light' ? 'bg-white' : 'bg-gray-800'
          }`}>
            <div className="text-center">
              {/* Logo im Paywall */}
              <div className="mb-4 flex justify-center">
                  <img src="/logo.jpg" alt="HEP-QuickWrite Logo"
                  className="rounded-lg"
                />
              </div>
              
              <h2 className={`text-2xl font-bold mb-2 ${
                theme === 'light' ? 'text-gray-900' : 'text-gray-100'
              }`}>
                Testphase beendet 🎉
              </h2>
              
              <p className={`text-lg font-semibold mb-6 ${
                theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'
              }`}>
                Werde Profi-Nutzer!
              </p>

              <div className="text-left mb-8 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className={`font-semibold ${
                      theme === 'light' ? 'text-gray-900' : 'text-gray-100'
                    }`}>
                      Unbegrenzte Berichte
                    </p>
                    <p className={`text-sm ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      Erstelle so viele Fachberichte wie du brauchst
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className={`font-semibold ${
                      theme === 'light' ? 'text-gray-900' : 'text-gray-100'
                    }`}>
                      7 Tage kostenlos testen
                    </p>
                    <p className={`text-sm ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      Dann nur 10€/Monat
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className={`font-semibold ${
                      theme === 'light' ? 'text-gray-900' : 'text-gray-100'
                    }`}>
                      Klienten-Historie
                    </p>
                    <p className={`text-sm ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      Alle Berichte zentral gespeichert
                    </p>
                  </div>
                </div>
              </div>

              {/* Trial-Hinweis */}
              <div className={`mb-4 p-4 rounded-lg border-2 ${
                theme === 'light' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-green-900/20 border-green-700'
              }`}>
                <p className={`text-sm font-semibold mb-2 ${
                  theme === 'light' ? 'text-green-800' : 'text-green-300'
                }`}>
                  ✅ 7 Tage komplett kostenlos
                </p>
                <p className={`text-xs ${
                  theme === 'light' ? 'text-green-700' : 'text-green-400'
                }`}>
                  • Keine Zahlung während der Testphase<br />
                  • Jederzeit kündbar<br />
                  • Erste Abbuchung erst am Tag 8 (10€/Monat)
                </p>
              </div>

              {/* Zahlungsmethoden-Hinweis */}
              <div className={`mb-6 p-3 rounded-lg ${
                theme === 'light' 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'bg-blue-900/20 border border-blue-700'
              }`}>
                <p className={`text-xs text-center ${
                  theme === 'light' ? 'text-blue-700' : 'text-blue-300'
                }`}>
                  💳 Bezahlung per <strong>Kreditkarte, Debitkarte oder Bankverbindung</strong>
                </p>
              </div>

              <button
                onClick={async () => {
                  if (!user) return;
                  try {
                    const response = await fetch('/api/create-checkout', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        userId: user.id,
                        userEmail: user.primaryEmailAddress?.emailAddress || user.emailAddresses[0].emailAddress,
                      }),
                    });
                    const data = await response.json();
                    if (data.url) {
                      window.location.href = data.url;
                    } else {
                      alert('Fehler: ' + (data.error || 'Unbekannter Fehler'));
                    }
                  } catch (error) {
                    alert('Fehler beim Öffnen des Checkout.');
                  }
                }}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg mb-3"
              >
                Jetzt 7 Tage kostenlos testen
              </button>

              <p className={`text-xs text-center mb-3 ${
                theme === 'light' ? 'text-gray-500' : 'text-gray-500'
              }`}>
                Kündigung jederzeit möglich über dein Kundenkonto
              </p>

              <button
                onClick={() => setShowPaywall(false)}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                  theme === 'light'
                    ? 'text-gray-600 hover:bg-gray-100'
                    : 'text-gray-400 hover:bg-gray-700'
                }`}
              >
                Später
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className={`mt-16 py-6 border-t transition-colors duration-300 ${
        theme === 'light' ? 'border-gray-200' : 'border-gray-700'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
                <img src="/logo.jpg" alt="HEP-QuickWrite Logo"
                className="rounded h-8 w-8 object-contain"
              />
              <p className={`text-sm ${
                theme === 'light' ? 'text-gray-500' : 'text-gray-400'
              }`}>
                © 2026 HEP-QuickWrite. Alle Rechte vorbehalten.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
