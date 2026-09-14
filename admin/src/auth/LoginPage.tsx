import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink">
      <div className="w-full max-w-sm rounded-lg border border-gold/30 bg-surface p-8">
        <h1 className="mb-1 text-2xl font-bold text-gold">Free Fire Esports</h1>
        <p className="mb-6 text-sm text-gray-400">Admin Panel</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full rounded border border-gray-700 bg-black/40 px-3 py-2 text-white outline-none focus:border-gold"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
          <input
            className="w-full rounded border border-gray-700 bg-black/40 px-3 py-2 text-white outline-none focus:border-gold"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-gold py-2 font-semibold text-black hover:bg-gold/90 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-xs text-gray-500">
          No account yet? Run <code className="text-gray-400">npm run create-admin</code> in the backend folder.
        </p>
      </div>
    </div>
  );
}
