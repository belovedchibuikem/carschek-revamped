'use client';
import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown, Eye, Edit2, Trash2, UserPlus } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { Order, OrderStatus } from './OrdersModule';

const SCORE_COLOR = (s: number | null) => {
  if (s === null) return 'text-[#6B7280]';
  if (s >= 71) return 'text-[#1A7A4A] font-bold';
  if (s >= 41) return 'text-[#D35400] font-bold';
  return 'text-[#C0392B] font-bold';
};

interface Props { orders: Order[]; onSelectOrder: (o: Order) => void; }

export default function OrdersListView({ orders, onSelectOrder }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const perPage = 8;

  const filtered = orders.filter(o => {
    const matchSearch = !search || [o.id, o.customer.name, o.vehicle.plate, o.vehicle.make, o.vehicle.model, o.customer.phone].some(v => v.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const toggleSelect = (id: string) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(s => s.length === paginated.length ? [] : paginated.map(o => o.id));

  const STATUS_OPTIONS: { value: OrderStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Statuses' },
    { value: 'new', label: 'New' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'reported', label: 'Reported' },
    { value: 'qa-review', label: 'QA Review' },
    { value: 'closed', label: 'Closed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, order #, plate, VIN…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] transition-all"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value as OrderStatus | 'all'); setPage(1); }}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 bg-white"
            >
              {STATUS_OPTIONS.map(o => <option key={`status-opt-${o.value}`} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
          </div>
          <div className="relative">
            <select className="appearance-none pl-3 pr-8 py-2 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 bg-white">
              <option>All Zones</option>
              <option>Lagos Island</option>
              <option>Lekki Phase 1</option>
              <option>Victoria Island</option>
              <option>Ikoyi</option>
              <option>Abuja Wuse</option>
              <option>Abuja Garki</option>
              <option>Port Harcourt GRA</option>
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#6B7280] hover:bg-[#F4F6F8] transition-colors">
            <Filter size={14} /> More Filters
          </button>
        </div>

        {/* Active filter chips */}
        {(search || statusFilter !== 'all') && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {search && (
              <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-[#2E75B6] border border-blue-200 px-2.5 py-1 rounded-full">
                Search: &quot;{search}&quot;
                <button onClick={() => setSearch('')}><X size={11} /></button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-[#2E75B6] border border-blue-200 px-2.5 py-1 rounded-full">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter('all')}><X size={11} /></button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bulk action bar */}
      {selected.length > 0 && (
        <div className="bg-[#1E3A5F] text-white rounded-xl p-3 flex items-center gap-4 animate-fade-in">
          <span className="text-sm font-semibold">{selected.length} order{selected.length > 1 ? 's' : ''} selected</span>
          <div className="flex gap-2 ml-auto">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg text-xs font-semibold transition-colors">
              <UserPlus size={13} /> Assign Inspector
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg text-xs font-semibold transition-colors">
              Export CSV
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/70 hover:bg-red-500/90 rounded-lg text-xs font-semibold transition-colors">
              <X size={13} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead>
              <tr className="bg-[#F4F6F8] text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] border-b border-[#E5E7EB]">
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={selected.length === paginated.length && paginated.length > 0} onChange={toggleAll} className="w-4 h-4 rounded" />
                </th>
                <th className="px-4 py-3 text-left">Order #</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Vehicle</th>
                <th className="px-4 py-3 text-left">Zone</th>
                <th className="px-4 py-3 text-left">Scheduled</th>
                <th className="px-4 py-3 text-left">Inspector</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Score</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F6F8]">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={32} className="text-[#E5E7EB]" />
                      <p className="text-sm font-semibold text-[#1F2937]">No orders found</p>
                      <p className="text-xs text-[#6B7280]">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : paginated.map(order => (
                <tr key={order.id} className="hover:bg-[#F4F6F8]/60 transition-colors group cursor-pointer" onClick={() => onSelectOrder(order)}>
                  <td className="px-4 py-3" onClick={e => { e.stopPropagation(); toggleSelect(order.id); }}>
                    <input type="checkbox" checked={selected.includes(order.id)} onChange={() => toggleSelect(order.id)} className="w-4 h-4 rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-[#1E3A5F]">{order.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#2E75B6] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                        {order.customer.avatar}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#1F2937]">{order.customer.name}</p>
                        <p className="text-[10px] text-[#6B7280] font-mono">{order.customer.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-semibold text-[#1F2937]">{order.vehicle.year} {order.vehicle.make} {order.vehicle.model}</p>
                    <p className="text-[10px] text-[#6B7280] font-mono">{order.vehicle.plate}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-[#1F2937] bg-[#F4F6F8] px-2 py-0.5 rounded-full">{order.zone}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-[#1F2937]">{order.scheduledAt}</p>
                  </td>
                  <td className="px-4 py-3">
                    {order.inspector ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-[#1A7A4A] flex items-center justify-center text-white text-[8px] font-bold">{order.inspectorAvatar}</div>
                        <span className="text-xs text-[#1F2937] truncate max-w-[100px]">{order.inspector}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-[#D35400] font-medium">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm tabular-nums ${SCORE_COLOR(order.score)}`}>
                      {order.score !== null ? order.score : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={e => { e.stopPropagation(); onSelectOrder(order); }} className="p-1.5 rounded-lg hover:bg-blue-50 text-[#2E75B6] transition-colors" title="View order">
                        <Eye size={14} />
                      </button>
                      <button onClick={e => e.stopPropagation()} className="p-1.5 rounded-lg hover:bg-amber-50 text-[#D35400] transition-colors" title="Edit order">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={e => e.stopPropagation()} className="p-1.5 rounded-lg hover:bg-red-50 text-[#C0392B] transition-colors" title="Cancel order">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E5E7EB]">
          <p className="text-xs text-[#6B7280]">
            Showing {Math.min((page - 1) * perPage + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)} of {filtered.length} orders
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 text-xs border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F4F6F8] disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={`page-${p}`}
                onClick={() => setPage(p)}
                className={`w-8 h-8 text-xs rounded-lg font-semibold transition-colors ${page === p ? 'bg-[#1E3A5F] text-white' : 'text-[#6B7280] hover:bg-[#F4F6F8]'}`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 text-xs border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F4F6F8] disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}