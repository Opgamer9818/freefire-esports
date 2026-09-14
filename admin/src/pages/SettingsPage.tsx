import { useEffect, useState } from 'react';
import { api } from '../api/client';

interface Settings {
  upi_id: string;
  upi_payee_name: string;
  coin_rate_inr: number;
  min_withdrawal: number;
  max_withdrawal: number;
}

const inputClass =
  'w-full max-w-sm rounded border border-gray-700 bg-black/40 px-3 py-2 text-white outline-none focus:border-gold';
const labelClass = 'mb-1 block text-sm text-gray-400';

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get<Settings>('/admin/settings').then(setSettings).catch(() => {});
  }, []);

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSaved(false);
  }

  async function save() {
    if (!settings) return;
    setSaving(true);
    try {
      await api.put('/admin/settings', settings);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (!settings) return <p className="text-gray-400">Loading…</p>;

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Settings</h2>
      <div className="space-y-4">
        <div>
          <label className={labelClass}>UPI ID</label>
          <input className={inputClass} value={settings.upi_id} onChange={(e) => set('upi_id', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>UPI payee name (shown to users)</label>
          <input
            className={inputClass}
            value={settings.upi_payee_name}
            onChange={(e) => set('upi_payee_name', e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Coin rate (₹ per coin)</label>
          <input
            type="number"
            className={inputClass}
            value={settings.coin_rate_inr}
            onChange={(e) => set('coin_rate_inr', Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelClass}>Minimum withdrawal (coins)</label>
          <input
            type="number"
            className={inputClass}
            value={settings.min_withdrawal}
            onChange={(e) => set('min_withdrawal', Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelClass}>Maximum withdrawal (coins)</label>
          <input
            type="number"
            className={inputClass}
            value={settings.max_withdrawal}
            onChange={(e) => set('max_withdrawal', Number(e.target.value))}
          />
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="rounded bg-gold px-6 py-2 font-semibold text-black hover:bg-gold/90 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
        {saved && <span className="ml-3 text-sm text-green-400">Saved.</span>}
      </div>
    </div>
  );
}
