import { useEffect, useState } from 'react';
import { api } from '../api/client';

interface AdminUserRow {
  id: string;
  email: string | null;
  phone: string | null;
  isBanned: boolean;
  createdAt: string;
  profile: { ffIgn: string | null; ffUid: string | null } | null;
  wallet: { availableBalance: number } | null;
}

export function UsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [search, setSearch] = useState('');

  function load() {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    api.get<AdminUserRow[]>(`/admin/users${query}`).then(setUsers).catch(() => {});
  }

  useEffect(load, [search]);

  async function toggleBan(u: AdminUserRow) {
    if (u.isBanned) {
      await api.post(`/admin/users/${u.id}/unban`, {});
    } else {
      const reason = prompt('Ban reason?');
      if (!reason) return;
      await api.post(`/admin/users/${u.id}/ban`, { reason });
    }
    load();
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Users</h2>
      <input
        className="mb-4 w-full max-w-sm rounded border border-gray-700 bg-black/40 px-3 py-2"
        placeholder="Search by email, phone, or IGN…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-gray-400">
            <tr>
              <th className="p-3">IGN</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Wallet</th>
              <th className="p-3">Joined</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-gray-800">
                <td className="p-3">{u.profile?.ffIgn || '—'}</td>
                <td className="p-3">{u.email || u.phone || '—'}</td>
                <td className="p-3">{u.wallet?.availableBalance ?? 0} coins</td>
                <td className="p-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  {u.isBanned ? (
                    <span className="text-red-400">Banned</span>
                  ) : (
                    <span className="text-green-400">Active</span>
                  )}
                </td>
                <td className="p-3">
                  <button onClick={() => toggleBan(u)} className="text-gold hover:underline">
                    {u.isBanned ? 'Unban' : 'Ban'}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
