'use client';

import React, { Suspense } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Handshake } from 'lucide-react';

function NewDealContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const auctionId = searchParams.get('auction');

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center gap-2 text-[#6B7280] text-sm">
          <Link href="/deals" className="hover:text-[#1E3A5F]">
            Deals
          </Link>
          <span>/</span>
          <span>New</span>
        </div>
        <h1 className="text-2xl font-heading font-bold text-[#1F2937] flex items-center gap-2">
          <Handshake className="text-[#1E3A5F]" size={26} />
          Create deal
        </h1>
        {auctionId && (
          <p className="text-sm text-[#6B7280]">
            Pre-filled from auction <span className="font-mono font-semibold text-[#1F2937]">{auctionId}</span>.
          </p>
        )}
        <p className="text-sm text-[#6B7280]">
          Form fields and pipeline wiring will connect to the deals API. This route exists so links from auctions do not 404.
        </p>
      </div>
    </AppLayout>
  );
}

export default function NewDealPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex items-center justify-center text-sm text-[#6B7280]">
          Loading…
        </div>
      }
    >
      <NewDealContent />
    </Suspense>
  );
}
