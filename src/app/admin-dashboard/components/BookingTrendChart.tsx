'use client';
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar } from 'lucide-react';
import { useRechartsTheme } from '@/lib/charts/rechartsTheme';

const generateData = (days: number) => {
  const result = [];
  const now = new Date('2026-04-10');
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short' });
    const booked = 30 + ((i * 17 + days) % 28) + (i % 7 < 2 ? -10 : 0);
    const completed = Math.floor(booked * (0.72 + ((i * 3) % 20) / 100));
    result.push({ date: label, booked, completed });
  }
  return result;
};

const DATASETS: Record<string, ReturnType<typeof generateData>> = {
  '7d': generateData(7),
  '30d': generateData(30),
  '90d': generateData(90),
};

export default function BookingTrendChart() {
  const t = useRechartsTheme();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const data = DATASETS[period];

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={t.tooltipContentStyle} className="rounded-xl shadow-lg p-3 text-xs">
        <p className="font-semibold mb-2" style={{ color: t.tooltipContentStyle.color }}>{label}</p>
        {payload.map(p => (
          <div key={`tooltip-${p.name}`} className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span style={{ color: t.tickFillMuted }}>{p.name}:</span>
            <span className="font-semibold" style={{ color: t.tooltipContentStyle.color }}>{p.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-[#2E75B6]" />
          <h2 className="text-base font-heading font-semibold text-[#1F2937]">Inspection Bookings</h2>
        </div>
        <div className="flex gap-1 bg-[#F4F6F8] p-1 rounded-lg">
          {(['7d', '30d', '90d'] as const).map(p => (
            <button
              key={`period-${p}`}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all min-h-[32px] ${period === p ? 'bg-white text-[#1E3A5F] shadow-sm' : 'text-[#6B7280] hover:text-[#1F2937]'}`}
            >
              {p === '7d' ? '7D' : p === '30d' ? '30D' : '90D'}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[300px]">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradBooked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1E3A5F" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1E3A5F" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1A7A4A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1A7A4A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={t.gridStroke} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: t.tickFill }} tickLine={false} axisLine={false} interval={period === '90d' ? 9 : period === '30d' ? 4 : 0} />
              <YAxis tick={{ fontSize: 10, fill: t.tickFill }} tickLine={false} axisLine={false} width={28} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ ...t.legendWrapperStyle, fontSize: '11px', paddingTop: '12px' }} />
              <Area type="monotone" dataKey="booked" name="Booked" stroke="#1E3A5F" strokeWidth={2} fill="url(#gradBooked)" />
              <Area type="monotone" dataKey="completed" name="Completed" stroke="#1A7A4A" strokeWidth={2} fill="url(#gradCompleted)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}