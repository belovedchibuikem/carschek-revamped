'use client';
import React, { useState } from 'react';
import { Plus, Search, Filter, CheckCircle, XCircle, Star, Eye, Edit, ChevronDown, BarChart2 } from 'lucide-react';
import { Listing } from './VehicleListingsModule';
import { toast } from 'sonner';

const STATUS_TABS = ['all', 'pending', 'active', 'featured', 'sold', 'expired'] as const;
type StatusTab = typeof STATUS_TABS[number];

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  active: 'bg-green-50 text-green-700 border border-green-200',
  featured: 'bg-purple-50 text-purple-700 border border-purple-200',
  sold: 'bg-blue-50 text-blue-700 border border-blue-200',
  expired: 'bg-gray-100 text-gray-500 border border-gray-200',
};

const SCORE_COLOR = (s: number) => s >= 71 ? 'bg-green-50 text-green-700 border border-green-200' : s >= 41 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-red-50 text-red-700 border border-red-200';

interface Props {
  listings: Listing[];
  onViewDetail: (l: Listing) => void;
  onOpenPricing: () => void;
}

export default function ListingsTable({ listings, onViewDetail, onOpenPricing }: Props) {
  const [activeTab, setActiveTab] = useState<StatusTab>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = listings.filter(l => {
    const matchTab = activeTab === 'all' || l.status === activeTab;
    const matchSearch = !search || `${l.year} ${l.make} ${l.model} ${l.plate} ${l.listedBy}`.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const toggleSelect = (id: string) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(l => l.id));

  const tabCount = (tab: StatusTab) => tab === 'all' ? listings.length : listings.filter(l => l.status === tab).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-heading font-bold text-[#1F2937]">Vehicle Listings</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">{listings.length} total listings on the marketplace</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onOpenPricing} className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] text-sm font-semibold text-[#6B7280] rounded-lg hover:bg-[#F4F6F8] transition-all">
            <BarChart2 size={15} /> Pricing Tool
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F] transition-all active:scale-[0.98]">
            <Plus size={15} /> Add Listing
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#E5E7EB] overflow-x-auto">
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold capitalize whitespace-nowrap border-b-2 transition-all ${activeTab === tab ? 'border-[#1E3A5F] text-[#1E3A5F]' : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'}`}
          >
            {tab}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab ? 'bg-[#1E3A5F] text-white' : 'bg-[#F4F6F8] text-[#6B7280]'}`}>{tabCount(tab)}</span>
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by make, model, plate, seller…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F]"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] text-sm text-[#6B7280] rounded-lg hover:bg-[#F4F6F8] transition-all">
          <Filter size={14} /> Filters <ChevronDown size={12} />
        </button>
      </div>

      {/* Bulk action bar */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-[#1E3A5F] text-white rounded-xl animate-fade-in">
          <span className="text-sm font-semibold">{selected.length} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={() => { toast.success(`${selected.length} listings approved`); setSelected([]); }} className="px-3 py-1.5 bg-[#1A7A4A] text-white text-xs font-semibold rounded-lg hover:bg-[#155F3A] transition-all flex items-center gap-1"><CheckCircle size={12} /> Approve</button>
            <button onClick={() => { toast.error(`${selected.length} listings rejected`); setSelected([]); }} className="px-3 py-1.5 bg-[#C0392B] text-white text-xs font-semibold rounded-lg hover:bg-[#A93226] transition-all flex items-center gap-1"><XCircle size={12} /> Reject</button>
            <button onClick={() => { toast.info(`${selected.length} listings featured`); setSelected([]); }} className="px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition-all flex items-center gap-1"><Star size={12} /> Feature</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F4F6F8]/60">
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} className="w-4 h-4 rounded border-[#E5E7EB] text-[#1E3A5F]" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Photo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Vehicle</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Score</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Asking Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Views</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Inquiries</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Listed By</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Days</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F6F8]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-[#F4F6F8] flex items-center justify-center">
                        <Search size={24} className="text-[#6B7280]" />
                      </div>
                      <p className="text-sm font-semibold text-[#1F2937]">No listings found</p>
                      <p className="text-xs text-[#6B7280]">Try adjusting your filters or search query</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(listing => (
                <tr key={listing.id} className="hover:bg-[#F4F6F8]/40 transition-colors group">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.includes(listing.id)} onChange={() => toggleSelect(listing.id)} className="w-4 h-4 rounded border-[#E5E7EB] text-[#1E3A5F]" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-14 h-10 bg-[#F4F6F8] rounded-lg border border-[#E5E7EB] flex items-center justify-center overflow-hidden">
                      <div className="text-[#6B7280] text-xs font-bold">{listing.make[0]}{listing.model[0]}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[#1F2937]">{listing.year} {listing.make} {listing.model}</p>
                    <p className="text-xs text-[#6B7280] font-mono">{listing.plate}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${SCORE_COLOR(listing.score)}`}>{listing.score}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-[#1F2937]">₦{listing.askingPrice.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-[#6B7280]"><Eye size={12} /> {listing.views}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-[#1F2937]">{listing.inquiries}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[#1F2937]">{listing.listedBy}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${listing.daysOnMarket > 30 ? 'text-[#C0392B]' : listing.daysOnMarket > 14 ? 'text-[#D35400]' : 'text-[#1F2937]'}`}>{listing.daysOnMarket}d</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[listing.status]}`}>{listing.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { toast.success(`${listing.id} approved`); }} title="Approve" className="p-1.5 rounded-lg hover:bg-green-50 text-[#1A7A4A] transition-colors"><CheckCircle size={14} /></button>
                      <button onClick={() => { toast.error(`${listing.id} rejected`); }} title="Reject" className="p-1.5 rounded-lg hover:bg-red-50 text-[#C0392B] transition-colors"><XCircle size={14} /></button>
                      <button onClick={() => { toast.info(`${listing.id} featured`); }} title="Feature" className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors"><Star size={14} /></button>
                      <button onClick={() => onViewDetail(listing)} title="View" className="p-1.5 rounded-lg hover:bg-blue-50 text-[#2E75B6] transition-colors"><Eye size={14} /></button>
                      <button title="Edit" className="p-1.5 rounded-lg hover:bg-[#F4F6F8] text-[#6B7280] transition-colors"><Edit size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-4 py-3 border-t border-[#E5E7EB] flex items-center justify-between">
          <p className="text-xs text-[#6B7280]">Showing {filtered.length} of {listings.length} listings</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 text-xs border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F4F6F8] transition-all">Previous</button>
            <button className="px-3 py-1.5 text-xs bg-[#1E3A5F] text-white rounded-lg">1</button>
            <button className="px-3 py-1.5 text-xs border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F4F6F8] transition-all">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
