'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { REPORTS, getScoreColor, getScoreLabel } from '@/lib/mockData';
import { toast } from 'sonner';

export default function ReportViewPage() {
  const pathname = usePathname();
  const params = useParams();
  const reportId = params.id as string;
  const report = REPORTS.find(r => r.id === reportId) || REPORTS[0];
  const [viewMode, setViewMode] = useState<'modern' | 'classic'>('modern');

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-5">
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
            <button onClick={() => toast.success('PDF downloading…')} className="flex items-center gap-2 px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F4F6F8] transition-colors">
              <Download size={15} /> PDF
            </button>
            <button onClick={() => toast.success('Share link copied!')} className="flex items-center gap-2 px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F4F6F8] transition-colors">
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
                    <div className="w-8 h-8 bg-[#1E3A5F] rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">CK</span>
                    </div>
                    <span className="text-lg font-heading font-bold text-[#1E3A5F]">CARSCHEK</span>
                  </div>
                  <p className="text-xs text-[#6B7280]">Vehicle Inspection Report</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-[#1F2937]">{report.id}</p>
                  <p className="text-xs text-[#6B7280]">{new Date(report.submittedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>

              {/* Score + Vehicle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center gap-5">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                      <circle cx="40" cy="40" r="32" fill="none" stroke="#F4F6F8" strokeWidth="8" />
                      <circle cx="40" cy="40" r="32" fill="none" stroke={getScoreColor(report.score)} strokeWidth="8"
                        strokeDasharray={`${2 * Math.PI * 32}`}
                        strokeDashoffset={`${2 * Math.PI * 32 * (1 - report.score / 100)}`}
                        strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-[#1F2937]">{report.score}</span>
                      <span className="text-[10px] text-[#6B7280]">/100</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-heading font-bold" style={{ color: getScoreColor(report.score) }}>{getScoreLabel(report.score)}</p>
                    <p className="text-sm text-[#6B7280]">Carschek Score</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-[#6B7280]">{report.defects} defects</span>
                      {report.criticalDefects > 0 && <span className="text-xs font-semibold text-[#C0392B]">{report.criticalDefects} critical</span>}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Vehicle</span>
                    <span className="font-medium text-[#1F2937]">{report.carName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Inspector</span>
                    <span className="font-medium text-[#1F2937]">{report.inspectorName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Status</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${report.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{report.status}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Version</span>
                    <span className="font-medium text-[#1F2937]">v{report.version}</span>
                  </div>
                </div>
              </div>

              {/* Summary stats */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Total Items', value: 127, color: '#1E3A5F' },
                  { label: 'Passed', value: 123 - report.defects, color: '#1A7A4A' },
                  { label: 'Failed', value: report.defects, color: '#C0392B' },
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
              <div className="text-center mb-6 pb-4 border-b-2 border-[#1E3A5F]">
                <h2 className="text-xl font-heading font-bold text-[#1E3A5F]">CARSCHEK VEHICLE INSPECTION REPORT</h2>
                <p className="text-sm text-[#6B7280] mt-1">Report ID: {report.id} | Date: {new Date(report.submittedAt).toLocaleDateString('en-NG')}</p>
              </div>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {[
                    ['Vehicle', report.carName], ['Inspector', report.inspectorName],
                    ['Carschek Score', `${report.score}/100 — ${getScoreLabel(report.score)}`],
                    ['Total Defects', `${report.defects} (${report.criticalDefects} critical)`],
                    ['Status', report.status],
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
    </AppLayout>
  );
}
