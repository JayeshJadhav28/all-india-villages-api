import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../lib/api';
import { ArrowLeft, CheckCircle, XCircle, PauseCircle, Key, Activity } from 'lucide-react';

function statusStyle(s: string): React.CSSProperties {
  const map: Record<string, [string, string]> = {
    ACTIVE:    ['rgba(74,222,128,0.1)',  '#4ade80'],
    PENDING:   ['rgba(251,191,36,0.1)',  '#fbbf24'],
    SUSPENDED: ['rgba(248,113,113,0.1)','#f87171'],
    REJECTED:  ['rgba(107,114,128,0.1)','#6b7280'],
  };
  const [bg, color] = map[s] ?? ['rgba(107,114,128,0.1)', '#6b7280'];
  return { background: bg, color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, letterSpacing: '0.05em', display: 'inline-block' };
}

function fmt(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid #1a1d2e' }}>
      <div style={{ width: 160, fontSize: 12, color: '#4b5563', flexShrink: 0 }}>{label}</div>
      <div style={{ fontSize: 13, color: '#e5e7eb', flex: 1 }}>{value}</div>
    </div>
  );
}

export const AdminUserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [planModal, setPlanModal] = useState(false);
  const [newPlan, setNewPlan]     = useState('FREE');

  const { data: user, isLoading } = useQuery({
    queryKey: ['admin-user-detail', id],
    queryFn: async () => {
      const r = await adminApi.getUserDetail(id!);
      return r.data.data as any;
    },
    enabled: !!id,
  });

  const onSuccess = () => {
    qc.invalidateQueries({ queryKey: ['admin-user-detail', id] });
    qc.invalidateQueries({ queryKey: ['admin-users'] });
  };

  const approve  = useMutation({ mutationFn: () => adminApi.approveUser(id!),  onSuccess });
  const reject   = useMutation({ mutationFn: () => adminApi.rejectUser(id!),   onSuccess });
  const suspend  = useMutation({ mutationFn: () => adminApi.suspendUser(id!),  onSuccess });
  const changePlan = useMutation({
    mutationFn: () => adminApi.changeUserPlan(id!, newPlan),
    onSuccess: () => { onSuccess(); setPlanModal(false); },
  });

  if (isLoading) return <div style={{ color: '#374151', fontSize: 13, padding: 40 }}>Loading…</div>;
  if (!user) return <div style={{ color: '#374151', fontSize: 13, padding: 40 }}>User not found.</div>;

  const apiKeys: any[] = user.apiKeys ?? [];

  return (
    <div style={{ maxWidth: 820 }}>
      {/* Back */}
      <button onClick={() => navigate('/admin/users')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563', fontSize: 13, marginBottom: 20, padding: 0 }}
        onMouseEnter={e => (e.currentTarget.style.color = '#9ca3af')}
        onMouseLeave={e => (e.currentTarget.style.color = '#4b5563')}
      >
        <ArrowLeft size={14} /> Back to users
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em', margin: 0 }}>
            {user.businessName || user.email}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
            <span style={statusStyle(user.status)}>{user.status}</span>
            <span style={{ fontSize: 12, color: '#374151' }}>{user.planType} plan</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          {user.status === 'PENDING' && (
            <>
              <button onClick={() => approve.mutate()} disabled={approve.isPending}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 7, border: 'none', background: 'rgba(74,222,128,0.1)', color: '#4ade80', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                <CheckCircle size={13} /> Approve
              </button>
              <button onClick={() => reject.mutate()} disabled={reject.isPending}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 7, border: 'none', background: 'rgba(248,113,113,0.08)', color: '#f87171', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                <XCircle size={13} /> Reject
              </button>
            </>
          )}
          {user.status === 'ACTIVE' && (
            <button onClick={() => suspend.mutate()} disabled={suspend.isPending}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 7, border: 'none', background: 'rgba(251,191,36,0.08)', color: '#fbbf24', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <PauseCircle size={13} /> Suspend
            </button>
          )}
          {user.status === 'SUSPENDED' && (
            <button onClick={() => approve.mutate()} disabled={approve.isPending}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 7, border: 'none', background: 'rgba(74,222,128,0.1)', color: '#4ade80', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <CheckCircle size={13} /> Re-activate
            </button>
          )}
          <button onClick={() => { setNewPlan(user.planType); setPlanModal(true); }}
            style={{ padding: '7px 14px', borderRadius: 7, border: '1px solid #1a1d2e', background: 'transparent', color: '#6b7280', fontSize: 13, cursor: 'pointer' }}>
            Change Plan
          </button>
        </div>
      </div>

      {/* Profile info */}
      <div style={{ background: '#0f1117', border: '1px solid #1a1d2e', borderRadius: 10, padding: '16px 20px', marginBottom: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Account Details</div>
        <Row label="Email" value={user.email} />
        <Row label="Business Name" value={user.businessName || '—'} />
        <Row label="Phone" value={user.phone || '—'} />
        <Row label="GST Number" value={user.gstNumber || '—'} />
        <Row label="Role" value={user.role} />
        <Row label="Plan" value={user.planType} />
        <Row label="Registered" value={fmt(user.createdAt)} />
        <Row label="Approved" value={fmt(user.approvedAt)} />
        <Row label="Last Login" value={fmt(user.lastLoginAt)} />
        <Row label="Total API Calls" value={user._count?.apiLogs?.toLocaleString() ?? '0'} />
      </div>

      {/* API Keys */}
      <div style={{ background: '#0f1117', border: '1px solid #1a1d2e', borderRadius: 10, overflow: 'hidden', marginBottom: 18 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #1a1d2e', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Key size={13} color="#374151" />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb' }}>API Keys</span>
          <span style={{ fontSize: 11, color: '#374151' }}>({apiKeys.length})</span>
        </div>
        {apiKeys.length === 0 ? (
          <div style={{ padding: '20px', fontSize: 13, color: '#374151' }}>No API keys created.</div>
        ) : apiKeys.map((k: any) => (
          <div key={k.id} style={{ padding: '12px 20px', borderBottom: '1px solid #1a1d2e', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb', marginBottom: 3 }}>{k.name}</div>
              <code style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#4b5563' }}>{k.key}</code>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
              background: k.status === 'ACTIVE' ? 'rgba(74,222,128,0.08)' : 'rgba(107,114,128,0.08)',
              color: k.status === 'ACTIVE' ? '#4ade80' : '#6b7280',
            }}>{k.status}</span>
            <div style={{ fontSize: 11, color: '#374151', textAlign: 'right' }}>
              <div>Created {fmt(k.createdAt)}</div>
              <div>Last used {fmt(k.lastUsedAt)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* View logs link */}
      <Link to={`/admin/logs?userId=${user.id}`} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#4b5563', textDecoration: 'none' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#9ca3af')}
        onMouseLeave={e => (e.currentTarget.style.color = '#4b5563')}
      >
        <Activity size={13} /> View API logs for this user
      </Link>

      {/* Plan modal */}
      {planModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#0f1117', border: '1px solid #1a1d2e', borderRadius: 14, padding: 28, width: 340 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Change Plan</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
              {['FREE', 'PREMIUM', 'PRO', 'UNLIMITED'].map(p => (
                <button key={p} onClick={() => setNewPlan(p)} style={{
                  padding: '10px', borderRadius: 7,
                  border: `1px solid ${newPlan === p ? '#f43f5e' : '#1a1d2e'}`,
                  background: newPlan === p ? 'rgba(244,63,94,0.08)' : 'transparent',
                  color: newPlan === p ? '#fb7185' : '#6b7280',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>{p}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setPlanModal(false)} style={{ flex: 1, padding: '9px', borderRadius: 7, border: '1px solid #1a1d2e', background: 'transparent', color: '#6b7280', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => changePlan.mutate()} disabled={changePlan.isPending || newPlan === user.planType}
                style={{ flex: 1, padding: '9px', borderRadius: 7, border: 'none', background: '#f43f5e', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: newPlan === user.planType ? 0.4 : 1 }}>
                {changePlan.isPending ? 'Saving…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};