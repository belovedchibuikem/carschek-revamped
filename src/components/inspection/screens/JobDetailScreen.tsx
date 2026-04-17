'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Car, Clock, Copy, MapPin, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { useInspectorHref } from '@/contexts/InspectorRouteContext';
import { findMockJob } from '@/lib/inspection/mockInspectorJobs';
import { db } from '@/lib/db/schema';
import {
  loadSessionTimerSeconds,
  persistSessionTimerSeconds,
  startInspectionSessionDexie,
} from '@/lib/inspection/sessionDexie';
import { useInspectionSessionTimer } from '@/lib/inspection/useInspectionSessionTimer';
import { REPORTS } from '@/lib/mockData';
import type { InspectionLayoutMode } from '@/components/inspection/InspectionSession';

const INSPECTOR_ID = 'INS-001';

type Props = {
  layout: InspectionLayoutMode;
  jobId: string;
};

export function JobDetailScreen({ layout, jobId }: Props) {
  const router = useRouter();
  const href = useInspectorHref();
  const job = findMockJob(jobId);
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);
  const [inspectionStarted, setInspectionStarted] = useState(false);

  useEffect(() => {
    void (async () => {
      const secs = await loadSessionTimerSeconds(jobId);
      if (secs > 0) setInspectionStarted(true);
      if (db) {
        const row = await db.inspections.where('orderId').equals(jobId).first();
        if (row?.status === 'in-progress') setInspectionStarted(true);
      }
      setDraftSavedAt(Date.now());
    })();
  }, [jobId]);

  const sessionSeconds = useInspectionSessionTimer(jobId, inspectionStarted);

  const progressPct = useMemo(() => {
    const base = Math.min(100, Math.round((sessionSeconds / 3600) * 100));
    return inspectionStarted ? Math.max(12, base) : 0;
  }, [sessionSeconds, inspectionStarted]);

  const copyVin = (vin: string) => {
    void navigator.clipboard.writeText(vin);
    toast.success('VIN copied');
  };

  const copyPhone = (phone: string) => {
    void navigator.clipboard.writeText(phone);
    toast.success('Phone copied');
    setPhoneRevealed(true);
  };

  const handleStart = async () => {
    await startInspectionSessionDexie(jobId, INSPECTOR_ID);
    setInspectionStarted(true);
    void persistSessionTimerSeconds(jobId, 0);
    toast.success('Inspection session started');
    router.push(href(`inspect/${jobId}/overview`));
  };

  const handleContinue = () => {
    router.push(href(`inspect/${jobId}/overview`));
  };

  if (!job) {
    return (
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 text-center">
        <p className="text-[#6B7280]">Job not found.</p>
        <Link href={href('jobs')} className="mt-3 inline-block text-sm font-semibold text-[#2E75B6]">
          Back to jobs
        </Link>
      </div>
    );
  }

  const mapHref = `https://maps.google.com/?q=${job.lat},${job.lng}`;
  const titleSuffix = `${job.vehicleLabel}`;

  const topBar =
    layout === 'pwa' ? (
      <div className="mb-4 flex items-center gap-3">
        <Link href={href('jobs')} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white">
          <ArrowLeft size={18} className="text-[#6B7280]" />
        </Link>
        <h1 className="font-heading text-lg font-bold text-[#1F2937]">Job Details</h1>
      </div>
    ) : null;

  const breadcrumbTitle = (
    <div className="mb-2">
      <p className="text-xs text-[#6B7280]">Inspector App · Jobs</p>
      <h1 className="font-heading text-xl font-bold text-[#1F2937]">{jobId} · {titleSuffix}</h1>
    </div>
  );

  const prevReports = REPORTS.slice(0, 3);

  return (
    <div className="space-y-4">
      {layout === 'mobile-app' ? breadcrumbTitle : topBar}

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#1E3A5F]/10">
            <Car size={24} className="text-[#1E3A5F]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-2xl font-bold tracking-tight text-[#1F2937]" style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}>
              {job.plate}
            </p>
            <p className="text-sm text-[#6B7280]">
              {job.vehicleLabel.replace(/^\d+\s+/, '')} · {job.vin.slice(-4)}
            </p>
          </div>
        </div>
        <div className="grid gap-2 text-sm text-[#374151] sm:grid-cols-2">
          <p>
            <span className="text-[#9CA3AF]">Colour</span> Silver
          </p>
          <p>
            <span className="text-[#9CA3AF]">Transmission</span> Automatic
          </p>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="font-mono text-xs text-[#6B7280] break-all">VIN: {job.vin}</span>
          <button type="button" onClick={() => copyVin(job.vin)} className="rounded-lg p-1.5 text-[#2E75B6] hover:bg-[#F4F6F8]" aria-label="Copy VIN">
            <Copy size={14} />
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-[#1F2937]">Customer</h2>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E3A5F] text-xs font-bold text-white">
            {job.customer
              .split(' ')
              .map(w => w[0])
              .join('')
              .slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-[#1F2937]">{job.customer}</p>
            <button
              type="button"
              onClick={() => copyPhone(job.phoneFull)}
              className="mt-0.5 inline-flex items-center gap-1 text-sm text-[#2E75B6]"
            >
              <Phone size={14} />
              {phoneRevealed ? job.phoneFull : job.phoneMasked}
            </button>
          </div>
        </div>
        {job.id === 'ORD-1892' && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <span className="font-semibold">Special notes · </span>
            Customer wants thorough engine check.
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => window.open(mapHref, '_blank')}
        className="relative w-full overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#E8EDF3] text-left transition hover:opacity-95"
      >
        <div className="flex h-36 items-center justify-center gap-2 bg-gradient-to-br from-[#dbeafe] to-[#e0e7ef]">
          <MapPin className="text-[#1E3A5F]" size={28} />
          <span className="text-sm font-semibold text-[#1E3A5F]">Open in Google Maps</span>
        </div>
        <p className="px-4 py-2 text-xs text-[#6B7280]">{job.address}</p>
      </button>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-[#1F2937]">Previous inspections</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-xs">
            <thead>
              <tr className="border-b border-[#F4F6F8] text-[#9CA3AF]">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Inspector</th>
                <th className="pb-2 font-medium">Score</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {prevReports.map(r => (
                <tr key={r.id} className="border-b border-[#F9FAFB] last:border-0">
                  <td className="py-2 font-mono text-[11px] text-[#6B7280]">{r.submittedAt.slice(0, 10)}</td>
                  <td className="py-2 text-[#374151]">{r.inspectorName}</td>
                  <td className="py-2 font-semibold text-[#1E3A5F]">{r.score}</td>
                  <td className="py-2 text-[#6B7280]">{r.status}</td>
                  <td className="py-2 text-right">
                    <Link href={`/reports/${r.id}`} className="font-semibold text-[#2E75B6] hover:underline">
                      View Report →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-[#6B7280]">
        <span>💾 Draft saved</span>
        {draftSavedAt != null && (
          <span className="font-mono text-[11px]">{new Date(draftSavedAt).toLocaleTimeString('en-NG')}</span>
        )}
      </div>

      {!inspectionStarted && (
        <button
          type="button"
          onClick={handleStart}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1E3A5F] py-4 text-base font-bold text-white shadow-lg shadow-[#1E3A5F]/20 transition hover:bg-[#16304F]"
        >
          ▶ Start Inspection
        </button>
      )}

      {inspectionStarted && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleContinue}
            className="relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-[#1E3A5F] py-4 text-base font-bold text-white shadow-lg"
          >
            <div
              className="absolute bottom-0 left-0 top-0 bg-white/10 transition-all"
              style={{ width: `${progressPct}%` }}
            />
            <span className="relative z-10">▶ Continue Inspection</span>
            <span className="relative z-10 rounded-full bg-white/20 px-2 py-0.5 text-xs">{progressPct}%</span>
          </button>
          <div className="flex items-center justify-center gap-2 text-xs text-[#6B7280]">
            <Clock size={12} />
            Session {Math.floor(sessionSeconds / 60)}:{(sessionSeconds % 60).toString().padStart(2, '0')} (saved every 10s)
          </div>
        </div>
      )}
    </div>
  );
}
