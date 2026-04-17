'use client';
import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Eye, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { ORDERS as ORDERS_SEED, STATUS_COLORS } from '@/lib/mockData';
import { toast } from 'sonner';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const TABS = ['All', 'New', 'Assigned', 'In Progress', 'Reported', 'QA Review', 'Closed'] as const;
type Tab = (typeof TABS)[number];

type OrderRow = (typeof ORDERS_SEED)[number];

const KANBAN_COLS = ['New', 'Assigned', 'In Progress', 'Reported', 'QA Review', 'Closed'] as const;

/** Dashboard KPI "Pending" — pipeline before report submission. */
const PIPELINE_PENDING_STATUSES: OrderRow['status'][] = ['New', 'Assigned', 'In Progress'];

function OrdersPageInner() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [orders, setOrders] = useState<OrderRow[]>(ORDERS_SEED);
  const [activeTab, setActiveTab] = useState<Tab>('All');
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [page, setPage] = useState(1);
  const perPage = 25;
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [pendingPipelineOnly, setPendingPipelineOnly] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    const statusRaw = searchParams.get('status')?.toLowerCase().trim() ?? '';
    const q = searchParams.get('q');

    if (statusRaw === 'in-progress' || statusRaw === 'in progress') {
      setActiveTab('In Progress');
      setPendingPipelineOnly(false);
    } else if (statusRaw === 'pending') {
      setActiveTab('All');
      setPendingPipelineOnly(true);
    } else {
      setPendingPipelineOnly(false);
      const next: Tab = tab && TABS.includes(tab as Tab) ? (tab as Tab) : 'All';
      setActiveTab(next);
    }
    if (q) setSearchInput(q);
  }, [searchParams]);

  const setTabInUrl = useCallback(
    (tab: Tab) => {
      setActiveTab(tab);
      setPendingPipelineOnly(false);
      setPage(1);
      const p = new URLSearchParams(searchParams.toString());
      p.delete('status');
      if (tab === 'All') p.delete('tab');
      else p.set('tab', tab);
      const qs = p.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    return orders.filter(o => {
      const matchSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.vehicle.toLowerCase().includes(q) ||
        o.plate?.toLowerCase().includes(q);
      const matchTab = activeTab === 'All' || o.status === activeTab;
      const matchPending = !pendingPipelineOnly || PIPELINE_PENDING_STATUSES.includes(o.status);
      return matchSearch && matchTab && matchPending;
    });
  }, [orders, debouncedSearch, activeTab, pendingPipelineOnly]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

  const tabCounts = useMemo(() => {
    const acc: Record<string, number> = {};
    TABS.forEach(tab => {
      acc[tab] = tab === 'All' ? orders.length : orders.filter(o => o.status === tab).length;
    });
    return acc;
  }, [orders]);

  const exportCsv = () => {
    const headers = ['Order ID', 'Customer', 'Vehicle', 'Plate', 'Inspector', 'Zone', 'Status', 'Scheduled'];
    const rows = filtered.map(o => [
      o.id,
      o.customerName,
      o.vehicle,
      o.plate || '',
      o.inspectorName || '',
      o.zone,
      o.status,
      o.scheduledAt,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carschek-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} order(s)`);
  };

  const moveOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: newStatus as OrderRow['status'] } : o)));
    toast.success(`Order ${orderId} → ${newStatus}`);
  };

  const onDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/order-id') || draggingId;
    setDraggingId(null);
    if (!id) return;
    moveOrderStatus(id, status);
  };

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#1F2937] dark:text-slate-100">Inspection Orders</h1>
            <p className="text-sm text-[#6B7280]">{orders.length} total orders</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#F4F6F8] dark:bg-slate-800 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 shadow-sm text-[#1F2937] dark:text-slate-100' : 'text-[#6B7280]'}`}
              >
                Table
              </button>
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'kanban' ? 'bg-white dark:bg-slate-700 shadow-sm text-[#1F2937] dark:text-slate-100' : 'text-[#6B7280]'}`}
              >
                Kanban
              </button>
            </div>
            <button
              type="button"
              onClick={exportCsv}
              className="flex items-center gap-2 px-3 py-2.5 border border-[#E5E7EB] dark:border-slate-700 rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F4F6F8] dark:hover:bg-slate-800 transition-colors"
            >
              <Download size={15} />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <Link
              href="/orders/new"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F] transition-all min-h-[44px]"
            >
              <Plus size={16} /> New Order
            </Link>
          </div>
        </div>

        <div className="flex gap-1 border-b border-[#E5E7EB] dark:border-slate-700 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setTabInUrl(tab)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${activeTab === tab ? 'border-[#1E3A5F] text-[#1E3A5F]' : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'}`}
            >
              {tab}
              {tabCounts[tab] > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab ? 'bg-[#1E3A5F] text-white' : 'bg-[#F4F6F8] text-[#6B7280]'}`}
                >
                  {tabCounts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            value={searchInput}
            onChange={e => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            placeholder="Search orders… (debounced 300ms)"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30"
          />
        </div>

        {viewMode === 'table' ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#E5E7EB] dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] dark:border-slate-700 bg-[#F9FAFB] dark:bg-slate-800/50">
                    {['Order ID', 'Customer', 'Vehicle', 'Inspector', 'Zone', 'Scheduled', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(order => (
                    <tr key={order.id} className="border-b border-[#F4F6F8] dark:border-slate-800 hover:bg-[#F9FAFB] dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/orders/${order.id}`} className="font-mono text-xs font-semibold text-[#2E75B6] hover:underline">
                          {order.id}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#1F2937] dark:text-slate-100">{order.customerName}</p>
                        <p className="text-xs text-[#6B7280]">{order.customerPhone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[#1F2937] dark:text-slate-100">{order.vehicle}</p>
                        <p className="text-xs font-mono text-[#6B7280]">{order.plate}</p>
                      </td>
                      <td className="px-4 py-3">
                        {order.inspectorName ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-[10px] font-bold">
                              {order.inspectorName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-xs text-[#1F2937] dark:text-slate-100">{order.inspectorName.split(' ')[0]}</span>
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
                        <Link href={`/orders/${order.id}`} className="w-8 h-8 inline-flex items-center justify-center rounded-lg hover:bg-[#F4F6F8] dark:hover:bg-slate-800 transition-colors">
                          <Eye size={15} className="text-[#6B7280]" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-16 text-center text-[#6B7280]">
                        <p className="font-medium">No orders found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-[#E5E7EB] dark:border-slate-700 flex items-center justify-between">
                <p className="text-xs text-[#6B7280]">
                  Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F4F6F8] disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F4F6F8] disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <p className="text-xs text-[#6B7280] mb-2">Drag a card to another column to update status (mock API).</p>
            <div className="flex gap-4 min-w-max">
              {KANBAN_COLS.map(col => {
                const colOrders = orders.filter(o => o.status === col);
                return (
                  <div
                    key={col}
                    className="w-64 flex-shrink-0 rounded-xl border-2 border-dashed border-transparent p-1 min-h-[200px]"
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => onDrop(e, col)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{col}</span>
                      <span className="text-xs bg-[#F4F6F8] dark:bg-slate-800 text-[#6B7280] px-2 py-0.5 rounded-full font-semibold">{colOrders.length}</span>
                    </div>
                    <div className="space-y-3">
                      {colOrders.map(order => (
                        <div
                          key={order.id}
                          draggable
                          onDragStart={e => {
                            e.dataTransfer.setData('text/order-id', order.id);
                            e.dataTransfer.effectAllowed = 'move';
                            setDraggingId(order.id);
                          }}
                          onDragEnd={() => setDraggingId(null)}
                        >
                          <Link
                            href={`/orders/${order.id}`}
                            className="block bg-white dark:bg-slate-900 rounded-xl border border-[#E5E7EB] dark:border-slate-700 p-4 hover:shadow-md transition-all hover:border-[#2E75B6]/30 cursor-grab active:cursor-grabbing"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-mono text-xs font-semibold text-[#2E75B6]">{order.id}</span>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                            </div>
                            <p className="text-sm font-medium text-[#1F2937] dark:text-slate-100 mb-1">{order.customerName}</p>
                            <p className="text-xs text-[#6B7280]">{order.vehicle}</p>
                            <p className="text-xs text-[#9CA3AF] mt-2">{order.zone}</p>
                          </Link>
                        </div>
                      ))}
                      {colOrders.length === 0 && (
                        <div className="bg-[#F9FAFB] dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-[#E5E7EB] dark:border-slate-700 p-6 text-center text-xs text-[#9CA3AF]">Drop here</div>
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

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <AppLayout currentPath="/orders">
          <div className="min-h-[40vh] flex items-center justify-center text-sm text-[#6B7280]">Loading orders…</div>
        </AppLayout>
      }
    >
      <OrdersPageInner />
    </Suspense>
  );
}
