'use client';
import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, Download, Share2, ChevronDown, Loader2 } from 'lucide-react';

import { toast } from 'sonner';
import {
  getReportVersionMeta,
  getDefaultVersionForReport,
  hydrateReportVersions,
  mergeReportWithSnapshot,
} from '@/lib/reports/reportVersions';
import ReportVersionCompareOverlay from '@/components/reports/ReportVersionCompareOverlay';
import { ReportDocumentBody } from '@/components/inspection/ReportDocumentBody';
import { buildReportData } from '@/lib/inspection/buildReportData';
import { buildFallbackReportData } from '@/lib/inspection/buildFallbackReportData';
import type { InspectionReportData, ReportVariant } from '@/lib/inspection/reportTypes';
import { loadDexieVehiclePhotoObjectUrls } from '@/lib/inspection/dexieVehiclePhotos';
import type { VehicleAngleId } from '@/lib/inspection/vehiclePhotoAngles';
import { EMPTY_VEHICLE_PHOTO_MAP, useVehiclePhotoStore } from '@/stores/vehiclePhotoStore';
import { captureElementToPdf } from '@/lib/reportPdf';
import { reportsApi } from '@/lib/api/services';
import { useApiResource } from '@/hooks/useApiResource';

const QRCodeSVG = dynamic(() => import('qrcode.react').then(m => m.QRCodeSVG), { ssr: false });

const ACCESS_KEY = (id: string) => `report-view-${id}`;

export default function ReportViewPage() {
  const pathname = usePathname();
  const params = useParams();
  const reportId = params.id as string;
  const { data: report, loading, error } = useApiResource(() => reportsApi.get(reportId), [reportId]);
  const [viewVersion, setViewVersion] = useState(1);
  const [versionsReady, setVersionsReady] = useState(0);
  const [compareOpen, setCompareOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ReportVariant>('modern');
  const [shareAccess, setShareAccess] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const orderId = (report?.orderId || '').trim();
  const buildKey = orderId || report?.id || '';
  const versionMeta = report ? getReportVersionMeta(report.id, report) : [];
  void versionsReady;

  // Same data pipeline as the inspector report screen (Dexie checklist + photos)
  const storePhotoUrls = useVehiclePhotoStore(s => s.urlsByOrder[buildKey] ?? EMPTY_VEHICLE_PHOTO_MAP);
  const [dexiePhotoMap, setDexiePhotoMap] = useState<Partial<Record<VehicleAngleId, string>>>({});
  const [reportData, setReportData] = useState<InspectionReportData | null>(null);

  useEffect(() => {
    if (!report) return;
    let cancelled = false;
    void hydrateReportVersions(reportId, report).then(() => {
      if (cancelled) return;
      setVersionsReady(n => n + 1);
      setViewVersion(getDefaultVersionForReport(reportId, report.version, report));
    });
    return () => {
      cancelled = true;
    };
  }, [reportId, report]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    if (p.get('access') === 'demo') {
      sessionStorage.setItem(ACCESS_KEY(reportId), '1');
    }
    setShareAccess(sessionStorage.getItem(ACCESS_KEY(reportId)) === '1');
  }, [reportId]);

  useEffect(() => {
    if (!buildKey) return;
    let cancelled = false;
    let revokeDexie: (() => void) | undefined;
    void loadDexieVehiclePhotoObjectUrls(buildKey).then(({ map, revoke }) => {
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
  }, [buildKey]);

  const mergedPhotoUrls = useMemo(() => ({ ...dexiePhotoMap, ...storePhotoUrls }), [dexiePhotoMap, storePhotoUrls]);

  useEffect(() => {
    if (!report) return;
    let cancelled = false;
    setGenerateError(null);
    setReportData(null);

    const payload =
      report && typeof report === 'object' && 'payload' in report
        ? ((report as { payload?: Record<string, unknown> | null }).payload ?? null)
        : null;
    const hasPayloadItems = Array.isArray(payload?.items) && (payload.items as unknown[]).length > 0;

    const applyFallback = (reason?: string) => {
      if (cancelled) return;
      setReportData(
        buildFallbackReportData({
          id: report.id,
          orderId: report.orderId,
          carName: report.carName,
          inspectorName: report.inspectorName,
          score: report.score,
          version: report.version,
          submittedAt: report.submittedAt,
          defects: report.defects,
          criticalDefects: report.criticalDefects,
          payload,
        })
      );
      if (reason) setGenerateError(reason);
    };

    // Migrated/orphan reports: prefer payload checklist over empty local Dexie.
    if (!orderId && hasPayloadItems) {
      applyFallback();
      return () => {
        cancelled = true;
      };
    }

    if (!buildKey) {
      applyFallback('Report has no linked order; showing available details.');
      return () => {
        cancelled = true;
      };
    }

    void buildReportData(buildKey, {
      photoUrls: mergedPhotoUrls,
      fallbackScore: report.score,
      inspectorName: report.inspectorName,
    })
      .then(data => {
        if (cancelled) return;
        // If checklist was empty but API payload has items, prefer the richer payload view.
        const answered = data.items.some(i => i.result != null) || data.sectionBreakdowns.some(s => s.lines.length > 0);
        if (!answered && hasPayloadItems) {
          applyFallback();
          return;
        }
        setReportData(data);
      })
      .catch(err => {
        console.error(err);
        applyFallback(err instanceof Error ? err.message : 'Could not build live checklist; showing summary.');
      });

    return () => {
      cancelled = true;
    };
  }, [buildKey, orderId, mergedPhotoUrls, report]);

  if (loading) {
    return (
      <AppLayout currentPath={pathname}>
        <div className="p-8 text-sm text-[#6B7280]">Loading report…</div>
      </AppLayout>
    );
  }
  if (error || !report) {
    return (
      <AppLayout currentPath={pathname}>
        <div className="p-8 text-sm text-red-700">{error || 'Report not found'}</div>
      </AppLayout>
    );
  }

  const displayReport = mergeReportWithSnapshot(report.id, report, viewVersion);

  const copyShareLink = () => {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/reports/${report.id}?access=demo`;
    void navigator.clipboard.writeText(url);
    toast.success('Share link copied (demo access flag)');
  };

  // Shared smart-page-break PDF — identical output to the inspector app
  const downloadPdf = async () => {
    const el = document.getElementById('report-content');
    if (!el || !reportData) {
      toast.error('Report not ready');
      return;
    }
    setDownloading(true);
    const progressToastId = 'report-pdf-progress';
    try {
      const num = reportData.inspection.reportNumber.replace(/[^A-Z0-9-]/gi, '');
      const fname = `Carschek-Report-${num}-${viewMode}.pdf`;
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
    } catch (e) {
      console.error(e);
      toast.error('Could not generate PDF', { id: progressToastId });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-5">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <strong className="font-semibold">Access (design-phase mock):</strong>{' '}
          Production will validate share tokens. For demo, open with <code className="font-mono text-xs bg-white/80 px-1 rounded">?access=demo</code> or{' '}
          <button type="button" className="text-[#ff5722] font-semibold underline" onClick={() => { sessionStorage.setItem(ACCESS_KEY(reportId), '1'); setShareAccess(true); toast.success('Demo access enabled for this browser'); }}>
            unlock in this session
          </button>
          . {shareAccess ? 'Session unlocked.' : ''}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-[#374151]">QA / status</span>
          <span
            className={`rounded-full px-2.5 py-0.5 font-semibold ${displayReport.status === 'Approved' ? 'bg-green-100 text-green-800' : displayReport.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-900'}`}
          >
            {displayReport.status}
          </span>
          {displayReport.criticalDefects > 0 && (
            <span className="rounded-full bg-[#C0392B]/10 text-[#C0392B] px-2.5 py-0.5 font-semibold">
              Critical defects: {displayReport.criticalDefects}
            </span>
          )}
          <span className="text-[#6B7280]">v{displayReport.version}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3">
          <span className="text-sm font-medium text-[#374151]">
            Viewing version {viewVersion} of {Math.max(versionMeta.length, 1)}
          </span>
          <div className="relative">
            <select
              value={viewVersion}
              onChange={e => setViewVersion(Number(e.target.value))}
              className="appearance-none rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] py-2 pl-3 pr-9 text-sm font-medium text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
            >
              {versionMeta.map(m => (
                <option key={m.version} value={m.version}>
                  v{m.version} {m.kind} —{' '}
                  {new Date(m.at).toLocaleString('en-NG', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          </div>
          <button
            type="button"
            onClick={() => setCompareOpen(true)}
            className="ml-auto rounded-lg border border-[#ff5722] px-3 py-2 text-sm font-semibold text-[#ff5722] hover:bg-[#ff5722]/5"
          >
            Compare Versions
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/reports" className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E7EB] hover:bg-[#F4F6F8] transition-colors">
              <ArrowLeft size={16} className="text-[#6B7280]" />
            </Link>
            <div>
              <h1 className="text-xl font-heading font-bold text-[#1F2937]">{report.id}</h1>
              <p className="text-sm text-[#6B7280]">
                {report.carName || 'Vehicle report'}
                {orderId ? (
                  <>
                    {' '}
                    · Order <span className="font-mono text-xs">{orderId}</span>
                  </>
                ) : null}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#F4F6F8] rounded-lg p-1">
              <button onClick={() => setViewMode('modern')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'modern' ? 'bg-white shadow-sm text-[#1F2937]' : 'text-[#6B7280]'}`}>📊 Modern</button>
              <button onClick={() => setViewMode('classic')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'classic' ? 'bg-white shadow-sm text-[#1F2937]' : 'text-[#6B7280]'}`}>📄 Classic</button>
            </div>
            <button
              type="button"
              disabled={downloading || !reportData}
              onClick={() => void downloadPdf()}
              className="flex items-center gap-2 px-3 py-2.5 bg-[#ff5722] text-white rounded-lg text-sm font-semibold hover:bg-[#e64a19] transition-colors disabled:opacity-60"
            >
              {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
              {downloading ? 'Preparing PDF…' : 'Download PDF'}
            </button>
            <button type="button" onClick={copyShareLink} className="flex items-center gap-2 px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F4F6F8] transition-colors">
              <Share2 size={15} /> Share
            </button>
          </div>
        </div>

        {/* Full report document — same shared renderer as the inspector app */}
        {generateError ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            {generateError}
          </div>
        ) : null}
        {reportData ? (
          <div
            id="report-content"
            className={`report-content mx-auto w-full max-w-[794px] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm print:border-0 print:shadow-none ${
              viewMode === 'modern' ? 'report-modern' : 'report-classic'
            }`}
          >
            <ReportDocumentBody data={reportData} variant={viewMode} QRCode={QRCodeSVG} />
          </div>
        ) : (
          <div className="flex min-h-[40vh] items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white text-[#6B7280]">
            <Loader2 className="h-6 w-6 animate-spin text-[#ff5722]" />
            Generating report…
          </div>
        )}
      </div>

      {compareOpen ? <ReportVersionCompareOverlay reportId={report.id} onClose={() => setCompareOpen(false)} /> : null}
    </AppLayout>
  );
}
