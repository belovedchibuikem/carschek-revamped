'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';
import { formatNaira, STATUS_COLORS } from '@/lib/mockData';
import { toast } from 'sonner';
import { offersApi } from '@/lib/api/services';
import { useApiResource } from '@/hooks/useApiResource';

export default function OfferDetailPage() {
  const pathname = usePathname();
  const params = useParams();
  const offerId = params.id as string;
  const { data: offer, loading, error } = useApiResource(() => offersApi.get(offerId), [offerId]);
  const [responseModal, setResponseModal] = useState(false);
  const [response, setResponse] = useState<'Accepted' | 'Rejected' | null>(null);
  const [responseNote, setResponseNote] = useState('');

  if (loading) {
    return (
      <AppLayout currentPath={pathname}>
        <div className="p-8 text-sm text-[#6B7280]">Loading offer…</div>
      </AppLayout>
    );
  }
  if (error || !offer) {
    return (
      <AppLayout currentPath={pathname}>
        <div className="p-8 text-sm text-red-700">{error || 'Offer not found'}</div>
      </AppLayout>
    );
  }

  const handleRecord = () => {
    if (!response) { toast.error('Please select a response'); return; }
    toast.success(`Response recorded: ${response}`);
    if (response === 'Accepted') toast.success('Deal created from offer!');
    setResponseModal(false);
  };

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-5 max-w-2xl">
        <div className="flex items-center gap-3">
          <Link href="/offers" className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E7EB] hover:bg-[#F4F6F8] transition-colors">
            <ArrowLeft size={16} className="text-[#6B7280]" />
          </Link>
          <h1 className="text-xl font-heading font-bold text-[#1F2937]">{offer.id}</h1>
        </div>

        {responseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setResponseModal(false)} />
            <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-fade-in">
              <h3 className="text-base font-heading font-semibold text-[#1F2937] mb-4">Record Response</h3>
              <div className="flex gap-3 mb-4">
                {(['Accepted', 'Rejected'] as const).map(r => (
                  <button key={r} onClick={() => setResponse(r)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all ${response === r ? r === 'Accepted' ? 'bg-[#1A7A4A] text-white border-[#1A7A4A]' : 'bg-[#C0392B] text-white border-[#C0392B]' : 'border-[#E5E7EB] text-[#6B7280]'}`}>
                    {r === 'Accepted' ? '✓ Accepted' : '✗ Rejected'}
                  </button>
                ))}
              </div>
              <textarea value={responseNote} onChange={e => setResponseNote(e.target.value)} placeholder="Notes…" rows={2}
                className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30 mb-4" />
              <div className="flex gap-3">
                <button onClick={() => setResponseModal(false)} className="flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium hover:bg-[#F4F6F8]">Cancel</button>
                <button onClick={handleRecord} className="flex-1 px-4 py-2.5 bg-[#ff5722] text-white rounded-lg text-sm font-semibold hover:bg-[#e64a19]">Record</button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[offer.status] || 'bg-gray-100 text-gray-700'}`}>{offer.status}</span>
            <span className="text-xs text-[#6B7280]">Valid until {offer.validUntil}</span>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Car', value: offer.carName },
              { label: 'Contact', value: offer.contactName },
              { label: 'Offer Price', value: formatNaira(offer.offerPrice) },
              { label: 'Sent Via', value: offer.sentVia.join(', ') || 'Not sent' },
              { label: 'Created', value: offer.createdAt },
            ].map(f => (
              <div key={f.label} className="flex justify-between py-2 border-b border-[#F4F6F8] last:border-0">
                <span className="text-xs text-[#6B7280]">{f.label}</span>
                <span className="text-sm font-medium text-[#1F2937]">{f.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => setResponseModal(true)} className="flex-1 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19] transition-all">
            Record Response
          </button>
          {offer.status === 'Draft' && (
            <button onClick={() => toast.success('Offer sent!')} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#ff8a65] text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all">
              <Send size={14} /> Send Offer
            </button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
