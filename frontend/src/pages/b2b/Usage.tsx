import { useQuery } from '@tanstack/react-query';
import { b2bApi } from '../../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { AlertCircle } from 'lucide-react';

const PLAN_LIMITS: Record<string, number> = {
  FREE: 5000, PREMIUM: 50000, PRO: 300000, UNLIMITED: 1000000,
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1e2130', border: '1px solid #334155', borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#818cf8', fontFamily: "'IBM Plex Mono', monospace" }}>
        {payload[0].value.toLocaleString()}
      </div>
      <div style={{ fontSize: 11, color: '#475569' }}>requests</div>
    </div>
  );
}

export const B2BUsage: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['b2b-usage'],
    queryFn: async () => {
      const r = await b2bApi.getUsage(30);
      return r.data.data;
    },
    retry: 1,
  });

  const dashQ = useQuery({
    queryKey: ['b2b-dashboard'],
    queryFn: async () => {
      const r = await b2bApi.getDashboard();
      return r.data.data;
    },
    retry: 1,
  });

  const plan = dashQ.data?.plan || 'FREE';
  const dailyLimit = PLAN_LIMITS[plan] ?? 5000;
  const chartData: { date: string; requests: number }[] = data?.daily ?? [];
  const totalMonth = chartData.reduce((s, d) => s + d.requests, 0);
  const peak = Math.max(...chartData.map(d => d.requests), 0);
  const avg = chartData.length ? Math.round(totalMonth / chartData.length) : 0;
  const todayRow = chartData[chartData.length - 1];
  const todayUsage = todayRow?.requests ?? 0;

  return (
    <div style={{ maxWidth: 860 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em', margin: 0 }}>Usage</h1>
        <p style={{ color: '#475569', fontSize: 14, marginTop: 6 }}>Request activity for the last 30 days.</p>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#f87171', fontSize: 13 }}>
          <AlertCircle size={14} /> Could not load usage data.
        </div>
      )}

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Today', value: todayUsage.toLocaleString() },
          { label: '30-Day Total', value: totalMonth.toLocaleString() },
          { label: 'Peak Day', value: peak.toLocaleString() },
          { label: 'Daily Average', value: avg.toLocaleString() },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: '#13161f', border: '1px solid #1e2130', borderRadius: 10, padding: '16px 18px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '-0.02em' }}>{isLoading ? '—' : value}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ background: '#13161f', border: '1px solid #1e2130', borderRadius: 12, padding: '24px 24px 16px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 20 }}>Daily Requests — Last 30 Days</div>
        {isLoading ? (
          <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 13 }}>Loading chart…</div>
        ) : chartData.length === 0 ? (
          <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 13 }}>No usage data yet. Start making API calls to see activity here.</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={14} margin={{ left: -10, right: 4, top: 4, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#1e2130" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#475569' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                }}
              />
              <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="requests" fill="#6366f1" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Daily quota bar */}
      <div style={{ background: '#13161f', border: '1px solid #1e2130', borderRadius: 12, padding: '20px 24px', marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>Today's Quota ({plan} plan)</span>
          <span style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: '#94a3b8' }}>
            {todayUsage.toLocaleString()} / {dailyLimit.toLocaleString()}
          </span>
        </div>
        <div style={{ height: 6, background: '#1e2130', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${Math.min((todayUsage / dailyLimit) * 100, 100)}%`,
            background: 'linear-gradient(90deg, #6366f1, #818cf8)',
            borderRadius: 99,
          }} />
        </div>
      </div>
    </div>
  );
};