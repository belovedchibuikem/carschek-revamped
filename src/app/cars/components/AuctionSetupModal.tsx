'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AuctionSetupModal({
  open,
  onClose,
  carId,
  vehicleTitle,
  docsComplete,
  onPushed,
}: {
  open: boolean;
  onClose: () => void;
  carId: string;
  vehicleTitle: string;
  docsComplete: boolean;
  onPushed?: () => void;
}) {
  const router = useRouter();
  const [startingPrice, setStartingPrice] = useState('');
  const [platformFee, setPlatformFee] = useState(15);
  const [endsAt, setEndsAt] = useState('');

  if (!open) return null;

  const priceNum = parseInt(startingPrice.replace(/\D/g, ''), 10) || 0;
  const afterFee = Math.round(priceNum * (1 - platformFee / 100));

  const push = () => {
    if (!docsComplete) {
      toast.error('At least 6 documents required before starting an auction');
      return;
    }
    if (!priceNum || priceNum <= 0) {
      toast.error('Enter a starting price');
      return;
    }
    onClose();
    onPushed?.();
    toast.success(`Auction queued for ${carId} — opening auctions`);
    router.push('/auctions');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-[#E5E7EB]">
        <div className="p-6 border-b border-[#E5E7EB]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-heading font-bold text-[#ff5722]">Start Auction</h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                {vehicleTitle} — <span className="font-mono">{carId}</span>
              </p>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-[#F4F6F8] rounded-lg text-[#9CA3AF] text-xl leading-none">
              ×
            </button>
          </div>
        </div>
        <div className="p-6 space-y-5">
          {!docsComplete && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              This car has fewer than 6 documents uploaded. Complete document compliance before going live.
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">Auction starting price (₦) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] font-semibold text-sm">₦</span>
              <input
                type="text"
                inputMode="numeric"
                value={startingPrice ? priceNum.toLocaleString('en-NG') : ''}
                onChange={e => setStartingPrice(e.target.value.replace(/\D/g, ''))}
                placeholder="0"
                className="w-full border border-[#E5E7EB] rounded-lg pl-8 pr-3 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-2">Platform fee %</label>
            <div className="flex rounded-lg border border-[#E5E7EB] overflow-hidden">
              {[1, 5, 10, 15, 20].map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setPlatformFee(f)}
                  className={`flex-1 py-2 text-xs font-bold transition-colors ${platformFee === f ? 'bg-[#ff5722] text-white' : 'text-[#6B7280] hover:bg-[#F9FAFB]'}`}
                >
                  {f}%
                </button>
              ))}
            </div>
            {priceNum > 0 && (
              <div className="mt-2 p-3 bg-[#F4F6F8] rounded-lg text-xs text-[#6B7280]">
                ₦{priceNum.toLocaleString('en-NG')} × (1 − {platformFee}%) ={' '}
                <span className="font-bold text-[#ff5722]">₦{afterFee.toLocaleString('en-NG')}</span> visible to bidders after fee
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">Auction end (local)</label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={e => setEndsAt(e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
            />
          </div>
          {priceNum > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
              <span className="font-bold">Summary: </span>
              Start ₦{priceNum.toLocaleString('en-NG')} · Fee {platformFee}% · Bidders see ~₦{afterFee.toLocaleString('en-NG')}
            </div>
          )}
        </div>
        <div className="p-6 border-t border-[#E5E7EB] flex flex-wrap gap-2">
          <button type="button" onClick={onClose} className="flex-1 min-w-[100px] py-2.5 border border-[#E5E7EB] rounded-xl text-sm text-[#374151] hover:bg-[#F9FAFB]">
            Close
          </button>
          <button
            type="button"
            onClick={() => toast.message('Draft saved locally')}
            className="flex-1 min-w-[100px] py-2.5 border border-[#ff5722] text-[#ff5722] rounded-xl text-sm font-semibold hover:bg-[#ff5722]/5"
          >
            Save Draft
          </button>
          <button type="button" onClick={push} className="flex-1 min-w-[120px] py-2.5 bg-[#D35400] text-white rounded-xl text-sm font-bold hover:bg-orange-700">
            Push to Auction
          </button>
        </div>
      </div>
    </div>
  );
}
