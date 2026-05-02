'use client';
import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Share2, ChevronDown } from 'lucide-react';
import { REPORTS, getScoreColor, getScoreLabel } from '@/lib/mockData';
import { toast } from 'sonner';
import { openPrintableReport } from '@/lib/print';
import { CarschekScore } from '@/components/shared/CarschekScore';
import {
  getReportVersionMeta,
  getDefaultVersionForReport,
  mergeReportWithSnapshot,
} from '@/lib/reports/reportVersions';
import ReportVersionCompareOverlay from '@/components/reports/ReportVersionCompareOverlay';

const ACCESS_KEY = (id: string) => `report-view-${id}`;

export default function ReportViewPage() {
  const pathname = usePathname();
  const params = useParams();
  const reportId = params.id as string;
  const report = REPORTS.find(r => r.id === reportId) || REPORTS[0];
  const versionMeta = getReportVersionMeta(report.id);
  const [viewVersion, setViewVersion] = useState(() => getDefaultVersionForReport(reportId, report.version));
  const [compareOpen, setCompareOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'modern' | 'classic'>('modern');
  const [shareAccess, setShareAccess] = useState(false);

  useEffect(() => {
    const r = REPORTS.find(x => x.id === reportId) || REPORTS[0];
    setViewVersion(getDefaultVersionForReport(reportId, r.version));
  }, [reportId]);

  const displayReport = mergeReportWithSnapshot(report.id, report, viewVersion);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    if (p.get('access') === 'demo') {
      sessionStorage.setItem(ACCESS_KEY(reportId), '1');
    }
    setShareAccess(sessionStorage.getItem(ACCESS_KEY(reportId)) === '1');
  }, [reportId]);

  const copyShareLink = () => {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/reports/${report.id}?access=demo`;
    void navigator.clipboard.writeText(url);
    toast.success('Share link copied (demo access flag)');
  };

  const printPdf = () => {
    openPrintableReport({
      title: `Inspection report ${displayReport.id}`,
      subtitle: displayReport.carName,
      bodyHtml: `
        <table>
          <tbody>
            <tr><th>Vehicle</th><td>${escapeAttr(displayReport.carName)}</td></tr>
            <tr><th>Inspector</th><td>${escapeAttr(displayReport.inspectorName)}</td></tr>
            <tr><th>Score</th><td>${displayReport.score}/100 — ${escapeAttr(getScoreLabel(displayReport.score))}</td></tr>
            <tr><th>Defects</th><td>${displayReport.defects} (${displayReport.criticalDefects} critical)</td></tr>
            <tr><th>Status</th><td>${escapeAttr(displayReport.status)}</td></tr>
            <tr><th>Version</th><td>v${viewVersion}</td></tr>
            <tr><th>Submitted</th><td>${escapeAttr(new Date(displayReport.submittedAt).toLocaleString('en-NG'))}</td></tr>
          </tbody>
        </table>`,
    });
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
              <p className="text-sm text-[#6B7280]">{report.carName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#F4F6F8] rounded-lg p-1">
              <button onClick={() => setViewMode('modern')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'modern' ? 'bg-white shadow-sm text-[#1F2937]' : 'text-[#6B7280]'}`}>Modern</button>
              <button onClick={() => setViewMode('classic')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'classic' ? 'bg-white shadow-sm text-[#1F2937]' : 'text-[#6B7280]'}`}>Classic</button>
            </div>
            <button type="button" onClick={printPdf} className="flex items-center gap-2 px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F4F6F8] transition-colors">
              <Download size={15} /> Print / PDF
            </button>
            <button type="button" onClick={copyShareLink} className="flex items-center gap-2 px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F4F6F8] transition-colors">
              <Share2 size={15} /> Share
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          {viewMode === 'modern' ? (
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E5E7EB]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 bg-[#ff5722] rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">CK</span>
                    </div>
                    <span className="text-lg font-heading font-bold text-[#ff5722]">CARSCHEK</span>
                  </div>
                  <p className="text-xs text-[#6B7280]">Vehicle Inspection Report</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-[#1F2937]">{displayReport.id}</p>
                  <p className="text-xs text-[#6B7280]">{new Date(displayReport.submittedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>

              {/* Score + Vehicle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center gap-5">
                  <CarschekScore score={displayReport.score} size={96} showLabel />
                  <div>
                    <p className="text-sm text-[#6B7280]">Carschek Score (v{viewVersion})</p>
                    <p className="text-lg font-heading font-bold" style={{ color: getScoreColor(displayReport.score) }}>
                      {getScoreLabel(displayReport.score)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-[#6B7280]">{displayReport.defects} defects</span>
                      {displayReport.criticalDefects > 0 && (
                        <span className="text-xs font-semibold text-[#C0392B]">{displayReport.criticalDefects} critical</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Vehicle</span>
                    <span className="font-medium text-[#1F2937]">{displayReport.carName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Inspector</span>
                    <span className="font-medium text-[#1F2937]">{displayReport.inspectorName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Status</span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${displayReport.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                    >
                      {displayReport.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Version</span>
                    <span className="font-medium text-[#1F2937]">v{displayReport.version}</span>
                  </div>
                </div>
              </div>

              {/* Summary stats */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Total Items', value: 127, color: '#ff5722' },
                  { label: 'Passed', value: 123 - displayReport.defects, color: '#1A7A4A' },
                  { label: 'Failed', value: displayReport.defects, color: '#C0392B' },
                  { label: 'N/A', value: 4, color: '#6B7280' },
                ].map(s => (
                  <div key={s.label} className="text-center p-3 bg-[#F9FAFB] rounded-xl">
                    <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-xs text-[#6B7280]">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="text-center mb-6 pb-4 border-b-2 border-[#ff5722]">
                <h2 className="text-xl font-heading font-bold text-[#ff5722]">CARSCHEK VEHICLE INSPECTION REPORT</h2>
                <p className="text-sm text-[#6B7280] mt-1">
                  Report ID: {displayReport.id} | Date: {new Date(displayReport.submittedAt).toLocaleDateString('en-NG')} | v{viewVersion}
                </p>
              </div>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {[
                    ['Vehicle', displayReport.carName],
                    ['Inspector', displayReport.inspectorName],
                    ['Carschek Score', `${displayReport.score}/100 — ${getScoreLabel(displayReport.score)}`],
                    ['Total Defects', `${displayReport.defects} (${displayReport.criticalDefects} critical)`],
                    ['Status', displayReport.status],
                  ].map(([label, value]) => (
                    <tr key={label} className="border border-[#E5E7EB]">
                      <td className="px-4 py-2.5 bg-[#F9FAFB] font-semibold text-[#374151] w-40">{label}</td>
                      <td className="px-4 py-2.5 text-[#1F2937]">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {compareOpen ? <ReportVersionCompareOverlay reportId={report.id} onClose={() => setCompareOpen(false)} /> : null}
    </AppLayout>
  );
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}
