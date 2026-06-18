/** Canonical Carschek logo served from `/public`. */
export const CARSCHEK_LOGO_PATH = '/assets/images/carschek-logo.png';

/** @deprecated Alias kept for existing imports — same asset as {@link CARSCHEK_LOGO_PATH}. */
export const CARSCHEK_APP_LOGO_PATH = '/assets/images/app_logo.png';

export const CARSCHEK_LOGO_ALT = 'Carschek';

/** Absolute logo URL for print windows / PDF capture (browser only). */
export function carschekLogoAbsoluteUrl(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${CARSCHEK_LOGO_PATH}`;
  }
  return CARSCHEK_LOGO_PATH;
}
