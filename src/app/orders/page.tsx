'use client';
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Eye, ChevronLeft, ChevronRight, Download, CheckSquare, Square } from 'lucide-react';
import { ORDERS as ORDERS_SEED, INSPECTORS, STATUS_COLORS } from '@/lib/mockData';
import { toast } from 'sonner';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useTableHotkeys } from '@/hooks/useTableHotkeys';
import { FilterPresetBar } from '@/components/shared/FilterPresetBar';
import { InlineSelectCell } from '@/components/shared/InlineEdit';

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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const lastWrittenQ = useRef<string | null>(null);

  useEffect(() => {
    const tab = searchParams.get('tab');
    const statusRaw = searchParams.get('status')?.toLowerCase().trim() ?? '';
    const q = searchParams.get('q') ?? '';

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
    // Skip q sync when we wrote it ourselves (prevents clobbering fast typing)
    if (q !== lastWrittenQ.current) setSearchInput(q);
    lastWrittenQ.current = q;
  }, [searchParams]);

  // Keep ?q= in the URL so filtered views are shareable
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const current = p.get('q') ?? '';
    if (current === debouncedSearch) return;
    if (debouncedSearch) p.set('q', debouncedSearch);
    else p.delete('q');
    lastWrittenQ.current = debouncedSearch;
    const qs = p.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [debouncedSearch, pathname, router]);

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

  const presetParams = useMemo(
    () => ({
      tab: activeTab === 'All' ? '' : activeTab,
      status: pendingPipelineOnly ? 'pending' : '',
      q: debouncedSearch,
    }),
    [activeTab, pendingPipelineOnly, debouncedSearch]
  );

  const applyPreset = useCallback(
    (params: Record<string, string>) => {
      const p = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) {
        if (v) p.set(k, v);
      }
      lastWrittenQ.current = null; // force q re-sync from URL
      setPage(1);
      const qs = p.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router]
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

  // ── Inline edits (optimistic, with undo) ────────────────────────────────

  const updateOrderInline = useCallback((id: string, label: string, mutate: (o: OrderRow) => OrderRow) => {
    setOrders(prev => {
      const before = prev.find(o => o.id === id);
      if (!before) return prev;
      toast.success(`${id}: ${label}`, {
        duration: 10_000,
        action: {
          label: 'Undo',
          onClick: () => {
            setOrders(cur => cur.map(o => (o.id === id ? before : o)));
            toast.message('Reverted');
          },
        },
      });
      return prev.map(o => (o.id === id ? mutate(o) : o));
    });
  }, []);

  const inlineAssignInspector = (orderId: string, inspectorId: string) => {
    if (!inspectorId) {
      updateOrderInline(orderId, 'Inspector unassigned', o => ({ ...o, inspectorId: '', inspectorName: '' }));
      return;
    }
    const inspector = INSPECTORS.find(i => i.id === inspectorId);
    if (!inspector) return;
    updateOrderInline(orderId, `Assigned to ${inspector.name}`, o => ({
      ...o,
      inspectorId: inspector.id,
      inspectorName: inspector.name,
      status: o.status === 'New' ? ('Assigned' as OrderRow['status']) : o.status,
    }));
  };

  // ── Bulk actions (30s undo window) ──────────────────────────────────────

  const toggleSelect = (id: string) =>
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));

  const toggleAllOnPage = () =>
    setSelectedIds(prev =>
      paginated.every(o => prev.includes(o.id))
        ? prev.filter(id => !paginated.some(o => o.id === id))
        : [...new Set([...prev, ...paginated.map(o => o.id)])]
    );

  const applyBulkWithUndo = useCallback(
    (label: string, mutate: (o: OrderRow) => OrderRow) => {
      const ids = [...selectedIds];
      if (ids.length === 0) return;
      setOrders(prev => {
        const snapshot = prev.filter(o => ids.includes(o.id));
        toast.success(`${label} — ${ids.length} order(s)`, {
          duration: 30_000,
          action: {
            label: 'Undo',
            onClick: () => {
              setOrders(cur => cur.map(o => snapshot.find(s => s.id === o.id) ?? o));
              toast.message('Reverted');
            },
          },
        });
        return prev.map(o => (ids.includes(o.id) ? mutate(o) : o));
      });
      setSelectedIds([]);
    },
    [selectedIds]
  );

  const bulkAssignInspector = (inspectorId: string) => {
    const inspector = INSPECTORS.find(i => i.id === inspectorId);
    if (!inspector) return;
    applyBulkWithUndo(`Assigned to ${inspector.name}`, o => ({
      ...o,
      inspectorId: inspector.id,
      inspectorName: inspector.name,
      status: o.status === 'New' ? ('Assigned' as OrderRow['status']) : o.status,
    }));
  };

  const bulkChangeStatus = (status: string) => {
    applyBulkWithUndo(`Status → ${status}`, o => ({ ...o, status: status as OrderRow['status'] }));
  };

  const exportSelectionCsv = () => {
    const rows = orders.filter(o => selectedIds.includes(o.id));
    const headers = ['Order ID', 'Customer', 'Vehicle', 'Plate', 'Inspector', 'Zone', 'Status', 'Scheduled'];
    const body = rows.map(o => [o.id, o.customerName, o.vehicle, o.plate || '', o.inspectorName || '', o.zone, o.status, o.scheduledAt]);
    const csv = [headers, ...body].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carschek-orders-selection-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} selected order(s)`);
    setSelectedIds([]);
  };

  // ── Keyboard navigation (j/k move, Enter open) ──────────────────────────
  const { activeIndex } = useTableHotkeys({
    rowCount: paginated.length,
    enabled: viewMode === 'table',
    onOpen: i => {
      const order = paginated[i];
      if (order) router.push(`/orders/${order.id}`);
    },
  });

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
              className="flex items-center gap-2 px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19] transition-all min-h-[44px]"
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
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${activeTab === tab ? 'border-[#ff5722] text-[#ff5722]' : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'}`}
            >
              {tab}
              {tabCounts[tab] > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab ? 'bg-[#ff5722] text-white' : 'bg-[#F4F6F8] text-[#6B7280]'}`}
                >
                  {tabCounts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative max-w-sm flex-1 min-w-[220px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={searchInput}
              onChange={e => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
              placeholder="Search orders… (debounced 300ms)"
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
            />
          </div>
          <FilterPresetBar pageKey="orders" currentParams={presetParams} onApply={applyPreset} />
        </div>

        {viewMode === 'table' && selectedIds.length > 0 && (
          <div className="bg-[#ff5722] text-white rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 animate-fade-in">
            <span className="text-sm font-medium">{selectedIds.length} selected</span>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              <select
                value=""
                onChange={e => e.target.value && bulkAssignInspector(e.target.value)}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium text-white border-0 focus:outline-none focus:ring-2 focus:ring-white/40 [&>option]:text-[#1F2937]"
              >
                <option value="">Assign inspector…</option>
                {INSPECTORS.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
              <select
                value=""
                onChange={e => e.target.value && bulkChangeStatus(e.target.value)}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium text-white border-0 focus:outline-none focus:ring-2 focus:ring-white/40 [&>option]:text-[#1F2937]"
              >
                <option value="">Change status…</option>
                {KANBAN_COLS.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={exportSelectionCsv}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors"
              >
                Export selection
              </button>
              <button type="button" onClick={() => setSelectedIds([])} className="px-3 py-1.5 text-white/60 hover:text-white text-xs">
                Cancel
              </button>
            </div>
          </div>
        )}

        {viewMode === 'table' ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#E5E7EB] dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] dark:border-slate-700 bg-[#F9FAFB] dark:bg-slate-800/50">
                    <th className="px-4 py-3 text-left w-10">
                      <button type="button" onClick={toggleAllOnPage} className="flex items-center" aria-label="Select all on page">
                        {paginated.length > 0 && paginated.every(o => selectedIds.includes(o.id)) ? (
                          <CheckSquare size={16} className="text-[#ff8a65]" />
                        ) : (
                          <Square size={16} className="text-[#9CA3AF]" />
                        )}
                      </button>
                    </th>
                    {['Order ID', 'Customer', 'Vehicle', 'Inspector', 'Zone', 'Scheduled', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((order, idx) => (
                    <tr
                      key={order.id}
                      ref={idx === activeIndex ? el => el?.scrollIntoView({ block: 'nearest' }) : undefined}
                      onMouseEnter={() => router.prefetch(`/orders/${order.id}`)}
                      style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 61px' }}
                      className={`border-b border-[#F4F6F8] dark:border-slate-800 hover:bg-[#F9FAFB] dark:hover:bg-slate-800/30 transition-colors ${
                        idx === activeIndex ? 'bg-[#FFF3EE] dark:bg-slate-800/60 ring-1 ring-inset ring-[#ff8a65]/40' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => toggleSelect(order.id)} aria-label={`Select ${order.id}`}>
                          {selectedIds.includes(order.id) ? (
                            <CheckSquare size={16} className="text-[#ff8a65]" />
                          ) : (
                            <Square size={16} className="text-[#9CA3AF]" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/orders/${order.id}`} className="font-mono text-xs font-semibold text-[#ff8a65] hover:underline">
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
                        <InlineSelectCell
                          value={order.inspectorId || ''}
                          options={[{ value: '', label: 'Unassigned' }, ...INSPECTORS.map(i => ({ value: i.id, label: i.name }))]}
                          onCommit={v => inlineAssignInspector(order.id, v)}
                          ariaLabel={`inspector for ${order.id}`}
                        >
                          {order.inspectorName ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-[#ff5722] flex items-center justify-center text-white text-[10px] font-bold">
                                {order.inspectorName.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="text-xs text-[#1F2937] dark:text-slate-100">{order.inspectorName.split(' ')[0]}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-[#9CA3AF]">Unassigned</span>
                          )}
                        </InlineSelectCell>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#6B7280]">{order.zone}</td>
                      <td className="px-4 py-3 text-xs text-[#6B7280] whitespace-nowrap">
                        {new Date(order.scheduledAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                        <br />
                        {new Date(order.scheduledAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3">
                        <InlineSelectCell
                          value={order.status}
                          options={KANBAN_COLS.map(s => ({ value: s, label: s }))}
                          onCommit={v => updateOrderInline(order.id, `Status → ${v}`, o => ({ ...o, status: v as OrderRow['status'] }))}
                          ariaLabel={`status for ${order.id}`}
                        >
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                            {order.status}
                          </span>
                        </InlineSelectCell>
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
                      <td colSpan={9} className="px-4 py-16 text-center text-[#6B7280]">
                        <p className="font-medium">No orders found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="hidden md:block px-4 py-2 text-[11px] text-[#9CA3AF] border-t border-[#F4F6F8] dark:border-slate-800">
              <kbd className="font-mono">j</kbd>/<kbd className="font-mono">k</kbd> navigate · <kbd className="font-mono">Enter</kbd> open
            </p>
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
                            className="block bg-white dark:bg-slate-900 rounded-xl border border-[#E5E7EB] dark:border-slate-700 p-4 hover:shadow-md transition-all hover:border-[#ff8a65]/30 cursor-grab active:cursor-grabbing"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-mono text-xs font-semibold text-[#ff8a65]">{order.id}</span>
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
