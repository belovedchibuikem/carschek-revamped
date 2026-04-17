import { apiClient, USE_API_MOCK } from '@/lib/api/client';
import { db, type SyncQueueRow } from '@/lib/db/schema';

export const SYNC_MAX_ATTEMPTS = 5;

export type ProcessSyncResult = {
  processed: number;
  failed: number;
  skipped: number;
  errors: string[];
};

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isQueueRowSynced(row: SyncQueueRow): boolean {
  return row.synced === true;
}

function inferEntityType(row: SyncQueueRow): string {
  if (row.entityType) return row.entityType;
  const t = row.type;
  if (t === 'inspection-section-complete') return 'sectionComplete';
  if (t === 'inspection-submit-qa') return 'inspectionSubmit';
  if (t === 'inspectionSubmit') return 'inspectionSubmit';
  if (t === 'qa-report-approve') return 'qa-report-approve';
  if (t.includes('vehicle') && t.includes('photo')) return 'vehiclePhoto';
  if (t.includes('damage') && t.includes('photo')) return 'damagePhoto';
  return t;
}

async function mockOrPresigned(key: string): Promise<{ uploadUrl: string; publicUrl: string }> {
  if (USE_API_MOCK) {
    return {
      uploadUrl: `https://mock-upload.carschek.local/${encodeURIComponent(key)}`,
      publicUrl: `https://cdn.mock.carschek/${encodeURIComponent(key)}`,
    };
  }
  const { data } = await apiClient.get<{ uploadUrl: string; publicUrl: string }>('/storage/presigned', {
    params: { key },
  });
  return data;
}

async function putBlob(uploadUrl: string, blob: Blob): Promise<void> {
  if (USE_API_MOCK) {
    await sleep(80);
    return;
  }
  const res = await fetch(uploadUrl, { method: 'PUT', body: blob, headers: { 'Content-Type': blob.type || 'application/octet-stream' } });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
}

async function processQueueItem(row: SyncQueueRow): Promise<void> {
  if (!db) return;
  const kind = inferEntityType(row);
  let payload: Record<string, unknown> = {};
  try {
    payload = row.payload ? (JSON.parse(row.payload) as Record<string, unknown>) : {};
  } catch {
    payload = {};
  }

  switch (kind) {
    case 'vehiclePhoto': {
      const id = Number(row.entityId);
      const photo = await db.vehiclePhotos.get(id);
      if (!photo?.blob) return;
      const key = `vehicle-photos/${id}.jpg`;
      const { uploadUrl, publicUrl } = await mockOrPresigned(key);
      const blob = new Blob([photo.blob], { type: photo.mimeType || 'image/jpeg' });
      await putBlob(uploadUrl, blob);
      await db.vehiclePhotos.update(id, { synced: true, uploadedUrl: publicUrl });
      break;
    }
    case 'damagePhoto': {
      const id = Number(row.entityId);
      const photo = await db.damagePhotos.get(id);
      if (!photo?.blob) return;
      const key = `damage-photos/${id}.jpg`;
      const { uploadUrl, publicUrl } = await mockOrPresigned(key);
      const blob = new Blob([photo.blob], { type: photo.mimeType || 'image/jpeg' });
      await putBlob(uploadUrl, blob);
      await db.damagePhotos.update(id, { synced: true, uploadedUrl: publicUrl });
      break;
    }
    case 'inspectionItem': {
      const inspectionId = String(payload.inspectionId ?? '');
      const itemKey = String(payload.itemKey ?? '');
      if (!inspectionId || !itemKey) throw new Error('inspectionItem payload missing inspectionId/itemKey');
      if (!USE_API_MOCK) {
        await apiClient.patch(`/inspections/${inspectionId}/items/${encodeURIComponent(itemKey)}`, payload);
      } else {
        await sleep(60);
      }
      const itemPk = Number(row.entityId);
      if (!Number.isNaN(itemPk)) await db.items.update(itemPk, { synced: true });
      break;
    }
    case 'sectionComplete':
    case 'inspection-section-complete': {
      const inspectionId = String(payload.orderId ?? payload.inspectionId ?? '');
      const sectionKey = String(payload.sectionId ?? payload.sectionKey ?? '');
      if (!inspectionId || !sectionKey) throw new Error('sectionComplete payload missing orderId/sectionId');
      if (!USE_API_MOCK) {
        await apiClient.post(`/inspections/${inspectionId}/sections/${encodeURIComponent(sectionKey)}/complete`, payload);
      } else {
        await sleep(60);
      }
      const secPk = Number(row.entityId);
      if (Number.isFinite(secPk)) await db.sections.update(secPk, { synced: true });
      break;
    }
    case 'inspectionSubmit':
    case 'inspection-submit-qa': {
      const inspectionId = String(payload.inspectionId ?? payload.jobId ?? row.entityId);
      if (!inspectionId) throw new Error('inspectionSubmit missing id');
      if (!USE_API_MOCK) {
        await apiClient.post(`/inspections/${inspectionId}/submit`, payload);
      } else {
        await sleep(100);
      }
      const inspPk = Number(row.entityId);
      if (!Number.isNaN(inspPk)) await db.inspections.update(inspPk, { status: 'submitted' });
      break;
    }
    case 'qa-report-approve':
    case 'qaReportApprove': {
      const reportId = row.entityId;
      if (!USE_API_MOCK) {
        await apiClient.post(`/reports/${encodeURIComponent(reportId)}/qa-approve`, payload);
      } else {
        await sleep(80);
      }
      break;
    }
    default: {
      if (USE_API_MOCK) {
        await sleep(40);
        return;
      }
      throw new Error(`Unknown sync entity: ${kind}`);
    }
  }
}

export type ProcessSyncOptions = {
  onProgress?: (done: number, total: number) => void;
};

/**
 * Drain Dexie sync queue with retries, exponential backoff on failure, and optional progress callbacks.
 */
export async function processSyncQueue(options?: ProcessSyncOptions): Promise<ProcessSyncResult> {
  if (!db) return { processed: 0, failed: 0, skipped: 0, errors: [] };

  const pending = (await db.syncQueue.toArray()).filter(
    q => !isQueueRowSynced(q) && (q.attempts ?? 0) < SYNC_MAX_ATTEMPTS
  );
  pending.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));

  const total = pending.length;
  let processed = 0;
  let failed = 0;
  let skipped = 0;
  const errors: string[] = [];
  let attempted = 0;

  const now = () => Date.now();

  for (const queueItem of pending) {
    const attempts = queueItem.attempts ?? 0;
    const last = queueItem.lastAttempt ?? 0;
    const backoffMs = Math.min(120_000, 1000 * Math.pow(2, attempts));
    if (attempts > 0 && now() - last < backoffMs) {
      skipped += 1;
      continue;
    }

    try {
      await processQueueItem(queueItem);
      await db.syncQueue.update(queueItem.id!, {
        synced: true,
        lastAttempt: now(),
        error: undefined,
      });
      processed += 1;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const nextAttempts = attempts + 1;
      await db.syncQueue.update(queueItem.id!, {
        attempts: nextAttempts,
        lastAttempt: now(),
        error: msg,
      });
      failed += 1;
      errors.push(`${inferEntityType(queueItem)}:${queueItem.entityId} — ${msg}`);
      await sleep(Math.min(30_000, Math.pow(2, attempts) * 1000));
    }
    attempted += 1;
    options?.onProgress?.(attempted, total);
  }

  return { processed, failed, skipped, errors };
}
