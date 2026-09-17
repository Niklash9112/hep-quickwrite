'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function AGB() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Allgemeine Geschäftsbedingungen (AGB)</h1>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Geltungsbereich</h2>
              <p className="leading-relaxed">
                Diese Allgemeinen Geschäftsbedingungen (nachfolgend "AGB") gelten für die Nutzung der 
                Softwareanwendung "HEP-QuickWrite" (nachfolgend "die Anwendung"), einer KI-gestützten 
                Unterstützung zur Erstellung von Fachberichten für die Pflege und Pädagogik, betrieben von:
              </p>
              <p className="mt-4">
                <strong>Niklas Hornung</strong><br />
                48531 Nordhorn<br />
                E-Mail: niklas.h112@gmail.com
              </p>
              <p className="mt-4 leading-relaxed">
                Abweichende Bedingungen der Nutzer:innen gelten nicht, soweit wir ihnen nicht ausdrücklich zustimmen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Leistungsbeschreibung</h2>
              <p className="leading-relaxed">
                Die Anwendung unterstützt Fachkräfte aus Pflege und Pädagogik (u. a. Heilerziehungspflege, 
                Erziehung, Altenpflege, Therapie, Case Management, ambulante Pflege) bei der Erstellung 
                von Dokumentationsentwürfen. Auf Basis der von den Nutzer:innen eingegebenen Notizen 
                generiert ein KI-Modell einen strukturierten Berichtsentwurf.
              </p>
              <p className="mt-3 leading-relaxed">
                Die vollständige Funktionsnutzung erfolgt über einen kostenpflichtigen Abo-Vertrag 
                (nachfolgend "bezahltes Abo"). Es besteht die Möglichkeit, die Anwendung im Rahmen eines 
                kostenlosen Testzeitraums zu prüfen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. KI-generierte Inhalte — Art. 50 EU-KI-Verordnung</h2>
              <p className="leading-relaxed">
                Die generierten Berichte sind <strong>KI-generierte Inhalte</strong> im Sinne des Art. 50 der 
                EU-Verordnung 2024/1689 (EU-KI-Verordnung). Den Nutzer:innen wird hiermit transparent 
                mitgeteilt, dass die vom System erzeugten Texte maschinell erstellt und nicht von einem 
                Menschen verfasst wurden.
              </p>
              <p className="mt-3 leading-relaxed">
                Die Anwendung ist als KI-System mit geringem Risiko einzuordnen. Sie dient ausschließlich 
                der <strong>Unterstützung und Entwurfsfindung</strong>. Sie trifft keine Entscheidungen über 
                medizinische Diagnosen, Behandlungen oder Leistungsansprüche.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Eigenverantwortung und Haftung für Berichtsinhalte</h2>
              <p className="leading-relaxed">
                Die von der Anwendung erzeugten Berichte sind <strong>Entwürfe</strong> und 
                <strong> keine verbindlichen, rechts- oder fachlich abschließenden Dokumente</strong>. 
                Die alleinige fachliche, inhaltliche und rechtliche Verantwortung für den finalen 
                Bericht, insbesondere für die inhaltliche Richtigkeit, Vollständigkeit, Vertraulichkeit 
                und rechtlichen Anforderungen der Dokumentation, trägt die jeweilige Fachkraft 
                beziehungsweise die verantwortliche Einrichtung.
              </p>
              <p className="mt-3 leading-relaxed">
                Die Nutzer:innen sind verpflichtet, jeden generierten Entwurf vor Verwendung 
                sorgfältig zu prüfen und ggf. fachlich zu korrigieren. Die Anwendung ersetzt weder die 
                fachliche Beurteilung noch die eigenständige Dokumentationsverantwortung der 
                Nutzer:innen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Datenschutz</h2>
              <p className="leading-relaxed">
                Die Verarbeitung personenbezogener Daten, einschließlich besonderer Kategorien 
                (Gesundheits- und Sozialdaten) erfolgt ausschließlich im Rahmen der gesetzlichen 
                Vorgaben der Datenschutz-Grundverordnung (DSGVO). Es gelten insbesondere die 
                Regelungen gemäß <strong>Art. 9 DSGVO</strong> für besondere Kategorien personenbezogener Daten.
              </p>
              <p className="mt-3 leading-relaxed">
                Es liegt in der Verantwortung der Nutzer:innen, in Bezug auf die von ihnen eingegebenen 
                Daten die erforderlichen Rechtsgrundlagen (insbesondere Einwilligungen oder 
                gesetzliche Erlaubnisse) sicherzustellen und gegenüber ihren eigenen Klient:innen 
                datenschutzkonform zu handeln. Wir empfehlen, bei der Erfassung von Klienten-Informationen 
                nur die datenschutzrechtlich erforderlichen Angaben zu verwenden und personenbezogene 
                Daten nach Möglichkeit zu pseudonymisieren (z. B. durch Kürzel oder Fantasienamen).
              </p>
              <p className="mt-3 leading-relaxed">
                Weitere Informationen finden Sie in unserer <a 
                  href="/datenschutz" 
                  className="text-indigo-600 hover:underline"
                >Datenschutzerklärung</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Registrierung und Benutzerkonto</h2>
              <p className="leading-relaxed">
                Für die Nutzung der Anwendung ist eine Registrierung erforderlich. Die Nutzer:innen sind 
                verpflichtet, ihre Zugangsdaten geheim zu halten und unbefugten Dritten keinen Zugang 
                zu gewähren. Jede Nutzer:in ist für alle Aktivitäten verantwortlich, die über das eigene 
                Konto erfolgen. Bei Anzeichen eines Missbrauchs ist der Anbieter unverzüglich zu informieren.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Bezahltes Abo, Preise und Zahlung</h2>
              <p className="leading-relaxed">
                Die vollständige Funktionsnutzung erfolgt über ein kostenpflichtiges Abonnement 
                (nachfolgend "Abo"), das als wiederkehrendes Abo (monatlich) über den 
                Zahlungsdienstleister Stripe abgerechnet wird. Die jeweils geltenden Preise werden 
                vor Abschluss des Abos transparent angezeigt.
              </p>
              <p className="mt-3 leading-relaxed">
                Die Zahlung erfolgt über die von Stripe unterstützten Zahlungsmethoden. Bei 
                Zahlungsverzug behalten wir uns vor, den Zugang zur Anwendung vorübergehend zu sperren.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Laufzeit und Kündigung</h2>
              <p className="leading-relaxed">
                Das Abo verlängert sich automatisch um denselben Zeitraum, sofern es nicht fristgerecht 
                gekündigt wird. Die Kündigung kann jederzeit in der Anwendung oder per E-Mail erfolgen 
                und wird zum Ende des aktuellen Abrechnungszeitraums wirksam. Eine anteilige 
                Rückerstattung bereits gezahlter Beträge für den Restzeitraum erfolgt nicht.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Widerrufsrecht</h2>
              <p className="leading-relaxed">
                Verbraucher:innen steht bei Abschluss des Abos ein gesetzliches Widerrufsrecht von 
                14 Tagen zu. Die Widerrufsfrist beginnt mit Abschluss des Vertrags. Bei wirksamem 
                Widerruf bereits in Anspruch genommener Leistungen ist der anteilige Betrag zu erstatten.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Verfügbarkeit der Anwendung</h2>
              <p className="leading-relaxed">
                Wir sind bemüht, die Anwendung möglichst unterbrechungsfrei verfügbar zu halten. Wir 
                übernehmen jedoch keine Gewähr für eine ununterbrochene oder fehlerfreie Verfügbarkeit, 
                insbesondere nicht für Ausfälle durch Wartung, technische Störungen, höhere Gewalt 
                oder das Verhalten Dritter (z. B. Netzbetreiber, Hosting-Anbieter).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Haftung</h2>
              <p className="leading-relaxed">
                Wir haften unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie für Schäden aus der 
                Verletzung des Lebens, des Körpers oder der Gesundheit und nach Maßgabe des 
                Produkthaftungsgesetzes.
              </p>
              <p className="mt-3 leading-relaxed">
                Bei einfacher Fahrlässigkeit haften wir nur, soweit wesentliche Vertragspflichten 
                (Kardinalpflichten) verletzt sind; die Haftung ist in diesen Fällen auf den vertragstypischen, 
                vorhersehbaren Schaden begrenzt. Für mittelbare Schäden, entgangenen Gewinn und 
                Folgeschäden haften wir bei einfacher Fahrlässigkeit nicht.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Rechte an der Software</h2>
              <p className="leading-relaxed">
                Die Anwendung, ihre Bestandteile, das Logo, der Code und alle grafischen Elemente sind 
                urheberrechtlich geschützt. Der Anbieter räumt den Nutzer:innen ein nicht ausschließliches, 
                nicht übertragbares, zeitlich befristetes Nutzungsrecht an der Anwendung im Rahmen dieser 
                AGB ein. Eine Vervielfältigung, Verbreitung oder öffentliche Wiedergabe der Anwendung oder 
                einzelner Bestandteile ist nicht gestattet.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Streitbeilegung</h2>
              <p className="leading-relaxed">
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
                <a 
                  href="https://ec.europa.eu/consumers/odr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline ml-1"
                >
                  https://ec.europa.eu/consumers/odr
                </a>. Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer 
                Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">14. Änderungen der AGB</h2>
              <p className="leading-relaxed">
                Wir behalten uns vor, diese AGB anzupassen, soweit dies erforderlich ist (z. B. bei 
                rechtlichen oder technischen Änderungen). Nutzer:innen werden über wesentliche Änderungen 
                rechtzeitig informiert. Die Änderungen gelten als genehmigt, sofern die Nutzer:innen nicht 
                innerhalb von zwei Wochen nach Erhalt der Information widersprechen. Bei Widerspruch 
                endet das Vertragsverhältnis zum nächstmöglichen Zeitpunkt.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">15. Schlussbestimmungen</h2>
              <p className="leading-relaxed">
                Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts 
                (CISG). Gerichtsstand ist, soweit gesetzlich zulässig, der Sitz des Anbieters. 
                Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der 
                übrigen Bestimmungen unberührt.
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
            <nav className="flex gap-4">
              <a href="/impressum" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">Impressum</a>
              <a href="/agb" className="text-sm text-indigo-600 font-medium">AGB</a>
              <a href="/datenschutz" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">Datenschutz</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
