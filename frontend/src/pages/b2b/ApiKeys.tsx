import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { b2bApi } from '../../lib/api';
import { Plus, Copy, Eye, EyeOff, Trash2, RefreshCw, AlertCircle, CheckCircle, X } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  status: string;
  createdAt: string;
  lastUsedAt?: string;
}

interface NewKeyResult {
  id: string;
  name: string;
  key: string;
  secret: string;
}

// ── helpers ───────────────────────────────────────
function fmt(date?: string) {
  if (!date) return 'Never';
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} title="Copy" style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#4ade80' : '#475569', display: 'flex', padding: 4, borderRadius: 4 }}
      onMouseEnter={e => { if (!copied) e.currentTarget.style.color = '#94a3b8'; }}
      onMouseLeave={e => { if (!copied) e.currentTarget.style.color = '#475569'; }}
    >
      {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
    </button>
  );
}

// ── Secret reveal modal ────────────────────────────
function SecretModal({ newKey, onClose }: { newKey: NewKeyResult; onClose: () => void }) {
  const [showSecret, setShowSecret] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
      <div style={{ background: '#13161f', border: '1px solid #1e2130', borderRadius: 16, padding: 32, width: '100%', maxWidth: 520, position: 'relative' }}>
        <button onClick={onClose} disabled={!confirmed} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: confirmed ? 'pointer' : 'not-allowed', color: '#475569', display: 'flex', opacity: confirmed ? 1 : 0.4 }}>
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={18} color="#4ade80" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>API Key Created</div>
            <div style={{ fontSize: 12, color: '#475569' }}>{newKey.name}</div>
          </div>
        </div>

        <div style={{ background: '#ef4444', borderRadius: 8, padding: '10px 14px', marginBottom: 20, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <AlertCircle size={14} color="#fff" style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 12, color: '#fff', lineHeight: 1.5 }}>
            Copy your secret now. It will <strong>never be shown again</strong> after you close this dialog.
          </span>
        </div>

        {[
          { label: 'API Key', value: newKey.key },
          { label: 'API Secret', value: newKey.secret, secret: true },
        ].map(({ label, value, secret }) => (
          <div key={label} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0f1117', border: '1px solid #1e2130', borderRadius: 8, padding: '10px 12px' }}>
              <code style={{ flex: 1, fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: '#94a3b8', wordBreak: 'break-all' }}>
                {secret && !showSecret ? '•'.repeat(32) : value}
              </code>
              {secret && (
                <button onClick={() => setShowSecret(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex', padding: 2 }}>
                  {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              )}
              <CopyButton text={value} />
            </div>
          </div>
        ))}

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, cursor: 'pointer' }}>
          <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: '#6366f1', cursor: 'pointer' }} />
          <span style={{ fontSize: 13, color: '#94a3b8' }}>I have saved my API key and secret</span>
        </label>

        <button onClick={onClose} disabled={!confirmed} style={{
          width: '100%', padding: '12px', borderRadius: 8, border: 'none',
          background: confirmed ? '#6366f1' : '#1e2130',
          color: confirmed ? '#fff' : '#475569',
          fontSize: 14, fontWeight: 600, cursor: confirmed ? 'pointer' : 'not-allowed',
          transition: 'background 0.15s',
        }}>
          Done
        </button>
      </div>
    </div>
  );
}

// ── Create key modal ───────────────────────────────
function CreateModal({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string) => void }) {
  const [name, setName] = useState('');
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
      <div style={{ background: '#13161f', border: '1px solid #1e2130', borderRadius: 16, padding: 32, width: '100%', maxWidth: 400 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>New API Key</div>
        <div style={{ fontSize: 13, color: '#475569', marginBottom: 24 }}>Give your key a memorable name, e.g. "Production App" or "Testing".</div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Key Name</div>
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && name.trim()) onCreate(name.trim()); }}
            placeholder="Production App"
            style={{ width: '100%', background: '#0f1117', border: '1px solid #1e2130', borderRadius: 8, padding: '10px 12px', color: '#f1f5f9', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #1e2130', background: 'transparent', color: '#94a3b8', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => name.trim() && onCreate(name.trim())} disabled={!name.trim()} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: name.trim() ? '#6366f1' : '#1e2130', color: name.trim() ? '#fff' : '#475569', fontSize: 14, fontWeight: 600, cursor: name.trim() ? 'pointer' : 'not-allowed' }}>
            Create Key
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────
export const B2BApiKeys: React.FC = () => {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newKey, setNewKey] = useState<NewKeyResult | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  const { data: keys = [], isLoading, error } = useQuery<ApiKey[]>({
    queryKey: ['b2b-keys'],
    queryFn: async () => {
      const r = await b2bApi.getApiKeys();
      return r.data.data ?? [];
    },
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => b2bApi.createApiKey(name),
    onSuccess: (res) => {
      const d = res.data.data;
      setNewKey(d);
      qc.invalidateQueries({ queryKey: ['b2b-keys'] });
      setShowCreate(false);
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => b2bApi.revokeApiKey(id),
    onSuccess: () => {
      setRevoking(null);
      qc.invalidateQueries({ queryKey: ['b2b-keys'] });
    },
  });

  const activeKeys = keys.filter(k => k.status === 'ACTIVE');

  return (
    <div style={{ maxWidth: 860 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em', margin: 0 }}>API Keys</h1>
          <p style={{ color: '#475569', fontSize: 14, marginTop: 6 }}>
            {activeKeys.length} active key{activeKeys.length !== 1 ? 's' : ''} · max 5
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          disabled={activeKeys.length >= 5}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 16px', borderRadius: 8, border: 'none',
            background: activeKeys.length >= 5 ? '#1e2130' : '#6366f1',
            color: activeKeys.length >= 5 ? '#475569' : '#fff',
            fontSize: 13, fontWeight: 600, cursor: activeKeys.length >= 5 ? 'not-allowed' : 'pointer',
          }}
        >
          <Plus size={14} /> New Key
        </button>
      </div>

      {/* Usage note */}
      <div style={{ background: '#13161f', border: '1px solid #1e2130', borderRadius: 8, padding: '12px 16px', marginBottom: 24, fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
        Pass <code style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#818cf8', background: 'rgba(99,102,241,0.1)', padding: '1px 5px', borderRadius: 4 }}>X-API-Key</code> and <code style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#818cf8', background: 'rgba(99,102,241,0.1)', padding: '1px 5px', borderRadius: 4 }}>X-API-Secret</code> as request headers to authenticate all <code style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#94a3b8' }}>/api/v1/*</code> calls.
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#f87171', fontSize: 13 }}>
          <AlertCircle size={14} /> Failed to load keys. Check your connection.
        </div>
      )}

      {/* Keys list */}
      {isLoading ? (
        <div style={{ color: '#475569', fontSize: 14, padding: '40px 0', textAlign: 'center' }}>Loading keys…</div>
      ) : keys.length === 0 ? (
        <div style={{ background: '#13161f', border: '1px dashed #1e2130', borderRadius: 12, padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#475569', marginBottom: 16 }}>No API keys yet. Create your first one to start making API calls.</div>
          <button onClick={() => setShowCreate(true)} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Create First Key
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {keys.map((k) => (
            <div key={k.id} style={{ background: '#13161f', border: `1px solid ${k.status === 'ACTIVE' ? '#1e2130' : 'rgba(239,68,68,0.15)'}`, borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, opacity: k.status !== 'ACTIVE' ? 0.6 : 1 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{k.name}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                    background: k.status === 'ACTIVE' ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)',
                    color: k.status === 'ACTIVE' ? '#4ade80' : '#f87171',
                    letterSpacing: '0.06em',
                  }}>{k.status}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <code style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: '#64748b', background: '#0f1117', padding: '3px 8px', borderRadius: 5 }}>
                    {k.key}
                  </code>
                  <CopyButton text={k.key} />
                </div>
              </div>

              <div style={{ fontSize: 11, color: '#475569', textAlign: 'right', flexShrink: 0 }}>
                <div>Created {fmt(k.createdAt)}</div>
                <div style={{ marginTop: 2 }}>Last used {fmt(k.lastUsedAt)}</div>
              </div>

              {k.status === 'ACTIVE' && (
                <button
                  onClick={() => setRevoking(k.id)}
                  disabled={revokeMutation.isPending}
                  title="Revoke key"
                  style={{ background: 'none', border: '1px solid #1e2130', borderRadius: 6, cursor: 'pointer', color: '#475569', padding: '6px 8px', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, transition: 'all 0.15s', flexShrink: 0 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#f87171'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e2130'; e.currentTarget.style.color = '#475569'; }}
                >
                  <Trash2 size={13} /> Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirm revoke */}
      {revoking && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div style={{ background: '#13161f', border: '1px solid #1e2130', borderRadius: 16, padding: 32, maxWidth: 380, width: '100%' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Revoke API Key?</div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 24, lineHeight: 1.6 }}>
              This key will stop working immediately. Any applications using it will lose access. This cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setRevoking(null)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #1e2130', background: 'transparent', color: '#94a3b8', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={() => revokeMutation.mutate(revoking!)}
                disabled={revokeMutation.isPending}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                {revokeMutation.isPending ? 'Revoking…' : 'Revoke Key'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreate={(name) => createMutation.mutate(name)} />}
      {newKey && <SecretModal newKey={newKey} onClose={() => setNewKey(null)} />}
    </div>
  );
};