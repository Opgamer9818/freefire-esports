import { useEffect, useState } from 'react';
import { api } from '../api/client';

interface RedeemRequestRow {
  id: string;
  code: string;
  status: string;
  createdAt: string;
  user: {
    email: string | null;
    phone: string | null;
    profile: { ffIgn: string | null } | null;
  };
}

export function RedeemRequestsPage() {
  const [requests, setRequests] = useState<RedeemRequestRow[]>([]);
  const [coinInputs, setCoinInputs] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    api.get<RedeemRequestRow[]>('/admin/redeem-requests').then(setRequests).catch(() => {});
  }
  useEffect(load, []);

  async function approve(id: string) {
    const coins = Number(coinInputs[id]);
    if (!coins || coins <= 0) {
      alert('Enter the verified coin value first');
      return;
    }
    setBusyId(id);
    try {
      await api.post(`/admin/redeem-requests/${id}/approve`, { approvedCoins: coins });
      load();
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id: string) {
    setBusyId(id);
    try {
      await api.post(`/admin/redeem-requests/${id}/reject`, { note: 'Rejected by admin' });
      load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Redeem Requests</h2>
      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-gray-400">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Code</th>
              <th className="p-3">Requested</th>
              <th className="p-3">Verified Coin Value</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-t border-gray-800">
                <td className="p-3">{r.user.profile?.ffIgn || r.user.email || r.user.phone || r.id.slice(0, 8)}</td>
                <td className="p-3 font-mono">{r.code}</td>
                <td className="p-3">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="p-3">
                  <input
                    type="number"
                    className="w-24 rounded border border-gray-700 bg-black/40 px-2 py-1"
                    placeholder="coins"
                    value={coinInputs[r.id] || ''}
                    onChange={(e) => setCoinInputs((prev) => ({ ...prev, [r.id]: e.target.value }))}
                  />
                </td>
                <td className="p-3 space-x-2">
                  <button
                    disabled={busyId === r.id}
                    onClick={() => approve(r.id)}
                    className="rounded bg-green-600/80 px-3 py-1 text-white hover:bg-green-600 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    disabled={busyId === r.id}
                    onClick={() => reject(r.id)}
                    className="rounded bg-red-600/80 px-3 py-1 text-white hover:bg-red-600 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  No pending redeem requests.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-gray-500">
        Verify the code on Google Play yourself first — the coin value you type here is exactly what gets credited.
      </p>
    </div>
  );
}
