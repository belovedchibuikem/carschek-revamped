'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { formatNaira } from '@/lib/mockData';
import { Clock, Gavel, Car, Handshake } from 'lucide-react';
import { toast } from 'sonner';
import { auctionsApi } from '@/lib/api/services';
import { useApiResource } from '@/hooks/useApiResource';

function relativeTime(iso?: string): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(diff) || diff < 0) return 'just now';
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function useCountdown(endsAt: string) {
  const [now, setNow] = useState(-1);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  return useMemo(() => {
    if (now < 0) return { ended: false as const, label: '—' };
    const diff = new Date(endsAt).getTime() - now;
    if (diff <= 0) return { ended: true as const, label: 'Ended' };
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return { ended: false as const, label: `${days}d ${hours}h ${mins}m ${secs}s` };
  }, [endsAt, now]);
}

export default function AuctionDetailPage() {
  const pathname = usePathname();
  const params = useParams();
  const id = params.id as string;
  const { data: auction, loading, error, refresh } = useApiResource(() => auctionsApi.get(id), [id]);
  const cd = useCountdown(auction?.endsAt ?? '1970-01-01T00:00:00Z');
  const bids = ((auction as { bids?: { bidder: string; amount: number; at?: string; anonymous?: boolean }[] } | null)
    ?.bids ?? [])
    .slice()
    .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));

  const extendAuction = async () => {
    try {
      await auctionsApi.extend(id, 24);
      toast.success('Auction extended by 24 hours');
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not extend auction');
    }
  };

  if (loading) {
    return (
      <AppLayout currentPath={pathname}>
        <div className="p-8 text-sm text-[#6B7280]">Loading auction…</div>
      </AppLayout>
    );
  }
  if (error || !auction) {
    return (
      <AppLayout currentPath={pathname}>
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-center">
          <p className="font-medium text-[#1F2937]">{error || 'Auction not found'}</p>
          <Link href="/auctions" className="mt-3 inline-block text-sm text-[#ff8a65] hover:underline">
            Back to auctions
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#6B7280] text-sm mb-1">
              <Link href="/auctions" className="hover:text-[#ff5722]">
                Auctions
              </Link>
              <span>/</span>
              <span className="font-mono text-[#1F2937]">{auction.id}</span>
            </div>
            <h1 className="text-2xl font-heading font-bold text-[#1F2937] flex items-center gap-2">
              <Gavel className="text-[#D35400]" size={26} />
              {auction.carName}
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              Platform fee {auction.platformFee}% · Reserve {formatNaira(auction.reservePrice)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/cars/${auction.carId}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#1F2937] hover:bg-[#F4F6F8] transition-colors"
            >
              <Car size={16} /> Vehicle
            </Link>
            <Link
              href={`/deals/new?auction=${encodeURIComponent(auction.id)}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#ff5722] text-white rounded-lg text-sm font-semibold hover:bg-[#e64a19] transition-all"
              onClick={() => toast.success('Deal draft linked to this auction')}
            >
              <Handshake size={16} /> Create deal
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <p className="text-xs text-[#6B7280] uppercase tracking-wide">Current bid</p>
                <p className="text-lg font-heading font-bold text-[#1F2937]">{formatNaira(auction.currentBid)}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280] uppercase tracking-wide">Starting</p>
                <p className="text-sm font-semibold text-[#1F2937]">{formatNaira(auction.startingBid)}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280] uppercase tracking-wide">Bids</p>
                <p className="text-sm font-semibold text-[#1F2937]">{auction.bidCount}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280] uppercase tracking-wide">Reserve</p>
                <span
                  className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${auction.reserveMet ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                >
                  {auction.reserveMet ? 'Met' : 'Not met'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
              <Clock className="text-[#D35400] shrink-0" size={22} />
              <div>
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Time remaining</p>
                <p className={`text-lg font-mono font-bold ${cd?.ended ? 'text-[#6B7280]' : 'text-[#D35400]'}`}>
                  {cd?.label}
                </p>
              </div>
            </div>
            <div>
              <h2 className="text-sm font-heading font-semibold text-[#1F2937] mb-3">Recent bids</h2>
              <ul className="divide-y divide-[#F4F6F8] border border-[#E5E7EB] rounded-xl overflow-hidden">
                {bids.length === 0 && (
                  <li className="px-4 py-6 text-sm text-[#6B7280] text-center">No bids yet.</li>
                )}
                {bids.map((b, i) => (
                  <li key={`${b.bidder}-${b.amount}-${i}`} className={`flex items-center justify-between px-4 py-3 text-sm ${i === 0 ? 'bg-green-50/80' : 'bg-white'}`}>
                    <span className="font-medium text-[#1F2937]">{b.anonymous ? 'Anonymous' : b.bidder}</span>
                    <span className="font-semibold text-[#1F2937]">{formatNaira(b.amount)}</span>
                    <span className="text-xs text-[#6B7280]">{relativeTime(b.at)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-3">
            <p className="text-sm font-semibold text-[#1F2937]">Status</p>
            <span
              className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${auction.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
            >
              {auction.status}
            </span>
            <p className="text-xs text-[#6B7280]">Started {new Date(auction.startedAt).toLocaleString('en-NG')}</p>
            <p className="text-xs text-[#6B7280]">Ends {new Date(auction.endsAt).toLocaleString('en-NG')}</p>
            {(auction.status === 'Active' || auction.status === 'Extended') && (
              <button
                type="button"
                onClick={() => void extendAuction()}
                className="w-full py-2.5 bg-[#D35400] text-white text-sm font-semibold rounded-lg hover:bg-orange-700 transition-all"
              >
                Extend auction
              </button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
