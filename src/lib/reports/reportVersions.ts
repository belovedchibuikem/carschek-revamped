import { REPORTS } from '@/lib/mockData';
import { reportsApi } from '@/lib/api/services';
import { USE_API_MOCK } from '@/lib/api/client';

export type ReportVersionKind = 'Original' | 'QA Edited' | 'Approved';

export type ReportRow = (typeof REPORTS)[number];

export interface ReportVersionMeta {
  version: number;
  kind: ReportVersionKind;
  at: string;
  author: string;
  summary?: string;
}

export interface ReportContentLine {
  id: string;
  text: string;
}

export interface ReportVersionSnapshot {
  version: number;
  score: number;
  defects: number;
  criticalDefects: number;
  lines: ReportContentLine[];
}

type VersionBundle = {
  meta: ReportVersionMeta[];
  snapshots: Record<number, ReportVersionSnapshot>;
};

/** Seeded demo versions used when API mock is on or API returns empty. */
const VERSION_DATA: Record<string, VersionBundle> = {
  'RPT-445': {
    meta: [
      { version: 1, kind: 'Original', at: '2026-04-15T10:42:00', author: 'Emeka Okonkwo' },
      {
        version: 2,
        kind: 'QA Edited',
        at: '2026-04-16T09:15:00',
        author: 'Promise Ndem',
        summary: 'corrected engine section',
      },
      { version: 3, kind: 'Approved', at: '2026-04-16T11:30:00', author: 'Chukwuemeka Obi' },
    ],
    snapshots: {
      1: {
        version: 1,
        score: 70,
        defects: 5,
        criticalDefects: 1,
        lines: [
          { id: 'L1', text: 'Engine mounts: minor vibration noted' },
          { id: 'L2', text: 'Rear bumper: crack on right side' },
          { id: 'L3', text: 'Dashboard warning lights: check engine on' },
        ],
      },
      2: {
        version: 2,
        score: 72,
        defects: 4,
        criticalDefects: 1,
        lines: [
          { id: 'L1', text: 'Engine mounts: pass after re-test' },
          { id: 'L2', text: 'Rear bumper: crack on right side' },
          { id: 'L3', text: 'Dashboard warning lights: check engine on' },
        ],
      },
      3: {
        version: 3,
        score: 72,
        defects: 4,
        criticalDefects: 1,
        lines: [
          { id: 'L1', text: 'Engine mounts: pass after re-test' },
          { id: 'L2', text: 'Rear bumper: crack on right side' },
          { id: 'L3', text: 'Dashboard warning lights: check engine on' },
        ],
      },
    },
  },
};

/** Live API cache — populated by `hydrateReportVersions`. */
const apiCache = new Map<string, VersionBundle>();

type ApiVersionRow = {
  id?: string;
  version?: number;
  kind?: string;
  author?: string;
  score?: number;
  defects?: number;
  criticalDefects?: number;
  summary?: string;
  createdAt?: string;
  at?: string;
  snapshot?: {
    lines?: ReportContentLine[];
    score?: number;
    defects?: number;
    criticalDefects?: number;
    [key: string]: unknown;
  } | null;
};

function normalizeKind(kind?: string): ReportVersionKind {
  if (kind === 'QA Edited' || kind === 'Approved' || kind === 'Original') return kind;
  if (kind?.toLowerCase().includes('approv')) return 'Approved';
  if (kind?.toLowerCase().includes('edit') || kind?.toLowerCase().includes('qa')) return 'QA Edited';
  return 'Original';
}

function linesFromSnapshot(snapshot: ApiVersionRow['snapshot'], fallback: ReportContentLine[]): ReportContentLine[] {
  if (!snapshot) return fallback;
  if (Array.isArray(snapshot.lines) && snapshot.lines.length) return snapshot.lines;
  const notes = snapshot.notes ?? snapshot.summary ?? snapshot.comment;
  if (typeof notes === 'string' && notes.trim()) {
    return [{ id: 'N1', text: notes }];
  }
  return fallback;
}

function bundleFromApiRows(rows: ApiVersionRow[], reportFallback?: ReportRow): VersionBundle | null {
  if (!rows.length) return null;
  const meta: ReportVersionMeta[] = [];
  const snapshots: Record<number, ReportVersionSnapshot> = {};
  for (const row of rows) {
    const version = Number(row.version) || meta.length + 1;
    const kind = normalizeKind(row.kind);
    const at = row.createdAt || row.at || reportFallback?.submittedAt || new Date().toISOString();
    meta.push({
      version,
      kind,
      at,
      author: row.author || reportFallback?.inspectorName || '—',
      summary: row.summary,
    });
    const fallbackLines: ReportContentLine[] = reportFallback
      ? [
          { id: 'B1', text: `Vehicle: ${reportFallback.carName}` },
          { id: 'B2', text: `Inspector: ${reportFallback.inspectorName}` },
          {
            id: 'B3',
            text: `Defects recorded: ${row.defects ?? reportFallback.defects} (${row.criticalDefects ?? reportFallback.criticalDefects} critical)`,
          },
        ]
      : [{ id: 'B1', text: `Version ${version} (${kind})` }];
    snapshots[version] = {
      version,
      score: Number(row.score ?? row.snapshot?.score ?? reportFallback?.score ?? 0),
      defects: Number(row.defects ?? row.snapshot?.defects ?? reportFallback?.defects ?? 0),
      criticalDefects: Number(
        row.criticalDefects ?? row.snapshot?.criticalDefects ?? reportFallback?.criticalDefects ?? 0
      ),
      lines: linesFromSnapshot(row.snapshot, fallbackLines),
    };
  }
  meta.sort((a, b) => a.version - b.version);
  return { meta, snapshots };
}

function seedOrMockBundle(reportId: string, reportFallback?: ReportRow): VersionBundle | null {
  const custom = VERSION_DATA[reportId];
  if (custom) return custom;
  const base = reportFallback ?? REPORTS.find(r => r.id === reportId);
  if (!base) return null;
  return {
    meta: [
      {
        version: base.version,
        kind: 'Original',
        at: base.submittedAt,
        author: base.inspectorName,
      },
    ],
    snapshots: {
      [base.version]: {
        version: base.version,
        score: base.score,
        defects: base.defects,
        criticalDefects: base.criticalDefects,
        lines: [
          { id: 'B1', text: `Vehicle: ${base.carName}` },
          { id: 'B2', text: `Inspector: ${base.inspectorName}` },
          { id: 'B3', text: `Defects recorded: ${base.defects} (${base.criticalDefects} critical)` },
        ],
      },
    },
  };
}

function resolveBundle(reportId: string, reportFallback?: ReportRow): VersionBundle | null {
  return apiCache.get(reportId) ?? seedOrMockBundle(reportId, reportFallback);
}

/** Fetch versions from Laravel (or seed when mock) and cache for sync getters. */
export async function hydrateReportVersions(
  reportId: string,
  reportFallback?: ReportRow
): Promise<VersionBundle | null> {
  if (USE_API_MOCK) {
    const seeded = seedOrMockBundle(reportId, reportFallback);
    if (seeded) apiCache.set(reportId, seeded);
    return seeded;
  }
  try {
    const rows = (await reportsApi.versions(reportId)) as ApiVersionRow[];
    const bundle = bundleFromApiRows(Array.isArray(rows) ? rows : [], reportFallback);
    if (bundle) {
      apiCache.set(reportId, bundle);
      return bundle;
    }
  } catch {
    /* fall through to seed */
  }
  const seeded = seedOrMockBundle(reportId, reportFallback);
  if (seeded) apiCache.set(reportId, seeded);
  return seeded;
}

export function getReportVersionMeta(reportId: string, reportFallback?: ReportRow): ReportVersionMeta[] {
  return resolveBundle(reportId, reportFallback)?.meta ?? [];
}

export function getDefaultVersionForReport(
  reportId: string,
  fallbackVersion: number,
  reportFallback?: ReportRow
): number {
  const meta = getReportVersionMeta(reportId, reportFallback);
  if (meta.length) return meta[meta.length - 1].version;
  return fallbackVersion;
}

export function getReportSnapshotForVersion(
  reportId: string,
  version: number,
  reportFallback?: ReportRow
): ReportVersionSnapshot | null {
  const bundle = resolveBundle(reportId, reportFallback);
  if (!bundle) return null;
  return bundle.snapshots[version] ?? null;
}

export function mergeReportWithSnapshot(
  reportId: string,
  base: ReportRow,
  version: number
): ReportRow {
  const snap = getReportSnapshotForVersion(reportId, version, base);
  if (!snap) return { ...base, version };
  return {
    ...base,
    version: snap.version,
    score: snap.score,
    defects: snap.defects,
    criticalDefects: snap.criticalDefects,
  };
}

export type LineDiff =
  | { type: 'same'; line: ReportContentLine }
  | { type: 'added'; line: ReportContentLine; inVersion: number }
  | { type: 'removed'; line: ReportContentLine; inVersion: number }
  | { type: 'changed'; line: ReportContentLine; oldText: string; inVersion: number };

/** Simple line diff by id between two snapshots */
export function diffReportLines(left: ReportContentLine[], right: ReportContentLine[], rightVersion: number): LineDiff[] {
  const out: LineDiff[] = [];
  const rightById = new Map(right.map(l => [l.id, l]));
  const leftById = new Map(left.map(l => [l.id, l]));

  for (const l of left) {
    const r = rightById.get(l.id);
    if (!r) out.push({ type: 'removed', line: l, inVersion: rightVersion });
    else if (r.text !== l.text) out.push({ type: 'changed', line: r, oldText: l.text, inVersion: rightVersion });
    else out.push({ type: 'same', line: l });
  }
  for (const r of right) {
    if (!leftById.has(r.id)) out.push({ type: 'added', line: r, inVersion: rightVersion });
  }
  return out;
}
