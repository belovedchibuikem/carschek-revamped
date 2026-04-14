'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Eye, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { ORDERS, STATUS_COLORS } from '@/lib/mockData';
import { toast } from 'sonner';

const TABS = ['All', 'New', 'Assigned', 'In Progress', 'Reported', 'QA Review', 'Closed'];

export default function OrdersPage() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [page, setPage] = useState(1);
  const perPage = 25;

  const filtered = ORDERS.filter(o => {
    const q = search.toLowerCase();
    const matchSearch = !q || o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.vehicle.toLowerCase().includes(q);
    const matchTab = activeTab === 'All' || o.status === activeTab;
    return matchSearch && matchTab;
  });

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const tabCounts = TABS.reduce((acc, tab) => {
    acc[tab] = tab === 'All' ? ORDERS.length : ORDERS.filter(o => o.status === tab).length;
    return acc;
  }, {} as Record<string, number>);

  const KANBAN_COLS = ['New', 'Assigned', 'In Progress', 'Reported', 'QA Review', 'Closed'];

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Inspection Orders</h1>
            <p className="text-sm text-[#6B7280]">{ORDERS.length} total orders</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#F4F6F8] rounded-lg p-1">
              <button onClick={() => setViewMode('table')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-[#1F2937]' : 'text-[#6B7280]'}`}>Table</button>
              <button onClick={() => setViewMode('kanban')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-[#1F2937]' : 'text-[#6B7280]'}`}>Kanban</button>
            </div>
            <button onClick={() => toast.success('CSV exported')} className="flex items-center gap-2 px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F4F6F8] transition-colors">
              <Download size={15} />
            </button>
            <Link href="/orders/new" className="flex items-center gap-2 px-4 py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F] transition-all min-h-[44px]">
              <Plus size={16} /> New Order
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[#E5E7EB] overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); setPage(1); }}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${activeTab === tab ? 'border-[#1E3A5F] text-[#1E3A5F]' : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'}`}>
              {tab}
              {tabCounts[tab] > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab ? 'bg-[#1E3A5F] text-white' : 'bg-[#F4F6F8] text-[#6B7280]'}`}>
                  {tabCounts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search orders…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30" />
        </div>

        {viewMode === 'table' ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                    {['Order ID', 'Customer', 'Vehicle', 'Inspector', 'Zone', 'Scheduled', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(order => (
                    <tr key={order.id} className="border-b border-[#F4F6F8] hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/orders/${order.id}`} className="font-mono text-xs font-semibold text-[#2E75B6] hover:underline">{order.id}</Link>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#1F2937]">{order.customerName}</p>
                        <p className="text-xs text-[#6B7280]">{order.customerPhone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[#1F2937]">{order.vehicle}</p>
                        <p className="text-xs font-mono text-[#6B7280]">{order.plate}</p>
                      </td>
                      <td className="px-4 py-3">
                        {order.inspectorName ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-[10px] font-bold">
                              {order.inspectorName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-xs text-[#1F2937]">{order.inspectorName.split(' ')[0]}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-[#9CA3AF]">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#6B7280]">{order.zone}</td>
                      <td className="px-4 py-3 text-xs text-[#6B7280] whitespace-nowrap">
                        {new Date(order.scheduledAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                        <br />
                        {new Date(order.scheduledAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/orders/${order.id}`} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F4F6F8] transition-colors">
                          <Eye size={15} className="text-[#6B7280]" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr><td colSpan={8} className="px-4 py-16 text-center text-[#6B7280]">
                      <p className="font-medium">No orders found</p>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-[#E5E7EB] flex items-center justify-between">
                <p className="text-xs text-[#6B7280]">Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F4F6F8] disabled:opacity-40"><ChevronLeft size={16} /></button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F4F6F8] disabled:opacity-40"><ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {KANBAN_COLS.map(col => {
                const colOrders = ORDERS.filter(o => o.status === col);
                return (
                  <div key={col} className="w-64 flex-shrink-0">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{col}</span>
                      <span className="text-xs bg-[#F4F6F8] text-[#6B7280] px-2 py-0.5 rounded-full font-semibold">{colOrders.length}</span>
                    </div>
                    <div className="space-y-3">
                      {colOrders.map(order => (
                        <Link key={order.id} href={`/orders/${order.id}`}
                          className="block bg-white rounded-xl border border-[#E5E7EB] p-4 hover:shadow-md transition-all hover:border-[#2E75B6]/30">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-xs font-semibold text-[#2E75B6]">{order.id}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                          </div>
                          <p className="text-sm font-medium text-[#1F2937] mb-1">{order.customerName}</p>
                          <p className="text-xs text-[#6B7280]">{order.vehicle}</p>
                          <p className="text-xs text-[#9CA3AF] mt-2">{order.zone}</p>
                        </Link>
                      ))}
                      {colOrders.length === 0 && (
                        <div className="bg-[#F9FAFB] rounded-xl border-2 border-dashed border-[#E5E7EB] p-6 text-center text-xs text-[#9CA3AF]">
                          No orders
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
