'use client';

import React from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';
import { CARS, formatNaira } from '@/lib/mockData';
import AppLayout from '@/components/AppLayout';

export default function ProofOfSalePage() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const id = params.id as string;
  const car = CARS.find(c => c.id === id) || CARS[0];

  return (
    <AppLayout currentPath={pathname}>
    <div className="min-h-screen bg-[#F4F6F8] py-8 px-4 print:bg-white print:py-0">
      <div className="max-w-3xl mx-auto print:max-w-none">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 print:hidden">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-[#374151] hover:text-[#1E3A5F]"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F]"
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
            <p className="text-xs font-semibold text-[#2E75B6] uppercase tracking-wider">Carschek — Proof of Sale</p>
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
