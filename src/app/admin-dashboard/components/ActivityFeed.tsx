'use client';
import React from 'react';
import { Activity, ClipboardList, CheckCircle, UserPlus, AlertTriangle, Star } from 'lucide-react';

const ACTIVITIES = [
  { id: 'act-001', icon: ClipboardList, color: 'text-[#2E75B6] bg-blue-50', text: 'Order #ORD-1892 assigned to Emeka Okonkwo', time: '2m ago', actor: 'EO' },
  { id: 'act-002', icon: CheckCircle, color: 'text-[#1A7A4A] bg-green-50', text: 'Report #RPT-445 approved — sent to customer', time: '8m ago', actor: 'PN' },
  { id: 'act-003', icon: AlertTriangle, color: 'text-[#D35400] bg-amber-50', text: 'Order #ORD-1887 approaching SLA — 45m remaining', time: '12m ago', actor: 'SYS' },
  { id: 'act-004', icon: UserPlus, color: 'text-purple-600 bg-purple-50', text: 'New booking from Adaeze Mbah — Lekki Phase 1', time: '18m ago', actor: 'SYS' },
  { id: 'act-005', icon: Star, color: 'text-amber-500 bg-amber-50', text: 'Adaora Nwosu received 5-star review from Tunde Babs', time: '35m ago', actor: 'SYS' },
  { id: 'act-006', icon: CheckCircle, color: 'text-[#1A7A4A] bg-green-50', text: 'Deal #DL-089 closed — ₦5,200,000 — Toyota Camry 2019', time: '1h ago', actor: 'CO' },
  { id: 'act-007', icon: AlertTriangle, color: 'text-[#C0392B] bg-red-50', text: 'Report #RPT-441 rejected — corrections requested', time: '1h 20m ago', actor: 'PN' },
  { id: 'act-008', icon: ClipboardList, color: 'text-[#2E75B6] bg-blue-50', text: 'Bulk import: 12 new orders from CarDealerNG', time: '2h ago', actor: 'SYS' },
];

export default function ActivityFeed() {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-[#2E75B6]" />
          <h2 className="text-base font-heading font-semibold text-[#1F2937]">Recent Activity</h2>
        </div>
        <button className="text-xs font-semibold text-[#2E75B6] hover:underline">View all →</button>
      </div>
      <div className="space-y-3">
        {ACTIVITIES?.map(act => (
          <div key={act?.id} className="flex items-start gap-3 group">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${act?.color}`}>
              <act.icon size={13} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#1F2937] leading-relaxed">{act?.text}</p>
              <p className="text-[10px] text-[#6B7280] mt-0.5">{act?.time}</p>
            </div>
            <div className="w-5 h-5 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0 opacity-60">
              {act?.actor}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}