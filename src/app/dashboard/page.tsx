'use client';
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { TrendingUp, TrendingDown, ArrowRight, Users, ClipboardList, DollarSign, Star, MapPin, Activity, ChevronRight, Zap } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell
} from 'recharts';
import { formatNaira, getScoreColor } from '@/lib/mockData';

const BOOKING_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: `Apr ${i + 1}`,
  booked: Math.floor(Math.random() * 15) + 5,
  completed: Math.floor(Math.random() * 12) + 3,
}));

const REVENUE_DATA = [
  { name: 'Inspection Fees', value: 4200000, color: '#1E3A5F' },
  { name: 'Marketplace Commission', value: 3100000, color: '#2E75B6' },
  { name: 'Auction Fees', value: 2800000, color: '#1A7A4A' },
  { name: 'B2B Services', value: 2350000, color: '#D35400' },
];

const LEADERBOARD = [
  { rank: 1, name: 'Emeka Okonkwo', jobs: 142, score: 81, zone: 'Lagos Island', avatar: 'EO' },
  { rank: 2, name: 'Chidinma Eze', jobs: 98, score: 85, zone: 'Abuja', avatar: 'CE' },
  { rank: 3, name: 'Ngozi Obi', jobs: 115, score: 82, zone: 'Port Harcourt', avatar: 'NO' },
  { rank: 4, name: 'Seun Afolabi', jobs: 89, score: 79, zone: 'Ibadan', avatar: 'SA' },
  { rank: 5, name: 'Babatunde Adeyemi', jobs: 67, score: 77, zone: 'Lagos Island', avatar: 'BA' },
];

const ACTIVITY = [
  { icon: '📋', text: 'Order ORD-1892 moved to QA Review', time: '2m ago', link: '/orders/ORD-1892' },
  { icon: '✅', text: 'Inspector Emeka completed job #142', time: '15m ago', link: '/inspectors/INS-001' },
  { icon: '💰', text: '₦5,100,000 payment received for CK-41', time: '1h ago', link: '/finance' },
  { icon: '🚗', text: 'New car CK-47 registered by Promise Ndem', time: '2h ago', link: '/cars/CK-47' },
  { icon: '🔨', text: 'New bid ₦4,950,000 on AUC-001', time: '3h ago', link: '/auctions/AUC-001' },
  { icon: '📄', text: 'Report RPT-440 approved by QA', time: '4h ago', link: '/reports/RPT-440' },
];

const NIGERIA_ZONES = [
  { name: 'Lagos', x: 15, y: 68, volume: 45, score: 79 },
  { name: 'Abuja', x: 48, y: 42, volume: 28, score: 83 },
  { name: 'Port Harcourt', x: 55, y: 72, volume: 18, score: 81 },
  { name: 'Ibadan', x: 22, y: 62, volume: 12, score: 76 },
  { name: 'Kano', x: 48, y: 18, volume: 8, score: 74 },
];

function CountUp({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const duration = 1200;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
}

export default function DashboardPage() {
  const pathname = usePathname();
  const [chartRange, setChartRange] = useState<'7D' | '30D' | '90D'>('30D');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const kpis = [
    {
      label: 'Inspections Today',
      value: 7,
      trend: +2,
      trendLabel: 'vs yesterday',
      icon: ClipboardList,
      color: '#1E3A5F',
      href: '/orders',
    },
    {
      label: 'Pending Orders',
      value: 12,
      trend: -3,
      trendLabel: 'needs attention',
      icon: Activity,
      color: '#D35400',
      href: '/orders?status=pending',
    },
    {
      label: 'Revenue MTD',
      value: 12450000,
      isNaira: true,
      progress: 62,
      trendLabel: '₦20M target',
      icon: DollarSign,
      color: '#1A7A4A',
      href: '/finance',
    },
    {
      label: 'Active Inspectors',
      value: 11,
      suffix: '/15 online',
      trendLabel: 'available now',
      icon: Users,
      color: '#2E75B6',
      href: '/inspectors',
    },
    {
      label: 'Avg Carschek Score',
      value: 79,
      suffix: '/100',
      trendLabel: 'platform average',
      icon: Star,
      color: '#D35400',
      href: '/reports',
    },
  ];

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Operations Dashboard</h1>
            <p className="text-sm text-[#6B7280] mt-0.5">Sunday, 13 April 2026 — WAT (West Africa Time)</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-[#1A7A4A] bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
              <span className="w-1.5 h-1.5 bg-[#1A7A4A] rounded-full animate-pulse" />
              Live data
            </span>
            <Link href="/orders/new" className="px-4 py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F] transition-all min-h-[44px] flex items-center gap-2">
              <Zap size={15} /> New Order
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {kpis.map((kpi, i) => (
            <Link key={`kpi-${i}`} href={kpi.href}
              className="bg-white rounded-xl border border-[#E5E7EB] p-5 hover:shadow-md transition-all hover:border-[#2E75B6]/30 group animate-count-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${kpi.color}15` }}>
                  <kpi.icon size={20} style={{ color: kpi.color }} />
                </div>
                <ArrowRight size={14} className="text-[#9CA3AF] group-hover:text-[#2E75B6] transition-colors mt-1" />
              </div>
              <div className="text-2xl font-heading font-bold text-[#1F2937] tabular-nums">
                {kpi.isNaira ? (
                  <CountUp target={kpi.value} prefix="₦" />
                ) : (
                  <><CountUp target={kpi.value} />{kpi.suffix && <span className="text-sm font-normal text-[#6B7280]">{kpi.suffix}</span>}</>
                )}
              </div>
              {kpi.isNaira && kpi.progress && (
                <div className="mt-2 mb-1">
                  <div className="h-1.5 bg-[#F4F6F8] rounded-full overflow-hidden">
                    <div className="h-full bg-[#1A7A4A] rounded-full transition-all duration-1000" style={{ width: `${kpi.progress}%` }} />
                  </div>
                </div>
              )}
              <p className="text-xs text-[#6B7280] mt-1">{kpi.label}</p>
              {kpi.trend !== undefined && (
                <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${kpi.trend > 0 ? 'text-[#1A7A4A]' : 'text-[#C0392B]'}`}>
                  {kpi.trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {kpi.trend > 0 ? '+' : ''}{kpi.trend} {kpi.trendLabel}
                </div>
              )}
              {kpi.trend === undefined && <p className="text-xs text-[#9CA3AF] mt-1">{kpi.trendLabel}</p>}
            </Link>
          ))}
        </div>

        {/* Booking Trend Chart */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-base font-heading font-semibold text-[#1F2937]">Booking Trend</h2>
              <p className="text-xs text-[#6B7280]">Booked vs Completed inspections</p>
            </div>
            <div className="flex items-center gap-1 bg-[#F4F6F8] rounded-lg p-1">
              {(['7D', '30D', '90D'] as const).map(r => (
                <button key={r} onClick={() => setChartRange(r)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${chartRange === r ? 'bg-white text-[#1E3A5F] shadow-sm' : 'text-[#6B7280] hover:text-[#1F2937]'}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={BOOKING_DATA.slice(chartRange === '7D' ? 23 : chartRange === '30D' ? 0 : 0)}>
              <defs>
                <linearGradient id="booked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1E3A5F" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1E3A5F" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="completed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1A7A4A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1A7A4A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F4F6F8" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="booked" stroke="#1E3A5F" strokeWidth={2} fill="url(#booked)" name="Booked" />
              <Area type="monotone" dataKey="completed" stroke="#1A7A4A" strokeWidth={2} fill="url(#completed)" name="Completed" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue + Nigeria Map */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Revenue Breakdown */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <h2 className="text-base font-heading font-semibold text-[#1F2937] mb-1">Revenue Breakdown</h2>
            <p className="text-xs text-[#6B7280] mb-5">By service type — April 2026</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={REVENUE_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F4F6F8" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false}
                  tickFormatter={v => `₦${(v / 1000000).toFixed(1)}M`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} tickLine={false} axisLine={false} width={140} />
                <Tooltip formatter={(v: number) => formatNaira(v)} contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {REVENUE_DATA.map((entry, i) => <Cell key={`cell-${i}`} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Nigeria Zone Map */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-heading font-semibold text-[#1F2937]">Coverage Map</h2>
                <p className="text-xs text-[#6B7280]">Click a city to filter orders by zone</p>
              </div>
              {selectedZone && (
                <button onClick={() => setSelectedZone(null)} className="text-xs text-[#2E75B6] hover:underline">Clear filter</button>
              )}
            </div>
            <div className="relative bg-[#F4F6F8] rounded-xl overflow-hidden" style={{ height: 200 }}>
              {/* Simple SVG Nigeria outline */}
              <svg viewBox="0 0 100 100" className="w-full h-full opacity-20 absolute inset-0">
                <path d="M10,30 L20,20 L35,18 L50,15 L65,18 L80,22 L88,35 L90,50 L85,65 L75,78 L60,85 L45,88 L30,82 L18,72 L10,58 L8,45 Z" fill="#1E3A5F" />
              </svg>
              {NIGERIA_ZONES.map(zone => {
                const size = 8 + (zone.volume / 45) * 20;
                const isSelected = selectedZone === zone.name;
                return (
                  <button
                    key={zone.name}
                    onClick={() => setSelectedZone(isSelected ? null : zone.name)}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                    style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                  >
                    <div
                      className={`rounded-full transition-all duration-200 flex items-center justify-center ${isSelected ? 'ring-2 ring-[#1E3A5F] ring-offset-2' : ''}`}
                      style={{
                        width: size, height: size,
                        backgroundColor: getScoreColor(zone.score),
                        opacity: 0.85,
                      }}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-[#1F2937] text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {zone.name}: {zone.volume} orders · Score {zone.score}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {NIGERIA_ZONES.map(z => (
                <button key={z.name} onClick={() => setSelectedZone(selectedZone === z.name ? null : z.name)}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${selectedZone === z.name ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]' : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#2E75B6]'}`}>
                  <MapPin size={10} /> {z.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard + Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Inspector Leaderboard */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-heading font-semibold text-[#1F2937]">Inspector Leaderboard</h2>
              <Link href="/inspectors" className="text-xs text-[#2E75B6] hover:underline flex items-center gap-1">View all <ChevronRight size={12} /></Link>
            </div>
            <div className="space-y-2">
              {LEADERBOARD.map((ins, i) => (
                <Link key={ins.rank} href={`/inspectors/INS-00${ins.rank}`}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#F4F6F8] transition-colors group">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-[#F4F6F8] text-[#6B7280]'}`}>
                    {ins.rank}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {ins.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1F2937] truncate">{ins.name}</p>
                    <p className="text-xs text-[#6B7280]">{ins.zone} · {ins.jobs} jobs</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: getScoreColor(ins.score) }}>{ins.score}</p>
                    <p className="text-[10px] text-[#9CA3AF]">avg score</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-heading font-semibold text-[#1F2937]">Recent Activity</h2>
              <Link href="/activity" className="text-xs text-[#2E75B6] hover:underline flex items-center gap-1">View all <ChevronRight size={12} /></Link>
            </div>
            <div className="space-y-1">
              {ACTIVITY.map((item, i) => (
                <Link key={`act-${i}`} href={item.link}
                  className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[#F4F6F8] transition-colors group">
                  <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#1F2937] group-hover:text-[#2E75B6] transition-colors">{item.text}</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">{item.time}</p>
                  </div>
                  <ChevronRight size={14} className="text-[#9CA3AF] group-hover:text-[#2E75B6] transition-colors mt-1 flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Deal Funnel */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-heading font-semibold text-[#1F2937]">Deal Funnel</h2>
            <Link href="/deals" className="text-xs text-[#2E75B6] hover:underline flex items-center gap-1">View deals <ChevronRight size={12} /></Link>
          </div>
          <div className="flex items-end gap-2 overflow-x-auto pb-2">
            {[
              { stage: 'Lead', count: 45, color: '#2E75B6' },
              { stage: 'Qualified', count: 28, color: '#1E3A5F' },
              { stage: 'Offer Sent', count: 18, color: '#D35400' },
              { stage: 'Negotiation', count: 11, color: '#D35400' },
              { stage: 'Closed Won', count: 7, color: '#1A7A4A' },
            ].map((s, i) => (
              <Link key={s.stage} href={`/deals?stage=${s.stage}`}
                className="flex-1 min-w-[80px] group cursor-pointer">
                <div className="text-center mb-2">
                  <span className="text-lg font-bold text-[#1F2937]">{s.count}</span>
                  <p className="text-xs text-[#6B7280]">{s.stage}</p>
                </div>
                <div className="rounded-t-lg transition-all group-hover:opacity-80" style={{
                  height: `${(s.count / 45) * 80 + 20}px`,
                  backgroundColor: s.color,
                }} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
