import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';

interface Registration {
  id: string;
  userId: string;
  teamId: string | null;
  user: { email: string | null; phone: string | null; profile: { ffIgn: string | null } | null };
}

interface ResultRow {
  userId: string;
  rank: number | null;
  kills: number;
  points: number;
  prizeCoins: number;
  processed: boolean;
}

interface EntryState {
  rank: string;
  kills: string;
  points: string;
  prizeCoins: string;
}

export function TournamentResultsPage() {
  const { id } = useParams();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [existing, setExisting] = useState<ResultRow[]>([]);
  const [entries, setEntries] = useState<Record<string, EntryState>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    api.get<Registration[]>(`/admin/tournaments/${id}/registrations`).then(setRegistrations).catch(() => {});
    api.get<ResultRow[]>(`/admin/tournaments/${id}/results`).then((results) => {
      setExisting(results);
      const initial: Record<string, EntryState> = {};
      results.forEach((r) => {
        initial[r.userId] = {
          rank: r.rank?.toString() ?? '',
          kills: r.kills?.toString() ?? '0',
          points: r.points?.toString() ?? '0',
          prizeCoins: r.prizeCoins?.toString() ?? '0',
        };
      });
      setEntries(initial);
    }).catch(() => {});
  }, [id]);

  function setField(userId: string, field: keyof EntryState, value: string) {
    setEntries((prev) => ({
      ...prev,
      [userId]: { rank: '', kills: '0', points: '0', prizeCoins: '0', ...prev[userId], [field]: value },
    }));
  }

  function isProcessed(userId: string) {
    return existing.find((r) => r.userId === userId)?.processed ?? false;
  }

  async function publish() {
    if (!id) return;
    const results = registrations
      .filter((r) => !isProcessed(r.userId))
      .map((r) => {
        const e = entries[r.userId] ?? { rank: '', kills: '0', points: '0', prizeCoins: '0' };
        return {
          userId: r.userId,
          teamId: r.teamId ?? undefined,
          rank: e.rank ? Number(e.rank) : undefined,
          kills: Number(e.kills) || 0,
          points: Number(e.points) || 0,
          prizeCoins: Number(e.prizeCoins) || 0,
        };
      })
      .filter((r) => r.rank !== undefined || r.prizeCoins > 0);

    if (results.length === 0) {
      setMessage('Nothing to publish — fill in at least a rank or prize for someone first.');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      await api.post(`/admin/tournaments/${id}/results`, { results });
      setMessage('Results published — prizes credited to the wallets above.');
      const refreshed = await api.get<ResultRow[]>(`/admin/tournaments/${id}/results`);
      setExisting(refreshed);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not publish results');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Link to="/tournaments" className="text-sm text-gold hover:underline">
        ← Back to Tournaments
      </Link>
      <h2 className="mb-6 mt-2 text-2xl font-bold">Results</h2>
      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-gray-400">
            <tr>
              <th className="p-3">Player</th>
              <th className="p-3">Rank</th>
              <th className="p-3">Kills</th>
              <th className="p-3">Points</th>
              <th className="p-3">Prize (coins)</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((r) => {
              const locked = isProcessed(r.userId);
              const e = entries[r.userId] ?? { rank: '', kills: '0', points: '0', prizeCoins: '0' };
              const cellInput = 'w-16 rounded border border-gray-700 bg-black/40 px-2 py-1 disabled:opacity-50';
              return (
                <tr key={r.id} className="border-t border-gray-800">
                  <td className="p-3">{r.user.profile?.ffIgn || r.user.email || r.userId.slice(0, 8)}</td>
                  <td className="p-3">
                    <input
                      disabled={locked}
                      className={cellInput}
                      value={e.rank}
                      onChange={(ev) => setField(r.userId, 'rank', ev.target.value)}
                    />
                  </td>
                  <td className="p-3">
                    <input
                      disabled={locked}
                      className={cellInput}
                      value={e.kills}
                      onChange={(ev) => setField(r.userId, 'kills', ev.target.value)}
                    />
                  </td>
                  <td className="p-3">
                    <input
                      disabled={locked}
                      className={cellInput}
                      value={e.points}
                      onChange={(ev) => setField(r.userId, 'points', ev.target.value)}
                    />
                  </td>
                  <td className="p-3">
                    <input
                      disabled={locked}
                      className="w-20 rounded border border-gray-700 bg-black/40 px-2 py-1 disabled:opacity-50"
                      value={e.prizeCoins}
                      onChange={(ev) => setField(r.userId, 'prizeCoins', ev.target.value)}
                    />
                  </td>
                  <td className="p-3">
                    {locked ? <span className="text-green-400">Paid out</span> : <span className="text-gray-500">Draft</span>}
                  </td>
                </tr>
              );
            })}
            {registrations.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No registrations for this tournament yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={publish}
        disabled={saving}
        className="mt-4 rounded bg-gold px-6 py-2 font-semibold text-black hover:bg-gold/90 disabled:opacity-50"
      >
        {saving ? 'Publishing…' : 'Publish Results'}
      </button>
      {message && <p className="mt-3 text-sm text-gray-300">{message}</p>}
      <p className="mt-2 text-sm text-gray-500">
        Rows marked "Paid out" are locked — editing them here can't change what was already credited, even if you
        publish again.
      </p>
    </div>
  );
}
