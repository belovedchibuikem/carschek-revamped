'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname } from 'next/navigation';
import { Download } from 'lucide-react';

import { AreaChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';
import { useRechartsTheme } from '@/lib/charts/rechartsTheme';

const GMV_DATA = Array.from({ length: 12 }, (_, i) => ({
  month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
  gmv: 20000000 + ((i * 3_791_123 + 11) % 48000000),
  inspections: 50 + ((i * 17 + 5) % 95),
}));

const GEO_DATA = [
  { name: 'Lagos', value: 45, color: '#1E3A5F' },
  { name: 'Abuja', value: 28, color: '#2E75B6' },
  { name: 'Port Harcourt', value: 18, color: '#1A7A4A' },
  { name: 'Ibadan', value: 12, color: '#D35400' },
  { name: 'Kano', value: 8, color: '#C0392B' },
];

export default function AnalyticsPage() {
  const pathname = usePathname();
  const chartTheme = useRechartsTheme();

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Analytics</h1>
            <p className="text-sm text-[#6B7280]">Investor & management analytics dashboard</p>
          </div>
          <button onClick={() => toast.success('Investor report PDF generating…')} className="flex items-center gap-2 px-4 py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F] transition-all">
            <Download size={15} /> Export Investor Report
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total GMV', value: '₦284M', sub: 'YTD 2026', color: '#1E3A5F' },
            { label: 'Inspections', value: '1,247', sub: 'YTD 2026', color: '#2E75B6' },
            { label: 'Avg Deal Size', value: '₦8.2M', sub: 'Per transaction', color: '#1A7A4A' },
            { label: 'NPS Score', value: '72', sub: 'Customer satisfaction', color: '#D35400' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <p className="text-2xl font-heading font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
              <p className="text-sm font-medium text-[#1F2937] mt-1">{kpi.label}</p>
              <p className="text-xs text-[#9CA3AF]">{kpi.sub}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <h2 className="text-base font-heading font-semibold text-[#1F2937] mb-4">GMV & Inspection Volume (2026)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={GMV_DATA}>
              <defs>
                <linearGradient id="gmv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1E3A5F" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1E3A5F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: chartTheme.tickFill }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: chartTheme.tickFill }} tickLine={false} axisLine={false} tickFormatter={v => `₦${(v / 1000000).toFixed(0)}M`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: chartTheme.tickFill }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={chartTheme.tooltipContentStyle} />
              <Legend wrapperStyle={chartTheme.legendWrapperStyle} />
              <Area yAxisId="left" type="monotone" dataKey="gmv" stroke="#1E3A5F" strokeWidth={2} fill="url(#gmv)" name="GMV (₦)" />
              <Bar yAxisId="right" dataKey="inspections" fill="#2E75B6" opacity={0.6} name="Inspections" radius={[4, 4, 0, 0]} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <h2 className="text-base font-heading font-semibold text-[#1F2937] mb-4">Geographic Coverage</h2>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={GEO_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {GEO_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v}%`} contentStyle={chartTheme.tooltipContentStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {GEO_DATA.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-sm text-[#1F2937]">{d.name}</span>
                    <span className="text-sm font-semibold text-[#1F2937] ml-auto">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <h2 className="text-base font-heading font-semibold text-[#1F2937] mb-4">Revenue Forecast</h2>
            <div className="space-y-3">
              {[
                { label: 'Q2 2026 Forecast', value: '₦38M', confidence: 85, color: '#1A7A4A' },
                { label: 'Q3 2026 Forecast', value: '₦52M', confidence: 72, color: '#2E75B6' },
                { label: 'Q4 2026 Forecast', value: '₦68M', confidence: 61, color: '#D35400' },
              ].map(f => (
                <div key={f.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#1F2937]">{f.label}</span>
                    <span className="text-sm font-bold" style={{ color: f.color }}>{f.value}</span>
                  </div>
                  <div className="h-2 bg-[#F4F6F8] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${f.confidence}%`, backgroundColor: f.color }} />
                  </div>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">{f.confidence}% confidence</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
