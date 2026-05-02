'use client';

import { db } from '@/lib/db/schema';

const TIMER_FORM = 'inspection_session_timer';
const SIG_FORM = 'inspection_signature';
const OVERVIEW_FORM = 'inspection_overview_sections';

async function upsertDraft(formName: string, userId: string, data: string): Promise<void> {
  if (!db) return;
  const existing = await db.drafts.where('formName').equals(formName).filter(d => d.userId === userId).first();
  const savedAt = Date.now();
  if (existing?.id != null) {
    await db.drafts.update(existing.id, { data, savedAt });
  } else {
    await db.drafts.add({ formName, userId, data, savedAt });
  }
}

export async function persistSessionTimerSeconds(orderId: string, seconds: number): Promise<void> {
  await upsertDraft(TIMER_FORM, orderId, JSON.stringify({ seconds, updatedAt: Date.now() }));
}

export async function loadSessionTimerSeconds(orderId: string): Promise<number> {
  if (!db) return 0;
  const row = await db.drafts.where('formName').equals(TIMER_FORM).filter(d => d.userId === orderId).first();
  if (!row?.data) return 0;
  try {
    const p = JSON.parse(row.data) as { seconds?: number };
    return typeof p.seconds === 'number' ? p.seconds : 0;
  } catch {
    return 0;
  }
}

export async function startInspectionSessionDexie(orderId: string, inspectorId: string): Promise<number> {
  if (!db) return 0;
  const now = Date.now();
  const existing = await db.inspections.where('orderId').equals(orderId).first();
  if (existing?.id != null) {
    await db.inspections.update(existing.id, {
      status: 'in-progress',
      startedAt: existing.startedAt ?? now,
    });
    return existing.id;
  }
  return db.inspections.add({
    orderId,
    inspectorId,
    status: 'in-progress',
    startedAt: now,
  });
}

export async function persistSignatureBase64(orderId: string, dataUrl: string): Promise<void> {
  await upsertDraft(SIG_FORM, orderId, JSON.stringify({ dataUrl, savedAt: Date.now() }));
}

export async function loadSignatureBase64(orderId: string): Promise<string | null> {
  if (!db) return null;
  const row = await db.drafts.where('formName').equals(SIG_FORM).filter(d => d.userId === orderId).first();
  if (!row?.data) return null;
  try {
    const p = JSON.parse(row.data) as { dataUrl?: string };
    return p.dataUrl ?? null;
  } catch {
    return null;
  }
}

export type SectionDotStatus = 'not-started' | 'in-progress' | 'complete-pass' | 'complete-fail';

export type OverviewSectionsPayload = Record<string, SectionDotStatus>;

export async function saveOverviewSectionStatus(orderId: string, map: OverviewSectionsPayload): Promise<void> {
  await upsertDraft(OVERVIEW_FORM, orderId, JSON.stringify(map));
}

export async function loadOverviewSectionStatus(orderId: string): Promise<OverviewSectionsPayload | null> {
  if (!db) return null;
  const row = await db.drafts.where('formName').equals(OVERVIEW_FORM).filter(d => d.userId === orderId).first();
  if (!row?.data) return null;
  try {
    return JSON.parse(row.data) as OverviewSectionsPayload;
  } catch {
    return null;
  }
}
