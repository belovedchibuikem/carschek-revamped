'use client';

import { db } from '@/lib/db/schema';
import { startInspectionSessionDexie } from '@/lib/inspection/sessionDexie';

const INSPECTOR_FALLBACK = 'INS-001';

/** Order-level damage album (overview → Damage Photos hub). */
export const DAMAGE_PHOTOS_ORDER_SECTION = 'order';

export function buildOrderDamageItemKey(damageName: string): string {
  const n = damageName.trim() || 'Damage';
  return `hub:${encodeURIComponent(n)}:${Date.now()}`;
}

export function parseOrderDamageName(itemKey: string): string {
  if (!itemKey.startsWith('hub:')) return 'Damage';
  const rest = itemKey.slice(4);
  const idx = rest.lastIndexOf(':');
  if (idx <= 0) return 'Damage';
  try {
    return decodeURIComponent(rest.slice(0, idx));
  } catch {
    return 'Damage';
  }
}

export async function persistDamagePhotoBlob(
  orderId: string,
  sectionId: string,
  itemKey: string,
  blob: ArrayBuffer,
  meta?: { mimeType?: string; sizeKb?: number; comment?: string }
): Promise<void> {
  if (!db) return;
  let row = await db.inspections.where('orderId').equals(orderId).first();
  if (!row?.id) {
    await startInspectionSessionDexie(orderId, INSPECTOR_FALLBACK);
    row = await db.inspections.where('orderId').equals(orderId).first();
  }
  if (!row?.id) return;

  await db.damagePhotos.add({
    inspectionId: row.id,
    orderId,
    sectionId,
    itemKey,
    blob,
    mimeType: meta?.mimeType ?? 'image/jpeg',
    sizeKb: meta?.sizeKb,
    comment: meta?.comment,
    synced: false,
    capturedAt: Date.now(),
  });
}

export async function deleteDamagePhoto(id: number): Promise<void> {
  if (!db) return;
  await db.damagePhotos.delete(id);
}

export type DamagePhotoWithUrl = {
  id: number;
  url: string;
  capturedAt?: number;
};

export async function loadDamagePhotosForItem(
  orderId: string,
  sectionId: string,
  itemKey: string
): Promise<{ photos: DamagePhotoWithUrl[]; revoke: () => void }> {
  const created: string[] = [];
  if (!db) {
    return {
      photos: [],
      revoke: () => {
        created.forEach(u => URL.revokeObjectURL(u));
      },
    };
  }

  const insp = await db.inspections.where('orderId').equals(orderId).first();
  if (!insp?.id) {
    return {
      photos: [],
      revoke: () => {
        created.forEach(u => URL.revokeObjectURL(u));
      },
    };
  }

  const rows = await db.damagePhotos
    .filter(p => p.inspectionId === insp.id && p.sectionId === sectionId && p.itemKey === itemKey)
    .toArray();

  const photos: DamagePhotoWithUrl[] = [];
  for (const r of rows) {
    if (!r.id || !r.blob) continue;
    try {
      const url = URL.createObjectURL(new Blob([r.blob], { type: r.mimeType ?? 'image/jpeg' }));
      created.push(url);
      photos.push({ id: r.id, url, capturedAt: r.capturedAt });
    } catch {
      /* skip */
    }
  }
  photos.sort((a, b) => (a.capturedAt ?? 0) - (b.capturedAt ?? 0));

  return {
    photos,
    revoke: () => {
      created.forEach(u => URL.revokeObjectURL(u));
    },
  };
}

/** Object URLs for report preview (revoke not called — short-lived sessions). */
export async function loadDamagePhotoObjectUrlsForItem(
  orderId: string,
  sectionId: string,
  itemKey: string
): Promise<string[]> {
  const { photos } = await loadDamagePhotosForItem(orderId, sectionId, itemKey);
  return photos.map(p => p.url);
}

export type OrderDamagePhotoRow = DamagePhotoWithUrl & { label: string; comment?: string };

export async function loadDamagePhotosForOrder(orderId: string): Promise<{
  photos: OrderDamagePhotoRow[];
  revoke: () => void;
}> {
  const created: string[] = [];
  if (!db) {
    return {
      photos: [],
      revoke: () => {
        created.forEach(u => URL.revokeObjectURL(u));
      },
    };
  }

  const insp = await db.inspections.where('orderId').equals(orderId).first();
  if (!insp?.id) {
    return {
      photos: [],
      revoke: () => {
        created.forEach(u => URL.revokeObjectURL(u));
      },
    };
  }

  const rows = await db.damagePhotos.filter(p => p.inspectionId === insp.id && p.sectionId === DAMAGE_PHOTOS_ORDER_SECTION).toArray();

  const photos: OrderDamagePhotoRow[] = [];
  for (const r of rows) {
    if (!r.id || !r.blob) continue;
    try {
      const url = URL.createObjectURL(new Blob([r.blob], { type: r.mimeType ?? 'image/jpeg' }));
      created.push(url);
      photos.push({
        id: r.id,
        url,
        capturedAt: r.capturedAt,
        label: parseOrderDamageName(r.itemKey),
        comment: r.comment,
      });
    } catch {
      /* skip */
    }
  }
  photos.sort((a, b) => (a.capturedAt ?? 0) - (b.capturedAt ?? 0));

  return {
    photos,
    revoke: () => {
      created.forEach(u => URL.revokeObjectURL(u));
    },
  };
}

export async function persistOrderHubDamagePhoto(
  orderId: string,
  damageName: string,
  blob: ArrayBuffer,
  meta?: { mimeType?: string; sizeKb?: number; comment?: string }
): Promise<void> {
  const itemKey = buildOrderDamageItemKey(damageName);
  return persistDamagePhotoBlob(orderId, DAMAGE_PHOTOS_ORDER_SECTION, itemKey, blob, meta);
}
