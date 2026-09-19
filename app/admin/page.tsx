'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import Image from 'next/image';

interface UserRow {
  id: string;
  email: string;
  name: string;
  subscriptionStatus: string;
  reportCount: number;
  createdAt: number;
}

interface AdminData {
  totalUsers: number;
  abonnenten: number;
  neueAnmeldungen30: number;
  summeNutzung: number;
  users: UserRow[];
}

type Theme = 'light' | 'dark';

export default function Admin() {
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>('light');
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) setTheme(savedTheme);
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin', { cache: 'no-store' });
        if (res.status === 401) { router.push('/sign-in'); return; }
        const d = await res.json();
        if (res.ok) setData(d);
        else setError(d.error || 'Fehler beim Laden');
      } catch {
        setError('Fehler beim Laden');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
  };

  const card = (theme === 'light' ? 'bg-white' : 'bg-gray-800');
  const cardBorder = theme === 'light' ? 'border-gray-200' : 'border-gray-700';
  const textMain = theme === 'light' ? 'text-gray-900' : 'text-gray-100';
  const textSoft = theme === 'light' ? 'text-gray-500' : 'text-gray-400';
  const rowBorder = theme === 'light' ? 'border-gray-200' : 'border-gray-700';

  const Stat = ({ label, value, icon }: { label: string; value: number | string; icon: string }) => (
    <div className={`${card} ${cardBorder} border rounded-lg shadow-md p-5`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className={`${textSoft} text-sm font-medium`}>{label}</span>
      </div>
      <p className={`text-3xl font-bold ${textMain}`}>{value}</p>
    </div>
  );

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
          className={`flex items-center gap-2 mb-8 transition-colors ${textSoft} hover:${theme === 'light' ? 'text-indigo-700' : 'text-indigo-400'}`}
        >
          <ArrowLeft className="w-5 h-5" />
          Zurück zur Startseite
        </button>

        <h1 className={`text-3xl font-bold ${textMain} mb-8`}>Admin</h1>

        {loading && <p className={textSoft}>Lade...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {data && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Stat label="User gesamt" value={data.totalUsers} icon="👥" />
              <Stat label="Abonnenten" value={data.abonnenten} icon="💳" />
              <Stat label="Neue (30 Tage)" value={data.neueAnmeldungen30} icon="🆕" />
              <Stat label="Berichte (gesamt)" value={data.summeNutzung} icon="📝" />
            </div>

            <div className={`${card} ${cardBorder} border rounded-lg shadow-md p-6`}>
              <h2 className={`text-xl font-semibold ${textMain} mb-4`}>User</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className={`${textSoft} ${rowBorder} border-b`}>
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">E-Mail</th>
                      <th className="py-2 pr-4">User-ID</th>
                      <th className="py-2 pr-4">Abo</th>
                      <th className="py-2 pr-4">Berichte</th>
                      <th className="py-2">Registriert</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.users.map((u) => (
                      <tr key={u.id} className={`${rowBorder} border-b last:border-0`}>
                        <td className={`py-2 pr-4 ${textMain}`}>{u.name}</td>
                        <td className={`py-2 pr-4 ${textSoft}`}>{u.email}</td>
                        <td className={`py-2 pr-4 font-mono text-xs ${textSoft}`}>{u.id.slice(-8)}</td>
                        <td className="py-2 pr-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            u.subscriptionStatus === 'active'
                              ? 'bg-green-100 text-green-700'
                              : theme === 'light' ? 'bg-gray-100 text-gray-600' : 'bg-gray-700 text-gray-300'
                          }`}>
                            {u.subscriptionStatus === 'active' ? 'Aktiv' : u.subscriptionStatus}
                          </span>
                        </td>
                        <td className={`py-2 pr-4 ${textMain}`}>{u.reportCount}</td>
                        <td className={`py-2 ${textSoft}`}>{u.createdAt ? new Date(u.createdAt * 1000).toLocaleDateString('de-DE') : '-'}</td>
                      </tr>
                    ))}
                    {data.users.length === 0 && (
                      <tr><td colSpan={6} className={`py-4 ${textSoft}`}>Keine User vorhanden.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
