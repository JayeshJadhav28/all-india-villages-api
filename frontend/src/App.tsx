import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { useAuthStore } from './store/authStore';

const AdminDashboard = lazy(() =>
  import('./pages/admin/Dashboard').then((m) => ({ default: m.AdminDashboard })),
);
const B2BDashboard = lazy(() =>
  import('./pages/b2b/Dashboard').then((m) => ({ default: m.B2BDashboard })),
);

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function RequireActiveClient({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'CLIENT') return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f1117', color: '#475569', fontSize: 14 }}>
            Loading…
          </div>
        }>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/dashboard/*"
              element={
                <RequireAuth>
                  <RequireActiveClient>
                    <B2BDashboard />
                  </RequireActiveClient>
                </RequireAuth>
              }
            />

            <Route
              path="/admin/*"
              element={
                <RequireAuth>
                  <RequireAdmin>
                    <AdminDashboard />
                  </RequireAdmin>
                </RequireAuth>
              }
            />

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}