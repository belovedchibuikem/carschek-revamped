'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { LISTINGS, formatNaira } from '@/lib/mockData';
import { CarschekScore } from '@/components/shared/CarschekScore';
import { ShoppingBag, Eye, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function ListingDetailPage() {
  const pathname = usePathname();
  const params = useParams();
  const id = params.id as string;
  const row = LISTINGS.find(l => l.id === id);

  const [price, setPrice] = useState(row?.price ?? 0);
  const [visibility, setVisibility] = useState(row?.visibility ?? 'Visible');
  const [featured, setFeatured] = useState(row?.featured ?? false);

  if (!row) {
    return (
      <AppLayout currentPath={pathname}>
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-center">
          <p className="font-medium text-[#1F2937]">Listing not found</p>
          <Link href="/listings" className="mt-3 inline-block text-sm text-[#2E75B6] hover:underline">
            Back to listings
          </Link>
        </div>
      </AppLayout>
    );
  }

  const save = () => {
    toast.success('Listing saved (local demo). Connect API to persist.');
  };

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-2 text-[#6B7280] text-sm">
          <Link href="/listings" className="hover:text-[#1E3A5F]">
            Listings
          </Link>
          <span>/</span>
          <span className="font-mono text-[#1F2937]">{row.id}</span>
        </div>
        <h1 className="text-2xl font-heading font-bold text-[#1F2937] flex items-center gap-2">
          <ShoppingBag className="text-[#1E3A5F]" size={26} />
          {row.carName}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
            <p className="text-xs text-[#6B7280] uppercase tracking-wide">Listing score</p>
            <div className="flex items-center gap-2 mt-2">
              <CarschekScore score={row.score} size={48} />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
            <p className="text-xs text-[#6B7280] uppercase tracking-wide">Views</p>
            <p className="text-lg font-heading font-bold text-[#1F2937]">{row.views}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
            <p className="text-xs text-[#6B7280] uppercase tracking-wide">Inquiries</p>
            <p className="text-lg font-heading font-bold text-[#1F2937]">{row.inquiries}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-4">
          <h2 className="text-base font-heading font-semibold text-[#1F2937]">Marketplace controls</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Price (₦)</span>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                className="mt-1 w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Visibility</span>
              <select
                value={visibility}
                onChange={e => setVisibility(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30"
              >
                <option value="Visible">Visible</option>
                <option value="Hidden">Hidden</option>
                <option value="Featured">Featured</option>
              </select>
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm text-[#1F2937] cursor-pointer">
            <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="rounded border-[#E5E7EB]" />
            Featured placement (extra visibility)
          </label>
          <p className="text-sm text-[#6B7280]">
            Listed <span className="font-medium">{row.listedAt}</span> · Vehicle{' '}
            <Link href={`/cars/${row.carId}`} className="text-[#2E75B6] hover:underline inline-flex items-center gap-1">
              <Eye size={14} /> {row.carId}
            </Link>
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              onClick={save}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F]"
            >
              <Save size={16} /> Save changes
            </button>
            <Link
              href={`/cars/${row.carId}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#1F2937] hover:bg-[#F4F6F8]"
            >
              Open vehicle
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
