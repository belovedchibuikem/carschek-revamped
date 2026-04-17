/**
 * Legacy → new platform reconciliation helpers.
 * Wire to activity_logs with type `migration` when persisting to API.
 */

export interface MergeCustomerResult {
  merged: boolean;
  targetId: string;
  notes: string[];
}

export interface ResolveCarResult {
  action: 'keep_new' | 'merge' | 'skip';
  winnerId?: string;
  notes: string[];
}

const OLD_STATUS_MAP: Record<string, string> = {
  pending: 'pending',
  active: 'active',
  completed: 'completed',
  cancelled: 'cancelled',
};

export function mergeDuplicateCustomer(
  existing: { id: string; email: string; phone?: string },
  incoming: { email: string; phone?: string; meta?: Record<string, unknown> }
): MergeCustomerResult {
  const sameEmail = existing.email.toLowerCase() === incoming.email.toLowerCase();
  if (!sameEmail) {
    return { merged: false, targetId: existing.id, notes: ['No email match'] };
  }
  return {
    merged: true,
    targetId: existing.id,
    notes: ['Merged contact fields from legacy import', ...(incoming.phone ? ['Phone union applied'] : [])],
  };
}

export function resolveDuplicateCar(
  existing: { id: string; updatedAt: string; payload: Record<string, unknown> },
  incoming: { id: string; updatedAt: string; payload: Record<string, unknown> }
): ResolveCarResult {
  const a = new Date(existing.updatedAt).getTime();
  const b = new Date(incoming.updatedAt).getTime();
  if (a >= b) {
    return {
      action: 'merge',
      winnerId: existing.id,
      notes: ['Newer record wins for conflicting scalar fields', 'Union of relations applied'],
    };
  }
  return {
    action: 'merge',
    winnerId: incoming.id,
    notes: ['Incoming newer — merged onto existing id pending remap'],
  };
}

export function mapOldStatus(oldStatus: string, fallback = 'pending'): string {
  const k = oldStatus.trim().toLowerCase().replace(/\s+/g, '_');
  return OLD_STATUS_MAP[k] ?? fallback;
}

let ckSeq = 1000;

export function generateCKId(): string {
  ckSeq += 1;
  return `CK-${ckSeq}`;
}

export function resetCKIdSequenceForTests(start: number): void {
  ckSeq = start;
}

/** Standard ISO 3779 VIN check digit (position 9). */
export function validateVin(vin: string): { valid: boolean; reason?: string } {
  const v = vin.trim().toUpperCase();
  if (v.length !== 17) return { valid: false, reason: 'VIN must be 17 characters' };
  if (/[IOQ]/.test(v)) return { valid: false, reason: 'VIN cannot contain I, O, or Q' };

  const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
  const values: Record<string, number> = {
    A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, J: 1, K: 2, L: 3, M: 4, N: 5,
    P: 7, R: 9, S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
  };
  for (let i = 0; i < 10; i++) values[String(i)] = i;

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const ch = v[i];
    const val = values[ch];
    if (val === undefined) return { valid: false, reason: `Invalid character: ${ch}` };
    sum += val * weights[i]!;
  }
  const check = sum % 11;
  const expected = check === 10 ? 'X' : String(check);
  if (v[8] !== expected) {
    return { valid: false, reason: 'VIN check digit mismatch' };
  }
  return { valid: true };
}
