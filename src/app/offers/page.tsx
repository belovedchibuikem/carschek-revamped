'use client';
import React, { useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Send, Eye } from 'lucide-react';
import { STATUS_COLORS, formatNaira } from '@/lib/mockData';
import { toast } from 'sonner';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { EmptyState } from '@/components/shared/TableSkeleton';
import { offersApi } from '@/lib/api/services';
import { useApiList } from '@/hooks/useApiResource';

export default function OffersPage() {
  const pathname = usePathname();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [statusFilter, setStatusFilter] = useState('');
  const { data: offers, loading, error, refresh } = useApiList(() => offersApi.list());

  const filtered = useMemo(() => {
    return offers?.filter(o => {
      const q = debouncedSearch?.toLowerCase();
      const matchSearch =
        !q ||
        o?.carName?.toLowerCase()?.includes(q) ||
        o?.contactName?.toLowerCase()?.includes(q) ||
        o?.id?.toLowerCase()?.includes(q);
      const matchStatus = !statusFilter || o?.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [debouncedSearch, statusFilter, offers]);

  const statusOptions = [...new Set(offers.map(o => o.status))];

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Offers</h1>
            <p className="text-sm text-[#6B7280]">{loading ? '…' : `${offers?.length ?? 0}`} offers total</p>
          </div>
          <Link href="/offers/new" className="flex items-center gap-2 px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19] transition-all min-h-[44px]">
            <Plus size={16} /> Create Offer
          </Link>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input value={search} onChange={e => setSearch(e?.target?.value)} placeholder="Search offers…"
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30" />
            {search !== debouncedSearch && (
              <p className="text-[11px] text-[#6B7280] mt-1.5">Filtering…</p>
            )}
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e?.target?.value)}
            className="px-3 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30">
            <option value="">All Statuses</option>
            {statusOptions?.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex justify-between gap-3">
            <p className="text-sm text-red-700">{error}</p>
            <button type="button" onClick={() => void refresh()} className="text-sm font-semibold text-red-700 underline">Retry</button>
          </div>
        )}
        {loading ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-sm text-[#6B7280]">Loading offers…</div>
        ) : filtered?.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB]">
            <EmptyState title="No offers match" hint="Adjust search or status, or create a new offer." />
          </div>
        ) : (
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                {['Offer ID', 'Car', 'Contact', 'Offer Price', 'Valid Until', 'Sent Via', 'Status', 'Actions']?.map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered?.map(offer => (
                <tr key={offer?.id} className="border-b border-[#F4F6F8] hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/offers/${offer?.id}`} className="font-mono text-xs font-semibold text-[#ff8a65] hover:underline">{offer?.id}</Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/cars/${offer?.carId}`} className="font-medium text-[#1F2937] hover:text-[#ff8a65] transition-colors">{offer?.carName}</Link>
                  </td>
                  <td className="px-4 py-3 text-[#6B7280]">{offer?.contactName}</td>
                  <td className="px-4 py-3 font-semibold text-[#1F2937]">{formatNaira(offer?.offerPrice)}</td>
                  <td className="px-4 py-3 text-xs text-[#6B7280]">{offer?.validUntil}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {offer?.sentVia?.map(v => (
                        <span key={v} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{v}</span>
                      ))}
                      {offer?.sentVia?.length === 0 && <span className="text-xs text-[#9CA3AF]">Not sent</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS?.[offer?.status] || 'bg-gray-100 text-gray-700'}`}>{offer?.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/offers/${offer?.id}`} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F4F6F8] transition-colors">
                        <Eye size={14} className="text-[#6B7280]" />
                      </Link>
                      {offer?.status === 'Draft' && (
                        <button type="button" onClick={() => toast?.success('Offer sent!')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F4F6F8] transition-colors">
                          <Send size={14} className="text-[#ff8a65]" />
                        </button>
                      )}
                    </div>
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
