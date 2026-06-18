'use client';

import React from 'react';
import { AlertTriangle, Share2, ThumbsDown, ThumbsUp } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import { CarschekScore } from '@/components/shared/CarschekScore';
import type { InspectionReportData } from '@/lib/inspection/reportTypes';

type Props = {
  data: InspectionReportData;
  onShare?: () => void;
  onFlagQa?: () => void;
};

function CategoryBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="flex items-center gap-2 text-xs text-[#374151]">
      <span className="w-16 shrink-0 font-medium">{label}</span>
      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded bg-[#F4F6F8]">
        <div className="h-full rounded bg-[#ff5722]" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-[10px] font-bold">{pct}%</span>
    </div>
  );
}

/** Mobile-first report preview card (reference mockup) before full document scroll. */
export function ReportPreviewSummary({ data, onShare, onFlagQa }: Props) {
  const sc = data.scoreCategories;
  const passN = data.items.filter(i => i.result === 'pass').length;
  const failN = data.defects.length;
  const v = data.vehicle;
  const title = `${v.year} ${v.make} ${v.model}`;

  return (
    <section
      className="no-print overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm"
      aria-label="Report preview summary"
    >
      <div className="flex items-center justify-between border-b border-[#F4F6F8] bg-[#F9FAFB] px-4 py-3">
        <AppLogo size={72} />
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF]">Inspection Report</p>
          <p className="font-mono text-sm font-bold text-[#1F2937]">{data.inspection.reportNumber}</p>
        </div>
      </div>

      <div className="p-4">
        <h2 className="text-base font-bold text-[#1F2937]">{title}</h2>
        <p className="mt-0.5 text-xs text-[#6B7280]">
          {v.plate} · {data.inspector.name}
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
          <CarschekScore score={data.score.total} size={88} animated={false} showLabel />
          <div className="min-w-[10rem] flex-1 space-y-2">
            <CategoryBar label="Body" pct={sc.body} />
            <CategoryBar label="Engine" pct={sc.engine} />
            <CategoryBar label="Interior" pct={sc.interior} />
            <CategoryBar label="Electrical" pct={sc.electrical} />
          </div>
        </div>

        {data.criticalDefects.length > 0 && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5">
            <p className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <AlertTriangle size={14} aria-hidden />
              {data.criticalDefects.length} critical issue{data.criticalDefects.length === 1 ? '' : 's'} found
            </p>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 py-3">
            <ThumbsUp size={18} className="text-[#1A7A4A]" aria-hidden />
            <div className="text-center">
              <p className="text-lg font-bold text-[#1A7A4A]">{passN}</p>
              <p className="text-[10px] font-semibold uppercase text-[#6B7280]">OK</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3">
            <ThumbsDown size={18} className="text-[#C0392B]" aria-hidden />
            <div className="text-center">
              <p className="text-lg font-bold text-[#C0392B]">{failN}</p>
              <p className="text-[10px] font-semibold uppercase text-[#6B7280]">NOT OK</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {onShare && (
            <button
              type="button"
              onClick={onShare}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white py-2.5 text-xs font-bold text-[#374151]"
            >
              <Share2 size={14} aria-hidden /> Share
            </button>
          )}
          {onFlagQa && (
            <button
              type="button"
              onClick={onFlagQa}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 py-2.5 text-xs font-bold text-amber-900"
            >
              <AlertTriangle size={14} aria-hidden /> Flag QA
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
