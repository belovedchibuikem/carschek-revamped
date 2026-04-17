'use client';
import React, { useState } from 'react';
import { Search, Download, ChevronDown, Eye, Flag, Ban } from 'lucide-react';
import { Customer } from './CustomerModule';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  active: { label: 'Active', className: 'bg-green-50 text-green-700 border-green-200' },
  flagged: { label: 'Flagged', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  suspended: { label: 'Suspended', className: 'bg-red-50 text-red-700 border-red-200' },
};

const QUICK_FILTERS = [
  { id: 'filter-all', label: 'All', value: 'all' },
  { id: 'filter-active', label: 'Active', value: 'active' },
  { id: 'filter-flagged', label: 'Flagged', value: 'flagged' },
  { id: 'filter-high-value', label: 'High Value (>₦500k)', value: 'high-value' },
  { id: 'filter-new', label: 'New This Week', value: 'new' },
];

interface Props { customers: Customer[]; onSelectCustomer: (c: Customer) => void; }

export default function CustomerList({ customers, onSelectCustomer }: Props) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'bookings'>('value');

  const filtered = customers
    .filter(c => {
      const matchSearch = !search || [c.name, c.email, c.phone].some(v => v.toLowerCase().includes(search.toLowerCase()));
      const matchFilter = activeFilter === 'all' || activeFilter === c.status || (activeFilter === 'high-value' && c.lifetimeValue >= 500000);
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'value') return b.lifetimeValue - a.lifetimeValue;
      if (sortBy === 'bookings') return b.totalBookings - a.totalBookings;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Customers</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">{customers.length} total · {customers.filter(c => c.status === 'flagged').length} flagged · {customers.filter(c => c.status === 'suspended').length} suspended</p>
        </div>
        <button onClick={() => toast.info('Exporting customer data…')} className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] text-sm font-semibold text-[#6B7280] rounded-lg hover:bg-[#F4F6F8] transition-colors">
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, phone, plate…" className="w-full pl-9 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20 focus:border-[#ff5722] transition-all" />
        </div>
        <div className="relative">
          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="appearance-none pl-3 pr-8 py-2 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none bg-white">
            <option value="value">Sort: Lifetime Value</option>
            <option value="bookings">Sort: Total Bookings</option>
            <option value="name">Sort: Name A–Z</option>
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
        </div>
      </div>

      {/* Quick filter chips */}
      <div className="flex gap-2 flex-wrap">
        {QUICK_FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.value)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${activeFilter === f.value ? 'bg-[#ff5722] text-white border-[#ff5722]' : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#ff5722] hover:text-[#ff5722]'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-[#F4F6F8] text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] border-b border-[#E5E7EB]">
                <th className="px-5 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-right">Bookings</th>
                <th className="px-4 py-3 text-left">Last Active</th>
                <th className="px-4 py-3 text-right">Lifetime Value</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F6F8]">
              {filtered.map(customer => (
                <tr key={customer.id} className="hover:bg-[#F4F6F8]/60 transition-colors group cursor-pointer" onClick={() => onSelectCustomer(customer)}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#ff8a65] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{customer.avatar}</div>
                      <div>
                        <p className="text-sm font-semibold text-[#1F2937]">{customer.name}</p>
                        <p className="text-[10px] text-[#6B7280]">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-[#1F2937]">{customer.phone}</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-[#1F2937] tabular-nums">{customer.totalBookings}</td>
                  <td className="px-4 py-3 text-xs text-[#6B7280]">{customer.lastActive}</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-[#1F2937] tabular-nums">₦{customer.lifetimeValue.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[customer.status].className}`}>
                      {STATUS_CONFIG[customer.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={e => { e.stopPropagation(); onSelectCustomer(customer); }} className="p-1.5 rounded-lg hover:bg-blue-50 text-[#ff8a65] transition-colors" title="View profile"><Eye size={14} /></button>
                      <button onClick={e => { e.stopPropagation(); toast.warning(`${customer.name} flagged for review`); }} className="p-1.5 rounded-lg hover:bg-amber-50 text-[#D35400] transition-colors" title="Flag account"><Flag size={14} /></button>
                      <button onClick={e => { e.stopPropagation(); toast.error(`${customer.name} account suspended`); }} className="p-1.5 rounded-lg hover:bg-red-50 text-[#C0392B] transition-colors" title="Suspend account"><Ban size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Search size={36} className="mx-auto text-[#E5E7EB] mb-3" />
            <p className="text-sm font-semibold text-[#1F2937]">No customers found</p>
            <p className="text-xs text-[#6B7280] mt-1">Try adjusting your search or filter criteria</p>
          </div>
        )}
        <div className="px-5 py-3 border-t border-[#E5E7EB] flex items-center justify-between">
          <p className="text-xs text-[#6B7280]">Showing {filtered.length} of {customers.length} customers</p>
          <p className="text-xs text-[#6B7280]">Total lifetime value: <span className="font-bold text-[#1F2937]">₦{customers.reduce((a, c) => a + c.lifetimeValue, 0).toLocaleString()}</span></p>
        </div>
      </div>
    </div>
  );
}