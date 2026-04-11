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
  Menu,
  X,
  Bell,
  Search,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const NAV = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard, end: true },
  { label: 'API Keys', to: '/dashboard/keys', icon: KeyRound, badge: 'NEW' },
  { label: 'Usage', to: '/dashboard/usage', icon: BarChart3 },
  { label: 'Profile', to: '/dashboard/profile', icon: User },
];

const STYLES = `
  .b2b-dash {
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #05080F;
    color: #fff;
    min-height: 100vh;
    display: flex;
    position: relative;
  }

  /* India gradient background */
  .b2b-dash::before {
    content: '';
    position: fixed;
    inset: 0;
    background: 
      radial-gradient(ellipse 70% 50% at 10% 10%, rgba(255, 153, 51, 0.08), transparent 50%),
      radial-gradient(ellipse 60% 50% at 90% 20%, rgba(0, 0, 128, 0.06), transparent 50%),
      radial-gradient(ellipse 60% 50% at 20% 90%, rgba(19, 136, 8, 0.08), transparent 50%);
    pointer-events: none;
    z-index: 0;
  }

  /* Dot grid */
  .b2b-dash::after {
    content: '';
    position: fixed;
    inset: 0;
    background-image: radial-gradient(circle, rgba(255,255,255,0.02) 1px, transparent 1px);
    background-size: 24px 24px;
    pointer-events: none;
    z-index: 0;
  }

  .b2b-dash > * {
    position: relative;
    z-index: 1;
  }

  /* Sidebar */
  .b2b-sidebar {
    width: 260px;
    background: rgba(13, 18, 32, 0.7);
    backdrop-filter: blur(20px) saturate(180%);
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 100;
    transition: transform 0.3s ease;
  }

  .b2b-sidebar.mobile-hidden {
    transform: translateX(-100%);
  }

  /* Logo */
  .b2b-logo {
    padding: 1.75rem 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
  }

  .b2b-logo-img {
    width: 40px;
    height: 40px;
    object-fit: contain;
    filter: drop-shadow(0 2px 10px rgba(255, 153, 51, 0.4));
  }

  .b2b-logo-text h1 {
    font-size: 17px;
    font-weight: 800;
    background: linear-gradient(135deg, #FF9933, #E8530A);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
    letter-spacing: -0.3px;
  }

  .b2b-logo-text p {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.4);
    letter-spacing: 1.2px;
    text-transform: uppercase;
    margin: 2px 0 0;
  }

  /* Navigation */
  .b2b-nav {
    flex: 1;
    padding: 1.25rem 1rem;
    overflow-y: auto;
  }

  .b2b-nav-link {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 11px 14px;
    border-radius: 10px;
    margin-bottom: 4px;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
    transition: all 0.2s ease;
    position: relative;
  }

  .b2b-nav-link:hover {
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.9);
  }

  .b2b-nav-link.active {
    background: linear-gradient(135deg, rgba(255, 153, 51, 0.12), rgba(232, 83, 10, 0.08));
    color: #FF9933;
    border: 1px solid rgba(255, 153, 51, 0.2);
    font-weight: 600;
  }

  .b2b-nav-badge {
    margin-left: auto;
    font-size: 9px;
    font-weight: 700;
    background: linear-gradient(135deg, #FF9933, #E8530A);
    color: #fff;
    padding: 2px 7px;
    border-radius: 20px;
    letter-spacing: 0.3px;
  }

  /* Plan Card */
  .b2b-plan-card {
    padding: 1rem 1.25rem;
    margin: 0 1rem 1.25rem;
    background: linear-gradient(135deg, rgba(255, 153, 51, 0.1), rgba(232, 83, 10, 0.06));
    border: 1px solid rgba(255, 153, 51, 0.2);
    border-radius: 12px;
  }

  .b2b-plan-label {
    font-size: 10px;
    font-weight: 700;
    color: #FF9933;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .b2b-plan-name {
    font-size: 16px;
    font-weight: 800;
    color: #fff;
    margin-bottom: 4px;
  }

  .b2b-plan-quota {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  /* User Footer */
  .b2b-user {
    padding: 1rem 1.25rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .b2b-user-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: linear-gradient(135deg, #FF9933, #E8530A);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
  }

  .b2b-user-info {
    flex: 1;
    overflow: hidden;
  }

  .b2b-user-name {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .b2b-user-role {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
    letter-spacing: 0.5px;
  }

  .b2b-user-logout {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    display: flex;
    transition: all 0.2s;
  }

  .b2b-user-logout:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #f87171;
  }

  /* Main Content */
  .b2b-main {
    margin-left: 260px;
    flex: 1;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* Top Bar */
  .b2b-topbar {
    height: 64px;
    background: rgba(13, 18, 32, 0.6);
    backdrop-filter: blur(20px) saturate(180%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2rem;
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .b2b-topbar-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .b2b-mobile-toggle {
    display: none;
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
    padding: 6px;
  }

  .b2b-breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
  }

  .b2b-breadcrumb-active {
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
  }

  .b2b-topbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .b2b-status {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 11px;
    color: #4ade80;
  }

  .b2b-status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 10px #22c55e;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .b2b-search {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 8px 12px;
    width: 240px;
    transition: all 0.2s;
  }

  .b2b-search:focus-within {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 153, 51, 0.3);
  }

  .b2b-search input {
    background: none;
    border: none;
    outline: none;
    color: #fff;
    font-size: 13px;
    width: 100%;
  }

  .b2b-search input::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  .b2b-notif {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 8px;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.6);
    transition: all 0.2s;
    position: relative;
  }

  .b2b-notif:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
  }

  .b2b-notif-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 8px;
    height: 8px;
    background: #ef4444;
    border-radius: 50%;
    border: 2px solid #05080F;
  }

  /* Content */
  .b2b-content {
    flex: 1;
    padding: 2rem;
  }

  /* Mobile Overlay */
  .b2b-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 90;
  }

  .b2b-overlay.active {
    display: block;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .b2b-main {
      margin-left: 0;
    }

    .b2b-sidebar {
      transform: translateX(-100%);
    }

    .b2b-sidebar.mobile-open {
      transform: translateX(0);
    }

    .b2b-mobile-toggle {
      display: flex;
    }

    .b2b-topbar {
      padding: 0 1.25rem;
    }

    .b2b-content {
      padding: 1.5rem 1.25rem;
    }

    .b2b-search {
      display: none;
    }
  }

  @media (max-width: 640px) {
    .b2b-topbar {
      padding: 0 1rem;
    }

    .b2b-content {
      padding: 1.25rem 1rem;
    }

    .b2b-status {
      display: none;
    }

    .b2b-breadcrumb {
      font-size: 12px;
    }
  }
`;

export const B2BDashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentRoute = NAV.find((n) => {
    if (n.end) return window.location.pathname === n.to;
    return window.location.pathname.startsWith(n.to) && n.to !== '/dashboard';
  });

  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'b2b-dash-styles';
    style.textContent = STYLES;
    document.head.appendChild(style);
    return () => {
      document.getElementById('b2b-dash-styles')?.remove();
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
    <div className="b2b-dash">
      {/* Sidebar */}
      <aside className={`b2b-sidebar ${mobileOpen ? 'mobile-open' : 'mobile-hidden'}`}>
        {/* Logo */}
        <a href="/dashboard" className="b2b-logo">
          <img
            src="https://all-india-villages-api.vercel.app/icon0.svg"
            alt="Village API"
            className="b2b-logo-img"
          />
          <div className="b2b-logo-text">
            <h1>Village API</h1>
            <p>Developer Portal</p>
          </div>
        </a>

        {/* Navigation */}
        <nav className="b2b-nav">
          {NAV.map(({ label, to, icon: Icon, end, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `b2b-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={18} />
              {label}
              {badge && <span className="b2b-nav-badge">{badge}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Plan Card */}
        <div className="b2b-plan-card">
          <div className="b2b-plan-label">Current Plan</div>
          <div className="b2b-plan-name">{user?.planType || 'FREE'}</div>
          <div className="b2b-plan-quota">5,000 req/day</div>
        </div>

        {/* User */}
        <div className="b2b-user">
          <div className="b2b-user-avatar">
            {user?.businessName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="b2b-user-info">
            <div className="b2b-user-name">{user?.businessName || user?.email}</div>
            <div className="b2b-user-role">CLIENT</div>
          </div>
          <button onClick={handleLogout} className="b2b-user-logout" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="b2b-main">
        {/* Top Bar */}
        <div className="b2b-topbar">
          <div className="b2b-topbar-left">
            <button
              className="b2b-mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div className="b2b-breadcrumb">
              <span>Developer Portal</span>
              <span>/</span>
              <span className="b2b-breadcrumb-active">{currentRoute?.label || 'Overview'}</span>
            </div>
          </div>

          <div className="b2b-topbar-right">
            <div className="b2b-search">
              <Search size={16} color="rgba(255,255,255,0.4)" />
              <input type="text" placeholder="Search..." />
            </div>

            <button className="b2b-notif" title="Notifications">
              <Bell size={18} />
              <span className="b2b-notif-badge" />
            </button>

            <div className="b2b-status">
              <span className="b2b-status-dot" />
              All systems operational
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="b2b-content">
          <Routes>
            <Route index element={<B2BOverview />} />
            <Route path="keys" element={<B2BApiKeys />} />
            <Route path="usage" element={<B2BUsage />} />
            <Route path="profile" element={<B2BProfile />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>

      {/* Mobile Overlay */}
      <div
        className={`b2b-overlay ${mobileOpen ? 'active' : ''}`}
        onClick={() => setMobileOpen(false)}
      />
    </div>
  );
};