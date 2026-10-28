'use client';

import { db } from '@/lib/db/schema';
import { CARS, INSPECTION_SECTIONS, ORDERS, REPORTS, getGaugeConditionLabel, getGaugeStrokeColor } from '@/lib/mockData';
import {
  defectEntryNote,
  loadChecklistState,
  readChecklistFormValue,
  type ChecklistPersistPayload,
} from '@/lib/inspectionChecklistPersistence';
import { getSectionDef, type ToggleItem } from '@/lib/inspection/inspectionSections';
import { findMockJob } from '@/lib/inspection/mockInspectorJobs';
import { loadSignatureBase64, loadSessionTimerSeconds } from '@/lib/inspection/sessionDexie';
import { VEHICLE_PHOTO_SLOTS, type VehicleAngleId } from '@/lib/inspection/vehiclePhotoAngles';
import type {
  DefectSummary,
  InspectionItemSummary,
  InspectionReportData,
  InspectionSectionSummary,
  ReportSectionBreakdown,
  RepairCostRow,
  ScoreCategoryBreakdown,
  SectionLineResult,
} from '@/lib/inspection/reportTypes';
import { makeDamagePlaceholderDataUrl } from '@/lib/inspection/reportPlaceholders';
import {
  loadDamagePhotoObjectUrlsForItem,
  loadDamagePhotosForOrder,
} from '@/lib/inspection/dexieDamagePhotos';
import { USE_API_MOCK } from '@/lib/api/client';
import { PHASE1_OBSERVED_RISKS } from '@/lib/ai/phase1Flags';
import { buildObservedRisks } from '@/lib/ai/observedRisks';
import { carsApi, ordersApi, reportsApi } from '@/lib/api/services';

const REPORT_INSPECTOR_NAME = 'Emeka Adeyemi';
const REPORT_CERT = 'CA-0041';

function formatDurationClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function formatDurationHuman(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m} min ${s} sec`;
}

type CarRegisterRow = {
  brand: string;
  model: string;
  year: number;
  plate: string;
  mileage: number;
  colour: string;
  vin: string;
  city: string;
};

function carRegisterToS03Fields(car: CarRegisterRow): Record<string, string> {
  return {
    s03_brand: car.brand,
    s03_model: car.model,
    s03_year: String(car.year),
    s03_exterior_colour: car.colour,
    s03_mileage: String(car.mileage),
    s03_mileage_unit: 'KILOMETERS',
    s03_licence_plate: car.plate,
    s03_city_location: car.city,
    s03_chasis_number: car.vin,
  };
}

async function loadLatestS03SyncPayload(orderId: string): Promise<ChecklistPersistPayload | null> {
  if (!db) return null;
  const rows = await db.syncQueue.filter(q => q.type === 'inspection-section-complete').toArray();
  const matches = rows
    .filter(r => {
      try {
        const p = JSON.parse(r.payload ?? '{}') as { orderId?: string; sectionId?: string };
        return p.orderId === orderId && p.sectionId === 'S03';
      } catch {
        return false;
      }
    })
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  const latest = matches[0];
  if (!latest?.payload) return null;
  try {
    return JSON.parse(latest.payload) as ChecklistPersistPayload;
  } catch {
    return null;
  }
}

function resolveS03FieldValue(
  fieldId: string,
  checklist: ChecklistPersistPayload | null,
  syncPayload: ChecklistPersistPayload | null,
  carFields: Record<string, string>
): string {
  const fromChecklist = readChecklistFormValue(checklist, fieldId);
  if (fromChecklist) return fromChecklist;
  const fromSync = readChecklistFormValue(syncPayload, fieldId);
  if (fromSync) return fromSync;
  return carFields[fieldId]?.trim() ?? '';
}

function reportNumberFromId(inspectionId: string): string {
  const digits = inspectionId.replace(/\D/g, '');
  const tail = digits.slice(-4).padStart(4, '0');
  return `CS-2026-${tail || '4521'}`;
}

function scoreCategoriesFromTotal(total: number): ScoreCategoryBreakdown {
  const t = Math.max(40, Math.min(100, total));
  return {
    body: Math.min(100, t + 4),
    engine: Math.min(100, t + 1),
    interior: Math.max(40, t - 6),
    electrical: Math.min(100, t + 7),
  };
}

function repairRowsFromDefects(defects: DefectSummary[]): RepairCostRow[] {
  if (!defects.length) return [];
  const rows: RepairCostRow[] = defects.map(d => {
    if (d.severity === 'Critical')
      return { item: `${d.sectionName} — ${d.itemLabel}`, severity: d.severity, low: 120000, high: 500000, openEnded: true };
    if (d.severity === 'Major')
      return { item: `${d.sectionName} — ${d.itemLabel}`, severity: d.severity, low: 25000, high: 60000 };
    return { item: `${d.sectionName} — ${d.itemLabel}`, severity: d.severity, low: 5000, high: 15000 };
  });
  return rows;
}

function enrichDefect(
  d: Omit<DefectSummary, 'damagePhotoUrls' | 'aiAnalysis'>,
  dexieDamageUrls: string[]
): DefectSummary {
  const placeholders: string[] = [];
  if (typeof document !== 'undefined' && dexieDamageUrls.length === 0) {
    if (d.severity !== 'Minor') placeholders.push(makeDamagePlaceholderDataUrl(0));
    if (d.severity === 'Critical' || d.severity === 'Major') placeholders.push(makeDamagePlaceholderDataUrl(1));
  }
  const damagePhotoUrls = dexieDamageUrls.length > 0 ? dexieDamageUrls : placeholders;
  const aiAnalysis =
    dexieDamageUrls.length > 0
      ? null
      : d.severity === 'Critical' ?'Structural / safety concern — 89% confidence (demo)'
        : d.severity === 'Major' ?'Oil seal degradation — 91% confidence (demo)'
          : null;
  return { ...d, damagePhotoUrls, aiAnalysis };
}

/** Offline-first report payload; merges Dexie checklist rows + optional live photo URLs from UI store. */
export async function buildReportData(
  inspectionId: string,
  opts?: {
    photoUrls?: Partial<Record<VehicleAngleId, string>>;
    /** Recorded score from the reports register — used when no local checklist data exists. */
    fallbackScore?: number;
    /** Inspector of record (e.g. from the admin reports register). */
    inspectorName?: string;
  }
): Promise<InspectionReportData> {
  const job = findMockJob(inspectionId);
  // Admin orders register — keeps superadmin-side reports tallying with the
  // order/report rows when the order is not one of the inspector PWA mock jobs.
  let adminOrder = job ? undefined : ORDERS.find(o => o.id === inspectionId);
  if (!job && !adminOrder && !USE_API_MOCK) {
    try {
      adminOrder = await ordersApi.get(inspectionId);
    } catch {
      adminOrder = undefined;
    }
  }
  const durationSec = await loadSessionTimerSeconds(inspectionId);
  const signatureDataUrl = await loadSignatureBase64(inspectionId);

  let vehicle: InspectionReportData['vehicle'];
  if (job) {
    vehicle = {
      make: job.vehicleLabel.split(/\s+/)[1] ?? 'Toyota',
      model: job.vehicleLabel.split(/\s+/).slice(2).join(' ') || 'Camry',
      trim: inspectionId === 'ORD-1892' ? 'LE' : '',
      year: parseInt(job.vehicleLabel.split(/\s+/)[0] ?? '', 10) || 2019,
      plate: job.plate,
      vin: job.vin,
      mileage: inspectionId === 'ORD-1892' ? '137,373 km' : '—',
      colour: 'Silver',
      transmission: 'Automatic',
      engineNumber: '—',
      city: 'Lagos',
    };
  } else if (adminOrder) {
    // Admin order vehicle labels are "Make Model… Year" (year last).
    const tokens = adminOrder.vehicle.split(/\s+/);
    const lastTok = tokens[tokens.length - 1] ?? '';
    const year = /^\d{4}$/.test(lastTok) ? parseInt(lastTok, 10) : 0;
    const nameTokens = year ? tokens.slice(0, -1) : tokens;
    vehicle = {
      make: nameTokens[0] ?? '—',
      model: nameTokens.slice(1).join(' ') || '—',
      trim: '',
      year: year || new Date().getFullYear(),
      plate: adminOrder.plate,
      vin: '—',
      mileage: '—',
      colour: '—',
      transmission: '—',
      engineNumber: '—',
      city: adminOrder.zone || 'Lagos',
    };
  } else {
    vehicle = {
      make: 'Toyota',
      model: 'Camry',
      trim: 'LE',
      year: 2019,
      plate: 'LSD260JE',
      vin: '4T1BF3EK9BU228086',
      mileage: '137,373 km',
      colour: 'Silver',
      transmission: 'Automatic',
      engineNumber: '—',
      city: 'Lagos',
    };
  }

  const defectsBase: (Omit<DefectSummary, 'damagePhotoUrls' | 'aiAnalysis'> & { itemKey: string })[] = [];
  const items: InspectionItemSummary[] = [];
  const sections: InspectionSectionSummary[] = [];
  const sectionBreakdowns: ReportSectionBreakdown[] = [];

  /** Stored toggle values are 'yes'/'no'/'na' (legacy data may hold 'pass'/'fail'). */
  const mapToggle = (v: string | null | undefined): 'pass' | 'fail' | 'na' | null => {
    if (v === 'yes' || v === 'pass') return 'pass';
    if (v === 'no' || v === 'fail') return 'fail';
    if (v === 'na') return 'na';
    return null;
  };

  for (const sec of INSPECTION_SECTIONS) {
    const def = getSectionDef(sec.id);
    const state = await loadChecklistState(inspectionId, sec.id);
    const results = (state?.results ?? {}) as Record<string, string | null>;
    const storedDefects = (state?.defects ?? {}) as Record<string, { severity: string; note: string }>;

    const lines: SectionLineResult[] = [];
    let passN = 0;
    let totalItems = sec.items;

    if (def?.layout === 'toggle-grid') {
      // Real checklist items the inspector ticked — Yes/Good → OK, No/Bad → NOT OK, N/A
      const toggleItems: ToggleItem[] = [];
      for (const row of def.toggleRows ?? []) {
        toggleItems.push(row.left);
        if (row.right) toggleItems.push(row.right);
      }
      totalItems = toggleItems.length;

      for (const item of toggleItems) {
        const r = mapToggle(results[item.id]);
        items.push({ sectionId: sec.id, itemKey: item.id, label: item.label, result: r });
        if (r == null) continue;
        if (r === 'pass') passN++;
        const d = storedDefects[item.id];
        lines.push({
          label: item.label,
          result: r,
          severity: r === 'fail' ? (d?.severity ?? 'Minor') : undefined,
          note: r === 'fail' ? d?.note : undefined,
        });
        if (r === 'fail') {
          defectsBase.push({
            sectionId: sec.id,
            sectionName: sec.name,
            itemLabel: item.label,
            severity: (d?.severity ?? 'Minor') as DefectSummary['severity'],
            note: d?.note ?? '',
            itemKey: item.id,
          });
        }
      }
    } else if (def?.layout === 'form') {
      // Form sections (Customer / Car Details): show recorded values
      const fields = def.fields ?? [];
      totalItems = fields.length;
      for (const field of fields) {
        const value =
          defectEntryNote(storedDefects[`form_${field.id}`]).trim() ||
          (typeof results[field.id] === 'string' ? results[field.id]!.trim() : '');
        items.push({ sectionId: sec.id, itemKey: field.id, label: field.label, result: value || null });
        if (!value) continue;
        passN++;
        lines.push({ label: field.label, result: 'pass', value });
      }
    } else if (def?.layout === 'comments') {
      const fields = def.commentFields ?? [];
      totalItems = fields.length;
      for (const field of fields) {
        const value = defectEntryNote(storedDefects[`comment_${field.id}`]).trim();
        items.push({ sectionId: sec.id, itemKey: field.id, label: field.label, result: value || null });
        if (!value) continue;
        passN++;
        lines.push({ label: field.label, result: 'pass', value });
      }
    }
    // photos / damages / summary sections are rendered by dedicated report blocks

    const answered = lines.length;
    const anyFailure = lines.some(l => l.result === 'fail');
    let status = 'not-started';
    if (answered > 0) {
      if (anyFailure) status = 'complete-fail';
      else if (answered >= totalItems) status = 'complete-pass';
      else status = 'in-progress';
    }
    sections.push({ id: sec.id, name: sec.name, itemCount: totalItems, status });

    const denom = answered || 1;
    const pct = answered === 0 ? 0 : Math.round((passN / denom) * 100);
    sectionBreakdowns.push({
      sectionId: sec.id,
      name: sec.name,
      passed: passN,
      total: answered > 0 ? answered : totalItems,
      pct,
      anyFailure,
      lines,
    });
  }

  defectsBase.sort((a, b) => {
    const rank = (s: DefectSummary['severity']) => (s === 'Critical' ? 0 : s === 'Major' ? 1 : 2);
    return rank(a.severity) - rank(b.severity);
  });

  const defects: DefectSummary[] = await Promise.all(
    defectsBase.map(async d => {
      const dexieUrls = await loadDamagePhotoObjectUrlsForItem(inspectionId, d.sectionId, d.itemKey);
      const { itemKey: _ik, ...rest } = d;
      return enrichDefect(rest, dexieUrls);
    })
  );

  let scoreNum = opts?.fallbackScore ?? 73;
  if (db) {
    const row = await db.inspections.where('orderId').equals(inspectionId).first();
    if (row?.score != null) scoreNum = row.score;
  }
  const passCount = items.filter(i => i.result === 'pass').length;
  const computed = Math.max(
    40,
    Math.min(
      98,
      88 -
        defects.length * 3 -
        defects.filter(d => d.severity === 'Critical').length * 6 +
        Math.min(5, Math.floor(passCount / 20))
    )
  );
  if (items.some(i => i.result != null)) scoreNum = computed;

  const vehiclePhotos = VEHICLE_PHOTO_SLOTS.map(slot => ({
    angleId: slot.id,
    label: slot.label,
    url: opts?.photoUrls?.[slot.id] ?? null,
  }));

  const now = new Date();
  const inspectionDate = now.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const inspectionDateLong = now.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const completedAtTime = now.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });

  const reportNumber = reportNumberFromId(inspectionId);
  const qrVerifyUrl = `https://carschek.com/verify/${encodeURIComponent(reportNumber)}`;
  const inspectorName = opts?.inspectorName ?? adminOrder?.inspectorName ?? REPORT_INSPECTOR_NAME;

  const criticalDefects = defects.filter(d => d.severity === 'Critical');
  const repairCosts = repairRowsFromDefects(defects);
  const scoreCategories = scoreCategoriesFromTotal(scoreNum);

  const s03Def = getSectionDef('S03');
  const s03State = await loadChecklistState(inspectionId, 'S03');
  const s03SyncPayload = await loadLatestS03SyncPayload(inspectionId);
  let linkedReport = REPORTS.find(r => r.orderId === inspectionId);
  let linkedCar = linkedReport?.carId ? CARS.find(c => c.id === linkedReport!.carId) : undefined;
  if (!USE_API_MOCK) {
    try {
      if (!linkedReport) {
        const reports = await reportsApi.list();
        linkedReport = reports.find(r => r.orderId === inspectionId);
      }
      const carId =
        linkedReport?.carId ?? (adminOrder as { carId?: string } | undefined)?.carId;
      if (carId && !linkedCar) {
        linkedCar = await carsApi.get(carId);
      }
    } catch {
      /* keep mock fallbacks */
    }
  }
  const carS03Fields = linkedCar ? carRegisterToS03Fields(linkedCar as CarRegisterRow) : {};

  const carDetailFields = (s03Def?.fields ?? []).map(f => ({
    label: f.label,
    value: resolveS03FieldValue(f.id, s03State, s03SyncPayload, carS03Fields),
  }));

  const s03 = (id: string) => resolveS03FieldValue(id, s03State, s03SyncPayload, carS03Fields);
  if (s03('s03_brand')) vehicle = { ...vehicle, make: s03('s03_brand') };
  if (s03('s03_model')) vehicle = { ...vehicle, model: s03('s03_model') };
  if (s03('s03_year')) {
    const y = parseInt(s03('s03_year'), 10);
    if (y) vehicle = { ...vehicle, year: y };
  }
  if (s03('s03_transmission')) vehicle = { ...vehicle, transmission: s03('s03_transmission') };
  if (s03('s03_exterior_colour')) vehicle = { ...vehicle, colour: s03('s03_exterior_colour') };
  if (s03('s03_licence_plate')) vehicle = { ...vehicle, plate: s03('s03_licence_plate') };
  if (s03('s03_city_location')) vehicle = { ...vehicle, city: s03('s03_city_location') };
  if (s03('s03_chasis_number')) vehicle = { ...vehicle, vin: s03('s03_chasis_number') };
  if (s03('s03_engine_capacity')) vehicle = { ...vehicle, engineNumber: s03('s03_engine_capacity') };
  if (s03('s03_mileage')) {
    const unit = s03('s03_mileage_unit');
    const unitLabel = unit === 'MILES' ? 'mi' : unit === 'KILOMETERS' ? 'km' : unit.toLowerCase();
    vehicle = { ...vehicle, mileage: unitLabel ? `${s03('s03_mileage')} ${unitLabel}` : s03('s03_mileage') };
  }

  const s26Def = getSectionDef('S26');
  const s26State = await loadChecklistState(inspectionId, 'S26');
  const inspectorComments = (s26Def?.commentFields ?? []).map(f => ({
    label: f.label,
    value: defectEntryNote(s26State?.defects?.[`comment_${f.id}`]).trim(),
  }));

  const { photos: hubPhotoRows } = await loadDamagePhotosForOrder(inspectionId);
  const hubDamages = hubPhotoRows.map(p => ({
    id: p.id,
    label: p.label,
    comment: p.comment,
    photoUrl: p.url,
  }));

  return {
    inspection: {
      id: inspectionId,
      reportNumber,
      inspectionDate,
      inspectionDateLong,
      completedAtTime,
      durationLabel: formatDurationClock(durationSec || 522),
      durationHuman: formatDurationHuman(durationSec || 522),
      score: scoreNum,
      version: 1,
      zone: adminOrder?.zone ?? 'Lekki',
      photoDocSubheading: `Photos captured by ${inspectorName} on ${inspectionDateLong} at ${completedAtTime}`,
      qrVerifyUrl,
    },
    vehicle,
    carDetailFields,
    inspectorComments,
    hubDamages,
    inspector: {
      name: inspectorName,
      certNumber: REPORT_CERT,
      signatureDataUrl,
      photoUrl: null,
      initials: inspectorName
        .split(' ')
        .map(w => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    },
    vehiclePhotos,
    sections,
    sectionBreakdowns,
    items,
    damagePhotos: [],
    defects,
    criticalDefects,
    score: {
      total: scoreNum,
      label: getGaugeConditionLabel(scoreNum),
      strokeColor: getGaugeStrokeColor(scoreNum),
    },
    scoreCategories,
    repairCosts: repairCosts.length ? repairCosts : null,
    observedRisks: PHASE1_OBSERVED_RISKS
      ? buildObservedRisks({
          score: scoreNum,
          defects,
          sectionBreakdowns,
        })
      : null,
  };
}
