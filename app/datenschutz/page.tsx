'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function Datenschutz() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
            <Image 
              src="/logo.jpg" 
              alt="HEP-QuickWrite Logo" 
              width={40} 
              height={40}
              className="rounded-lg"
            />
            <h1 className="text-2xl font-bold text-indigo-600">HEP-QuickWrite</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Zurück zur Startseite
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Datenschutzerklärung</h1>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Datenschutz auf einen Blick</h2>
              
              <h3 className="font-semibold text-gray-900 mt-4 mb-2">Allgemeine Hinweise</h3>
              <p className="leading-relaxed">
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten 
                passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie 
                persönlich identifiziert werden können.
              </p>

              <h3 className="font-semibold text-gray-900 mt-4 mb-2">Datenerfassung auf dieser Website</h3>
              <p className="leading-relaxed">
                <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br />
                Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten 
                können Sie dem Impressum dieser Website entnehmen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Hosting und Content Delivery Networks (CDN)</h2>
              
              <h3 className="font-semibold text-gray-900 mt-4 mb-2">Vercel Hosting</h3>
              <p className="leading-relaxed">
                Diese Website wird bei Vercel Inc. gehostet. Die Server befinden sich in den USA und der EU. 
                Vercel erhebt und speichert automatisch Informationen in sogenannten Server-Log-Dateien, die Ihr 
                Browser automatisch übermittelt. Dies sind: Browsertyp und Browserversion, verwendetes Betriebssystem, 
                Referrer URL, Hostname des zugreifenden Rechners, Uhrzeit der Serveranfrage, IP-Adresse.
              </p>
              <p className="mt-2 leading-relaxed">
                Weitere Informationen finden Sie in der Datenschutzerklärung von Vercel: 
                <a 
                  href="https://vercel.com/legal/privacy-policy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline ml-1"
                >
                  https://vercel.com/legal/privacy-policy
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Allgemeine Hinweise und Pflichtinformationen</h2>
              
              <h3 className="font-semibold text-gray-900 mt-4 mb-2">Datenschutz</h3>
              <p className="leading-relaxed">
                Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten 
                vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
              </p>

              <h3 className="font-semibold text-gray-900 mt-4 mb-2">Hinweis zur verantwortlichen Stelle</h3>
              <p className="bg-yellow-50 border border-yellow-200 rounded p-4 text-sm">
                <strong>⚠️ PLATZHALTER - Bitte ausfüllen:</strong>
              </p>
              <p className="mt-4">
                <strong>[Dein vollständiger Name / Firmenname]</strong><br />
                [Straße und Hausnummer]<br />
                [PLZ und Ort]<br />
                E-Mail: [deine@email.de]
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Datenerfassung auf dieser Website</h2>
              
              <h3 className="font-semibold text-gray-900 mt-4 mb-2">Cookies</h3>
              <p className="leading-relaxed">
                Diese Website verwendet nur technisch notwendige Cookies zur Speicherung Ihrer Report-Zähler 
                (für die 3 Gratis-Berichte). Diese Daten werden nicht mit anderen Daten zusammengeführt.
              </p>

              <h3 className="font-semibold text-gray-900 mt-4 mb-2">Server-Log-Dateien</h3>
              <p className="leading-relaxed">
                Der Provider der Seiten erhebt und speichert automatisch Informationen in Server-Log-Dateien, 
                die Ihr Browser automatisch übermittelt. Diese Daten werden nach 7 Tagen automatisch gelöscht.
              </p>

              <h3 className="font-semibold text-gray-900 mt-4 mb-2">Kontakt- und Registrierungsformular</h3>
              <p className="leading-relaxed">
                Wenn Sie sich auf dieser Website registrieren, werden Ihre eingegebenen Daten (E-Mail-Adresse, Name) 
                bei uns gespeichert. Diese Daten werden ausschließlich für die Bereitstellung der Dienste verwendet.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Analyse-Tools und Tools von Drittanbietern</h2>
              
              <h3 className="font-semibold text-gray-900 mt-4 mb-2">Clerk (Authentifizierung)</h3>
              <p className="leading-relaxed">
                Wir nutzen Clerk für die Benutzer-Authentifizierung. Clerk speichert Ihre E-Mail-Adresse und ggf. 
                Profilbilder. Weitere Informationen finden Sie in der Datenschutzerklärung von Clerk: 
                <a 
                  href="https://clerk.com/legal/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline ml-1"
                >
                  https://clerk.com/legal/privacy
                </a>
              </p>

              <h3 className="font-semibold text-gray-900 mt-4 mb-2">Stripe (Zahlungsabwicklung)</h3>
              <p className="leading-relaxed">
                Wir nutzen Stripe für die Zahlungsabwicklung. Stripe erhebt Zahlungsdaten (Kreditkarteninformationen, 
                PayPal, etc.). Diese Daten werden direkt an Stripe übermittelt und nicht auf unseren Servern gespeichert. 
                Weitere Informationen: 
                <a 
                  href="https://stripe.com/de/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline ml-1"
                >
                  https://stripe.com/de/privacy
                </a>
              </p>

              <h3 className="font-semibold text-gray-900 mt-4 mb-2">Google Gemini API (KI-Textgenerierung)</h3>
              <p className="leading-relaxed">
                Wir nutzen die Google Gemini API zur Generierung von Berichten. Ihre eingegebenen Notizen werden an 
                Google übermittelt, um den Bericht zu erstellen. Diese Daten werden nach der Verarbeitung nicht gespeichert. 
                Weitere Informationen: 
                <a 
                  href="https://policies.google.com/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline ml-1"
                >
                  https://policies.google.com/privacy
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Ihre Rechte</h2>
              <p className="leading-relaxed">
                Sie haben jederzeit das Recht auf:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Auskunft über Ihre bei uns gespeicherten Daten</li>
                <li>Berichtigung unrichtiger Daten</li>
                <li>Löschung Ihrer bei uns gespeicherten Daten</li>
                <li>Einschränkung der Datenverarbeitung</li>
                <li>Datenübertragbarkeit</li>
                <li>Widerspruch gegen die Datenverarbeitung</li>
                <li>Beschwerde bei einer Aufsichtsbehörde</li>
              </ul>
              <p className="mt-4 leading-relaxed">
                Kontaktieren Sie uns unter: <strong>[deine@email.de]</strong>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Datenspeicherung</h2>
              <p className="leading-relaxed">
                <strong>Klienten-Historie:</strong> Berichte werden ausschließlich lokal in Ihrem Browser gespeichert 
                (localStorage). Wir haben keinen Zugriff auf diese Daten.
              </p>
              <p className="mt-2 leading-relaxed">
                <strong>Benutzer-Account-Daten:</strong> Werden bei Clerk gespeichert und können jederzeit gelöscht werden.
              </p>
              <p className="mt-2 leading-relaxed">
                <strong>Zahlungsdaten:</strong> Werden ausschließlich bei Stripe gespeichert, nicht auf unseren Servern.
              </p>
            </section>

            <section className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Änderungen dieser Datenschutzerklärung</h2>
              <p className="leading-relaxed">
                Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen 
                Anforderungen entspricht oder um Änderungen unserer Leistungen in der Datenschutzerklärung umzusetzen.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-gray-500">
              Zuletzt aktualisiert: {new Date().toLocaleDateString('de-DE')}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-6 border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Image 
                src="/logo.jpg" 
                alt="HEP-QuickWrite" 
                width={30} 
                height={30}
                className="rounded"
              />
              <p className="text-sm text-gray-500">
                © 2026 HEP-QuickWrite. Alle Rechte vorbehalten.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
