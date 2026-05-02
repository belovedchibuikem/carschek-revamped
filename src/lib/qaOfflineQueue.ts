import { db } from '@/lib/db/schema';

/** Queue QA approval when offline; `processSyncQueue` clears rows in mock mode. */
export async function enqueueQaReportApprove(reportId: string, payload: unknown): Promise<void> {
  if (!db) return;
  await db.syncQueue.add({
    type: 'qa-report-approve',
    entityType: 'qa-report-approve',
    entityId: reportId,
    payload: JSON.stringify(payload),
    attempts: 0,
    createdAt: Date.now(),
  });
}
