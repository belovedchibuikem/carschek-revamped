/**
 * Phase 1 feature flags — all default ON for assisted UX.
 * Set NEXT_PUBLIC_PHASE1_*=false to disable a slice without removing code.
 */

function flag(name: string, defaultOn = true): boolean {
  const raw = (process.env[name] ?? (defaultOn ? 'true' : 'false')).trim().toLowerCase();
  return raw !== 'false' && raw !== '0' && raw !== 'off';
}

/** Customer-facing observed risks block on inspection reports. */
export const PHASE1_OBSERVED_RISKS = flag('NEXT_PUBLIC_PHASE1_OBSERVED_RISKS', true);

/** Valuation price suggestions (never auto-overwrite without user click). */
export const PHASE1_VALUATION_ASSIST = flag('NEXT_PUBLIC_PHASE1_VALUATION_ASSIST', true);

/** Photo vision assist endpoint (still falls back to stub if no provider key). */
export const PHASE1_VISION_ASSIST = flag('NEXT_PUBLIC_PHASE1_VISION_ASSIST', true);

export const PHASE1_DISCLAIMER =
  'Carschek assisted insight — based on inspection findings and heuristics. Not a guarantee of future faults or market price. A qualified valuator / buyer must confirm.';
