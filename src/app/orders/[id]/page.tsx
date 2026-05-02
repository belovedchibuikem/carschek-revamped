'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, MapPin, Clock, CheckCircle, MessageSquare } from 'lucide-react';
import { ORDERS, STATUS_COLORS } from '@/lib/mockData';
import { toast } from 'sonner';
import LiveInspectionPanel from '@/components/orders/LiveInspectionPanel';
import { openPrintableReport } from '@/lib/print';

const TIMELINE_EVENTS = [
  { status: 'New', time: '2026-04-12 14:30', actor: 'System', note: 'Order created via web booking' },
  { status: 'Assigned', time: '2026-04-13 08:05', actor: 'Chukwuemeka Obi', note: 'Assigned to Emeka Okonkwo' },
  { status: 'In Progress', time: '2026-04-13 10:15', actor: 'Emeka Okonkwo', note: 'Inspector arrived at location' },
  { status: 'Reported', time: '2026-04-13 12:30', actor: 'Emeka Okonkwo', note: 'Inspection completed, report submitted' },
  { status: 'QA Review', time: '2026-04-13 12:35', actor: 'System', note: 'Report sent to QA queue' },
];

type OrderActionButton = { type: 'button'; label: string; color: string; action: () => void };
type OrderActionLink = { type: 'link'; label: string; color: string; href: string };
type OrderAction = OrderActionButton | OrderActionLink;

export default function OrderDetailPage() {
  const pathname = usePathname();
  const params = useParams();
  const orderId = params.id as string;
  const order = ORDERS.find(o => o.id === orderId) || ORDERS[0];
  const [reassignModal, setReassignModal] = useState(false);

  const getActions = (): OrderAction[] => {
    switch (order.status) {
      case 'New': return [
        { type: 'button', label: 'Assign Inspector', color: 'bg-[#ff5722]', action: () => setReassignModal(true) },
        { type: 'button', label: 'Cancel Order', color: 'bg-[#C0392B]', action: () => toast.success('Order cancelled') },
      ];
      case 'Assigned': return [
        { type: 'button', label: 'Mark En Route', color: 'bg-[#D35400]', action: () => toast.success('Status updated to En Route') },
        { type: 'button', label: 'Cancel Order', color: 'bg-[#C0392B]', action: () => toast.success('Order cancelled') },
      ];
      case 'In Progress': return [
        { type: 'button', label: 'Message inspector', color: 'bg-[#ff8a65]', action: () => toast.success('Use the live panel above to message the inspector') },
      ];
      case 'Reported': return [
        {
          type: 'link',
          label: 'Review Report',
          color: 'bg-[#ff5722]',
          href: order.reportId ? `/reports/${order.reportId}/review` : '/reports',
        },
      ];
      case 'QA Review': return [
        { type: 'button', label: 'Approve Report', color: 'bg-[#1A7A4A]', action: () => toast.success('Report approved') },
        { type: 'button', label: 'Request Corrections', color: 'bg-[#D35400]', action: () => toast.success('Corrections requested') },
      ];
      case 'Closed': return [
        {
          type: 'button',
          label: 'Download Report PDF',
          color: 'bg-[#ff5722]',
          action: () =>
            openPrintableReport({
              title: `Order ${order.id} — report`,
              subtitle: order.vehicle,
              bodyHtml: `<p><strong>Status:</strong> ${order.status}</p><p><strong>Zone:</strong> ${order.zone}</p><p>Print or save as PDF from the browser dialog.</p>`,
            }),
        },
        { type: 'button', label: 'Resend to Customer', color: 'bg-[#ff8a65]', action: () => toast.success('Report resent to customer') },
      ];
      default: return [];
    }
  };

  return (
    <AppLayout currentPath={pathname}>
      {reassignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setReassignModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-fade-in">
            <h3 className="text-base font-heading font-semibold text-[#1F2937] mb-4">Assign Inspector</h3>
            <div className="space-y-2 mb-5">
              {['Emeka Okonkwo', 'Chidinma Eze', 'Ngozi Obi'].map(name => (
                <button key={name} onClick={() => { toast.success(`Inspector ${name} assigned`); setReassignModal(false); }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-[#E5E7EB] hover:border-[#ff8a65] hover:bg-blue-50 transition-all text-left">
                  <div className="w-8 h-8 rounded-full bg-[#ff5722] flex items-center justify-center text-white text-xs font-bold">
                    {name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1F2937]">{name}</p>
                    <p className="text-xs text-[#1A7A4A]">● Available</p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setReassignModal(false)} className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium hover:bg-[#F4F6F8]">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/orders" className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E7EB] hover:bg-[#F4F6F8] transition-colors">
            <ArrowLeft size={16} className="text-[#6B7280]" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-heading font-bold text-[#1F2937]">{order.id}</h1>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>{order.status}</span>
            </div>
            <p className="text-sm text-[#6B7280]">{order.vehicle} · {order.zone}</p>
          </div>
        </div>

        {order.status === 'In Progress' && (
          <div className="max-w-3xl">
            <LiveInspectionPanel orderId={order.id} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E7EB] p-5">
            <h2 className="text-base font-heading font-semibold text-[#1F2937] mb-5">Order Timeline</h2>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#E5E7EB]" />
              <div className="space-y-6">
                {TIMELINE_EVENTS.map((event, i) => (
                  <div key={i} className="relative flex gap-4 pl-10">
                    <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${i === TIMELINE_EVENTS.length - 1 ? 'bg-[#ff5722]' : 'bg-[#F4F6F8] border-2 border-[#E5E7EB]'}`}>
                      {i === TIMELINE_EVENTS.length - 1 ? (
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      ) : (
                        <CheckCircle size={14} className="text-[#1A7A4A]" />
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[event.status]}`}>{event.status}</span>
                        <span className="text-xs text-[#9CA3AF]">{event.time}</span>
                      </div>
                      <p className="text-sm text-[#1F2937] mt-1">{event.note}</p>
                      <p className="text-xs text-[#6B7280] mt-0.5">by {event.actor}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            {/* Order summary */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h2 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User size={15} className="text-[#6B7280] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[#6B7280]">Customer</p>
                    <p className="text-sm font-medium text-[#1F2937]">{order.customerName}</p>
                    <p className="text-xs text-[#6B7280]">{order.customerPhone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={15} className="text-[#6B7280] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[#6B7280]">Zone</p>
                    <p className="text-sm font-medium text-[#1F2937]">{order.zone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={15} className="text-[#6B7280] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[#6B7280]">Scheduled</p>
                    <p className="text-sm font-medium text-[#1F2937]">
                      {new Date(order.scheduledAt).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      {new Date(order.scheduledAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                {order.notes && (
                  <div className="flex items-start gap-3">
                    <MessageSquare size={15} className="text-[#6B7280] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-[#6B7280]">Notes</p>
                      <p className="text-sm text-[#1F2937]">{order.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Inspector card */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-heading font-semibold text-[#1F2937]">Inspector</h2>
                <button onClick={() => setReassignModal(true)} className="text-xs text-[#ff8a65] hover:underline">Reassign</button>
              </div>
              {order.inspectorName ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#ff5722] flex items-center justify-center text-white text-sm font-bold">
                    {order.inspectorName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1F2937]">{order.inspectorName}</p>
                    <p className="text-xs text-[#1A7A4A]">● Online</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-[#6B7280] mb-3">No inspector assigned</p>
                  <button onClick={() => setReassignModal(true)} className="px-4 py-2 bg-[#ff5722] text-white text-xs font-semibold rounded-lg hover:bg-[#e64a19] transition-all">
                    Assign Inspector
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h2 className="text-sm font-heading font-semibold text-[#1F2937] mb-3">Actions</h2>
              <div className="space-y-2">
                {getActions().map(action =>
                  action.type === 'link' ? (
                    <Link key={action.label} href={action.href}
                      className={`block w-full text-center py-2.5 ${action.color} text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-all`}>
                      {action.label}
                    </Link>
                  ) : (
                    <button key={action.label} type="button" onClick={action.action}
                      className={`w-full py-2.5 ${action.color} text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-all`}>
                      {action.label}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
