'use client';
import React, { useState } from 'react';
import { X, MapPin, Phone, Mail, Car, Clock, CheckCircle, UserPlus } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { Order } from './OrdersModule';
import { toast } from 'sonner';

const TIMELINE = [
  { id: 'tl-1', status: 'new', label: 'Order Created', time: '09 Apr 2026, 14:32', actor: 'System', note: 'Booking received via web portal', done: true },
  { id: 'tl-2', status: 'assigned', label: 'Inspector Assigned', time: '09 Apr 2026, 15:10', actor: 'Promise Ndem', note: 'Assigned to Emeka Okonkwo', done: true },
  { id: 'tl-3', status: 'in-progress', label: 'Inspection Started', time: '10 Apr 2026, 10:04', actor: 'Emeka Okonkwo', note: 'Inspector checked in at location', done: true },
  { id: 'tl-4', status: 'reported', label: 'Report Submitted', time: '—', actor: '—', note: 'Awaiting inspector submission', done: false },
  { id: 'tl-5', status: 'qa-review', label: 'QA Review', time: '—', actor: '—', note: 'Pending report submission', done: false },
  { id: 'tl-6', status: 'closed', label: 'Closed', time: '—', actor: '—', note: 'Pending QA approval', done: false },
];

interface Props { order: Order; onClose: () => void; }

export default function OrderDetailPanel({ order, onClose }: Props) {
  const [showAssignModal, setShowAssignModal] = useState(false);

  const INSPECTORS_AVAILABLE = [
    { id: 'insp-001', name: 'Emeka Okonkwo', avatar: 'EO', zone: 'Lagos Island/Lekki', rating: 4.9, status: 'available' as const },
    { id: 'insp-003', name: 'Chukwudi Eze', avatar: 'CE', zone: 'Abuja', rating: 4.7, status: 'available' as const },
    { id: 'insp-007', name: 'Ibrahim Musa', avatar: 'IM', zone: 'Abuja Suburbs', rating: 4.3, status: 'available' as const },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-3xl bg-white h-full overflow-y-auto animate-slide-in-right shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-[#ff5722]">{order.id}</span>
            <StatusBadge status={order.status} />
            <span className="text-xs text-[#6B7280]">Created {order.createdAt}</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F4F6F8] transition-colors">
            <X size={18} className="text-[#6B7280]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
            {/* Left: Timeline */}
            <div className="lg:col-span-3 p-6 border-r border-[#E5E7EB]">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-5">Order Timeline</h3>
              <div className="space-y-0">
                {TIMELINE.map((step, idx) => (
                  <div key={step.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${step.done ? 'bg-[#1A7A4A] border-[#1A7A4A]' : idx === TIMELINE.findIndex(s => !s.done) ? 'bg-white border-[#ff8a65] animate-pulse-ring' : 'bg-white border-[#E5E7EB]'}`}>
                        {step.done ? <CheckCircle size={14} className="text-white" /> : <div className={`w-2 h-2 rounded-full ${idx === TIMELINE.findIndex(s => !s.done) ? 'bg-[#ff8a65]' : 'bg-[#E5E7EB]'}`} />}
                      </div>
                      {idx < TIMELINE.length - 1 && (
                        <div className={`w-0.5 h-10 ${step.done ? 'bg-[#1A7A4A]' : 'bg-[#E5E7EB]'}`} />
                      )}
                    </div>
                    <div className="pb-6 flex-1">
                      <p className={`text-sm font-semibold ${step.done ? 'text-[#1F2937]' : 'text-[#6B7280]'}`}>{step.label}</p>
                      <p className="text-[10px] text-[#6B7280] mt-0.5">{step.time} · {step.actor}</p>
                      <p className="text-xs text-[#6B7280] mt-1 italic">{step.note}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Inspector Assignment */}
              <div className="mt-2 p-4 bg-[#F4F6F8] rounded-xl border border-[#E5E7EB]">
                <h4 className="text-xs font-semibold text-[#1F2937] mb-3">Inspector Assignment</h4>
                {order.inspector ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1A7A4A] flex items-center justify-center text-white font-bold text-sm">{order.inspectorAvatar}</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#1F2937]">{order.inspector}</p>
                      <p className="text-xs text-[#6B7280]">{order.zone}</p>
                    </div>
                    <button
                      onClick={() => setShowAssignModal(true)}
                      className="text-xs font-semibold text-[#ff8a65] hover:text-[#ff5722] px-3 py-1.5 border border-[#ff8a65]/30 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Reassign
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-[#ff8a65]/40 rounded-lg text-sm font-semibold text-[#ff8a65] hover:bg-blue-50 transition-colors"
                  >
                    <UserPlus size={16} /> Assign Inspector
                  </button>
                )}
              </div>
            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-2 p-6 space-y-5">
              {/* Customer */}
              <div>
                <h4 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Customer</h4>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#ff8a65] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{order.customer.avatar}</div>
                  <div>
                    <p className="text-sm font-semibold text-[#1F2937]">{order.customer.name}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-[#6B7280]">
                      <Phone size={11} /> {order.customer.phone}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-[#6B7280]">
                      <Mail size={11} /> {order.customer.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle */}
              <div>
                <h4 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Vehicle</h4>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Car size={14} className="text-[#6B7280]" />
                    <span className="text-sm font-semibold text-[#1F2937]">{order.vehicle.year} {order.vehicle.make} {order.vehicle.model}</span>
                  </div>
                  {[
                    { label: 'Plate', value: order.vehicle.plate },
                    { label: 'Colour', value: order.vehicle.color },
                    { label: 'VIN', value: order.vehicle.vin },
                  ].map(item => (
                    <div key={`veh-${item.label}`} className="flex items-center justify-between text-xs">
                      <span className="text-[#6B7280]">{item.label}</span>
                      <span className="font-mono font-semibold text-[#1F2937]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <h4 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Location & Schedule</h4>
                <div className="flex items-start gap-2 text-xs text-[#1F2937]">
                  <MapPin size={13} className="text-[#C0392B] mt-0.5 flex-shrink-0" />
                  <span>{order.zone}, Lagos</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-[#1F2937]">
                  <Clock size={13} className="text-[#ff8a65]" />
                  <span>{order.scheduledAt}</span>
                </div>
              </div>

              {/* Score */}
              {order.score !== null && (
                <div className="p-3 bg-[#F4F6F8] rounded-xl border border-[#E5E7EB]">
                  <p className="text-xs font-semibold text-[#6B7280] mb-1">Carschek Score</p>
                  <p className={`text-3xl font-heading font-bold tabular-nums ${order.score >= 71 ? 'text-[#1A7A4A]' : order.score >= 41 ? 'text-[#D35400]' : 'text-[#C0392B]'}`}>
                    {order.score}<span className="text-base text-[#6B7280] font-normal">/100</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky action bar */}
        <div className="sticky bottom-0 bg-white border-t border-[#E5E7EB] px-6 py-4 flex gap-3 flex-wrap">
          {order.status === 'assigned' && (
            <button onClick={() => toast.success('Order marked as In Progress')} className="flex-1 py-2 bg-[#D35400] text-white text-sm font-semibold rounded-lg hover:bg-[#B84600] transition-all">
              Mark In Progress
            </button>
          )}
          {order.status === 'reported' && (
            <button onClick={() => toast.success('Report approved — sending to customer')} className="flex-1 py-2 bg-[#1A7A4A] text-white text-sm font-semibold rounded-lg hover:bg-[#155F3A] transition-all">
              Approve Report
            </button>
          )}
          {order.status === 'qa-review' && (
            <button onClick={() => toast.success('Report approved and delivered')} className="flex-1 py-2 bg-[#1A7A4A] text-white text-sm font-semibold rounded-lg hover:bg-[#155F3A] transition-all">
              Approve & Send
            </button>
          )}
          <button onClick={() => toast.info('Notification resent to customer')} className="px-4 py-2 border border-[#E5E7EB] text-sm font-semibold text-[#6B7280] rounded-lg hover:bg-[#F4F6F8] transition-colors">
            Resend Notification
          </button>
        </div>
      </div>

      {/* Assign Inspector Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAssignModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <h3 className="font-heading font-semibold text-[#1F2937]">Assign Inspector</h3>
              <button onClick={() => setShowAssignModal(false)}><X size={18} className="text-[#6B7280]" /></button>
            </div>
            <div className="p-4">
              <div className="relative mb-4">
                <input type="text" placeholder="Search inspectors…" className="w-full pl-9 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20 focus:border-[#ff5722]" />
              </div>
              <div className="space-y-2">
                {INSPECTORS_AVAILABLE.map(insp => (
                  <button
                    key={insp.id}
                    onClick={() => { setShowAssignModal(false); toast.success(`${insp.name} assigned to ${order.id}`); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#E5E7EB] hover:border-[#ff8a65] hover:bg-blue-50/30 transition-all text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#ff5722] flex items-center justify-center text-white text-xs font-bold">{insp.avatar}</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#1F2937]">{insp.name}</p>
                      <p className="text-[10px] text-[#6B7280]">{insp.zone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#1A7A4A]">★ {insp.rating}</p>
                      <span className="text-[9px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">Available</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}