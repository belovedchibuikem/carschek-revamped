'use client';
import React from 'react';
import { TrendingUp } from 'lucide-react';

const FUNNEL = [
  { id: 'funnel-lead', stage: 'Lead', count: 284, pct: 100, color: '#ff5722' },
  { id: 'funnel-booking', stage: 'Booking', count: 198, pct: 69.7, color: '#ff8a65' },
  { id: 'funnel-inspection', stage: 'Inspection', count: 167, pct: 58.8, color: '#1A7A4A' },
  { id: 'funnel-report', stage: 'Report Delivered', count: 142, pct: 50.0, color: '#D35400' },
  { id: 'funnel-deal', stage: 'Deal Closed', count: 89, pct: 31.3, color: '#C0392B' },
];

export default function DealFunnel() {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp size={18} className="text-[#ff8a65]" />
        <h2 className="text-base font-heading font-semibold text-[#1F2937]">Deal Conversion Funnel</h2>
        <span className="text-xs text-[#6B7280] bg-[#F4F6F8] px-2 py-0.5 rounded-full">This Month</span>
      </div>
      <div className="space-y-3">
        {FUNNEL?.map((stage, idx) => (
          <div key={stage?.id}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#1F2937]">{stage?.stage}</span>
                {idx > 0 && (
                  <span className="text-[10px] text-[#6B7280]">
                    ({((stage?.count / FUNNEL?.[idx - 1]?.count) * 100)?.toFixed(0)}% from prev)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold tabular-nums text-[#1F2937]">{stage?.count}</span>
                <span className="text-[10px] text-[#6B7280] tabular-nums w-10 text-right">{stage?.pct?.toFixed(1)}%</span>
              </div>
            </div>
            <div className="h-7 bg-[#F4F6F8] rounded-lg overflow-hidden">
              <div
                className="h-full rounded-lg flex items-center pl-3 transition-all duration-700"
                style={{ width: `${stage?.pct}%`, backgroundColor: stage?.color }}
              >
                <span className="text-[10px] text-white font-semibold truncate">{stage?.stage}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 bg-[#F4F6F8] rounded-lg">
        <p className="text-xs text-[#6B7280]">Overall conversion: <span className="font-bold text-[#ff5722]">31.3%</span> Lead → Deal Closed</p>
      </div>
    </div>
  );
}