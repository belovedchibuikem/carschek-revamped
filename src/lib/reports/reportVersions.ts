import { REPORTS } from '@/lib/mockData';

export type ReportVersionKind = 'Original' | 'QA Edited' | 'Approved';

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

/** Version metadata + per-version content for viewer / diff */
const VERSION_DATA: Record<string, { meta: ReportVersionMeta[]; snapshots: Record<number, ReportVersionSnapshot> }> = {
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

export function getReportVersionMeta(reportId: string): ReportVersionMeta[] {
  const custom = VERSION_DATA[reportId]?.meta;
  if (custom?.length) return custom;
  const base = REPORTS.find(r => r.id === reportId);
  if (!base) return [];
  return [
    {
      version: base.version,
      kind: 'Original',
      at: base.submittedAt,
      author: base.inspectorName,
    },
  ];
}

export function getDefaultVersionForReport(reportId: string, fallbackVersion: number): number {
  const meta = getReportVersionMeta(reportId);
  if (meta.length) return meta[meta.length - 1].version;
  return fallbackVersion;
}

export function getReportSnapshotForVersion(reportId: string, version: number): ReportVersionSnapshot | null {
  const snap = VERSION_DATA[reportId]?.snapshots[version];
  if (snap) return snap;
  const base = REPORTS.find(r => r.id === reportId);
  if (!base || base.version !== version) return null;
  return {
    version: base.version,
    score: base.score,
    defects: base.defects,
    criticalDefects: base.criticalDefects,
    lines: [
      { id: 'B1', text: `Vehicle: ${base.carName}` },
      { id: 'B2', text: `Inspector: ${base.inspectorName}` },
      { id: 'B3', text: `Defects recorded: ${base.defects} (${base.criticalDefects} critical)` },
    ],
  };
}

export function mergeReportWithSnapshot(
  reportId: string,
  base: (typeof REPORTS)[number],
  version: number
): (typeof REPORTS)[number] {
  const snap = getReportSnapshotForVersion(reportId, version);
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
