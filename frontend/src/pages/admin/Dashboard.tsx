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
  Menu,
  X,
  Bell,
  Settings,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const NAV = [
  { label: 'Overview', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'API Logs', to: '/admin/logs', icon: ScrollText },
];

const STYLES = `
  .admin-dash {
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #030509;
    color: #fff;
    min-height: 100vh;
    display: flex;
    position: relative;
  }

  /* India gradient background - darker for admin */
  .admin-dash::before {
    content: '';
    position: fixed;
    inset: 0;
    background: 
      radial-gradient(ellipse 60% 40% at 10% 10%, rgba(239, 68, 68, 0.06), transparent 50%),
      radial-gradient(ellipse 50% 40% at 90% 20%, rgba(139, 92, 246, 0.04), transparent 50%),
      radial-gradient(ellipse 50% 40% at 20% 90%, rgba(59, 130, 246, 0.05), transparent 50%);
    pointer-events: none;
    z-index: 0;
  }

  /* Dot grid */
  .admin-dash::after {
    content: '';
    position: fixed;
    inset: 0;
    background-image: radial-gradient(circle, rgba(255,255,255,0.015) 1px, transparent 1px);
    background-size: 24px 24px;
    pointer-events: none;
    z-index: 0;
  }

  .admin-dash > * {
    position: relative;
    z-index: 1;
  }

  /* Sidebar */
  .admin-sidebar {
    width: 250px;
    background: rgba(10, 13, 20, 0.8);
    backdrop-filter: blur(20px) saturate(180%);
    border-right: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 100;
    transition: transform 0.3s ease;
  }

  .admin-sidebar.mobile-hidden {
    transform: translateX(-100%);
  }

  /* Logo */
  .admin-logo {
    padding: 1.75rem 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
  }

  .admin-logo-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg, #ef4444, #f87171);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 14px rgba(239, 68, 68, 0.3);
  }

  .admin-logo-text h1 {
    font-size: 16px;
    font-weight: 800;
    background: linear-gradient(135deg, #ef4444, #f87171);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
    letter-spacing: -0.3px;
  }

  .admin-logo-text p {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.3);
    letter-spacing: 1.2px;
    text-transform: uppercase;
    margin: 2px 0 0;
  }

  /* Navigation */
  .admin-nav {
    flex: 1;
    padding: 1.25rem 1rem;
    overflow-y: auto;
  }

  .admin-nav-link {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 11px 14px;
    border-radius: 9px;
    margin-bottom: 4px;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.5);
    transition: all 0.2s ease;
  }

  .admin-nav-link:hover {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.8);
  }

  .admin-nav-link.active {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(248, 113, 113, 0.08));
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.2);
    font-weight: 600;
  }

  /* User Footer */
  .admin-user {
    padding: 1rem 1.25rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .admin-user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #dc2626, #ef4444);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
  }

  .admin-user-info {
    flex: 1;
    overflow: hidden;
  }

  .admin-user-name {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .admin-user-role {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.3);
    letter-spacing: 0.5px;
  }

  .admin-user-logout {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.3);
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    display: flex;
    transition: all 0.2s;
  }

  .admin-user-logout:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #f87171;
  }

  /* Main Content */
  .admin-main {
    margin-left: 250px;
    flex: 1;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* Top Bar */
  .admin-topbar {
    height: 60px;
    background: rgba(10, 13, 20, 0.7);
    backdrop-filter: blur(20px) saturate(180%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2rem;
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .admin-topbar-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .admin-mobile-toggle {
    display: none;
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
    padding: 6px;
  }

  .admin-breadcrumb {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
  }

  .admin-breadcrumb-active {
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
  }

  .admin-topbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .admin-status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    color: #4ade80;
  }

  .admin-status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 8px #22c55e;
    animation: pulse 2s infinite;
  }

  .admin-icon-btn {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 8px;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.5);
    transition: all 0.2s;
    position: relative;
  }

  .admin-icon-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
  }

  /* Content */
  .admin-content {
    flex: 1;
    padding: 2rem;
  }

  /* Mobile Overlay */
  .admin-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    z-index: 90;
  }

  .admin-overlay.active {
    display: block;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .admin-main {
      margin-left: 0;
    }

    .admin-sidebar {
      transform: translateX(-100%);
    }

    .admin-sidebar.mobile-open {
      transform: translateX(0);
    }

    .admin-mobile-toggle {
      display: flex;
    }

    .admin-topbar {
      padding: 0 1.25rem;
    }

    .admin-content {
      padding: 1.5rem 1.25rem;
    }
  }

  @media (max-width: 640px) {
    .admin-topbar {
      padding: 0 1rem;
    }

    .admin-content {
      padding: 1.25rem 1rem;
    }

    .admin-status {
      display: none;
    }

    .admin-breadcrumb {
      font-size: 11px;
    }
  }
`;

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentRoute = NAV.find((n) => {
    if (n.end) return window.location.pathname === n.to;
    return window.location.pathname.startsWith(n.to) && n.to !== '/admin';
  });

  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'admin-dash-styles';
    style.textContent = STYLES;
    document.head.appendChild(style);
    return () => {
      document.getElementById('admin-dash-styles')?.remove();
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024 && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileOpen]);

  return (
    <div className="admin-dash">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileOpen ? 'mobile-open' : 'mobile-hidden'}`}>
        {/* Logo */}
        <a href="/admin" className="admin-logo">
          <div className="admin-logo-icon">
            <Shield size={20} color="#fff" />
          </div>
          <div className="admin-logo-text">
            <h1>Village API</h1>
            <p>Admin Console</p>
          </div>
        </a>

        {/* Navigation */}
        <nav className="admin-nav">
          {NAV.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="admin-user">
          <div className="admin-user-avatar">
            {user?.email?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="admin-user-info">
            <div className="admin-user-name">{user?.email}</div>
            <div className="admin-user-role">ADMIN</div>
          </div>
          <button onClick={handleLogout} className="admin-user-logout" title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        {/* Top Bar */}
        <div className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              className="admin-mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div className="admin-breadcrumb">
              <span>Admin</span>
              <span>/</span>
              <span className="admin-breadcrumb-active">{currentRoute?.label || 'Overview'}</span>
            </div>
          </div>

          <div className="admin-topbar-right">
            <button className="admin-icon-btn" title="Settings">
              <Settings size={18} />
            </button>

            <button className="admin-icon-btn" title="Notifications">
              <Bell size={18} />
            </button>

            <div className="admin-status">
              <span className="admin-status-dot" />
              Live
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="admin-content">
          <Routes>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/:id" element={<AdminUserDetail />} />
            <Route path="logs" element={<AdminLogs />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </main>

      {/* Mobile Overlay */}
      <div
        className={`admin-overlay ${mobileOpen ? 'active' : ''}`}
        onClick={() => setMobileOpen(false)}
      />
    </div>
  );
};