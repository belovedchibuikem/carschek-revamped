'use client';

import React, { useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { formatNaira, STATUS_COLORS } from '@/lib/mockData';
import { Handshake, Send, ShieldCheck, CheckSquare, Square, Car, User } from 'lucide-react';
import { toast } from 'sonner';
import { dealsApi } from '@/lib/api/services';
import { useApiResource } from '@/hooks/useApiResource';

function getCarschekRole(): string {
  if (typeof document === 'undefined') return '';
  const m = document.cookie.match(/(?:^|; )carschek-role=([^;]*)/);
  return m?.[1] ? decodeURIComponent(m[1]) : '';
}

export default function DealDetailPage() {
  const pathname = usePathname();
  const params = useParams();
  const id = params.id as string;
  const { data: deal, loading, error } = useApiResource(() => dealsApi.get(id), [id]);

  const [messages, setMessages] = useState(() => [
    { id: 'm1', role: 'system' as const, text: `Deal ${id} opened. Stage: Negotiation.` },
    { id: 'm2', role: 'buyer' as const, text: 'Can we confirm inspection report RPT-440 before final price?' },
    { id: 'm3', role: 'seller' as const, text: 'Yes — report is attached to the car record.' },
  ]);
  const [draft, setDraft] = useState('');
  const [checks, setChecks] = useState({
    paymentReceived: false,
    docsSigned: false,
    keysHanded: false,
    buyerConfirmed: false,
  });
  const [escrowReleased, setEscrowReleased] = useState(false);

  if (loading) {
    return (
      <AppLayout currentPath={pathname}>
        <div className="p-8 text-sm text-[#6B7280]">Loading deal…</div>
      </AppLayout>
    );
  }
  if (error || !deal) {
    return (
      <AppLayout currentPath={pathname}>
        <div className="p-8 text-sm text-red-700">{error || 'Deal not found'}</div>
      </AppLayout>
    );
  }

  const allHandoverDone = useMemo(() => Object.values(checks).every(Boolean), [checks]);

  const sendMessage = () => {
    const t = draft.trim();
    if (!t) return;
    setMessages(m => [...m, { id: `m-${Date.now()}`, role: 'seller', text: t }]);
    setDraft('');
    toast.success('Message sent');
  };

  const releaseEscrow = () => {
    const role = getCarschekRole();
    if (!role || (role !== 'finance' && role !== 'super-admin')) {
      toast.error('Only Finance or Super Admin can release escrow.');
      return;
    }
    setEscrowReleased(true);
    toast.success('Escrow released to seller (simulated).');
  };

  if (!deal) {
    return (
      <AppLayout currentPath={pathname}>
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-center">
          <p className="font-medium text-[#1F2937]">Deal not found</p>
          <Link href="/deals" className="mt-3 inline-block text-sm text-[#ff8a65] hover:underline">
            Back to deals
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
              <Link href="/deals" className="hover:text-[#ff5722]">
                Deals
              </Link>
              <span>/</span>
              <span className="font-mono text-[#1F2937]">{deal.id}</span>
            </div>
            <h1 className="text-2xl font-heading font-bold text-[#1F2937] flex items-center gap-2">
              <Handshake className="text-[#ff5722]" size={26} />
              {deal.carName}
            </h1>
            <p className="text-sm text-[#6B7280] mt-1">
              Buyer <span className="font-medium text-[#1F2937]">{deal.buyerName}</span> ·{' '}
              <span className="font-semibold text-[#1F2937]">{formatNaira(deal.amount)}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${STATUS_COLORS[deal.stage] || 'bg-gray-100 text-gray-700'}`}>
              {deal.stage}
            </span>
            <Link
              href={`/cars/${deal.carId}`}
              className="inline-flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#1F2937] hover:bg-[#F4F6F8]"
            >
              <Car size={16} /> Car
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
              <h2 className="text-sm font-heading font-semibold text-[#1F2937] mb-3">Negotiation</h2>
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {messages.map(m => (
                  <div
                    key={m.id}
                    className={`rounded-lg px-3 py-2 text-sm ${
                      m.role === 'system' ?'bg-[#F9FAFB] text-[#6B7280] text-center'
                        : m.role === 'buyer' ?'bg-blue-50 text-[#1F2937] border border-blue-100' :'bg-[#F4F6F8] text-[#1F2937] ml-8'
                    }`}
                  >
                    {m.role !== 'system' && (
                      <p className="text-[10px] font-semibold uppercase text-[#9CA3AF] mb-0.5 flex items-center gap-1">
                        {m.role === 'buyer' ? <User size={10} /> : null}
                        {m.role}
                      </p>
                    )}
                    {m.text}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <input
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message…"
                  className="flex-1 px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19]"
                >
                  <Send size={16} /> Send
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
              <h2 className="text-sm font-heading font-semibold text-[#1F2937] mb-3 flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#1A7A4A]" />
                Escrow
              </h2>
              <p className="text-xs text-[#6B7280] mb-3">
                Funds held until handover checklist is complete. Release requires Finance or Super Admin role (session cookie).
              </p>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-[#6B7280]">Status</span>
                <span className={`font-semibold ${escrowReleased ? 'text-[#1A7A4A]' : 'text-[#D35400]'}`}>
                  {escrowReleased ? 'Released' : 'Held'}
                </span>
              </div>
              <button
                type="button"
                disabled={!allHandoverDone || escrowReleased}
                onClick={releaseEscrow}
                className="w-full py-2.5 rounded-lg text-sm font-semibold bg-[#1A7A4A] text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {escrowReleased ? 'Escrow released' : 'Release escrow'}
              </button>
              {!allHandoverDone && !escrowReleased && (
                <p className="text-[11px] text-[#9CA3AF] mt-2">Complete handover checklist first.</p>
              )}
            </div>

            <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
              <h2 className="text-sm font-heading font-semibold text-[#1F2937] mb-3">Handover checklist</h2>
              <ul className="space-y-2">
                {(
                  [
                    ['paymentReceived', 'Payment received in full'],
                    ['docsSigned', 'Documents signed'],
                    ['keysHanded', 'Keys & accessories handed over'],
                    ['buyerConfirmed', 'Buyer confirmed receipt'],
                  ] as const
                ).map(([key, label]) => (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => setChecks(c => ({ ...c, [key]: !c[key] }))}
                      className="flex items-start gap-2 w-full text-left text-sm text-[#1F2937] hover:bg-[#F9FAFB] rounded-lg p-2 -m-2"
                    >
                      {checks[key] ? (
                        <CheckSquare size={18} className="text-[#1A7A4A] shrink-0 mt-0.5" />
                      ) : (
                        <Square size={18} className="text-[#9CA3AF] shrink-0 mt-0.5" />
                      )}
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] p-4 text-xs text-[#6B7280]">
              <p>
                Assigned to <span className="font-medium text-[#1F2937]">{deal.assignedTo}</span> · Created{' '}
                {deal.createdAt}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
