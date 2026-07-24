/** Human-readable formatting for settings audit rows. */

export type SettingsAuditRow = {
  id: string | number;
  key: string;
  before?: unknown;
  after?: unknown;
  ip?: string | null;
  actor?: { id?: string | number; name?: string; email?: string } | null;
  created_at?: string | null;
};

const KEY_LABELS: Record<string, string> = {
  'settings.mail': 'Email / SMTP',
  'settings.sms': 'SMS provider',
  'settings.simplybook': 'Simplybook',
  'operations.checklist_rules': 'Checklist rules',
  mail: 'Email / SMTP',
  sms: 'SMS provider',
  simplybook: 'Simplybook',
  notifications: 'Notification channels',
  company: 'Company profile',
  security: 'Security',
  operations: 'Operations',
  permissions: 'Roles & permissions',
};

export function humanizeAuditKey(key: string): { title: string; detail?: string } {
  if (!key) return { title: 'Unknown setting' };
  if (key.startsWith('email_templates.')) {
    const slug = key.replace('email_templates.', '').replace(/_/g, ' ');
    return { title: 'Email / SMS template', detail: slug.replace(/\b\w/g, c => c.toUpperCase()) };
  }
  if (KEY_LABELS[key]) return { title: KEY_LABELS[key] };
  const parts = key.split('.');
  if (parts.length > 1 && KEY_LABELS[parts[0]]) {
    return { title: KEY_LABELS[parts[0]], detail: parts.slice(1).join(' · ') };
  }
  return {
    title: key
      .replace(/[._]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase()),
  };
}

export function formatAuditWhen(iso?: string | null): { absolute: string; relative: string } {
  if (!iso) return { absolute: '—', relative: '' };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { absolute: iso, relative: '' };
  const absolute = d.toLocaleString('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const diffMs = Date.now() - d.getTime();
  const mins = Math.round(diffMs / 60000);
  let relative = '';
  if (mins < 1) relative = 'Just now';
  else if (mins < 60) relative = `${mins}m ago`;
  else if (mins < 60 * 24) relative = `${Math.round(mins / 60)}h ago`;
  else if (mins < 60 * 24 * 14) relative = `${Math.round(mins / (60 * 24))}d ago`;
  return { absolute, relative };
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function redact(value: unknown): unknown {
  if (!isPlainObject(value)) return value;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value)) {
    if (/password|api_key|api_secret|secret|token/i.test(k)) {
      out[k] = v ? '••••••••' : v;
    } else if (isPlainObject(v)) {
      out[k] = redact(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

export type AuditChange = { field: string; from: string; to: string };

export function diffAuditValues(before: unknown, after: unknown): AuditChange[] {
  const b = (redact(before) ?? {}) as Record<string, unknown>;
  const a = (redact(after) ?? {}) as Record<string, unknown>;
  if (!isPlainObject(b) && !isPlainObject(a)) {
    const from = formatScalar(before);
    const to = formatScalar(after);
    if (from === to) return [];
    return [{ field: 'value', from, to }];
  }
  const keys = new Set([...Object.keys(isPlainObject(b) ? b : {}), ...Object.keys(isPlainObject(a) ? a : {})]);
  const changes: AuditChange[] = [];
  for (const key of [...keys].sort()) {
    const from = formatScalar(isPlainObject(b) ? b[key] : undefined);
    const to = formatScalar(isPlainObject(a) ? a[key] : undefined);
    if (from !== to) changes.push({ field: key, from, to });
  }
  return changes;
}

function formatScalar(v: unknown): string {
  if (v == null || v === '') return '—';
  if (typeof v === 'boolean') return v ? 'On' : 'Off';
  if (typeof v === 'object') {
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
  const s = String(v);
  return s.length > 120 ? `${s.slice(0, 117)}…` : s;
}

export function summarizeChanges(changes: AuditChange[]): string {
  if (changes.length === 0) return 'No field changes recorded';
  if (changes.length === 1) {
    const c = changes[0];
    return `${c.field}: ${c.from} → ${c.to}`;
  }
  return `${changes.length} fields updated (${changes
    .slice(0, 3)
    .map(c => c.field)
    .join(', ')}${changes.length > 3 ? '…' : ''})`;
}

/** Mock settings audits when API returns empty. */
export const MOCK_SETTINGS_AUDITS: SettingsAuditRow[] = [
  {
    id: 'SA-001',
    key: 'email_templates.booking_confirmed',
    before: { subject: 'Booking confirmed', is_active: true },
    after: { subject: 'Your Carschek inspection is confirmed', is_active: true },
    ip: '102.89.45.12',
    actor: { id: 'USR-001', name: 'Promise Ndem', email: 'promise@carschek.com' },
    created_at: '2026-07-24T12:10:00.000Z',
  },
  {
    id: 'SA-002',
    key: 'settings.mail',
    before: { enabled: false, host: '', from_address: '' },
    after: { enabled: true, host: 'smtp.mailgun.org', from_address: 'noreply@carschek.com' },
    ip: '102.89.45.12',
    actor: { id: 'USR-001', name: 'Promise Ndem', email: 'promise@carschek.com' },
    created_at: '2026-07-22T09:30:00.000Z',
  },
  {
    id: 'SA-003',
    key: 'settings.sms',
    before: { enabled: false, provider: 'termii', sender_id: 'Carschek' },
    after: { enabled: true, provider: 'termii', sender_id: 'Carschek' },
    ip: '102.89.45.15',
    actor: { id: 'USR-002', name: 'Chukwuemeka Obi', email: 'operations@carschek.com' },
    created_at: '2026-07-20T16:45:00.000Z',
  },
  {
    id: 'SA-004',
    key: 'notifications',
    before: { report_ready: { email: true, sms: false } },
    after: { report_ready: { email: true, sms: true } },
    ip: '102.89.45.12',
    actor: { id: 'USR-001', name: 'Promise Ndem', email: 'promise@carschek.com' },
    created_at: '2026-07-18T11:00:00.000Z',
  },
  {
    id: 'SA-005',
    key: 'email_templates.login_otp',
    before: { text_body: 'Your code is {{code}}' },
    after: {
      text_body: 'Hi {{name}}, your Carschek code is {{code}}. Expires in {{ttl_minutes}} minutes.',
    },
    ip: '102.89.45.12',
    actor: { id: 'USR-001', name: 'Promise Ndem', email: 'promise@carschek.com' },
    created_at: '2026-07-15T08:20:00.000Z',
  },
  {
    id: 'SA-006',
    key: 'security',
    before: { sessionTimeout: 60, enforce2fa: { 'Super Admin': false } },
    after: { sessionTimeout: 30, enforce2fa: { 'Super Admin': true } },
    ip: '102.89.45.12',
    actor: { id: 'USR-001', name: 'Promise Ndem', email: 'promise@carschek.com' },
    created_at: '2026-07-10T14:05:00.000Z',
  },
];
