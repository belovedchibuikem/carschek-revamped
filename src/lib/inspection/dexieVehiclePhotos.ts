'use client';

import { db } from '@/lib/db/schema';
import { startInspectionSessionDexie } from '@/lib/inspection/sessionDexie';
import { normalizeVehicleAngleId, type VehicleAngleId } from '@/lib/inspection/vehiclePhotoAngles';

const INSPECTOR_FALLBACK = 'INS-001';

/** Persist a captured vehicle angle to Dexie for offline report/PDF. */
export async function persistVehiclePhotoBlob(
  orderId: string,
  angle: string,
  blob: ArrayBuffer,
  meta?: { mimeType?: string; sizeKb?: number }
): Promise<void> {
  if (!db) return;
  const canonical = normalizeVehicleAngleId(angle);
  let row = await db.inspections.where('orderId').equals(orderId).first();
  if (!row?.id) {
    await startInspectionSessionDexie(orderId, INSPECTOR_FALLBACK);
    row = await db.inspections.where('orderId').equals(orderId).first();
  }
  if (!row?.id) return;

  await db.vehiclePhotos.filter(p => p.inspectionId === row.id && p.angle === canonical).delete();

  await db.vehiclePhotos.add({
    inspectionId: row.id,
    angle: canonical,
    blob,
    compressed: true,
    synced: false,
    mimeType: meta?.mimeType ?? 'image/jpeg',
    sizeKb: meta?.sizeKb,
    capturedAt: Date.now(),
  });
}

export type DexiePhotoMapResult = {
  map: Partial<Record<VehicleAngleId, string>>;
  revoke: () => void;
};

/** Create object URLs for all vehiclePhotos rows for this order (for report preview + PDF). */
export async function loadDexieVehiclePhotoObjectUrls(orderId: string): Promise<DexiePhotoMapResult> {
  const created: string[] = [];
  const map: Partial<Record<VehicleAngleId, string>> = {};

  if (!db) {
    return {
      map,
      revoke: () => {
        created.forEach(u => URL.revokeObjectURL(u));
      },
    };
  }

  const insp = await db.inspections.where('orderId').equals(orderId).first();
  if (!insp?.id) {
    return {
      map,
      revoke: () => {
        created.forEach(u => URL.revokeObjectURL(u));
      },
    };
  }

  const rows = await db.vehiclePhotos.where('inspectionId').equals(insp.id).toArray();
  for (const r of rows) {
    if (!r.blob || !r.angle) continue;
    try {
      const url = URL.createObjectURL(new Blob([r.blob], { type: r.mimeType ?? 'image/jpeg' }));
      created.push(url);
      const id = normalizeVehicleAngleId(r.angle);
      map[id] = url;
    } catch {
      /* skip bad blob */
    }
  }

  return {
    map,
    revoke: () => {
      created.forEach(u => URL.revokeObjectURL(u));
    },
  };
}
