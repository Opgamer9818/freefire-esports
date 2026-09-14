import { useEffect, useState } from 'react';
import { api } from '../api/client';

interface WithdrawalRow {
  id: string;
  amount: number;
  upiId: string;
  status: string;
  createdAt: string;
  user: { email: string | null; phone: string | null; profile: { ffIgn: string | null } | null };
}

const actionsByStatus: Record<string, { label: string; endpoint: string; className: string }[]> = {
  PENDING: [
    { label: 'Approve', endpoint: 'approve', className: 'bg-green-600/80 hover:bg-green-600' },
    { label: 'Reject', endpoint: 'reject', className: 'bg-red-600/80 hover:bg-red-600' },
  ],
  APPROVED: [
    { label: 'Mark Processing', endpoint: 'processing', className: 'bg-blue-600/80 hover:bg-blue-600' },
    { label: 'Mark Paid', endpoint: 'paid', className: 'bg-green-600/80 hover:bg-green-600' },
    { label: 'Reject', endpoint: 'reject', className: 'bg-red-600/80 hover:bg-red-600' },
  ],
  PROCESSING: [
    { label: 'Mark Paid', endpoint: 'paid', className: 'bg-green-600/80 hover:bg-green-600' },
    { label: 'Reject', endpoint: 'reject', className: 'bg-red-600/80 hover:bg-red-600' },
  ],
};

export function WithdrawalsPage() {
  const [requests, setRequests] = useState<WithdrawalRow[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    api.get<WithdrawalRow[]>('/admin/withdrawals').then(setRequests).catch(() => {});
  }
  useEffect(load, []);

  async function act(id: string, endpoint: string) {
    setBusyId(id);
    try {
      const note = endpoint === 'reject' ? prompt('Reason for rejecting?') ?? undefined : undefined;
      await api.post(`/admin/withdrawals/${id}/${endpoint}`, { note });
      load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Withdrawals</h2>
      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-gray-400">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Amount</th>
              <th className="p-3">UPI ID</th>
              <th className="p-3">Requested</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-t border-gray-800">
                <td className="p-3">{r.user.profile?.ffIgn || r.user.email || r.user.phone || r.id.slice(0, 8)}</td>
                <td className="p-3">{r.amount} coins</td>
                <td className="p-3">{r.upiId}</td>
                <td className="p-3">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="p-3">{r.status}</td>
                <td className="p-3 space-x-2">
                  {(actionsByStatus[r.status] ?? []).map((a) => (
                    <button
                      key={a.endpoint}
                      disabled={busyId === r.id}
                      onClick={() => act(r.id, a.endpoint)}
                      className={`rounded px-3 py-1 text-white disabled:opacity-50 ${a.className}`}
                    >
                      {a.label}
                    </button>
                  ))}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No active withdrawal requests.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-gray-500">
        The requested amount is reserved the moment a player submits — "Mark Paid" only finalizes it once you've
        actually sent the money. "Reject" returns it to their available balance.
      </p>
    </div>
  );
}
