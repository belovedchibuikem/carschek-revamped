'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import {
  diffReportLines,
  getReportSnapshotForVersion,
  getReportVersionMeta,
  hydrateReportVersions,
  type ReportVersionMeta,
} from '@/lib/reports/reportVersions';

export interface ReportVersionCompareOverlayProps {
  reportId: string;
  onClose: () => void;
}

export default function ReportVersionCompareOverlay({ reportId, onClose }: ReportVersionCompareOverlayProps) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    void hydrateReportVersions(reportId).then(() => setTick(n => n + 1));
  }, [reportId]);

  const meta = getReportVersionMeta(reportId);
  void tick;
  const versions = meta.length ? meta.map(m => m.version) : [1];
  const latest = versions[versions.length - 1] ?? 1;
  const [leftV, setLeftV] = useState(versions[0] ?? 1);
  const [rightV, setRightV] = useState(latest);

  useEffect(() => {
    if (!meta.length) return;
    setLeftV(meta[0]!.version);
    setRightV(meta[meta.length - 1]!.version);
  }, [meta.length, reportId]);

  const leftSnap = getReportSnapshotForVersion(reportId, leftV);
  const rightSnap = getReportSnapshotForVersion(reportId, rightV);

  const diffs = useMemo(() => {
    if (!leftSnap || !rightSnap) return [];
    return diffReportLines(leftSnap.lines, rightSnap.lines, rightV);
  }, [leftSnap, rightSnap, rightV]);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-white">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
        <h2 className="text-sm font-heading font-semibold text-[#1F2937]">Compare versions — {reportId}</h2>
        <button type="button" onClick={onClose} className="rounded-lg p-2 text-[#6B7280] hover:bg-[#F4F6F8]" aria-label="Close">
          <X size={20} />
        </button>
      </div>
      <div className="grid flex-1 grid-cols-1 gap-0 overflow-hidden lg:grid-cols-2">
        <ComparePanel
          side="left"
          reportId={reportId}
          value={leftV}
          onChange={setLeftV}
          meta={meta}
          snapshot={leftSnap}
        />
        <ComparePanel
          side="right"
          reportId={reportId}
          value={rightV}
          onChange={setRightV}
          meta={meta}
          snapshot={rightSnap}
          diffs={diffs}
          compareVersion={rightV}
        />
      </div>
    </div>
  );
}

function formatMeta(m: ReportVersionMeta) {
  if (!m.at) return m.kind;
  return `${m.kind} — ${new Date(m.at).toLocaleString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
}

function ComparePanel({
  side,
  reportId,
  value,
  onChange,
  meta,
  snapshot,
  diffs,
  compareVersion,
}: {
  side: 'left' | 'right';
  reportId: string;
  value: number;
  onChange: (v: number) => void;
  meta: ReportVersionMeta[];
  snapshot: ReturnType<typeof getReportSnapshotForVersion>;
  diffs?: ReturnType<typeof diffReportLines>;
  compareVersion?: number;
}) {
  const versionOptions = meta.length ? meta : [{ version: 1, kind: 'Original' as const, at: '', author: '' }];

  return (
    <div className={`flex flex-col overflow-hidden border-[#E5E7EB] ${side === 'left' ? 'border-b lg:border-b-0 lg:border-r' : ''}`}>
      <div className="border-b border-[#E5E7EB] px-4 py-3">
        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-[#6B7280]">
          {side === 'left' ? 'Left' : 'Right'}
        </label>
        <select
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm font-medium text-[#1F2937]"
        >
          {versionOptions.map(m => (
            <option key={m.version} value={m.version}>
              v{m.version} {formatMeta(m)}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {snapshot ? (
          <>
            <p className="text-xs text-[#6B7280]">
              Score {snapshot.score}/100 · {snapshot.defects} defects ({snapshot.criticalDefects} critical)
            </p>
            {side === 'right' && diffs
              ? diffs.map((d, i) => {
                  if (d.type === 'same')
                    return (
                      <p key={`${d.line.id}-${i}`} className="rounded-lg border border-[#F4F6F8] bg-white px-3 py-2 text-sm text-[#374151]">
                        {d.line.text}
                      </p>
                    );
                  if (d.type === 'added')
                    return (
                      <div
                        key={`${d.line.id}-a-${i}`}
                        className="rounded-lg border-l-4 border-l-[#1A7A4A] bg-green-50/50 px-3 py-2 text-sm text-[#1F2937]"
                      >
                        <span className="mb-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-800">
                          Added in v{d.inVersion}
                        </span>
                        <p>{d.line.text}</p>
                      </div>
                    );
                  if (d.type === 'removed')
                    return (
                      <div
                        key={`${d.line.id}-r-${i}`}
                        className="rounded-lg border-l-4 border-l-[#C0392B] bg-red-50/40 px-3 py-2 text-sm text-[#6B7280]"
                      >
                        <span className="mb-1 inline-block rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800">
                          Removed in v{compareVersion}
                        </span>
                        <p className="line-through">{d.line.text}</p>
                      </div>
                    );
                  return (
                    <div
                      key={`${d.line.id}-c-${i}`}
                      className="rounded-lg border-l-4 border-l-[#D35400] bg-amber-50/50 px-3 py-2 text-sm text-[#1F2937]"
                      title={`Was: ${d.oldText}`}
                    >
                      <span className="mb-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                        Changed in v{d.inVersion}
                      </span>
                      <p>{d.line.text}</p>
                      <p className="mt-1 text-xs text-[#6B7280] line-through">Previous: {d.oldText}</p>
                    </div>
                  );
                })
              : snapshot.lines.map(l => (
                  <p key={l.id} className="rounded-lg border border-[#F4F6F8] px-3 py-2 text-sm text-[#374151]">
                    {l.text}
                  </p>
                ))}
          </>
        ) : (
          <p className="text-sm text-[#6B7280]">No snapshot for v{value}.</p>
        )}
      </div>
    </div>
  );
}
