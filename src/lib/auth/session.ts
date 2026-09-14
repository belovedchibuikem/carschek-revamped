/** Client-side session cookies for middleware / role hints (swap for httpOnly cookies when API auth ships). */

const MAX_AGE_SEC = 60 * 60 * 24 * 7;

export function setCarschekSessionCookies(role: string): void {
  if (typeof document === 'undefined') return;
  const base = `path=/; max-age=${MAX_AGE_SEC}; SameSite=Lax`;
  document.cookie = `carschek-auth=1; ${base}`;
  document.cookie = `carschek-role=${encodeURIComponent(role)}; ${base}`;
}

export function clearCarschekSessionCookies(): void {
  if (typeof document === 'undefined') return;
  const base = 'path=/; max-age=0';
  document.cookie = `carschek-auth=; ${base}`;
  document.cookie = `carschek-role=; ${base}`;
}

export function getCarschekRole(): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(/(?:^|; )carschek-role=([^;]*)/);
  return m?.[1] ? decodeURIComponent(m[1]) : null;
}

/** Post-login landing path. Inspectors are kept on the field app. */
export function homePathForRole(role: string): string {
  return role === 'inspector' ? '/inspector/jobs' : '/dashboard';
}
