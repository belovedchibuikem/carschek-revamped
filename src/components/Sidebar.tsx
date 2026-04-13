'use client';
import React from 'react';
import Link from 'next/link';

import { LayoutDashboard, ClipboardList, Users, FileText, UserCircle, Car, Handshake, DollarSign, Bell, Settings, ChevronLeft, ChevronRight, LogOut, Palette, Smartphone, FileBarChart, BarChart2, WifiOff, Zap, Navigation, Receipt, X, Gavel, Database, Users2, Tag, TabletSmartphone } from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'Operations',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/admin-dashboard', badge: null },
      { icon: ClipboardList, label: 'Orders', path: '/inspection-orders-management', badge: '12' },
      { icon: Users, label: 'Inspectors', path: '/inspector-management', badge: null },
      { icon: FileText, label: 'Reports', path: '/inspection-reports-qa', badge: '5' },
    ],
  },
  {
    label: 'Cars',
    items: [
      { icon: Car, label: 'Cars', path: '/cars', badge: '33' },
      { icon: Gavel, label: 'Auctions', path: '/auctions', badge: null },
      { icon: Tag, label: 'Offers', path: '/offers', badge: null },
      { icon: Database, label: 'Reference Data', path: '/reference-data', badge: null },
    ],
  },
  {
    label: 'CRM',
    items: [
      { icon: Users2, label: 'CRM Contacts', path: '/crm', badge: null },
      { icon: UserCircle, label: 'Customers', path: '/customer-management', badge: null },
      { icon: Car, label: 'Listings', path: '/vehicle-listings', badge: null },
      { icon: Handshake, label: 'Deals', path: '/deal-pipeline', badge: '3' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { icon: DollarSign, label: 'Finance', path: '/finance', badge: null },
      { icon: Receipt, label: 'Invoices', path: '/invoices', badge: null },
      { icon: Bell, label: 'Notifications', path: '/notifications', badge: '8' },
    ],
  },
  {
    label: 'Reports',
    items: [
      { icon: FileBarChart, label: 'Report Templates', path: '/report-templates', badge: null },
      { icon: BarChart2, label: 'Investor Dashboard', path: '/investor-dashboard', badge: null },
    ],
  },
  {
    label: 'Inspector App',
    items: [
      { icon: TabletSmartphone, label: 'Inspector Mobile App', path: '/inspector-app', badge: 'NEW' },
      { icon: Smartphone, label: 'Inspector PWA', path: '/inspector-pwa', badge: null },
      { icon: WifiOff, label: 'Offline & PWA', path: '/offline-pwa', badge: null },
      { icon: Zap, label: 'AI Inspector Tools', path: '/ai-inspector-tools', badge: null },
    ],
  },
  {
    label: 'System',
    items: [
      { icon: Settings, label: 'Settings', path: '/settings', badge: null },
      { icon: Navigation, label: 'App Navigation', path: '/app-navigation', badge: null },
      { icon: Palette, label: 'Design System', path: '/design-system', badge: null },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  currentPath: string;
  onMobileClose?: () => void;
}

export default function Sidebar({ collapsed, onToggle, currentPath, onMobileClose }: SidebarProps) {
  return (
    <aside
      className={`
        flex flex-col bg-[#1E3A5F] text-white transition-all duration-300 ease-in-out flex-shrink-0 h-full
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-white/10 flex-shrink-0 ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="w-8 h-8 bg-[#2E75B6] rounded-lg flex items-center justify-center flex-shrink-0">
          <Car size={16} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-heading font-800 text-lg tracking-tight text-white flex-1">CARSCHEK</span>
        )}
        {/* Mobile close button */}
        {!collapsed && onMobileClose && (
          <button
            onClick={onMobileClose}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
            aria-label="Close menu"
          >
            <X size={18} className="text-white/70" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        {NAV_GROUPS.map(group => (
          <div key={`group-${group.label}`} className="mb-6">
            {!collapsed && (
              <p className="px-4 mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                {group.label}
              </p>
            )}
            {group.items.map(item => {
              const active = currentPath === item.path;
              return (
                <Link
                  key={`nav-${item.path}-${item.label}`}
                  href={item.path}
                  onClick={onMobileClose}
                  className={`
                    relative flex items-center gap-3 mx-2 px-3 rounded-lg mb-0.5 transition-all duration-150 group
                    min-h-[48px]
                    ${active
                      ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#2E75B6] rounded-r-full" />}
                  <item.icon size={18} className="flex-shrink-0" />
                  {!collapsed && (
                    <span className="text-sm font-medium flex-1 truncate">{item.label}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span className="bg-[#2E75B6] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {item.badge}
                    </span>
                  )}
                  {collapsed && item.badge && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-[#2E75B6] rounded-full" />
                  )}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-[#1F2937] text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/10 p-3 flex-shrink-0">
        <button
          onClick={onToggle}
          className="w-full hidden md:flex items-center justify-center gap-2 py-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all text-xs min-h-[40px]"
        >
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Collapse</span></>}
        </button>
        <div className={`mt-2 flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/10 transition-all min-h-[48px] ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-[#2E75B6] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            PN
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">Promise Ndem</p>
              <p className="text-[10px] text-white/50 truncate">Super Admin</p>
            </div>
          )}
          {!collapsed && (
            <a href="/authentication-screen" title="Sign Out"
              className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-white/20 transition-colors flex-shrink-0"
              onClick={(e) => { e.preventDefault(); window.location.href = '/authentication-screen'; }}>
              <LogOut size={14} className="text-white/60 hover:text-white" />
            </a>
          )}
        </div>
      </div>
    </aside>
  );
}