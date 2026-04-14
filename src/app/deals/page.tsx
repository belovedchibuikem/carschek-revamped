'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, Eye } from 'lucide-react';
import { DEALS, formatNaira, STATUS_COLORS } from '@/lib/mockData';
import { toast } from 'sonner';

export default function DealsPage() {
  const pathname = usePathname();
  const [search, setSearch] = useState('');

  const filtered = DEALS?.filter(d =>
    !search || d?.carName?.toLowerCase()?.includes(search?.toLowerCase()) || d?.buyerName?.toLowerCase()?.includes(search?.toLowerCase())
  );

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Deals</h1>
            <p className="text-sm text-[#6B7280]">{DEALS?.length} deals in pipeline</p>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input value={search} onChange={e => setSearch(e?.target?.value)} placeholder="Search deals…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30" />
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                {['Deal ID', 'Car', 'Buyer', 'Amount', 'Stage', 'Assigned To', 'Created', 'Actions']?.map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered?.map(deal => (
                <tr key={deal?.id} className="border-b border-[#F4F6F8] hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-[#2E75B6]">{deal?.id}</td>
                  <td className="px-4 py-3">
                    <Link href={`/cars/${deal?.carId}`} className="font-medium text-[#1F2937] hover:text-[#2E75B6] transition-colors">{deal?.carName}</Link>
                  </td>
                  <td className="px-4 py-3 text-[#6B7280]">{deal?.buyerName}</td>
                  <td className="px-4 py-3 font-semibold text-[#1F2937]">{formatNaira(deal?.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS?.[deal?.stage] || 'bg-gray-100 text-gray-700'}`}>{deal?.stage}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#6B7280]">{deal?.assignedTo}</td>
                  <td className="px-4 py-3 text-xs text-[#6B7280]">{deal?.createdAt}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toast?.success(`Viewing deal ${deal?.id}`)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F4F6F8] transition-colors">
                      <Eye size={14} className="text-[#6B7280]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
