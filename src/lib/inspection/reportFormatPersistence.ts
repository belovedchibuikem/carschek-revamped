'use client';

import { db } from '@/lib/db/schema';
import type { ReportVariant } from '@/lib/inspection/reportTypes';

const FORM = 'inspection_report_format';

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

export async function persistReportFormatChoice(inspectionId: string, variant: ReportVariant): Promise<void> {
  await upsertDraft(FORM, inspectionId, JSON.stringify({ variant, updatedAt: Date.now() }));
}

export async function loadReportFormatChoice(inspectionId: string): Promise<ReportVariant | null> {
  if (!db) return null;
  const row = await db.drafts.where('formName').equals(FORM).filter(d => d.userId === inspectionId).first();
  if (!row?.data) return null;
  try {
    const p = JSON.parse(row.data) as { variant?: ReportVariant };
    return p.variant === 'modern' || p.variant === 'classic' ? p.variant : null;
  } catch {
    return null;
  }
}
