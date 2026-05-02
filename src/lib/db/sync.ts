import { db } from '@/lib/db/schema';
import { processSyncQueue as runProcessSyncQueue, SYNC_MAX_ATTEMPTS, type ProcessSyncResult } from '@/lib/sync/backgroundSync';

let intervalId: ReturnType<typeof setInterval> | null = null;

export type { ProcessSyncResult };

/** @deprecated Import from `@/lib/sync/backgroundSync` */
export const processSyncQueue = runProcessSyncQueue;

export function startSyncInterval(): void {
  if (typeof window === 'undefined' || intervalId) return;
  intervalId = setInterval(() => {
    if (navigator.onLine) void runProcessSyncQueue();
  }, 30000);
}

export function stopSyncInterval(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

/** Pending rows in Dexie (for header / sync UI). Returns 0 when DB unavailable. */
export async function getSyncQueuePendingCount(): Promise<number> {
  if (!db) return 0;
  const rows = await db.syncQueue.toArray();
  return rows.filter(r => !r.synced && (r.attempts ?? 0) < SYNC_MAX_ATTEMPTS).length;
}
