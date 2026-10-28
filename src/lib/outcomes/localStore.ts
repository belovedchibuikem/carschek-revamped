/** Mock persistence for vehicle outcome events (AI training labels) when USE_API_MOCK. */

export type OutcomeEventRecord = {
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

const STORAGE_KEY = 'carschek-vehicle-outcomes';

export const OUTCOME_SEED: OutcomeEventRecord[] = [
  {
    id: 'OUT-001',
    vin: '4T1BE32K34U365910',
    inspectionId: 'INS-RPT-501',
    eventType: 'repair',
    systemArea: 'suspension',
    severity: 'major',
    daysAfterInspection: 45,
    occurredOn: '2026-06-04',
    description: 'Front lower arm bushings replaced after noise complaint',
    costAmount: 185000,
    source: 'manual',
    trainingConsent: true,
    createdAt: '2026-06-04',
  },
];

function readStore(): OutcomeEventRecord[] {
  if (typeof window === 'undefined') return [...OUTCOME_SEED];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(OUTCOME_SEED));
      return [...OUTCOME_SEED];
    }
    const parsed = JSON.parse(raw) as OutcomeEventRecord[];
    return Array.isArray(parsed) ? parsed : [...OUTCOME_SEED];
  } catch {
    return [...OUTCOME_SEED];
  }
}

function writeStore(rows: OutcomeEventRecord[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export function listLocalOutcomes(): OutcomeEventRecord[] {
  return readStore().sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
}

export function getLocalOutcome(id: string): OutcomeEventRecord | undefined {
  return readStore().find(o => o.id === id);
}

export function upsertLocalOutcome(row: OutcomeEventRecord): OutcomeEventRecord {
  const all = readStore();
  const idx = all.findIndex(o => o.id === row.id);
  if (idx >= 0) all[idx] = row;
  else all.unshift(row);
  writeStore(all);
  return row;
}

export function deleteLocalOutcome(id: string): void {
  writeStore(readStore().filter(o => o.id !== id));
}

export function nextLocalOutcomeId(): string {
  const all = readStore();
  let max = 0;
  for (const o of all) {
    const m = /^OUT-(\d+)$/i.exec(o.id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `OUT-${String(max + 1).padStart(3, '0')}`;
}
