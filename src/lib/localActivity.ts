/** Client-only audit rows (migration reconcile, etc.) until backend `activity_logs` exists. */

export type LocalActivityRow = {
  id: string;
  actor: string;
  action: string;
  target: string;
  targetType?: string;
  timestamp: string;
  ip: string;
  role: string;
  source: 'migration-reconcile';
};

const RECON_KEY = 'carschek-reconciliation-events-v1';

export function appendReconciliationEvent(row: Omit<LocalActivityRow, 'source'>): void {
  if (typeof window === 'undefined') return;
  try {
    const prev = JSON.parse(localStorage.getItem(RECON_KEY) || '[]') as LocalActivityRow[];
    const entry: LocalActivityRow = { ...row, source: 'migration-reconcile' };
    const next: LocalActivityRow[] = [entry, ...prev].slice(0, 40);
    localStorage.setItem(RECON_KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
}

export function readReconciliationEvents(): LocalActivityRow[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECON_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LocalActivityRow[];
  } catch {
    return [];
  }
}
