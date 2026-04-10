import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { B2BOverview } from './Overview';
import { B2BApiKeys } from './ApiKeys';
import { B2BUsage } from './Usage';
import { B2BProfile } from './Profile';
import {
  LayoutDashboard,
  KeyRound,
  BarChart3,
  User,
  LogOut,
  Zap,
  ChevronRight,
} from 'lucide-react';

const NAV = [
  { label: 'Overview',  to: '/dashboard',         icon: LayoutDashboard, end: true },
  { label: 'API Keys',  to: '/dashboard/keys',    icon: KeyRound },
  { label: 'Usage',     to: '/dashboard/usage',   icon: BarChart3 },
  { label: 'Profile',   to: '/dashboard/profile', icon: User },
];

export const B2BDashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f1117', fontFamily: "'IBM Plex Sans', sans-serif" }}>

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside style={{
        width: 240,
        background: '#13161f',
        borderRight: '1px solid #1e2130',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 40,
      }}>
        {/* Logo */}
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid #1e2130' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #6366f1, #818cf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.01em' }}>Village API</div>
              <div style={{ fontSize: 11, color: '#475569', marginTop: 1 }}>Developer Portal</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 12px' }}>
          {NAV.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 7,
                marginBottom: 2,
                textDecoration: 'none',
                fontSize: 13.5,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#818cf8' : '#64748b',
                background: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
                transition: 'all 0.15s',
              })}
            >
              <Icon size={15} />
              {label}
              {label === 'API Keys' && (
                <span style={{
                  marginLeft: 'auto', fontSize: 10, fontWeight: 700,
                  background: '#6366f1', color: '#fff',
                  padding: '1px 6px', borderRadius: 20,
                }}>NEW</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Plan badge */}
        <div style={{ padding: '12px 16px', margin: '0 12px 12px', background: 'rgba(99,102,241,0.08)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.15)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Current Plan</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{user?.planType || 'FREE'}</div>
          <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>5,000 req/day</div>
        </div>

        {/* User */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #1e2130', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #334155, #475569)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#94a3b8', flexShrink: 0,
          }}>
            {user?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.businessName || user?.email}
            </div>
            <div style={{ fontSize: 11, color: '#475569' }}>CLIENT</div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 4, borderRadius: 4, display: 'flex' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
            onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────── */}
      <main style={{ marginLeft: 240, flex: 1, minHeight: '100vh' }}>
        {/* Top bar */}
        <div style={{
          height: 56,
          borderBottom: '1px solid #1e2130',
          display: 'flex',
          alignItems: 'center',
          padding: '0 32px',
          gap: 8,
          background: '#13161f',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}>
          <span style={{ fontSize: 12, color: '#475569' }}>Developer Portal</span>
          <ChevronRight size={12} color="#334155" />
          <span style={{ fontSize: 12, color: '#94a3b8' }}>
            {NAV.find(n => {
              if (n.end) return window.location.pathname === n.to;
              return window.location.pathname.startsWith(n.to) && n.to !== '/dashboard';
            })?.label ?? 'Overview'}
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: 11, color: '#4ade80' }}>All systems operational</span>
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: '32px' }}>
          <Routes>
            <Route index element={<B2BOverview />} />
            <Route path="keys" element={<B2BApiKeys />} />
            <Route path="usage" element={<B2BUsage />} />
            <Route path="profile" element={<B2BProfile />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};