import { useQuery } from '@tanstack/react-query';
import { b2bApi } from '../../lib/api';
import { KeyRound, Activity, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useEffect } from 'react';

const PLAN_LIMITS: Record<string, number> = {
  FREE: 5000,
  PREMIUM: 50000,
  PRO: 300000,
  UNLIMITED: 1000000,
};

const STYLES = `
  .b2b-overview {
    max-width: 1200px;
  }

  .overview-header {
    margin-bottom: 2.5rem;
  }

  .overview-title {
    font-size: 28px;
    font-weight: 800;
    background: linear-gradient(135deg, #fff, rgba(255,255,255,0.7));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 8px;
    letter-spacing: -0.5px;
  }

  .overview-subtitle {
    color: rgba(255, 255, 255, 0.5);
    font-size: 15px;
    margin: 0;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.25rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: rgba(13, 18, 32, 0.6);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    padding: 1.75rem;
    transition: all 0.3s ease;
  }

  .stat-card:hover {
    background: rgba(13, 18, 32, 0.8);
    border-color: rgba(255, 153, 51, 0.2);
    transform: translateY(-2px);
  }

  .stat-card.accent {
    background: linear-gradient(135deg, rgba(255, 153, 51, 0.1), rgba(232, 83, 10, 0.08));
    border-color: rgba(255, 153, 51, 0.2);
  }

  .stat-label {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 10px;
  }

  .stat-value {
    font-size: 32px;
    font-weight: 800;
    background: linear-gradient(135deg, #FF9933, #E8530A);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-family: 'DM Mono', monospace;
    margin-bottom: 6px;
  }

  .stat-card:not(.accent) .stat-value {
    background: linear-gradient(135deg, #fff, rgba(255,255,255,0.8));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .stat-subtitle {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.4);
  }

  .usage-card {
    background: rgba(13, 18, 32, 0.6);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .usage-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
  }

  .usage-title {
    font-size: 15px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .usage-percent {
    font-size: 14px;
    font-family: 'DM Mono', monospace;
    font-weight: 600;
  }

  .usage-percent.low {
    color: #4ade80;
  }

  .usage-percent.medium {
    color: #fbbf24;
  }

  .usage-percent.high {
    color: #f87171;
  }

  .usage-bar {
    height: 8px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 100px;
    overflow: hidden;
    margin-bottom: 12px;
  }

  .usage-fill {
    height: 100%;
    border-radius: 100px;
    transition: width 0.6s ease;
  }

  .usage-fill.low {
    background: linear-gradient(90deg, #22c55e, #4ade80);
  }

  .usage-fill.medium {
    background: linear-gradient(90deg, #f59e0b, #fbbf24);
  }

  .usage-fill.high {
    background: linear-gradient(90deg, #ef4444, #f87171);
  }

  .usage-details {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.4);
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.25rem;
  }

  .action-card {
    background: rgba(13, 18, 32, 0.6);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    padding: 2rem;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.3s ease;
    display: block;
  }

  .action-card:hover {
    background: rgba(13, 18, 32, 0.8);
    border-color: rgba(255, 153, 51, 0.3);
    transform: translateY(-4px);
  }

  .action-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .action-icon {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: linear-gradient(135deg, rgba(255, 153, 51, 0.1), rgba(232, 83, 10, 0.08));
    border: 1px solid rgba(255, 153, 51, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .action-arrow {
    color: rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
  }

  .action-card:hover .action-arrow {
    color: #FF9933;
    transform: translateX(4px);
  }

  .action-title {
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 6px;
  }

  .action-desc {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.4);
    margin: 0;
    line-height: 1.6;
  }

  .getting-started {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(99, 102, 241, 0.05));
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 14px;
    padding: 2rem;
    margin-top: 2rem;
  }

  .gs-title {
    font-size: 15px;
    font-weight: 700;
    color: #818cf8;
    margin: 0 0 1.25rem;
  }

  .gs-steps {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .gs-step {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .gs-num {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #818cf8);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
  }

  .gs-text {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    padding-top: 2px;
    line-height: 1.6;
  }

  .alert-card {
    background: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 12px;
    padding: 1.25rem;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 2rem;
  }

  .alert-icon {
    color: #f87171;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .alert-text {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.6;
  }

  @media (max-width: 768px) {
    .overview-title {
      font-size: 24px;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .actions-grid {
      grid-template-columns: 1fr;
    }

    .stat-value {
      font-size: 28px;
    }

    .usage-card,
    .getting-started {
      padding: 1.5rem;
    }
  }
`;

export const B2BOverview: React.FC = () => {
  const { user } = useAuthStore();
  const { data, isLoading, error } = useQuery({
    queryKey: ['b2b-dashboard'],
    queryFn: async () => {
      const r = await b2bApi.getDashboard();
      return r.data.data;
    },
    retry: 1,
  });

  const plan = data?.plan || user?.planType || 'FREE';
  const dailyLimit = PLAN_LIMITS[plan] ?? 5000;
  const requestsToday = data?.requestsToday ?? 0;
  const usagePct = Math.min((requestsToday / dailyLimit) * 100, 100);
  const activeKeys = data?.activeKeys ?? 0;

  const usageLevel = usagePct > 90 ? 'high' : usagePct > 70 ? 'medium' : 'low';

  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'b2b-overview-styles';
    style.textContent = STYLES;
    document.head.appendChild(style);
    return () => {
      document.getElementById('b2b-overview-styles')?.remove();
    };
  }, []);

  return (
    <div className="b2b-overview">
      {/* Header */}
      <div className="overview-header">
        <h1 className="overview-title">
          Welcome back{user?.businessName ? `, ${user.businessName}` : ''}
        </h1>
        <p className="overview-subtitle">Here's your API usage summary for today.</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert-card">
          <AlertCircle className="alert-icon" size={20} />
          <div className="alert-text">
            Could not load dashboard data. The API server may be starting up. Please refresh in a
            moment.
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card accent">
          <div className="stat-label">Plan</div>
          <div className="stat-value">{plan}</div>
          <div className="stat-subtitle">Current subscription tier</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Active API Keys</div>
          <div className="stat-value">{isLoading ? '—' : activeKeys}</div>
          <div className="stat-subtitle">
            {activeKeys === 0 ? 'Create your first key →' : `${activeKeys} key${activeKeys !== 1 ? 's' : ''} in use`}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Requests Today</div>
          <div className="stat-value">{isLoading ? '—' : requestsToday.toLocaleString()}</div>
          <div className="stat-subtitle">of {dailyLimit.toLocaleString()} daily limit</div>
        </div>
      </div>

      {/* Usage Bar */}
      <div className="usage-card">
        <div className="usage-header">
          <span className="usage-title">Daily Request Usage</span>
          <span className={`usage-percent ${usageLevel}`}>{usagePct.toFixed(1)}%</span>
        </div>
        <div className="usage-bar">
          <div className={`usage-fill ${usageLevel}`} style={{ width: `${usagePct}%` }} />
        </div>
        <div className="usage-details">
          {requestsToday.toLocaleString()} / {dailyLimit.toLocaleString()} requests used
        </div>
      </div>

      {/* Quick Actions */}
      <div className="actions-grid">
        <Link to="/dashboard/keys" className="action-card">
          <div className="action-header">
            <div className="action-icon">
              <KeyRound size={20} color="#FF9933" />
            </div>
            <ArrowRight className="action-arrow" size={18} />
          </div>
          <h3 className="action-title">Manage API Keys</h3>
          <p className="action-desc">Create, revoke, and regenerate your API keys</p>
        </Link>

        <Link to="/dashboard/usage" className="action-card">
          <div className="action-header">
            <div className="action-icon">
              <Activity size={20} color="#FF9933" />
            </div>
            <ArrowRight className="action-arrow" size={18} />
          </div>
          <h3 className="action-title">View Usage Stats</h3>
          <p className="action-desc">Detailed requests, errors, and usage trends</p>
        </Link>
      </div>

      {/* Getting Started */}
      {activeKeys === 0 && !isLoading && (
        <div className="getting-started">
          <div className="gs-title">Getting Started</div>
          <div className="gs-steps">
            {[
              'Create an API key from the API Keys page',
              'Store your key and secret securely — the secret is shown only once',
              'Add X-API-Key and X-API-Secret headers to your requests',
              'Call GET /api/v1/states to verify your setup',
            ].map((step, i) => (
              <div key={i} className="gs-step">
                <div className="gs-num">{i + 1}</div>
                <div className="gs-text">{step}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};