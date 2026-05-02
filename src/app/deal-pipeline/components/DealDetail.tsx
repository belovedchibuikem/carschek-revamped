'use client';
import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Clock, DollarSign, MapPin, Calendar, AlertTriangle, MessageSquare, Shield, FileText, ChevronDown } from 'lucide-react';
import { Deal } from './DealPipelineModule';
import { toast } from 'sonner';

const OFFER_THREAD = [
  { id: 'msg-1', sender: 'Adaeze Mbah', avatar: 'AM', role: 'buyer', type: 'offer', amount: 4800000, message: 'I am interested in this vehicle. My offer is ₦4,800,000.', time: '08 Apr 2026, 09:15' },
  { id: 'msg-2', sender: 'Chidi Okeke', avatar: 'CO', role: 'seller', type: 'counter', amount: 5100000, message: 'Thank you for your interest. I can accept ₦5,100,000 as the final price.', time: '08 Apr 2026, 11:30' },
  { id: 'msg-3', sender: 'Adaeze Mbah', avatar: 'AM', role: 'buyer', type: 'counter', amount: 4950000, message: 'I can go up to ₦4,950,000. This is my best offer.', time: '08 Apr 2026, 14:00' },
  { id: 'msg-4', sender: 'Emeka Okonkwo', avatar: 'EO', role: 'agent', type: 'message', message: 'Both parties, I suggest we meet at ₦5,000,000 which is fair given the Carschek Score of 82.', time: '09 Apr 2026, 09:00' },
  { id: 'msg-5', sender: 'Chidi Okeke', avatar: 'CO', role: 'seller', type: 'accept', amount: 5000000, message: 'Agreed. ₦5,000,000 is acceptable.', time: '09 Apr 2026, 10:15' },
];

const HANDOVER_CHECKLIST = [
  { id: 'hc-keys', label: 'Vehicle keys handed over', checked: false },
  { id: 'hc-docs', label: 'All vehicle documents transferred', checked: false },
  { id: 'hc-condition', label: 'Car in agreed condition verified', checked: true },
  { id: 'hc-payment', label: 'Payment confirmed in escrow', checked: true },
];

interface Props { deal: Deal; onBack: () => void; }

export default function DealDetail({ deal, onBack }: Props) {
  const [activeSection, setActiveSection] = useState<'negotiation' | 'payment' | 'handover' | 'commission'>('negotiation');
  const [checklist, setChecklist] = useState(HANDOVER_CHECKLIST);
  const [showEscrowModal, setShowEscrowModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [handoverDate, setHandoverDate] = useState(deal.handoverDate || '');
  const [handoverLocation, setHandoverLocation] = useState(deal.handoverLocation || '');

  const agreedPrice = deal.agreedPrice || deal.offerPrice;
  const commission = Math.round(agreedPrice * deal.commissionRate / 100);
  const sellerPayout = agreedPrice - commission;

  const allChecked = checklist.every(c => c.checked);

  const PAYMENT_STEPS = [
    { id: 'ps-1', label: 'Payment Initiated', done: true, time: '09 Apr 2026, 11:00' },
    { id: 'ps-2', label: 'Payment Confirmed', done: true, time: '09 Apr 2026, 11:05' },
    { id: 'ps-3', label: 'Held in Escrow', done: deal.stage === 'payment' || deal.stage === 'handover' || deal.stage === 'completed', time: deal.escrowRef ? '09 Apr 2026, 11:10' : '—' },
    { id: 'ps-4', label: 'Released to Seller', done: deal.stage === 'completed', time: deal.stage === 'completed' ? '10 Apr 2026, 15:00' : '—' },
  ];

  const SECTIONS = [
    { id: 'negotiation' as const, label: 'Negotiation Thread', icon: MessageSquare },
    { id: 'payment' as const, label: 'Payment & Escrow', icon: Shield },
    { id: 'handover' as const, label: 'Handover', icon: CheckCircle },
    { id: 'commission' as const, label: 'Commission', icon: DollarSign },
  ];

  const SCORE_COLOR = (s: number) => s >= 71 ? '#1A7A4A' : s >= 41 ? '#D35400' : '#C0392B';

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#1F2937] transition-colors">
        <ArrowLeft size={16} /> Back to Deal Pipeline
      </button>

      {/* Deal header */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-12 bg-[#F4F6F8] rounded-xl border border-[#E5E7EB] flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-[#6B7280]">{deal.make[0]}{deal.model[0]}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-sm font-bold text-[#ff5722]">{deal.id}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                  deal.stage === 'completed' ? 'bg-green-50 text-green-700' :
                  deal.stage === 'payment' ? 'bg-teal-50 text-teal-700' :
                  deal.stage === 'handover' ? 'bg-purple-50 text-purple-700' :
                  deal.stage === 'negotiating' ? 'bg-amber-50 text-amber-700' :
                  deal.stage === 'offer' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'
                }`}>{deal.stage === 'offer' ? 'Offer Made' : deal.stage === 'negotiating' ? 'Negotiating' : deal.stage === 'payment' ? 'Payment Received' : deal.stage === 'handover' ? 'Handover Scheduled' : deal.stage === 'completed' ? 'Completed' : 'Interest'}</span>
              </div>
              <h1 className="text-lg font-heading font-bold text-[#1F2937] mt-0.5">{deal.vehicle}</h1>
              <p className="text-xs font-mono text-[#6B7280]">{deal.plate} · Created {deal.createdAt}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-heading font-bold text-[#1F2937] tabular-nums">₦{agreedPrice.toLocaleString()}</p>
            {deal.agreedPrice && <p className="text-xs text-[#1A7A4A] font-semibold">Agreed price</p>}
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: SCORE_COLOR(deal.score), backgroundColor: `${SCORE_COLOR(deal.score)}15` }}>Score: {deal.score}</span>
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Buyer', name: deal.buyerName, avatar: deal.buyerAvatar, phone: deal.buyerPhone, email: deal.buyerEmail, color: '#ff5722' },
            { label: 'Seller', name: deal.sellerName, avatar: deal.sellerAvatar, phone: deal.sellerPhone, email: deal.sellerEmail, color: '#ff8a65' },
            { label: 'Assigned Agent', name: deal.agentName, avatar: deal.agentAvatar, phone: '—', email: '—', color: '#D35400', isAgent: true },
          ].map(party => (
            <div key={party.label} className="flex items-center gap-3 p-3 bg-[#F4F6F8] rounded-xl border border-[#E5E7EB]">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: party.color }}>
                {party.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-[#6B7280] font-semibold uppercase tracking-wide">{party.label}</p>
                <p className="text-sm font-semibold text-[#1F2937] truncate">{party.name}</p>
                {!party.isAgent && <p className="text-[10px] text-[#6B7280] truncate">{party.phone}</p>}
                {party.isAgent && (
                  <button onClick={() => toast.info('Reassign agent modal')} className="text-[10px] text-[#ff8a65] hover:underline">Reassign</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${activeSection === s.id ? 'bg-[#ff5722] text-white' : 'border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F4F6F8]'}`}
          >
            <s.icon size={13} />
            {s.label}
          </button>
        ))}
      </div>

      {/* NEGOTIATION THREAD */}
      {activeSection === 'negotiation' && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-heading font-semibold text-[#1F2937]">Offer / Counter-Offer History</h3>

          {deal.agreedPrice && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <CheckCircle size={18} className="text-[#1A7A4A] flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-[#1A7A4A]">Agreed Price: ₦{deal.agreedPrice.toLocaleString()}</p>
                <p className="text-xs text-[#6B7280]">Both parties have accepted this price</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {OFFER_THREAD.map(msg => {
              const isOffer = msg.type === 'offer' || msg.type === 'counter' || msg.type === 'accept';
              const isBuyer = msg.role === 'buyer';
              const isAgent = msg.role === 'agent';
              return (
                <div key={msg.id} className={`flex gap-3 ${isBuyer ? '' : 'flex-row-reverse'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${isBuyer ? 'bg-[#ff5722]' : isAgent ? 'bg-[#D35400]' : 'bg-[#ff8a65]'}`}>
                    {msg.avatar}
                  </div>
                  <div className={`flex-1 max-w-sm ${isBuyer ? '' : 'items-end flex flex-col'}`}>
                    <p className="text-[10px] text-[#6B7280] mb-1">{msg.sender} · {msg.time}</p>
                    {isOffer ? (
                      <div className={`p-3 rounded-xl border ${msg.type === 'accept' ? 'bg-green-50 border-green-200' : isBuyer ? 'bg-blue-50 border-blue-200' : 'bg-[#F4F6F8] border-[#E5E7EB]'}`}>
                        <p className={`text-sm font-bold tabular-nums ${msg.type === 'accept' ? 'text-[#1A7A4A]' : 'text-[#1F2937]'}`}>
                          {msg.type === 'accept' ? '✓ Accepted: ' : msg.type === 'counter' ? 'Counter-offer: ' : 'Offer: '}
                          ₦{msg.amount?.toLocaleString()}
                        </p>
                        <p className="text-xs text-[#6B7280] mt-1">{msg.message}</p>
                        {msg.type === 'offer' && (
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => toast.success('Offer accepted')} className="px-2.5 py-1 bg-[#1A7A4A] text-white text-[10px] font-semibold rounded-lg hover:bg-[#155F3A]">Accept</button>
                            <button onClick={() => toast.info('Counter-offer modal')} className="px-2.5 py-1 bg-[#ff8a65] text-white text-[10px] font-semibold rounded-lg hover:bg-[#2563A0]">Counter</button>
                            <button onClick={() => toast.error('Offer declined')} className="px-2.5 py-1 border border-[#C0392B] text-[#C0392B] text-[10px] font-semibold rounded-lg hover:bg-red-50">Decline</button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={`p-3 rounded-xl ${isAgent ? 'bg-amber-50 border border-amber-200' : 'bg-[#F4F6F8] border border-[#E5E7EB]'}`}>
                        <p className="text-sm text-[#1F2937]">{msg.message}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PAYMENT & ESCROW */}
      {activeSection === 'payment' && (
        <div className="space-y-4">
          {deal.escrowRef ? (
            <div className="bg-white rounded-xl border-l-4 border-l-[#1A7A4A] border border-[#E5E7EB] p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Shield size={20} className="text-[#1A7A4A]" />
                <div>
                  <p className="text-sm font-heading font-bold text-[#1A7A4A]">₦{agreedPrice.toLocaleString()} held in escrow</p>
                  <p className="text-xs text-[#6B7280] font-mono">Ref: {deal.escrowRef}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setShowEscrowModal(true)} className="px-4 py-2 bg-[#1A7A4A] text-white text-xs font-semibold rounded-lg hover:bg-[#155F3A] transition-all">
                  Release Escrow
                </button>
                <button onClick={() => setShowRefundModal(true)} className="px-4 py-2 border border-[#C0392B] text-[#C0392B] text-xs font-semibold rounded-lg hover:bg-red-50 transition-all">
                  Process Refund
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertTriangle size={18} className="text-[#D35400]" />
                <p className="text-sm text-[#D35400] font-semibold">Payment not yet received — awaiting buyer transfer</p>
              </div>
            </div>
          )}

          {/* Payment timeline */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
            <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Payment Timeline</h3>
            <div className="space-y-3">
              {PAYMENT_STEPS.map((step, idx) => (
                <div key={step.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step.done ? 'bg-[#1A7A4A] border-[#1A7A4A] text-white' : 'bg-white border-[#E5E7EB] text-[#6B7280]'}`}>
                      {step.done ? <CheckCircle size={14} /> : <Clock size={14} />}
                    </div>
                    {idx < PAYMENT_STEPS.length - 1 && <div className={`w-0.5 h-6 mt-1 ${step.done ? 'bg-[#1A7A4A]' : 'bg-[#E5E7EB]'}`} />}
                  </div>
                  <div className="flex-1 pb-3">
                    <p className={`text-sm font-semibold ${step.done ? 'text-[#1F2937]' : 'text-[#6B7280]'}`}>{step.label}</p>
                    <p className="text-xs text-[#6B7280]">{step.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HANDOVER */}
      {activeSection === 'handover' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
            <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Handover Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-xs font-semibold text-[#1F2937] mb-1.5 flex items-center gap-1.5"><Calendar size={12} /> Handover Date & Time</label>
                <input type="text" value={handoverDate} onChange={e => setHandoverDate(e.target.value)} placeholder="e.g. 12 Apr 2026, 10:00" className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20 focus:border-[#ff5722] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1F2937] mb-1.5 flex items-center gap-1.5"><MapPin size={12} /> Location</label>
                <input type="text" value={handoverLocation} onChange={e => setHandoverLocation(e.target.value)} placeholder="e.g. Carschek Hub, Lekki" className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20 focus:border-[#ff5722] transition-all" />
              </div>
            </div>

            {/* Checklist */}
            <h4 className="text-xs font-semibold text-[#1F2937] mb-3">Handover Checklist</h4>
            <div className="space-y-2 mb-5">
              {checklist.map(item => (
                <label key={item.id} className="flex items-center gap-3 p-3 bg-[#F4F6F8] rounded-xl border border-[#E5E7EB] cursor-pointer hover:bg-[#EEF2FF] transition-colors">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => setChecklist(prev => prev.map(c => c.id === item.id ? { ...c, checked: !c.checked } : c))}
                    className="w-4 h-4 rounded accent-[#ff5722]"
                  />
                  <span className={`text-sm ${item.checked ? 'text-[#1F2937] line-through opacity-60' : 'text-[#1F2937]'}`}>{item.label}</span>
                  {item.checked && <CheckCircle size={14} className="text-[#1A7A4A] ml-auto" />}
                </label>
              ))}
            </div>

            <button
              onClick={() => {
                if (!allChecked) { toast.error('Please complete all checklist items first'); return; }
                toast.success('Handover confirmed! Escrow released, seller payout initiated, deal closed.');
              }}
              className={`w-full py-3 text-sm font-semibold rounded-xl transition-all ${allChecked ? 'bg-[#1A7A4A] text-white hover:bg-[#155F3A] active:scale-[0.99]' : 'bg-[#E5E7EB] text-[#6B7280] cursor-not-allowed'}`}
            >
              Confirm Handover Complete
            </button>
            {!allChecked && <p className="text-xs text-[#6B7280] text-center mt-2">Complete all checklist items to confirm handover</p>}
          </div>
        </div>
      )}

      {/* COMMISSION */}
      {activeSection === 'commission' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
            <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-4 flex items-center gap-2">
              <DollarSign size={15} className="text-[#ff8a65]" /> Commission Calculation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              <div className="p-4 bg-[#F4F6F8] rounded-xl border border-[#E5E7EB]">
                <p className="text-[10px] text-[#6B7280] uppercase tracking-wide font-semibold">Agreed Sale Price</p>
                <p className="text-xl font-heading font-bold text-[#1F2937] tabular-nums mt-1">₦{agreedPrice.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-[10px] text-[#6B7280] uppercase tracking-wide font-semibold">Carschek Commission ({deal.commissionRate}%)</p>
                <p className="text-xl font-heading font-bold text-[#D35400] tabular-nums mt-1">₦{commission.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="text-[10px] text-[#6B7280] uppercase tracking-wide font-semibold">Seller Payout</p>
                <p className="text-xl font-heading font-bold text-[#1A7A4A] tabular-nums mt-1">₦{sellerPayout.toLocaleString()}</p>
              </div>
            </div>

            {/* Invoice preview */}
            <div className="p-4 bg-[#F4F6F8] rounded-xl border border-[#E5E7EB] mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-[#1F2937]">Invoice Preview</h4>
                <span className="text-[10px] font-mono text-[#6B7280]">INV-{deal.id}</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-[#6B7280]">Vehicle</span><span className="font-semibold text-[#1F2937]">{deal.vehicle}</span></div>
                <div className="flex justify-between"><span className="text-[#6B7280]">Sale Price</span><span className="font-semibold text-[#1F2937] tabular-nums">₦{agreedPrice.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-[#6B7280]">Commission Rate</span><span className="font-semibold text-[#1F2937]">{deal.commissionRate}%</span></div>
                <div className="border-t border-[#E5E7EB] pt-2 flex justify-between"><span className="font-semibold text-[#1F2937]">Commission Due</span><span className="font-bold text-[#D35400] tabular-nums">₦{commission.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="font-semibold text-[#1F2937]">Seller Receives</span><span className="font-bold text-[#1A7A4A] tabular-nums">₦{sellerPayout.toLocaleString()}</span></div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => toast.info('Generating commission invoice PDF…')} className="px-4 py-2 bg-[#ff5722] text-white text-xs font-semibold rounded-lg hover:bg-[#e64a19] transition-all flex items-center gap-1.5">
                <FileText size={13} /> Download Invoice
              </button>
              <button onClick={() => toast.success('Payout initiated to seller')} className="px-4 py-2 bg-[#1A7A4A] text-white text-xs font-semibold rounded-lg hover:bg-[#155F3A] transition-all">
                Initiate Seller Payout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Escrow release modal */}
      {showEscrowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowEscrowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center"><Shield size={20} className="text-[#1A7A4A]" /></div>
              <h3 className="font-heading font-bold text-[#1F2937]">Release Escrow</h3>
            </div>
            <p className="text-sm text-[#6B7280] mb-2">You are about to release:</p>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
              <p className="text-lg font-bold text-[#1A7A4A] tabular-nums">₦{agreedPrice.toLocaleString()}</p>
              <p className="text-xs text-[#6B7280]">Ref: {deal.escrowRef}</p>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-5">
              <p className="text-xs text-amber-700 flex items-center gap-1.5"><AlertTriangle size={12} /> Buyer handover confirmation is required before releasing funds. This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowEscrowModal(false)} className="flex-1 py-2.5 border border-[#E5E7EB] text-sm font-semibold text-[#6B7280] rounded-lg hover:bg-[#F4F6F8]">Cancel</button>
              <button onClick={() => { setShowEscrowModal(false); toast.success('Escrow released — seller payout initiated'); }} className="flex-1 py-2.5 bg-[#1A7A4A] text-white text-sm font-semibold rounded-lg hover:bg-[#155F3A]">Release Funds</button>
            </div>
          </div>
        </div>
      )}

      {/* Refund modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowRefundModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            <h3 className="font-heading font-bold text-[#1F2937] mb-4">Process Refund</h3>
            <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">Reason for refund</label>
            <div className="relative mb-4">
              <select value={refundReason} onChange={e => setRefundReason(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20 focus:border-[#ff5722]">
                <option value="">Select reason…</option>
                <option>Buyer withdrew from deal</option>
                <option>Vehicle condition dispute</option>
                <option>Seller unable to complete sale</option>
                <option>Fraud suspected</option>
                <option>Other</option>
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowRefundModal(false)} className="flex-1 py-2.5 border border-[#E5E7EB] text-sm font-semibold text-[#6B7280] rounded-lg hover:bg-[#F4F6F8]">Cancel</button>
              <button onClick={() => { setShowRefundModal(false); toast.warning('Refund initiated — buyer will receive funds in 3–5 business days'); }} className="flex-1 py-2.5 bg-[#C0392B] text-white text-sm font-semibold rounded-lg hover:bg-[#A93226]">Process Refund</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
