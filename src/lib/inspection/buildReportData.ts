'use client';

import { db } from '@/lib/db/schema';
import { INSPECTION_SECTIONS, getGaugeConditionLabel, getGaugeStrokeColor } from '@/lib/mockData';
import { loadChecklistState } from '@/lib/inspectionChecklistPersistence';
import {
  SECTION_ITEMS,
  itemHasFail,
  type ItemResult,
} from '@/lib/inspector/sectionChecklist';
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
import { loadDamagePhotoObjectUrlsForItem } from '@/lib/inspection/dexieDamagePhotos';

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
  opts?: { photoUrls?: Partial<Record<VehicleAngleId, string>> }
): Promise<InspectionReportData> {
  const job = findMockJob(inspectionId);
  const durationSec = await loadSessionTimerSeconds(inspectionId);
  const signatureDataUrl = await loadSignatureBase64(inspectionId);

  const vehicle = job
    ? {
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
      }
    : {
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

  const defectsBase: (Omit<DefectSummary, 'damagePhotoUrls' | 'aiAnalysis'> & { itemKey: string })[] = [];
  const items: InspectionItemSummary[] = [];
  const sections: InspectionSectionSummary[] = [];
  const sectionBreakdowns: ReportSectionBreakdown[] = [];

  for (const sec of INSPECTION_SECTIONS) {
    const state = await loadChecklistState(inspectionId, sec.id);
    let status = 'not-started';
    if (state?.results && Object.keys(state.results).length > 0) {
      const anyFail = SECTION_ITEMS.some(item => itemHasFail(item, state.results as Record<string, ItemResult>));
      const allDone = SECTION_ITEMS.every(
        item =>
          item.type === 'paired'
            ? state.results[`${item.id}-L`] != null && state.results[`${item.id}-R`] != null
            : state.results[item.id] != null
      );
      if (anyFail) status = 'complete-fail';
      else if (allDone) status = 'complete-pass';
      else status = 'in-progress';
    }
    sections.push({ id: sec.id, name: sec.name, itemCount: sec.items, status });

    const lines: SectionLineResult[] = [];
    let passN = 0;
    let totalN = 0;

    if (!state) {
      sectionBreakdowns.push({
        sectionId: sec.id,
        name: sec.name,
        passed: 0,
        total: SECTION_ITEMS.reduce((n, i) => n + (i.type === 'paired' ? 2 : 1), 0),
        pct: 0,
        anyFailure: false,
        lines: [],
      });
      continue;
    }

    const results = state.results as Record<string, ItemResult>;

    for (const item of SECTION_ITEMS) {
      const pushLine = (label: string, key: string) => {
        const r = results[key];
        if (r === 'pass') passN++;
        if (r === 'fail' || r === 'pass' || r === 'na') totalN++;
        const sev = state.defects[item.id]?.severity;
        const note = state.defects[item.id]?.note;
        if (r === 'pass' || r === 'fail' || r === 'na') {
          lines.push({
            label,
            result: r,
            severity: r === 'fail' ? sev : undefined,
            note: r === 'fail' ? note : undefined,
          });
        }
      };

      if (item.type === 'paired') {
        pushLine(`${item.name} (Left)`, `${item.id}-L`);
        pushLine(`${item.name} (Right)`, `${item.id}-R`);
        items.push({
          sectionId: sec.id,
          itemKey: `${item.id}-L`,
          label: `${item.name} (Left)`,
          result: results[`${item.id}-L`] ?? null,
        });
        items.push({
          sectionId: sec.id,
          itemKey: `${item.id}-R`,
          label: `${item.name} (Right)`,
          result: results[`${item.id}-R`] ?? null,
        });
      } else {
        pushLine(item.name, item.id);
        items.push({
          sectionId: sec.id,
          itemKey: item.id,
          label: item.name,
          result: results[item.id] ?? null,
        });
      }

      if (itemHasFail(item, results)) {
        const d = state.defects[item.id];
        const sev = (d?.severity ?? 'Minor') as DefectSummary['severity'];
        const note = d?.note ?? '';
        if (item.type === 'paired') {
          if (results[`${item.id}-L`] === 'fail') {
            defectsBase.push({
              sectionId: sec.id,
              sectionName: sec.name,
              itemLabel: `${item.name} (Left)`,
              severity: sev,
              note,
              itemKey: item.id,
            });
          }
          if (results[`${item.id}-R`] === 'fail') {
            defectsBase.push({
              sectionId: sec.id,
              sectionName: sec.name,
              itemLabel: `${item.name} (Right)`,
              severity: sev,
              note,
              itemKey: item.id,
            });
          }
        } else {
          defectsBase.push({
            sectionId: sec.id,
            sectionName: sec.name,
            itemLabel: item.name,
            severity: sev,
            note,
            itemKey: item.id,
          });
        }
      }
    }

    const denom = lines.length || 1;
    const pct = Math.round((passN / denom) * 100);
    sectionBreakdowns.push({
      sectionId: sec.id,
      name: sec.name,
      passed: passN,
      total: lines.length,
      pct,
      anyFailure: lines.some(l => l.result === 'fail'),
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

  let scoreNum = 73;
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

  const criticalDefects = defects.filter(d => d.severity === 'Critical');
  const repairCosts = repairRowsFromDefects(defects);
  const scoreCategories = scoreCategoriesFromTotal(scoreNum);

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
      zone: 'Lekki',
      photoDocSubheading: `Photos captured by ${REPORT_INSPECTOR_NAME} on ${inspectionDateLong} at ${completedAtTime}`,
      qrVerifyUrl,
    },
    vehicle,
    inspector: {
      name: REPORT_INSPECTOR_NAME,
      certNumber: REPORT_CERT,
      signatureDataUrl,
      photoUrl: null,
      initials: REPORT_INSPECTOR_NAME.split(' ')
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
  };
}
