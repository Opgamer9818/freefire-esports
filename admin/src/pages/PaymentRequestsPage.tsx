import { useEffect, useState } from 'react';
import { api } from '../api/client';

interface PaymentRequestRow {
  id: string;
  requestedCoins: number;
  expectedAmount: number;
  utrReference: string | null;
  status: string;
  createdAt: string;
  user: {
    email: string | null;
    phone: string | null;
    profile: { ffIgn: string | null } | null;
  };
}

export function PaymentRequestsPage() {
  const [requests, setRequests] = useState<PaymentRequestRow[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    api.get<PaymentRequestRow[]>('/admin/payment-requests').then(setRequests).catch(() => {});
  }
  useEffect(load, []);

  async function approve(id: string) {
    setBusyId(id);
    try {
      await api.post(`/admin/payment-requests/${id}/approve`, {});
      load();
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id: string) {
    setBusyId(id);
    try {
      await api.post(`/admin/payment-requests/${id}/reject`, { note: 'Rejected by admin' });
      load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Payment Requests</h2>
      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-gray-400">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Coins</th>
              <th className="p-3">Amount</th>
              <th className="p-3">UTR</th>
              <th className="p-3">Requested</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-t border-gray-800">
                <td className="p-3">{r.user.profile?.ffIgn || r.user.email || r.user.phone || r.id.slice(0, 8)}</td>
                <td className="p-3">{r.requestedCoins}</td>
                <td className="p-3">₹{r.expectedAmount}</td>
                <td className="p-3">{r.utrReference || '—'}</td>
                <td className="p-3">{new Date(r.createdAt).toLocaleString()}</td>
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
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No pending payment requests.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-gray-500">
        Verify the payment in your own UPI/bank app before approving — approval here credits coins immediately.
      </p>
    </div>
  );
}
