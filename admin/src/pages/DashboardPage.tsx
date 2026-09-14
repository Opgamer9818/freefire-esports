import { useEffect, useState } from 'react';
import { api } from '../api/client';

interface Stats {
  totalUsers: number;
  pendingPayments: number;
  pendingRedeems: number;
  totalTournaments: number;
  totalRegistrations: number;
}

export function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get<Stats>('/admin/dashboard/stats').then(setStats).catch(() => {});
  }, []);

  const cards = stats
    ? [
        { label: 'Total Users', value: stats.totalUsers },
        { label: 'Pending Payments', value: stats.pendingPayments },
        { label: 'Pending Redeems', value: stats.pendingRedeems },
        { label: 'Tournaments', value: stats.totalTournaments },
        { label: 'Registrations', value: stats.totalRegistrations },
      ]
    : [];

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Dashboard</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-gray-800 bg-surface p-4">
            <p className="text-sm text-gray-400">{c.label}</p>
            <p className="mt-1 text-2xl font-bold text-gold">{c.value}</p>
          </div>
        ))}
        {!stats && <p className="text-gray-500">Loading…</p>}
      </div>
    </div>
  );
}
