'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { db } from '@/lib/db/schema';

export type ChecklistDefectEntry = { severity: string; note: string };

export type ChecklistPersistPayload = {
  results: Record<string, string | null>;
  defects: Record<string, ChecklistDefectEntry>;
  expandedDefect: string | null;
};

/** Read a stored defect note whether the payload used `{ note }` objects or legacy plain strings. */
export function defectEntryNote(v: unknown): string {
  if (typeof v === 'string') return v;
  if (v && typeof v === 'object' && 'note' in v) {
    const n = (v as { note?: string }).note;
    return typeof n === 'string' ? n : '';
  }
  return '';
}

const DEBOUNCE_MS = 500;

export function checklistOrderSectionKey(orderId: string, sectionId: string) {
  return `${orderId}::${sectionId}`;
}

export async function loadChecklistState(orderId: string, sectionId: string): Promise<ChecklistPersistPayload | null> {
  if (!db) return null;
  const k = checklistOrderSectionKey(orderId, sectionId);
  const row = await db.checklistStates.where('orderSectionKey').equals(k).first();
  if (!row?.payload) return null;
  try {
    return JSON.parse(row.payload) as ChecklistPersistPayload;
  } catch {
    return null;
  }
}

export async function saveChecklistState(orderId: string, sectionId: string, payload: ChecklistPersistPayload): Promise<void> {
  if (!db) return;
  const now = Date.now();
  const orderSectionKey = checklistOrderSectionKey(orderId, sectionId);
  await db.checklistStates.put({
    orderSectionKey,
    orderId,
    sectionId,
    payload: JSON.stringify(payload),
    updatedAt: now,
  });
}

/** Debounced Dexie save + status for UI. */
export function useInspectionChecklistPersistence(orderId: string, sectionId: string) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(
    async (payload: ChecklistPersistPayload) => {
      setSaveStatus('saving');
      await saveChecklistState(orderId, sectionId, payload);
      setSaveStatus('saved');
      setLastSavedAt(Date.now());
      window.setTimeout(() => setSaveStatus('idle'), 1500);
    },
    [orderId, sectionId]
  );

  const scheduleSave = useCallback(
    (payload: ChecklistPersistPayload) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        void flush(payload);
      }, DEBOUNCE_MS);
    },
    [flush]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { saveStatus, scheduleSave, flush, lastSavedAt };
}

/** Resolve a form field value from checklist payload (`defects.form_*` or legacy `results`). */
export function readChecklistFormValue(
  payload: ChecklistPersistPayload | null | undefined,
  fieldId: string
): string {
  if (!payload) return '';
  const fromDefect = defectEntryNote(payload.defects?.[`form_${fieldId}`]).trim();
  if (fromDefect) return fromDefect;
  const fromResults = payload.results?.[fieldId];
  if (typeof fromResults === 'string' && fromResults.trim()) return fromResults.trim();
  return '';
}

export async function enqueueInspectionSectionSync(orderId: string, sectionId: string, payload: ChecklistPersistPayload): Promise<void> {
  if (!db) return;
  await db.syncQueue.add({
    type: 'inspection-section-complete',
    entityType: 'sectionComplete',
    entityId: `${orderId}-${sectionId}`,
    payload: JSON.stringify({ orderId, sectionId, ...payload }),
    attempts: 0,
    createdAt: Date.now(),
  });
}
