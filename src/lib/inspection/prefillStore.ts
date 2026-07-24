const PREFILL_KEY = 'carschek-inspection-prefill';

export function storeInspectionPrefill(jobId: string, prefill: Record<string, string | null | undefined>): void {
  if (typeof window === 'undefined') return;
  try {
    const all = JSON.parse(sessionStorage.getItem(PREFILL_KEY) || '{}') as Record<string, Record<string, string>>;
    const clean: Record<string, string> = {};
    for (const [k, v] of Object.entries(prefill)) {
      if (v != null && String(v) !== '') clean[k] = String(v);
    }
    all[jobId] = clean;
    sessionStorage.setItem(PREFILL_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export function loadInspectionPrefill(jobId: string): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const all = JSON.parse(sessionStorage.getItem(PREFILL_KEY) || '{}') as Record<string, Record<string, string>>;
    return all[jobId] ?? {};
  } catch {
    return {};
  }
}

export function isPrefillField(jobId: string, fieldId: string): boolean {
  const prefill = loadInspectionPrefill(jobId);
  return fieldId in prefill;
}
