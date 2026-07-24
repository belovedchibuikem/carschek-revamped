/** Client-side seed + mock persistence for vehicle valuations when USE_API_MOCK. */

export type ValuationRecord = {
  id: string;
  date: string;
  clientName: string;
  vehicleDescription: string;
  marketValue: number;
  fsv: number;
  conditionValue: number;
  notes: string;
  status: 'draft' | 'final';
  createdAt: string;
};

const STORAGE_KEY = 'carschek-vehicle-valuations';

export const VALUATION_SEED: ValuationRecord[] = [
  {
    id: 'VAL-001',
    date: 'April 20, 2026',
    clientName: 'KOINS BANK LTD',
    vehicleDescription: 'TOYOTA CAMRY 2004 4T1BE32K34U365910 SGM632AE',
    marketValue: 4000000,
    fsv: 2800000,
    conditionValue: 2000000,
    notes: '',
    status: 'final',
    createdAt: '2026-04-20',
  },
  {
    id: 'VAL-002',
    date: 'April 18, 2026',
    clientName: 'FIRST BANK PLC',
    vehicleDescription: 'HONDA ACCORD 2018 1HGCV1F30JA012345 LND789KJ',
    marketValue: 8500000,
    fsv: 6000000,
    conditionValue: 5200000,
    notes: 'Minor scratches on rear bumper',
    status: 'final',
    createdAt: '2026-04-18',
  },
];

function readStore(): ValuationRecord[] {
  if (typeof window === 'undefined') return [...VALUATION_SEED];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(VALUATION_SEED));
      return [...VALUATION_SEED];
    }
    const parsed = JSON.parse(raw) as ValuationRecord[];
    return Array.isArray(parsed) ? parsed : [...VALUATION_SEED];
  } catch {
    return [...VALUATION_SEED];
  }
}

function writeStore(rows: ValuationRecord[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export function listLocalValuations(): ValuationRecord[] {
  return readStore().sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
}

export function getLocalValuation(id: string): ValuationRecord | undefined {
  return readStore().find(v => v.id === id);
}

export function upsertLocalValuation(row: ValuationRecord): ValuationRecord {
  const all = readStore();
  const idx = all.findIndex(v => v.id === row.id);
  if (idx >= 0) all[idx] = row;
  else all.unshift(row);
  writeStore(all);
  return row;
}

export function deleteLocalValuation(id: string): void {
  writeStore(readStore().filter(v => v.id !== id));
}

export function nextLocalValuationId(): string {
  const all = readStore();
  let max = 0;
  for (const v of all) {
    const m = /^VAL-(\d+)$/i.exec(v.id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `VAL-${String(max + 1).padStart(3, '0')}`;
}
