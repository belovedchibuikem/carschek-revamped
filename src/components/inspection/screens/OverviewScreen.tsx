'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, Camera, Check, Clock, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { useInspectorHref } from '@/contexts/InspectorRouteContext';
import { INSPECTION_SECTIONS } from '@/lib/mockData';
import { loadInspectionChecklistMetrics } from '@/lib/inspection/checklistMetrics';
import { saveOverviewSectionStatus, type OverviewSectionsPayload, type SectionDotStatus } from '@/lib/inspection/sessionDexie';
import { useInspectionSessionTimer } from '@/lib/inspection/useInspectionSessionTimer';
import { findMockJob } from '@/lib/inspection/mockInspectorJobs';
import type { InspectionLayoutMode } from '@/components/inspection/InspectionSession';

type Props = {
  layout: InspectionLayoutMode;
  jobId: string;
};

function SectionStatusIcon({ status }: { status: SectionDotStatus }) {
  switch (status) {
    case 'complete-pass':
      return <Check className="h-4 w-4 text-emerald-500" strokeWidth={2.5} aria-hidden />;
    case 'complete-fail':
      return <X className="h-4 w-4 text-red-500" strokeWidth={2.5} aria-hidden />;
    case 'in-progress':
      return <div className="h-3.5 w-3.5 rounded-full bg-amber-500 ring-2 ring-amber-200/80" aria-hidden />;
    default:
      return <div className="h-4 w-4 rounded-full border-2 border-[#D1D5DB] bg-white" aria-hidden />;
  }
}

export function OverviewScreen({ layout, jobId }: Props) {
  const href = useInspectorHref();
  const elapsed = useInspectionSessionTimer(jobId, true);
  const [sectionMap, setSectionMap] = useState<OverviewSectionsPayload>({});
  const [vehicleCaptured, setVehicleCaptured] = useState(0);
  const [damageCount, setDamageCount] = useState(0);
  const [itemsDone, setItemsDone] = useState(0);
  const [minutesLeft, setMinutesLeft] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [failed, setFailed] = useState(0);

  const vehicleTitle = findMockJob(jobId)?.vehicleLabel ?? `Inspection ${jobId}`;

  const persistMap = useCallback(
    (next: OverviewSectionsPayload) => {
      setSectionMap(next);
      void saveOverviewSectionStatus(jobId, next);
    },
    [jobId]
  );

  const refreshMetrics = useCallback(() => {
    void loadInspectionChecklistMetrics(jobId).then(m => {
      setSectionMap(m.sectionStatus);
      void saveOverviewSectionStatus(jobId, m.sectionStatus);
      setVehicleCaptured(m.vehiclePhotosCaptured);
      setDamageCount(m.damagePhotoCount);
      setItemsDone(m.itemsDone);
      setMinutesLeft(m.minutesRemaining);
      setCompleted(m.sectionsComplete);
      setFailed(m.sectionsFailed);
    });
  }, [jobId]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const sectionDots = useMemo(() => {
    return INSPECTION_SECTIONS.map(s => {
      const st = sectionMap[s.id] ?? 'not-started';
      return { section: s, status: st };
    });
  }, [sectionMap]);

  useEffect(() => {
    refreshMetrics();
  }, [refreshMetrics]);

  useEffect(() => {
    const onFocus = () => refreshMetrics();
    const onVis = () => {
      if (document.visibilityState === 'visible') refreshMetrics();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [refreshMetrics]);

  const totalSections = INSPECTION_SECTIONS.length;
  const progressPct = totalSections ? (completed / totalSections) * 100 : 0;

  const allDone = completed >= totalSections - 1;

  const handleAllPass = () => {
    if (!confirm('Mark all remaining sections as pass?')) return;
    const next: OverviewSectionsPayload = { ...sectionMap };
    INSPECTION_SECTIONS.forEach(s => {
      const cur = next[s.id] ?? 'not-started';
      if (cur === 'not-started' || cur === 'in-progress') next[s.id] = 'complete-pass';
    });
    persistMap(next);
    toast.success('All remaining sections marked as pass');
  };

  const vehiclePhotosHref = href(`inspect/${jobId}/vehicle-photos`);
  const damagePhotosHref = href(`inspect/${jobId}/damage-photos`);
  const reviewHref = href(`inspect/${jobId}/review`);

  const vehiclePhotoStatusIcon =
    vehicleCaptured >= 11 ? (
      <Check className="h-5 w-5 text-emerald-500" strokeWidth={2.5} aria-hidden />
    ) : vehicleCaptured > 0 ? (
      <div className="h-4 w-4 rounded-full bg-amber-400 ring-2 ring-amber-100" aria-hidden />
    ) : (
      <div className="h-4 w-4 rounded-full border-2 border-[#D1D5DB] bg-white" aria-hidden />
    );

  const damagePhotoStatusIcon =
    damageCount > 0 ? (
      <AlertTriangle className="h-5 w-5 text-red-500" aria-hidden />
    ) : (
      <div className="h-4 w-4 rounded-full border-2 border-[#D1D5DB] bg-white" aria-hidden />
    );

  const ringR = 26;
  const ringC = 2 * Math.PI * ringR;

  return (
    <div
      data-inspection-layout={layout}
      className={`space-y-5 pb-8 ${layout === 'mobile-app' ? 'mx-auto max-w-lg' : ''}`}
    >
      <div className="overflow-hidden rounded-b-3xl bg-[#ff5722] text-white shadow-lg">
        <div className="flex items-start gap-2 px-4 pb-2 pt-3">
          <Link
            href={href(`jobs/${jobId}`)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-sm"
            aria-label="Back to job"
          >
            <ArrowLeft size={18} className="text-white" aria-hidden />
          </Link>
          <div className="min-w-0 flex-1 pt-0.5">
            <h1 className="truncate font-heading text-base font-bold leading-tight sm:text-lg">{vehicleTitle}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-2.5 py-2 backdrop-blur-sm">
            <Clock size={14} className="text-amber-200" aria-hidden />
            <span className="font-mono text-sm font-bold tabular-nums">{formatTime(elapsed)}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 px-4 pb-5 pt-2">
          <div className="relative h-24 w-24 shrink-0">
            <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90" aria-hidden>
              <circle cx="32" cy="32" r={ringR} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="6" />
              <circle
                cx="32"
                cy="32"
                r={ringR}
                fill="none"
                stroke="#4ADE80"
                strokeWidth="6"
                strokeDasharray={`${ringC}`}
                strokeDashoffset={`${ringC * (1 - progressPct / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold tabular-nums">{Math.round(progressPct)}%</span>
            </div>
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-sm font-bold">
              {completed}/{totalSections} Sections
            </p>
            <p className="text-xs text-white/85">{itemsDone} items done</p>
            <p className={`text-xs font-semibold ${failed > 0 ? 'text-red-300' : 'text-white/70'}`}>
              {failed} defect{failed === 1 ? '' : 's'}
            </p>
            <p className="text-xs text-white/65">~{minutesLeft} min left</p>
          </div>
        </div>
      </div>

      <div className="px-1">
        <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">Inspection checklist</p>
        <div className="grid grid-cols-3 gap-2">
          {sectionDots.map(({ section, status }) => (
            <Link
              key={section.id}
              href={href(`inspect/${jobId}/section/${section.id}`)}
              onClick={() => {
                persistMap({
                  ...sectionMap,
                  [section.id]:
                    sectionMap[section.id] === 'not-started' ? 'in-progress' : (sectionMap[section.id] ?? 'in-progress'),
                });
              }}
              className="flex flex-col rounded-2xl border border-[#E5E7EB] bg-white p-2.5 shadow-sm transition hover:border-[#ff8a65]/35 hover:shadow-md"
            >
              <div className="mb-1.5 flex items-start justify-end">
                <span className="sr-only">
                  {status === 'complete-pass' ? 'Complete' : status === 'complete-fail' ? 'Defects' : status === 'in-progress' ? 'In progress' : 'Not started'}
                </span>
                <SectionStatusIcon status={status} />
              </div>
              <p className="line-clamp-3 min-h-[2.75rem] text-[11px] font-semibold leading-snug text-[#1F2937]">{section.name}</p>
              <p className="mt-1 text-[10px] text-[#9CA3AF]">
                {section.items} items · {section.timeEstimate}
              </p>
            </Link>
          ))}
        </div>
        <button
          type="button"
          onClick={handleAllPass}
          className="mt-3 w-full rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] py-2 text-[11px] font-semibold text-[#6B7280] transition hover:bg-[#F4F6F8]"
        >
          Mark all remaining sections as pass
        </button>
      </div>

      <div className="px-1">
        <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">Photo documentation</p>
        <div className="space-y-2">
          <Link
            href={vehiclePhotosHref}
            className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-sm transition hover:border-[#ff8a65]/40"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EEF4FB]">
              <Camera className="text-[#ff8a65]" size={22} aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#1F2937]">Vehicle Photos</p>
              <p className="text-xs text-[#6B7280]">11 standard vehicle photos</p>
              <p className="mt-0.5 text-[11px] text-[#9CA3AF]">~3 min</p>
            </div>
            {vehiclePhotoStatusIcon}
          </Link>

          <Link
            href={damagePhotosHref}
            className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-sm transition hover:border-[#D35400]/35"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50">
              <AlertTriangle className="text-[#D35400]" size={22} aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-bold text-[#1F2937]">Damage Photos</p>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-orange-800">
                  <Sparkles size={10} aria-hidden /> AI
                </span>
              </div>
              <p className="text-xs text-[#6B7280]">Add damage photos with AI scan</p>
              <p className="mt-0.5 text-[11px] text-[#9CA3AF]">~2 min</p>
            </div>
            {damagePhotoStatusIcon}
          </Link>
        </div>
      </div>

      {allDone && (
        <div className="px-1">
          <Link
            href={reviewHref}
            className="flex w-full items-center justify-center rounded-2xl bg-[#1B7143] py-3.5 text-center text-sm font-bold text-white shadow-md"
          >
            Review &amp; Submit
          </Link>
        </div>
      )}
    </div>
  );
}
