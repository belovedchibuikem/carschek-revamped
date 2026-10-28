/**
 * Carschek Scanner Data Contract v1 — TypeScript mirror of docs/scanner-data-contract.v1.json
 * Use this when integrating China / local-server scanner dumps.
 */

export const SCANNER_CONTRACT_VERSION = '1.0' as const;

export type ScannerDtc = {
  code: string;
  status?: 'confirmed' | 'pending' | 'permanent' | string;
  description?: string;
};

export type ScannerPidReading = {
  pid: string;
  name?: string;
  value: number | string;
  unit?: string;
};

export type ScannerIngestPayload = {
  schemaVersion: typeof SCANNER_CONTRACT_VERSION | string;
  deviceId: string;
  vin?: string;
  capturedAt: string;
  firmwareVersion?: string;
  ecuList?: string[];
  dtcs?: ScannerDtc[];
  freezeFrame?: Record<string, unknown>;
  livePids?: ScannerPidReading[];
  raw?: Record<string, unknown>;
};

export function isScannerPayload(value: unknown): value is ScannerIngestPayload {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.deviceId === 'string' && typeof v.capturedAt === 'string';
}
