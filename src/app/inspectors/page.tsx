'use client';
import React, { useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Grid, List, Star, MapPin } from 'lucide-react';

import { toast } from 'sonner';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { EmptyState } from '@/components/shared/TableSkeleton';
import { inspectorsApi } from '@/lib/api/services';
import { useApiList } from '@/hooks/useApiResource';

export default function InspectorsPage() {
  const pathname = usePathname();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const { data: inspectors, loading, error, refresh } = useApiList(() => inspectorsApi.list());

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    return inspectors.filter(
      i =>
        !q ||
        i.name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        i.zone.some(z => z.toLowerCase().includes(q))
    );
  }, [debouncedSearch, inspectors]);

  const statusColor = (s: string) => s === 'online' ? 'bg-green-500' : s === 'en-route' ? 'bg-amber-500' : 'bg-gray-400';
  const statusLabel = (s: string) => s === 'online' ? 'Online' : s === 'en-route' ? 'En Route' : 'Offline';

  return (
    <AppLayout currentPath={pathname}>
      {inviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setInviteModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-fade-in">
            <h3 className="text-base font-heading font-semibold text-[#1F2937] mb-4">Invite Inspector</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">Email Address</label>
                <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="inspector@example.com"
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">Role</label>
                <select className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30">
                  <option>Inspector</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setInviteModal(false)} className="flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium hover:bg-[#F4F6F8]">Cancel</button>
              <button onClick={() => { toast.success(`Invite sent to ${inviteEmail}`); setInviteModal(false); setInviteEmail(''); }}
                className="flex-1 px-4 py-2.5 bg-[#ff5722] text-white rounded-lg text-sm font-semibold hover:bg-[#e64a19]">Send Invite</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Inspectors</h1>
            <p className="text-sm text-[#6B7280]">{loading ? '…' : `${inspectors.filter(i => i.status === 'online').length}/${inspectors.length}`} online</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#F4F6F8] rounded-lg p-1">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-[#6B7280]'}`}><Grid size={15} /></button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-[#6B7280]'}`}><List size={15} /></button>
            </div>
            <button onClick={() => setInviteModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19] transition-all min-h-[44px]">
              <Plus size={16} /> Invite Inspector
            </button>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search inspectors…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30" />
          {search !== debouncedSearch && (
            <p className="text-[11px] text-[#6B7280] mt-1.5">Filtering…</p>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex justify-between gap-3">
            <p className="text-sm text-red-700">{error}</p>
            <button type="button" onClick={() => void refresh()} className="text-sm font-semibold text-red-700 underline">Retry</button>
          </div>
        )}
        {loading ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-sm text-[#6B7280]">Loading inspectors…</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB]">
            <EmptyState title="No inspectors match" hint="Try another search or invite a new inspector." />
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(ins => (
              <div key={ins.id} className="bg-white rounded-xl border border-[#E5E7EB] p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-[#ff5722] flex items-center justify-center text-white font-bold text-lg">
                      {ins.avatar}
                    </div>
                    <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${statusColor(ins.status)}`} />
                  </div>
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{ins.certBadge}</span>
                </div>
                <h3 className="text-sm font-semibold text-[#1F2937] mb-1">{ins.name}</h3>
                <div className="flex items-center gap-1 mb-2">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs font-medium text-[#1F2937]">{ins.rating}</span>
                  <span className="text-xs text-[#9CA3AF]">· {ins.totalJobs} jobs</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {ins.zone.map(z => (
                    <span key={z} className="text-[10px] bg-[#F4F6F8] text-[#6B7280] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <MapPin size={9} /> {z}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-[#6B7280] mb-4">
                  <span>{ins.jobsCompleted}/{ins.jobsToday} today</span>
                  <span className={`font-semibold ${ins.status === 'online' ? 'text-[#1A7A4A]' : ins.status === 'en-route' ? 'text-amber-600' : 'text-[#9CA3AF]'}`}>
                    {statusLabel(ins.status)}
                  </span>
                </div>
                <Link href={`/inspectors/${ins.id}`} className="block w-full text-center py-2 bg-[#F4F6F8] text-[#ff5722] text-xs font-semibold rounded-lg hover:bg-[#E5E7EB] transition-colors">
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  {['Inspector', 'Zone', 'Status', 'Rating', 'Jobs Today', 'Total Jobs', 'Avg Score', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(ins => (
                  <tr key={ins.id} className="border-b border-[#F4F6F8] hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-[#ff5722] flex items-center justify-center text-white text-xs font-bold">{ins.avatar}</div>
                          <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${statusColor(ins.status)}`} />
                        </div>
                        <div>
                          <p className="font-medium text-[#1F2937]">{ins.name}</p>
                          <p className="text-xs text-[#6B7280]">{ins.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6B7280]">{ins.zone.join(', ')}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${ins.status === 'online' ? 'text-[#1A7A4A]' : ins.status === 'en-route' ? 'text-amber-600' : 'text-[#9CA3AF]'}`}>
                        ● {statusLabel(ins.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span className="text-sm font-medium">{ins.rating}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#1F2937]">{ins.jobsCompleted}/{ins.jobsToday}</td>
                    <td className="px-4 py-3 text-[#1F2937]">{ins.totalJobs}</td>
                    <td className="px-4 py-3 text-[#1F2937] font-semibold">{ins.avgScore}</td>
                    <td className="px-4 py-3">
                      <Link href={`/inspectors/${ins.id}`} className="text-xs text-[#ff8a65] hover:underline">View Profile</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
