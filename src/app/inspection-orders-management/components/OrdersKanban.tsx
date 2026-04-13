'use client';
import React, { useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { Order, OrderStatus } from './OrdersModule';

const COLUMNS: { status: OrderStatus; label: string; color: string }[] = [
  { status: 'new', label: 'New', color: 'border-t-blue-500' },
  { status: 'assigned', label: 'Assigned', color: 'border-t-purple-500' },
  { status: 'in-progress', label: 'In Progress', color: 'border-t-amber-500' },
  { status: 'reported', label: 'Reported', color: 'border-t-teal-500' },
  { status: 'qa-review', label: 'QA Review', color: 'border-t-orange-500' },
  { status: 'closed', label: 'Closed', color: 'border-t-green-600' },
];

function urgencyClass(scheduledAt: string): string {
  const scheduled = new Date(scheduledAt.replace(',', ''));
  const now = new Date('2026-04-10T22:00:00');
  const diff = (scheduled.getTime() - now.getTime()) / 60000;
  if (diff < 0) return 'border-l-4 border-l-[#C0392B] bg-red-50/40';
  if (diff < 60) return 'border-l-4 border-l-[#D35400] bg-amber-50/40';
  return 'border-l-4 border-l-[#1A7A4A]';
}

interface Props { orders: Order[]; onSelectOrder: (o: Order) => void; }

export default function OrdersKanban({ orders, onSelectOrder }: Props) {
  const [dragOver, setDragOver] = useState<OrderStatus | null>(null);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
      {COLUMNS.map(col => {
        const colOrders = orders.filter(o => o.status === col.status);
        return (
          <div
            key={`kanban-col-${col.status}`}
            className={`flex-shrink-0 w-64 bg-[#F4F6F8] rounded-xl border-t-4 ${col.color} ${dragOver === col.status ? 'ring-2 ring-[#2E75B6]' : ''} transition-all`}
            onDragOver={e => { e.preventDefault(); setDragOver(col.status); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={() => setDragOver(null)}
          >
            <div className="px-4 py-3 border-b border-[#E5E7EB]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1F2937]">{col.label}</span>
                <span className="text-[10px] font-semibold bg-white border border-[#E5E7EB] text-[#6B7280] px-2 py-0.5 rounded-full">
                  {colOrders.length}
                </span>
              </div>
            </div>
            <div className="p-3 space-y-2 min-h-[200px]">
              {colOrders.map(order => (
                <div
                  key={order.id}
                  draggable
                  onClick={() => onSelectOrder(order)}
                  className={`bg-white rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition-all ${urgencyClass(order.scheduledAt)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-mono text-[10px] font-bold text-[#1E3A5F]">{order.id}</span>
                    {order.score !== null && (
                      <span className={`text-[10px] font-bold tabular-nums ${order.score >= 71 ? 'text-[#1A7A4A]' : order.score >= 41 ? 'text-[#D35400]' : 'text-[#C0392B]'}`}>
                        {order.score}pts
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-[#1F2937] truncate">{order.customer.name}</p>
                  <p className="text-[10px] text-[#6B7280] truncate">{order.vehicle.year} {order.vehicle.make} {order.vehicle.model}</p>
                  <div className="flex items-center justify-between mt-2">
                    {order.inspectorAvatar ? (
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded-full bg-[#1A7A4A] flex items-center justify-center text-white text-[7px] font-bold">{order.inspectorAvatar}</div>
                        <span className="text-[9px] text-[#6B7280] truncate max-w-[80px]">{order.inspector}</span>
                      </div>
                    ) : (
                      <span className="text-[9px] text-[#D35400] font-medium flex items-center gap-0.5">
                        <AlertTriangle size={9} /> Unassigned
                      </span>
                    )}
                    <div className="flex items-center gap-0.5 text-[9px] text-[#6B7280]">
                      <Clock size={9} />
                      <span>2h 15m</span>
                    </div>
                  </div>
                </div>
              ))}
              {colOrders.length === 0 && (
                <div className="flex items-center justify-center h-20 text-[10px] text-[#6B7280] border-2 border-dashed border-[#E5E7EB] rounded-lg">
                  Drop orders here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}