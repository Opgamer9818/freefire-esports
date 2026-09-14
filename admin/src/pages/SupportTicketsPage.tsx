import { useEffect, useState } from 'react';
import { api } from '../api/client';

interface SupportTicketRow {
  id: string;
  category: string;
  message: string;
  status: string;
  adminResponse: string | null;
  createdAt: string;
  user: { email: string | null; phone: string | null; profile: { ffIgn: string | null } | null };
}

const statusFilters = ['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export function SupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicketRow[]>([]);
  const [filter, setFilter] = useState('');
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    const query = filter ? `?status=${filter}` : '';
    api.get<SupportTicketRow[]>(`/admin/support/tickets${query}`).then(setTickets).catch(() => {});
  }
  useEffect(load, [filter]);

  async function respond(id: string, status: string) {
    const response = responses[id];
    if (!response) {
      alert('Write a response first');
      return;
    }
    setBusyId(id);
    try {
      await api.post(`/admin/support/tickets/${id}/respond`, { adminResponse: response, status });
      load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Support Tickets</h2>
      <div className="mb-4 flex gap-2">
        {statusFilters.map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setFilter(s)}
            className={`rounded px-3 py-1 text-sm ${
              filter === s ? 'bg-gold text-black' : 'bg-surface text-gray-300'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {tickets.map((t) => (
          <div key={t.id} className="rounded-lg border border-gray-800 bg-surface p-4">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <span className="font-semibold">
                  {t.user.profile?.ffIgn || t.user.email || t.user.phone || t.id.slice(0, 8)}
                </span>
                <span className="ml-2 text-xs text-gray-500">
                  {t.category} · {t.status}
                </span>
              </div>
              <span className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleString()}</span>
            </div>
            <p className="mb-3 text-sm">{t.message}</p>
            {t.adminResponse && (
              <p className="mb-3 rounded bg-black/30 p-2 text-sm text-gray-300">Reply: {t.adminResponse}</p>
            )}
            {t.status !== 'CLOSED' && (
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded border border-gray-700 bg-black/40 px-3 py-1 text-sm"
                  placeholder="Write a response…"
                  value={responses[t.id] || ''}
                  onChange={(e) => setResponses((prev) => ({ ...prev, [t.id]: e.target.value }))}
                />
                <button
                  disabled={busyId === t.id}
                  onClick={() => respond(t.id, 'IN_PROGRESS')}
                  className="rounded bg-blue-600/80 px-3 py-1 text-sm text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  Reply
                </button>
                <button
                  disabled={busyId === t.id}
                  onClick={() => respond(t.id, 'RESOLVED')}
                  className="rounded bg-green-600/80 px-3 py-1 text-sm text-white hover:bg-green-600 disabled:opacity-50"
                >
                  Resolve
                </button>
              </div>
            )}
          </div>
        ))}
        {tickets.length === 0 && <p className="text-gray-500">No tickets found.</p>}
      </div>
    </div>
  );
}
