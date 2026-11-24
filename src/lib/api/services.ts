/**
 * Typed resource facades — feature modules should import from here instead of raw mock arrays.
 * Set NEXT_PUBLIC_USE_API_MOCK=false and NEXT_PUBLIC_API_BASE_URL for Laravel.
 *
 * Laravel returns bare arrays/objects and maps public_id → `id`. Thin adapters live here
 * so pages keep their existing field expectations.
 */
import { ApiError, apiClient, apiRequest, clearAccessToken, USE_API_MOCK } from '@/lib/api/client';
import {
  CARS,
  CUSTOMERS,
  ORDERS,
  REPORTS,
  DEALS,
  LISTINGS,
  INSPECTORS,
  AUCTIONS,
  BRANDS,
  MODELS,
  YEARS,
  CRM_CONTACTS,
  OFFERS,
  NOTIFICATIONS,
  ACTIVITY_LOG,
  FINANCE_SUMMARY,
  USERS,
} from '@/lib/mockData';
import type { Appointment } from '@/lib/appointments/types';
import { APPOINTMENTS_SEED } from '@/lib/appointments/seed';
import {
  listTemplateSummaries,
  loadLocalTemplates,
  mergeTemplateVars,
  sampleVariablesFor,
  saveLocalTemplate,
} from '@/lib/settings/templatesCatalog';
import { MOCK_SETTINGS_AUDITS } from '@/lib/settings/auditFormat';

async function mockData<T>(data: T, delayMs = 0): Promise<T> {
  if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs));
  return data;
}

/** Same-origin Next mock routes (mutable in-memory store) while USE_API_MOCK=true. */
async function nextJson<T>(input: string, init?: RequestInit): Promise<T> {
  const r = await fetch(input, { cache: 'no-store', ...init });
  const j = (await r.json().catch(() => ({}))) as T & { error?: string; message?: string };
  if (!r.ok) {
    throw new Error(
      (typeof j === 'object' && j && ('error' in j || 'message' in j)
        ? String((j as { error?: string; message?: string }).error || (j as { message?: string }).message)
        : null) || `Request failed (${r.status})`
    );
  }
  return j;
}

export type AuthUser = {
  id: number | string;
  public_id?: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  phone?: string | null;
  status?: string;
  last_login_at?: string | null;
};

const DEMO_AUTH = [
  { role: 'super-admin', email: 'promise@carschek.com', password: 'Carschek@2026', name: 'Promise Ndem', public_id: 'USR-001' },
  { role: 'ops-manager', email: 'operations@carschek.com', password: 'OpsManager@2026', name: 'Chukwuemeka Obi', public_id: 'USR-002' },
  { role: 'inspector', email: 'emeka.inspector@carschek.com', password: 'Inspector@2026', name: 'Emeka Okonkwo', public_id: 'USR-003' },
  { role: 'finance', email: 'finance@carschek.com', password: 'Finance@2026', name: 'Amaka Finance', public_id: 'USR-004' },
  { role: 'support', email: 'support@carschek.com', password: 'Support@2026', name: 'Kola Support', public_id: 'USR-005' },
] as const;

// ── Auth ────────────────────────────────────────────────────────────────────

export type LoginOtpResponse = {
  requires_otp?: true;
  otp_token: string;
  otp_sent?: boolean;
  otp_email_failed?: boolean;
  otp_sent_via?: 'email';
  otp_destination?: string;
  expires_in_seconds?: number;
  token?: string;
  user?: AuthUser;
};

export type LoginSessionResponse = {
  requires_otp?: false;
  otp_skipped?: boolean;
  otp_sent?: boolean;
  otp_email_failed?: boolean;
  message?: string;
  token: string;
  user: AuthUser;
};

export type LoginResponse = LoginOtpResponse | LoginSessionResponse;

export type ResendOtpResponse = {
  message?: string;
  otp_token?: string;
  otp_sent?: boolean;
  otp_email_failed?: boolean;
  otp_sent_via?: 'email';
  otp_destination?: string;
  expires_in_seconds?: number;
  retry_after_seconds?: number;
  token?: string;
  user?: AuthUser;
};

export type LoginOptions = {
  /** Ask the API to skip email OTP (used when mail delivery already failed). */
  skipOtp?: boolean;
};

function maskEmailLocal(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***';
  return `${local[0]}***@${domain}`;
}

function mockUserFromDemo(match: (typeof DEMO_AUTH)[number]): AuthUser {
  return {
    id: match.public_id,
    public_id: match.public_id,
    name: match.name,
    email: match.email,
    role: match.role,
    avatar: match.name
      .split(' ')
      .map(p => p[0])
      .join('')
      .slice(0, 2),
    status: 'Active',
  };
}

function unwrapAuthPayload(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const nested = obj.data;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const inner = nested as Record<string, unknown>;
    if ('token' in inner || 'otp_token' in inner || 'user' in inner || 'requires_otp' in inner) {
      return inner;
    }
  }
  return obj;
}

export function asLoginSession(raw: unknown): LoginSessionResponse | null {
  const obj = unwrapAuthPayload(raw);
  if (!obj) return null;
  const token =
    (typeof obj.token === 'string' && obj.token) ||
    (typeof obj.access_token === 'string' && obj.access_token) ||
    (typeof obj.accessToken === 'string' && obj.accessToken) ||
    (typeof obj.plainTextToken === 'string' && obj.plainTextToken) ||
    '';
  const user = obj.user;
  if (!token || !user || typeof user !== 'object') return null;
  return {
    ...(obj as LoginSessionResponse),
    token,
    user: user as AuthUser,
  };
}

export function otpEmailFailed(raw: unknown): boolean {
  const obj = unwrapAuthPayload(raw);
  if (!obj) return false;
  if (obj.otp_email_failed === true || obj.otp_sent === false || obj.otp_skipped === true) return true;
  const message = typeof obj.message === 'string' ? obj.message : '';
  return isOtpMailFailureMessage(message);
}

function isOtpMailFailureMessage(message: string): boolean {
  return /verification email|could not send|smtp|mailer|unable to send|starttls|certificate|unable to connect/i.test(
    message
  );
}

export function isOtpMailFailure(err: unknown): boolean {
  if (err instanceof ApiError && otpEmailFailed(err.data)) return true;
  const message = err instanceof Error ? err.message : String(err);
  return isOtpMailFailureMessage(message);
}

export function shouldPromptOtp(res: LoginResponse): boolean {
  if (otpEmailFailed(res)) return false;
  if (res.requires_otp === false) return false;
  if (asLoginSession(res) && res.requires_otp !== true) return false;
  return typeof (res as LoginOtpResponse).otp_token === 'string' && Boolean((res as LoginOtpResponse).otp_token);
}

export const authApi = {
  login: async (email: string, password: string, options?: LoginOptions): Promise<LoginResponse> => {
    if (USE_API_MOCK) {
      await mockData(null, 400);
      const match = DEMO_AUTH.find(a => a.email === email && a.password === password);
      if (!match) throw new Error('Invalid credentials.');
      if (options?.skipOtp) {
        return {
          requires_otp: false,
          otp_skipped: true,
          otp_email_failed: true,
          token: `mock-token-${match.public_id}`,
          user: mockUserFromDemo(match),
        } satisfies LoginSessionResponse;
      }
      return {
        requires_otp: true as const,
        otp_token: `mock-otp:${match.email}`,
        otp_sent: true,
        otp_sent_via: 'email' as const,
        otp_destination: maskEmailLocal(match.email),
        expires_in_seconds: 600,
      } satisfies LoginOtpResponse;
    }
    const raw = await apiRequest<unknown>({
      method: 'POST',
      url: '/auth/login',
      data: {
        email,
        password,
        skip_otp: Boolean(options?.skipOtp),
        skip_otp_if_mail_fails: true,
      },
    });
    return (unwrapAuthPayload(raw) ?? raw) as LoginResponse;
  },

  resendOtp: async (otp_token: string) => {
    if (USE_API_MOCK) {
      await mockData(null, 400);
      const email = otp_token.replace(/^mock-otp:/, '');
      return {
        message: 'A new verification code has been sent.',
        otp_token,
        otp_sent_via: 'email' as const,
        otp_destination: maskEmailLocal(email || 'user@carschek.com'),
        expires_in_seconds: 600,
        retry_after_seconds: 60,
      } satisfies ResendOtpResponse;
    }
    const raw = await apiRequest<unknown>({
      method: 'POST',
      url: '/auth/resend-otp',
      data: { otp_token },
    });
    return (unwrapAuthPayload(raw) ?? raw) as ResendOtpResponse;
  },

  verifyOtp: async (otp_token: string, code: string) => {
    if (USE_API_MOCK) {
      await mockData(null, 300);
      if (!/^\d{6}$/.test(code)) throw new Error('The verification code is incorrect.');
      const email = otp_token.replace(/^mock-otp:/, '');
      const match = DEMO_AUTH.find(a => a.email === email) ?? DEMO_AUTH[0];
      return {
        token: `mock-token-${match.public_id}`,
        user: mockUserFromDemo(match),
      };
    }
    const raw = await apiRequest<unknown>({
      method: 'POST',
      url: '/auth/verify-otp',
      data: { otp_token, code },
    });
    const payload = (unwrapAuthPayload(raw) ?? raw) as { token: string; user: AuthUser };
    if (!payload?.token || !payload?.user) {
      throw new Error('Verification did not return a session.');
    }
    return payload;
  },

  logout: async () => {
    if (USE_API_MOCK) {
      clearAccessToken();
      return { message: 'Logged out.' };
    }
    try {
      return await apiRequest<{ message: string }>({ method: 'POST', url: '/auth/logout' });
    } finally {
      clearAccessToken();
    }
  },

  me: () =>
    USE_API_MOCK
      ? mockData({
          user: {
            id: 'USR-001',
            public_id: 'USR-001',
            name: 'Promise Ndem',
            email: 'promise@carschek.com',
            role: 'super-admin',
            status: 'Active',
          } satisfies AuthUser,
        })
      : apiRequest<{ user: AuthUser }>({ method: 'GET', url: '/auth/me' }),

  forgotPassword: (email: string) =>
    USE_API_MOCK
      ? mockData({ message: 'If an account exists for that email, a password reset link has been sent.' }, 500)
      : apiRequest<{ message: string }>({ method: 'POST', url: '/auth/forgot-password', data: { email } }),

  resetPassword: (payload: { email: string; token: string; password: string }) =>
    USE_API_MOCK
      ? mockData({ message: 'Your password has been reset. You can now log in.' }, 500)
      : apiRequest<{ message: string }>({ method: 'POST', url: '/auth/reset-password', data: payload }),
};

// ── Cars ────────────────────────────────────────────────────────────────────

export const carsApi = {
  list: () => (USE_API_MOCK ? mockData([...CARS]) : apiRequest<typeof CARS>({ method: 'GET', url: '/cars' })),
  get: (id: string) =>
    USE_API_MOCK
      ? mockData(CARS.find(c => c.id === id) ?? CARS[0])
      : apiRequest<(typeof CARS)[0]>({ method: 'GET', url: `/cars/${id}`, params: { detail: 1 } }),
  create: (data: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ ...CARS[0], ...data, id: `CK-${Date.now()}` } as (typeof CARS)[0], 400)
      : apiRequest<(typeof CARS)[0]>({ method: 'POST', url: '/cars', data }),
  update: (id: string, data: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ ...(CARS.find(c => c.id === id) ?? CARS[0]), ...data } as (typeof CARS)[0], 300)
      : apiRequest<(typeof CARS)[0]>({ method: 'PATCH', url: `/cars/${id}`, data }),
  remove: (id: string) =>
    USE_API_MOCK
      ? mockData({ ok: true, id }, 200)
      : apiRequest<{ message?: string }>({ method: 'DELETE', url: `/cars/${id}` }),
  updateStatus: async (id: string, status: string) => {
    if (USE_API_MOCK) {
      return nextJson<{ ok: boolean; carId: string; status: string | null }>(
        `/api/cars/${encodeURIComponent(id)}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        }
      );
    }
    return apiRequest<unknown>({ method: 'PATCH', url: `/cars/${id}/status`, data: { status } });
  },
  uploadDocument: (id: string, key: string, formData: FormData) =>
    USE_API_MOCK
      ? mockData({ ok: true, key }, 400)
      : apiRequest<unknown>({
          method: 'POST',
          url: `/cars/${id}/documents/${encodeURIComponent(key)}`,
          data: formData,
          headers: { 'Content-Type': 'multipart/form-data' },
        }),
  approveDocument: (id: string, key: string) =>
    USE_API_MOCK
      ? mockData({ ok: true, key }, 200)
      : apiRequest<unknown>({ method: 'POST', url: `/cars/${id}/documents/${encodeURIComponent(key)}/approve` }),
  rejectDocument: (id: string, key: string, reason?: string) =>
    USE_API_MOCK
      ? mockData({ ok: true, key }, 200)
      : apiRequest<unknown>({
          method: 'POST',
          url: `/cars/${id}/documents/${encodeURIComponent(key)}/reject`,
          data: { reason },
        }),
};

// ── Orders ──────────────────────────────────────────────────────────────────

export const ordersApi = {
  list: () => (USE_API_MOCK ? mockData([...ORDERS]) : apiRequest<typeof ORDERS>({ method: 'GET', url: '/orders' })),
  get: (id: string) =>
    USE_API_MOCK
      ? mockData(ORDERS.find(o => o.id === id) ?? ORDERS[0])
      : apiRequest<(typeof ORDERS)[0]>({ method: 'GET', url: `/orders/${id}` }),
  create: (data: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ ...ORDERS[0], ...data, id: `ORD-${Date.now()}` } as (typeof ORDERS)[0], 300)
      : apiRequest<(typeof ORDERS)[0]>({ method: 'POST', url: '/orders', data }),
  update: (id: string, data: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ ...(ORDERS.find(o => o.id === id) ?? ORDERS[0]), ...data } as (typeof ORDERS)[0], 300)
      : apiRequest<(typeof ORDERS)[0]>({ method: 'PATCH', url: `/orders/${id}`, data }),
  assign: (id: string, inspectorId: string) =>
    USE_API_MOCK
      ? mockData({ ok: true, id, inspectorId }, 300)
      : apiRequest<unknown>({ method: 'POST', url: `/orders/${id}/assign`, data: { inspectorId } }),
  updateStatus: (id: string, status: string) =>
    USE_API_MOCK
      ? mockData({ ok: true, id, status }, 300)
      : apiRequest<unknown>({ method: 'PATCH', url: `/orders/${id}/status`, data: { status } }),
};

// ── Customers / CRM ─────────────────────────────────────────────────────────

export const customersApi = {
  list: () =>
    USE_API_MOCK ? mockData([...CUSTOMERS]) : apiRequest<typeof CUSTOMERS>({ method: 'GET', url: '/customers' }),
  get: (id: string) =>
    USE_API_MOCK
      ? mockData(CUSTOMERS.find(c => c.id === id) ?? CUSTOMERS[0])
      : apiRequest<(typeof CUSTOMERS)[0]>({ method: 'GET', url: `/customers/${id}` }),
  create: (data: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ ...CUSTOMERS[0], ...data, id: `CUS-${Date.now()}` } as (typeof CUSTOMERS)[0], 300)
      : apiRequest<(typeof CUSTOMERS)[0]>({ method: 'POST', url: '/customers', data }),
  update: (id: string, data: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ ...(CUSTOMERS.find(c => c.id === id) ?? CUSTOMERS[0]), ...data } as (typeof CUSTOMERS)[0], 300)
      : apiRequest<(typeof CUSTOMERS)[0]>({ method: 'PATCH', url: `/customers/${id}`, data }),
  remove: (id: string) =>
    USE_API_MOCK
      ? mockData({ ok: true, id }, 200)
      : apiRequest<unknown>({ method: 'DELETE', url: `/customers/${id}` }),
};

export const crmApi = {
  list: () =>
    USE_API_MOCK
      ? mockData([...CRM_CONTACTS])
      : apiRequest<typeof CRM_CONTACTS>({ method: 'GET', url: '/crm/contacts' }),
  get: (id: string) =>
    USE_API_MOCK
      ? mockData(CRM_CONTACTS.find(c => c.id === id) ?? CRM_CONTACTS[0])
      : apiRequest<(typeof CRM_CONTACTS)[0]>({ method: 'GET', url: `/crm/contacts/${id}` }),
  create: (data: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ ...CRM_CONTACTS[0], ...data, id: `CRM-${Date.now()}` } as (typeof CRM_CONTACTS)[0], 300)
      : apiRequest<(typeof CRM_CONTACTS)[0]>({ method: 'POST', url: '/crm/contacts', data }),
  update: (id: string, data: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData(
          { ...(CRM_CONTACTS.find(c => c.id === id) ?? CRM_CONTACTS[0]), ...data } as (typeof CRM_CONTACTS)[0],
          300
        )
      : apiRequest<(typeof CRM_CONTACTS)[0]>({ method: 'PATCH', url: `/crm/contacts/${id}`, data }),
  remove: (id: string) =>
    USE_API_MOCK
      ? mockData({ ok: true, id }, 200)
      : apiRequest<unknown>({ method: 'DELETE', url: `/crm/contacts/${id}` }),
  updateStage: (id: string, stage: string) =>
    USE_API_MOCK
      ? mockData({ ok: true, id, stage }, 200)
      : apiRequest<unknown>({ method: 'PATCH', url: `/crm/contacts/${id}/stage`, data: { stage } }),
  addNote: (id: string, body: { body: string } | Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ id: `note-${Date.now()}`, ...body }, 200)
      : apiRequest<unknown>({ method: 'POST', url: `/crm/contacts/${id}/notes`, data: body }),
  addCommunication: (id: string, body: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ id: `comm-${Date.now()}`, ...body }, 200)
      : apiRequest<unknown>({ method: 'POST', url: `/crm/contacts/${id}/communications`, data: body }),
};

// ── Reports / inspections ───────────────────────────────────────────────────

export type ReportDetail = (typeof REPORTS)[number] & {
  payload?: Record<string, unknown> | null;
  inspectionId?: string | null;
};

export const reportsApi = {
  list: async () => {
    if (!USE_API_MOCK) return apiRequest<typeof REPORTS>({ method: 'GET', url: '/reports' });
    const { getCarschekEmail, getCarschekRole } = await import('@/lib/auth/session');
    if (getCarschekRole() === 'customer') {
      const { reportsForLocalUser, searchLocalPortalUsers } = await import('@/lib/reports/assignmentStore');
      const email = getCarschekEmail()?.trim().toLowerCase();
      const user = searchLocalPortalUsers('').find(u => u.email.toLowerCase() === email);
      const ids = new Set(user ? reportsForLocalUser(user.id) : []);
      return mockData(REPORTS.filter(r => ids.has(r.id)));
    }
    return mockData([...REPORTS]);
  },
  get: (id: string): Promise<ReportDetail> => {
    if (USE_API_MOCK) {
      const base = REPORTS.find(r => r.id === id) ?? REPORTS[0];
      return mockData({ ...base, payload: null as Record<string, unknown> | null, inspectionId: null as string | null });
    }
    return apiRequest<ReportDetail>({ method: 'GET', url: `/reports/${id}` });
  },
  versions: (id: string) =>
    USE_API_MOCK
      ? mockData(
          id === 'RPT-445'
            ? [
                {
                  id: '1',
                  version: 1,
                  kind: 'Original',
                  author: 'Emeka Okonkwo',
                  score: 70,
                  defects: 5,
                  criticalDefects: 1,
                  createdAt: '2026-04-15T10:42:00',
                  snapshot: {
                    lines: [
                      { id: 'L1', text: 'Engine mounts: minor vibration noted' },
                      { id: 'L2', text: 'Rear bumper: crack on right side' },
                      { id: 'L3', text: 'Dashboard warning lights: check engine on' },
                    ],
                  },
                },
                {
                  id: '2',
                  version: 2,
                  kind: 'QA Edited',
                  author: 'Promise Ndem',
                  score: 72,
                  defects: 4,
                  criticalDefects: 1,
                  summary: 'corrected engine section',
                  createdAt: '2026-04-16T09:15:00',
                  snapshot: {
                    lines: [
                      { id: 'L1', text: 'Engine mounts: pass after re-test' },
                      { id: 'L2', text: 'Rear bumper: crack on right side' },
                      { id: 'L3', text: 'Dashboard warning lights: check engine on' },
                    ],
                  },
                },
                {
                  id: '3',
                  version: 3,
                  kind: 'Approved',
                  author: 'Chukwuemeka Obi',
                  score: 72,
                  defects: 4,
                  criticalDefects: 1,
                  createdAt: '2026-04-16T11:30:00',
                  snapshot: {
                    lines: [
                      { id: 'L1', text: 'Engine mounts: pass after re-test' },
                      { id: 'L2', text: 'Rear bumper: crack on right side' },
                      { id: 'L3', text: 'Dashboard warning lights: check engine on' },
                    ],
                  },
                },
              ]
            : [
                {
                  id: '1',
                  version: REPORTS.find(r => r.id === id)?.version ?? 1,
                  kind: 'Original',
                  author: REPORTS.find(r => r.id === id)?.inspectorName ?? 'Inspector',
                  score: REPORTS.find(r => r.id === id)?.score ?? 0,
                  defects: REPORTS.find(r => r.id === id)?.defects ?? 0,
                  criticalDefects: REPORTS.find(r => r.id === id)?.criticalDefects ?? 0,
                  createdAt: REPORTS.find(r => r.id === id)?.submittedAt ?? new Date().toISOString(),
                },
              ]
        )
      : apiRequest<unknown[]>({ method: 'GET', url: `/reports/${id}/versions` }),
  qaApprove: (id: string, data?: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ ok: true, id }, 300)
      : apiRequest<unknown>({ method: 'POST', url: `/reports/${id}/qa-approve`, data }),
  qaReject: (id: string, data?: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ ok: true, id }, 300)
      : apiRequest<unknown>({ method: 'POST', url: `/reports/${id}/qa-reject`, data }),
  flagInspection: async (id: string, data: Record<string, unknown>) => {
    if (USE_API_MOCK) {
      return nextJson<unknown>(`/api/inspections/${encodeURIComponent(id)}/flag`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    }
    return apiRequest<unknown>({ method: 'PATCH', url: `/inspections/${id}/flag`, data });
  },
  searchPortalUsers: async (q: string) => {
    if (USE_API_MOCK) {
      const { searchLocalPortalUsers } = await import('@/lib/reports/assignmentStore');
      return mockData(searchLocalPortalUsers(q));
    }
    const res = await apiRequest<{ data: Array<Record<string, unknown>> }>({
      method: 'GET',
      url: '/portal-users',
      params: { q },
    });
    return res.data ?? [];
  },
  createPortalUser: async (data: Record<string, unknown>) => {
    if (USE_API_MOCK) {
      const { createLocalPortalUser } = await import('@/lib/reports/assignmentStore');
      const user = createLocalPortalUser({
        name: String(data.name ?? ''),
        email: String(data.email ?? ''),
        phone: data.phone ? String(data.phone) : null,
        isDealer: Boolean(data.isDealer),
      });
      return mockData({ user, temporaryPassword: 'Portal@2026' }, 200);
    }
    return apiRequest<{ user: Record<string, unknown>; temporaryPassword?: string | null }>({
      method: 'POST',
      url: '/portal-users',
      data,
    });
  },
  assignees: async (reportId: string) => {
    if (USE_API_MOCK) {
      const { listLocalAssignees } = await import('@/lib/reports/assignmentStore');
      return mockData(listLocalAssignees(reportId).map(r => ({ user: r.user, assignedAt: r.assignedAt })));
    }
    const res = await apiRequest<{ data: Array<{ user: Record<string, unknown>; assignedAt?: string }> }>({
      method: 'GET',
      url: `/reports/${reportId}/assignees`,
    });
    return res.data ?? [];
  },
  assignUser: async (reportId: string, data: Record<string, unknown>) => {
    if (USE_API_MOCK) {
      const store = await import('@/lib/reports/assignmentStore');
      let user = data.userId
        ? store.searchLocalPortalUsers('').find(u => u.id === data.userId)
        : undefined;
      if (!user && data.email) {
        user = store.createLocalPortalUser({
          name: String(data.name ?? data.email),
          email: String(data.email),
          phone: data.phone ? String(data.phone) : null,
          isDealer: Boolean(data.isDealer),
        });
      }
      if (!user) throw new Error('User not found');
      store.assignLocal(reportId, user);
      return mockData({ user, temporaryPassword: data.userId ? null : 'Portal@2026', inspectionStatus: 'shared' }, 200);
    }
    return apiRequest<Record<string, unknown>>({
      method: 'POST',
      url: `/reports/${reportId}/assignees`,
      data,
    });
  },
  unassignUser: async (reportId: string, userId: string) => {
    if (USE_API_MOCK) {
      const { unassignLocal } = await import('@/lib/reports/assignmentStore');
      unassignLocal(reportId, userId);
      return mockData({ ok: true }, 150);
    }
    return apiRequest<unknown>({ method: 'DELETE', url: `/reports/${reportId}/assignees/${userId}` });
  },
};

// ── Commerce ────────────────────────────────────────────────────────────────

export const offersApi = {
  list: () => (USE_API_MOCK ? mockData([...OFFERS]) : apiRequest<typeof OFFERS>({ method: 'GET', url: '/offers' })),
  get: (id: string) =>
    USE_API_MOCK
      ? mockData(OFFERS.find(o => o.id === id) ?? OFFERS[0])
      : apiRequest<(typeof OFFERS)[0]>({ method: 'GET', url: `/offers/${id}` }),
  create: (data: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ ...OFFERS[0], ...data, id: `OFR-${Date.now()}` } as (typeof OFFERS)[0], 300)
      : apiRequest<(typeof OFFERS)[0]>({ method: 'POST', url: '/offers', data }),
  update: (id: string, data: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ ...(OFFERS.find(o => o.id === id) ?? OFFERS[0]), ...data } as (typeof OFFERS)[0], 300)
      : apiRequest<(typeof OFFERS)[0]>({ method: 'PATCH', url: `/offers/${id}`, data }),
  remove: (id: string) =>
    USE_API_MOCK
      ? mockData({ ok: true, id }, 200)
      : apiRequest<unknown>({ method: 'DELETE', url: `/offers/${id}` }),
  send: (id: string, channels?: string[]) =>
    USE_API_MOCK
      ? mockData({ ok: true, id, channels }, 400)
      : apiRequest<unknown>({ method: 'POST', url: `/offers/${id}/send`, data: { channels } }),
};

export const dealsApi = {
  list: () => (USE_API_MOCK ? mockData([...DEALS]) : apiRequest<typeof DEALS>({ method: 'GET', url: '/deals' })),
  get: (id: string) =>
    USE_API_MOCK
      ? mockData(DEALS.find(d => d.id === id) ?? DEALS[0])
      : apiRequest<(typeof DEALS)[0]>({ method: 'GET', url: `/deals/${id}` }),
  create: (data: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ ...DEALS[0], ...data, id: `DEAL-${Date.now()}` } as (typeof DEALS)[0], 300)
      : apiRequest<(typeof DEALS)[0]>({ method: 'POST', url: '/deals', data }),
  update: (id: string, data: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ ...(DEALS.find(d => d.id === id) ?? DEALS[0]), ...data } as (typeof DEALS)[0], 300)
      : apiRequest<(typeof DEALS)[0]>({ method: 'PATCH', url: `/deals/${id}`, data }),
  remove: (id: string) =>
    USE_API_MOCK
      ? mockData({ ok: true, id }, 200)
      : apiRequest<unknown>({ method: 'DELETE', url: `/deals/${id}` }),
};

export const listingsApi = {
  list: () =>
    USE_API_MOCK ? mockData([...LISTINGS]) : apiRequest<typeof LISTINGS>({ method: 'GET', url: '/listings' }),
  get: (id: string) =>
    USE_API_MOCK
      ? mockData(LISTINGS.find(l => l.id === id) ?? LISTINGS[0])
      : apiRequest<(typeof LISTINGS)[0]>({ method: 'GET', url: `/listings/${id}` }),
  create: (data: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ ...LISTINGS[0], ...data, id: `LST-${Date.now()}` } as (typeof LISTINGS)[0], 300)
      : apiRequest<(typeof LISTINGS)[0]>({ method: 'POST', url: '/listings', data }),
  update: (id: string, data: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ ...(LISTINGS.find(l => l.id === id) ?? LISTINGS[0]), ...data } as (typeof LISTINGS)[0], 300)
      : apiRequest<(typeof LISTINGS)[0]>({ method: 'PATCH', url: `/listings/${id}`, data }),
  remove: (id: string) =>
    USE_API_MOCK
      ? mockData({ ok: true, id }, 200)
      : apiRequest<unknown>({ method: 'DELETE', url: `/listings/${id}` }),
  updateVisibility: (id: string, visibility: string, featured?: boolean) =>
    USE_API_MOCK
      ? mockData({ ok: true, id, visibility, featured }, 200)
      : apiRequest<unknown>({
          method: 'PATCH',
          url: `/listings/${id}/visibility`,
          data: { visibility, featured },
        }),
};

export const auctionsApi = {
  list: () =>
    USE_API_MOCK ? mockData([...AUCTIONS]) : apiRequest<typeof AUCTIONS>({ method: 'GET', url: '/auctions' }),
  get: (id: string) =>
    USE_API_MOCK
      ? mockData(AUCTIONS.find(a => a.id === id) ?? AUCTIONS[0])
      : apiRequest<(typeof AUCTIONS)[0]>({ method: 'GET', url: `/auctions/${id}` }),
  create: (data: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ ...AUCTIONS[0], ...data, id: `AUC-${Date.now()}` } as (typeof AUCTIONS)[0], 300)
      : apiRequest<(typeof AUCTIONS)[0]>({ method: 'POST', url: '/auctions', data }),
  update: (id: string, data: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ ...(AUCTIONS.find(a => a.id === id) ?? AUCTIONS[0]), ...data } as (typeof AUCTIONS)[0], 300)
      : apiRequest<(typeof AUCTIONS)[0]>({ method: 'PATCH', url: `/auctions/${id}`, data }),
  remove: (id: string) =>
    USE_API_MOCK
      ? mockData({ ok: true, id }, 200)
      : apiRequest<unknown>({ method: 'DELETE', url: `/auctions/${id}` }),
  placeBid: (id: string, amount: number, bidder = 'Platform bidder') =>
    USE_API_MOCK
      ? mockData({ ok: true, id, amount, bidder }, 300)
      : apiRequest<unknown>({ method: 'POST', url: `/auctions/${id}/bids`, data: { amount, bidder } }),
  extend: (id: string, hours = 24) =>
    USE_API_MOCK
      ? mockData({ ok: true, id }, 200)
      : apiRequest<unknown>({ method: 'POST', url: `/auctions/${id}/extend`, data: { hours } }),
  end: (id: string) =>
    USE_API_MOCK
      ? mockData({ ok: true, id }, 200)
      : apiRequest<unknown>({ method: 'POST', url: `/auctions/${id}/end` }),
};

// ── Inspectors ──────────────────────────────────────────────────────────────

export type InspectorRow = (typeof INSPECTORS)[0] & {
  userId?: string | null;
  accountStatus?: string;
  temporaryPassword?: string;
};

export const inspectorsApi = {
  list: () =>
    USE_API_MOCK
      ? mockData(
          INSPECTORS.map(i => ({
            ...i,
            userId: i.id === 'INS-001' ? 'USR-003' : null,
            accountStatus: 'Active',
          })) as InspectorRow[]
        )
      : apiRequest<InspectorRow[]>({ method: 'GET', url: '/inspectors' }),
  get: (id: string) =>
    USE_API_MOCK
      ? mockData({
          ...(INSPECTORS.find(i => i.id === id) ?? INSPECTORS[0]),
          userId: id === 'INS-001' ? 'USR-003' : null,
          accountStatus: 'Active',
        } as InspectorRow)
      : apiRequest<InspectorRow>({ method: 'GET', url: `/inspectors/${id}` }),
  jobs: (id: string) =>
    USE_API_MOCK
      ? mockData([...ORDERS].filter(o => (o as { inspectorId?: string }).inspectorId === id).slice(0, 5))
      : apiRequest<unknown[]>({ method: 'GET', url: `/inspectors/${id}/jobs` }),
  create: (data: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData(
          {
            ...INSPECTORS[0],
            ...data,
            id: `INS-${Date.now()}`,
            zone: (data.zones as string[]) ?? (data.zone as string[]) ?? [],
            accountStatus: (data.accountStatus as string) || 'Active',
            temporaryPassword: data.password ? undefined : 'Ck@TempPass1',
          } as InspectorRow,
          300
        )
      : apiRequest<InspectorRow>({ method: 'POST', url: '/inspectors', data }),
  update: (id: string, data: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData(
          {
            ...(INSPECTORS.find(i => i.id === id) ?? INSPECTORS[0]),
            ...data,
            id,
            zone: (data.zones as string[]) ?? (data.zone as string[]) ?? INSPECTORS.find(i => i.id === id)?.zone ?? [],
          } as InspectorRow,
          300
        )
      : apiRequest<InspectorRow>({ method: 'PATCH', url: `/inspectors/${id}`, data }),
  block: (id: string) =>
    USE_API_MOCK
      ? mockData({ ...(INSPECTORS.find(i => i.id === id) ?? INSPECTORS[0]), id, accountStatus: 'Inactive', status: 'offline' } as InspectorRow, 200)
      : apiRequest<InspectorRow>({ method: 'POST', url: `/inspectors/${id}/block` }),
  unblock: (id: string) =>
    USE_API_MOCK
      ? mockData({ ...(INSPECTORS.find(i => i.id === id) ?? INSPECTORS[0]), id, accountStatus: 'Active' } as InspectorRow, 200)
      : apiRequest<InspectorRow>({ method: 'POST', url: `/inspectors/${id}/unblock` }),
  remove: (id: string) =>
    USE_API_MOCK
      ? mockData({ ok: true, id }, 200)
      : apiRequest<unknown>({ method: 'DELETE', url: `/inspectors/${id}` }),
};

// ── Appointments ────────────────────────────────────────────────────────────

export const appointmentsApi = {
  list: async (): Promise<Appointment[]> => {
    if (USE_API_MOCK) {
      try {
        const j = await nextJson<{ appointments?: Appointment[] }>('/api/appointments');
        return j.appointments ?? [...APPOINTMENTS_SEED];
      } catch {
        return [...APPOINTMENTS_SEED] as Appointment[];
      }
    }
    return apiRequest<Appointment[]>({ method: 'GET', url: '/appointments' });
  },
  get: async (id: string): Promise<Appointment> => {
    if (USE_API_MOCK) {
      const j = await nextJson<{ appointment: Appointment }>(`/api/appointments/${encodeURIComponent(id)}`);
      return j.appointment;
    }
    return apiRequest<Appointment>({ method: 'GET', url: `/appointments/${id}` });
  },
  create: async (data: Record<string, unknown>): Promise<Appointment> => {
    if (USE_API_MOCK) {
      const j = await nextJson<{ appointment: Appointment }>('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return j.appointment;
    }
    return apiRequest<Appointment>({ method: 'POST', url: '/appointments', data });
  },
  update: async (id: string, data: Record<string, unknown>): Promise<Appointment> => {
    if (USE_API_MOCK) {
      const j = await nextJson<{ appointment: Appointment }>(`/api/appointments/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return j.appointment;
    }
    return apiRequest<Appointment>({ method: 'PATCH', url: `/appointments/${id}`, data });
  },
  remove: async (id: string): Promise<void> => {
    if (USE_API_MOCK) {
      await nextJson<{ ok: boolean }>(`/api/appointments/${encodeURIComponent(id)}`, { method: 'DELETE' });
      return;
    }
    await apiRequest<unknown>({ method: 'DELETE', url: `/appointments/${id}` });
  },
  duplicates: (id: string) =>
    USE_API_MOCK
      ? mockData({ matches: { customers: [], cars: [], crm_contacts: [] } })
      : apiRequest<{ matches: Record<string, unknown[]> }>({ method: 'GET', url: `/appointments/${id}/duplicates` }),
  suggestedInspectors: (id: string) =>
    USE_API_MOCK
      ? mockData({
          data: [{ id: 'INS-001', name: 'Emeka Okonkwo', reasons: ['Same zone', 'Available'] }],
        })
      : apiRequest<{ data: Array<Record<string, unknown>> }>({ method: 'GET', url: `/appointments/${id}/suggested-inspectors` }),
  convert: (id: string, data: Record<string, unknown> = {}) =>
    USE_API_MOCK
      ? mockData({ needs_confirmation: false, order_id: 'ORD-DEMO', car_id: 'CK-DEMO' }, 300)
      : apiRequest<Record<string, unknown>>({ method: 'POST', url: `/appointments/${id}/convert`, data }),
  startInspection: async (id: string, data: Record<string, unknown>) => {
    if (USE_API_MOCK) {
      const { appointmentToInspectionPrefill } = await import('@/lib/inspection/appointmentPrefill');
      const { findCarIdByVinOrPlate } = await import('@/lib/appointments/lookup');
      let ap: Appointment | null = null;
      try {
        ap = await appointmentsApi.get(id);
      } catch {
        ap = null;
      }
      const carId =
        (typeof data.car_id === 'string' && data.car_id) ||
        ap?.linkedCarId ||
        (ap ? findCarIdByVinOrPlate(ap.vinNumber, ap.plateNumber) : null) ||
        'CK-DEMO';
      let car: (typeof CARS)[0] | undefined;
      try {
        car = CARS.find(c => c.id === carId);
      } catch {
        car = undefined;
      }
      const prefill = ap
        ? appointmentToInspectionPrefill(ap, car)
        : { s01_first_name: 'Demo', s03_brand: 'Toyota' };
      return mockData(
        {
          order_id: ap?.linkedOrderId || `ORD-${id}`,
          inspection_id: ap?.linkedInspectionId || `INS-${id}`,
          car_id: carId,
          prefill,
        },
        400
      );
    }
    return apiRequest<{
      order_id: string;
      inspection_id: string;
      car_id: string;
      prefill: Record<string, string | null>;
    }>({ method: 'POST', url: `/appointments/${id}/start-inspection`, data });
  },
};

// ── Finance ─────────────────────────────────────────────────────────────────

export type InvoiceRow = {
  id: string;
  invoiceNumber?: string;
  status?: string;
  clientName?: string;
  total?: number;
  [key: string]: unknown;
};

export const financeApi = {
  summary: () =>
    USE_API_MOCK
      ? mockData({ ...FINANCE_SUMMARY })
      : apiRequest<typeof FINANCE_SUMMARY>({ method: 'GET', url: '/finance/summary' }),
  listInvoices: () =>
    USE_API_MOCK ? mockData<InvoiceRow[]>([]) : apiRequest<InvoiceRow[]>({ method: 'GET', url: '/invoices' }),
  getInvoice: (id: string) =>
    USE_API_MOCK
      ? mockData<InvoiceRow>({ id, invoiceNumber: id, status: 'Draft', total: 0 })
      : apiRequest<InvoiceRow>({ method: 'GET', url: `/invoices/${id}` }),
  createInvoice: (data: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData<InvoiceRow>({ id: `INV-${Date.now()}`, ...data }, 300)
      : apiRequest<InvoiceRow>({ method: 'POST', url: '/invoices', data }),
  updateInvoice: (id: string, data: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData<InvoiceRow>({ id, ...data }, 300)
      : apiRequest<InvoiceRow>({ method: 'PATCH', url: `/invoices/${id}`, data }),
  removeInvoice: (id: string) =>
    USE_API_MOCK
      ? mockData({ ok: true, id }, 200)
      : apiRequest<unknown>({ method: 'DELETE', url: `/invoices/${id}` }),
  markPaid: (id: string) =>
    USE_API_MOCK
      ? mockData({ ok: true, id }, 200)
      : apiRequest<unknown>({ method: 'POST', url: `/invoices/${id}/mark-paid` }),
};

// ── Vehicle valuations ───────────────────────────────────────────────────────

export type ValuationRow = {
  id: string;
  date: string;
  clientName: string;
  vehicleDescription: string;
  vin?: string | null;
  plate?: string | null;
  carId?: string | null;
  inspectionId?: string | null;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  mileage?: number | null;
  marketValue: number;
  fsv: number;
  conditionValue: number;
  notes: string;
  status: 'draft' | 'final';
  trainingConsent?: boolean;
  featureSnapshot?: Record<string, unknown> | null;
  createdAt: string;
};

function optionalStr(data: Record<string, unknown>, key: string): string | null | undefined {
  if (!(key in data)) return undefined;
  const v = data[key];
  if (v == null || v === '') return null;
  return String(v);
}

function optionalNum(data: Record<string, unknown>, key: string): number | null | undefined {
  if (!(key in data)) return undefined;
  const v = data[key];
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export type VehicleLookupHit = {
  vin: string | null;
  plate: string | null;
  carId: string | null;
  inspectionId: string | null;
  make: string | null;
  model: string | null;
  year: number | null;
  mileage: number | null;
  vehicleDescription: string;
};

export const valuationsApi = {
  /** Cars, inspections, and bookings matched by VIN / chassis, car id, or inspection id. */
  lookup: async (q: string): Promise<VehicleLookupHit[]> => {
    const query = q.trim();
    if (query.replace(/[^a-z0-9]/gi, '').length < 3) return [];
    if (USE_API_MOCK) {
      const needle = query.replace(/[^a-z0-9]/gi, '').toUpperCase();
      const idNeedle = query.replace(/\s/g, '').toUpperCase();
      const hits: VehicleLookupHit[] = CARS.filter(car => {
        const vin = car.vin.replace(/[^a-z0-9]/gi, '').toUpperCase();
        const plate = car.plate.replace(/[^a-z0-9]/gi, '').toUpperCase();
        return vin.includes(needle) || plate.includes(needle) || car.id.toUpperCase().includes(idNeedle);
      })
        .slice(0, 8)
        .map(car => ({
          vin: car.vin,
          plate: car.plate.replace(/[\s-]/g, '').toUpperCase(),
          carId: car.id,
          inspectionId: null,
          make: car.brand.toUpperCase(),
          model: car.model.toUpperCase(),
          year: car.year,
          mileage: car.mileage,
          vehicleDescription: [car.brand, car.model, String(car.year), car.vin, car.plate.replace(/[\s-]/g, '')]
            .join(' ')
            .toUpperCase(),
        }));
      return mockData(hits, 150);
    }
    const rows = await apiRequest<VehicleLookupHit[]>({
      method: 'GET',
      url: '/valuations/lookup',
      params: { q: query },
    });
    return Array.isArray(rows) ? rows : [];
  },
  list: async (): Promise<ValuationRow[]> => {
    if (USE_API_MOCK) {
      const { listLocalValuations } = await import('@/lib/valuations/localStore');
      return mockData(listLocalValuations());
    }
    return apiRequest<ValuationRow[]>({ method: 'GET', url: '/valuations' });
  },
  get: async (id: string): Promise<ValuationRow> => {
    if (USE_API_MOCK) {
      const { getLocalValuation } = await import('@/lib/valuations/localStore');
      const row = getLocalValuation(id);
      if (!row) throw new Error('Valuation not found');
      return mockData(row);
    }
    return apiRequest<ValuationRow>({ method: 'GET', url: `/valuations/${id}` });
  },
  create: async (data: Record<string, unknown>): Promise<ValuationRow> => {
    if (USE_API_MOCK) {
      const { nextLocalValuationId, upsertLocalValuation } = await import('@/lib/valuations/localStore');
      const marketValue = Number(data.marketValue) || 0;
      const row = {
        id: nextLocalValuationId(),
        date: String(data.date ?? ''),
        clientName: String(data.clientName ?? ''),
        vehicleDescription: String(data.vehicleDescription ?? ''),
        vin: optionalStr(data, 'vin') ?? null,
        plate: optionalStr(data, 'plate') ?? null,
        carId: optionalStr(data, 'carId') ?? null,
        inspectionId: optionalStr(data, 'inspectionId') ?? null,
        make: optionalStr(data, 'make') ?? null,
        model: optionalStr(data, 'model') ?? null,
        year: optionalNum(data, 'year') ?? null,
        mileage: optionalNum(data, 'mileage') ?? null,
        marketValue,
        fsv: data.fsv != null ? Number(data.fsv) : Math.round(marketValue * 0.7),
        conditionValue: Number(data.conditionValue) || 0,
        notes: String(data.notes ?? ''),
        status: (data.status as 'draft' | 'final') || 'final',
        trainingConsent: Boolean(data.trainingConsent),
        featureSnapshot: (data.featureSnapshot as Record<string, unknown> | null | undefined) ?? null,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      return mockData(upsertLocalValuation(row), 300);
    }
    return apiRequest<ValuationRow>({ method: 'POST', url: '/valuations', data });
  },
  update: async (id: string, data: Record<string, unknown>): Promise<ValuationRow> => {
    if (USE_API_MOCK) {
      const { getLocalValuation, upsertLocalValuation } = await import('@/lib/valuations/localStore');
      const prev = getLocalValuation(id);
      if (!prev) throw new Error('Valuation not found');
      const marketValue = data.marketValue != null ? Number(data.marketValue) : prev.marketValue;
      const row = {
        ...prev,
        date: data.date != null ? String(data.date) : prev.date,
        clientName: data.clientName != null ? String(data.clientName) : prev.clientName,
        vehicleDescription:
          data.vehicleDescription != null ? String(data.vehicleDescription) : prev.vehicleDescription,
        vin: 'vin' in data ? optionalStr(data, 'vin') ?? null : prev.vin,
        plate: 'plate' in data ? optionalStr(data, 'plate') ?? null : prev.plate,
        carId: 'carId' in data ? optionalStr(data, 'carId') ?? null : prev.carId,
        inspectionId: 'inspectionId' in data ? optionalStr(data, 'inspectionId') ?? null : prev.inspectionId,
        make: 'make' in data ? optionalStr(data, 'make') ?? null : prev.make,
        model: 'model' in data ? optionalStr(data, 'model') ?? null : prev.model,
        year: 'year' in data ? optionalNum(data, 'year') ?? null : prev.year,
        mileage: 'mileage' in data ? optionalNum(data, 'mileage') ?? null : prev.mileage,
        marketValue,
        fsv: data.fsv != null ? Number(data.fsv) : Math.round(marketValue * 0.7),
        conditionValue: data.conditionValue != null ? Number(data.conditionValue) : prev.conditionValue,
        notes: data.notes != null ? String(data.notes) : prev.notes,
        status: (data.status as 'draft' | 'final') || prev.status,
        trainingConsent:
          'trainingConsent' in data ? Boolean(data.trainingConsent) : Boolean(prev.trainingConsent),
        featureSnapshot:
          'featureSnapshot' in data
            ? ((data.featureSnapshot as Record<string, unknown> | null) ?? null)
            : prev.featureSnapshot,
      };
      return mockData(upsertLocalValuation(row), 300);
    }
    return apiRequest<ValuationRow>({ method: 'PATCH', url: `/valuations/${id}`, data });
  },
  remove: async (id: string): Promise<void> => {
    if (USE_API_MOCK) {
      const { deleteLocalValuation } = await import('@/lib/valuations/localStore');
      deleteLocalValuation(id);
      await mockData({ ok: true }, 200);
      return;
    }
    await apiRequest<unknown>({ method: 'DELETE', url: `/valuations/${id}` });
  },
};

// ── Vehicle outcome events (AI training labels) ──────────────────────────────

export type OutcomeEventRow = {
  id: string;
  vin?: string | null;
  plate?: string | null;
  carId?: string | null;
  inspectionId?: string | null;
  eventType: 'repair' | 'reinspect' | 'customer_report' | 'warranty' | 'tracker_alert' | 'other';
  systemArea?: 'engine' | 'transmission' | 'suspension' | 'electrical' | 'body' | 'brakes' | 'other' | null;
  severity?: 'minor' | 'major' | 'critical' | null;
  daysAfterInspection?: number | null;
  occurredOn?: string | null;
  description: string;
  costAmount?: number | null;
  source: 'manual' | 'tracker' | 'import' | 'api';
  trainingConsent: boolean;
  createdAt: string;
};

export const outcomesApi = {
  list: async (): Promise<OutcomeEventRow[]> => {
    if (USE_API_MOCK) {
      const { listLocalOutcomes } = await import('@/lib/outcomes/localStore');
      return mockData(listLocalOutcomes());
    }
    return apiRequest<OutcomeEventRow[]>({ method: 'GET', url: '/outcomes' });
  },
  create: async (data: Record<string, unknown>): Promise<OutcomeEventRow> => {
    if (USE_API_MOCK) {
      const { nextLocalOutcomeId, upsertLocalOutcome } = await import('@/lib/outcomes/localStore');
      const row: OutcomeEventRow = {
        id: nextLocalOutcomeId(),
        vin: optionalStr(data, 'vin') ?? null,
        plate: optionalStr(data, 'plate') ?? null,
        carId: optionalStr(data, 'carId') ?? null,
        inspectionId: optionalStr(data, 'inspectionId') ?? null,
        eventType: (data.eventType as OutcomeEventRow['eventType']) || 'other',
        systemArea: (data.systemArea as OutcomeEventRow['systemArea']) || null,
        severity: (data.severity as OutcomeEventRow['severity']) || null,
        daysAfterInspection: optionalNum(data, 'daysAfterInspection') ?? null,
        occurredOn: optionalStr(data, 'occurredOn') ?? null,
        description: String(data.description ?? ''),
        costAmount: optionalNum(data, 'costAmount') ?? null,
        source: (data.source as OutcomeEventRow['source']) || 'manual',
        trainingConsent: data.trainingConsent !== false,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      return mockData(upsertLocalOutcome(row), 300);
    }
    return apiRequest<OutcomeEventRow>({ method: 'POST', url: '/outcomes', data });
  },
  update: async (id: string, data: Record<string, unknown>): Promise<OutcomeEventRow> => {
    if (USE_API_MOCK) {
      const { getLocalOutcome, upsertLocalOutcome } = await import('@/lib/outcomes/localStore');
      const prev = getLocalOutcome(id);
      if (!prev) throw new Error('Outcome not found');
      const row: OutcomeEventRow = {
        ...prev,
        vin: 'vin' in data ? optionalStr(data, 'vin') ?? null : prev.vin,
        plate: 'plate' in data ? optionalStr(data, 'plate') ?? null : prev.plate,
        carId: 'carId' in data ? optionalStr(data, 'carId') ?? null : prev.carId,
        inspectionId: 'inspectionId' in data ? optionalStr(data, 'inspectionId') ?? null : prev.inspectionId,
        eventType: (data.eventType as OutcomeEventRow['eventType']) || prev.eventType,
        systemArea:
          'systemArea' in data
            ? ((data.systemArea as OutcomeEventRow['systemArea']) ?? null)
            : prev.systemArea,
        severity:
          'severity' in data ? ((data.severity as OutcomeEventRow['severity']) ?? null) : prev.severity,
        daysAfterInspection:
          'daysAfterInspection' in data
            ? optionalNum(data, 'daysAfterInspection') ?? null
            : prev.daysAfterInspection,
        occurredOn: 'occurredOn' in data ? optionalStr(data, 'occurredOn') ?? null : prev.occurredOn,
        description: data.description != null ? String(data.description) : prev.description,
        costAmount: 'costAmount' in data ? optionalNum(data, 'costAmount') ?? null : prev.costAmount,
        source: (data.source as OutcomeEventRow['source']) || prev.source,
        trainingConsent:
          'trainingConsent' in data ? data.trainingConsent !== false : prev.trainingConsent,
      };
      return mockData(upsertLocalOutcome(row), 300);
    }
    return apiRequest<OutcomeEventRow>({ method: 'PATCH', url: `/outcomes/${id}`, data });
  },
  remove: async (id: string): Promise<void> => {
    if (USE_API_MOCK) {
      const { deleteLocalOutcome } = await import('@/lib/outcomes/localStore');
      deleteLocalOutcome(id);
      await mockData({ ok: true }, 200);
      return;
    }
    await apiRequest<unknown>({ method: 'DELETE', url: `/outcomes/${id}` });
  },
};

export const scannerIngestApi = {
  list: async (limit = 25): Promise<Array<Record<string, unknown>>> => {
    if (USE_API_MOCK) {
      const { listLocalScannerIngest } = await import('@/lib/ai/scannerIngestLocalStore');
      return mockData(listLocalScannerIngest(limit) as unknown as Array<Record<string, unknown>>);
    }
    const res = await apiRequest<{ data: Array<Record<string, unknown>> }>({
      method: 'GET',
      url: '/scanner/ingest',
      params: { limit },
    });
    return res.data ?? [];
  },
  ingest: async (body: Record<string, unknown>): Promise<Record<string, unknown>> => {
    if (USE_API_MOCK) {
      const { addLocalScannerIngest } = await import('@/lib/ai/scannerIngestLocalStore');
      return mockData(addLocalScannerIngest(body) as unknown as Record<string, unknown>, 200);
    }
    return apiRequest<Record<string, unknown>>({ method: 'POST', url: '/scanner/ingest', data: body });
  },
};

export type AiBaselineCounts = {
  inspectionsTotal: number;
  inspectionsSubmitted: number;
  featureSnapshots: number;
  valuationsTotal: number;
  valuationsWithVin: number;
  valuationsWithInspection: number;
  valuationsTrainingConsent: number;
  valuationsWithSnapshot: number;
  outcomesTotal: number;
  outcomesTrainingConsent: number;
  scannerIngestEvents: number;
  phase0TablesReady: boolean;
  generatedAt: string;
};

export const aiTrainingApi = {
  baseline: async (): Promise<AiBaselineCounts> => {
    if (USE_API_MOCK) {
      const { listLocalValuations } = await import('@/lib/valuations/localStore');
      const { listLocalOutcomes } = await import('@/lib/outcomes/localStore');
      const { listLocalScannerIngest } = await import('@/lib/ai/scannerIngestLocalStore');
      const vals = listLocalValuations();
      const outs = listLocalOutcomes();
      const scans = listLocalScannerIngest(100);
      const withSnap = vals.filter(v => !!v.featureSnapshot).length;
      return mockData({
        inspectionsTotal: vals.filter(v => !!v.inspectionId).length,
        inspectionsSubmitted: vals.filter(v => !!v.inspectionId).length,
        featureSnapshots: withSnap,
        valuationsTotal: vals.length,
        valuationsWithVin: vals.filter(v => !!v.vin).length,
        valuationsWithInspection: vals.filter(v => !!v.inspectionId).length,
        valuationsTrainingConsent: vals.filter(v => !!v.trainingConsent).length,
        valuationsWithSnapshot: withSnap,
        outcomesTotal: outs.length,
        outcomesTrainingConsent: outs.filter(o => o.trainingConsent).length,
        scannerIngestEvents: scans.length,
        phase0TablesReady: true,
        generatedAt: new Date().toISOString(),
      });
    }
    return apiRequest<AiBaselineCounts>({ method: 'GET', url: '/ai/baseline' });
  },
  featureSnapshot: async (inspectionId: string): Promise<Record<string, unknown> | null> => {
    const id = inspectionId.trim();
    if (!id) return null;
    if (USE_API_MOCK) {
      // Mock: synthesize a minimal snapshot so valuation attach / Snap badge can be exercised offline.
      return mockData({
        id: 0,
        inspectionId: id,
        schemaVersion: '1.0',
        capturedAt: new Date().toISOString(),
        snapshot: {
          schemaVersion: '1.0',
          capturedAt: new Date().toISOString(),
          inspection: { id, score: null, band: null, defectsCount: 0, criticalDefectsCount: 0 },
          vehicle: {},
          sectionFailSummary: {},
          items: [],
          mock: true,
        },
      });
    }
    try {
      return await apiRequest<Record<string, unknown>>({
        method: 'GET',
        url: `/inspections/${encodeURIComponent(id)}/feature-snapshot`,
      });
    } catch {
      return null;
    }
  },
};

// ── Platform ────────────────────────────────────────────────────────────────

export const notificationsApi = {
  list: () =>
    USE_API_MOCK
      ? mockData([...NOTIFICATIONS])
      : apiRequest<typeof NOTIFICATIONS>({ method: 'GET', url: '/notifications' }),
  markRead: (id: string) =>
    USE_API_MOCK
      ? mockData({ ok: true, id }, 100)
      : apiRequest<unknown>({ method: 'POST', url: `/notifications/${id}/read` }),
  markAllRead: () =>
    USE_API_MOCK
      ? mockData({ ok: true }, 100)
      : apiRequest<unknown>({ method: 'POST', url: '/notifications/read-all' }),
};

export const activityApi = {
  list: () =>
    USE_API_MOCK
      ? mockData([...ACTIVITY_LOG])
      : apiRequest<typeof ACTIVITY_LOG>({ method: 'GET', url: '/activity' }),
};

export const referenceApi = {
  brands: () =>
    USE_API_MOCK ? mockData([...BRANDS]) : apiRequest<typeof BRANDS>({ method: 'GET', url: '/reference/brands' }),
  models: () =>
    USE_API_MOCK ? mockData([...MODELS]) : apiRequest<typeof MODELS>({ method: 'GET', url: '/reference/models' }),
  years: () =>
    USE_API_MOCK ? mockData([...YEARS]) : apiRequest<typeof YEARS>({ method: 'GET', url: '/reference/years' }),
  storeBrand: (data: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ id: `BR-${Date.now()}`, ...data }, 200)
      : apiRequest<unknown>({ method: 'POST', url: '/reference/brands', data }),
  updateBrand: (id: string, data: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ id, ...data }, 200)
      : apiRequest<unknown>({ method: 'PATCH', url: `/reference/brands/${id}`, data }),
  deleteBrand: (id: string) =>
    USE_API_MOCK
      ? mockData({ ok: true, id }, 200)
      : apiRequest<unknown>({ method: 'DELETE', url: `/reference/brands/${id}` }),
  toggleBrand: (id: string) =>
    USE_API_MOCK
      ? mockData({ ok: true, id }, 200)
      : apiRequest<unknown>({ method: 'PATCH', url: `/reference/brands/${id}/toggle` }),
  storeModel: (data: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ id: `MD-${Date.now()}`, ...data }, 200)
      : apiRequest<unknown>({ method: 'POST', url: '/reference/models', data }),
  updateModel: (id: string, data: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ id, ...data }, 200)
      : apiRequest<unknown>({ method: 'PATCH', url: `/reference/models/${id}`, data }),
  deleteModel: (id: string) =>
    USE_API_MOCK
      ? mockData({ ok: true, id }, 200)
      : apiRequest<unknown>({ method: 'DELETE', url: `/reference/models/${id}` }),
  toggleModel: (id: string) =>
    USE_API_MOCK
      ? mockData({ ok: true, id }, 200)
      : apiRequest<unknown>({ method: 'PATCH', url: `/reference/models/${id}/toggle` }),
  storeYear: (data: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ id: `YR-${Date.now()}`, ...data }, 200)
      : apiRequest<unknown>({ method: 'POST', url: '/reference/years', data }),
  updateYear: (id: string, data: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ id, ...data }, 200)
      : apiRequest<unknown>({ method: 'PATCH', url: `/reference/years/${id}`, data }),
  deleteYear: (id: string) =>
    USE_API_MOCK
      ? mockData({ ok: true, id }, 200)
      : apiRequest<unknown>({ method: 'DELETE', url: `/reference/years/${id}` }),
  toggleYear: (id: string) =>
    USE_API_MOCK
      ? mockData({ ok: true, id }, 200)
      : apiRequest<unknown>({ method: 'PATCH', url: `/reference/years/${id}/toggle` }),
};

export const dashboardApi = {
  kpis: () =>
    USE_API_MOCK
      ? mockData({
          orders: { total: ORDERS.length, new: 0, assigned: 0, inProgress: 0, qaReview: 0, reported: 0, closed: 0 },
          reports: { total: REPORTS.length, qaReview: 0, approved: 0, rejected: 0 },
          inspectors: { total: INSPECTORS.length, online: 0, offline: 0, enRoute: 0 },
          appointments: { total: APPOINTMENTS_SEED.length, today: 0, pending: 0, confirmed: 0 },
        })
      : apiRequest<Record<string, unknown>>({ method: 'GET', url: '/dashboard/kpis' }),
  investor: (params: { period?: string; from?: string; to?: string }) =>
    apiRequest<InvestorDashboard>({ method: 'GET', url: '/dashboard/investor', params }),
};

export type InvestorDashboard = {
  period: string;
  from: string;
  to: string;
  bucket: 'day' | 'month';
  revenue_source: 'invoices' | 'sales' | 'none';
  metrics: {
    inspections: number;
    inspections_change_pct: number | null;
    gmv: number;
    gmv_change_pct: number | null;
    revenue: number;
    revenue_change_pct: number | null;
    active_inspectors: number;
    new_inspectors_quarter: number;
    nps: number | null;
    avg_score: number | null;
  };
  monthly: { month: string; inspections: number; revenue: number }[];
  failure_points: { item: string; rate: number }[];
  heatmap: { makes: string[]; years: string[]; cells: Record<string, Record<string, number>> };
  zones: { name: string; inspections: number; inspectors: number }[];
  zones_label: string;
  state_count: number;
  forecast: {
    growth_rate: number | null;
    points: { month: string; actual: number | null; base: number | null; conservative: number | null; optimistic: number | null }[];
  };
  deals: {
    avg_size: number | null;
    avg_days_to_sale: number | null;
    funnel: { stage: string; count: number; pct: number }[];
    sellers: { type: string; deals: number; avg_price: number; conversion: number }[];
  };
};

export type PlatformSettings = {
  company?: Record<string, unknown>;
  permissions?: unknown[];
  notifications?: Record<string, unknown>;
  security?: {
    sessionTimeout?: number;
    enforce2fa?: Record<string, boolean>;
  };
  operations?: {
    stalled_hours?: number;
    sla_hours?: number;
  };
};

const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  company: { name: 'Carschek', timezone: 'Africa/Lagos' },
  permissions: [],
  notifications: {},
  security: { sessionTimeout: 30, enforce2fa: {} },
  operations: { stalled_hours: 4, sla_hours: 8 },
};

export const settingsApi = {
  get: () =>
    USE_API_MOCK
      ? mockData<PlatformSettings>({ ...DEFAULT_PLATFORM_SETTINGS })
      : apiRequest<PlatformSettings>({ method: 'GET', url: '/settings' }),
  update: (data: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ ...data }, 300)
      : apiRequest<Record<string, unknown>>({ method: 'PATCH', url: '/settings', data }),
  getMail: () =>
    USE_API_MOCK
      ? mockData<Record<string, unknown>>({
          host: '',
          port: 587,
          encryption: 'tls',
          enabled: false,
          password_set: false,
        })
      : apiRequest<Record<string, unknown>>({ method: 'GET', url: '/settings/mail' }),
  updateMail: (data: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ ...data }, 300)
      : apiRequest<Record<string, unknown>>({ method: 'PUT', url: '/settings/mail', data }),
  testMail: (to: string, smtp?: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ ok: true, message: `Test email sent to ${to}` }, 400)
      : apiRequest<{ ok: boolean; message: string }>({
          method: 'POST',
          url: '/settings/mail/test',
          data: { to, ...(smtp ?? {}) },
        }),
  getSms: () =>
    USE_API_MOCK
      ? mockData<Record<string, unknown>>({
          provider: 'termii',
          sender_id: 'Carschek',
          enabled: false,
          api_key_set: false,
        })
      : apiRequest<Record<string, unknown>>({ method: 'GET', url: '/settings/sms' }),
  updateSms: (data: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ ...data }, 300)
      : apiRequest<Record<string, unknown>>({ method: 'PUT', url: '/settings/sms', data }),
  testSms: (to: string) =>
    USE_API_MOCK
      ? mockData({ ok: true, message: 'Test SMS sent.' }, 400)
      : apiRequest<{ ok: boolean; message: string }>({ method: 'POST', url: '/settings/sms/test', data: { to } }),
  listTemplates: async () => {
    if (USE_API_MOCK) {
      return mockData<{ data: Array<Record<string, unknown>> }>({
        data: listTemplateSummaries(loadLocalTemplates()) as unknown as Array<Record<string, unknown>>,
      });
    }
    try {
      const res = await apiRequest<{ data: Array<Record<string, unknown>> }>({
        method: 'GET',
        url: '/settings/email-templates',
      });
      if (!res.data?.length) {
        return { data: listTemplateSummaries(loadLocalTemplates()) as unknown as Array<Record<string, unknown>> };
      }
      return res;
    } catch {
      return { data: listTemplateSummaries(loadLocalTemplates()) as unknown as Array<Record<string, unknown>> };
    }
  },
  getTemplate: async (slug: string) => {
    if (USE_API_MOCK) {
      const t = loadLocalTemplates().find(x => x.slug === slug) ?? loadLocalTemplates()[0];
      return mockData<Record<string, unknown>>({ ...t });
    }
    try {
      return await apiRequest<Record<string, unknown>>({ method: 'GET', url: `/settings/email-templates/${slug}` });
    } catch {
      const t = loadLocalTemplates().find(x => x.slug === slug);
      if (!t) throw new Error('Template not found');
      return { ...t };
    }
  },
  updateTemplate: async (slug: string, data: Record<string, unknown>) => {
    if (USE_API_MOCK) {
      const saved = saveLocalTemplate(slug, {
        subject: data.subject != null ? String(data.subject) : undefined,
        html_body: data.html_body != null ? String(data.html_body) : undefined,
        text_body: data.text_body != null ? String(data.text_body) : undefined,
        is_active: typeof data.is_active === 'boolean' ? data.is_active : undefined,
        name: data.name != null ? String(data.name) : undefined,
        description: data.description != null ? String(data.description) : undefined,
      });
      return mockData({ ...saved }, 300);
    }
    try {
      return await apiRequest<Record<string, unknown>>({
        method: 'PUT',
        url: `/settings/email-templates/${slug}`,
        data,
      });
    } catch {
      const saved = saveLocalTemplate(slug, {
        subject: data.subject != null ? String(data.subject) : undefined,
        html_body: data.html_body != null ? String(data.html_body) : undefined,
        text_body: data.text_body != null ? String(data.text_body) : undefined,
        is_active: typeof data.is_active === 'boolean' ? data.is_active : undefined,
      });
      return { ...saved };
    }
  },
  previewTemplate: async (slug: string, variables: Record<string, string> = {}) => {
    if (USE_API_MOCK) {
      const t = loadLocalTemplates().find(x => x.slug === slug);
      if (!t) return mockData({ subject: 'Preview', html: '<p>Preview</p>' }, 200);
      const vars = { ...sampleVariablesFor(t), ...variables };
      return mockData(
        {
          subject: mergeTemplateVars(t.subject, vars),
          html: mergeTemplateVars(t.html_body, vars),
          text: mergeTemplateVars(t.text_body, vars),
        },
        200
      );
    }
    try {
      return await apiRequest<{ subject: string; html: string; text?: string }>({
        method: 'POST',
        url: `/settings/email-templates/${slug}/preview`,
        data: { variables },
      });
    } catch {
      const t = loadLocalTemplates().find(x => x.slug === slug);
      if (!t) return { subject: 'Preview', html: '<p>Preview</p>' };
      const vars = { ...sampleVariablesFor(t), ...variables };
      return {
        subject: mergeTemplateVars(t.subject, vars),
        html: mergeTemplateVars(t.html_body, vars),
        text: mergeTemplateVars(t.text_body, vars),
      };
    }
  },
  getSimplybook: () =>
    USE_API_MOCK
      ? mockData<Record<string, unknown>>({
          enabled: false,
          company_login: '',
          webhook_url: '/api/v1/webhooks/simplybook',
        })
      : apiRequest<Record<string, unknown>>({ method: 'GET', url: '/settings/simplybook' }),
  updateSimplybook: (data: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ ...data }, 300)
      : apiRequest<Record<string, unknown>>({ method: 'PUT', url: '/settings/simplybook', data }),
  syncSimplybook: () =>
    USE_API_MOCK
      ? mockData({ ok: true, message: 'Synced 0 booking(s).', count: 0 }, 500)
      : apiRequest<{ ok: boolean; message: string; count: number }>({ method: 'POST', url: '/settings/simplybook/sync' }),
  getChecklistRules: () =>
    USE_API_MOCK
      ? mockData<{ rules: Record<string, unknown> }>({ rules: {} })
      : apiRequest<{ rules: Record<string, unknown> }>({ method: 'GET', url: '/settings/checklist-rules' }),
  updateChecklistRules: (rules: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ rules }, 300)
      : apiRequest<{ rules: Record<string, unknown> }>({ method: 'PUT', url: '/settings/checklist-rules', data: { rules } }),
  audits: async (key?: string) => {
    if (USE_API_MOCK) {
      const data = key
        ? MOCK_SETTINGS_AUDITS.filter(a => a.key.toLowerCase().includes(key.toLowerCase()))
        : MOCK_SETTINGS_AUDITS;
      return mockData<{ data: Array<Record<string, unknown>> }>({
        data: data as unknown as Array<Record<string, unknown>>,
      });
    }
    try {
      const res = await apiRequest<{ data: Array<Record<string, unknown>> }>({
        method: 'GET',
        url: '/settings/audits',
        params: key ? { key } : undefined,
      });
      if (!res.data?.length) {
        return { data: MOCK_SETTINGS_AUDITS as unknown as Array<Record<string, unknown>> };
      }
      return res;
    } catch {
      return { data: MOCK_SETTINGS_AUDITS as unknown as Array<Record<string, unknown>> };
    }
  },
  inspectionSignals: () =>
    USE_API_MOCK
      ? mockData<Record<string, unknown>>({
          signals: [],
          counts: { stalled: 0, sla_risk: 0, incomplete_required: 0, photos_missing: 0 },
        })
      : apiRequest<Record<string, unknown>>({ method: 'GET', url: '/ops/inspection-signals' }),
};

export type StaffUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin?: string | null;
  avatar?: string | null;
  phone?: string | null;
  inspectorId?: string | null;
  temporaryPassword?: string;
};

export const usersApi = {
  list: (params?: { role?: string; status?: string; search?: string }) => {
    if (USE_API_MOCK) {
      let rows = [...USERS] as StaffUserRow[];
      if (params?.role) rows = rows.filter(u => u.role === params.role);
      if (params?.status) rows = rows.filter(u => u.status === params.status);
      if (params?.search) {
        const q = params.search.toLowerCase();
        rows = rows.filter(
          u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q)
        );
      }
      return mockData(rows);
    }
    const qs = new URLSearchParams();
    if (params?.role) qs.set('role', params.role);
    if (params?.status) qs.set('status', params.status);
    if (params?.search) qs.set('search', params.search);
    const suffix = qs.toString() ? `?${qs}` : '';
    return apiRequest<StaffUserRow[]>({ method: 'GET', url: `/users${suffix}` });
  },
  get: (id: string) =>
    USE_API_MOCK
      ? mockData((USERS.find(u => u.id === id) ?? USERS[0]) as StaffUserRow)
      : apiRequest<StaffUserRow>({ method: 'GET', url: `/users/${id}` }),
  create: (data: Record<string, unknown>) => {
    if (USE_API_MOCK) {
      const row: StaffUserRow = {
        id: `USR-${Date.now()}`,
        name: String(data.name ?? USERS[0].name),
        email: String(data.email ?? USERS[0].email),
        role: String(data.role ?? USERS[0].role),
        status: String(data.status ?? 'Active'),
        lastLogin: null,
        avatar: typeof data.avatar === 'string' ? data.avatar : USERS[0].avatar,
        phone: typeof data.phone === 'string' ? data.phone : null,
        inspectorId: data.role === 'inspector' ? `INS-${Date.now()}` : null,
      };
      return mockData(row, 300);
    }
    return apiRequest<StaffUserRow>({ method: 'POST', url: '/users', data });
  },
  update: (id: string, data: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ ...(USERS.find(u => u.id === id) ?? USERS[0]), ...data, id } as StaffUserRow, 300)
      : apiRequest<StaffUserRow>({ method: 'PATCH', url: `/users/${id}`, data }),
  block: (id: string) =>
    USE_API_MOCK
      ? mockData({ ...(USERS.find(u => u.id === id) ?? USERS[0]), id, status: 'Inactive' } as StaffUserRow, 200)
      : apiRequest<StaffUserRow>({ method: 'POST', url: `/users/${id}/block` }),
  unblock: (id: string) =>
    USE_API_MOCK
      ? mockData({ ...(USERS.find(u => u.id === id) ?? USERS[0]), id, status: 'Active' } as StaffUserRow, 200)
      : apiRequest<StaffUserRow>({ method: 'POST', url: `/users/${id}/unblock` }),
  resetPassword: (id: string, password?: string) =>
    USE_API_MOCK
      ? mockData({ message: 'Password reset.', id, temporaryPassword: password || 'Ck@TempPass1' }, 200)
      : apiRequest<{ message: string; id: string; temporaryPassword: string }>({
          method: 'POST',
          url: `/users/${id}/reset-password`,
          data: password ? { password } : {},
        }),
  remove: (id: string) =>
    USE_API_MOCK
      ? mockData({ ok: true, id }, 200)
      : apiRequest<unknown>({ method: 'DELETE', url: `/users/${id}` }),
};

// ── Sync (inspector offline) ────────────────────────────────────────────────

export const syncApi = {
  startInspection: (data: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ id: `INS-RPT-${Date.now()}`, ...data }, 200)
      : apiRequest<unknown>({ method: 'POST', url: '/inspections', data }),
  upsertItem: (inspectionId: string, itemKey: string, data: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ ok: true }, 60)
      : apiRequest<unknown>({
          method: 'PATCH',
          url: `/inspections/${inspectionId}/items/${encodeURIComponent(itemKey)}`,
          data,
        }),
  completeSection: (inspectionId: string, sectionKey: string, data?: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ ok: true }, 60)
      : apiRequest<unknown>({
          method: 'POST',
          url: `/inspections/${inspectionId}/sections/${encodeURIComponent(sectionKey)}/complete`,
          data,
        }),
  submit: (inspectionId: string, data?: Record<string, unknown>) =>
    USE_API_MOCK
      ? mockData({ ok: true }, 100)
      : apiRequest<unknown>({ method: 'POST', url: `/inspections/${inspectionId}/submit`, data }),
  hints: (params?: { body_type?: string; section?: string }) =>
    USE_API_MOCK
      ? mockData<{ data: Array<Record<string, unknown>> }>({ data: [] })
      : apiRequest<{ data: Array<Record<string, unknown>> }>({ method: 'GET', url: '/inspections/hints', params }),
  resolveChecklist: (data: { service_type?: string; body_type?: string }) =>
    USE_API_MOCK
      ? mockData<{ sections: Record<string, { applicable: boolean; required: boolean; auto_na: boolean }> }>({
          sections: {},
        })
      : apiRequest<{ sections: Record<string, { applicable: boolean; required: boolean; auto_na: boolean }> }>({
          method: 'POST',
          url: '/inspection/checklist/resolve',
          data,
        }),
  presigned: async (key: string) => {
    if (USE_API_MOCK) {
      return {
        uploadUrl: `https://mock-upload.carschek.local/${encodeURIComponent(key)}`,
        publicUrl: `https://cdn.mock.carschek/${encodeURIComponent(key)}`,
      };
    }
    return apiRequest<{ uploadUrl: string; publicUrl: string }>({
      method: 'GET',
      url: '/storage/presigned',
      params: { key },
    });
  },
};

// ── Migration wizard ────────────────────────────────────────────────────────

export type MigrationConnectResult = {
  ok: boolean;
  message: string;
  demo?: boolean;
  source?: string;
  run_id?: number;
  run?: { id: number; status: string; progress: number };
};

export type MigrationProgress = {
  id: number;
  status: string;
  progress: number;
  log: string[];
  totals?: { imported?: number; warnings?: number; errors?: number; ms?: number } | null;
  demo?: boolean;
};

export const migrationApi = {
  connect: (data: {
    method: 'api' | 'csv' | 'legacy_db' | 'demo';
    base_url?: string;
    api_token?: string;
    csv_path?: string;
    use_demo?: boolean;
  }) =>
    USE_API_MOCK
      ? mockData<MigrationConnectResult>(
          {
            ok: true,
            message: 'Connection successful (mock)',
            demo: true,
            source: 'mock',
            run_id: 1,
            run: { id: 1, status: 'pending', progress: 0 },
          },
          900
        )
      : apiRequest<MigrationConnectResult>({ method: 'POST', url: '/migration/connect', data }),

  scan: (run_id: number, entities?: string[]) =>
    USE_API_MOCK
      ? mockData(
          {
            run_id,
            demo: true,
            source: 'mock',
            entities: [
              { id: 'brands', label: 'Vehicle Brands', count: 8, note: null },
              { id: 'models', label: 'Car Models', count: 24, note: null },
              { id: 'years', label: 'Car Years', count: 35, note: null },
              { id: 'cars', label: 'Cars / Vehicles', count: 33, note: null },
              { id: 'appointments', label: 'Inspection Appointments', count: 89, note: null },
              { id: 'reports', label: 'Inspection Reports', count: 41, note: null },
              { id: 'customers', label: 'Customers / Contacts', count: 156, note: null },
              { id: 'inspectors', label: 'Inspectors', count: 12, note: null },
              { id: 'offers', label: 'Offers', count: 23, note: null },
              { id: 'activity', label: 'Activity Logs', count: 1240, note: null },
              {
                id: 'documents',
                label: 'Document Files',
                count: 0,
                note: 'Requires manual re-upload after migration',
              },
            ],
          },
          1200
        )
      : apiRequest<{
          entities: { id: string; label: string; count: number; note: string | null }[];
          demo: boolean;
          source: string;
          run_id: number;
        }>({ method: 'POST', url: '/migration/scan', data: { run_id, entities } }),

  validate: (run_id: number, entities?: string[]) =>
    USE_API_MOCK
      ? mockData({ ok: true, run_id, issues: [] }, 1600)
      : apiRequest<Record<string, unknown>>({
          method: 'POST',
          url: '/migration/validate',
          data: { run_id, entities },
        }),

  dryRun: (run_id: number, entities?: string[]) =>
    USE_API_MOCK
      ? mockData(
          {
            run_id,
            rows: [
              { entity: 'Vehicle Brands', operation: 'upsert', records: 8, outcome: 'ok', note: 'All keys matched' },
              { entity: 'Car Models', operation: 'upsert', records: 24, outcome: 'ok', note: 'Cascade from brands' },
              { entity: 'Cars / Vehicles', operation: 'insert', records: 32, outcome: 'ok', note: 'New inventory' },
              {
                entity: 'Cars / Vehicles',
                operation: 'skip',
                records: 1,
                outcome: 'warning',
                note: 'Duplicate plate in target',
              },
              {
                entity: 'Cars / Vehicles',
                operation: 'error',
                records: 1,
                outcome: 'error',
                note: 'Invalid VIN checksum',
              },
            ],
          },
          2000
        )
      : apiRequest<{
          rows?: {
            entity: string;
            operation: string;
            records: number;
            outcome: string;
            note: string;
          }[];
          [key: string]: unknown;
        }>({ method: 'POST', url: '/migration/dry-run', data: { run_id, entities } }),

  start: (run_id: number, confirmation: string, entities?: string[]) =>
    USE_API_MOCK
      ? mockData({ message: 'Migration started', run: { id: run_id, status: 'running', progress: 0, log: [] } }, 200)
      : apiRequest<{ message: string; run: MigrationProgress }>({
          method: 'POST',
          url: '/migration/start',
          data: { run_id, confirmation, entities },
        }),

  progress: (id: number) =>
    USE_API_MOCK
      ? mockData<MigrationProgress>({ id, status: 'completed', progress: 100, log: ['✓ Mock migration complete'] }, 200)
      : apiRequest<MigrationProgress>({ method: 'GET', url: `/migration/${id}/progress` }),

  pause: (id: number) =>
    USE_API_MOCK
      ? mockData({ message: 'Migration paused' }, 200)
      : apiRequest<unknown>({ method: 'POST', url: `/migration/${id}/pause` }),

  cancel: (id: number) =>
    USE_API_MOCK
      ? mockData({ message: 'Migration cancelled' }, 200)
      : apiRequest<unknown>({ method: 'POST', url: `/migration/${id}/cancel` }),

  retryFailed: (id: number) =>
    USE_API_MOCK
      ? mockData({ message: 'Retry started' }, 200)
      : apiRequest<unknown>({ method: 'POST', url: `/migration/${id}/retry-failed` }),

  downloadReport: async (id: number) => {
    if (USE_API_MOCK) {
      return new Blob(
        [['record,status,message', 'CK-1041,imported,ok', 'CK-1039,skipped,invalid VIN'].join('\n')],
        { type: 'text/csv;charset=utf-8' }
      );
    }
    const { data } = await apiClient.get<Blob>(`/migration/${id}/report.csv`, { responseType: 'blob' });
    return data;
  },
};
