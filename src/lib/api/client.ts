/**
 * Central HTTP client — swap `USE_API_MOCK` / `NEXT_PUBLIC_API_BASE_URL` for production.
 * All feature modules should import from here or `src/lib/api/services.ts` (typed resource facades),
 * not ad-hoc axios.
 */
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { clearCarschekSessionCookies } from '@/lib/auth/session';

/** Set to false when pointing at a real Laravel API. */
export const USE_API_MOCK =
  (process.env.NEXT_PUBLIC_USE_API_MOCK ?? 'true').trim().toLowerCase() !== 'false';

/**
 * Browser calls go to same-origin `/api/v1` (Next.js proxies to Laravel).
 * That avoids CORS when the UI is on Vercel and the API is on another host.
 * Set NEXT_PUBLIC_API_USE_PROXY=false to call Laravel directly from the browser.
 */
export const USE_API_PROXY =
  (process.env.NEXT_PUBLIC_API_USE_PROXY ?? 'true').trim().toLowerCase() !== 'false';

export const ACCESS_TOKEN_KEY = 'carschek-access-token';
export const OTP_SKIP_TOKEN_PREFIX = 'otp-skip:';

export function isOtpSkipToken(token: string | null | undefined): boolean {
  return Boolean(token && token.startsWith(OTP_SKIP_TOKEN_PREFIX));
}

if (typeof window !== 'undefined') {
  const existing = window.localStorage.getItem(ACCESS_TOKEN_KEY);
  if (isOtpSkipToken(existing)) {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    clearCarschekSessionCookies();
  }
}

export class ApiError extends Error {
  status?: number;
  data?: unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function toErrorMessage(data: unknown, fallback: string): string {
  if (typeof data === 'string' && data.trim()) return data;
  if (data && typeof data === 'object') {
    const rec = data as Record<string, unknown>;
    if (typeof rec.message === 'string' && rec.message.trim()) return rec.message;
  }
  return fallback;
}

const configuredBaseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'https://api.yourdomain.com/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: configuredBaseURL,
  timeout: 30000,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(config => {
  if (typeof window !== 'undefined' && USE_API_PROXY) {
    config.baseURL = '/api/v1';
  }
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token && !isOtpSkipToken(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  r => r,
  err => {
    const reqUrl = String(err?.config?.url || '');
    const isAuthAttempt = /\/auth\/(login|verify-otp|resend-otp|forgot-password|reset-password)/.test(reqUrl);
    const skipOtpSession =
      typeof window !== 'undefined' && isOtpSkipToken(window.localStorage.getItem(ACCESS_TOKEN_KEY));
    if (err?.response?.status === 401 && typeof window !== 'undefined' && !isAuthAttempt && !skipOtpSession) {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
      clearCarschekSessionCookies();
      const path = window.location.pathname;
      const onAuth =
        path.startsWith('/authentication-screen') ||
        path.startsWith('/login') ||
        path.startsWith('/auth/');
      if (!onAuth) {
        window.location.assign('/authentication-screen');
      }
    }
    const data = err?.response?.data;
    const fallback = typeof err?.message === 'string' ? err.message : 'Request failed';
    const msg = toErrorMessage(data, fallback);
    return Promise.reject(new ApiError(typeof msg === 'string' ? msg : JSON.stringify(msg), err?.response?.status, data));
  }
);

/** Typed helper — swap implementation when moving off mocks. */
export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const { data } = await apiClient.request<T>(config);
  return data;
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
}
