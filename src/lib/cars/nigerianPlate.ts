/**
 * Nigerian licence plate validation (common formats).
 * Accepts: ABC123XY, ABC-123-XY, LSD260JE (compact legacy), with optional spaces.
 */
export function normalizePlateInput(raw: string): string {
  return raw.replace(/[\s-]+/g, '').toUpperCase();
}

/** Returns true if plate matches a plausible Nigerian plate pattern. */
export function isValidNigerianPlate(raw: string): boolean {
  const s = normalizePlateInput(raw);
  if (s.length < 6 || s.length > 10) return false;
  // Standard: ABC + 123 + XY
  if (/^[A-Z]{3}\d{3}[A-Z]{2}$/.test(s)) return true;
  // Regional / compact variants (e.g. EN-654-EN → EN654EN)
  if (/^[A-Z]{2,3}\d{2,3}[A-Z]{2}$/.test(s) && /\d{3}/.test(s)) return true;
  return false;
}

export function nigerianPlateHint(raw: string): string | null {
  if (!raw.trim()) return null;
  return isValidNigerianPlate(raw) ? null : 'Use Nigerian format (e.g. LND-234-KJ or ABC123XY)';
}
