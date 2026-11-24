'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Download, Calendar, Users, Star, MapPin, DollarSign, Target } from 'lucide-react';
import { useRechartsTheme } from '@/lib/charts/rechartsTheme';
import { dashboardApi } from '@/lib/api/services';
import { useApiResource } from '@/hooks/useApiResource';

function isoDate(d: Date) {
  const z = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

function formatNaira(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `₦${(value / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `₦${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `₦${Math.round(value / 1_000).toLocaleString()}K`;
  return `₦${Math.round(value).toLocaleString()}`;
}

function formatChange(pct: number | null | undefined): string | undefined {
  if (pct === null || pct === undefined || Number.isNaN(pct)) return undefined;
  const rounded = Math.round(pct * 10) / 10;
  return `${rounded > 0 ? '+' : ''}${rounded}% vs prior`;
}

const ZONE_COLORS = ['#ff5722', '#ff8a65', '#1A7A4A', '#D35400', '#6B7280', '#9CA3AF'];

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

function HeatCell({ value }: { value: number }) {
  const intensity = value / 100;
  const bg = `rgba(192, 57, 43, ${0.1 + intensity * 0.8})`;
  const textColor = intensity > 0.5 ? 'white' : '#1F2937';
  return (
    <div className="w-full h-9 rounded flex items-center justify-center text-xs font-bold cursor-pointer hover:ring-2 hover:ring-[#ff5722] transition-all"
      style={{ backgroundColor: bg, color: textColor }}
      title={`${value}% failure rate`}>
      {value}%
    </div>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-[#6B7280] py-8 text-center">{children}</p>;
}

export default function InvestorDashboardPage() {
  const chartTheme = useRechartsTheme();
  const [period, setPeriod] = useState('YTD');
  const [scenario, setScenario] = useState<'base' | 'conservative' | 'optimistic'>('base');
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return isoDate(d);
  });
  const [to, setTo] = useState(() => isoDate(new Date()));
  const periods = ['MTD', 'QTD', 'YTD', 'Custom'];

  const { data, loading, error, refresh } = useApiResource(
    () => dashboardApi.investor({
      period,
      from: period === 'Custom' ? from : undefined,
      to: period === 'Custom' ? to : undefined,
    }),
    [period, period === 'Custom' ? from : '', period === 'Custom' ? to : ''],
  );

  const metrics = data?.metrics;
  const monthly = data?.monthly ?? [];
  const failurePoints = data?.failure_points ?? [];
  const heatmap = data?.heatmap ?? { makes: [], years: [], cells: {} };
  const zones = data?.zones ?? [];
  const zoneMax = Math.max(1, ...zones.map(z => z.inspections));
  const forecast = data?.forecast.points ?? [];
  const deals = data?.deals;
  const funnel = deals?.funnel ?? [];
  const sellers = deals?.sellers ?? [];

  const exportText = () => {
    const m = metrics;
    return [
      'Carschek Data Room Export',
      `Generated: ${new Date().toISOString()}`,
      `Period: ${data?.period ?? period} (${data?.from ?? ''} to ${data?.to ?? ''})`,
      '',
      `Total Inspections: ${m?.inspections ?? 0}`,
      `Gross Merchandise Value: ${m ? formatNaira(m.gmv) : '—'}`,
      `Revenue: ${m ? formatNaira(m.revenue) : '—'}`,
      `Active Inspectors: ${m?.active_inspectors ?? 0}`,
      `NPS: ${m?.nps ?? 'No survey responses'}`,
      `Avg Carschek Score: ${m?.avg_score ?? '—'}/100`,
    ].join('\n');
  };

  return (
    <AppLayout currentPath="/investor-dashboard">
      <div className="space-y-8">
        <div className="bg-[#ff5722] rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">Investor & Management Dashboard</h1>
            <p className="text-white/60 text-sm mt-0.5">Business performance, market intelligence & revenue forecasting</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {periods.map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${period === p ? 'bg-white text-[#ff5722]' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {period === 'Custom' && (
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-[#6B7280]">From
              <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="ml-2 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937]" />
            </label>
            <label className="text-sm text-[#6B7280]">To
              <input type="date" value={to} onChange={e => setTo(e.target.value)} className="ml-2 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937]" />
            </label>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center justify-between gap-3">
            <span>{error}</span>
            <button onClick={() => void refresh()} className="font-semibold underline">Retry</button>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard label="Total Inspections" value={loading && !metrics ? '…' : (metrics?.inspections ?? 0).toLocaleString()} change={formatChange(metrics?.inspections_change_pct)} icon={Target} color="bg-[#ff5722]" />
          <MetricCard label="Gross Merchandise Value" value={loading && !metrics ? '…' : formatNaira(metrics?.gmv ?? 0)} change={formatChange(metrics?.gmv_change_pct)} icon={DollarSign} color="bg-[#ff8a65]" />
          <MetricCard label="Revenue" value={loading && !metrics ? '…' : formatNaira(metrics?.revenue ?? 0)} change={formatChange(metrics?.revenue_change_pct)} icon={TrendingUp} color="bg-[#1A7A4A]" />
          <MetricCard label="Active Inspectors" value={loading && !metrics ? '…' : String(metrics?.active_inspectors ?? 0)} sub={metrics ? `${metrics.new_inspectors_quarter} new this quarter` : undefined} icon={Users} color="bg-[#D35400]" />
          <MetricCard label="Customer NPS" value={metrics?.nps == null ? '—' : String(metrics.nps)} sub={metrics && metrics.nps == null ? 'No survey responses stored' : undefined} icon={Star} color="bg-purple-600" />
          <MetricCard label="Avg Carschek Score" value={metrics?.avg_score == null ? '—' : `${metrics.avg_score}/100`} icon={Target} color="bg-teal-600" />
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-6">
          <h3 className="font-bold text-[#1F2937] mb-1">Growth Overview — {data?.bucket === 'day' ? 'Daily' : 'By month'}</h3>
          <p className="text-xs text-[#6B7280] mb-4">Inspection volume (bars) vs {data?.revenue_source === 'invoices' ? 'paid invoice' : 'recorded sale'} revenue (line)</p>
          {monthly.length === 0 ? <EmptyNote>No activity in this period.</EmptyNote> : (
            <div className="overflow-x-auto">
              <div className="min-w-[400px]">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={monthly} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStrokeAlt} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: chartTheme.tickFill }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10, fill: chartTheme.tickFill }} width={36} />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={v => formatNaira(Number(v))} tick={{ fontSize: 10, fill: chartTheme.tickFill }} width={52} />
                    <Tooltip formatter={(v: number, name: string) => name === 'revenue' ? formatNaira(v) : v} contentStyle={chartTheme.tooltipContentStyle} />
                    <Legend wrapperStyle={{ ...chartTheme.legendWrapperStyle, fontSize: '11px' }} />
                    <Bar yAxisId="left" dataKey="inspections" name="Inspections" fill="#ff5722" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke="#1A7A4A" strokeWidth={2.5} dot={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-6">
            <h3 className="font-bold text-[#1F2937] mb-1">Most Common Failure Points</h3>
            <p className="text-xs text-[#6B7280] mb-4">Top failed inspection items in this period</p>
            {failurePoints.length === 0 ? <EmptyNote>No failed inspection items in this period.</EmptyNote> : (
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
                        <div className={`h-full rounded-full ${f.rate > 50 ? 'bg-[#C0392B]' : f.rate > 35 ? 'bg-[#D35400]' : 'bg-[#6B7280]'}`} style={{ width: `${Math.min(f.rate, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-6">
            <h3 className="font-bold text-[#1F2937] mb-1">Failure Rate by Make & Year</h3>
            <p className="text-xs text-[#6B7280] mb-4">Share of checklist items marked not OK — darker = higher failure</p>
            {heatmap.makes.length === 0 ? <EmptyNote>No make and year defect data in this period.</EmptyNote> : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[360px]">
                  <thead>
                    <tr>
                      <th className="text-left text-xs text-[#6B7280] font-semibold pb-2 pr-2">Make</th>
                      {heatmap.years.map(y => (
                        <th key={y} className="text-center text-xs text-[#6B7280] font-semibold pb-2 px-1">{y}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {heatmap.makes.map(make => (
                      <tr key={make}>
                        <td className="text-xs font-semibold text-[#1F2937] pr-2 py-1 whitespace-nowrap">{make}</td>
                        {heatmap.years.map(year => (
                          <td key={year} className="px-1 py-1">
                            <HeatCell value={heatmap.cells[make]?.[year] ?? 0} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-bold text-[#1F2937]">Geographic Coverage</h3>
              <p className="text-xs text-[#6B7280]">{data?.state_count ?? 0} locations · {metrics?.active_inspectors ?? 0} inspectors active · {data?.zones_label ?? ''}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#6B7280]">
              <MapPin size={14} className="text-[#C0392B]" /> {data?.zones_label ?? 'Locations'}
            </div>
          </div>
          {zones.length === 0 ? <EmptyNote>No location data in this period.</EmptyNote> : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {zones.map((z, i) => (
                <div key={z.name} className="border border-[#E5E7EB] rounded-xl p-3 sm:p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-[#1F2937] text-sm">{z.name}</p>
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: ZONE_COLORS[i % ZONE_COLORS.length] }} />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-[#1F2937]">{z.inspections.toLocaleString()}</p>
                  <p className="text-xs text-[#6B7280]">records</p>
                  <div className="mt-2 h-1.5 bg-[#F4F6F8] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(z.inspections / zoneMax) * 100}%`, backgroundColor: ZONE_COLORS[i % ZONE_COLORS.length] }} />
                  </div>
                  <p className="text-xs text-[#6B7280] mt-1">{z.inspectors} inspectors</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-bold text-[#1F2937]">Revenue Forecasting</h3>
              <p className="text-xs text-[#6B7280]">Forward projection from recorded monthly revenue</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['conservative', 'base', 'optimistic'] as const).map(s => (
                <button key={s} onClick={() => setScenario(s)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all min-h-[36px] ${scenario === s ? 'bg-[#ff5722] text-white' : 'bg-[#F4F6F8] text-[#6B7280] hover:bg-[#E5E7EB]'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          {forecast.length === 0 ? <EmptyNote>No revenue history to chart.</EmptyNote> : (
            <div className="overflow-x-auto">
              <div className="min-w-[320px]">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={forecast}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStrokeAlt} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: chartTheme.tickFill }} />
                    <YAxis tickFormatter={v => formatNaira(Number(v))} tick={{ fontSize: 10, fill: chartTheme.tickFill }} width={52} />
                    <Tooltip formatter={(v: number) => v ? formatNaira(v) : '—'} contentStyle={chartTheme.tooltipContentStyle} />
                    <Legend wrapperStyle={{ ...chartTheme.legendWrapperStyle, fontSize: '11px' }} />
                    <Line type="monotone" dataKey="actual" name="Actual" stroke="#ff5722" strokeWidth={2.5} dot={{ r: 4 }} connectNulls={false} />
                    <Line type="monotone" dataKey={scenario} name={`${scenario.charAt(0).toUpperCase() + scenario.slice(1)} Forecast`}
                      stroke={scenario === 'optimistic' ? '#1A7A4A' : scenario === 'conservative' ? '#C0392B' : '#ff8a65'}
                      strokeWidth={2} strokeDasharray="6 3" dot={false} connectNulls={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          <div className="mt-3 bg-[#F4F6F8] rounded-xl p-3">
            <p className="text-xs text-[#6B7280]">
              {data?.forecast.growth_rate == null
                ? 'Not enough month-to-month revenue to project a forecast.'
                : `Observed average change is ${data.forecast.growth_rate}% per month. Conservative uses half of that rate. Optimistic adds 7 points.`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-6">
            <h3 className="font-bold text-[#1F2937] mb-4">Deal Performance</h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5">
              <div className="bg-[#F4F6F8] rounded-xl p-3 sm:p-4">
                <p className="text-xs text-[#6B7280] mb-1">Avg Deal Size</p>
                <p className="text-xl sm:text-2xl font-black text-[#1F2937]">{deals?.avg_size == null ? '—' : formatNaira(deals.avg_size)}</p>
              </div>
              <div className="bg-[#F4F6F8] rounded-xl p-3 sm:p-4">
                <p className="text-xs text-[#6B7280] mb-1">Avg Time to Sale</p>
                <p className="text-xl sm:text-2xl font-black text-[#1F2937]">{deals?.avg_days_to_sale == null ? '—' : `${deals.avg_days_to_sale} days`}</p>
              </div>
            </div>
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
                      style={{ width: `${Math.min(f.pct, 100)}%`, background: `linear-gradient(90deg, #ff5722, #ff8a65)` }}>
                      {f.pct > 20 && <span className="text-white text-[10px] font-bold">{f.pct}%</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-6">
            <h3 className="font-bold text-[#1F2937] mb-4">Dealer vs. Private Seller</h3>
            {sellers.length === 0 ? <EmptyNote>No seller contacts in this period.</EmptyNote> : (
              <div className="overflow-x-auto">
                <div className="min-w-[280px]">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={sellers}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStrokeAlt} />
                      <XAxis dataKey="type" tick={{ fontSize: 12, fill: chartTheme.tickFill }} />
                      <YAxis tick={{ fontSize: 10, fill: chartTheme.tickFill }} width={32} />
                      <Tooltip contentStyle={chartTheme.tooltipContentStyle} />
                      <Legend wrapperStyle={{ ...chartTheme.legendWrapperStyle, fontSize: '11px' }} />
                      <Bar dataKey="deals" name="Deals Closed" fill="#ff5722" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="conversion" name="Conversion %" fill="#ff8a65" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] p-4 sm:p-5 flex flex-wrap gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 sm:px-5 py-3 bg-[#ff5722] text-white rounded-xl text-sm font-semibold hover:bg-[#ff8a65] transition-colors min-h-[48px]">
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
              link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(exportText());
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
