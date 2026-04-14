'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname } from 'next/navigation';
import { Search, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { ACTIVITY_LOG } from '@/lib/mockData';
import { toast } from 'sonner';

export default function ActivityPage() {
  const pathname = usePathname();
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = ACTIVITY_LOG?.filter(a =>
    !search || a?.actor?.toLowerCase()?.includes(search?.toLowerCase()) || a?.action?.toLowerCase()?.includes(search?.toLowerCase()) || a?.target?.toLowerCase()?.includes(search?.toLowerCase())
  );

  const exportCSV = () => {
    const rows = [['ID', 'Actor', 'Action', 'Target', 'Role', 'Timestamp', 'IP']];
    filtered?.forEach(a => rows?.push([a?.id, a?.actor, a?.action, a?.target, a?.role, a?.timestamp, a?.ip]));
    const csv = rows?.map(r => r?.join(','))?.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const el = document.createElement('a'); el.href = url; el.download = 'activity-log.csv'; el?.click();
    toast?.success('Activity log exported');
  };

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Activity Log</h1>
            <p className="text-sm text-[#6B7280]">Immutable audit trail of all system actions</p>
          </div>
          <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F4F6F8] transition-colors">
            <Download size={15} /> Export CSV
          </button>
        </div>

        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input value={search} onChange={e => setSearch(e?.target?.value)} placeholder="Search activity…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30" />
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                {['Actor', 'Action', 'Target', 'Role', 'Timestamp', 'IP', '']?.map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered?.map(log => (
                <React.Fragment key={log?.id}>
                  <tr className="border-b border-[#F4F6F8] hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#1F2937]">{log?.actor}</td>
                    <td className="px-4 py-3 text-[#6B7280]">{log?.action}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-[#2E75B6]">{log?.target}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-[#F4F6F8] text-[#6B7280] px-2 py-0.5 rounded-full">{log?.role}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6B7280] whitespace-nowrap">
                      {new Date(log.timestamp)?.toLocaleString('en-NG')}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#9CA3AF]">{log?.ip}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setExpandedId(expandedId === log?.id ? null : log?.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F4F6F8] transition-colors">
                        {expandedId === log?.id ? <ChevronUp size={14} className="text-[#6B7280]" /> : <ChevronDown size={14} className="text-[#6B7280]" />}
                      </button>
                    </td>
                  </tr>
                  {expandedId === log?.id && (
                    <tr className="bg-[#F9FAFB]">
                      <td colSpan={7} className="px-4 py-3">
                        <div className="bg-[#1F2937] rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto">
                          <pre>{JSON.stringify({ id: log?.id, actor: log?.actor, action: log?.action, target: log?.target, targetType: log?.targetType, timestamp: log?.timestamp, ip: log?.ip, role: log?.role }, null, 2)}</pre>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
