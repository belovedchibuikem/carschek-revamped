'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, CheckCircle } from 'lucide-react';
import { REPORTS, STATUS_COLORS } from '@/lib/mockData';


const TABS = ['QA Queue', 'All Reports', 'Approved', 'Rejected'];

export default function ReportsPage() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('QA Queue');
  const [search, setSearch] = useState('');

  const filtered = REPORTS.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.id.toLowerCase().includes(q) || r.carName.toLowerCase().includes(q) || r.inspectorName.toLowerCase().includes(q);
    const matchTab = activeTab === 'All Reports' || (activeTab === 'QA Queue' && r.status === 'QA Review') || r.status === activeTab;
    return matchSearch && matchTab;
  });

  const getQAPriority = (submittedAt: string) => {
    const hours = (Date.now() - new Date(submittedAt).getTime()) / 3600000;
    if (hours > 2) return { label: 'High Priority', color: 'bg-red-100 text-red-700' };
    if (hours > 1) return { label: 'Medium', color: 'bg-amber-100 text-amber-700' };
    return { label: 'Normal', color: 'bg-green-100 text-green-700' };
  };

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Inspection Reports</h1>
            <p className="text-sm text-[#6B7280]">{REPORTS.filter(r => r.status === 'QA Review').length} reports in QA queue</p>
          </div>
        </div>

        <div className="flex gap-1 border-b border-[#E5E7EB] overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${activeTab === tab ? 'border-[#1E3A5F] text-[#1E3A5F]' : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'}`}>
              {tab}
              {tab === 'QA Queue' && REPORTS.filter(r => r.status === 'QA Review').length > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#C0392B] text-white">
                  {REPORTS.filter(r => r.status === 'QA Review').length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30" />
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                {['Report ID', 'Vehicle', 'Inspector', 'Score', 'Defects', 'Submitted', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(report => {
                const priority = getQAPriority(report.submittedAt);
                return (
                  <tr key={report.id} className="border-b border-[#F4F6F8] hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/reports/${report.id}`} className="font-mono text-xs font-semibold text-[#2E75B6] hover:underline">{report.id}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1F2937]">{report.carName}</p>
                      <p className="text-xs text-[#6B7280]">{report.orderId}</p>
                    </td>
                    <td className="px-4 py-3 text-[#6B7280]">{report.inspectorName}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold" style={{ color: report.score >= 80 ? '#1A7A4A' : report.score >= 60 ? '#D35400' : '#C0392B' }}>
                        {report.score}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-[#1F2937]">{report.defects}</span>
                        {report.criticalDefects > 0 && (
                          <span className="text-xs text-[#C0392B] font-semibold">({report.criticalDefects} critical)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6B7280] whitespace-nowrap">
                      {new Date(report.submittedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[report.status]}`}>{report.status}</span>
                        {report.status === 'QA Review' && (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${priority.color}`}>{priority.label}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {report.status === 'QA Review' && (
                          <Link href={`/reports/${report.id}/review`}
                            className="px-3 py-1.5 bg-[#1E3A5F] text-white text-xs font-semibold rounded-lg hover:bg-[#16304F] transition-all">
                            Review
                          </Link>
                        )}
                        <Link href={`/reports/${report.id}`}
                          className="px-3 py-1.5 border border-[#E5E7EB] text-xs font-medium text-[#6B7280] rounded-lg hover:bg-[#F4F6F8] transition-colors">
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-16 text-center text-[#6B7280]">
                  <CheckCircle size={40} className="mx-auto mb-3 text-[#E5E7EB]" />
                  <p className="font-medium">No reports in this queue</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
