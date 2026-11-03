"use client";

import { useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';

// Öffentliche Seite für die Google-Play-Vorgabe "Löschung des Kontos":
// Der Löschweg muss ohne App erreichbar sein.
export default function KontoLoeschen() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [bestaetigen, setBestaetigen] = useState(false);
  const [laeuft, setLaeuft] = useState(false);
  const [fertig, setFertig] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  async function loeschen() {
    setLaeuft(true);
    setFehler(null);
    try {
      const res = await fetch('/api/delete-account', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setFehler(data.error || 'Löschen fehlgeschlagen');
      } else {
        setFertig(true);
        await signOut({ redirectUrl: '/' });
      }
    } catch {
      setFehler('Löschen fehlgeschlagen. Bitte später erneut versuchen.');
    } finally {
      setLaeuft(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="mx-auto max-w-xl rounded-lg bg-white p-8 shadow-xl">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">Konto löschen</h1>

        {!isLoaded ? (
          <p className="text-gray-600">Wird geladen …</p>
        ) : !user ? (
          <>
            <p className="mb-4 text-gray-700">
              Bitte melde dich an, damit wir dein Konto eindeutig zuordnen können.
            </p>
            <a
              href="/sign-in"
              className="inline-block rounded-lg bg-indigo-600 px-6 py-3 font-bold text-white hover:bg-indigo-700"
            >
              Zur Anmeldung
            </a>
          </>
        ) : fertig ? (
          <p className="text-gray-700">
            Dein Konto und alle gespeicherten Berichte wurden gelöscht.
          </p>
        ) : (
          <>
            <p className="mb-2 text-gray-700">
              Angemeldet als <strong>{user.primaryEmailAddress?.emailAddress}</strong>.
            </p>
            <p className="mb-6 text-sm text-gray-600">
              Beim Löschen werden dein Benutzerkonto und alle in der App gespeicherten
              Berichte endgültig entfernt. Das lässt sich nicht rückgängig machen.
              Zahlungsdaten liegen bei Stripe und werden dort nach den gesetzlichen
              Aufbewahrungsfristen gelöscht.
            </p>
            {fehler && <p className="mb-4 text-sm text-red-600">{fehler}</p>}
            {!bestaetigen ? (
              <button
                onClick={() => setBestaetigen(true)}
                className="rounded-lg bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700"
              >
                Konto löschen
              </button>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={loeschen}
                  disabled={laeuft}
                  className="rounded-lg bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {laeuft ? 'Wird gelöscht …' : 'Ja, endgültig löschen'}
                </button>
                <button
                  onClick={() => setBestaetigen(false)}
                  className="rounded-lg bg-gray-200 px-6 py-3 font-bold text-gray-800 hover:bg-gray-300"
                >
                  Abbrechen
                </button>
              </div>
            )}
          </>
        )}

        <p className="mt-8 text-sm text-gray-500">
          <a href="/" className="hover:underline">Zurück zur Startseite</a>
        </p>
      </div>
    </main>
  );
}
