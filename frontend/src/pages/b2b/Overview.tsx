import { useQuery } from '@tanstack/react-query';
import { b2bApi } from '../../lib/api';
import { KeyRound, Activity, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const PLAN_LIMITS: Record<string, number> = {
  FREE: 5000, PREMIUM: 50000, PRO: 300000, UNLIMITED: 1000000,
};

function StatBox({ label, value, sub, accent = false }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div style={{
      background: '#13161f',
      border: `1px solid ${accent ? 'rgba(99,102,241,0.3)' : '#1e2130'}`,
      borderRadius: 12,
      padding: '20px 24px',
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: accent ? '#818cf8' : '#f1f5f9', letterSpacing: '-0.02em', fontFamily: "'IBM Plex Mono', monospace" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

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

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em', margin: 0 }}>
          Welcome back{user?.businessName ? `, ${user.businessName}` : ''}
        </h1>
        <p style={{ color: '#475569', fontSize: 14, marginTop: 6 }}>
          Here's your API usage summary for today.
        </p>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '12px 16px', marginBottom: 24, color: '#f87171', fontSize: 13 }}>
          <AlertCircle size={14} />
          Could not load dashboard data. The API server may be starting up.
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatBox label="Plan" value={plan} sub="Current subscription tier" accent />
        <StatBox label="Active API Keys" value={isLoading ? '—' : activeKeys} sub={activeKeys === 0 ? 'Create your first key →' : `${activeKeys} key${activeKeys !== 1 ? 's' : ''} in use`} />
        <StatBox label="Requests Today" value={isLoading ? '—' : requestsToday.toLocaleString()} sub={`of ${dailyLimit.toLocaleString()} daily limit`} />
      </div>

      {/* Usage bar */}
      <div style={{ background: '#13161f', border: '1px solid #1e2130', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>Daily Request Usage</span>
          <span style={{ fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", color: usagePct > 90 ? '#f87171' : usagePct > 70 ? '#fbbf24' : '#4ade80' }}>
            {usagePct.toFixed(1)}%
          </span>
        </div>
        <div style={{ height: 6, background: '#1e2130', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${usagePct}%`,
            background: usagePct > 90 ? '#ef4444' : usagePct > 70 ? '#f59e0b' : 'linear-gradient(90deg, #6366f1, #818cf8)',
            borderRadius: 99,
            transition: 'width 0.6s ease',
          }} />
        </div>
        <div style={{ fontSize: 12, color: '#475569', marginTop: 8 }}>
          {requestsToday.toLocaleString()} / {dailyLimit.toLocaleString()} requests used
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Link to="/dashboard/keys" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#13161f', border: '1px solid #1e2130', borderRadius: 12, padding: '20px 24px', cursor: 'pointer', transition: 'border-color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#6366f1')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e2130')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <KeyRound size={18} color="#6366f1" />
              <ArrowRight size={14} color="#334155" />
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>Manage API Keys</div>
            <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>Create, revoke, and regenerate keys</div>
          </div>
        </Link>

        <Link to="/dashboard/usage" style={{ textDecoration: 'none' }}>
          <div style={{ background: '#13161f', border: '1px solid #1e2130', borderRadius: 12, padding: '20px 24px', cursor: 'pointer', transition: 'border-color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#6366f1')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e2130')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <Activity size={18} color="#6366f1" />
              <ArrowRight size={14} color="#334155" />
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>View Usage Stats</div>
            <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>Requests, errors, and trends</div>
          </div>
        </Link>
      </div>

      {/* Getting started — only if no keys */}
      {activeKeys === 0 && !isLoading && (
        <div style={{ marginTop: 24, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#818cf8', marginBottom: 12 }}>Getting Started</div>
          {['Create an API key from the API Keys page', 'Store your key and secret securely — the secret is shown only once', 'Add X-API-Key and X-API-Secret headers to your requests', 'Call GET /api/v1/states to verify your setup'].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{i + 1}</div>
              <div style={{ fontSize: 13, color: '#94a3b8', paddingTop: 1 }}>{step}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};