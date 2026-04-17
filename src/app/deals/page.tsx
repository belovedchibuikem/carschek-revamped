'use client';
import React, { useMemo, useState, Suspense } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Eye } from 'lucide-react';
import { DEALS, formatNaira, STATUS_COLORS } from '@/lib/mockData';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { EmptyState } from '@/components/shared/TableSkeleton';

function DealsPageInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const stageFilter = useMemo(() => {
    const raw = searchParams.get('stage');
    if (!raw) return '';
    try {
      return decodeURIComponent(raw.replace(/\+/g, ' ')).trim();
    } catch {
      return raw.trim();
    }
  }, [searchParams]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    return DEALS.filter(
      d =>
        (!stageFilter || d.stage === stageFilter) &&
        (!q ||
          d.carName.toLowerCase().includes(q) ||
          d.buyerName.toLowerCase().includes(q) ||
          d.id.toLowerCase().includes(q))
    );
  }, [debouncedSearch, stageFilter]);

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Deals</h1>
            <p className="text-sm text-[#6B7280]">
              {stageFilter ? (
                <>
                  {filtered.length} deal{filtered.length === 1 ? '' : 's'} in <span className="font-semibold text-[#1F2937]">{stageFilter}</span>
                  {' · '}
                  <Link href="/deals" className="text-[#ff8a65] hover:underline">
                    Clear stage
                  </Link>
                </>
              ) : (
                <>{DEALS.length} deals in pipeline</>
              )}
            </p>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search deals…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30" />
          {search !== debouncedSearch && (
            <p className="text-[11px] text-[#6B7280] mt-1.5">Filtering…</p>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB]">
            <EmptyState title="No deals match" hint="Try another search or create a deal from the pipeline." />
          </div>
        ) : (
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                {['Deal ID', 'Car', 'Buyer', 'Amount', 'Stage', 'Assigned To', 'Created', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(deal => (
                <tr key={deal.id} className="border-b border-[#F4F6F8] hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-[#ff8a65]">{deal.id}</td>
                  <td className="px-4 py-3">
                    <Link href={`/cars/${deal.carId}`} className="font-medium text-[#1F2937] hover:text-[#ff8a65] transition-colors">{deal.carName}</Link>
                  </td>
                  <td className="px-4 py-3 text-[#6B7280]">{deal.buyerName}</td>
                  <td className="px-4 py-3 font-semibold text-[#1F2937]">{formatNaira(deal.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[deal.stage] || 'bg-gray-100 text-gray-700'}`}>{deal.stage}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#6B7280]">{deal.assignedTo}</td>
                  <td className="px-4 py-3 text-xs text-[#6B7280]">{deal.createdAt}</td>
                  <td className="px-4 py-3">
                    <Link href={`/deals/${deal.id}`} title="Open deal" className="inline-flex w-8 h-8 items-center justify-center rounded-lg hover:bg-[#F4F6F8] transition-colors">
                      <Eye size={14} className="text-[#6B7280]" />
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

export default function DealsPage() {
  return (
    <Suspense
      fallback={
        <AppLayout currentPath="/deals">
          <div className="min-h-[40vh] flex items-center justify-center text-sm text-[#6B7280]">Loading deals…</div>
        </AppLayout>
      }
    >
      <DealsPageInner />
    </Suspense>
  );
}
