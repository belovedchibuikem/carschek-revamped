'use client';
import React, { useState } from 'react';
import { Search, Grid, List, UserPlus, Star, Briefcase, ChevronDown } from 'lucide-react';
import { Inspector } from './InspectorModule';

const STATUS_CONFIG = {
  available: { label: 'Available', dot: 'bg-[#1A7A4A]', badge: 'bg-green-50 text-green-700' },
  busy: { label: 'On Job', dot: 'bg-[#D35400]', badge: 'bg-amber-50 text-amber-700' },
  'off-duty': { label: 'Off Duty', dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-500' },
};

interface Props { inspectors: Inspector[]; onSelectInspector: (i: Inspector) => void; }

export default function InspectorList({ inspectors, onSelectInspector }: Props) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = inspectors.filter(i => {
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.zones.some(z => z.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Inspectors</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">{inspectors.filter(i => i.status === 'available').length} available · {inspectors.filter(i => i.status === 'busy').length} on job · {inspectors.filter(i => i.status === 'off-duty').length} off duty</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-[#F4F6F8] p-1 rounded-lg border border-[#E5E7EB]">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#1E3A5F]' : 'text-[#6B7280]'}`}><Grid size={14} /></button>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[#1E3A5F]' : 'text-[#6B7280]'}`}><List size={14} /></button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F] transition-all active:scale-[0.98]">
            <UserPlus size={15} /> Invite Inspector
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or zone…" className="w-full pl-9 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] transition-all" />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="appearance-none pl-3 pr-8 py-2 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none bg-white">
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="busy">On Job</option>
            <option value="off-duty">Off Duty</option>
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
          {filtered.map(insp => (
            <div key={insp.id} className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm hover:shadow-md transition-all group cursor-pointer" onClick={() => onSelectInspector(insp)}>
              <div className="flex items-start justify-between mb-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-lg font-bold">{insp.avatar}</div>
                  <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${STATUS_CONFIG[insp.status].dot}`} />
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_CONFIG[insp.status].badge}`}>{STATUS_CONFIG[insp.status].label}</span>
              </div>
              <h3 className="font-heading font-semibold text-[#1F2937] text-sm mb-0.5">{insp.name}</h3>
              <p className="text-[10px] text-[#6B7280] mb-2">{insp.certification}</p>
              <div className="flex items-center gap-1 mb-3">
                <Star size={11} className="text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold text-[#1F2937]">{insp.rating}</span>
                <span className="text-[10px] text-[#6B7280] ml-1">· {insp.totalJobs} jobs</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-4">
                {insp.zones.slice(0, 2).map(z => (
                  <span key={`zone-${insp.id}-${z}`} className="text-[9px] bg-blue-50 text-[#2E75B6] border border-blue-100 px-1.5 py-0.5 rounded-full font-medium">{z}</span>
                ))}
                {insp.zones.length > 2 && <span className="text-[9px] bg-[#F4F6F8] text-[#6B7280] px-1.5 py-0.5 rounded-full">+{insp.zones.length - 2}</span>}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#F4F6F8]">
                <div className="flex items-center gap-1 text-[10px] text-[#6B7280]">
                  <Briefcase size={10} />
                  <span>{insp.jobsToday} today</span>
                </div>
                <span className="text-[10px] font-semibold text-[#1A7A4A]">₦{(insp.earningsMTD / 1000).toFixed(0)}k MTD</span>
              </div>
              <button className="mt-3 w-full py-1.5 text-xs font-semibold text-[#2E75B6] border border-[#2E75B6]/30 rounded-lg hover:bg-blue-50 transition-colors opacity-0 group-hover:opacity-100">
                View Profile →
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F4F6F8] text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] border-b border-[#E5E7EB]">
                <th className="px-5 py-3 text-left">Inspector</th>
                <th className="px-4 py-3 text-left">Zones</th>
                <th className="px-4 py-3 text-right">Rating</th>
                <th className="px-4 py-3 text-right">Today</th>
                <th className="px-4 py-3 text-right">This Month</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Earnings MTD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F6F8]">
              {filtered.map(insp => (
                <tr key={insp.id} className="hover:bg-[#F4F6F8]/60 transition-colors cursor-pointer" onClick={() => onSelectInspector(insp)}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-xs font-bold">{insp.avatar}</div>
                        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${STATUS_CONFIG[insp.status].dot}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1F2937]">{insp.name}</p>
                        <p className="text-[10px] text-[#6B7280]">{insp.certification}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {insp.zones.slice(0, 2).map(z => (
                        <span key={`ztbl-${insp.id}-${z}`} className="text-[9px] bg-blue-50 text-[#2E75B6] px-1.5 py-0.5 rounded-full">{z}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Star size={11} className="text-amber-400 fill-amber-400" />
                      <span className="text-sm font-semibold text-[#1F2937]">{insp.rating}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-[#1F2937] tabular-nums">{insp.jobsToday}</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-[#1F2937] tabular-nums">{insp.jobsMonth}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_CONFIG[insp.status].badge}`}>{STATUS_CONFIG[insp.status].label}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-[#1A7A4A] tabular-nums">₦{insp.earningsMTD.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}