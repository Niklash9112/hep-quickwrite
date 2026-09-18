'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
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

export default function Admin() {
  const router = useRouter();
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

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

  const Stat = ({ label, value, icon }: { label: string; value: number | string; icon: string }) => (
    <div className="bg-white rounded-lg shadow-md p-5">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-gray-500 text-sm font-medium">{label}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );

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

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin</h1>

        {loading && <p className="text-gray-500">Lade...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {data && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Stat label="User gesamt" value={data.totalUsers} icon="👥" />
              <Stat label="Abonnenten" value={data.abonnenten} icon="💳" />
              <Stat label="Neue (30 Tage)" value={data.neueAnmeldungen30} icon="🆕" />
              <Stat label="Berichte (gesamt)" value={data.summeNutzung} icon="📝" />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">User</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-gray-500 border-b">
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">E-Mail</th>
                      <th className="py-2 pr-4">Abo</th>
                      <th className="py-2 pr-4">Berichte</th>
                      <th className="py-2">Registriert</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.users.map((u) => (
                      <tr key={u.id} className="border-b last:border-0">
                        <td className="py-2 pr-4">{u.name}</td>
                        <td className="py-2 pr-4">{u.email}</td>
                        <td className="py-2 pr-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            u.subscriptionStatus === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {u.subscriptionStatus === 'active' ? 'Aktiv' : u.subscriptionStatus}
                          </span>
                        </td>
                        <td className="py-2 pr-4">{u.reportCount}</td>
                        <td className="py-2">{u.createdAt ? new Date(u.createdAt * 1000).toLocaleDateString('de-DE') : '-'}</td>
                      </tr>
                    ))}
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
