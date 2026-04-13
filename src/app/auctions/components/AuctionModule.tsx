'use client';
import React, { useState } from 'react';
import { Clock, X, Check, Users, Eye } from 'lucide-react';
import { AuctionRow, AuctionBid } from '@/types/domain';

const MOCK_AUCTIONS: AuctionRow[] = [
  { id: 'a1', carId: '3', ckId: 'CK-39', vehicleLabel: 'Mercedes-Benz C300 2018', vin: 'WDD2050421R012345', startingBid: 12000000, highestBid: 13500000, bidCount: 8, reserveMet: true, endsAt: '2025-04-15T18:00:00', startedAt: '2025-04-12T10:00:00', status: 'active', reservePrice: 13000000 },
  { id: 'a2', carId: '5', ckId: 'CK-37', vehicleLabel: 'Ford Explorer 2019', vin: '1FM5K8D88KGA12345', startingBid: 8500000, highestBid: 8900000, bidCount: 3, reserveMet: false, endsAt: '2025-04-14T12:00:00', startedAt: '2025-04-11T09:00:00', status: 'active', reservePrice: 9500000 },
  { id: 'a3', carId: '7', ckId: 'CK-35', vehicleLabel: 'Hyundai Tucson 2017', vin: 'KM8J3CA46HU012345', startingBid: 6200000, highestBid: 6200000, bidCount: 0, reserveMet: false, endsAt: '2025-04-13T08:00:00', startedAt: '2025-04-10T08:00:00', status: 'ended_no_sale', reservePrice: 6800000 },
];

const MOCK_BIDS: AuctionBid[] = [
  { id: 'b1', bidder: 'Adaeze Mensah', anonymous: false, amount: 13500000, at: '2025-04-14T15:32:00', isHighest: true },
  { id: 'b2', bidder: 'Anonymous Bidder #2', anonymous: true, amount: 13200000, at: '2025-04-14T14:10:00', isHighest: false },
  { id: 'b3', bidder: 'Emeka Obi', anonymous: false, amount: 12800000, at: '2025-04-13T11:45:00', isHighest: false },
  { id: 'b4', bidder: 'Anonymous Bidder #1', anonymous: true, amount: 12500000, at: '2025-04-13T09:20:00', isHighest: false },
];

const STATUS_CONFIG = {
  active: { label: 'Active', cls: 'bg-green-100 text-green-700 border-green-200' },
  extended: { label: 'Extended', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  ended_no_sale: { label: 'Ended — No Sale', cls: 'bg-gray-100 text-gray-500 border-gray-200' },
  ended_sale: { label: 'Ended — Sale', cls: 'bg-[#1E3A5F] text-white border-[#1E3A5F]' },
};

function getTimeRemaining(endsAt: string) {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return { label: 'ENDED', cls: 'bg-gray-100 text-gray-500 border-gray-200' };
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 24) return { label: `${Math.floor(hours / 24)}d ${hours % 24}h`, cls: 'bg-green-100 text-green-700 border-green-200' };
  if (hours >= 1) return { label: `${hours}h ${mins}m`, cls: 'bg-amber-100 text-amber-700 border-amber-200' };
  return { label: `${mins}m`, cls: 'bg-red-100 text-red-700 border-red-200' };
}

function fmt(n: number) { return '₦' + n.toLocaleString('en-NG'); }

export default function AuctionModule() {
  const [bidPanel, setBidPanel] = useState<AuctionRow | null>(null);
  const [closeModal, setCloseModal] = useState<AuctionRow | null>(null);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Auctions</h1>
          <span className="bg-[#1E3A5F] text-white text-xs font-bold px-2.5 py-1 rounded-full">{MOCK_AUCTIONS.length} auctions</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active', value: MOCK_AUCTIONS.filter(a => a.status === 'active').length, cls: 'text-green-600' },
          { label: 'Total Bids', value: MOCK_AUCTIONS.reduce((s, a) => s + a.bidCount, 0), cls: 'text-[#1E3A5F]' },
          { label: 'Reserve Met', value: MOCK_AUCTIONS.filter(a => a.reserveMet).length, cls: 'text-teal-600' },
          { label: 'Ended', value: MOCK_AUCTIONS.filter(a => a.status.startsWith('ended')).length, cls: 'text-[#6B7280]' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-[#E5E7EB] p-4">
            <p className="text-xs text-[#9CA3AF] font-medium">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
              <tr>
                {['CK ID','Vehicle','Starting Bid','Highest Bid','Bids','Reserve Met','Time Remaining','Status','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {MOCK_AUCTIONS.map(auction => {
                const time = getTimeRemaining(auction.endsAt);
                return (
                  <tr key={auction.id} className="hover:bg-[#F8FAFC] transition-all">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">{auction.ckId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#1F2937] text-sm">{auction.vehicleLabel}</p>
                      <p className="text-[10px] text-[#9CA3AF] font-mono">{auction.vin.slice(0, 12)}…</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#1F2937]">{fmt(auction.startingBid)}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-[#1F2937]">{fmt(auction.highestBid)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-sm font-semibold text-[#374151]"><Users size={13} className="text-[#9CA3AF]" />{auction.bidCount}</span>
                    </td>
                    <td className="px-4 py-3">
                      {auction.reserveMet ? <Check size={16} className="text-green-600" /> : <span className="text-[#D1D5DB]">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${time.cls}`}>
                        <Clock size={10} /> {time.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_CONFIG[auction.status].cls}`}>
                        {STATUS_CONFIG[auction.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setBidPanel(auction)} className="px-2.5 py-1.5 bg-[#1E3A5F] text-white text-xs font-semibold rounded-lg hover:bg-[#16304F] transition-all flex items-center gap-1">
                          <Eye size={11} /> Bids
                        </button>
                        <button onClick={() => setCloseModal(auction)} className="px-2.5 py-1.5 border border-[#E5E7EB] text-xs font-semibold text-[#6B7280] rounded-lg hover:bg-[#F4F6F8] transition-all">Close</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bid History Panel */}
      {bidPanel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setBidPanel(null)} />
          <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB]">
              <div>
                <h2 className="font-heading font-bold text-[#1F2937]">Bid History</h2>
                <p className="text-sm text-[#6B7280]">{bidPanel.vehicleLabel} — {bidPanel.ckId}</p>
              </div>
              <button onClick={() => setBidPanel(null)} className="p-2 rounded-lg hover:bg-[#F4F6F8] text-[#6B7280]"><X size={18} /></button>
            </div>
            <div className="p-5 border-b border-[#E5E7EB]">
              <p className="text-xs text-[#9CA3AF] font-medium">Current Highest Bid</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{fmt(bidPanel.highestBid)}</p>
              <p className="text-xs text-[#9CA3AF] mt-1">{bidPanel.bidCount} total bids</p>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {MOCK_BIDS.map(bid => (
                <div key={bid.id} className={`flex items-center justify-between p-3.5 rounded-xl border ${bid.isHighest ? 'bg-green-50 border-green-200' : 'bg-[#F8FAFC] border-[#E5E7EB]'}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#1F2937]">{bid.bidder}</p>
                      {bid.isHighest && <span className="text-[10px] font-bold px-2 py-0.5 bg-green-600 text-white rounded-full">Highest Bid</span>}
                    </div>
                    <p className="text-[10px] text-[#9CA3AF] mt-0.5">{new Date(bid.at).toLocaleString()}</p>
                  </div>
                  <span className={`font-bold text-sm ${bid.isHighest ? 'text-green-700' : 'text-[#1F2937]'}`}>{fmt(bid.amount)}</span>
                </div>
              ))}
            </div>
            {bidPanel.status === 'ended_sale' && (
              <div className="p-5 border-t border-[#E5E7EB]">
                <button className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all">Create Deal</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Close Auction Modal */}
      {closeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-heading font-bold text-[#1F2937]">Close Auction — {closeModal.ckId}</h2>
            {closeModal.reserveMet ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-sm font-semibold text-green-800">Reserve met! Highest bid: {fmt(closeModal.highestBid)}</p>
                <p className="text-sm text-green-700 mt-1">Winner: Adaeze Mensah at {fmt(closeModal.highestBid)}</p>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm font-semibold text-amber-800">Reserve not met. Highest bid: {fmt(closeModal.highestBid)}</p>
                <p className="text-sm text-amber-700 mt-1">Reserve price: {fmt(closeModal.reservePrice ?? 0)}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setCloseModal(null)} className="flex-1 py-2.5 border border-[#E5E7EB] text-sm font-semibold text-[#374151] rounded-xl hover:bg-[#F4F6F8]">Cancel</button>
              {closeModal.reserveMet ? (
                <button className="flex-1 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700">Create Deal</button>
              ) : (
                <button className="flex-1 py-2.5 bg-[#1E3A5F] text-white text-sm font-bold rounded-xl hover:bg-[#16304F]">Close without Sale</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
