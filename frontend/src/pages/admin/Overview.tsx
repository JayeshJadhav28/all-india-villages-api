import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../lib/api';
import { Link } from 'react-router-dom';
import { Users, Activity, Database, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

function StatBox({ label, value, icon: Icon, accent }: { label: string; value: string | number; icon: any; accent?: string }) {
  return (
    <div style={{ background: '#0f1117', border: '1px solid #1a1d2e', borderRadius: 10, padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
        <Icon size={14} color={accent ?? '#374151'} />
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#f1f5f9', fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '-0.02em' }}>{value}</div>
    </div>
  );
}

function statusColor(s: string) {
  return s === 'ACTIVE' ? '#4ade80' : s === 'PENDING' ? '#fbbf24' : s === 'SUSPENDED' ? '#f87171' : '#6b7280';
}
function statusBg(s: string) {
  return s === 'ACTIVE' ? 'rgba(74,222,128,0.08)' : s === 'PENDING' ? 'rgba(251,191,36,0.08)' : s === 'SUSPENDED' ? 'rgba(248,113,113,0.08)' : 'rgba(107,114,128,0.08)';
}

export const AdminOverview: React.FC = () => {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const r = await adminApi.getDashboard();
      return r.data.data;
    },
    refetchInterval: 30000,
  });

  const { data: pendingData } = useQuery({
    queryKey: ['admin-users', 'PENDING'],
    queryFn: async () => {
      const r = await adminApi.getUsers({ status: 'PENDING' });
      return r.data.data as any[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminApi.approveUser(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); qc.invalidateQueries({ queryKey: ['admin-dashboard'] }); },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => adminApi.rejectUser(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); qc.invalidateQueries({ queryKey: ['admin-dashboard'] }); },
  });

  const pending = pendingData ?? [];

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em', margin: 0 }}>Overview</h1>
        <p style={{ color: '#374151', fontSize: 13, marginTop: 5 }}>Platform metrics and pending approvals.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        <StatBox label="Total Clients" value={isLoading ? '—' : data?.users?.total ?? 0} icon={Users} />
        <StatBox label="Active" value={isLoading ? '—' : data?.users?.active ?? 0} icon={Users} accent="#4ade80" />
        <StatBox label="Pending" value={isLoading ? '—' : data?.users?.pending ?? 0} icon={Clock} accent="#fbbf24" />
        <StatBox label="Req Today" value={isLoading ? '—' : (data?.requests?.today ?? 0).toLocaleString()} icon={Activity} accent="#818cf8" />
      </div>

      {/* Data coverage */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
        <div style={{ background: '#0f1117', border: '1px solid #1a1d2e', borderRadius: 10, padding: '18px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Data Coverage</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>States imported</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', fontFamily: "'IBM Plex Mono', monospace" }}>{data?.data?.states ?? 0}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>Villages imported</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', fontFamily: "'IBM Plex Mono', monospace" }}>{(data?.data?.villages ?? 0).toLocaleString()}</span>
          </div>
        </div>
        <div style={{ background: '#0f1117', border: '1px solid #1a1d2e', borderRadius: 10, padding: '18px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>API Requests</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>All time</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', fontFamily: "'IBM Plex Mono', monospace" }}>{(data?.requests?.total ?? 0).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>Today</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#fb7185', fontFamily: "'IBM Plex Mono', monospace" }}>{(data?.requests?.today ?? 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Pending approvals */}
      <div style={{ background: '#0f1117', border: '1px solid #1a1d2e', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1a1d2e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb' }}>Pending Approvals</span>
            {pending.length > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(251,191,36,0.15)', color: '#fbbf24', padding: '2px 7px', borderRadius: 20 }}>
                {pending.length}
              </span>
            )}
          </div>
          <Link to="/admin/users?status=PENDING" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#374151', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#9ca3af')}
            onMouseLeave={e => (e.currentTarget.style.color = '#374151')}
          >
            View all <ArrowRight size={11} />
          </Link>
        </div>

        {pending.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center', color: '#374151', fontSize: 13 }}>
            No pending approvals — you're all caught up.
          </div>
        ) : (
          pending.slice(0, 5).map((u: any) => (
            <div key={u.id} style={{ padding: '14px 20px', borderBottom: '1px solid #1a1d2e', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb', marginBottom: 2 }}>{u.businessName || '—'}</div>
                <div style={{ fontSize: 12, color: '#4b5563' }}>{u.email}</div>
              </div>
              <div style={{ fontSize: 11, color: '#374151', flexShrink: 0 }}>
                {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </div>
              <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
                <button
                  onClick={() => approveMutation.mutate(u.id)}
                  disabled={approveMutation.isPending}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6, border: 'none', background: 'rgba(74,222,128,0.1)', color: '#4ade80', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  <CheckCircle size={12} /> Approve
                </button>
                <button
                  onClick={() => rejectMutation.mutate(u.id)}
                  disabled={rejectMutation.isPending}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6, border: 'none', background: 'rgba(248,113,113,0.08)', color: '#f87171', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  <XCircle size={12} /> Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};