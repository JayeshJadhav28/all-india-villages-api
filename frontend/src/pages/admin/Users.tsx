import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../lib/api';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, CheckCircle, XCircle, PauseCircle, ArrowUpRight } from 'lucide-react';

type Status = 'ALL' | 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
type Plan   = 'ALL' | 'FREE' | 'PREMIUM' | 'PRO' | 'UNLIMITED';

const STATUS_OPTIONS: Status[] = ['ALL', 'PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED'];
const PLAN_OPTIONS: Plan[]     = ['ALL', 'FREE', 'PREMIUM', 'PRO', 'UNLIMITED'];

function statusStyle(s: string): React.CSSProperties {
  const map: Record<string, [string, string]> = {
    ACTIVE:    ['rgba(74,222,128,0.1)',  '#4ade80'],
    PENDING:   ['rgba(251,191,36,0.1)',  '#fbbf24'],
    SUSPENDED: ['rgba(248,113,113,0.1)','#f87171'],
    REJECTED:  ['rgba(107,114,128,0.1)','#6b7280'],
  };
  const [bg, color] = map[s] ?? ['rgba(107,114,128,0.1)', '#6b7280'];
  return { background: bg, color, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, letterSpacing: '0.06em' };
}

function planStyle(p: string): React.CSSProperties {
  const map: Record<string, string> = { FREE: '#475569', PREMIUM: '#818cf8', PRO: '#fb923c', UNLIMITED: '#f43f5e' };
  return { color: map[p] ?? '#475569', fontSize: 11, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" };
}

function fmt(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const AdminUsers: React.FC = () => {
  const qc = useQueryClient();
  const [searchParams] = useSearchParams();
  const [search, setSearch]       = useState('');
  const [status, setStatus]       = useState<Status>((searchParams.get('status') as Status) ?? 'ALL');
  const [plan, setPlan]           = useState<Plan>('ALL');
  const [planModal, setPlanModal] = useState<{ id: string; current: string } | null>(null);
  const [newPlan, setNewPlan]     = useState('FREE');

  const { data: users = [], isLoading } = useQuery<any[]>({
    queryKey: ['admin-users', status, plan, search],
    queryFn: async () => {
      const r = await adminApi.getUsers({
        status: status === 'ALL' ? undefined : status,
        plan: plan === 'ALL' ? undefined : plan,
        search: search || undefined,
      });
      return r.data.data;
    },
  });

  const approve  = useMutation({ mutationFn: (id: string) => adminApi.approveUser(id),  onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }) });
  const reject   = useMutation({ mutationFn: (id: string) => adminApi.rejectUser(id),   onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }) });
  const suspend  = useMutation({ mutationFn: (id: string) => adminApi.suspendUser(id),  onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }) });
  const changePlan = useMutation({
    mutationFn: ({ id, planType }: { id: string; planType: string }) => adminApi.changeUserPlan(id, planType),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); setPlanModal(null); },
  });

  const filterBtn = (active: boolean): React.CSSProperties => ({
    padding: '5px 12px', borderRadius: 6, border: 'none', fontSize: 12, cursor: 'pointer',
    background: active ? 'rgba(244,63,94,0.12)' : 'transparent',
    color: active ? '#fb7185' : '#4b5563',
    fontWeight: active ? 600 : 400,
  });

  return (
    <div style={{ maxWidth: 1000 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em', margin: 0 }}>Users</h1>
        <p style={{ color: '#374151', fontSize: 13, marginTop: 5 }}>{users.length} client{users.length !== 1 ? 's' : ''} found</p>
      </div>

      {/* Filters */}
      <div style={{ background: '#0f1117', border: '1px solid #1a1d2e', borderRadius: 10, padding: '14px 16px', marginBottom: 18, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0b0d14', border: '1px solid #1a1d2e', borderRadius: 7, padding: '6px 12px', flex: '1', minWidth: 200 }}>
          <Search size={13} color="#374151" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: '#e5e7eb', width: '100%', fontFamily: 'inherit' }}
          />
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', gap: 2, background: '#0b0d14', borderRadius: 7, padding: 3 }}>
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => setStatus(s)} style={filterBtn(status === s)}>{s}</button>
          ))}
        </div>

        {/* Plan filter */}
        <div style={{ display: 'flex', gap: 2, background: '#0b0d14', borderRadius: 7, padding: 3 }}>
          {PLAN_OPTIONS.map(p => (
            <button key={p} onClick={() => setPlan(p)} style={filterBtn(plan === p)}>{p}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#0f1117', border: '1px solid #1a1d2e', borderRadius: 10, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 80px 90px 100px 110px 40px', gap: 0, padding: '10px 18px', borderBottom: '1px solid #1a1d2e' }}>
          {['Business', 'Email', 'Status', 'Plan', 'Joined', 'Actions', ''].map(h => (
            <div key={h} style={{ fontSize: 10, fontWeight: 700, color: '#374151', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</div>
          ))}
        </div>

        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#374151', fontSize: 13 }}>Loading users…</div>
        ) : users.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#374151', fontSize: 13 }}>No users match these filters.</div>
        ) : users.map((u: any) => (
          <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 80px 90px 100px 110px 40px', gap: 0, padding: '12px 18px', borderBottom: '1px solid #1a1d2e', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 12 }}>
              {u.businessName || '—'}
            </div>
            <div style={{ fontSize: 12, color: '#4b5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 12 }}>
              {u.email}
            </div>
            <div><span style={statusStyle(u.status)}>{u.status}</span></div>
            <div>
              <button onClick={() => { setPlanModal({ id: u.id, current: u.planType }); setNewPlan(u.planType); }}
                style={{ ...planStyle(u.planType), background: 'none', border: '1px solid #1a1d2e', padding: '3px 8px', borderRadius: 5, cursor: 'pointer' }}>
                {u.planType}
              </button>
            </div>
            <div style={{ fontSize: 11, color: '#374151' }}>{fmt(u.createdAt)}</div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 5 }}>
              {u.status === 'PENDING' && (
                <>
                  <button onClick={() => approve.mutate(u.id)} disabled={approve.isPending} title="Approve"
                    style={{ background: 'rgba(74,222,128,0.08)', border: 'none', borderRadius: 5, padding: '4px 7px', cursor: 'pointer', color: '#4ade80', display: 'flex' }}>
                    <CheckCircle size={13} />
                  </button>
                  <button onClick={() => reject.mutate(u.id)} disabled={reject.isPending} title="Reject"
                    style={{ background: 'rgba(248,113,113,0.08)', border: 'none', borderRadius: 5, padding: '4px 7px', cursor: 'pointer', color: '#f87171', display: 'flex' }}>
                    <XCircle size={13} />
                  </button>
                </>
              )}
              {u.status === 'ACTIVE' && (
                <button onClick={() => suspend.mutate(u.id)} disabled={suspend.isPending} title="Suspend"
                  style={{ background: 'rgba(251,191,36,0.08)', border: 'none', borderRadius: 5, padding: '4px 7px', cursor: 'pointer', color: '#fbbf24', display: 'flex' }}>
                  <PauseCircle size={13} />
                </button>
              )}
              {u.status === 'SUSPENDED' && (
                <button onClick={() => approve.mutate(u.id)} disabled={approve.isPending} title="Re-activate"
                  style={{ background: 'rgba(74,222,128,0.08)', border: 'none', borderRadius: 5, padding: '4px 7px', cursor: 'pointer', color: '#4ade80', display: 'flex' }}>
                  <CheckCircle size={13} />
                </button>
              )}
            </div>

            <Link to={`/admin/users/${u.id}`} style={{ color: '#374151', display: 'flex', justifyContent: 'center' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#9ca3af')}
              onMouseLeave={e => (e.currentTarget.style.color = '#374151')}
            >
              <ArrowUpRight size={13} />
            </Link>
          </div>
        ))}
      </div>

      {/* Plan change modal */}
      {planModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#0f1117', border: '1px solid #1a1d2e', borderRadius: 14, padding: 28, width: 340 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>Change Plan</div>
            <div style={{ fontSize: 12, color: '#4b5563', marginBottom: 20 }}>Current: <strong style={{ color: '#9ca3af' }}>{planModal.current}</strong></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
              {PLAN_OPTIONS.filter(p => p !== 'ALL').map(p => (
                <button key={p} onClick={() => setNewPlan(p)} style={{
                  padding: '10px', borderRadius: 7, border: `1px solid ${newPlan === p ? '#f43f5e' : '#1a1d2e'}`,
                  background: newPlan === p ? 'rgba(244,63,94,0.08)' : 'transparent',
                  color: newPlan === p ? '#fb7185' : '#6b7280', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>{p}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setPlanModal(null)} style={{ flex: 1, padding: '9px', borderRadius: 7, border: '1px solid #1a1d2e', background: 'transparent', color: '#6b7280', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={() => changePlan.mutate({ id: planModal.id, planType: newPlan })}
                disabled={changePlan.isPending || newPlan === planModal.current}
                style={{ flex: 1, padding: '9px', borderRadius: 7, border: 'none', background: '#f43f5e', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: newPlan === planModal.current ? 0.4 : 1 }}
              >
                {changePlan.isPending ? 'Saving…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};