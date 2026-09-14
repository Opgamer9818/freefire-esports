import { useEffect, useState } from 'react';
import { api } from '../api/client';

interface AuditLog {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  reason: string | null;
  createdAt: string;
  admin: { username: string } | null;
}

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    api.get<AuditLog[]>('/admin/audit-logs').then(setLogs).catch(() => {});
  }, []);

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Audit Logs</h2>
      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-gray-400">
            <tr>
              <th className="p-3">When</th>
              <th className="p-3">Admin</th>
              <th className="p-3">Action</th>
              <th className="p-3">Target</th>
              <th className="p-3">Reason</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-gray-800">
                <td className="p-3">{new Date(l.createdAt).toLocaleString()}</td>
                <td className="p-3">{l.admin?.username ?? '—'}</td>
                <td className="p-3">{l.action}</td>
                <td className="p-3 font-mono text-xs">
                  {l.targetType}:{l.targetId.slice(0, 8)}
                </td>
                <td className="p-3">{l.reason || '—'}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  No audit log entries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
