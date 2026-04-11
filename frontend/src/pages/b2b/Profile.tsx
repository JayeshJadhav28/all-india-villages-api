import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { b2bApi } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { CheckCircle, AlertCircle, Save } from 'lucide-react';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = (disabled = false): React.CSSProperties => ({
  width: '100%',
  background: disabled ? 'rgba(15,17,23,0.5)' : '#0f1117',
  border: '1px solid #1e2130',
  borderRadius: 8,
  padding: '10px 14px',
  color: disabled ? '#475569' : '#f1f5f9',
  fontSize: 14,
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
  cursor: disabled ? 'not-allowed' : 'text',
});

export const B2BProfile: React.FC = () => {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['b2b-profile'],
    queryFn: async () => {
      const r = await b2bApi.getProfile();
      return r.data.data;
    },
    retry: 1,
  });

  const [form, setForm] = useState({ businessName: '', phone: '', gstNumber: '' });
  const [initialized, setInitialized] = useState(false);

  if (profile && !initialized) {
    setForm({
      businessName: profile.businessName ?? '',
      phone: profile.phone ?? '',
      gstNumber: profile.gstNumber ?? '',
    });
    setInitialized(true);
  }

  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  const updateMutation = useMutation({
    mutationFn: () => b2bApi.updateProfile(form),
    onSuccess: () => {
      setSaved(true);
      setSaveError('');
      qc.invalidateQueries({ queryKey: ['b2b-profile'] });
      setTimeout(() => setSaved(false), 2500);
    },
    onError: (e: any) => {
      setSaveError(e.response?.data?.error?.message || 'Failed to save changes');
    },
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const PLAN_FEATURES: Record<string, string[]> = {
    FREE:      ['5,000 req/day', '100 burst/min', 'Basic geo endpoints'],
    PREMIUM:   ['50,000 req/day', '500 burst/min', 'All geo endpoints', 'Priority support'],
    PRO:       ['300,000 req/day', '2,000 burst/min', 'All endpoints', 'State restrictions'],
    UNLIMITED: ['1,000,000 req/day', '5,000 burst/min', 'Everything', 'Dedicated support'],
  };

  const plan = profile?.planType || user?.planType || 'FREE';
  const features = PLAN_FEATURES[plan] ?? PLAN_FEATURES.FREE;

  return (
    <div style={{ maxWidth: 760, display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>

      {/* Left — editable profile */}
      <div>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em', margin: 0 }}>Profile</h1>
          <p style={{ color: '#475569', fontSize: 14, marginTop: 6 }}>Update your business details.</p>
        </div>

        <div style={{ background: '#13161f', border: '1px solid #1e2130', borderRadius: 12, padding: '24px 28px' }}>
          {saved && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, color: '#4ade80', fontSize: 13 }}>
              <CheckCircle size={14} /> Changes saved successfully
            </div>
          )}
          {saveError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, color: '#f87171', fontSize: 13 }}>
              <AlertCircle size={14} /> {saveError}
            </div>
          )}

          <Field label="Email">
            <input value={profile?.email ?? user?.email ?? ''} disabled style={inputStyle(true)} />
            <div style={{ fontSize: 11, color: '#334155', marginTop: 5 }}>Contact support to change your email</div>
          </Field>

          <Field label="Business Name">
            <input value={form.businessName} onChange={set('businessName')} style={inputStyle()} placeholder="Acme Logistics Pvt. Ltd." />
          </Field>

          <Field label="Phone">
            <input value={form.phone} onChange={set('phone')} style={inputStyle()} placeholder="+91 98765 43210" />
          </Field>

          <Field label="GST Number (optional)">
            <input value={form.gstNumber} onChange={set('gstNumber')} autoComplete="off" style={inputStyle()} placeholder="22AAAAA0000A1Z5" />
          </Field>

          <button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending || isLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '10px 20px', borderRadius: 8, border: 'none',
              background: '#6366f1', color: '#fff',
              fontSize: 14, fontWeight: 600,
              cursor: updateMutation.isPending ? 'not-allowed' : 'pointer',
              opacity: updateMutation.isPending ? 0.7 : 1,
            }}
          >
            <Save size={14} />
            {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Right — plan info */}
      <div>
        <div style={{ marginBottom: 16, height: 62 }} />
        <div style={{ background: '#13161f', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '20px 22px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Your Plan</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', marginBottom: 16 }}>{plan}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {features.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#94a3b8' }}>
                <CheckCircle size={13} color="#6366f1" style={{ flexShrink: 0 }} />
                {f}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #1e2130', fontSize: 12, color: '#334155' }}>
            To upgrade your plan, contact support or your account manager.
          </div>
        </div>

        {/* Account status */}
        <div style={{ background: '#13161f', border: '1px solid #1e2130', borderRadius: 12, padding: '16px 20px', marginTop: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Account Status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#4ade80' }}>ACTIVE</span>
          </div>
          <div style={{ fontSize: 12, color: '#334155', marginTop: 8 }}>
            Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—'}
          </div>
        </div>
      </div>
    </div>
  );
};