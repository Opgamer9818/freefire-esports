import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

interface Tournament {
  id: string;
  name: string;
  format: string;
  status: string;
  entryFeeCoins: number;
  isFree: boolean;
  slots: number;
  slotsFilled: number;
  date: string;
}

export function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  function load() {
    api.get<Tournament[]>('/admin/tournaments').then(setTournaments).catch(() => {});
  }
  useEffect(load, []);

  async function cancel(id: string) {
    if (!confirm('Cancel this tournament and refund every paid entry?')) return;
    await api.post(`/admin/tournaments/${id}/cancel`, {});
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tournaments</h2>
        <Link to="/tournaments/new" className="rounded bg-gold px-4 py-2 font-semibold text-black hover:bg-gold/90">
          + New Tournament
        </Link>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-gray-400">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Format</th>
              <th className="p-3">Entry</th>
              <th className="p-3">Slots</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tournaments.map((t) => (
              <tr key={t.id} className="border-t border-gray-800">
                <td className="p-3">{t.name}</td>
                <td className="p-3">{t.format}</td>
                <td className="p-3">{t.isFree ? 'Free' : `${t.entryFeeCoins} coins`}</td>
                <td className="p-3">
                  {t.slotsFilled}/{t.slots}
                </td>
                <td className="p-3">{t.status.replace('_', ' ')}</td>
                <td className="p-3">{new Date(t.date).toLocaleDateString()}</td>
                <td className="p-3 space-x-3">
                  <Link to={`/tournaments/${t.id}`} className="text-gold hover:underline">
                    Edit
                  </Link>
                  <Link to={`/tournaments/${t.id}/results`} className="text-gold hover:underline">
                    Results
                  </Link>
                  {t.status !== 'CANCELLED' && (
                    <button onClick={() => cancel(t.id)} className="text-red-400 hover:underline">
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {tournaments.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  No tournaments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
