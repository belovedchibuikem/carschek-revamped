'use client';
import React, { useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, Eye } from 'lucide-react';
import { LISTINGS, formatNaira, getScoreColor } from '@/lib/mockData';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { EmptyState } from '@/components/shared/TableSkeleton';

export default function ListingsPage() {
  const pathname = usePathname();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    return LISTINGS.filter(
      l =>
        !q ||
        l.carName.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q)
    );
  }, [debouncedSearch]);

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Marketplace Listings</h1>
            <p className="text-sm text-[#6B7280]">{LISTINGS.length} active listings</p>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search listings…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30" />
          {search !== debouncedSearch && (
            <p className="text-[11px] text-[#6B7280] mt-1.5">Filtering…</p>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB]">
            <EmptyState title="No listings match" hint="Try another search term." />
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(listing => (
            <div key={listing.id} className="bg-white rounded-xl border border-[#E5E7EB] p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${listing.visibility === 'Featured' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                  {listing.visibility}
                </span>
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
                    style={{ borderColor: getScoreColor(listing.score), color: getScoreColor(listing.score) }}>
                    {listing.score}
                  </div>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-[#1F2937] mb-1">{listing.carName}</h3>
              <p className="text-xl font-heading font-bold text-[#1E3A5F] mb-3">{formatNaira(listing.price)}</p>
              <div className="flex items-center justify-between text-xs text-[#6B7280] mb-4">
                <span>{listing.views} views</span>
                <span>{listing.inquiries} inquiries</span>
              </div>
              <div className="flex gap-2">
                <Link href={`/cars/${listing.carId}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-[#E5E7EB] rounded-lg text-xs font-medium text-[#6B7280] hover:bg-[#F4F6F8] transition-colors">
                  <Eye size={12} /> View Car
                </Link>
                <Link href={`/listings/${listing.id}`} className="flex-1 flex items-center justify-center py-2 bg-[#1E3A5F] text-white rounded-lg text-xs font-semibold hover:bg-[#16304F] transition-all">
                  Edit Listing
                </Link>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </AppLayout>
  );
}
