'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, AlertTriangle, CheckSquare, Square, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { CARS, formatNaira, STATUS_COLORS, getScoreColor, getScoreLabel } from '@/lib/mockData';
import { toast } from 'sonner';

const PIPELINE_STAGES = ['Acquired', 'Inspection Linked', 'At Buyer', 'Listed', 'Sold'];

export default function CarsPage() {
  const pathname = usePathname();
  const [cars, setCars] = useState(CARS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 25;

  const filtered = cars.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.id.toLowerCase().includes(q) || c.brand.toLowerCase().includes(q) || c.model.toLowerCase().includes(q) || c.plate.toLowerCase().includes(q) || c.vin.toLowerCase().includes(q);
    const matchStatus = !statusFilter || c.status === statusFilter;
    const matchBrand = !brandFilter || c.brand === brandFilter;
    return matchSearch && matchStatus && matchBrand;
  });

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const toggleSelect = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelectedIds(selectedIds.length === paginated.length ? [] : paginated.map(c => c.id));

  const handleDelete = (id: string) => {
    setCars(prev => prev.filter(c => c.id !== id));
    setDeleteConfirm(null);
    toast.success(`Car ${id} deleted successfully`);
  };

  const exportCSV = () => {
    const rows = [['CK ID', 'Brand', 'Model', 'Year', 'Plate', 'Status', 'Score', 'Purchase Price', 'Sale Price']];
    filtered.forEach(c => rows.push([c.id, c.brand, c.model, String(c.year), c.plate, c.status, String(c.score), String(c.purchasePrice), String(c.salePrice || '')]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'cars-export.csv'; a.click();
    toast.success('CSV exported successfully');
  };

  return (
    <AppLayout currentPath={pathname}>
      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-fade-in">
            <h3 className="text-base font-heading font-semibold text-[#1F2937] mb-2">Delete {deleteConfirm}?</h3>
            <p className="text-sm text-[#6B7280] mb-5">This action cannot be undone. The car record will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#1F2937] hover:bg-[#F4F6F8] transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 bg-[#C0392B] text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Cars</h1>
            <p className="text-sm text-[#6B7280]">{filtered.length} vehicles in system</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F4F6F8] transition-colors">
              <Download size={15} /> Export
            </button>
            <Link href="/cars/new" className="flex items-center gap-2 px-4 py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F] transition-all min-h-[44px]">
              <Plus size={16} /> Register New Car
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by ID, brand, plate, VIN…"
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-[#F4F6F8] border border-[#E5E7EB] rounded-lg text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 focus:border-[#2E75B6]" />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 text-sm bg-[#F4F6F8] border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30">
            <option value="">All Statuses</option>
            {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={brandFilter} onChange={e => { setBrandFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 text-sm bg-[#F4F6F8] border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30">
            <option value="">All Brands</option>
            {[...new Set(CARS.map(c => c.brand))].map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          {(search || statusFilter || brandFilter) && (
            <button onClick={() => { setSearch(''); setStatusFilter(''); setBrandFilter(''); setPage(1); }}
              className="px-3 py-2.5 text-sm text-[#C0392B] hover:bg-red-50 rounded-lg transition-colors">
              Clear filters
            </button>
          )}
        </div>

        {/* Bulk action bar */}
        {selectedIds.length > 0 && (
          <div className="bg-[#1E3A5F] text-white rounded-xl px-4 py-3 flex items-center gap-4 animate-fade-in">
            <span className="text-sm font-medium">{selectedIds.length} selected</span>
            <div className="flex items-center gap-2 ml-auto">
              {['Push to Marketplace', 'Export', 'Delete'].map(action => (
                <button key={action} onClick={() => {
                  if (action === 'Delete') { toast.error('Bulk delete requires individual confirmation'); return; }
                  if (action === 'Export') exportCSV();
                  else toast.success(`${action} applied to ${selectedIds.length} cars`);
                  setSelectedIds([]);
                }} className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors">
                  {action}
                </button>
              ))}
              <button onClick={() => setSelectedIds([])} className="px-3 py-1.5 text-white/60 hover:text-white text-xs">Cancel</button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="px-4 py-3 text-left">
                    <button onClick={toggleAll} className="flex items-center">
                      {selectedIds.length === paginated.length && paginated.length > 0
                        ? <CheckSquare size={16} className="text-[#2E75B6]" />
                        : <Square size={16} className="text-[#9CA3AF]" />}
                    </button>
                  </th>
                  {['CK ID', 'Vehicle', 'Plate', 'Status', 'Score', 'Purchase', 'Sale', 'Docs', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map(car => (
                  <tr key={car.id}
                    className={`border-b border-[#F4F6F8] hover:bg-[#F9FAFB] transition-colors ${car.hasDuplicate ? 'border-l-4 border-l-amber-400' : ''}`}>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleSelect(car.id)}>
                        {selectedIds.includes(car.id)
                          ? <CheckSquare size={16} className="text-[#2E75B6]" />
                          : <Square size={16} className="text-[#9CA3AF]" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-[#1E3A5F]">{car.id}</span>
                        {car.hasDuplicate && (
                          <span title="Potential duplicate" className="text-amber-500"><AlertTriangle size={13} /></span>
                        )}
                        {car.warnings > 0 && (
                          <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-semibold">{car.warnings}⚠</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/cars/${car.id}`} className="hover:text-[#2E75B6] transition-colors">
                        <p className="font-medium text-[#1F2937]">{car.brand} {car.model}</p>
                        <p className="text-xs text-[#6B7280]">{car.year} · {car.colour}</p>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-[#6B7280]">{car.plate}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[car.status] || 'bg-gray-100 text-gray-700'}`}>
                        {car.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                          style={{ borderColor: getScoreColor(car.score), color: getScoreColor(car.score) }}>
                          {car.score}
                        </div>
                        <span className="text-xs text-[#6B7280]">{getScoreLabel(car.score)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#1F2937] font-medium">{formatNaira(car.purchasePrice)}</td>
                    <td className="px-4 py-3 text-sm text-[#6B7280]">{car.salePrice ? formatNaira(car.salePrice) : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${car.docs >= 6 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {car.docs}/8
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <button onClick={() => setOpenMenu(openMenu === car.id ? null : car.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F4F6F8] transition-colors">
                          <MoreHorizontal size={16} className="text-[#6B7280]" />
                        </button>
                        {openMenu === car.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-[#E5E7EB] z-50 py-1 animate-fade-in">
                              {[
                                { label: 'View', icon: Eye, href: `/cars/${car.id}` },
                                { label: 'Edit', icon: Edit, href: `/cars/${car.id}` },
                              ].map(item => (
                                <Link key={item.label} href={item.href} onClick={() => setOpenMenu(null)}
                                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#1F2937] hover:bg-[#F4F6F8] transition-colors">
                                  <item.icon size={14} className="text-[#6B7280]" /> {item.label}
                                </Link>
                              ))}
                              {['Link Inspection', 'Grade Car', 'Start Auction', 'Push to Marketplace', 'Mark as Duplicate'].map(action => (
                                <button key={action} onClick={() => { toast.success(`${action} — ${car.id}`); setOpenMenu(null); }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#1F2937] hover:bg-[#F4F6F8] transition-colors text-left">
                                  {action}
                                </button>
                              ))}
                              <div className="border-t border-[#E5E7EB] mt-1 pt-1">
                                <button onClick={() => { setDeleteConfirm(car.id); setOpenMenu(null); }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#C0392B] hover:bg-red-50 transition-colors text-left">
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr><td colSpan={10} className="px-4 py-16 text-center text-[#6B7280]">
                    <Car size={40} className="mx-auto mb-3 text-[#E5E7EB]" />
                    <p className="font-medium">No cars found</p>
                    <p className="text-sm mt-1">Try adjusting your filters or <Link href="/cars/new" className="text-[#2E75B6] hover:underline">register a new car</Link></p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-[#E5E7EB] flex items-center justify-between">
              <p className="text-xs text-[#6B7280]">
                Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F4F6F8] disabled:opacity-40 transition-colors">
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors ${page === p ? 'bg-[#1E3A5F] text-white' : 'hover:bg-[#F4F6F8] text-[#6B7280]'}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F4F6F8] disabled:opacity-40 transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
