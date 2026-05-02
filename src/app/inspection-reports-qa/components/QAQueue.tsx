'use client';
import React, { useState } from 'react';
import { FileText, AlertTriangle, Eye } from 'lucide-react';
import { Report } from './ReportsQAModule';

const PRIORITY_CONFIG = {
  high: { label: 'Overdue', className: 'bg-red-50 text-[#C0392B] border-red-200', dot: 'bg-[#C0392B]' },
  medium: { label: '1–2 hrs', className: 'bg-amber-50 text-[#D35400] border-amber-200', dot: 'bg-[#D35400]' },
  low: { label: 'On Track', className: 'bg-green-50 text-[#1A7A4A] border-green-200', dot: 'bg-[#1A7A4A]' },
};

const QA_STATUS_CONFIG = {
  awaiting: { label: 'Awaiting QA', className: 'bg-blue-50 text-blue-700' },
  'under-review': { label: 'Under Review', className: 'bg-amber-50 text-amber-700' },
  approved: { label: 'Approved', className: 'bg-green-50 text-green-700' },
  rejected: { label: 'Rejected', className: 'bg-red-50 text-red-700' },
};

interface Props { reports: Report[]; onSelectReport: (r: Report) => void; }

export default function QAQueue({ reports, onSelectReport }: Props) {
  const [activeTab, setActiveTab] = useState<'awaiting' | 'under-review' | 'approved' | 'rejected'>('awaiting');

  const filtered = reports.filter(r => r.qaStatus === activeTab);
  const pendingCount = reports.filter(r => r.qaStatus === 'awaiting' || r.qaStatus === 'under-review').length;

  const TABS = [
    { id: 'awaiting' as const, label: 'Awaiting QA', count: reports.filter(r => r.qaStatus === 'awaiting').length },
    { id: 'under-review' as const, label: 'Under Review', count: reports.filter(r => r.qaStatus === 'under-review').length },
    { id: 'approved' as const, label: 'Approved', count: reports.filter(r => r.qaStatus === 'approved').length },
    { id: 'rejected' as const, label: 'Rejected', count: reports.filter(r => r.qaStatus === 'rejected').length },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Inspection Reports</h1>
          <span className="bg-[#C0392B] text-white text-xs font-bold px-2.5 py-1 rounded-full">{pendingCount} pending</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E5E7EB]">
        <div className="flex gap-1">
          {TABS.map(tab => (
            <button
              key={`qa-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px ${activeTab === tab.id ? 'border-[#ff5722] text-[#ff5722]' : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'}`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-[#ff5722] text-white' : 'bg-[#F4F6F8] text-[#6B7280]'}`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FileText size={40} className="mx-auto text-[#E5E7EB] mb-3" />
            <p className="text-sm font-semibold text-[#1F2937]">No reports in this queue</p>
            <p className="text-xs text-[#6B7280] mt-1">Reports will appear here as inspectors submit them</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-[#F4F6F8] text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] border-b border-[#E5E7EB]">
                  <th className="px-5 py-3 text-left">Report #</th>
                  <th className="px-4 py-3 text-left">Vehicle</th>
                  <th className="px-4 py-3 text-left">Inspector</th>
                  <th className="px-4 py-3 text-left">Submitted</th>
                  <th className="px-4 py-3 text-right">Time in Queue</th>
                  <th className="px-4 py-3 text-right">Defects</th>
                  <th className="px-4 py-3 text-right">Score</th>
                  <th className="px-4 py-3 text-left">Priority</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F6F8]">
                {filtered.map(report => {
                  const pConfig = PRIORITY_CONFIG[report.priority];
                  return (
                    <tr key={report.id} className="hover:bg-[#F4F6F8]/60 transition-colors group">
                      <td className="px-5 py-3">
                        <div>
                          <span className="font-mono text-xs font-bold text-[#ff5722]">{report.id}</span>
                          <p className="text-[10px] text-[#6B7280] font-mono">{report.orderId}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold text-[#1F2937] max-w-[180px] truncate">{report.vehicle}</p>
                        <p className="text-[10px] text-[#6B7280]">v{report.version}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#ff5722] flex items-center justify-center text-white text-[9px] font-bold">{report.inspectorAvatar}</div>
                          <span className="text-xs text-[#1F2937]">{report.inspector}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#6B7280]">{report.submittedAt}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {report.minutesInQueue > 120 && <AlertTriangle size={12} className="text-[#C0392B]" />}
                          <span className={`text-xs font-semibold tabular-nums ${report.minutesInQueue > 120 ? 'text-[#C0392B]' : report.minutesInQueue > 60 ? 'text-[#D35400]' : 'text-[#1A7A4A]'}`}>
                            {report.minutesInQueue > 0 ? `${Math.floor(report.minutesInQueue / 60)}h ${report.minutesInQueue % 60}m` : '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-sm font-bold tabular-nums ${report.defectsFound >= 8 ? 'text-[#C0392B]' : report.defectsFound >= 4 ? 'text-[#D35400]' : 'text-[#1A7A4A]'}`}>{report.defectsFound}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-sm font-bold tabular-nums ${report.score >= 71 ? 'text-[#1A7A4A]' : report.score >= 41 ? 'text-[#D35400]' : 'text-[#C0392B]'}`}>{report.score}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border w-fit ${pConfig.className}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${pConfig.dot}`} />
                          {pConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onSelectReport(report)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ff5722] text-white text-xs font-semibold rounded-lg hover:bg-[#e64a19] transition-all active:scale-[0.98] ml-auto"
                        >
                          <Eye size={12} /> Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}