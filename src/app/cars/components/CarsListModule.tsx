'use client';
import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, Plus, Download, Upload, X, Copy, MoreHorizontal, AlertTriangle, CheckCircle, FileText, ChevronLeft, ChevronRight, Settings2, Eye, Edit, Link2, Star, ShoppingCart, Globe, Flag, Trash2, Diamond } from 'lucide-react';
import { CarListRow, PhysicalStatus } from '@/types/domain';

const MOCK_CARS: CarListRow[] = [
  { id: '1', ckId: 'CK-41', brand: 'Toyota', model: 'Camry', year: 2011, transmission: 'Automatic', bodyType: 'Sedan', colour: 'Silver', vin: 'JTDBE32K913012345', plate: 'LSD260JE', physicalStatus: 'at_buyer', purchaseChannel: 'auction', salesChannel: 'market_place', purchasePrice: 5000000, purchaseDate: '2024-12-01', soldPrice: 5100000, marginPct: 1.96, score: 73, warningCount: 2, potentialDuplicate: true, duplicateOfCkId: 'CK-38', docsUploaded: 6, docsTotal: 8, createdAt: '2024-12-02', createdBy: 'Promise Ndem', locationLabel: 'Lekki' },
  { id: '2', ckId: 'CK-40', brand: 'Honda', model: 'Accord', year: 2015, transmission: 'Automatic', bodyType: 'Sedan', colour: 'Black', vin: '1HGCR2F3XFA012345', plate: 'ABC123XY', physicalStatus: 'listed', purchaseChannel: 'offline', salesChannel: 'market_place', purchasePrice: 4200000, purchaseDate: '2024-11-15', soldPrice: null, marginPct: null, score: 85, warningCount: 0, potentialDuplicate: false, docsUploaded: 8, docsTotal: 8, createdAt: '2024-11-16', createdBy: 'Adaeze Mensah', locationLabel: 'Victoria Island' },
  { id: '3', ckId: 'CK-39', brand: 'Mercedes-Benz', model: 'C300', year: 2018, transmission: 'Automatic', bodyType: 'Sedan', colour: 'White', vin: 'WDD2050421R012345', plate: 'KJA456ZZ', physicalStatus: 'acquired', purchaseChannel: 'b2b', salesChannel: 'auction', purchasePrice: 12000000, purchaseDate: '2024-12-10', soldPrice: null, marginPct: null, score: null, warningCount: 1, potentialDuplicate: false, docsUploaded: 3, docsTotal: 8, createdAt: '2024-12-11', createdBy: 'Chidi Okafor', locationLabel: 'Abuja' },
  { id: '4', ckId: 'CK-38', brand: 'Toyota', model: 'Camry', year: 2011, transmission: 'Manual', bodyType: 'Sedan', colour: 'Silver', vin: 'JTDBE32K913099999', plate: 'LSD260JE', physicalStatus: 'sold', purchaseChannel: 'market_place', salesChannel: 'direct', purchasePrice: 4800000, purchaseDate: '2024-10-01', soldPrice: 5050000, marginPct: 5.21, score: 68, warningCount: 0, potentialDuplicate: true, duplicateOfCkId: 'CK-41', docsUploaded: 8, docsTotal: 8, createdAt: '2024-10-02', createdBy: 'Promise Ndem', locationLabel: 'Lagos' },
  { id: '5', ckId: 'CK-37', brand: 'Ford', model: 'Explorer', year: 2019, transmission: 'Automatic', bodyType: 'SUV', colour: 'Blue', vin: '1FM5K8D88KGA12345', plate: 'EKY789AB', physicalStatus: 'at_inspector', purchaseChannel: 'auction', salesChannel: 'market_place', purchasePrice: 8500000, purchaseDate: '2024-12-05', soldPrice: null, marginPct: null, score: 55, warningCount: 3, potentialDuplicate: false, docsUploaded: 5, docsTotal: 8, createdAt: '2024-12-06', createdBy: 'Ngozi Eze', locationLabel: 'Port Harcourt' },
  { id: '6', ckId: 'CK-36', brand: 'Lexus', model: 'RX350', year: 2020, transmission: 'Automatic', bodyType: 'SUV', colour: 'Pearl White', vin: '2T2BZMCA5LC012345', plate: 'MUS321CD', physicalStatus: 'listed', purchaseChannel: 'offline', salesChannel: 'market_place', purchasePrice: 18000000, purchaseDate: '2024-11-20', soldPrice: null, marginPct: null, score: 91, warningCount: 0, potentialDuplicate: false, docsUploaded: 8, docsTotal: 8, createdAt: '2024-11-21', createdBy: 'Adaeze Mensah', locationLabel: 'Victoria Island' },
  { id: '7', ckId: 'CK-35', brand: 'Hyundai', model: 'Tucson', year: 2017, transmission: 'Automatic', bodyType: 'SUV', colour: 'Grey', vin: 'KM8J3CA46HU012345', plate: 'OYO654EF', physicalStatus: 'cancelled', purchaseChannel: 'b2b', salesChannel: 'other', purchasePrice: 6200000, purchaseDate: '2024-09-15', soldPrice: null, marginPct: null, score: 42, warningCount: 1, potentialDuplicate: false, docsUploaded: 2, docsTotal: 8, createdAt: '2024-09-16', createdBy: 'Chidi Okafor', locationLabel: 'Abuja' },
];

const STATUS_CONFIG: Record<PhysicalStatus, { label: string; cls: string }> = {
  acquired: { label: 'Acquired', cls: 'bg-[#1E3A5F] text-white' },
  at_inspector: { label: 'At Inspector', cls: 'bg-purple-100 text-purple-700 border border-purple-200' },
  at_buyer: { label: 'At Buyer', cls: 'bg-amber-100 text-amber-700 border border-amber-200' },
  listed: { label: 'Listed', cls: 'bg-teal-100 text-teal-700 border border-teal-200' },
  sold: { label: 'Sold', cls: 'bg-green-100 text-green-700 border border-green-200' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-700 border border-red-200' },
};

const SCORE_CLS = (s: number) => s >= 71 ? 'bg-green-100 text-green-700 border border-green-200' : s >= 41 ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-red-100 text-red-700 border border-red-200';

function fmt(n: number) { return '₦' + n.toLocaleString('en-NG'); }

export default function CarsListModule() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [copiedVin, setCopiedVin] = useState<string | null>(null);

  const filtered = MOCK_CARS.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.vin.toLowerCase().includes(q) || c.plate.toLowerCase().includes(q) || c.brand.toLowerCase().includes(q) || c.model.toLowerCase().includes(q) || c.ckId.toLowerCase().includes(q);
    const matchBrand = !activeFilters.brand || c.brand === activeFilters.brand;
    const matchStatus = !activeFilters.status || c.physicalStatus === activeFilters.status;
    return matchSearch && matchBrand && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleSelect = (id: string) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(selected.length === paginated.length ? [] : paginated.map(c => c.id));

  const copyVin = useCallback((vin: string) => {
    navigator.clipboard.writeText(vin).catch(() => {});
    setCopiedVin(vin);
    setTimeout(() => setCopiedVin(null), 1500);
  }, []);

  const clearFilter = (key: string) => setActiveFilters(f => { const n = { ...f }; delete n[key]; return n; });
  const hasFilters = Object.keys(activeFilters).length > 0 || search;

  const brands = [...new Set(MOCK_CARS.map(c => c.brand))];
  const statuses = Object.keys(STATUS_CONFIG) as PhysicalStatus[];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Cars</h1>
          <span className="bg-[#1E3A5F] text-white text-xs font-bold px-2.5 py-1 rounded-full">{MOCK_CARS.length} vehicles</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] text-sm font-medium text-[#6B7280] rounded-lg hover:bg-[#F4F6F8] transition-all">
            <Upload size={14} /> Import CSV
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] text-sm font-medium text-[#6B7280] rounded-lg hover:bg-[#F4F6F8] transition-all">
            <Download size={14} /> Export
          </button>
          <Link href="/cars/register" className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F] transition-all active:scale-[0.98]">
            <Plus size={15} /> Register New Car
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by VIN, plate, make, model..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]"
            />
          </div>
          <select value={activeFilters.brand || ''} onChange={e => { setActiveFilters(f => e.target.value ? { ...f, brand: e.target.value } : (({ brand, ...rest }) => rest)(f)); setPage(1); }} className="px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 bg-white text-[#374151]">
            <option value="">All Brands</option>
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={activeFilters.status || ''} onChange={e => { setActiveFilters(f => e.target.value ? { ...f, status: e.target.value } : (({ status, ...rest }) => rest)(f)); setPage(1); }} className="px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 bg-white text-[#374151]">
            <option value="">All Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
          </select>
          <select className="px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 bg-white text-[#374151]">
            <option>All Years</option>
            {[2024,2023,2022,2021,2020,2019,2018,2017,2016,2015,2014,2013,2012,2011,2010].map(y => <option key={y}>{y}</option>)}
          </select>
          <select className="px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 bg-white text-[#374151]">
            <option>Purchase Channel</option>
            <option>Auction</option><option>Market Place</option><option>Offline</option><option>B2B</option>
          </select>
          <button className="flex items-center gap-1.5 px-3 py-2 border border-[#E5E7EB] text-sm text-[#6B7280] rounded-lg hover:bg-[#F4F6F8]">
            <Settings2 size={14} /> Columns
          </button>
          {hasFilters && (
            <button onClick={() => { setSearch(''); setActiveFilters({}); }} className="text-sm text-[#2E75B6] hover:underline font-medium">
              Clear all filters
            </button>
          )}
        </div>
        {/* Active filter chips */}
        {Object.entries(activeFilters).length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {Object.entries(activeFilters).map(([k, v]) => (
              <span key={k} className="flex items-center gap-1.5 px-2.5 py-1 bg-[#EFF6FF] text-[#1E3A5F] text-xs font-medium rounded-full border border-[#BFDBFE]">
                {k}: {v}
                <button onClick={() => clearFilter(k)}><X size={11} /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bulk Action Bar */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-[#1E3A5F] text-white rounded-xl flex-wrap">
          <span className="text-sm font-semibold">{selected.length} car{selected.length > 1 ? 's' : ''} selected</span>
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-sm rounded-lg transition-all">Assign Inspector</button>
            <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-sm rounded-lg transition-all">Export Selected</button>
            <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-sm rounded-lg transition-all">Change Status</button>
            <button className="px-3 py-1.5 bg-red-500/80 hover:bg-red-500 text-sm rounded-lg transition-all">Delete Selected</button>
            <button onClick={() => setSelected([])} className="p-1.5 hover:bg-white/10 rounded-lg"><X size={14} /></button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-[#F8FAFC] border-b border-[#E5E7EB]">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={selected.length === paginated.length && paginated.length > 0} onChange={toggleAll} className="rounded border-[#D1D5DB] text-[#1E3A5F] focus:ring-[#1E3A5F]" />
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider whitespace-nowrap">CK ID</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Vehicle</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">VIN</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Plate</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Purchase</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Sold</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Score</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Flags</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Docs</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Created</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-[#F4F6F8] rounded-full flex items-center justify-center">
                        <svg viewBox="0 0 64 32" className="w-10 h-6 text-[#9CA3AF]" fill="currentColor">
                          <rect x="2" y="10" width="60" height="16" rx="8"/>
                          <circle cx="14" cy="26" r="6" fill="white" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="50" cy="26" r="6" fill="white" stroke="currentColor" strokeWidth="2"/>
                          <rect x="8" y="4" width="20" height="12" rx="3"/>
                          <rect x="36" y="4" width="20" height="12" rx="3"/>
                        </svg>
                      </div>
                      <p className="text-[#1F2937] font-semibold text-base">No cars found</p>
                      <p className="text-[#6B7280] text-sm">Try adjusting your search or filters</p>
                      <Link href="/cars/register" className="mt-1 px-4 py-2 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F] transition-all">Register First Car</Link>
                    </div>
                  </td>
                </tr>
              ) : paginated.map(car => (
                <tr
                  key={car.id}
                  className={`group transition-all duration-150 hover:bg-[#F8FAFC] hover:shadow-sm ${car.potentialDuplicate ? 'border-l-2 border-l-amber-400' : ''} ${selected.includes(car.id) ? 'bg-blue-50/50' : ''}`}
                >
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.includes(car.id)} onChange={() => toggleSelect(car.id)} className="rounded border-[#D1D5DB] text-[#1E3A5F] focus:ring-[#1E3A5F]" />
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <Link href={`/cars/${car.id}`} className="font-mono text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md hover:bg-teal-100 transition-colors w-fit">
                        {car.ckId}
                      </Link>
                      {car.potentialDuplicate && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-600 font-medium">
                          <Diamond size={9} className="fill-amber-400" /> Possible duplicate
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 min-w-[160px]">
                    <p className="font-semibold text-[#1F2937] text-sm">{car.brand} {car.model} {car.year}</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">{car.transmission} • {car.bodyType} • {car.colour}</p>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs text-[#374151] truncate max-w-[100px]" title={car.vin}>{car.vin.slice(0, 10)}…</span>
                      <button onClick={() => copyVin(car.vin)} className="text-[#9CA3AF] hover:text-[#1E3A5F] transition-colors">
                        {copiedVin === car.vin ? <CheckCircle size={13} className="text-green-500" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className="font-bold text-[#1F2937] text-sm">{car.plate}</span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_CONFIG[car.physicalStatus].cls}`}>
                      {STATUS_CONFIG[car.physicalStatus].label}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <p className="text-xs font-semibold text-[#1F2937]">{fmt(car.purchasePrice)}</p>
                    <p className="text-[10px] text-[#9CA3AF]">{car.purchaseDate}</p>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {car.soldPrice ? (
                      <div>
                        <p className="text-xs font-semibold text-[#1F2937]">{fmt(car.soldPrice)}</p>
                        <p className={`text-[10px] font-medium ${(car.marginPct ?? 0) >= 0 ? 'text-green-600' : 'text-red-500'}`}>{car.marginPct?.toFixed(2)}% margin</p>
                      </div>
                    ) : <span className="text-[#D1D5DB]">—</span>}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {car.score !== null ? (
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border ${SCORE_CLS(car.score)}`}>{car.score}</span>
                    ) : <span className="text-xs text-[#9CA3AF]">Not Graded</span>}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {car.warningCount > 0 && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full text-[10px] font-bold">
                          <AlertTriangle size={10} /> {car.warningCount}
                        </span>
                      )}
                      {car.potentialDuplicate && (
                        <span className="flex items-center justify-center w-5 h-5 bg-amber-100 rounded text-amber-600" title="Potential Duplicate">
                          <Diamond size={10} className="fill-amber-400" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${car.docsUploaded === car.docsTotal ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                      <FileText size={10} /> {car.docsUploaded}/{car.docsTotal}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <p className="text-xs text-[#6B7280]">{car.createdAt}</p>
                    <p className="text-[10px] text-[#9CA3AF]">{car.createdBy}</p>
                  </td>
                  <td className="px-3 py-3 text-center relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === car.id ? null : car.id)}
                      className="p-1.5 rounded-lg hover:bg-[#F4F6F8] text-[#6B7280] hover:text-[#1F2937] transition-all"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {openMenu === car.id && (
                      <div className="absolute right-4 top-10 z-30 w-52 bg-white rounded-xl shadow-xl border border-[#E5E7EB] py-1 text-left">
                        <Link href={`/cars/${car.id}`} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F4F6F8] transition-colors"><Eye size={14} /> View Full Details</Link>
                        <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F4F6F8] transition-colors"><Edit size={14} /> Edit Car</button>
                        <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F4F6F8] transition-colors"><Link2 size={14} /> Link / View Inspection</button>
                        <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F4F6F8] transition-colors"><Star size={14} /> Grade Car</button>
                        <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F4F6F8] transition-colors"><ShoppingCart size={14} /> Start Auction</button>
                        <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F4F6F8] transition-colors"><Globe size={14} /> Push to Marketplace</button>
                        <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F4F6F8] transition-colors"><Flag size={14} /> Mark as Duplicate</button>
                        <div className="border-t border-[#F3F4F6] my-1" />
                        <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={14} /> Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E7EB] bg-[#F8FAFC] flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#6B7280]">
              Showing {Math.min((page - 1) * perPage + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)} of {filtered.length} results
            </span>
            <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }} className="text-sm border border-[#E5E7EB] rounded-lg px-2 py-1 bg-white text-[#374151] focus:outline-none">
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${page === p ? 'bg-[#1E3A5F] text-white' : 'border border-[#E5E7EB] text-[#6B7280] hover:bg-white'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} className="p-2 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
