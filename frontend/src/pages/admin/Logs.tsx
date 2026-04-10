import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../lib/api';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight as ChevRight, ArrowUpRight } from 'lucide-react';

function statusCodeColor(code: number) {
  if (code >= 500) return '#f87171';
  if (code >= 400) return '#fbbf24';
  if (code >= 200) return '#4ade80';
  return '#6b7280';
}

function methodColor(m: string) {
  const map: Record<string, string> = { GET: '#818cf8', POST: '#4ade80', DELETE: '#f87171', PUT: '#fbbf24', PATCH: '#fb923c' };
  return map[m] ?? '#6b7280';
}

function fmt(d: string) {
  return new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export const AdminLogs: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [page, setPage]         = useState(1);
  const [endpoint, setEndpoint] = useState('');
  const [userId, setUserId]     = useState(searchParams.get('userId') ?? '');
  const [statusCode, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-logs', page, endpoint, userId, statusCode],
    queryFn: async () => {
      const r = await adminApi.getLogs({
        page,
        limit: 50,
        endpoint: endpoint || undefined,
        userId: userId || undefined,
        statusCode: statusCode ? parseInt(statusCode) : undefined,
      } as any);
      return r.data;
    },
    placeholderData: (prev) => prev,
  });

  const logs: any[]  = data?.data ?? [];
  const pagination   = data?.pagination ?? { page: 1, totalPages: 1, total: 0 };

  const inputStyle: React.CSSProperties = {
    background: '#0b0d14', border: '1px solid #1a1d2e', borderRadius: 7,
    padding: '6px 11px', color: '#e5e7eb', fontSize: 13, outline: 'none', fontFamily: 'inherit',
  };

  return (
    <div style={{ maxWidth: 1060 }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em', margin: 0 }}>API Logs</h1>
        <p style={{ color: '#374151', fontSize: 13, marginTop: 5 }}>{pagination.total.toLocaleString()} total records</p>
      </div>

      {/* Filters */}
      <div style={{ background: '#0f1117', border: '1px solid #1a1d2e', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, ...inputStyle, flex: 1, minWidth: 180 }}>
          <Search size={12} color="#374151" />
          <input value={endpoint} onChange={e => { setEndpoint(e.target.value); setPage(1); }}
            placeholder="Filter by endpoint…"
            style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: '#e5e7eb', fontFamily: 'inherit', width: '100%' }} />
        </div>
        <input value={userId} onChange={e => { setUserId(e.target.value); setPage(1); }}
          placeholder="User ID"
          style={{ ...inputStyle, width: 200 }} />
        <select value={statusCode} onChange={e => { setStatus(e.target.value); setPage(1); }}
          style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="">All status codes</option>
          <option value="200">200</option>
          <option value="400">400</option>
          <option value="401">401</option>
          <option value="403">403</option>
          <option value="404">404</option>
          <option value="429">429</option>
          <option value="500">500</option>
        </select>
        {(endpoint || userId || statusCode) && (
          <button onClick={() => { setEndpoint(''); setUserId(''); setStatus(''); setPage(1); }}
            style={{ ...inputStyle, cursor: 'pointer', color: '#fb7185', border: '1px solid rgba(244,63,94,0.2)', fontSize: 12 }}>
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: '#0f1117', border: '1px solid #1a1d2e', borderRadius: 10, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '55px 60px 2fr 1fr 60px 70px 130px 28px', padding: '9px 16px', borderBottom: '1px solid #1a1d2e' }}>
          {['Code', 'Method', 'Endpoint', 'Client', 'ms', 'Key', 'Time', ''].map(h => (
            <div key={h} style={{ fontSize: 10, fontWeight: 700, color: '#374151', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{h}</div>
          ))}
        </div>

        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#374151', fontSize: 13 }}>Loading logs…</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#374151', fontSize: 13 }}>No logs match these filters.</div>
        ) : logs.map((log: any) => (
          <div key={log.id} style={{ display: 'grid', gridTemplateColumns: '55px 60px 2fr 1fr 60px 70px 130px 28px', padding: '9px 16px', borderBottom: '1px solid #1a1d2e', alignItems: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace", color: statusCodeColor(log.statusCode) }}>
              {log.statusCode}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: methodColor(log.method), fontFamily: "'IBM Plex Mono', monospace" }}>
              {log.method}
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: "'IBM Plex Mono', monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 12 }}>
              {log.endpoint}
            </div>
            <div style={{ fontSize: 11, color: '#4b5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
              {log.user?.businessName || log.user?.email || '—'}
            </div>
            <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: log.responseTimeMs > 200 ? '#fbbf24' : '#374151' }}>
              {log.responseTimeMs ?? '—'}
            </div>
            <div style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {log.apiKeyId ? log.apiKeyId.slice(0, 8) + '…' : '—'}
            </div>
            <div style={{ fontSize: 11, color: '#374151' }}>{fmt(log.createdAt)}</div>
            {log.userId ? (
              <Link to={`/admin/users/${log.userId}`} style={{ color: '#374151', display: 'flex' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#9ca3af')}
                onMouseLeave={e => (e.currentTarget.style.color = '#374151')}
              >
                <ArrowUpRight size={12} />
              </Link>
            ) : <div />}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
          <span style={{ fontSize: 12, color: '#374151' }}>
            Page {pagination.page} of {pagination.totalPages} · {pagination.total.toLocaleString()} records
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ display: 'flex', alignItems: 'center', padding: '6px 10px', borderRadius: 7, border: '1px solid #1a1d2e', background: 'transparent', color: page === 1 ? '#1f2937' : '#6b7280', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>
              <ChevronLeft size={13} />
            </button>
            <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
              style={{ display: 'flex', alignItems: 'center', padding: '6px 10px', borderRadius: 7, border: '1px solid #1a1d2e', background: 'transparent', color: page === pagination.totalPages ? '#1f2937' : '#6b7280', cursor: page === pagination.totalPages ? 'not-allowed' : 'pointer' }}>
              <ChevRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};