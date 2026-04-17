'use client';
import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Users, Star } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { useRechartsTheme } from '@/lib/charts/rechartsTheme';

function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return val;
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80; const h = 32;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const SPARKLINES = {
  inspections: [22, 35, 28, 41, 38, 45, 47],
  pending: [8, 12, 9, 15, 11, 14, 9],
  revenue: [1800000, 2100000, 1950000, 2300000, 2150000, 2400000, 2450000],
  inspectors: [9, 10, 11, 10, 13, 12, 11],
};

export default function DashboardKPIs() {
  const t = useRechartsTheme();
  const inspections = useCountUp(47);
  const pending = useCountUp(9);
  const scoreVal = useCountUp(78);

  const formatNaira = (v: number) => `₦${(v / 1000000).toFixed(2)}M`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
      {/* Total Inspections Today */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Inspections Today</p>
          <span className="flex items-center gap-1 text-[10px] font-semibold text-[#1A7A4A] bg-green-50 px-2 py-0.5 rounded-full">
            <TrendingUp size={10} /> +12%
          </span>
        </div>
        <p className="text-4xl font-heading font-bold text-[#1F2937] tabular-nums animate-count-up">{inspections}</p>
        <p className="text-xs text-[#6B7280] mt-1">vs 42 yesterday</p>
        <div className="mt-3">
          <Sparkline data={SPARKLINES.inspections} color="#1A7A4A" />
        </div>
      </div>

      {/* Pending Orders */}
      <div className="bg-white rounded-xl border border-amber-200 p-5 shadow-sm hover:shadow-md transition-shadow bg-amber-50/30">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Pending Orders</p>
          <AlertTriangle size={16} className="text-[#D35400]" />
        </div>
        <p className="text-4xl font-heading font-bold text-[#D35400] tabular-nums animate-count-up">{pending}</p>
        <p className="text-xs text-[#D35400] mt-1 font-medium">Needs attention</p>
        <div className="mt-3">
          <Sparkline data={SPARKLINES.pending} color="#D35400" />
        </div>
      </div>

      {/* Revenue MTD */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Revenue MTD</p>
          <span className="flex items-center gap-1 text-[10px] font-semibold text-[#1A7A4A] bg-green-50 px-2 py-0.5 rounded-full">
            <TrendingUp size={10} /> +8.4%
          </span>
        </div>
        <p className="text-3xl font-heading font-bold text-[#1F2937] tabular-nums">{formatNaira(2450000)}</p>
        <div className="mt-2">
          <div className="flex items-center justify-between text-[10px] text-[#6B7280] mb-1">
            <span>Target: ₦3.5M</span><span>70%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#1A7A4A] rounded-full" style={{ width: '70%' }} />
          </div>
        </div>
        <div className="mt-2">
          <Sparkline data={SPARKLINES.revenue.map(v => v / 100000)} color="#2E75B6" />
        </div>
      </div>

      {/* Active Inspectors */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Active Inspectors</p>
          <Users size={16} className="text-[#2E75B6]" />
        </div>
        <p className="text-4xl font-heading font-bold text-[#1F2937] tabular-nums">11<span className="text-xl text-[#6B7280] font-normal">/15</span></p>
        <p className="text-xs text-[#6B7280] mt-1">4 off duty today</p>
        <div className="flex gap-1 mt-3 flex-wrap">
          {Array.from({ length: 15 }, (_, i) => (
            <div key={`inspector-dot-${i}`} className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white ${i < 11 ? 'bg-[#1A7A4A]' : 'bg-gray-200'}`}>
              {i < 11 ? '●' : ''}
            </div>
          ))}
        </div>
      </div>

      {/* Avg Carschek Score */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-1">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Avg Carschek Score</p>
          <Star size={16} className="text-amber-400 fill-amber-400" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-16 w-16">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="100%" data={[{ value: scoreVal, fill: scoreVal >= 71 ? '#1A7A4A' : scoreVal >= 41 ? '#D35400' : '#C0392B' }]} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={4} background={{ fill: t.gridStrokeAlt }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="text-3xl font-heading font-bold text-[#1F2937] tabular-nums">{scoreVal}</p>
            <p className="text-xs text-[#1A7A4A] font-medium">Good</p>
            <p className="text-[10px] text-[#6B7280]">out of 100</p>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-1 text-[10px] text-[#6B7280]">
          <TrendingDown size={10} className="text-[#C0392B]" />
          <span className="text-[#C0392B]">-2.1 pts vs last week</span>
        </div>
      </div>
    </div>
  );
}