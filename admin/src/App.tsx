import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { LoginPage } from './auth/LoginPage';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { TournamentsPage } from './pages/TournamentsPage';
import { TournamentFormPage } from './pages/TournamentFormPage';
import { TournamentResultsPage } from './pages/TournamentResultsPage';
import { PaymentRequestsPage } from './pages/PaymentRequestsPage';
import { RedeemRequestsPage } from './pages/RedeemRequestsPage';
import { WithdrawalsPage } from './pages/WithdrawalsPage';
import { UsersPage } from './pages/UsersPage';
import { SupportTicketsPage } from './pages/SupportTicketsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/tournaments" element={<TournamentsPage />} />
              <Route path="/tournaments/:id" element={<TournamentFormPage />} />
              <Route path="/tournaments/:id/results" element={<TournamentResultsPage />} />
              <Route path="/payment-requests" element={<PaymentRequestsPage />} />
              <Route path="/redeem-requests" element={<RedeemRequestsPage />} />
              <Route path="/withdrawals" element={<WithdrawalsPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/support-tickets" element={<SupportTicketsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/audit-logs" element={<AuditLogsPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
