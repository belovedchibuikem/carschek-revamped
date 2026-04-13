'use client';
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign } from 'lucide-react';

const DATA = {
  'this-month': [
    { name: 'Inspection Fees', value: 1420000, color: '#1E3A5F' },
    { name: 'Sales Commission', value: 680000, color: '#2E75B6' },
    { name: 'Loan Referral', value: 240000, color: '#1A7A4A' },
    { name: 'Re-inspection', value: 110000, color: '#D35400' },
  ],
  'last-month': [
    { name: 'Inspection Fees', value: 1280000, color: '#1E3A5F' },
    { name: 'Sales Commission', value: 590000, color: '#2E75B6' },
    { name: 'Loan Referral', value: 195000, color: '#1A7A4A' },
    { name: 'Re-inspection', value: 95000, color: '#D35400' },
  ],
  'this-quarter': [
    { name: 'Inspection Fees', value: 4100000, color: '#1E3A5F' },
    { name: 'Sales Commission', value: 1950000, color: '#2E75B6' },
    { name: 'Loan Referral', value: 720000, color: '#1A7A4A' },
    { name: 'Re-inspection', value: 310000, color: '#D35400' },
  ],
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number } }> }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-[#1F2937] mb-1">{d.name}</p>
      <p className="text-[#2E75B6] font-bold">₦{(d.value / 1000000).toFixed(2)}M</p>
    </div>
  );
};

export default function RevenueBreakdownChart() {
  const [period, setPeriod] = useState<'this-month' | 'last-month' | 'this-quarter'>('this-month');
  const data = DATA[period];

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <DollarSign size={18} className="text-[#2E75B6]" />
          <h2 className="text-base font-heading font-semibold text-[#1F2937]">Revenue Breakdown</h2>
        </div>
        <select
          value={period}
          onChange={e => setPeriod(e.target.value as typeof period)}
          className="text-xs border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/20"
        >
          <option value="this-month">This Month</option>
          <option value="last-month">Last Month</option>
          <option value="this-quarter">This Quarter</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 60, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={false} tickFormatter={v => `₦${(v / 1000000).toFixed(1)}M`} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} tickLine={false} axisLine={false} width={110} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} label={{ position: 'right', formatter: (v: number) => `₦${(v / 1000000).toFixed(2)}M`, fontSize: 10, fill: '#6B7280' }}>
            {data.map(entry => <Cell key={`cell-rev-${entry.name}`} fill={entry.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}