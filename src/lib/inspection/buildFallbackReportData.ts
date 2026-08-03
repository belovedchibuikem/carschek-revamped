/** Build report document from API report row / migrated payload when order checklist is missing. */

import { getGaugeConditionLabel, getGaugeStrokeColor, INSPECTION_SECTIONS } from '@/lib/mockData';
import { getSectionDef, type ToggleItem } from '@/lib/inspection/inspectionSections';
import type {
  DefectSummary,
  InspectionReportData,
  InspectionSectionSummary,
  ReportSectionBreakdown,
  SectionLineResult,
} from '@/lib/inspection/reportTypes';
import { VEHICLE_PHOTO_SLOTS } from '@/lib/inspection/vehiclePhotoAngles';

export type ReportMetaForFallback = {
  id: string;
  orderId?: string | null;
  carName?: string | null;
  inspectorName?: string | null;
  score?: number | null;
  version?: number | null;
  submittedAt?: string | null;
  defects?: number | null;
  criticalDefects?: number | null;
  payload?: Record<string, unknown> | null;
};

type PayloadItem = {
  section_key?: string;
  sectionKey?: string;
  item_key?: string;
  itemKey?: string;
  result?: string | null;
  severity?: string | null;
  note?: string | null;
  value?: string | null;
};

/** Legacy migration stored documentations under S01; current schema uses S02. */
const LEGACY_DOC_SUFFIXES = new Set([
  'vehicle_license',
  'ecmr',
  'proof_of_ownership',
  'proof_ownership',
  'road_worthiness',
  'insurance_clearance',
  'custom_clearance',
  'purchase_receipt',
  'tinted_permit',
  'plate_number',
  'number_plate',
  'means_of_id',
  'plate_allocation',
]);

const DOC_SUFFIX_MAP: Record<string, string> = {
  proof_of_ownership: 'proof_ownership',
  number_plate: 'plate_number',
  plate_allocation: 'tinted_permit',
};

function parseCarName(carName: string | null | undefined): {
  make: string;
  model: string;
  year: number;
} {
  const raw = (carName || '').trim();
  if (!raw) return { make: '—', model: '—', year: new Date().getFullYear() };
  const tokens = raw.split(/\s+/);
  const first = tokens[0] ?? '';
  const last = tokens[tokens.length - 1] ?? '';
  // "2026 Toyota RAV4" or "Toyota RAV4 2010"
  if (/^\d{4}$/.test(first) && tokens.length >= 2) {
    return {
      year: Number(first),
      make: tokens[1] ?? '—',
      model: tokens.slice(2).join(' ') || '—',
    };
  }
  const year = /^\d{4}$/.test(last) ? Number(last) : new Date().getFullYear();
  const nameTokens = /^\d{4}$/.test(last) ? tokens.slice(0, -1) : tokens;
  return {
    make: nameTokens[0] ?? '—',
    model: nameTokens.slice(1).join(' ') || '—',
    year,
  };
}

function mapResult(raw: string | null | undefined): 'pass' | 'fail' | 'na' | null {
  if (raw == null || raw === '') return null;
  const v = String(raw).trim().toLowerCase();
  if (['yes', 'pass', 'ok', 'good', 'true', '1', 'original', 'present', 'available'].includes(v)) return 'pass';
  if (['no', 'fail', 'bad', 'false', '0', 'not ok', 'not_ok', 'missing', 'absent'].includes(v)) return 'fail';
  if (['na', 'n/a', 'n.a', 'not applicable', 'nil', 'none'].includes(v)) return 'na';
  // Form values are free text — treat as answered pass for display
  return null;
}

function labelForItem(sectionId: string, itemKey: string): string {
  const def = getSectionDef(sectionId);
  if (!def) return itemKey;
  if (def.layout === 'toggle-grid') {
    for (const row of def.toggleRows ?? []) {
      if (row.left.id === itemKey) return row.left.label;
      if (row.right?.id === itemKey) return row.right.label;
    }
  }
  if (def.layout === 'form') {
    const f = def.fields?.find(x => x.id === itemKey);
    if (f) return f.label;
  }
  if (def.layout === 'comments') {
    const f = def.commentFields?.find(x => x.id === itemKey);
    if (f) return f.label;
  }
  return itemKey.replace(/^s\d+_/i, '').replace(/_/g, ' ');
}

function allToggleItems(sectionId: string): ToggleItem[] {
  const def = getSectionDef(sectionId);
  if (!def || def.layout !== 'toggle-grid') return [];
  const out: ToggleItem[] = [];
  for (const row of def.toggleRows ?? []) {
    out.push(row.left);
    if (row.right) out.push(row.right);
  }
  return out;
}

/** Remap legacy documentation items that landed under S01 into S02. */
function normalizePayloadItems(rawItems: PayloadItem[]): PayloadItem[] {
  return rawItems.map(item => {
    const sectionId = String(item.section_key ?? item.sectionKey ?? '').toUpperCase();
    const key = String(item.item_key ?? item.itemKey ?? '').toLowerCase();
    const suffix = key.replace(/^s\d+_/, '');
    if (sectionId === 'S01' && LEGACY_DOC_SUFFIXES.has(suffix)) {
      const mapped = DOC_SUFFIX_MAP[suffix] ?? suffix;
      return {
        ...item,
        section_key: 'S02',
        item_key: `s02_${mapped}`,
      };
    }
    return {
      ...item,
      section_key: sectionId || String(item.section_key ?? item.sectionKey ?? ''),
      item_key: key || String(item.item_key ?? item.itemKey ?? ''),
    };
  });
}

function readPayloadVehicle(payload: Record<string, unknown>): Partial<{
  make: string;
  model: string;
  year: number;
  plate: string;
  vin: string;
  colour: string;
  mileage: string;
  transmission: string;
  city: string;
  engineCapacity: string;
}> {
  const v = payload.vehicle;
  if (!v || typeof v !== 'object') return {};
  const o = v as Record<string, unknown>;
  const yearRaw = o.year;
  const year =
    typeof yearRaw === 'number'
      ? yearRaw
      : typeof yearRaw === 'string' && /^\d{4}$/.test(yearRaw)
        ? Number(yearRaw)
        : undefined;
  return {
    make: typeof o.make === 'string' ? o.make : undefined,
    model: typeof o.model === 'string' ? o.model : undefined,
    year,
    plate: typeof o.plate === 'string' ? o.plate : undefined,
    vin: typeof o.vin === 'string' ? o.vin : undefined,
    colour: typeof o.colour === 'string' ? o.colour : undefined,
    mileage:
      o.mileage != null
        ? `${o.mileage}${typeof o.mileageUnit === 'string' ? ` ${o.mileageUnit}` : ''}`
        : undefined,
    transmission: typeof o.transmission === 'string' ? o.transmission : undefined,
    city: typeof o.city === 'string' ? o.city : undefined,
    engineCapacity: typeof o.engineCapacity === 'string' ? o.engineCapacity : undefined,
  };
}

export function buildFallbackReportData(report: ReportMetaForFallback): InspectionReportData {
  const payload = report.payload && typeof report.payload === 'object' ? report.payload : {};
  const rawItems = normalizePayloadItems(
    Array.isArray(payload.items) ? (payload.items as PayloadItem[]) : []
  );
  const payloadVehicle = readPayloadVehicle(payload);

  const bySection = new Map<string, PayloadItem[]>();
  for (const item of rawItems) {
    const sectionId = String(item.section_key ?? item.sectionKey ?? '').toUpperCase();
    if (!sectionId) continue;
    const list = bySection.get(sectionId) ?? [];
    list.push(item);
    bySection.set(sectionId, list);
  }

  const defects: DefectSummary[] = [];
  const sections: InspectionSectionSummary[] = [];
  const sectionBreakdowns: ReportSectionBreakdown[] = [];
  const carDetailFields: { label: string; value: string }[] = [];
  const inspectorComments: { label: string; value: string }[] = [];
  let vehicleMake = payloadVehicle.make || '';
  let vehicleModel = payloadVehicle.model || '';
  let vehicleYear = payloadVehicle.year || 0;
  let vehiclePlate = payloadVehicle.plate || '';
  let vehicleVin = payloadVehicle.vin || '';
  let vehicleColour = payloadVehicle.colour || '';
  let vehicleMileage = payloadVehicle.mileage || '';
  let vehicleTransmission = payloadVehicle.transmission || '';
  let vehicleCity = payloadVehicle.city || '';
  let vehicleEngine = payloadVehicle.engineCapacity || '';

  for (const sec of INSPECTION_SECTIONS) {
    const def = getSectionDef(sec.id);
    const items = bySection.get(sec.id) ?? [];
    const lines: SectionLineResult[] = [];
    let passN = 0;
    let answered = 0;

    if (def?.layout === 'toggle-grid') {
      const toggles = allToggleItems(sec.id);
      const byKey = new Map(items.map(i => [String(i.item_key ?? i.itemKey ?? '').toLowerCase(), i]));
      for (const t of toggles.length
        ? toggles
        : items.map(i => ({
            id: String(i.item_key ?? i.itemKey ?? ''),
            label: labelForItem(sec.id, String(i.item_key ?? i.itemKey ?? '')),
            toggleType: 'yes-no-na' as const,
            required: false,
          }))) {
        const row = byKey.get(t.id.toLowerCase());
        const mapped = mapResult(row?.result ?? null);
        if (!mapped) continue;
        answered++;
        if (mapped === 'pass') passN++;
        const severity = (row?.severity as DefectSummary['severity'] | null) || undefined;
        lines.push({
          label: t.label,
          result: mapped,
          severity: mapped === 'fail' ? severity || 'Minor' : undefined,
          note: row?.note || undefined,
        });
        if (mapped === 'fail') {
          defects.push({
            sectionId: sec.id,
            sectionName: sec.name,
            itemLabel: t.label,
            severity: severity || 'Minor',
            note: row?.note || '',
            damagePhotoUrls: [],
            aiAnalysis: null,
          });
        }
      }
    } else if (def?.layout === 'form' || def?.layout === 'comments') {
      for (const row of items) {
        const key = String(row.item_key ?? row.itemKey ?? '').toLowerCase();
        const value = String(row.value ?? row.result ?? '').trim();
        if (!value || value.toUpperCase() === 'NULL') continue;
        // Skip toggle-like answers that accidentally land in form sections
        if (mapResult(value) === 'na' && !value.match(/[a-zA-Z]{3,}/)) continue;
        const label = labelForItem(sec.id, key);
        answered++;
        passN++;
        lines.push({ label, result: 'pass', value });
        if (sec.id === 'S03') {
          carDetailFields.push({ label, value });
          if (key === 's03_brand') vehicleMake = value;
          if (key === 's03_model') vehicleModel = value;
          if (key === 's03_year') vehicleYear = Number(value) || 0;
          if (key === 's03_licence_plate') vehiclePlate = value;
          if (key === 's03_chasis_number') vehicleVin = value;
          if (key === 's03_exterior_colour') vehicleColour = value;
          if (key === 's03_mileage') vehicleMileage = value;
          if (key === 's03_mileage_unit' && vehicleMileage && !vehicleMileage.includes(value)) {
            vehicleMileage = `${vehicleMileage} ${value}`;
          }
          if (key === 's03_transmission') vehicleTransmission = value;
          if (key === 's03_city_location') vehicleCity = value;
          if (key === 's03_engine_capacity') vehicleEngine = value;
        }
        if (sec.id === 'S26') {
          inspectorComments.push({ label, value });
        }
      }
    } else {
      for (const row of items) {
        const mapped = mapResult(row.result ?? null);
        const value = String(row.value ?? row.result ?? '').trim();
        if (!mapped && !value) continue;
        answered++;
        if (mapped === 'pass' || (!mapped && value)) passN++;
        lines.push({
          label: labelForItem(sec.id, String(row.item_key ?? row.itemKey ?? '')),
          result: mapped ?? 'pass',
          value: mapped ? undefined : value,
          severity: mapped === 'fail' ? ((row.severity as DefectSummary['severity']) || 'Minor') : undefined,
        });
      }
    }

    const anyFailure = lines.some(l => l.result === 'fail');
    let status = 'not-started';
    if (answered > 0) {
      status = anyFailure
        ? 'complete-fail'
        : answered >= (def?.layout === 'toggle-grid' ? allToggleItems(sec.id).length || answered : answered)
          ? 'complete-pass'
          : 'in-progress';
    }

    sections.push({
      id: sec.id,
      name: sec.name,
      itemCount: def?.layout === 'toggle-grid' ? allToggleItems(sec.id).length || sec.items : sec.items,
      status,
    });

    sectionBreakdowns.push({
      sectionId: sec.id,
      name: sec.name,
      passed: passN,
      total: answered || sec.items,
      pct: answered === 0 ? 0 : Math.round((passN / answered) * 100),
      anyFailure,
      lines,
    });
  }

  const fromName = parseCarName(report.carName);
  const scoreFromPayload = typeof payload.score === 'number' ? payload.score : null;
  let scoreNum = Number(report.score ?? scoreFromPayload ?? 0) || 0;
  if (!scoreNum && rawItems.length) {
    const toggles = rawItems.filter(i => mapResult(i.result) != null);
    const passes = toggles.filter(i => mapResult(i.result) === 'pass').length;
    const fails = toggles.filter(i => mapResult(i.result) === 'fail').length;
    if (toggles.length) {
      scoreNum = Math.max(
        40,
        Math.min(98, Math.round((passes / toggles.length) * 100) - fails * 2)
      );
    }
  }

  const submitted = report.submittedAt ? new Date(report.submittedAt) : new Date();
  const inspectionDate = submitted.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const inspectionDateLong = submitted.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const completedAtTime = submitted.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
  const inspectorName = report.inspectorName?.trim() || 'Carschek Inspector';
  const reportNumber = report.id.replace(/^RPT-/i, 'CS-') || `CS-${report.id}`;
  const band =
    typeof payload.band === 'string' ? payload.band : getGaugeConditionLabel(scoreNum || 50);
  const criticalDefects = defects.filter(d => d.severity === 'Critical');

  const make = vehicleMake || (fromName.make !== '—' ? fromName.make : '') || '—';
  const model = vehicleModel || (fromName.model !== '—' ? fromName.model : '') || '—';
  const year = vehicleYear || fromName.year;

  if (!carDetailFields.length) {
    carDetailFields.push(
      { label: 'Make', value: make },
      { label: 'Model', value: model },
      { label: 'Year', value: String(year) },
      { label: 'Plate', value: vehiclePlate || '—' },
      { label: 'VIN', value: vehicleVin || '—' },
      { label: 'Report', value: report.id }
    );
  }
  if (!inspectorComments.length) {
    inspectorComments.push({
      label: 'Summary',
      value: rawItems.length
        ? `Imported checklist (${rawItems.length} items). Score ${scoreNum || '—'}/100.`
        : 'Checklist detail not available for this report.',
    });
  }

  return {
    inspection: {
      id: report.orderId || report.id,
      reportNumber,
      inspectionDate,
      inspectionDateLong,
      completedAtTime,
      durationLabel: '—',
      durationHuman: '—',
      score: scoreNum,
      version: Number(report.version ?? 1) || 1,
      zone: vehicleCity || '—',
      photoDocSubheading: `Inspection report ${report.id}`,
      qrVerifyUrl: `https://carschek.com/verify/${encodeURIComponent(reportNumber)}`,
    },
    vehicle: {
      make,
      model,
      trim: '',
      year,
      plate: vehiclePlate || '—',
      vin: vehicleVin || '—',
      mileage: vehicleMileage || '—',
      colour: vehicleColour || '—',
      transmission: vehicleTransmission || '—',
      engineNumber: vehicleEngine || '—',
      city: vehicleCity || '—',
    },
    carDetailFields,
    inspectorComments,
    hubDamages: [],
    inspector: {
      name: inspectorName,
      certNumber: '—',
      signatureDataUrl: null,
      photoUrl: null,
      initials:
        inspectorName
          .split(/\s+/)
          .map(w => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase() || 'CK',
    },
    vehiclePhotos: VEHICLE_PHOTO_SLOTS.map(slot => ({
      angleId: slot.id,
      label: slot.label,
      url: null,
    })),
    sections,
    sectionBreakdowns,
    items: [],
    damagePhotos: [],
    defects,
    criticalDefects,
    score: {
      total: scoreNum,
      label: band,
      strokeColor: getGaugeStrokeColor(scoreNum || 50),
    },
    scoreCategories: {
      body: scoreNum,
      engine: scoreNum,
      interior: scoreNum,
      electrical: scoreNum,
    },
    repairCosts: null,
  };
}
