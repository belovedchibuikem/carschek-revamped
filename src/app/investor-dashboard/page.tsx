'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { TrendingUp, Download, Calendar, Users, Star, MapPin, DollarSign, Target } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';
import { useRechartsTheme } from '@/lib/charts/rechartsTheme';


// ─── Mock Data ────────────────────────────────────────────────────────────────
const monthlyData = [
  { month: 'May', inspections: 210, revenue: 18200000 },
  { month: 'Jun', inspections: 245, revenue: 21500000 },
  { month: 'Jul', inspections: 280, revenue: 24800000 },
  { month: 'Aug', inspections: 260, revenue: 22900000 },
  { month: 'Sep', inspections: 310, revenue: 27400000 },
  { month: 'Oct', inspections: 340, revenue: 30100000 },
  { month: 'Nov', inspections: 320, revenue: 28500000 },
  { month: 'Dec', inspections: 380, revenue: 33800000 },
  { month: 'Jan', inspections: 350, revenue: 31200000 },
  { month: 'Feb', inspections: 390, revenue: 34600000 },
  { month: 'Mar', inspections: 420, revenue: 37200000 },
  { month: 'Apr', inspections: 450, revenue: 40100000 },
];

const failurePoints = [
  { item: 'Engine Valve Cover Seal', rate: 67 },
  { item: 'Transmission Fluid Level', rate: 54 },
  { item: 'Front Brake Pads', rate: 48 },
  { item: 'Tyre Tread Depth', rate: 43 },
  { item: 'AC Compressor', rate: 38 },
  { item: 'Suspension Bushings', rate: 35 },
  { item: 'Battery Health', rate: 31 },
  { item: 'Exhaust System', rate: 28 },
  { item: 'Door Seals', rate: 24 },
  { item: 'Windshield Wipers', rate: 21 },
];

const forecastData = [
  { month: 'Apr', actual: 40100000, base: null, conservative: null, optimistic: null },
  { month: 'May', actual: null, base: 47300000, conservative: 43200000, optimistic: 52100000 },
  { month: 'Jun', actual: null, base: 55800000, conservative: 49600000, optimistic: 63400000 },
  { month: 'Jul', actual: null, base: 65800000, conservative: 57000000, optimistic: 77200000 },
  { month: 'Aug', actual: null, base: 77600000, conservative: 65500000, optimistic: 94000000 },
  { month: 'Sep', actual: null, base: 91500000, conservative: 75300000, optimistic: 114400000 },
];

const heatmapMakes = ['Toyota', 'Honda', 'Mercedes', 'BMW', 'Ford', 'Hyundai'];
const heatmapYears = ['2015', '2016', '2017', '2018', '2019', '2020', '2021'];
const heatmapData: Record<string, Record<string, number>> = {
  Toyota: { '2015': 45, '2016': 38, '2017': 34, '2018': 28, '2019': 22, '2020': 18, '2021': 12 },
  Honda: { '2015': 52, '2016': 44, '2017': 39, '2018': 33, '2019': 27, '2020': 21, '2021': 15 },
  Mercedes: { '2015': 68, '2016': 61, '2017': 55, '2018': 48, '2019': 41, '2020': 35, '2021': 28 },
  BMW: { '2015': 72, '2016': 65, '2017': 58, '2018': 51, '2019': 44, '2020': 38, '2021': 31 },
  Ford: { '2015': 58, '2016': 51, '2017': 46, '2018': 40, '2019': 34, '2020': 28, '2021': 22 },
  Hyundai: { '2015': 41, '2016': 35, '2017': 30, '2018': 25, '2019': 20, '2020': 16, '2021': 11 },
};

const zones = [
  { name: 'Lagos', inspections: 1840, inspectors: 22, color: '#1E3A5F' },
  { name: 'Abuja', inspections: 920, inspectors: 12, color: '#2E75B6' },
  { name: 'Port Harcourt', inspections: 580, inspectors: 8, color: '#1A7A4A' },
  { name: 'Ibadan', inspections: 340, inspectors: 4, color: '#D35400' },
  { name: 'Kano', inspections: 220, inspectors: 3, color: '#6B7280' },
  { name: 'Others', inspections: 334, inspectors: 8, color: '#9CA3AF' },
];

const funnel = [
  { stage: 'Listing Created', count: 1240, pct: 100 },
  { stage: 'Inspection Booked', count: 892, pct: 72 },
  { stage: 'Report Approved', count: 634, pct: 51 },
  { stage: 'Sale Completed', count: 287, pct: 23 },
];

// ─── Hero Metric Card ─────────────────────────────────────────────────────────
function MetricCard({ label, value, change, sub, icon: Icon, color }: {
  label: string; value: string; change?: string; sub?: string; icon: React.ElementType; color: string;
}) {
  const isPositive = change?.startsWith('+');
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
        {change && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-[#1F2937]">{value}</p>
      <p className="text-sm text-[#6B7280] mt-0.5">{label}</p>
      {sub && <p className="text-xs text-[#6B7280] mt-1">{sub}</p>}
    </div>
  );
}

// ─── Heatmap Cell ─────────────────────────────────────────────────────────────
function HeatCell({ value }: { value: number }) {
  const intensity = value / 100;
  const bg = `rgba(192, 57, 43, ${0.1 + intensity * 0.8})`;
  const textColor = intensity > 0.5 ? 'white' : '#1F2937';
  return (
    <div className="w-full h-9 rounded flex items-center justify-center text-xs font-bold cursor-pointer hover:ring-2 hover:ring-[#1E3A5F] transition-all"
      style={{ backgroundColor: bg, color: textColor }}
      title={`${value}% failure rate`}>
      {value}%
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function InvestorDashboardPage() {
  const chartTheme = useRechartsTheme();
  const [period, setPeriod] = useState('YTD');
  const [scenario, setScenario] = useState<'base' | 'conservative' | 'optimistic'>('base');
  const periods = ['MTD', 'QTD', 'YTD', 'Custom'];

  return (
    <AppLayout currentPath="/investor-dashboard">
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-[#1E3A5F] rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">Investor & Management Dashboard</h1>
            <p className="text-white/60 text-sm mt-0.5">Business performance, market intelligence & revenue forecasting</p>
          </div>
          <div className="flex items-center gap-2">
            {periods.map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${period === p ? 'bg-white text-[#1E3A5F]' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Hero metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard label="Total Inspections" value="4,234" change="+18% MoM" icon={Target} color="bg-[#1E3A5F]" />
          <MetricCard label="Gross Merchandise Value" value="₦287.4M" change="+22% MoM" icon={DollarSign} color="bg-[#2E75B6]" />
          <MetricCard label="Revenue" value="₦34.4M" change="+15% MoM" icon={TrendingUp} color="bg-[#1A7A4A]" />
          <MetricCard label="Active Inspectors" value="47" sub="+6 new this quarter" icon={Users} color="bg-[#D35400]" />
          <MetricCard label="Customer NPS" value="72" sub="Industry avg: 45" icon={Star} color="bg-purple-600" />
          <MetricCard label="Avg Carschek Score" value="68/100" icon={Target} color="bg-teal-600" />
        </div>

        {/* Growth chart */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-6">
          <h3 className="font-bold text-[#1F2937] mb-1">Growth Overview — Last 12 Months</h3>
          <p className="text-xs text-[#6B7280] mb-4">Inspection volume (bars) vs Revenue (line)</p>
          <div className="overflow-x-auto">
            <div className="min-w-[400px]">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyData} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStrokeAlt} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: chartTheme.tickFill }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10, fill: chartTheme.tickFill }} width={36} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={v => `₦${(v / 1000000).toFixed(0)}M`} tick={{ fontSize: 10, fill: chartTheme.tickFill }} width={44} />
                  <Tooltip formatter={(v: number, name: string) => name === 'revenue' ? `₦${v.toLocaleString()}` : v} contentStyle={chartTheme.tooltipContentStyle} />
                  <Legend wrapperStyle={{ ...chartTheme.legendWrapperStyle, fontSize: '11px' }} />
                  <Bar yAxisId="left" dataKey="inspections" name="Inspections" fill="#1E3A5F" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke="#1A7A4A" strokeWidth={2.5} dot={false} />
                  <ReferenceLine yAxisId="left" x="Oct" stroke="#D35400" strokeDasharray="4 4" label={{ value: 'Abuja Launch', position: 'top', fontSize: 9, fill: '#D35400' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Market Intelligence */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Failure points */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-6">
            <h3 className="font-bold text-[#1F2937] mb-1">Most Common Failure Points</h3>
            <p className="text-xs text-[#6B7280] mb-4">Top 10 most failed inspection items</p>
            <div className="space-y-2">
              {failurePoints.map((f, i) => (
                <div key={f.item} className="flex items-center gap-3">
                  <span className="text-xs text-[#6B7280] w-4 text-right flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-medium text-[#1F2937] truncate">{f.item}</span>
                      <span className={`text-xs font-bold ml-2 flex-shrink-0 ${f.rate > 50 ? 'text-[#C0392B]' : f.rate > 35 ? 'text-[#D35400]' : 'text-[#6B7280]'}`}>{f.rate}%</span>
                    </div>
                    <div className="h-1.5 bg-[#F4F6F8] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${f.rate > 50 ? 'bg-[#C0392B]' : f.rate > 35 ? 'bg-[#D35400]' : 'bg-[#6B7280]'}`} style={{ width: `${f.rate}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Failure rate heatmap */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-6">
            <h3 className="font-bold text-[#1F2937] mb-1">Failure Rate by Make & Year</h3>
            <p className="text-xs text-[#6B7280] mb-4">High-severity defect rate (%) — darker = higher failure</p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[360px]">
                <thead>
                  <tr>
                    <th className="text-left text-xs text-[#6B7280] font-semibold pb-2 pr-2">Make</th>
                    {heatmapYears.map(y => (
                      <th key={y} className="text-center text-xs text-[#6B7280] font-semibold pb-2 px-1">{y}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmapMakes.map(make => (
                    <tr key={make}>
                      <td className="text-xs font-semibold text-[#1F2937] pr-2 py-1 whitespace-nowrap">{make}</td>
                      {heatmapYears.map(year => (
                        <td key={year} className="px-1 py-1">
                          <HeatCell value={heatmapData[make][year]} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Geographic coverage */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-bold text-[#1F2937]">Geographic Coverage</h3>
              <p className="text-xs text-[#6B7280]">18 States covered · 47 Inspectors active</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#6B7280]">
              <MapPin size={14} className="text-[#C0392B]" /> Inspector locations
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {zones.map(z => (
              <div key={z.name} className="border border-[#E5E7EB] rounded-xl p-3 sm:p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-[#1F2937] text-sm">{z.name}</p>
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: z.color }} />
                </div>
                <p className="text-xl sm:text-2xl font-black text-[#1F2937]">{z.inspections.toLocaleString()}</p>
                <p className="text-xs text-[#6B7280]">inspections</p>
                <div className="mt-2 h-1.5 bg-[#F4F6F8] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(z.inspections / 1840) * 100}%`, backgroundColor: z.color }} />
                </div>
                <p className="text-xs text-[#6B7280] mt-1">{z.inspectors} inspectors</p>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue forecasting */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-bold text-[#1F2937]">Revenue Forecasting</h3>
              <p className="text-xs text-[#6B7280]">6-month forward projection · Based on 18% MoM growth rate</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['conservative', 'base', 'optimistic'] as const).map(s => (
                <button key={s} onClick={() => setScenario(s)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all min-h-[36px] ${scenario === s ? 'bg-[#1E3A5F] text-white' : 'bg-[#F4F6F8] text-[#6B7280] hover:bg-[#E5E7EB]'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[320px]">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStrokeAlt} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: chartTheme.tickFill }} />
                  <YAxis tickFormatter={v => `₦${(v / 1000000).toFixed(0)}M`} tick={{ fontSize: 10, fill: chartTheme.tickFill }} width={48} />
                  <Tooltip formatter={(v: number) => v ? `₦${v.toLocaleString()}` : '—'} contentStyle={chartTheme.tooltipContentStyle} />
                  <Legend wrapperStyle={{ ...chartTheme.legendWrapperStyle, fontSize: '11px' }} />
                  <Line type="monotone" dataKey="actual" name="Actual" stroke="#1E3A5F" strokeWidth={2.5} dot={{ r: 4 }} connectNulls={false} />
                  <Line type="monotone" dataKey={scenario} name={`${scenario.charAt(0).toUpperCase() + scenario.slice(1)} Forecast`}
                    stroke={scenario === 'optimistic' ? '#1A7A4A' : scenario === 'conservative' ? '#C0392B' : '#2E75B6'}
                    strokeWidth={2} strokeDasharray="6 3" dot={false} connectNulls={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-3 bg-[#F4F6F8] rounded-xl p-3">
            <p className="text-xs text-[#6B7280]">
              <strong className="text-[#1F2937]">Key Assumption:</strong> Based on current growth rate of 18% MoM.
              {scenario === 'conservative' && ' Conservative scenario assumes 10% MoM growth.'}
              {scenario === 'base' && ' Base scenario assumes 18% MoM growth.'}
              {scenario === 'optimistic' && ' Optimistic scenario assumes 25% MoM growth with Abuja expansion.'}
            </p>
          </div>
        </div>

        {/* Deal performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-6">
            <h3 className="font-bold text-[#1F2937] mb-4">Deal Performance</h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5">
              <div className="bg-[#F4F6F8] rounded-xl p-3 sm:p-4">
                <p className="text-xs text-[#6B7280] mb-1">Avg Deal Size</p>
                <p className="text-xl sm:text-2xl font-black text-[#1F2937]">₦4.85M</p>
              </div>
              <div className="bg-[#F4F6F8] rounded-xl p-3 sm:p-4">
                <p className="text-xs text-[#6B7280] mb-1">Avg Time to Sale</p>
                <p className="text-xl sm:text-2xl font-black text-[#1F2937]">23 days</p>
              </div>
            </div>
            {/* Conversion funnel */}
            <h4 className="text-sm font-semibold text-[#6B7280] mb-3">Conversion Funnel</h4>
            <div className="space-y-2">
              {funnel.map((f) => (
                <div key={f.stage}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-[#1F2937] truncate">{f.stage}</span>
                    <span className="text-xs font-bold text-[#1F2937] ml-2 flex-shrink-0">{f.count.toLocaleString()} ({f.pct}%)</span>
                  </div>
                  <div className="h-6 bg-[#F4F6F8] rounded-lg overflow-hidden">
                    <div className="h-full rounded-lg flex items-center px-2 transition-all"
                      style={{ width: `${f.pct}%`, background: `linear-gradient(90deg, #1E3A5F, #2E75B6)` }}>
                      {f.pct > 20 && <span className="text-white text-[10px] font-bold">{f.pct}%</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-6">
            <h3 className="font-bold text-[#1F2937] mb-4">Dealer vs. Private Seller</h3>
            <div className="overflow-x-auto">
              <div className="min-w-[280px]">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[
                    { type: 'Dealer', deals: 187, avgPrice: 5200000, conversion: 31 },
                    { type: 'Private', deals: 100, avgPrice: 3800000, conversion: 18 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStrokeAlt} />
                    <XAxis dataKey="type" tick={{ fontSize: 12, fill: chartTheme.tickFill }} />
                    <YAxis tick={{ fontSize: 10, fill: chartTheme.tickFill }} width={32} />
                    <Tooltip contentStyle={chartTheme.tooltipContentStyle} />
                    <Legend wrapperStyle={{ ...chartTheme.legendWrapperStyle, fontSize: '11px' }} />
                    <Bar dataKey="deals" name="Deals Closed" fill="#1E3A5F" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="conversion" name="Conversion %" fill="#2E75B6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] p-4 sm:p-5 flex flex-wrap gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 sm:px-5 py-3 bg-[#1E3A5F] text-white rounded-xl text-sm font-semibold hover:bg-[#2E75B6] transition-colors min-h-[48px]">
            <Download size={16} /> Export PDF Report
          </button>
          <button
            onClick={() => {
              const subject = encodeURIComponent('Carschek Investor Report — Scheduled');
              const body = encodeURIComponent('Please schedule automated investor reports.\n\nReport URL: https://carschek.com/investor-dashboard');
              window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
            }}
            className="flex items-center gap-2 px-4 sm:px-5 py-3 bg-white border border-[#E5E7EB] text-[#1F2937] rounded-xl text-sm font-semibold hover:bg-[#F4F6F8] transition-colors min-h-[48px]">
            <Calendar size={16} /> <span className="hidden sm:inline">Schedule Automated Report</span><span className="sm:hidden">Schedule</span>
          </button>
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent('Carschek Data Room Export\nGenerated: ' + new Date().toISOString() + '\n\nTotal Inspections: 4,234\nGross Merchandise Value: ₦287,450,000\nRevenue: ₦34,450,000\nActive Inspectors: 47\nNPS: 72\nAvg Carschek Score: 68/100');
              link.download = 'carschek-data-room-export.txt';
              link.click();
            }}
            className="flex items-center gap-2 px-4 sm:px-5 py-3 bg-white border border-[#E5E7EB] text-[#1F2937] rounded-xl text-sm font-semibold hover:bg-[#F4F6F8] transition-colors min-h-[48px]">
            <Download size={16} /> <span className="hidden sm:inline">Data Room Export (ZIP)</span><span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
