/** Canonical notification templates (matches Laravel EmailTemplateSeeder). */

export type NotificationTemplate = {
  slug: string;
  name: string;
  subject: string;
  description: string;
  variables: string[];
  html_body: string;
  text_body: string;
  is_active: boolean;
  /** Events that commonly send SMS using text_body */
  sms_enabled_default: boolean;
  updated_at: string;
};

export const EMAIL_TEMPLATES_CATALOG: NotificationTemplate[] = [
  {
    slug: 'login_otp',
    name: 'Login OTP',
    subject: 'Your Carschek login code',
    description: 'Sent when a user signs in with email OTP',
    variables: ['name', 'code', 'ttl_minutes'],
    html_body:
      '<p>Hi {{name}},</p><p>Your verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:4px;color:#ff5722">{{code}}</p><p>This code expires in {{ttl_minutes}} minutes.</p><p style="color:#6B7280;font-size:12px">If you did not request this, ignore this email.</p>',
    text_body: 'Hi {{name}}, your Carschek code is {{code}}. Expires in {{ttl_minutes}} minutes.',
    is_active: true,
    sms_enabled_default: false,
    updated_at: '2026-07-01T10:00:00.000Z',
  },
  {
    slug: 'password_reset',
    name: 'Password reset',
    subject: 'Reset your Carschek password',
    description: 'Password reset link for admin and inspector accounts',
    variables: ['name', 'reset_url'],
    html_body:
      '<p>Hi {{name}},</p><p>Reset your password using this secure link:</p><p><a href="{{reset_url}}" style="color:#ff5722;font-weight:600">Reset password</a></p><p style="color:#6B7280;font-size:12px">This link expires soon. If you did not request a reset, you can ignore this email.</p>',
    text_body: 'Reset your Carschek password: {{reset_url}}',
    is_active: true,
    sms_enabled_default: false,
    updated_at: '2026-07-01T10:00:00.000Z',
  },
  {
    slug: 'booking_confirmed',
    name: 'Booking confirmed',
    subject: 'Your Carschek inspection is confirmed',
    description: 'Customer confirmation after an appointment is confirmed',
    variables: ['customer_name', 'booking_id', 'slot', 'location'],
    html_body:
      '<p>Hi {{customer_name}},</p><p>Your inspection booking <strong>{{booking_id}}</strong> is confirmed.</p><p><strong>When:</strong> {{slot}}<br/><strong>Where:</strong> {{location}}</p><p>We will notify you when an inspector is assigned.</p>',
    text_body: 'Carschek: Booking {{booking_id}} confirmed for {{slot}} at {{location}}. See you soon!',
    is_active: true,
    sms_enabled_default: true,
    updated_at: '2026-07-01T10:00:00.000Z',
  },
  {
    slug: 'inspection_assigned',
    name: 'Inspection assigned',
    subject: 'Inspector assigned to your booking',
    description: 'When an inspector is assigned to a booking/order',
    variables: ['customer_name', 'inspector_name', 'booking_id'],
    html_body:
      '<p>Hi {{customer_name}},</p><p><strong>{{inspector_name}}</strong> has been assigned to booking <strong>{{booking_id}}</strong>.</p><p>They may contact you shortly to confirm access and location details.</p>',
    text_body: 'Carschek: {{inspector_name}} assigned to booking {{booking_id}}.',
    is_active: true,
    sms_enabled_default: true,
    updated_at: '2026-07-01T10:00:00.000Z',
  },
  {
    slug: 'report_ready',
    name: 'Report ready',
    subject: 'Your Carschek report {{report_id}} is ready',
    description: 'After QA publishes an inspection report',
    variables: ['customer_name', 'report_id', 'score', 'report_url'],
    html_body:
      '<p>Hi {{customer_name}},</p><p>Your inspection report <strong>{{report_id}}</strong> is ready.</p><p style="font-size:20px;font-weight:700">Carschek score: {{score}}</p><p><a href="{{report_url}}" style="display:inline-block;background:#ff5722;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:600">View report</a></p>',
    text_body: 'Carschek: Report {{report_id}} ready. Score {{score}}. {{report_url}}',
    is_active: true,
    sms_enabled_default: true,
    updated_at: '2026-07-01T10:00:00.000Z',
  },
];

export function sampleVariablesFor(template: Pick<NotificationTemplate, 'variables'>): Record<string, string> {
  const samples: Record<string, string> = {
    name: 'Adaeze Madu',
    customer_name: 'Adaeze Madu',
    code: '482901',
    ttl_minutes: '10',
    reset_url: 'https://carschek.vercel.app/auth/reset-password?token=demo',
    booking_id: 'NIXQD3OMHFWO',
    slot: 'Thu 24 Jul · 2:30 PM',
    location: 'Jara Mall, Ikeja, Lagos',
    inspector_name: 'Emeka Okonkwo',
    report_id: 'RPT-445',
    score: '72',
    report_url: 'https://carschek.vercel.app/reports/RPT-445',
  };
  const out: Record<string, string> = {};
  for (const key of template.variables) {
    out[key] = samples[key] ?? `{{${key}}}`;
  }
  return out;
}

export function mergeTemplateVars(body: string, vars: Record<string, string>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key: string) => (vars[key] != null ? String(vars[key]) : `{{${key}}}`));
}

const STORAGE_KEY = 'carschek-notification-templates';

function cloneCatalog(): NotificationTemplate[] {
  return EMAIL_TEMPLATES_CATALOG.map(t => ({ ...t, variables: [...t.variables] }));
}

/** Session-local template store (mock + empty-API fallback). */
export function loadLocalTemplates(): NotificationTemplate[] {
  if (typeof window === 'undefined') return cloneCatalog();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneCatalog();
    const parsed = JSON.parse(raw) as NotificationTemplate[];
    if (!Array.isArray(parsed) || parsed.length === 0) return cloneCatalog();
    // Merge catalog so new slugs appear after deploys
    const bySlug = new Map(parsed.map(t => [t.slug, t]));
    return cloneCatalog().map(base => ({ ...base, ...bySlug.get(base.slug), variables: bySlug.get(base.slug)?.variables ?? base.variables }));
  } catch {
    return cloneCatalog();
  }
}

export function saveLocalTemplate(
  slug: string,
  patch: Partial<Pick<NotificationTemplate, 'subject' | 'html_body' | 'text_body' | 'is_active' | 'name' | 'description'>>
): NotificationTemplate {
  const all = loadLocalTemplates();
  const idx = all.findIndex(t => t.slug === slug);
  if (idx < 0) throw new Error(`Unknown template ${slug}`);
  const next = {
    ...all[idx],
    ...patch,
    updated_at: new Date().toISOString(),
  };
  all[idx] = next;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }
  return next;
}

export function listTemplateSummaries(templates: NotificationTemplate[] = loadLocalTemplates()) {
  return templates.map(t => ({
    slug: t.slug,
    name: t.name,
    subject: t.subject,
    description: t.description,
    variables: t.variables,
    is_active: t.is_active,
    sms_enabled_default: t.sms_enabled_default,
    updated_at: t.updated_at,
  }));
}
