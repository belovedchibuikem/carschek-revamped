/** Mock persistence for scanner ingest when USE_API_MOCK. */

export type ScannerIngestLocalRow = {
  id: string;
  deviceId?: string | null;
  vin?: string | null;
  source?: string;
  schemaVersion?: string;
  status: string;
  capturedAt?: string | null;
  receivedAt: string;
};

const STORAGE_KEY = 'carschek-scanner-ingest';

function read(): ScannerIngestLocalRow[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ScannerIngestLocalRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(rows: ScannerIngestLocalRow[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows.slice(0, 100)));
}

export function listLocalScannerIngest(limit = 50): ScannerIngestLocalRow[] {
  return read().slice(0, limit);
}

export function addLocalScannerIngest(body: Record<string, unknown>): ScannerIngestLocalRow {
  const payload = (body.payload && typeof body.payload === 'object'
    ? (body.payload as Record<string, unknown>)
    : body) as Record<string, unknown>;
  const row: ScannerIngestLocalRow = {
    id: `SCN-MOCK-${Date.now()}`,
    deviceId: (body.deviceId as string) || (payload.deviceId as string) || null,
    vin: (body.vin as string) || (payload.vin as string) || null,
    source: String(body.source ?? 'local_server'),
    schemaVersion: String(body.schemaVersion ?? payload.schemaVersion ?? '1.0'),
    status: 'received',
    capturedAt: (body.capturedAt as string) || (payload.capturedAt as string) || null,
    receivedAt: new Date().toISOString(),
  };
  write([row, ...read()]);
  return row;
}
