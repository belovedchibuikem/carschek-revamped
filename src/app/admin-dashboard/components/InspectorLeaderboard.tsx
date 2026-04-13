'use client';
import React from 'react';
import { Trophy, Star, Clock } from 'lucide-react';
import Link from 'next/link';

const INSPECTORS = [
  { id: 'insp-001', name: 'Emeka Okonkwo', avatar: 'EO', zone: 'Lagos Island', jobs: 28, rating: 4.9, turnaround: '8m 20s', earnings: 185000, status: 'available' as const },
  { id: 'insp-002', name: 'Adaora Nwosu', avatar: 'AN', zone: 'Lekki/VI', jobs: 24, rating: 4.8, turnaround: '9m 05s', earnings: 162000, status: 'busy' as const },
  { id: 'insp-003', name: 'Chukwudi Eze', avatar: 'CE', zone: 'Abuja Central', jobs: 22, rating: 4.7, turnaround: '9m 45s', earnings: 148000, status: 'available' as const },
  { id: 'insp-004', name: 'Fatima Bello', avatar: 'FB', zone: 'Kano Metro', jobs: 19, rating: 4.6, turnaround: '10m 12s', earnings: 128000, status: 'available' as const },
  { id: 'insp-005', name: 'Olumide Adeyemi', avatar: 'OA', zone: 'Ibadan', jobs: 17, rating: 4.5, turnaround: '11m 30s', earnings: 114000, status: 'off-duty' as const },
  { id: 'insp-006', name: 'Ngozi Okafor', avatar: 'NO', zone: 'Port Harcourt', jobs: 16, rating: 4.4, turnaround: '10m 55s', earnings: 107000, status: 'busy' as const },
  { id: 'insp-007', name: 'Ibrahim Musa', avatar: 'IM', zone: 'Abuja Suburbs', jobs: 14, rating: 4.3, turnaround: '12m 10s', earnings: 94000, status: 'available' as const },
  { id: 'insp-008', name: 'Taiwo Ogundimu', avatar: 'TO', zone: 'Lagos Mainland', jobs: 13, rating: 4.2, turnaround: '12m 45s', earnings: 87000, status: 'off-duty' as const },
];

const RANK_COLORS = ['border-l-amber-400', 'border-l-gray-400', 'border-l-amber-700', 'border-l-transparent', 'border-l-transparent', 'border-l-transparent', 'border-l-transparent', 'border-l-transparent'];
const STATUS_CONFIG = {
  available: { label: 'Available', className: 'bg-green-50 text-green-700' },
  busy: { label: 'On Job', className: 'bg-amber-50 text-amber-700' },
  'off-duty': { label: 'Off Duty', className: 'bg-gray-100 text-gray-500' },
};

export default function InspectorLeaderboard() {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-amber-500" />
          <h2 className="text-base font-heading font-semibold text-[#1F2937]">Inspector Performance</h2>
          <span className="text-xs text-[#6B7280] bg-[#F4F6F8] px-2 py-0.5 rounded-full">This Month</span>
        </div>
        <Link href="/inspector-management" className="text-xs font-semibold text-[#2E75B6] hover:underline">View All Inspectors →</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F4F6F8] text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
              <th className="px-6 py-3 text-left w-12">Rank</th>
              <th className="px-4 py-3 text-left">Inspector</th>
              <th className="px-4 py-3 text-right">Jobs</th>
              <th className="px-4 py-3 text-right">Rating</th>
              <th className="px-4 py-3 text-right">Avg Turnaround</th>
              <th className="px-4 py-3 text-right">Earnings MTD</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F6F8]">
            {INSPECTORS.map((insp, idx) => (
              <tr key={insp.id} className={`hover:bg-[#F4F6F8]/70 transition-colors border-l-4 ${RANK_COLORS[idx]}`}>
                <td className="px-6 py-3">
                  <span className="text-sm font-bold text-[#6B7280] tabular-nums">#{idx + 1}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {insp.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1F2937]">{insp.name}</p>
                      <p className="text-[10px] text-[#6B7280]">{insp.zone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-bold text-[#1F2937] tabular-nums">{insp.jobs}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-sm font-semibold text-[#1F2937] tabular-nums">{insp.rating}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Clock size={12} className="text-[#6B7280]" />
                    <span className="text-sm text-[#1F2937] font-mono tabular-nums">{insp.turnaround}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-bold text-[#1F2937] tabular-nums">₦{insp.earnings.toLocaleString()}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_CONFIG[insp.status].className}`}>
                    {STATUS_CONFIG[insp.status].label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}