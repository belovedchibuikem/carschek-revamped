'use client';
import React, { useEffect, useState } from 'react';
import { X, Check, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

/** Fixed ISO end times — avoid `Date.now()` in module scope (hydration mismatch). */
const MOCK_AUCTIONS = [
  { id: 'AUC-001', ckId: 'CK-41', vehicle: 'Toyota Camry 2011', startingBid: 5000000, currentBid: 5400000, bidCount: 12, reserveMet: true, endsAt: new Date('2026-06-15T20:00:00+01:00'), status: 'Active' },
  { id: 'AUC-002', ckId: 'CK-39', vehicle: 'Mercedes-Benz C300 2018', startingBid: 18000000, currentBid: 19200000, bidCount: 7, reserveMet: true, endsAt: new Date('2026-06-16T18:00:00+01:00'), status: 'Active' },
  { id: 'AUC-003', ckId: 'CK-37', vehicle: 'Ford Explorer 2016', startingBid: 9800000, currentBid: 9900000, bidCount: 3, reserveMet: false, endsAt: new Date('2026-04-01T12:00:00+01:00'), status: 'Ended — No Sale' },
  { id: 'AUC-004', ckId: 'CK-36', vehicle: 'Lexus RX350 2020', startingBid: 28000000, currentBid: 30500000, bidCount: 18, reserveMet: true, endsAt: new Date('2026-04-02T14:00:00+01:00'), status: 'Ended — Sale' },
];

const MOCK_BIDS: Record<string, { bidder: string; amount: number; time: string }[]> = {
  'AUC-001': [
    { bidder: 'Emeka Okafor', amount: 5400000, time: '14 mins ago' },
    { bidder: 'Anonymous Bidder #3', amount: 5350000, time: '28 mins ago' },
    { bidder: 'Fatima Bello', amount: 5200000, time: '1 hr ago' },
    { bidder: 'Anonymous Bidder #1', amount: 5100000, time: '2 hrs ago' },
    { bidder: 'Chukwuemeka Obi', amount: 5050000, time: '3 hrs ago' },
  ],
};

function getTimeRemaining(endsAt: Date, nowMs: number, status: string) {
  if (nowMs < 0) {
    if (status.startsWith('Ended')) return { label: 'ENDED', color: 'bg-gray-100 text-gray-500' };
    return { label: '—', color: 'bg-gray-100 text-gray-500' };
  }
  const diff = endsAt.getTime() - nowMs;
  if (diff <= 0) return { label: 'ENDED', color: 'bg-gray-100 text-gray-500' };
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours < 1) return { label: `${mins}m left`, color: 'bg-red-50 text-red-600' };
  if (hours < 24) return { label: `${hours}h ${mins}m left`, color: 'bg-amber-50 text-amber-600' };
  return { label: `${Math.floor(hours / 24)}d ${hours % 24}h left`, color: 'bg-green-50 text-green-700' };
}

const STATUS_STYLE: Record<string, string> = {
  'Active': 'bg-green-50 text-green-700',
  'Extended': 'bg-blue-50 text-blue-700',
  'Ended — No Sale': 'bg-gray-100 text-gray-500',
  'Ended — Sale': 'bg-[#1E3A5F]/10 text-[#1E3A5F]',
};

export default function AuctionModule() {
  const router = useRouter();
  const [selectedAuction, setSelectedAuction] = useState<string | null>(null);
  const [showCloseFlow, setShowCloseFlow] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(-1);
  useEffect(() => {
    setNowMs(Date.now());
    const t = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const selectedAuctionData = MOCK_AUCTIONS.find(a => a.id === selectedAuction);
  const bids = selectedAuction ? (MOCK_BIDS[selectedAuction] || []) : [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Auctions</h1>
          <span className="bg-[#1E3A5F]/10 text-[#1E3A5F] text-sm font-semibold px-2.5 py-0.5 rounded-full">{MOCK_AUCTIONS.length} auctions</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['CK ID', 'Vehicle', 'Starting Bid', 'Current Highest Bid', 'Bid Count', 'Reserve Met', 'Time Remaining', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MOCK_AUCTIONS.map(auction => {
                const time = getTimeRemaining(auction.endsAt, nowMs, auction.status);
                return (
                  <tr key={auction.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => router.push(`/cars/${auction.ckId}`)}
                        className="font-mono text-xs font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-md hover:bg-teal-100 transition-colors"
                      >
                        {auction.ckId}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{auction.vehicle}</td>
                    <td className="px-4 py-3 text-gray-700">₦{auction.startingBid.toLocaleString()}</td>
                    <td className="px-4 py-3 font-bold text-green-700">₦{auction.currentBid.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-600">{auction.bidCount}</td>
                    <td className="px-4 py-3">
                      {auction.reserveMet ? <Check size={16} className="text-green-600" /> : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${time.color}`}>{time.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_STYLE[auction.status]}`}>{auction.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setSelectedAuction(auction.id)} className="text-xs px-2 py-1 bg-[#1E3A5F]/10 text-[#1E3A5F] rounded-md hover:bg-[#1E3A5F]/20 transition-colors font-medium">View Bids</button>
                        <button className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors">Extend</button>
                        {auction.status === 'Active' && (
                          <button onClick={() => setShowCloseFlow(auction.id)} className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors">Close</button>
                        )}
                        <button onClick={() => router.push(`/cars/${auction.ckId}`)} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors">View Car</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bid History Slide Panel */}
      {selectedAuction && selectedAuctionData && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setSelectedAuction(null)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-[#1E3A5F] text-lg">Bid History</h2>
                <button onClick={() => setSelectedAuction(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"><X size={18} /></button>
              </div>
              <p className="text-sm text-gray-600">{selectedAuctionData.vehicle} — {selectedAuctionData.ckId}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-gray-500">Current Highest Bid:</span>
                <span className="text-xl font-bold text-green-600">₦{selectedAuctionData.currentBid.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{selectedAuctionData.bidCount} total bids</p>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {bids.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">No bids yet</p>
              ) : bids.map((bid, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${i === 0 ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-gray-50/50'}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800">{bid.bidder}</span>
                      {i === 0 && <span className="text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-full">Highest Bid</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><Clock size={10} /> {bid.time}</p>
                  </div>
                  <span className={`font-bold ${i === 0 ? 'text-green-700 text-base' : 'text-gray-700 text-sm'}`}>₦{bid.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
            {selectedAuctionData.status.startsWith('Ended') && (
              <div className="p-5 border-t border-gray-100">
                {selectedAuctionData.reserveMet ? (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-700">Auction Closed — Winner: <span className="text-green-700">{bids[0]?.bidder}</span> at ₦{selectedAuctionData.currentBid.toLocaleString()}</p>
                    <div className="flex gap-2">
                      <button onClick={() => { setSelectedAuction(null); router.push('/deal-pipeline'); }} className="flex-1 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors">Yes — Create Deal</button>
                      <button onClick={() => setSelectedAuction(null)} className="flex-1 py-2 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition-colors">No — Close</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-amber-700 font-semibold">Reserve not met. Highest bid: ₦{selectedAuctionData.currentBid.toLocaleString()}</p>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl">Extend Auction</button>
                      <button className="flex-1 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl">Accept Highest Bid</button>
                      <button className="flex-1 py-2 border border-gray-200 text-gray-600 text-xs rounded-xl">Close without sale</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Auction Close Flow Modal */}
      {showCloseFlow && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-[#1E3A5F] text-lg mb-2">Close Auction Early</h3>
            <p className="text-sm text-gray-500 mb-5">Are you sure you want to close this auction before it ends?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCloseFlow(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => setShowCloseFlow(null)} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors">Close Auction</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
