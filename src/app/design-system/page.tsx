'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import AppLogo from '@/components/ui/AppLogo';
import { LayoutDashboard, ClipboardList, Users, FileText, UserCircle, Car, Handshake, DollarSign, Bell, Settings, Search, ChevronDown, MoreHorizontal, TrendingUp, TrendingDown, AlertCircle, Info, CheckCircle, XCircle, X, Loader2, Inbox, Plus } from 'lucide-react';

/* ─── Sparkline ─── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80; const h = 28;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

/* ─── Score Donut ─── */
function ScoreDonut({ score }: { score: number }) {
  const color = score >= 71 ? '#1A7A4A' : score >= 41 ? '#D35400' : '#C0392B';
  const r = 28; const circ = 2 * Math.PI * r;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#E5E7EB" strokeWidth="8" />
      <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)} strokeLinecap="round" />
      <text x="36" y="36" textAnchor="middle" dominantBaseline="central" className="rotate-90"
        style={{ fontSize: 14, fontWeight: 700, fill: color, transform: 'rotate(90deg)', transformOrigin: '36px 36px' }}>
        {score}
      </text>
    </svg>
  );
}

const SECTION = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-12">
    <h2 className="text-lg font-heading font-bold text-[#1F2937] mb-1">{title}</h2>
    <div className="w-12 h-0.5 bg-[#ff8a65] mb-5 rounded-full" />
    {children}
  </section>
);

export default function DesignSystemPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; type: string; msg: string }[]>([]);
  const [checkboxes, setCheckboxes] = useState<Record<string, boolean>>({});
  const [inputError, setInputError] = useState(false);

  const addToast = (type: string, msg: string) => {
    const id = `t-${Date.now()}`;
    setToasts(t => [...t, { id, type, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };

  const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard' },
    { icon: ClipboardList, label: 'Orders', badge: '12' },
    { icon: Users, label: 'Inspectors' },
    { icon: FileText, label: 'Reports', badge: '5' },
    { icon: UserCircle, label: 'Customers' },
    { icon: Car, label: 'Listings' },
    { icon: Handshake, label: 'Deals', badge: '3' },
    { icon: DollarSign, label: 'Finance' },
    { icon: Bell, label: 'Notifications', badge: '8' },
    { icon: Settings, label: 'Settings' },
  ];

  const STATUS_BADGES = [
    { label: 'New', cls: 'bg-blue-50 text-blue-700 border border-blue-200' },
    { label: 'Assigned', cls: 'bg-purple-50 text-purple-700 border border-purple-200' },
    { label: 'In Progress', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
    { label: 'Reported', cls: 'bg-teal-50 text-teal-700 border border-teal-200' },
    { label: 'QA Review', cls: 'bg-orange-50 text-orange-700 border border-orange-200' },
    { label: 'Closed', cls: 'bg-green-50 text-green-700 border border-green-200' },
    { label: 'Cancelled', cls: 'bg-red-50 text-red-700 border border-red-200' },
  ];

  return (
    <AppLayout>
      {/* Toast stack */}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto animate-fade-in min-w-[260px] ${
            t.type === 'success' ? 'bg-[#1A7A4A] text-white' :
            t.type === 'warning' ? 'bg-[#D35400] text-white' :
            t.type === 'error' ? 'bg-[#C0392B] text-white' : 'bg-[#ff5722] text-white'
          }`}>
            {t.type === 'success' ? <CheckCircle size={16} /> : t.type === 'warning' ? <AlertCircle size={16} /> : t.type === 'error' ? <XCircle size={16} /> : <Info size={16} />}
            {t.msg}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-[#1F2937]">Modal / Dialog</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-[#F4F6F8] transition-colors"><X size={16} className="text-[#6B7280]" /></button>
            </div>
            <p className="text-sm text-[#6B7280] mb-5">This is a modal dialog with an overlay. It can contain forms, confirmations, or any content. Click outside or the X to close.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 border border-[#E5E7EB] text-sm font-semibold text-[#6B7280] rounded-lg hover:bg-[#F4F6F8]">Cancel</button>
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19]">Confirm</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-2">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Design System</h1>
          <p className="text-sm text-[#6B7280] mt-1">Carschek brand tokens, components, and UI patterns</p>
        </div>

        {/* 1. Color Tokens */}
        <SECTION title="1. Brand Color Tokens">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { name: 'Primary', hex: '#ff5722', label: 'Headers, CTAs' },
              { name: 'Secondary', hex: '#ff8a65', label: 'Accents, links' },
              { name: 'Success', hex: '#1A7A4A', label: 'Pass, positive' },
              { name: 'Danger', hex: '#C0392B', label: 'Fail, critical' },
              { name: 'Warning', hex: '#D35400', label: 'Pending, amber' },
              { name: 'Neutral', hex: '#6B7280', label: 'Muted text' },
            ].map(c => (
              <div key={c.name} className="rounded-xl overflow-hidden border border-[#E5E7EB] shadow-sm">
                <div className="h-14" style={{ backgroundColor: c.hex }} />
                <div className="p-2.5 bg-white">
                  <p className="text-xs font-bold text-[#1F2937]">{c.name}</p>
                  <p className="text-[10px] font-mono text-[#6B7280]">{c.hex}</p>
                  <p className="text-[10px] text-[#6B7280]">{c.label}</p>
                </div>
              </div>
            ))}
          </div>
        </SECTION>

        {/* 2. Navigation Sidebar */}
        <SECTION title="2. Navigation Sidebar">
          <div className="flex gap-4">
            {/* Expanded */}
            <div className="w-56 bg-[#ff5722] rounded-xl overflow-hidden shadow-lg flex-shrink-0">
              <div className="flex items-center px-4 py-3 border-b border-white/10">
                <AppLogo size={36} />
              </div>
              <div className="py-3 px-2">
                <p className="px-2 mb-1.5 text-[9px] font-semibold uppercase tracking-widest text-white/40">Operations</p>
                {NAV_ITEMS.slice(0, 5).map((item, i) => (
                  <div key={`nav-exp-${item.label}`} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 cursor-pointer transition-all ${i === 0 ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}>
                    <item.icon size={15} className="flex-shrink-0" />
                    <span className="text-xs font-medium flex-1">{item.label}</span>
                    {item.badge && <span className="bg-[#ff8a65] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{item.badge}</span>}
                  </div>
                ))}
                <p className="px-2 mt-3 mb-1.5 text-[9px] font-semibold uppercase tracking-widest text-white/40">CRM</p>
                {NAV_ITEMS.slice(5).map(item => (
                  <div key={`nav-exp2-${item.label}`} className="flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 cursor-pointer text-white/60 hover:bg-white/10 hover:text-white transition-all">
                    <item.icon size={15} className="flex-shrink-0" />
                    <span className="text-xs font-medium flex-1">{item.label}</span>
                    {item.badge && <span className="bg-[#ff8a65] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{item.badge}</span>}
                  </div>
                ))}
              </div>
            </div>
            {/* Collapsed */}
            <div className="w-14 bg-[#ff5722] rounded-xl overflow-hidden shadow-lg flex-shrink-0">
              <div className="flex items-center justify-center py-3 border-b border-white/10">
                <div className="w-7 h-7 bg-[#ff8a65] rounded-lg flex items-center justify-center"><Car size={14} className="text-white" /></div>
              </div>
              <div className="py-3 px-2 flex flex-col gap-0.5">
                {NAV_ITEMS.map((item, i) => (
                  <div key={`nav-col-${item.label}`} className={`relative flex items-center justify-center p-2 rounded-lg cursor-pointer transition-all ${i === 0 ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}>
                    <item.icon size={16} />
                    {item.badge && <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-[#ff8a65] rounded-full" />}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 text-sm text-[#6B7280] pt-2">
              <p className="font-semibold text-[#1F2937] mb-1">Sidebar specs</p>
              <ul className="space-y-1 text-xs">
                <li>• Expanded: 256px width</li>
                <li>• Collapsed: 64px width</li>
                <li>• Background: #ff5722 (deep navy)</li>
                <li>• Active state: bg-white/15 + left accent bar</li>
                <li>• Badge: #ff8a65 pill</li>
                <li>• Smooth 300ms transition</li>
              </ul>
            </div>
          </div>
        </SECTION>

        {/* 3. Top Header Bar */}
        <SECTION title="3. Top Header Bar">
          <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 h-14 gap-4">
              <div className="flex items-center gap-2 flex-1 max-w-xs bg-[#F4F6F8] border border-[#E5E7EB] rounded-lg px-3 py-2 cursor-pointer hover:border-[#ff8a65] transition-colors">
                <Search size={14} className="text-[#6B7280]" />
                <span className="text-sm text-[#6B7280] flex-1">Search…</span>
                <kbd className="text-[10px] bg-white border border-[#E5E7EB] rounded px-1.5 py-0.5 text-[#6B7280] font-mono">⌘K</kbd>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-[#1A7A4A] bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1A7A4A] animate-pulse" />Online
                </div>
                <button className="relative p-2 rounded-lg hover:bg-[#F4F6F8] transition-colors">
                  <Bell size={18} className="text-[#6B7280]" />
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#C0392B] text-white text-[9px] font-bold rounded-full flex items-center justify-center">8</span>
                </button>
                <div className="flex items-center gap-2 cursor-pointer hover:bg-[#F4F6F8] px-2 py-1.5 rounded-lg transition-colors">
                  <div className="w-7 h-7 rounded-full bg-[#ff5722] flex items-center justify-center text-white text-xs font-bold">PN</div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-semibold text-[#1F2937] leading-none">Promise Ndem</p>
                    <span className="text-[9px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-semibold">Super Admin</span>
                  </div>
                  <ChevronDown size={14} className="text-[#6B7280]" />
                </div>
              </div>
            </div>
          </div>
        </SECTION>

        {/* 4. KPI Stat Card */}
        <SECTION title="4. KPI Stat Cards">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Inspections Today', value: '47', trend: '+12%', up: true, color: '#ff5722', data: [20,25,22,30,28,35,40,38,42,47] },
              { label: 'Pending Orders', value: '23', trend: '+5%', up: false, color: '#D35400', data: [15,18,20,19,22,21,23,20,22,23] },
              { label: 'Revenue MTD', value: '₦2.45M', trend: '+18%', up: true, color: '#1A7A4A', data: [800,1000,1200,1400,1600,1800,2000,2100,2300,2450] },
              { label: 'Avg Carschek Score', value: '78', trend: '+3%', up: true, color: '#ff8a65', data: [70,72,74,73,75,76,77,76,78,78] },
            ].map(k => (
              <div key={k.label} className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-semibold text-[#6B7280] mb-2">{k.label}</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-heading font-bold tabular-nums" style={{ color: k.color }}>{k.value}</p>
                    <div className={`flex items-center gap-1 mt-1 text-xs font-semibold ${k.up ? 'text-[#1A7A4A]' : 'text-[#C0392B]'}`}>
                      {k.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {k.trend} vs yesterday
                    </div>
                  </div>
                  <Sparkline data={k.data} color={k.color} />
                </div>
              </div>
            ))}
          </div>
        </SECTION>

        {/* 5. Status Badges */}
        <SECTION title="5. Status Badge Variants">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
            <div className="flex flex-wrap gap-3">
              {STATUS_BADGES.map(b => (
                <span key={b.label} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${b.cls}`}>{b.label}</span>
              ))}
            </div>
          </div>
        </SECTION>

        {/* 6. Data Table Row */}
        <SECTION title="6. Data Table Row">
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F4F6F8] text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  <th className="px-4 py-3 text-left w-10"><input type="checkbox" className="rounded" /></th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Vehicle</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Zone</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Score</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F6F8]">
                {[
                  { id: 'ORD-1892', name: 'Adaeze Mbah', phone: '+234 803 441', vehicle: 'Toyota Camry 2019', zone: 'Lekki', status: 'In Progress', score: 76 },
                  { id: 'ORD-1891', name: 'Tunde Babs', phone: '+234 705 334', vehicle: 'Mercedes C300 2021', zone: 'VI', status: 'Closed', score: 91 },
                  { id: 'ORD-1890', name: 'Ngozi Ike', phone: '+234 901 667', vehicle: 'Honda CR-V 2020', zone: 'Abuja', status: 'New', score: null },
                ].map(row => (
                  <tr key={row.id} className="hover:bg-[#F4F6F8]/60 transition-colors group">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={!!checkboxes[row.id]}
                        onChange={() => setCheckboxes(c => ({ ...c, [row.id]: !c[row.id] }))}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#ff5722] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {row.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1F2937]">{row.name}</p>
                          <p className="text-[10px] text-[#6B7280] font-mono">{row.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm text-[#6B7280]">{row.vehicle}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm text-[#6B7280]">{row.zone}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        row.status === 'In Progress' ? 'bg-amber-50 text-amber-700' :
                        row.status === 'Closed' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                      }`}>{row.status}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {row.score ? <span className={`text-xs font-bold ${row.score >= 71 ? 'text-[#1A7A4A]' : 'text-[#D35400]'}`}>{row.score}</span> : <span className="text-xs text-[#6B7280]">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="p-1.5 rounded-lg hover:bg-[#F4F6F8] transition-colors opacity-0 group-hover:opacity-100">
                        <MoreHorizontal size={15} className="text-[#6B7280]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SECTION>

        {/* 7. Buttons */}
        <SECTION title="7. Button Variants">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
            <div className="flex flex-wrap gap-3 items-center">
              <button className="px-5 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19] transition-all active:scale-[0.98] shadow-sm">Primary</button>
              <button className="px-5 py-2.5 bg-[#ff8a65] text-white text-sm font-semibold rounded-lg hover:bg-[#2563A0] transition-all active:scale-[0.98] shadow-sm">Secondary</button>
              <button className="px-5 py-2.5 border border-[#E5E7EB] text-[#1F2937] text-sm font-semibold rounded-lg hover:bg-[#F4F6F8] transition-all active:scale-[0.98]">Ghost</button>
              <button className="px-5 py-2.5 bg-[#C0392B] text-white text-sm font-semibold rounded-lg hover:bg-[#A93226] transition-all active:scale-[0.98] shadow-sm">Destructive</button>
              <button className="px-5 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg opacity-50 cursor-not-allowed" disabled>Disabled</button>
              <button className="px-5 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Loading…
              </button>
            </div>
          </div>
        </SECTION>

        {/* 8. Form Inputs */}
        <SECTION title="8. Form Inputs">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Normal input */}
              <div>
                <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">Full Name <span className="text-[#C0392B]">*</span></label>
                <input type="text" placeholder="e.g. Adaeze Mbah" className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20 focus:border-[#ff5722] transition-all" />
                <p className="text-[10px] text-[#6B7280] mt-1">Enter the customer's full legal name</p>
              </div>
              {/* Select */}
              <div>
                <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">Zone</label>
                <div className="relative">
                  <select className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20 focus:border-[#ff5722] appearance-none bg-white transition-all">
                    <option>Lagos Island</option>
                    <option>Lekki</option>
                    <option>VI</option>
                    <option>Abuja</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
                </div>
              </div>
              {/* Error state */}
              <div>
                <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">Email Address <span className="text-[#C0392B]">*</span></label>
                <input
                  type="email"
                  defaultValue="invalid-email"
                  onFocus={() => setInputError(true)}
                  onBlur={() => setInputError(false)}
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg text-[#1F2937] focus:outline-none focus:ring-2 transition-all ${inputError ? 'border-[#C0392B] ring-2 ring-[#C0392B]/20 bg-red-50' : 'border-[#C0392B] bg-red-50'}`}
                />
                <p className="text-[10px] text-[#C0392B] mt-1 flex items-center gap-1"><AlertCircle size={10} /> Please enter a valid email address</p>
              </div>
              {/* Textarea */}
              <div>
                <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">Notes</label>
                <textarea rows={3} placeholder="Add any relevant notes…" className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20 focus:border-[#ff5722] resize-none transition-all" />
              </div>
            </div>
          </div>
        </SECTION>

        {/* 9. Modal */}
        <SECTION title="9. Modal / Dialog">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm flex items-center gap-4">
            <button onClick={() => setShowModal(true)} className="px-5 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19] transition-all">
              Open Modal
            </button>
            <p className="text-sm text-[#6B7280]">Click to preview the modal dialog with overlay and backdrop blur.</p>
          </div>
        </SECTION>

        {/* 10. Toast Notifications */}
        <SECTION title="10. Toast Notifications">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
            <div className="flex flex-wrap gap-3 mb-4">
              <button onClick={() => addToast('success', 'Order #1234 approved successfully')} className="px-4 py-2 bg-[#1A7A4A] text-white text-xs font-semibold rounded-lg hover:bg-[#155F3A] transition-all">Success Toast</button>
              <button onClick={() => addToast('warning', 'Inspector approaching SLA deadline')} className="px-4 py-2 bg-[#D35400] text-white text-xs font-semibold rounded-lg hover:bg-[#B84600] transition-all">Warning Toast</button>
              <button onClick={() => addToast('error', 'Failed to assign inspector — try again')} className="px-4 py-2 bg-[#C0392B] text-white text-xs font-semibold rounded-lg hover:bg-[#A93226] transition-all">Error Toast</button>
              <button onClick={() => addToast('info', 'New booking from Adaeze M. received')} className="px-4 py-2 bg-[#ff5722] text-white text-xs font-semibold rounded-lg hover:bg-[#e64a19] transition-all">Info Toast</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { type: 'success', msg: 'Report #445 approved by Admin', icon: CheckCircle, cls: 'bg-[#1A7A4A]' },
                { type: 'warning', msg: 'Order #1234 approaching SLA', icon: AlertCircle, cls: 'bg-[#D35400]' },
                { type: 'error', msg: 'Payment failed — retry required', icon: XCircle, cls: 'bg-[#C0392B]' },
                { type: 'info', msg: 'New booking from Adaeze M.', icon: Info, cls: 'bg-[#ff5722]' },
              ].map(t => (
                <div key={t.type} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-medium ${t.cls}`}>
                  <t.icon size={16} />
                  {t.msg}
                </div>
              ))}
            </div>
          </div>
        </SECTION>

        {/* 11. Empty State */}
        <SECTION title="11. Empty State">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-10 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-[#F4F6F8] rounded-2xl flex items-center justify-center mb-4 border border-[#E5E7EB]">
              <Inbox size={28} className="text-[#6B7280]" />
            </div>
            <h3 className="text-base font-heading font-semibold text-[#1F2937] mb-1">No orders found</h3>
            <p className="text-sm text-[#6B7280] mb-5 max-w-xs">Try adjusting your filters or search terms to find what you're looking for.</p>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19] transition-all">
              <Plus size={15} /> Create New Order
            </button>
          </div>
        </SECTION>

        {/* 12. Loading Skeletons */}
        <SECTION title="12. Loading Skeletons">
          <div className="space-y-4">
            {/* Card skeleton */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
              <p className="text-xs font-semibold text-[#6B7280] mb-3">Card Skeleton</p>
              <div className="flex items-start gap-4 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-[#E5E7EB]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#E5E7EB] rounded-lg w-3/4" />
                  <div className="h-3 bg-[#E5E7EB] rounded-lg w-1/2" />
                  <div className="h-3 bg-[#E5E7EB] rounded-lg w-2/3" />
                </div>
                <div className="w-16 h-6 bg-[#E5E7EB] rounded-full" />
              </div>
            </div>
            {/* Table row skeleton */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <p className="text-xs font-semibold text-[#6B7280] px-5 pt-4 mb-3">Table Row Skeleton</p>
              {[1, 2, 3].map(i => (
                <div key={`skel-row-${i}`} className="flex items-center gap-4 px-5 py-3 border-t border-[#F4F6F8] animate-pulse">
                  <div className="w-4 h-4 bg-[#E5E7EB] rounded" />
                  <div className="w-8 h-8 rounded-full bg-[#E5E7EB]" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-[#E5E7EB] rounded w-1/3" />
                    <div className="h-2.5 bg-[#E5E7EB] rounded w-1/4" />
                  </div>
                  <div className="h-3 bg-[#E5E7EB] rounded w-24 hidden md:block" />
                  <div className="h-5 bg-[#E5E7EB] rounded-full w-16" />
                  <div className="h-3 bg-[#E5E7EB] rounded w-8" />
                </div>
              ))}
            </div>
          </div>
        </SECTION>

        {/* 13. Typography */}
        <SECTION title="13. Typography Scale">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm space-y-4">
            <div><p className="text-[10px] text-[#6B7280] font-mono mb-1">text-3xl / font-bold / Inter</p><h1 className="text-3xl font-heading font-bold text-[#1F2937]">Heading 1 — Dashboard Overview</h1></div>
            <div><p className="text-[10px] text-[#6B7280] font-mono mb-1">text-2xl / font-bold</p><h2 className="text-2xl font-heading font-bold text-[#1F2937]">Heading 2 — Inspection Orders</h2></div>
            <div><p className="text-[10px] text-[#6B7280] font-mono mb-1">text-xl / font-semibold</p><h3 className="text-xl font-heading font-semibold text-[#1F2937]">Heading 3 — Order #1234</h3></div>
            <div><p className="text-[10px] text-[#6B7280] font-mono mb-1">text-base / font-normal / leading-relaxed</p><p className="text-base text-[#1F2937] leading-relaxed">Body text — The vehicle inspection was completed successfully. All 27 sections were reviewed by the assigned inspector. The Carschek Score reflects the overall condition of the vehicle.</p></div>
            <div><p className="text-[10px] text-[#6B7280] font-mono mb-1">text-sm / text-[#6B7280]</p><p className="text-sm text-[#6B7280]">Muted / helper text — Last updated 2 minutes ago by Promise Ndem</p></div>
            <div><p className="text-[10px] text-[#6B7280] font-mono mb-1">font-mono / Fira Code — IDs & references</p><p className="font-mono text-sm text-[#ff5722] bg-[#F4F6F8] px-3 py-1.5 rounded-lg inline-block">ORD-1892 · VIN: 4T1BF1FK5KU123456 · RPT-501</p></div>
          </div>
        </SECTION>

        {/* 14. Carschek Score Donut */}
        <SECTION title="14. Carschek Score Gauge">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
            <div className="flex flex-wrap gap-8 items-center">
              {[{ score: 85, label: 'Good (71–100)' }, { score: 58, label: 'Fair (41–70)' }, { score: 32, label: 'Poor (0–40)' }].map(s => (
                <div key={s.score} className="flex flex-col items-center gap-2">
                  <ScoreDonut score={s.score} />
                  <p className="text-xs font-semibold text-[#6B7280]">{s.label}</p>
                </div>
              ))}
              <div className="flex-1 text-sm text-[#6B7280] space-y-1.5">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#1A7A4A]" /><span>71–100: Good Condition (green)</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#D35400]" /><span>41–70: Fair Condition (amber)</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#C0392B]" /><span>0–40: Poor Condition (red)</span></div>
              </div>
            </div>
          </div>
        </SECTION>
      </div>
    </AppLayout>
  );
}
