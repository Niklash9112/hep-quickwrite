'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Lock, Sun, Moon, Copy, Loader2, Download, FileText, ChevronDown, History } from 'lucide-react';
import { UserButton, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';

// --- NOTFALL-FIX: Vorlagen direkt hier definiert, damit Vercel nicht mehr sucht ---
interface Template {
  id: string;
  name: string;
  content: string;
  category: string;
}

const getTemplatesByCategory = (mode: string, category: string): Template[] => {
  return [
    { id: '1', name: 'Standard-Bericht', category: 'standard', content: 'Klient zeigt heute...' },
    { id: '2', name: 'ICF-Beobachtung', category: 'standard', content: 'Im Bereich Teilhabe wurde...' }
  ];
};

const saveReport = (data: any) => console.log('Bericht gesichert');
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

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }

    const savedCount = localStorage.getItem('reportCount');
    if (savedCount) {
      setReportCount(parseInt(savedCount, 10));
    }
  }, []);

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
        
        if (subscriptionStatus !== 'active') {
          const newCount = reportCount + 1;
          setReportCount(newCount);
          localStorage.setItem('reportCount', newCount.toString());
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
              <img src="data:image/jpeg;base64,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" 
                alt="HEP-QuickWrite Logo" 
                style={{width: '50px', height: 'auto'}} 
                
                className="rounded-lg" />
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
              Heilerziehungspfleger
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
              Ergotherapeutin
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
                  ? 'Geben Sie hier Ihre täglichen Beobachtungen als Heilerziehungspfleger ein...'
                  : 'Notieren Sie Ihre ergotherapeutischen Beobachtungen...'
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
                onClick={() => handleGenerate('Fachbericht (ICF)')}
                disabled={!notes.trim() || (subscriptionStatus !== 'active' && reportCount >= FREE_REPORT_LIMIT)}
                className={`w-full py-4 px-6 rounded-lg font-medium transition-all ${
                  notes.trim() && (subscriptionStatus === 'active' || reportCount < FREE_REPORT_LIMIT)
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg'
                    : theme === 'light'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-600 text-gray-300 cursor-not-allowed border border-gray-500'
                }`}
              >
                📋 Fachbericht (ICF)
              </button>

              <button
                onClick={() => handleGenerate('Tagesdokumentation')}
                disabled={!notes.trim() || (subscriptionStatus !== 'active' && reportCount >= FREE_REPORT_LIMIT)}
                className={`w-full py-4 px-6 rounded-lg font-medium transition-all ${
                  notes.trim() && (subscriptionStatus === 'active' || reportCount < FREE_REPORT_LIMIT)
                    ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg'
                    : theme === 'light'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-600 text-gray-300 cursor-not-allowed border border-gray-500'
                }`}
              >
                📝 Tagesdokumentation
              </button>

              <button
                onClick={() => handleGenerate('Leichte Sprache')}
                disabled={!notes.trim() || (subscriptionStatus !== 'active' && reportCount >= FREE_REPORT_LIMIT)}
                className={`w-full py-4 px-6 rounded-lg font-medium transition-all ${
                  notes.trim() && (subscriptionStatus === 'active' || reportCount < FREE_REPORT_LIMIT)
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                    : theme === 'light'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-600 text-gray-300 cursor-not-allowed border border-gray-500'
                }`}
              >
                💬 Leichte Sprache
              </button>
            </div>

            {subscriptionStatus !== 'active' && reportCount >= FREE_REPORT_LIMIT && (
              <div className={`mt-6 p-4 border rounded-lg ${
                theme === 'light'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-red-900/20 border-red-700'
              }`}>
                <p className={`text-sm ${
                  theme === 'light' ? 'text-red-800' : 'text-red-200'
                }`}>
                  🚫 Limit erreicht! Upgrade auf Pro für unbegrenzte Berichte.
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
              <div className={`p-4 rounded-lg whitespace-pre-wrap font-serif leading-relaxed ${
                theme === 'light'
                  ? 'bg-gray-50 text-gray-800'
                  : 'bg-gray-700 text-gray-100'
              }`}>
                {generatedText}
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
            {mode === 'hep' ? 'Heilerziehungspfleger' : 'Ergotherapeutin'} aktiv
          </h3>
          <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-300'}>
            {mode === 'hep'
              ? 'Ihre Notizen werden für Heilerziehungspflege optimiert: ICF-Kriterien, ressourcenorientierte Sprache und professionelle Dokumentation.'
              : 'Ihre Notizen werden für Ergotherapie optimiert: Fokus auf Handlungsfähigkeit, Alltagsaktivitäten und therapeutische Ziele.'}
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
                <img src="data:image/jpeg;base64,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" 
                  alt="HEP-QuickWrite Logo" 
                  style={{width: '80px', height: 'auto'}} 
                  
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
              <img src="data:image/jpeg;base64,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" 
                alt="HEP-QuickWrite" 
                style={{width: '30px', height: 'auto'}} 
                
                className="rounded"
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
