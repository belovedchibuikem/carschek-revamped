'use client';

import React from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';
import { formatNaira } from '@/lib/mockData';
import { carsApi } from '@/lib/api/services';
import { useApiResource } from '@/hooks/useApiResource';
import AppLayout from '@/components/AppLayout';
import AppLogo from '@/components/ui/AppLogo';

export default function ProofOfSalePage() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const id = params.id as string;
  const { data: car, loading, error } = useApiResource(() => carsApi.get(params.id as string), [params.id]);
  if (loading) return <AppLayout currentPath={pathname}><div className="p-8 text-sm text-[#6B7280]">Loading…</div></AppLayout>;
  if (error || !car) return <AppLayout currentPath={pathname}><div className="p-8 text-sm text-red-700">{error || 'Car not found'}</div></AppLayout>;

  return (
    <AppLayout currentPath={pathname}>
    <div className="min-h-screen bg-[#F4F6F8] py-8 px-4 print:bg-white print:py-0">
      <div className="max-w-3xl mx-auto print:max-w-none">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 print:hidden">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-[#374151] hover:text-[#ff5722]"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19]"
            >
              <Printer size={16} /> Print / Save as PDF
            </button>
            <Link href={`/cars/${car.id}`} className="px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#374151] hover:bg-white">
              Car detail
            </Link>
          </div>
        </div>

        <article className="bg-white rounded-xl border border-[#E5E7EB] p-8 shadow-sm print:shadow-none print:border-0 print:rounded-none">
          <header className="border-b border-[#E5E7EB] pb-6 mb-6">
            <AppLogo size={56} className="mb-3" />
            <p className="text-xs font-semibold text-[#ff8a65] uppercase tracking-wider">Proof of Sale</p>
            <h1 className="text-2xl font-heading font-bold text-[#1F2937] mt-2">Vehicle sale confirmation</h1>
            <p className="text-sm text-[#6B7280] mt-1">Reference {car.id} · Generated {new Date().toLocaleDateString('en-NG')}</p>
          </header>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm mb-8">
            <div>
              <h2 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wide mb-2">Vehicle</h2>
              <p className="font-semibold text-[#1F2937]">
                {car.brand} {car.model} {car.year}
              </p>
              <p className="font-mono text-xs text-[#6B7280] mt-1">VIN {car.vin}</p>
              <p className="font-mono text-xs text-[#6B7280]">Plate {car.plate}</p>
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wide mb-2">Amounts</h2>
              <p>
                Purchase: <strong>{formatNaira(car.purchasePrice)}</strong>
              </p>
              {car.salePrice != null && (
                <p className="mt-1">
                  Sale: <strong>{formatNaira(car.salePrice)}</strong>
                </p>
              )}
            </div>
          </section>

          <p className="text-xs text-[#9CA3AF] leading-relaxed border-t border-[#E5E7EB] pt-6">
            This document is generated for administrative purposes from mock data. Signature lines and buyer/seller details should be completed before legal use.
          </p>
        </article>
      </div>
    </div>
    </AppLayout>
  );
}
