import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/tournaments', label: 'Tournaments' },
  { to: '/payment-requests', label: 'Payment Requests' },
  { to: '/redeem-requests', label: 'Redeem Requests' },
  { to: '/withdrawals', label: 'Withdrawals' },
  { to: '/users', label: 'Users' },
  { to: '/support-tickets', label: 'Support' },
  { to: '/settings', label: 'Settings' },
  { to: '/audit-logs', label: 'Audit Logs' },
];

export function Layout() {
  const { admin, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-ink text-white">
      <aside className="w-56 shrink-0 border-r border-gray-800 bg-surface p-4">
        <h1 className="mb-6 text-lg font-bold text-gold">FF Esports Admin</h1>
        <nav className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `block rounded px-3 py-2 text-sm ${
                  isActive ? 'bg-gold/20 text-gold' : 'text-gray-300 hover:bg-white/5'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-8 border-t border-gray-800 pt-4 text-xs text-gray-500">
          <p>{admin?.username}</p>
          <button onClick={logout} className="mt-2 text-gold hover:underline">
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
