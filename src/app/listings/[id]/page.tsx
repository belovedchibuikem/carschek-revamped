'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { CarschekScore } from '@/components/shared/CarschekScore';
import { ShoppingBag, Eye, Save } from 'lucide-react';
import { toast } from 'sonner';
import { listingsApi } from '@/lib/api/services';
import { useApiResource } from '@/hooks/useApiResource';

export default function ListingDetailPage() {
  const pathname = usePathname();
  const params = useParams();
  const id = params.id as string;
  const { data: row, loading, error } = useApiResource(() => listingsApi.get(id), [id]);

  const [price, setPrice] = useState(0);
  const [visibility, setVisibility] = useState('Visible');
  const [featured, setFeatured] = useState(false);

  useEffect(() => {
    if (!row) return;
    setPrice(row.price ?? 0);
    setVisibility(row.visibility ?? 'Visible');
    setFeatured(row.featured ?? false);
  }, [row]);

  if (loading) {
    return (
      <AppLayout currentPath={pathname}>
        <div className="p-8 text-sm text-[#6B7280]">Loading listing…</div>
      </AppLayout>
    );
  }

  if (error || !row) {
    return (
      <AppLayout currentPath={pathname}>
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-center">
          <p className="font-medium text-[#1F2937]">{error || 'Listing not found'}</p>
          <Link href="/listings" className="mt-3 inline-block text-sm text-[#ff8a65] hover:underline">
            Back to listings
          </Link>
        </div>
      </AppLayout>
    );
  }

  const save = async () => {
    try {
      await listingsApi.update(id, { price, visibility, featured });
      toast.success('Listing saved');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save listing');
    }
  };

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-6 max-w-3xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#6B7280] text-sm mb-1">
              <Link href="/listings" className="hover:text-[#ff5722]">
                Listings
              </Link>
              <span>/</span>
              <span className="font-mono text-[#1F2937]">{row.id}</span>
            </div>
            <h1 className="text-2xl font-heading font-bold text-[#1F2937] flex items-center gap-2">
              <ShoppingBag size={22} className="text-[#ff5722]" />
              {row.carName}
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              {row.views} views · {row.inquiries} enquiries
            </p>
          </div>
          <CarschekScore score={row.score} size={48} />
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">List price (₦)</label>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(Number(e.target.value))}
              className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">Visibility</label>
            <select
              value={visibility}
              onChange={e => setVisibility(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
            >
              {['Not Visible', 'Visible', 'Featured'].map(v => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="w-4 h-4 rounded" />
            <span className="text-sm text-[#1F2937]">Featured listing</span>
          </label>
          <button
            type="button"
            onClick={() => void save()}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19]"
          >
            <Save size={15} /> Save
          </button>
        </div>

        <Link href={`/cars/${row.carId}`} className="inline-flex items-center gap-2 text-sm text-[#ff8a65] hover:underline">
          <Eye size={14} /> View linked car
        </Link>
      </div>
    </AppLayout>
  );
}
