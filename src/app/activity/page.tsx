'use client';
import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname } from 'next/navigation';
import { Search, Download, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

import { toast } from 'sonner';
import { downloadCsv } from '@/lib/csv';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { EmptyState } from '@/components/shared/TableSkeleton';
import { readReconciliationEvents } from '@/lib/localActivity';
import { activityApi } from '@/lib/api/services';
import { useApiList } from '@/hooks/useApiResource';

export default function ActivityPage() {
  const pathname = usePathname();
  const { data: activityLog, loading, error, refresh } = useApiList(() => activityApi.list());
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [logTick, setLogTick] = useState(0);

  useEffect(() => {
    setLogTick(t => t + 1);
  }, [pathname]);

  const allLogs = useMemo(() => {
    const recon = readReconciliationEvents().map(r => ({
      id: r.id,
      actor: r.actor,
      action: r.action,
      target: r.target,
      targetType: r.targetType ?? 'migration',
      timestamp: r.timestamp,
      ip: r.ip,
      role: r.role,
    }));
    return [...recon, ...activityLog].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [logTick, activityLog]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    return allLogs.filter(
      a =>
        !q ||
        a.actor.toLowerCase().includes(q) ||
        a.action.toLowerCase().includes(q) ||
        a.target.toLowerCase().includes(q)
    );
  }, [allLogs, debouncedSearch]);

  const exportCSV = () => {
    const rows: (string | undefined)[][] = [['ID', 'Actor', 'Action', 'Target', 'Role', 'Timestamp', 'IP']];
    filtered.forEach(a => rows.push([a.id, a.actor, a.action, a.target, a.role, a.timestamp, a.ip]));
    downloadCsv('activity-log.csv', rows);
    toast.success('Activity log exported');
  };

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Activity Log</h1>
            <p className="text-sm text-[#6B7280]">Immutable audit trail — includes mock reconciliation rows after migration (local only)</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setLogTick(t => t + 1);
                toast.message('Log refreshed');
              }}
              className="flex items-center gap-2 px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F4F6F8] transition-colors"
            >
              <RefreshCw size={15} /> Refresh
            </button>
            <button type="button" onClick={exportCSV} className="flex items-center gap-2 px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F4F6F8] transition-colors">
              <Download size={15} /> Export CSV
            </button>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search activity…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30" />
          {search !== debouncedSearch && (
            <p className="text-[11px] text-[#6B7280] mt-1.5">Filtering…</p>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB]">
            <EmptyState title="No activity matches" hint="Try another search or refresh after running migration." />
          </div>
        ) : (
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                {['Actor', 'Action', 'Target', 'Role', 'Timestamp', 'IP', ''].map((h, i) => (
                  <th key={`h-${i}`} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => (
                <React.Fragment key={log.id}>
                  <tr className="border-b border-[#F4F6F8] hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#1F2937]">{log.actor}</td>
                    <td className="px-4 py-3 text-[#6B7280]">{log.action}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-[#ff8a65]">{log.target}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-[#F4F6F8] text-[#6B7280] px-2 py-0.5 rounded-full">{log.role}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6B7280] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-NG')}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#9CA3AF]">{log.ip}</td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F4F6F8] transition-colors">
                        {expandedId === log.id ? <ChevronUp size={14} className="text-[#6B7280]" /> : <ChevronDown size={14} className="text-[#6B7280]" />}
                      </button>
                    </td>
                  </tr>
                  {expandedId === log.id && (
                    <tr className="bg-[#F9FAFB]">
                      <td colSpan={7} className="px-4 py-3">
                        <div className="bg-[#1F2937] rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto">
                          <pre>{JSON.stringify({ id: log.id, actor: log.actor, action: log.action, target: log.target, targetType: log.targetType, timestamp: log.timestamp, ip: log.ip, role: log.role }, null, 2)}</pre>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </AppLayout>
  );
}
