'use client';

import { INSPECTION_SECTIONS } from '@/lib/mockData';
import { loadChecklistState, defectEntryNote, type ChecklistPersistPayload } from '@/lib/inspectionChecklistPersistence';
import { countToggleItems, getSectionDef } from '@/lib/inspection/inspectionSections';
import { loadDamagePhotosForOrder } from '@/lib/inspection/dexieDamagePhotos';
import { loadDexieVehiclePhotoObjectUrls } from '@/lib/inspection/dexieVehiclePhotos';
import { VEHICLE_PHOTO_SLOTS } from '@/lib/inspection/vehiclePhotoAngles';
import type { SectionDotStatus } from '@/lib/inspection/sessionDexie';
import { isInspectionSubmitted } from '@/lib/inspection/sessionDexie';

export type ChecklistDefectRow = {
  sectionId: string;
  sectionName: string;
  item: string;
  severity: 'Minor' | 'Major' | 'Critical';
  note: string;
};

export type InspectionChecklistMetrics = {
  sectionStatus: Record<string, SectionDotStatus>;
  totalToggleItems: number;
  passCount: number;
  failCount: number;
  naCount: number;
  answeredItems: number;
  itemsDone: number;
  score: number;
  defects: ChecklistDefectRow[];
  sectionsComplete: number;
  sectionsTotal: number;
  sectionsFailed: number;
  minutesRemaining: number;
  vehiclePhotosCaptured: number;
  damagePhotoCount: number;
};

function minutesFromEstimate(label: string): number {
  const m = /(\d+)\s*min/i.exec(label);
  return m ? parseInt(m[1], 10) : 5;
}

function mapToggle(v: string | null | undefined): 'pass' | 'fail' | 'na' | null {
  if (v === 'yes' || v === 'pass') return 'pass';
  if (v === 'no' || v === 'fail') return 'fail';
  if (v === 'na') return 'na';
  return null;
}

function severityFromStored(s: string | undefined): ChecklistDefectRow['severity'] {
  if (s === 'Critical' || s === 'Major' || s === 'Minor') return s;
  return 'Minor';
}

function deriveSectionStatus(
  sectionId: string,
  state: ChecklistPersistPayload | null,
  vehicleCaptured: number,
  damageCount: number,
  submitted: boolean
): SectionDotStatus {
  const def = getSectionDef(sectionId);
  if (!def) return 'not-started';

  if (def.layout === 'photos') {
    if (vehicleCaptured >= VEHICLE_PHOTO_SLOTS.length) return 'complete-pass';
    if (vehicleCaptured > 0) return 'in-progress';
    return 'not-started';
  }
  if (def.layout === 'damages') {
    if (damageCount > 0) return 'complete-pass';
    return 'not-started';
  }
  if (def.layout === 'summary') {
    return submitted ? 'complete-pass' : 'not-started';
  }

  if (!state) return 'not-started';

  const results = state.results ?? {};
  const defects = state.defects ?? {};
  let answered = 0;
  let fails = 0;

  if (def.layout === 'toggle-grid') {
    const items: { id: string }[] = [];
    for (const row of def.toggleRows ?? []) {
      items.push(row.left);
      if (row.right) items.push(row.right);
    }
    for (const item of items) {
      const r = mapToggle(results[item.id]);
      if (r == null) continue;
      answered++;
      if (r === 'fail') fails++;
    }
    const total = items.length;
    if (answered === 0) return 'not-started';
    if (fails > 0) return 'complete-fail';
    if (answered >= total) return 'complete-pass';
    return 'in-progress';
  }

  if (def.layout === 'form') {
    const fields = def.fields ?? [];
    const required = fields.filter(f => f.required);
    for (const field of fields) {
      const v = defectEntryNote(defects[`form_${field.id}`]).trim();
      if (v) answered++;
    }
    if (answered === 0) return 'not-started';
    const reqDone = required.every(f => defectEntryNote(defects[`form_${f.id}`]).trim());
    return reqDone ? 'complete-pass' : 'in-progress';
  }

  if (def.layout === 'comments') {
    const fields = def.commentFields ?? [];
    for (const field of fields) {
      if (defectEntryNote(defects[`comment_${field.id}`]).trim()) answered++;
    }
    if (answered === 0) return 'not-started';
    if (answered >= fields.length) return 'complete-pass';
    return 'in-progress';
  }

  return 'not-started';
}

/** Aggregate Dexie checklist rows into overview/review metrics (replaces heuristics). */
export async function loadInspectionChecklistMetrics(orderId: string): Promise<InspectionChecklistMetrics> {
  const { map: vehicleMap, revoke: revokeV } = await loadDexieVehiclePhotoObjectUrls(orderId);
  const { photos: damagePhotos, revoke: revokeD } = await loadDamagePhotosForOrder(orderId);
  const vehiclePhotosCaptured = VEHICLE_PHOTO_SLOTS.filter(s => Boolean(vehicleMap[s.id])).length;
  const damagePhotoCount = damagePhotos.length;
  revokeV();
  revokeD();

  const submitted = await isInspectionSubmitted(orderId);

  const sectionStatus: Record<string, SectionDotStatus> = {};
  let passCount = 0;
  let failCount = 0;
  let naCount = 0;
  let answeredItems = 0;
  let totalToggleItems = 0;
  const defects: ChecklistDefectRow[] = [];

  for (const sec of INSPECTION_SECTIONS) {
    const state = await loadChecklistState(orderId, sec.id);
    sectionStatus[sec.id] = deriveSectionStatus(sec.id, state, vehiclePhotosCaptured, damagePhotoCount, submitted);

    const def = getSectionDef(sec.id);
    if (!def || def.layout !== 'toggle-grid' || !state) continue;

    const results = state.results ?? {};
    const storedDefects = state.defects ?? {};
    const items: { id: string; label: string }[] = [];
    for (const row of def.toggleRows ?? []) {
      items.push(row.left);
      if (row.right) items.push(row.right);
    }
    totalToggleItems += items.length;

    for (const item of items) {
      const r = mapToggle(results[item.id]);
      if (r == null) continue;
      answeredItems++;
      if (r === 'pass') passCount++;
      else if (r === 'fail') {
        failCount++;
        const d = storedDefects[item.id];
        defects.push({
          sectionId: sec.id,
          sectionName: sec.name,
          item: item.label,
          severity: severityFromStored(d?.severity),
          note: d?.note ?? '',
        });
      } else naCount++;
    }
  }

  const sectionsTotal = INSPECTION_SECTIONS.length;
  const sectionsComplete = INSPECTION_SECTIONS.filter(s => {
    const st = sectionStatus[s.id];
    return st === 'complete-pass' || st === 'complete-fail';
  }).length;
  const sectionsFailed = INSPECTION_SECTIONS.filter(s => sectionStatus[s.id] === 'complete-fail').length;

  const itemsDone = INSPECTION_SECTIONS.reduce((acc, sec) => {
    const st = sectionStatus[sec.id];
    if (st === 'complete-pass' || st === 'complete-fail') return acc + sec.items;
    if (st === 'in-progress') return acc + Math.floor(sec.items * 0.5);
    return acc;
  }, 0);

  const minutesRemaining = INSPECTION_SECTIONS.reduce((acc, sec) => {
    const st = sectionStatus[sec.id];
    if (st === 'complete-pass' || st === 'complete-fail') return acc;
    return acc + minutesFromEstimate(sec.timeEstimate);
  }, 0);

  const score = Math.max(
    40,
    Math.min(
      98,
      88 -
        defects.length * 3 -
        defects.filter(d => d.severity === 'Critical').length * 6 +
        Math.min(5, Math.floor(passCount / 20))
    )
  );

  return {
    sectionStatus,
    totalToggleItems,
    passCount,
    failCount,
    naCount,
    answeredItems,
    itemsDone,
    score: answeredItems > 0 ? score : 0,
    defects,
    sectionsComplete,
    sectionsTotal,
    sectionsFailed,
    minutesRemaining,
    vehiclePhotosCaptured,
    damagePhotoCount,
  };
}
