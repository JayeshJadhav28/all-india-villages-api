import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { AdminOverview } from './Overview';
import { AdminUsers } from './Users';
import { AdminUserDetail } from './UserDetail';
import { AdminLogs } from './Logs';
import {
  LayoutDashboard,
  Users,
  ScrollText,
  LogOut,
  Shield,
  ChevronRight,
} from 'lucide-react';

const NAV = [
  { label: 'Overview', to: '/admin',       icon: LayoutDashboard, end: true },
  { label: 'Users',    to: '/admin/users', icon: Users },
  { label: 'API Logs', to: '/admin/logs',  icon: ScrollText },
];

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const currentLabel = NAV.slice().reverse().find(n =>
    n.end
      ? window.location.pathname === n.to
      : window.location.pathname.startsWith(n.to)
  )?.label ?? 'Overview';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0b0d14', fontFamily: "'IBM Plex Sans', sans-serif" }}>

      {/* Sidebar */}
      <aside style={{
        width: 224, background: '#0f1117', borderRight: '1px solid #1a1d2e',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 40,
      }}>
        {/* Logo */}
        <div style={{ padding: '26px 20px 18px', borderBottom: '1px solid #1a1d2e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #f43f5e, #fb7185)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={15} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.01em' }}>Village API</div>
              <div style={{ fontSize: 11, color: '#374151', marginTop: 1 }}>Admin Console</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 10px' }}>
          {NAV.map(({ label, to, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 10px', borderRadius: 6, marginBottom: 2,
              textDecoration: 'none', fontSize: 13, fontWeight: isActive ? 600 : 400,
              color: isActive ? '#fb7185' : '#4b5563',
              background: isActive ? 'rgba(244,63,94,0.08)' : 'transparent',
              transition: 'all 0.12s',
            })}>
              <Icon size={14} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div style={{ padding: '10px 14px', borderTop: '1px solid #1a1d2e', display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'linear-gradient(135deg, #be123c, #f43f5e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            {user?.email?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
            <div style={{ fontSize: 10, color: '#374151' }}>ADMIN</div>
          </div>
          <button onClick={handleLogout} title="Logout" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', padding: 3, display: 'flex', borderRadius: 4 }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
            onMouseLeave={e => (e.currentTarget.style.color = '#374151')}
          >
            <LogOut size={13} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 224, flex: 1, minHeight: '100vh' }}>
        {/* Topbar */}
        <div style={{
          height: 52, borderBottom: '1px solid #1a1d2e', display: 'flex', alignItems: 'center',
          padding: '0 28px', gap: 7, background: '#0f1117', position: 'sticky', top: 0, zIndex: 30,
        }}>
          <span style={{ fontSize: 11, color: '#374151' }}>Admin</span>
          <ChevronRight size={11} color="#1f2937" />
          <span style={{ fontSize: 11, color: '#6b7280' }}>{currentLabel}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: 10, color: '#4ade80' }}>Live</span>
          </div>
        </div>

        <div style={{ padding: '28px' }}>
          <Routes>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/:id" element={<AdminUserDetail />} />
            <Route path="logs" element={<AdminLogs />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};