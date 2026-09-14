import { useEffect, useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';

interface TournamentFormData {
  name: string;
  format: string;
  teamSize: number;
  entryFeeCoins: number;
  isFree: boolean;
  prizePool: number;
  slots: number;
  date: string;
  startTime: string;
  registrationOpenAt: string;
  registrationCloseAt: string;
  rules: string;
  status: string;
}

const STATUSES = [
  'DRAFT',
  'UPCOMING',
  'REGISTRATION_OPEN',
  'REGISTRATION_CLOSED',
  'FULL',
  'ROOM_RELEASED',
  'LIVE',
  'RESULT_PENDING',
  'COMPLETED',
  'CANCELLED',
];

const emptyForm: TournamentFormData = {
  name: '',
  format: 'SOLO',
  teamSize: 1,
  entryFeeCoins: 0,
  isFree: true,
  prizePool: 0,
  slots: 50,
  date: '',
  startTime: '',
  registrationOpenAt: '',
  registrationCloseAt: '',
  rules: '',
  status: 'DRAFT',
};

const inputClass =
  'w-full rounded border border-gray-700 bg-black/40 px-3 py-2 text-white outline-none focus:border-gold';
const labelClass = 'mb-1 block text-sm text-gray-400';

export function TournamentFormPage() {
  const { id } = useParams();
  const isEdit = id !== undefined && id !== 'new';
  const navigate = useNavigate();
  const [form, setForm] = useState<TournamentFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      api.get<any>(`/admin/tournaments/${id}`).then((t) => {
        setForm({
          ...t,
          date: t.date?.slice(0, 16) ?? '',
          startTime: t.startTime?.slice(0, 16) ?? '',
          registrationOpenAt: t.registrationOpenAt?.slice(0, 16) ?? '',
          registrationCloseAt: t.registrationCloseAt?.slice(0, 16) ?? '',
          rules: t.rules ?? '',
        });
      });
    }
  }, [id, isEdit]);

  function set<K extends keyof TournamentFormData>(key: K, value: TournamentFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        date: new Date(form.date).toISOString(),
        startTime: new Date(form.startTime).toISOString(),
        registrationOpenAt: new Date(form.registrationOpenAt).toISOString(),
        registrationCloseAt: new Date(form.registrationCloseAt).toISOString(),
      };
      if (isEdit) {
        await api.put(`/admin/tournaments/${id}`, payload);
      } else {
        await api.post('/admin/tournaments', payload);
      }
      navigate('/tournaments');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="mb-6 text-2xl font-bold">{isEdit ? 'Edit Tournament' : 'New Tournament'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Name</label>
          <input className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Format</label>
            <select className={inputClass} value={form.format} onChange={(e) => set('format', e.target.value)}>
              <option value="SOLO">Solo</option>
              <option value="DUO">Duo</option>
              <option value="SQUAD">Squad</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Team size</label>
            <input
              type="number"
              className={inputClass}
              value={form.teamSize}
              onChange={(e) => set('teamSize', Number(e.target.value))}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Free tournament?</label>
            <select
              className={inputClass}
              value={form.isFree ? 'yes' : 'no'}
              onChange={(e) => set('isFree', e.target.value === 'yes')}
            >
              <option value="yes">Free</option>
              <option value="no">Paid</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Entry fee (coins)</label>
            <input
              type="number"
              className={inputClass}
              value={form.entryFeeCoins}
              onChange={(e) => set('entryFeeCoins', Number(e.target.value))}
              disabled={form.isFree}
            />
          </div>
          <div>
            <label className={labelClass}>Prize pool (coins)</label>
            <input
              type="number"
              className={inputClass}
              value={form.prizePool}
              onChange={(e) => set('prizePool', Number(e.target.value))}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Slots</label>
          <input
            type="number"
            className={inputClass}
            value={form.slots}
            onChange={(e) => set('slots', Number(e.target.value))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Date</label>
            <input
              type="datetime-local"
              className={inputClass}
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Start time</label>
            <input
              type="datetime-local"
              className={inputClass}
              value={form.startTime}
              onChange={(e) => set('startTime', e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Registration opens</label>
            <input
              type="datetime-local"
              className={inputClass}
              value={form.registrationOpenAt}
              onChange={(e) => set('registrationOpenAt', e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Registration closes</label>
            <input
              type="datetime-local"
              className={inputClass}
              value={form.registrationCloseAt}
              onChange={(e) => set('registrationCloseAt', e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <select className={inputClass} value={form.status} onChange={(e) => set('status', e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Rules</label>
          <textarea className={inputClass} rows={4} value={form.rules} onChange={(e) => set('rules', e.target.value)} />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded bg-gold px-6 py-2 font-semibold text-black hover:bg-gold/90 disabled:opacity-50"
        >
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Tournament'}
        </button>
      </form>
    </div>
  );
}
