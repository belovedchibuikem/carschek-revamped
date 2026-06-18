'use client';
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import AppLogo from '@/components/ui/AppLogo';
import Link from 'next/link';
import { LayoutDashboard, ClipboardList, Users, FileText, UserCircle, Car, Handshake, DollarSign, Bell, Settings, ChevronLeft, ChevronRight, Menu, X, Sun, Moon, Home, Briefcase, User, Plus, ArrowLeft, Search, RefreshCw, Smartphone, Monitor, Tablet, Zap, Play } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';


// ─── Types ────────────────────────────────────────────────────────────────────
type BreakpointView = 'desktop' | 'tablet' | 'mobile';
type ActiveModule = 'dashboard' | 'orders' | 'inspectors' | 'reports';
type TransitionState = 'idle' | 'fading-out' | 'fading-in';
type ErrorType = '404' | '500' | 'empty' | 'network' | null;

// ─── Admin Nav Items ──────────────────────────────────────────────────────────
const ADMIN_NAV = [
  { group: 'OVERVIEW', items: [{ icon: LayoutDashboard, label: 'Dashboard', path: 'dashboard' }] },
  { group: 'OPERATIONS', items: [
    { icon: ClipboardList, label: 'Inspection Orders', path: 'orders', badge: '12' },
    { icon: Users, label: 'Inspectors', path: 'inspectors' },
    { icon: FileText, label: 'Reports', path: 'reports', badge: '5' },
  ]},
  { group: 'CUSTOMERS', items: [
    { icon: UserCircle, label: 'Customers', path: 'customers' },
    { icon: Car, label: 'Listings', path: 'listings' },
    { icon: Handshake, label: 'Deals', path: 'deals', badge: '3' },
  ]},
  { group: 'FINANCE', items: [
    { icon: DollarSign, label: 'Finance & Payments', path: 'finance' },
  ]},
  { group: 'SETTINGS', items: [
    { icon: Bell, label: 'Notifications', path: 'notifications', badge: '8' },
    { icon: Settings, label: 'Settings', path: 'settings' },
  ]},
];

// ─── Section 1: Admin Portal Navigation Demo ─────────────────────────────────
function AdminNavDemo() {
  const [breakpoint, setBreakpoint] = useState<BreakpointView>('desktop');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [transitionState, setTransitionState] = useState<TransitionState>('idle');
  const [activeTab, setActiveTab] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAssignModal, setShowAssignModal] = useState(false);

  const navigateTo = (module: string) => {
    setTransitionState('fading-out');
    setTimeout(() => {
      setActiveModule(module as ActiveModule);
      setTransitionState('fading-in');
      setTimeout(() => setTransitionState('idle'), 200);
    }, 100);
  };

  const bg = darkMode ? 'bg-[#0F172A]' : 'bg-[#F4F6F8]';
  const sidebarBg = darkMode ? 'bg-[#1E293B]' : 'bg-[#ff5722]';
  const headerBg = darkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-[#E5E7EB]';
  const cardBg = darkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-[#E5E7EB]';
  const textPrimary = darkMode ? 'text-white' : 'text-[#1F2937]';
  const textMuted = darkMode ? 'text-slate-400' : 'text-[#6B7280]';

  const STATUS_FILTERS = ['All', 'New', 'Assigned', 'In Progress', 'Reported', 'QA Review', 'Closed'];
  const STATUS_COLORS: Record<string, string> = {
    'New': 'bg-blue-100 text-blue-700',
    'Assigned': 'bg-purple-100 text-purple-700',
    'In Progress': 'bg-amber-100 text-amber-700',
    'Reported': 'bg-teal-100 text-teal-700',
    'QA Review': 'bg-orange-100 text-orange-700',
    'Closed': 'bg-green-100 text-green-700',
  };

  const MOCK_ORDERS = [
    { id: '#1234', customer: 'Adaeze Mensah', vehicle: '2019 Toyota Camry', status: 'In Progress', score: null },
    { id: '#1235', customer: 'Emeka Okafor', vehicle: '2021 Honda Accord', status: 'New', score: null },
    { id: '#1236', customer: 'Chidi Nwosu', vehicle: '2018 Ford Focus', status: 'Closed', score: 78 },
    { id: '#1237', customer: 'Fatima Bello', vehicle: '2020 Hyundai Elantra', status: 'QA Review', score: 65 },
    { id: '#1238', customer: 'Tunde Adeyemi', vehicle: '2017 Kia Sportage', status: 'Assigned', score: null },
  ];

  const filteredOrders = statusFilter === 'All' ? MOCK_ORDERS : MOCK_ORDERS.filter(o => o.status === statusFilter);

  const renderContent = () => {
    const contentClass = `transition-opacity duration-200 ${
      transitionState === 'fading-out' ? 'opacity-0' : transitionState === 'fading-in' ? 'opacity-0' : 'opacity-100'
    }`;

    if (activeModule === 'dashboard') {
      return (
        <div className={contentClass}>
          <h2 className={`text-lg font-bold mb-4 ${textPrimary}`}>Dashboard</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: 'Inspections Today', value: '47', trend: '+12%', color: 'text-[#1A7A4A]' },
              { label: 'Pending Orders', value: '12', trend: 'Needs attention', color: 'text-[#D35400]' },
              { label: 'Revenue MTD', value: '₦2.4M', trend: '+8%', color: 'text-[#1A7A4A]' },
              { label: 'Active Inspectors', value: '11/15', trend: 'Online', color: 'text-[#ff8a65]' },
            ].map((kpi, i) => (
              <div key={i} className={`${cardBg} border rounded-xl p-3`}>
                <p className={`text-[10px] ${textMuted} mb-1`}>{kpi.label}</p>
                <p className={`text-xl font-bold ${textPrimary}`}>{kpi.value}</p>
                <p className={`text-[10px] font-medium ${kpi.color}`}>{kpi.trend}</p>
              </div>
            ))}
          </div>
          <div className={`${cardBg} border rounded-xl p-3`}>
            <p className={`text-xs font-semibold ${textMuted} mb-2`}>Recent Activity</p>
            {['Order #1234 assigned to Emeka O.', 'Report #445 approved', 'New booking from Adaeze M.'].map((a, i) => (
              <div key={i} className={`flex items-center gap-2 py-1.5 border-b last:border-0 ${darkMode ? 'border-slate-700' : 'border-[#F4F6F8]'}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-[#ff8a65] flex-shrink-0" />
                <p className={`text-xs ${textPrimary}`}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeModule === 'orders') {
      return (
        <div className={contentClass}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-bold ${textPrimary}`}>Inspection Orders</h2>
            <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ff5722] text-white text-xs font-medium rounded-lg hover:bg-[#ff8a65] transition-colors">
              <Plus size={13} />
              New Order
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
            {STATUS_FILTERS.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 text-[10px] font-medium rounded-full whitespace-nowrap transition-all ${
                  statusFilter === s ? 'bg-[#ff5722] text-white' : `${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-[#F4F6F8] text-[#6B7280]'} hover:bg-[#ff5722]/10`
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className={`${cardBg} border rounded-xl overflow-hidden`}>
            {filteredOrders.map((order, i) => (
              <div key={i} className={`flex items-center gap-3 px-3 py-2.5 border-b last:border-0 ${darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-[#F4F6F8] hover:bg-[#F9FAFB]'} cursor-pointer transition-colors`}>
                <div>
                  <p className={`text-xs font-semibold ${textPrimary}`}>{order.id} · {order.customer}</p>
                  <p className={`text-[10px] ${textMuted}`}>{order.vehicle}</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {order.score && <span className="text-[10px] font-bold text-[#1A7A4A]">{order.score}/100</span>}
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>{order.status}</span>
                </div>
              </div>
            ))}
            {filteredOrders.length === 0 && (
              <div className="py-8 text-center">
                <p className={`text-xs ${textMuted}`}>No orders with status "{statusFilter}"</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeModule === 'inspectors') {
      const INSPECTOR_TABS = ['Overview', 'Schedule', 'Earnings', 'Account'];
      return (
        <div className={contentClass}>
          <h2 className={`text-lg font-bold mb-4 ${textPrimary}`}>Inspector Profile</h2>
          <div className={`${cardBg} border rounded-xl p-3 mb-3`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#ff8a65] flex items-center justify-center text-white font-bold">EO</div>
              <div>
                <p className={`text-sm font-bold ${textPrimary}`}>Emeka Okonkwo</p>
                <p className={`text-[10px] ${textMuted}`}>Senior Inspector · Lagos Island</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-amber-500">★ 4.8</span>
                  <span className={`text-[10px] ${textMuted}`}>234 jobs</span>
                  <span className={`text-[10px] ${textMuted}`}>98% on-time</span>
                </div>
              </div>
            </div>
          </div>
          {/* Tabs */}
          <div className={`flex gap-1 mb-3 ${darkMode ? 'bg-slate-800' : 'bg-[#F4F6F8]'} rounded-xl p-1`}>
            {INSPECTOR_TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`flex-1 py-1.5 text-[10px] font-medium rounded-lg transition-all ${
                  activeTab === i ? `${darkMode ? 'bg-slate-700' : 'bg-white'} ${textPrimary} shadow-sm` : textMuted
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className={`${cardBg} border rounded-xl p-3`}>
            {activeTab === 0 && (
              <div>
                <p className={`text-xs font-semibold ${textMuted} mb-2`}>Recent Jobs</p>
                {['2019 Toyota Camry — Score: 78', '2021 Honda Accord — Score: 85', '2018 Ford Focus — Score: 62'].map((j, i) => (
                  <div key={i} className={`py-1.5 border-b last:border-0 ${darkMode ? 'border-slate-700' : 'border-[#F4F6F8]'}`}>
                    <p className={`text-xs ${textPrimary}`}>{j}</p>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 1 && <p className={`text-xs ${textMuted} text-center py-4`}>Weekly schedule view</p>}
            {activeTab === 2 && <p className={`text-xs ${textMuted} text-center py-4`}>₦185,000 earned this month</p>}
            {activeTab === 3 && <p className={`text-xs ${textMuted} text-center py-4`}>Account settings & documents</p>}
          </div>
        </div>
      );
    }

    if (activeModule === 'reports') {
      return (
        <div className={contentClass}>
          <h2 className={`text-lg font-bold mb-4 ${textPrimary}`}>Reports QA Queue</h2>
          <div className={`${cardBg} border rounded-xl overflow-hidden`}>
            {[
              { id: 'CS-4521', vehicle: '2019 Toyota Camry', inspector: 'Emeka O.', time: '1h 20m', priority: 'amber' },
              { id: 'CS-4520', vehicle: '2021 Honda Accord', inspector: 'Chukwudi E.', time: '2h 45m', priority: 'red' },
              { id: 'CS-4519', vehicle: '2018 Ford Focus', inspector: 'Amaka O.', time: '0h 35m', priority: 'green' },
            ].map((r, i) => (
              <div key={i} className={`flex items-center gap-3 px-3 py-2.5 border-b last:border-0 ${darkMode ? 'border-slate-700' : 'border-[#F4F6F8]'}`}>
                <div className={`w-2 h-8 rounded-full flex-shrink-0 ${r.priority === 'red' ? 'bg-red-500' : r.priority === 'amber' ? 'bg-amber-500' : 'bg-green-500'}`} />
                <div className="flex-1">
                  <p className={`text-xs font-semibold ${textPrimary}`}>#{r.id} · {r.vehicle}</p>
                  <p className={`text-[10px] ${textMuted}`}>{r.inspector} · {r.time} in queue</p>
                </div>
                <button
                  type="button"
                  onClick={() => toast.success('Opening report review…', { description: 'Prototype: use Inspection → Reports QA in the live app.' })}
                  className="px-2.5 py-1 bg-[#ff5722] text-white text-[10px] font-medium rounded-lg hover:bg-[#ff8a65] transition-colors"
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
      <div className="px-6 py-5 border-b border-[#E5E7EB]">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-base font-bold text-[#1F2937]">Section 1 — Admin Portal Navigation</h2>
            <p className="text-xs text-[#6B7280] mt-0.5">Interactive prototype with working nav, tabs, modals, filters, and dark mode</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Breakpoint Toggle */}
            <div className="flex items-center bg-[#F4F6F8] rounded-lg p-1 gap-1">
              {([
                { key: 'desktop', icon: Monitor },
                { key: 'tablet', icon: Tablet },
                { key: 'mobile', icon: Smartphone },
              ] as { key: BreakpointView; icon: React.ElementType }[]).map(({ key, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setBreakpoint(key)}
                  className={`p-1.5 rounded-md transition-all ${breakpoint === key ? 'bg-white shadow-sm text-[#ff5722]' : 'text-[#6B7280] hover:text-[#1F2937]'}`}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                darkMode ? 'bg-[#1E293B] text-white border-slate-600' : 'bg-white text-[#374151] border-[#E5E7EB] hover:bg-[#F4F6F8]'
              }`}
            >
              {darkMode ? <Sun size={14} /> : <Moon size={14} />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
      </div>

      {/* Prototype Frame */}
      <div className="p-6 flex justify-center">
        <div
          className={`overflow-hidden rounded-2xl border border-[#E5E7EB] shadow-xl transition-all duration-300 ${
            breakpoint === 'desktop' ? 'w-full max-w-3xl' :
            breakpoint === 'tablet' ? 'w-[600px]' :
            'w-80'
          }`}
          style={{ height: 480 }}
        >
          <div className={`flex h-full ${bg}`}>

            {/* Sidebar — Desktop */}
            {breakpoint === 'desktop' && (
              <aside className={`${sidebarBg} text-white flex flex-col transition-all duration-300 flex-shrink-0 ${sidebarCollapsed ? 'w-14' : 'w-48'}`}>
                <div className={`flex items-center h-12 px-3 border-b border-white/10 ${sidebarCollapsed ? 'justify-center' : ''}`}>
                  <AppLogo size={sidebarCollapsed ? 28 : 36} />
                </div>
                <nav className="flex-1 overflow-y-auto py-2">
                  {ADMIN_NAV.map(group => (
                    <div key={group.group} className="mb-3">
                      {!sidebarCollapsed && (
                        <p className="px-3 mb-1 text-[9px] font-bold uppercase tracking-widest text-white/40">{group.group}</p>
                      )}
                      {group.items.map(item => {
                        const active = activeModule === item.path;
                        return (
                          <button
                            key={item.path}
                            onClick={() => navigateTo(item.path)}
                            className={`relative w-full flex items-center gap-2 mx-1 px-2 py-2 rounded-lg mb-0.5 transition-all text-left ${
                              active ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
                            } ${sidebarCollapsed ? 'justify-center' : ''}`}
                          >
                            {active && !sidebarCollapsed && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[#ff8a65] rounded-r-full" />}
                            <item.icon size={15} className="flex-shrink-0" />
                            {!sidebarCollapsed && <span className="text-xs font-medium flex-1 truncate">{item.label}</span>}
                            {!sidebarCollapsed && item.badge && (
                              <span className="bg-[#ff8a65] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{item.badge}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </nav>
                <div className="border-t border-white/10 p-2">
                  <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="w-full flex items-center justify-center py-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all">
                    {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                  </button>
                </div>
              </aside>
            )}

            {/* Sidebar — Tablet (collapsed) */}
            {breakpoint === 'tablet' && (
              <aside className={`${sidebarBg} text-white flex flex-col flex-shrink-0 w-14`}>
                <div className="flex items-center justify-center h-12 border-b border-white/10">
                  <div className="w-7 h-7 bg-[#ff8a65] rounded-lg flex items-center justify-center">
                    <Car size={14} className="text-white" />
                  </div>
                </div>
                <nav className="flex-1 py-2">
                  {ADMIN_NAV.flatMap(g => g.items).map(item => {
                    const active = activeModule === item.path;
                    return (
                      <button
                        key={item.path}
                        onClick={() => navigateTo(item.path)}
                        className={`w-full flex items-center justify-center p-2.5 mb-0.5 mx-1 rounded-lg transition-all ${
                          active ? 'bg-white/15 text-white' : 'text-white/50 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <item.icon size={16} />
                      </button>
                    );
                  })}
                </nav>
              </aside>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Header */}
              <header className={`h-12 ${headerBg} border-b flex items-center px-4 gap-3 flex-shrink-0`}>
                {breakpoint === 'mobile' && (
                  <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`p-1 rounded-lg ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'} transition-colors`}>
                    <Menu size={16} className={textMuted} />
                  </button>
                )}
                <div className={`flex-1 flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs ${darkMode ? 'bg-slate-700 text-slate-400' : 'bg-[#F4F6F8] text-[#6B7280]'}`}>
                  <Search size={12} />
                  <span>Search...</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Online
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#ff5722] flex items-center justify-center text-white text-[10px] font-bold">PN</div>
                </div>
              </header>

              {/* Mobile Menu Overlay */}
              {breakpoint === 'mobile' && mobileMenuOpen && (
                <div className="absolute inset-0 z-50 flex">
                  <div className={`${sidebarBg} w-48 h-full flex flex-col shadow-2xl`}>
                    <div className="flex items-center justify-between px-4 h-12 border-b border-white/10">
                      <AppLogo size={32} />
                      <button onClick={() => setMobileMenuOpen(false)} className="text-white/60 hover:text-white">
                        <X size={16} />
                      </button>
                    </div>
                    <nav className="flex-1 py-2 overflow-y-auto">
                      {ADMIN_NAV.map(group => (
                        <div key={group.group} className="mb-3">
                          <p className="px-4 mb-1 text-[9px] font-bold uppercase tracking-widest text-white/40">{group.group}</p>
                          {group.items.map(item => (
                            <button
                              key={item.path}
                              onClick={() => { navigateTo(item.path); setMobileMenuOpen(false); }}
                              className={`w-full flex items-center gap-2 px-4 py-2 text-xs transition-all ${
                                activeModule === item.path ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              <item.icon size={14} />
                              {item.label}
                            </button>
                          ))}
                        </div>
                      ))}
                    </nav>
                  </div>
                  <div className="flex-1 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
                </div>
              )}

              {/* Content */}
              <main className={`flex-1 overflow-y-auto p-4 ${bg}`}>
                {renderContent()}
              </main>

              {/* Mobile Bottom Nav */}
              {breakpoint === 'mobile' && (
                <div className={`${headerBg} border-t flex items-center justify-around px-2 py-2 flex-shrink-0`}>
                  {[
                    { icon: LayoutDashboard, label: 'Home', path: 'dashboard' },
                    { icon: ClipboardList, label: 'Orders', path: 'orders' },
                    { icon: Bell, label: 'Alerts', path: 'reports' },
                    { icon: UserCircle, label: 'Profile', path: 'inspectors' },
                  ].map(tab => (
                    <button
                      key={tab.path}
                      onClick={() => navigateTo(tab.path)}
                      className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all ${
                        activeModule === tab.path ? 'text-[#ff5722]' : textMuted
                      }`}
                    >
                      <tab.icon size={18} />
                      <span className="text-[9px] font-medium">{tab.label}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    aria-label="Create new order"
                    className="w-9 h-9 rounded-full bg-[#ff5722] flex items-center justify-center shadow-lg hover:bg-[#e64a19] transition-colors"
                  >
                    <Plus size={18} className="text-white" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E7EB]">
              <h3 className="text-lg font-bold text-[#1F2937]">Create New Order</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 hover:bg-[#F4F6F8] rounded-lg transition-colors">
                <X size={18} className="text-[#6B7280]" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {[
                { label: 'Customer Name', placeholder: 'Adaeze Mensah' },
                { label: 'Vehicle (Make/Model/Year)', placeholder: '2019 Toyota Camry' },
                { label: 'Inspection Address', placeholder: '45 Admiralty Way, Lekki' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-sm font-medium text-[#374151] mb-1.5">{f.label}</label>
                  <input placeholder={f.placeholder} className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30 focus:border-[#ff8a65]" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-[#E5E7EB]">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2.5 text-sm border border-[#E5E7EB] rounded-lg hover:bg-[#F4F6F8] transition-colors">Cancel</button>
              <button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2.5 text-sm font-medium bg-[#ff5722] text-white rounded-lg hover:bg-[#ff8a65] transition-colors">Create Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// ─── Section 2: Inspector PWA Navigation ─────────────────────────────────────
function InspectorPWANav() {
  const [activeTab, setActiveTab] = useState(0);
  const [inInspection, setInInspection] = useState(false);

  const TABS = [
    { icon: Home, label: 'Home' },
    { icon: Briefcase, label: 'Jobs' },
    { icon: Bell, label: 'Notifications' },
    { icon: User, label: 'Profile' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
      <h2 className="text-base font-bold text-[#1F2937] mb-1">Section 2 — Inspector PWA Navigation</h2>
      <p className="text-xs text-[#6B7280] mb-5">Bottom nav, active inspection bar, and swipe gesture indicators</p>

      <div className="flex justify-center">
        <div className="w-64 bg-[#1F2937] rounded-[2.5rem] p-2 shadow-2xl">
          <div className="bg-white rounded-[2rem] overflow-hidden" style={{ height: 480 }}>
            {/* Progress bar during inspection */}
            {inInspection && (
              <div className="h-1 bg-[#E5E7EB]">
                <div className="h-full bg-[#ff5722] rounded-full" style={{ width: '44%' }} />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 p-4" style={{ height: inInspection ? 'calc(100% - 52px)' : 'calc(100% - 56px)' }}>
              {!inInspection ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-[#6B7280]">Good morning 👋</p>
                      <p className="text-sm font-bold text-[#1F2937]">Emeka Okonkwo</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#ff8a65] flex items-center justify-center text-white text-xs font-bold">EO</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[{ v: '3', l: 'Jobs Today' }, { v: '1', l: 'Completed' }].map((s, i) => (
                      <div key={i} className="bg-[#F4F6F8] rounded-xl p-2.5 text-center">
                        <p className="text-lg font-bold text-[#1F2937]">{s.v}</p>
                        <p className="text-[10px] text-[#6B7280]">{s.l}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {[
                      { status: 'In Progress', vehicle: '2019 Toyota Camry', time: 'Now' },
                      { status: 'Upcoming', vehicle: '2021 Honda Accord', time: '2:30 PM' },
                    ].map((job, i) => (
                      <div key={i} className="bg-[#F9FAFB] rounded-xl p-3 border border-[#E5E7EB]">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${job.status === 'In Progress' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{job.status}</span>
                          <span className="text-[10px] text-[#6B7280]">{job.time}</span>
                        </div>
                        <p className="text-xs font-semibold text-[#1F2937]">{job.vehicle}</p>
                        {i === 0 && (
                          <button onClick={() => setInInspection(true)} className="mt-2 w-full py-1.5 bg-[#ff5722] text-white text-[10px] font-medium rounded-lg hover:bg-[#ff8a65] transition-colors">
                            Continue Inspection
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <button onClick={() => setInInspection(false)} className="p-1 hover:bg-[#F4F6F8] rounded-lg transition-colors">
                      <ArrowLeft size={16} className="text-[#6B7280]" />
                    </button>
                    <div>
                      <p className="text-xs font-bold text-[#1F2937]">2019 Toyota Camry</p>
                      <p className="text-[10px] text-[#6B7280]">12/27 sections · 44% complete</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['Body Frame', 'Lights', 'Engine', 'Interior', 'Tyres', 'Brakes', 'Suspension', 'Electrical', 'Exhaust'].map((s, i) => (
                      <div key={i} className={`rounded-xl p-2 text-center border ${
                        i < 5 ? 'bg-green-50 border-green-100' : i === 5 ? 'bg-amber-50 border-amber-100' : 'bg-[#F9FAFB] border-[#E5E7EB]'
                      }`}>
                        <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${i < 5 ? 'bg-green-500' : i === 5 ? 'bg-amber-500' : 'bg-gray-300'}`} />
                        <p className="text-[8px] font-medium text-[#374151] leading-tight">{s}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-3">
                    {[0, 1, 2].map(i => (
                      <div key={i} className={`h-1 rounded-full transition-all ${i === 1 ? 'w-4 bg-[#ff5722]' : 'w-2 bg-gray-300'}`} />
                    ))}
                  </div>
                  <p className="text-[9px] text-center text-[#6B7280] mt-1">Swipe to navigate sections</p>
                </div>
              )}
            </div>

            {/* Bottom Nav or Inspection Bar */}
            {!inInspection ? (
              <div className="h-14 bg-white border-t border-[#E5E7EB] flex items-center justify-around px-2">
                {TABS.map((tab, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab(i)}
                    className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all ${activeTab === i ? 'text-[#ff5722]' : 'text-[#6B7280]'}`}
                  >
                    <tab.icon size={18} />
                    <span className="text-[9px] font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="h-12 bg-[#ff5722] flex items-center justify-between px-4">
                <button onClick={() => setInInspection(false)} className="flex items-center gap-1.5 text-white/70 text-[10px] hover:text-white transition-colors">
                  <ArrowLeft size={14} />
                  Back to Overview
                </button>
                <span className="text-white text-[10px] font-semibold">⏱ 8:42</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
// ─── Section 4: Loading Skeletons ─────────────────────────────────────────────
function LoadingSkeletons() {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
      <h2 className="text-base font-bold text-[#1F2937] mb-1">Section 4 — Loading Skeletons</h2>
      <p className="text-xs text-[#6B7280] mb-5">Shimmer skeleton screens matching actual page layouts</p>

      <div className="space-y-6">
        {/* KPI Cards Skeleton */}
        <div>
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">KPI Cards</p>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-4 space-y-2">
                <div className="h-3 bg-[#E5E7EB] rounded-full w-2/3 animate-pulse" />
                <div className="h-7 bg-[#E5E7EB] rounded-full w-1/2 animate-pulse" />
                <div className="h-2.5 bg-[#E5E7EB] rounded-full w-3/4 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Table Skeleton */}
        <div>
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Data Table (5 rows)</p>
          <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
            <div className="px-6 py-3 border-b border-[#E5E7EB] bg-[#F9FAFB] flex gap-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`h-3 bg-[#E5E7EB] rounded-full animate-pulse ${i === 1 ? 'w-8' : i === 2 ? 'w-24' : i === 3 ? 'w-20' : i === 4 ? 'w-16' : 'w-12'}`} />
              ))}
            </div>
            {[1, 2, 3, 4, 5].map(row => (
              <div key={row} className="px-6 py-4 border-b border-[#E5E7EB] last:border-0 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#E5E7EB] animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-[#E5E7EB] rounded-full w-1/3 animate-pulse" />
                  <div className="h-2.5 bg-[#E5E7EB] rounded-full w-1/4 animate-pulse" />
                </div>
                <div className="h-5 w-16 bg-[#E5E7EB] rounded-full animate-pulse" />
                <div className="h-5 w-12 bg-[#E5E7EB] rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
// ─── Section 5: Error States ──────────────────────────────────────────────────
function ErrorStates() {
  const [activeError, setActiveError] = useState<ErrorType>(null);

  const retryDemo = () => {
    toast.success('Connection retry', { description: 'Prototype only — no network call was made.' });
  };

  const clearFiltersDemo = () => {
    toast.info('Filters cleared', { description: 'Adjust search or reset filters to see more vehicles.' });
  };

  const ERROR_TYPES: { key: ErrorType; label: string; color: string }[] = [
    { key: '404', label: '404 Not Found', color: 'bg-blue-100 text-blue-700' },
    { key: '500', label: '500 Server Error', color: 'bg-red-100 text-red-700' },
    { key: 'empty', label: 'Empty Results', color: 'bg-amber-100 text-amber-700' },
    { key: 'network', label: 'Network Error', color: 'bg-orange-100 text-orange-700' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
      <h2 className="text-base font-bold text-[#1F2937] mb-1">Section 5 — Error States</h2>
      <p className="text-xs text-[#6B7280] mb-5">Carschek-branded error pages for all failure scenarios</p>

      <div className="flex gap-2 mb-5 flex-wrap">
        {ERROR_TYPES.map(e => (
          <button
            key={e.key}
            onClick={() => setActiveError(activeError === e.key ? null : e.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all border ${
              activeError === e.key ? 'border-[#ff5722] bg-[#EEF2FF] text-[#ff5722]' : `${e.color} border-transparent`
            }`}
          >
            {e.label}
          </button>
        ))}
      </div>

      {activeError && (
        <div className="bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] p-8 flex flex-col items-center text-center">
          {activeError === '404' && (
            <>
              <div className="text-6xl mb-4">🚗</div>
              <h3 className="text-xl font-bold text-[#1F2937] mb-2">This page went off-road</h3>
              <p className="text-sm text-[#6B7280] mb-5">The page you're looking for doesn't exist or has been moved.</p>
              <Link href="/admin-dashboard" className="px-5 py-2.5 bg-[#ff5722] text-white text-sm font-medium rounded-xl hover:bg-[#ff8a65] transition-colors">
                Back to Dashboard
              </Link>
            </>
          )}
          {activeError === '500' && (
            <>
              <div className="text-6xl mb-4">⚙️</div>
              <h3 className="text-xl font-bold text-[#1F2937] mb-2">Something went wrong on our end</h3>
              <p className="text-sm text-[#6B7280] mb-5">Our team has been notified and is working on a fix.</p>
              <button
                type="button"
                onClick={retryDemo}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#ff5722] text-white text-sm font-medium rounded-xl hover:bg-[#ff8a65] transition-colors"
              >
                <RefreshCw size={15} />
                Retry
              </button>
            </>
          )}
          {activeError === 'empty' && (
            <>
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-[#1F2937] mb-2">No results for "Toyota 2025"</h3>
              <p className="text-sm text-[#6B7280] mb-5">Try adjusting your search or clearing the filters.</p>
              <button
                type="button"
                onClick={clearFiltersDemo}
                className="px-5 py-2.5 border border-[#E5E7EB] text-[#374151] text-sm font-medium rounded-xl hover:bg-[#F4F6F8] transition-colors"
              >
                Clear Filters
              </button>
            </>
          )}
          {activeError === 'network' && (
            <>
              <div className="text-6xl mb-4">📡</div>
              <h3 className="text-xl font-bold text-[#1F2937] mb-2">You appear to be offline</h3>
              <p className="text-sm text-[#6B7280] mb-5">Check your internet connection and try again.</p>
              <button
                type="button"
                onClick={retryDemo}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#ff5722] text-white text-sm font-medium rounded-xl hover:bg-[#ff8a65] transition-colors"
              >
                <RefreshCw size={15} />
                Retry
              </button>
            </>
          )}
        </div>
      )}

      {!activeError && (
        <div className="bg-[#F9FAFB] rounded-xl border border-dashed border-[#E5E7EB] p-6 text-center">
          <p className="text-sm text-[#6B7280]">Select an error type above to preview the error state</p>
        </div>
      )}
    </div>
  );
}
// ─── Section 3: Page Transitions ─────────────────────────────────────────────
function PageTransitions() {
  const [activeTransition, setActiveTransition] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  const TRANSITIONS = [
    { key: 'route', label: 'Route Change', desc: 'Fade out 100ms → Fade in 200ms', color: 'bg-blue-100 text-blue-700' },
    { key: 'modal', label: 'Modal Open', desc: 'Scale 0.95→1.0 + fade, 200ms', color: 'bg-purple-100 text-purple-700' },
    { key: 'panel', label: 'Side Panel', desc: 'Slide in from right, 250ms', color: 'bg-teal-100 text-teal-700' },
    { key: 'sheet', label: 'Bottom Sheet', desc: 'Slide up from bottom, 200ms', color: 'bg-amber-100 text-amber-700' },
    { key: 'toast', label: 'Toast', desc: 'Slide in from top-right, 300ms', color: 'bg-green-100 text-green-700' },
  ];

  const play = (key: string) => {
    setActiveTransition(key);
    setPlaying(true);
    setTimeout(() => setPlaying(false), 1500);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
      <h2 className="text-base font-bold text-[#1F2937] mb-1">Section 3 — Page Transitions</h2>
      <p className="text-xs text-[#6B7280] mb-5">Animation specifications for all UI transitions</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {TRANSITIONS.map(t => (
          <div key={t.key} className="border border-[#E5E7EB] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${t.color}`}>{t.label}</span>
              <button
                onClick={() => play(t.key)}
                disabled={playing}
                className={`p-1.5 rounded-lg transition-all ${playing && activeTransition === t.key ? 'bg-[#ff5722] text-white' : 'hover:bg-[#F4F6F8] text-[#6B7280]'}`}
              >
                <Play size={12} />
              </button>
            </div>
            <p className="text-xs text-[#6B7280]">{t.desc}</p>
            {/* Mini animation preview */}
            <div className="mt-3 h-8 bg-[#F4F6F8] rounded-lg overflow-hidden relative">
              {playing && activeTransition === t.key && (
                <div className={`absolute inset-0 bg-[#ff8a65]/20 rounded-lg ${
                  t.key === 'route' ? 'animate-pulse' :
                  t.key === 'modal'? 'animate-ping' : 'animate-pulse'
                }`} />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap size={14} className={`transition-all ${playing && activeTransition === t.key ? 'text-[#ff8a65]' : 'text-[#E5E7EB]'}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AppNavigationPage() {
  return (
    <AppLayout currentPath="/app-navigation">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1F2937]">App Navigation & Responsive System</h1>
        <p className="text-sm text-[#6B7280] mt-1">Section 20 — Complete navigation integration, responsive breakpoints, transitions, loading states, and error handling.</p>
      </div>

      <div className="space-y-6">
        <AdminNavDemo />
        <InspectorPWANav />
        <PageTransitions />
        <LoadingSkeletons />
        <ErrorStates />
      </div>
    </AppLayout>
  );
}
