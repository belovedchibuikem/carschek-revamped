/**
 * Central HTTP client — swap `USE_API_MOCK` / `NEXT_PUBLIC_API_BASE_URL` for production.
 * All feature modules should import from here or `src/lib/api/services.ts` (typed resource facades),
 * not ad-hoc axios.
 */
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { clearCarschekSessionCookies } from '@/lib/auth/session';

/** Set to false when pointing at a real Laravel API. */
export const USE_API_MOCK = process.env.NEXT_PUBLIC_USE_API_MOCK !== 'false';

export const ACCESS_TOKEN_KEY = 'carschek-access-token';

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'https://api.yourdomain.com/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  r => r,
  err => {
    if (err?.response?.status === 401 && typeof window !== 'undefined') {
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
    const msg = err?.response?.data?.message || err?.message || 'Request failed';
    return Promise.reject(new Error(typeof msg === 'string' ? msg : JSON.stringify(msg)));
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
