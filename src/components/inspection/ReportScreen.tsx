'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  ChevronDown,
  Download,
  Flag,
  Loader2,
  Mail,
  Printer,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';
import { captureElementToPdf } from '@/lib/reportPdf';
import { useInspectorHref } from '@/contexts/InspectorRouteContext';
import type { InspectionLayoutMode } from '@/components/inspection/InspectionSession';
import { buildReportData } from '@/lib/inspection/buildReportData';
import type { InspectionReportData, ReportVariant } from '@/lib/inspection/reportTypes';
import { loadDexieVehiclePhotoObjectUrls } from '@/lib/inspection/dexieVehiclePhotos';
import type { VehicleAngleId } from '@/lib/inspection/vehiclePhotoAngles';
import { EMPTY_VEHICLE_PHOTO_MAP, useVehiclePhotoStore } from '@/stores/vehiclePhotoStore';
import { useReportFormatStore } from '@/stores/reportFormatStore';
import { loadReportFormatChoice } from '@/lib/inspection/reportFormatPersistence';
import { ReportDocumentBody } from '@/components/inspection/ReportDocumentBody';

const QRCodeSVG = dynamic(() => import('qrcode.react').then(m => m.QRCodeSVG), { ssr: false });

export type ReportScreenProps = {
  inspectionId: string;
  layout: InspectionLayoutMode;
};

export function ReportScreen({ inspectionId, layout }: ReportScreenProps) {
  const href = useInspectorHref();
  const photoUrls = useVehiclePhotoStore(s => s.urlsByOrder[inspectionId] ?? EMPTY_VEHICLE_PHOTO_MAP);
  const choice = useReportFormatStore(s => s.choiceByInspection[inspectionId]);
  const setReportFormat = useReportFormatStore(s => s.setReportFormat);
  const seedFromDexie = useReportFormatStore(s => s.seedFromDexie);

  const [hydrated, setHydrated] = useState(false);
  const [variant, setVariant] = useState<ReportVariant>('modern');
  const [fade, setFade] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [flagOpen, setFlagOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [flagItemsMode, setFlagItemsMode] = useState(false);
  const [flagItemIds, setFlagItemIds] = useState<Record<string, boolean>>({});
  const [reportData, setReportData] = useState<InspectionReportData | null>(null);
  const [dexiePhotoMap, setDexiePhotoMap] = useState<Partial<Record<VehicleAngleId, string>>>({});
  const [dexieEpoch, setDexieEpoch] = useState(0);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void loadReportFormatChoice(inspectionId).then(v => {
      seedFromDexie(inspectionId, v);
      if (v) setVariant(v);
      setHydrated(true);
    });
  }, [inspectionId, seedFromDexie]);

  useEffect(() => {
    let cancelled = false;
    let revokeDexie: (() => void) | undefined;

    void loadDexieVehiclePhotoObjectUrls(inspectionId).then(({ map, revoke }) => {
      if (cancelled) {
        revoke();
        return;
      }
      revokeDexie = revoke;
      setDexiePhotoMap(map);
    });

    return () => {
      cancelled = true;
      revokeDexie?.();
    };
  }, [inspectionId, dexieEpoch]);

  const mergedPhotoUrls = useMemo(() => ({ ...dexiePhotoMap, ...photoUrls }), [dexiePhotoMap, photoUrls]);

  useEffect(() => {
    void buildReportData(inspectionId, { photoUrls: mergedPhotoUrls }).then(setReportData);
  }, [inspectionId, mergedPhotoUrls]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!shareRef.current?.contains(e.target as Node)) setShareOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const transitionVariant = useCallback(
    (v: ReportVariant) => {
      setFade(0);
      window.setTimeout(() => {
        setVariant(v);
        setReportFormat(inspectionId, v);
        window.requestAnimationFrame(() => setFade(1));
      }, 200);
    },
    [inspectionId, setReportFormat]
  );

  const publicReportUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/reports/RPT-${inspectionId.replace(/[^A-Z0-9-]/gi, '')}`
      : '';

  const downloadPdf = async () => {
    const el = document.getElementById('report-content');
    if (!el) {
      toast.error('Report not ready');
      return;
    }
    setDownloading(true);
    const progressToastId = 'report-pdf-progress';
    try {
      const num = reportData?.inspection.reportNumber.replace(/[^A-Z0-9-]/gi, '') ?? inspectionId.replace(/\D/g, '').slice(-4);
      const fname = `Carschek-Report-${num}-${variant}.pdf`;
      await captureElementToPdf(el, fname, {
        marginMm: 6,
        scale: 2,
        windowWidth: 794,
        onProgress: (phase, page, total) => {
          toast.loading(phase === 'capture' ? 'Capturing report…' : `Rendering page ${page} of ${total}…`, {
            id: progressToastId,
          });
        },
      });
      toast.success(`Report downloaded: ${fname}`, { id: progressToastId });
      setDexieEpoch(e => e + 1);
    } catch (e) {
      console.error(e);
      toast.error('Could not generate PDF', { id: progressToastId });
    } finally {
      setDownloading(false);
    }
  };

  const printReport = () => {
    document.documentElement.classList.add('ck-report-print');
    const off = () => document.documentElement.classList.remove('ck-report-print');
    window.addEventListener('afterprint', off, { once: true });
    window.print();
    window.setTimeout(off, 2000);
  };

  const submitFlag = async () => {
    const flaggedItems = flagItemsMode
      ? reportData?.defects.filter((_, i) => flagItemIds[`d-${i}`]) ?? []
      : [];
    try {
      await fetch(`/api/inspections/${encodeURIComponent(inspectionId)}/flag`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: flagReason,
          specificItems: flagItemsMode,
          flaggedItems,
        }),
      });
      toast.success('Report flagged — QA team will review within 2 hours');
      setFlagOpen(false);
      setFlagReason('');
      setFlagItemsMode(false);
      setFlagItemIds({});
    } catch {
      toast.error('Could not submit flag');
    }
  };

  if (!hydrated || !reportData) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-[#6B7280]">
        <Loader2 className="h-6 w-6 animate-spin text-[#ff5722]" />
        Loading report…
      </div>
    );
  }

  const formatChosen = choice != null;

  if (!formatChosen) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-2 pb-24">
        <div className="flex items-center gap-3">
          <Link
            href={href(`inspect/${inspectionId}/review`)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white"
          >
            <ArrowLeft size={18} className="text-[#6B7280]" />
          </Link>
          <h1 className="font-heading text-lg font-bold text-[#1F2937]">Inspection Report</h1>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-center font-heading text-xl font-bold text-[#1F2937]">Choose Your Report Format</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setReportFormat(inspectionId, 'modern');
                setVariant('modern');
              }}
              className="rounded-2xl border-2 border-[#E5E7EB] bg-[#FAFBFC] p-6 text-left transition hover:border-[#ff5722] hover:shadow-md"
            >
              <p className="text-3xl">📊</p>
              <p className="mt-3 font-heading text-lg font-bold text-[#1F2937]">Modern Report</p>
              <ul className="mt-3 space-y-1.5 text-sm text-[#6B7280]">
                <li>• Visual-first layout</li>
                <li>• Large Carschek Score</li>
                <li>• Photo gallery grid</li>
                <li>• Mobile-friendly</li>
                <li>• Shareable online</li>
              </ul>
              <p className="mt-5 rounded-xl bg-[#ff5722] py-2.5 text-center text-sm font-bold text-white">Select Modern</p>
            </button>
            <button
              type="button"
              onClick={() => {
                setReportFormat(inspectionId, 'classic');
                setVariant('classic');
              }}
              className="rounded-2xl border-2 border-[#E5E7EB] bg-[#FAFBFC] p-6 text-left transition hover:border-[#ff5722] hover:shadow-md"
            >
              <p className="text-3xl">📄</p>
              <p className="mt-3 font-heading text-lg font-bold text-[#1F2937]">Classic Report</p>
              <ul className="mt-3 space-y-1.5 text-sm text-[#6B7280]">
                <li>• Formal A4 layout</li>
                <li>• Dense table structure</li>
                <li>• Print-optimised</li>
                <li>• Black & white</li>
                <li>• Professional PDF</li>
              </ul>
              <p className="mt-5 rounded-xl bg-[#ff5722] py-2.5 text-center text-sm font-bold text-white">Select Classic</p>
            </button>
          </div>
          <p className="mt-6 text-center text-sm text-[#6B7280]">
            Both formats contain identical inspection data.
            <br />
            You can switch between them after selecting.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`inspection-report-root pb-28 ${layout === 'mobile-app' ? 'mx-auto max-w-4xl' : ''}`}>
      <header className="no-print sticky top-0 z-30 mb-4 space-y-3 border-b border-[#E5E7EB] bg-[#F4F6F8]/95 py-3 backdrop-blur supports-[backdrop-filter]:bg-[#F4F6F8]/80">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={href(`inspect/${inspectionId}/review`)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-sm font-semibold text-[#374151]"
          >
            ← Back
          </Link>
          <h1 className="min-w-0 flex-1 font-heading text-base font-bold text-[#1F2937] md:text-lg">
            Carschek Inspection Report — {reportData.inspection.reportNumber}
          </h1>
          <div className="flex w-full items-center justify-center gap-0 rounded-xl border border-[#E5E7EB] bg-white p-0.5 sm:w-auto">
            <button
              type="button"
              onClick={() => transitionVariant('modern')}
              className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-bold sm:flex-initial ${
                variant === 'modern' ? 'bg-[#ff5722] text-white' : 'text-[#6B7280] hover:bg-[#F9FAFB]'
              }`}
            >
              📊 Modern
            </button>
            <button
              type="button"
              onClick={() => transitionVariant('classic')}
              className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-bold sm:flex-initial ${
                variant === 'classic' ? 'bg-[#ff5722] text-white' : 'text-[#6B7280] hover:bg-[#F9FAFB]'
              }`}
            >
              📄 Classic
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            disabled={downloading}
            onClick={() => void downloadPdf()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#ff5722] px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
          >
            {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {downloading ? 'Preparing PDF…' : '⬇ Download PDF'}
          </button>
          <button
            type="button"
            onClick={printReport}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-bold text-[#374151]"
          >
            <Printer size={14} /> Print
          </button>
          <div className="relative" ref={shareRef}>
            <button
              type="button"
              onClick={() => setShareOpen(o => !o)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-bold text-[#374151]"
            >
              <Share2 size={14} /> Share <ChevronDown size={12} />
            </button>
            {shareOpen && (
              <div className="absolute right-0 z-50 mt-1 w-56 rounded-xl border border-[#E5E7EB] bg-white py-1 shadow-lg">
                <button
                  type="button"
                  className="flex w-full px-3 py-2 text-left text-xs hover:bg-[#F4F6F8]"
                  onClick={() => {
                    window.open(`https://wa.me/?text=${encodeURIComponent(`Carschek Report ${publicReportUrl}`)}`, '_blank');
                    setShareOpen(false);
                  }}
                >
                  📱 Share via WhatsApp
                </button>
                <button
                  type="button"
                  className="flex w-full px-3 py-2 text-left text-xs hover:bg-[#F4F6F8]"
                  onClick={() => {
                    window.open(`sms:?body=${encodeURIComponent(`Carschek Report ${publicReportUrl}`)}`, '_blank');
                    setShareOpen(false);
                  }}
                >
                  💬 Share via SMS
                </button>
                <button
                  type="button"
                  className="flex w-full px-3 py-2 text-left text-xs hover:bg-[#F4F6F8]"
                  onClick={() => {
                    void navigator.clipboard.writeText(publicReportUrl);
                    toast.success('Copied!', { duration: 3000 });
                    setShareOpen(false);
                  }}
                >
                  🔗 Copy Link
                </button>
                <button
                  type="button"
                  className="flex w-full px-3 py-2 text-left text-xs hover:bg-[#F4F6F8]"
                  onClick={() => {
                    window.open(
                      `mailto:?subject=${encodeURIComponent('Carschek Report')}&body=${encodeURIComponent(publicReportUrl)}`,
                      '_blank'
                    );
                    setShareOpen(false);
                  }}
                >
                  <Mail size={12} className="mr-1 inline" /> Email Report
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setFlagOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900"
          >
            <Flag size={14} /> Flag for QA
          </button>
        </div>
      </header>

      <div
        id="report-content"
        className={`report-content mx-auto w-full max-w-[794px] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm print:border-0 print:shadow-none ${
          variant === 'modern' ? 'report-modern' : 'report-classic'
        }`}
        style={{
          opacity: fade,
          transition: 'opacity 200ms ease-out',
        }}
      >
        <ReportDocumentBody data={reportData} variant={variant} QRCode={QRCodeSVG} />
      </div>

      <Link
        href={href('jobs')}
        className="no-print mt-6 block w-full rounded-2xl bg-[#ff5722] py-3 text-center text-sm font-bold text-white"
      >
        Back to Jobs
      </Link>

      {flagOpen && (
        <div
          className="no-print fixed inset-0 z-[200] flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="flag-report-title"
          onClick={() => setFlagOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <h2 id="flag-report-title" className="font-heading text-lg font-bold text-[#1F2937]">
              Flag Report for QA Review
            </h2>
            <p className="mt-2 text-sm text-[#6B7280]">Describe what needs reviewing…</p>
            <textarea
              value={flagReason}
              onChange={e => setFlagReason(e.target.value)}
              rows={4}
              className="mt-3 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
              placeholder="Reason for QA flag…"
            />
            <label className="mt-4 flex items-center gap-2 text-sm font-medium text-[#374151]">
              <input
                type="checkbox"
                checked={flagItemsMode}
                onChange={e => setFlagItemsMode(e.target.checked)}
                className="rounded border-[#E5E7EB]"
              />
              Specific items need correction
            </label>
            {flagItemsMode && reportData.defects.length > 0 && (
              <ul className="mt-3 max-h-40 space-y-2 overflow-y-auto rounded-xl border border-[#F4F6F8] bg-[#F9FAFB] p-3 text-xs">
                {reportData.defects.map((d, i) => (
                  <li key={`${d.sectionId}-${d.itemLabel}-${i}`} className="flex gap-2">
                    <input
                      type="checkbox"
                      checked={!!flagItemIds[`d-${i}`]}
                      onChange={e => setFlagItemIds(m => ({ ...m, [`d-${i}`]: e.target.checked }))}
                      className="mt-0.5 rounded border-[#E5E7EB]"
                    />
                    <span>
                      <span className="font-semibold text-[#1F2937]">{d.sectionName}</span> — {d.itemLabel} ({d.severity})
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {flagItemsMode && reportData.defects.length === 0 && (
              <p className="mt-2 text-xs text-[#9CA3AF]">No failed items recorded in this inspection snapshot.</p>
            )}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setFlagOpen(false)}
                className="flex-1 rounded-xl border border-[#E5E7EB] py-3 text-sm font-semibold text-[#6B7280]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void submitFlag()}
                className="flex-1 rounded-xl bg-[#ff5722] py-3 text-sm font-bold text-white"
              >
                Submit Flag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
