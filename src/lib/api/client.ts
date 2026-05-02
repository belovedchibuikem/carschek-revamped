/**
 * Central HTTP client — swap `USE_API_MOCK` / `NEXT_PUBLIC_API_BASE_URL` for production.
 * All feature modules should import from here or `src/lib/api/services.ts` (typed resource facades),
 * not ad-hoc axios.
 */
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

/** Set to false when pointing at a real Laravel API. */
export const USE_API_MOCK = process.env.NEXT_PUBLIC_USE_API_MOCK !== 'false';

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'https://admin.carschek.com/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('carschek-access-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  r => r,
  err => {
    const msg = err?.response?.data?.message || err?.message || 'Request failed';
    return Promise.reject(new Error(typeof msg === 'string' ? msg : JSON.stringify(msg)));
  }
);

/** Typed helper — swap implementation when moving off mocks. */
export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const { data } = await apiClient.request<T>(config);
  return data;
}
