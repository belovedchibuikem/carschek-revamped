'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Download, FileText, Loader2 } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { reportsApi } from '@/lib/api/services';

type Row = {
  id: string;
  carName?: string | null;
  score?: number;
  status?: string;
  submittedAt?: string | null;
  inspectorName?: string | null;
};

export default function MyReportsPage() {
  const pathname = usePathname();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void reportsApi
      .list()
      .then(data => {
        if (!cancelled) setRows(Array.isArray(data) ? (data as Row[]) : []);
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-5 p-1">
        <div>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">My inspection reports</h1>
          <p className="text-sm text-[#6B7280]">
            Reports assigned to your account. Open any report to view or download the latest version.
          </p>
        </div>
        {loading ? (
          <p className="flex items-center gap-2 text-sm text-[#6B7280]">
            <Loader2 className="animate-spin" size={16} /> Loading…
          </p>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-white px-6 py-12 text-center text-sm text-[#6B7280]">
            No reports are assigned to you yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F9FAFB] text-xs uppercase text-[#6B7280]">
                <tr>
                  <th className="px-4 py-3">Report</th>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} className="border-t border-[#F4F6F8]">
                    <td className="px-4 py-3 font-mono text-xs text-[#1E3A5F]">{r.id}</td>
                    <td className="px-4 py-3">{r.carName || '—'}</td>
                    <td className="px-4 py-3">{r.score ?? '—'}</td>
                    <td className="px-4 py-3">{r.status || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/reports/${r.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#1E3A5F] px-3 py-1.5 text-xs font-bold text-white"
                      >
                        <FileText size={14} /> View
                        <Download size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
