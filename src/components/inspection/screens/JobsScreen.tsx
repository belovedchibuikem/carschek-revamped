'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { MapPin, Clock, ChevronRight, Navigation } from 'lucide-react';
import { useInspectorHref } from '@/contexts/InspectorRouteContext';
import { useOnlineStatus } from '@/components/providers/NetworkProvider';
import PwaInstallBanner from '@/components/inspector/PwaInstallBanner';
import {
  MOCK_INSPECTOR_JOBS,
  MOCK_INSPECTOR_NAME,
  type InspectorJobCard,
  type InspectorJobStatusUi,
} from '@/lib/inspection/mockInspectorJobs';
import type { InspectionLayoutMode } from '@/components/inspection/InspectionSession';

function statusChipClass(s: InspectorJobStatusUi): string {
  switch (s) {
    case 'upcoming':
      return 'bg-[#1E3A5F] text-white';
    case 'en-route':
      return 'bg-purple-600 text-white';
    case 'in-progress':
      return 'bg-amber-500 text-white animate-pulse';
    case 'awaiting-qa':
      return 'bg-teal-600 text-white';
    case 'completed':
      return 'bg-[#1A7A4A] text-white';
    default:
      return 'bg-[#6B7280] text-white';
  }
}

function statusLabel(s: InspectorJobStatusUi): string {
  switch (s) {
    case 'upcoming':
      return 'Upcoming';
    case 'en-route':
      return 'En Route';
    case 'in-progress':
      return 'In Progress';
    case 'awaiting-qa':
      return 'Awaiting QA';
    case 'completed':
      return 'Completed';
    default:
      return s;
  }
}

function truncateVin(vin: string, max = 14): string {
  if (vin.length <= max) return vin;
  return `${vin.slice(0, max)}…`;
}

type Props = {
  layout: InspectionLayoutMode;
};

export function JobsScreen({ layout }: Props) {
  const href = useInspectorHref();
  const { online } = useOnlineStatus();
  const [today, setToday] = useState('');

  useEffect(() => {
    setToday(new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
  }, []);

  const stats = useMemo(() => {
    const jobs = MOCK_INSPECTOR_JOBS;
    const todayCount = jobs.length;
    const completed = jobs.filter(j => j.status === 'completed').length;
    const pending = jobs.filter(j => j.status !== 'completed').length;
    const avg =
      jobs.filter(j => j.carschekScore != null).reduce((a, j) => a + (j.carschekScore ?? 0), 0) /
      Math.max(1, jobs.filter(j => j.carschekScore != null).length);
    return {
      todayJobs: todayCount,
      completed,
      pending,
      avgScore: Math.round(avg) || 81,
    };
  }, []);

  const jobCards = (jobs: InspectorJobCard[]) =>
    jobs.map(job => (
      <div
        key={job.id}
        className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusChipClass(job.status)}`}>
            {statusLabel(job.status)}
          </span>
          <span className="shrink-0 font-mono text-xs text-[#6B7280]">
            <Clock size={12} className="mr-1 inline" />
            {job.timeLabel}
          </span>
        </div>
        <h3 className="mb-1 text-base font-semibold text-[#1F2937]">{job.vehicleLabel} — {job.plate}</h3>
        <p className="mb-2 font-mono text-xs text-[#6B7280]">VIN: {truncateVin(job.vin)}</p>
        <p className="mb-1 text-sm text-[#374151]">
          <span className="font-medium">{job.customer}</span>{' '}
          <span className="text-[#9CA3AF]">{job.phoneMasked}</span>
        </p>
        <p className="mb-4 flex items-start gap-1.5 text-xs text-[#6B7280]">
          <MapPin size={14} className="mt-0.5 shrink-0 text-[#2E75B6]" />
          <span>
            {job.address} <span className="text-[#9CA3AF]">•</span> {job.distanceKm} km away
          </span>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.open(`https://maps.google.com/?q=${job.lat},${job.lng}`, '_blank')}
            className="flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-xs font-semibold text-[#374151] transition-colors hover:bg-[#F4F6F8]"
          >
            <Navigation size={14} className="text-[#2E75B6]" /> Navigate
          </button>
          <Link
            href={href(`jobs/${job.id}`)}
            className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-[#1E3A5F] py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#16304F]"
          >
            {job.status === 'completed' ? 'View' : 'Start / View'}
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    ));

  const headerRight = (
    <div className="flex items-center gap-2 text-xs">
      <span className={`h-2.5 w-2.5 rounded-full ${online ? 'bg-emerald-500' : 'bg-amber-500'}`} />
      <span className="font-medium text-[#374151]">{online ? 'Online' : 'Offline'}</span>
      <span className="text-[#9CA3AF]">·</span>
      <span className="text-[#6B7280]">{online ? 'Synced' : 'Local save'}</span>
    </div>
  );

  const inner = (
    <>
      {layout === 'pwa' && <PwaInstallBanner />}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-[#6B7280]">{today || '\u00a0'}</p>
          <h1 className="font-heading text-xl font-bold text-[#1F2937]">
            Good morning, {MOCK_INSPECTOR_NAME.split(' ')[0]} 👋
          </h1>
        </div>
        {headerRight}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Today's Jobs", value: stats.todayJobs },
          { label: 'Completed', value: stats.completed },
          { label: 'Pending', value: stats.pending },
          { label: 'Avg Score (wk)', value: stats.avgScore },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-[#E5E7EB] bg-white p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-[#1E3A5F]">{s.value}</p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-[#9CA3AF]">{s.label}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Assigned jobs</h2>
      <div className="space-y-3">{jobCards(MOCK_INSPECTOR_JOBS)}</div>
    </>
  );

  if (layout === 'mobile-app') {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div>{inner}</div>
        <aside className="hidden lg:block">
          <div className="sticky top-4 space-y-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">This week</p>
            <p className="font-heading text-2xl font-bold text-[#1E3A5F]">{stats.avgScore}</p>
            <p className="text-sm text-[#6B7280]">Average Carschek score across completed inspections.</p>
            <div className="rounded-xl bg-[#F4F6F8] p-3 text-xs text-[#6B7280]">
              Same data as PWA — inspector-app uses the admin shell only.
            </div>
          </div>
        </aside>
      </div>
    );
  }

  return <div className="p-4">{inner}</div>;
}
