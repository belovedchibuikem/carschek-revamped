'use client';
import React, { useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, Clock, Eye } from 'lucide-react';
import { formatNaira } from '@/lib/mockData';
import { toast } from 'sonner';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { EmptyState } from '@/components/shared/TableSkeleton';
import { auctionsApi } from '@/lib/api/services';
import { useApiList } from '@/hooks/useApiResource';

export default function AuctionsPage() {
  const pathname = usePathname();
  const { data: auctions, setData: setAuctions, loading, error, refresh } = useApiList(() => auctionsApi.list());
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [bidsPanel, setBidsPanel] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    return auctions.filter(
      a => !q || a.carName.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)
    );
  }, [debouncedSearch, auctions]);

  const getTimeRemaining = (endsAt: string) => {
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return 'Ended';
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    return `${days}d ${hours}h`;
  };

  const MOCK_BIDS = [
    { bidder: 'AutoDeals Nigeria', amount: 4950000, time: '2h ago' },
    { bidder: 'Tunde Fashola', amount: 4800000, time: '3h ago' },
    { bidder: 'Anonymous', amount: 4700000, time: '5h ago' },
    { bidder: 'AutoDeals Nigeria', amount: 4600000, time: '6h ago' },
  ];

  return (
    <AppLayout currentPath={pathname}>
      {bidsPanel && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setBidsPanel(null)} />
          <div className="w-80 bg-white h-full shadow-2xl animate-slide-in-right overflow-y-auto">
            <div className="p-5 border-b border-[#E5E7EB]">
              <h3 className="text-base font-heading font-semibold text-[#1F2937]">Bid History</h3>
              <p className="text-xs text-[#6B7280]">{bidsPanel}</p>
            </div>
            <div className="p-4 space-y-3">
              {MOCK_BIDS.map((bid, i) => (
                <div key={i} className={`p-3 rounded-xl border ${i === 0 ? 'border-[#1A7A4A] bg-green-50' : 'border-[#E5E7EB]'}`}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[#1F2937]">{bid.bidder}</p>
                    {i === 0 && <span className="text-[10px] font-bold text-[#1A7A4A] bg-green-100 px-2 py-0.5 rounded-full">Highest</span>}
                  </div>
                  <p className="text-lg font-bold text-[#1F2937]">{formatNaira(bid.amount)}</p>
                  <p className="text-xs text-[#9CA3AF]">{bid.time}</p>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-[#E5E7EB]">
              <button onClick={() => { toast.success('Deal created from auction'); setBidsPanel(null); }}
                className="w-full py-2.5 bg-[#1A7A4A] text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-all">
                Create Deal from Auction
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Auctions</h1>
            <p className="text-sm text-[#6B7280]">{auctions.filter(a => a.status === 'Active').length} active auctions</p>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search auctions…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30" />
          {search !== debouncedSearch && (
            <p className="text-[11px] text-[#6B7280] mt-1.5">Filtering…</p>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB]">
            <EmptyState title="No auctions match" hint="Try another search or check ended auctions." />
          </div>
        ) : (
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  {['Auction', 'Vehicle', 'Starting Bid', 'Current Bid', 'Bids', 'Reserve', 'Time Left', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(auction => (
                  <tr key={auction.id} className="border-b border-[#F4F6F8] hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/auctions/${auction.id}`} className="font-mono text-xs font-semibold text-[#ff8a65] hover:underline">
                        {auction.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/cars/${auction.carId}`} className="font-medium text-[#1F2937] hover:text-[#ff8a65] transition-colors">{auction.carName}</Link>
                    </td>
                    <td className="px-4 py-3 text-[#6B7280]">{formatNaira(auction.startingBid)}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-[#1F2937]">{formatNaira(auction.currentBid)}</span>
                    </td>
                    <td className="px-4 py-3 text-[#1F2937]">{auction.bidCount}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${auction.reserveMet ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {auction.reserveMet ? 'Met' : 'Not Met'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs">
                        <Clock size={12} className="text-[#6B7280]" />
                        <span className={auction.status === 'Active' ? 'text-[#D35400] font-semibold' : 'text-[#6B7280]'}>
                          {getTimeRemaining(auction.endsAt)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit ${auction.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {auction.status === 'Active' && <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />}
                        {auction.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        <Link href={`/auctions/${auction.id}`}
                          className="px-3 py-1.5 border border-[#E5E7EB] text-xs font-medium text-[#6B7280] rounded-lg hover:bg-[#F4F6F8] transition-colors">
                          View
                        </Link>
                        <button onClick={() => setBidsPanel(auction.id)}
                          className="px-3 py-1.5 border border-[#E5E7EB] text-xs font-medium text-[#6B7280] rounded-lg hover:bg-[#F4F6F8] transition-colors flex items-center gap-1">
                          <Eye size={12} /> Bids
                        </button>
                        {auction.status === 'Active' && (
                          <button onClick={() => toast.success('Auction extended')}
                            className="px-3 py-1.5 bg-[#D35400] text-white text-xs font-semibold rounded-lg hover:bg-orange-700 transition-all">
                            Extend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>
    </AppLayout>
  );
}
