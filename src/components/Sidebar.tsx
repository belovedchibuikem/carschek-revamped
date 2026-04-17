'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { isAppointmentUnconfirmed } from '@/lib/appointments/logic';
import type { Appointment } from '@/lib/appointments/types';
import {
  LayoutDashboard, ClipboardList, Users, FileText, Car, Gavel, UserCircle,
  MessageSquare, Tag, ShoppingBag, Handshake, DollarSign, Bell, Settings,
  ChevronLeft, ChevronRight, ChevronDown, LogOut, X, Database, Calendar, BarChart2,
  Activity, Shield, Layers, BookOpen, Smartphone, ArrowRightLeft, FileEdit, TrendingUp, Briefcase,
} from 'lucide-react';

type NavSubItem = { label: string; path: string; unconfirmedBadge?: boolean };

type NavItem = {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  path: string;
  badge: string | null;
  subItems?: NavSubItem[];
};

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', badge: null },
      { icon: Briefcase, label: 'Ops Dashboard', path: '/admin-dashboard', badge: null },
    ],
  },
  {
    label: 'Operations',
    items: [
      { icon: ClipboardList, label: 'Inspection Orders', path: '/orders', badge: '12' },
      { icon: Smartphone, label: 'Inspector App', path: '/inspector-app', badge: null },
      { icon: Users, label: 'Inspectors', path: '/inspectors', badge: null },
      { icon: FileText, label: 'Reports', path: '/reports', badge: '5' },
      {
        icon: Calendar,
        label: 'Appointments',
        path: '/appointments',
        badge: null,
        subItems: [
          { label: 'All appointments', path: '/appointments' },
          { label: 'Confirmed', path: '/appointments/confirmed' },
          { label: 'Unconfirmed', path: '/appointments/unconfirmed', unconfirmedBadge: true },
          { label: 'Inspected', path: '/appointments/inspected' },
        ],
      },
    ],
  },
  {
    label: 'Cars',
    items: [
      { icon: Car, label: 'Cars', path: '/cars', badge: null },
      { icon: Gavel, label: 'Auctions', path: '/auctions', badge: null },
    ],
  },
  {
    label: 'Customers',
    items: [
      { icon: UserCircle, label: 'Customers', path: '/customers', badge: null },
      { icon: MessageSquare, label: 'CRM', path: '/crm', badge: null },
      { icon: Tag, label: 'Offers', path: '/offers', badge: null },
    ],
  },
  {
    label: 'Marketplace',
    items: [
      { icon: ShoppingBag, label: 'Listings', path: '/listings', badge: null },
      { icon: Handshake, label: 'Deals', path: '/deals', badge: '3' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { icon: DollarSign, label: 'Finance', path: '/finance', badge: null },
    ],
  },
  {
    label: 'Reference Data',
    items: [
      { icon: Layers, label: 'Brands', path: '/reference/brands', badge: null },
      { icon: BookOpen, label: 'Car Models', path: '/reference/models', badge: null },
      { icon: Database, label: 'Car Years', path: '/reference/years', badge: null },
    ],
  },
  {
    label: 'System',
    items: [
      { icon: Bell, label: 'Notifications', path: '/notifications', badge: '8' },
      { icon: Activity, label: 'Activity Log', path: '/activity', badge: null },
      { icon: Shield, label: 'Users', path: '/users', badge: null },
      { icon: BarChart2, label: 'Analytics', path: '/analytics', badge: null },
      { icon: TrendingUp, label: 'Investor', path: '/investor-dashboard', badge: null },
      { icon: FileEdit, label: 'Drafts', path: '/drafts', badge: null },
      { icon: ArrowRightLeft, label: 'Data Migration', path: '/settings/migration', badge: null },
      { icon: Settings, label: 'Settings', path: '/settings', badge: null },
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
  const [unconfirmedApt, setUnconfirmedApt] = useState<number | null>(null);
  /** Submenus (e.g. Appointments) start collapsed; open via chevron only */
  const [expandedBranches, setExpandedBranches] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    fetch('/api/appointments', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : null))
      .then((j: { appointments?: Appointment[] } | null) => {
        if (cancelled || !j?.appointments) return;
        setUnconfirmedApt(j.appointments.filter(isAppointmentUnconfirmed).length);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const isActive = (path: string) => {
    if (path === '/dashboard') return currentPath === '/dashboard' || currentPath === '/';
    if (path === '/admin-dashboard') return currentPath.startsWith('/admin-dashboard');
    if (path === '/settings') {
      return currentPath === '/settings' || currentPath === '/settings/';
    }
    if (path === '/settings/migration') return currentPath.startsWith('/settings/migration');
    if (path === '/drafts') return currentPath.startsWith('/drafts');
    if (path === '/investor-dashboard') return currentPath.startsWith('/investor-dashboard');
    return currentPath.startsWith(path);
  };

  return (
    <aside
      className={`
        flex flex-col bg-[#1E3A5F] text-white transition-all duration-300 ease-in-out flex-shrink-0 h-full
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-white/10 flex-shrink-0 ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <Link
          href="/dashboard"
          onClick={onMobileClose}
          className={`flex items-center gap-3 min-w-0 rounded-lg flex-1 focus-visible:ring-offset-[#1E3A5F] ${collapsed ? 'justify-center flex-none' : ''}`}
        >
          <div className="w-8 h-8 bg-[#2E75B6] rounded-lg flex items-center justify-center flex-shrink-0">
            <Car size={16} className="text-white" />
          </div>
          {!collapsed && (
            <span className="font-heading font-bold text-lg tracking-tight text-white flex-1 truncate">CARSCHEK</span>
          )}
        </Link>
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
          <div key={`group-${group.label}`} className="mb-5">
            {!collapsed && (
              <p className="px-4 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/35">
                {group.label}
              </p>
            )}
            {group.items.map(item => {
              if (item.subItems?.length) {
                const branchActive =
                  isActive(item.path) || item.subItems.some(s => currentPath.startsWith(s.path));
                const branchOpen = expandedBranches[item.path] === true;

                if (collapsed) {
                  return (
                    <Link
                      key={`nav-branch-${item.path}`}
                      href={item.path}
                      onClick={onMobileClose}
                      className={`
                        relative flex items-center justify-center gap-3 mx-2 px-3 rounded-lg mb-0.5 transition-all duration-150 group
                        min-h-[40px] focus-visible:ring-offset-[#1E3A5F]
                        ${branchActive
                          ? 'bg-white/15 text-white'
                          : 'text-white/60 hover:bg-white/10 hover:text-white'
                        }
                      `}
                      title={item.label}
                    >
                      {branchActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#2E75B6] rounded-r-full" />
                      )}
                      <item.icon size={17} className="flex-shrink-0" />
                      <div className="absolute left-full ml-2 px-2 py-1 bg-[#1F2937] text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                        {item.label}
                      </div>
                    </Link>
                  );
                }

                return (
                  <div key={`nav-branch-${item.path}`} className="mb-1">
                    <div
                      className={`
                        flex items-stretch mx-2 rounded-lg mb-0.5 transition-all duration-150 overflow-hidden
                        ${branchActive ? 'bg-white/15 text-white' : 'text-white/60'}
                      `}
                    >
                      <Link
                        href={item.path}
                        onClick={onMobileClose}
                        className={`
                          relative flex flex-1 items-center gap-3 min-w-0 pl-3 pr-1 py-2 min-h-[40px] focus-visible:ring-offset-[#1E3A5F]
                          ${branchActive ? 'text-white' : 'hover:bg-white/10 hover:text-white'}
                        `}
                      >
                        {branchActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#2E75B6] rounded-r-full" />
                        )}
                        <item.icon size={17} className="flex-shrink-0" />
                        <span className="text-sm font-medium flex-1 truncate">{item.label}</span>
                      </Link>
                      <button
                        type="button"
                        onClick={e => {
                          e.preventDefault();
                          setExpandedBranches(prev => ({ ...prev, [item.path]: !prev[item.path] }));
                        }}
                        aria-expanded={branchOpen}
                        aria-label={branchOpen ? `Collapse ${item.label} submenu` : `Expand ${item.label} submenu`}
                        className={`
                          flex-shrink-0 px-2 flex items-center justify-center rounded-r-lg transition-colors
                          ${branchActive ? 'hover:bg-white/10 text-white' : 'hover:bg-white/10 hover:text-white text-white/70'}
                        `}
                      >
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-200 ${branchOpen ? 'rotate-180' : ''}`}
                          aria-hidden
                        />
                      </button>
                    </div>
                    {branchOpen &&
                      item.subItems.map(sub => {
                        const subActive = currentPath === sub.path || currentPath.startsWith(`${sub.path}/`);
                        const uBadge =
                          sub.unconfirmedBadge && unconfirmedApt != null && unconfirmedApt > 0
                            ? unconfirmedApt
                            : null;
                        return (
                          <Link
                            key={`nav-${sub.path}`}
                            href={sub.path}
                            onClick={onMobileClose}
                            className={`
                              relative flex items-center gap-2 mx-2 pl-9 pr-3 rounded-lg mb-0.5 transition-all duration-150
                              min-h-[36px] text-[13px]
                              ${subActive ? 'bg-white/10 text-white' : 'text-white/55 hover:bg-white/10 hover:text-white'}
                            `}
                          >
                            {subActive && (
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[#2E75B6] rounded-r-full" />
                            )}
                            <span className="flex-1 truncate">{sub.label}</span>
                            {uBadge != null && (
                              <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                {uBadge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                  </div>
                );
              }

              const active = isActive(item.path);
              return (
                <Link
                  key={`nav-${item.path}`}
                  href={item.path}
                  onClick={onMobileClose}
                  className={`
                    relative flex items-center gap-3 mx-2 px-3 rounded-lg mb-0.5 transition-all duration-150 group
                    min-h-[40px] focus-visible:ring-offset-[#1E3A5F]
                    ${active
                      ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#2E75B6] rounded-r-full" />}
                  <item.icon size={17} className="flex-shrink-0" />
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
                    <div className="absolute left-full ml-2 px-2 py-1 bg-[#1F2937] text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
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
          className="w-full hidden md:flex items-center justify-center gap-2 py-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all text-xs min-h-[36px]"
        >
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Collapse</span></>}
        </button>
        <Link
          href="/authentication-screen"
          className={`mt-2 flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/10 cursor-pointer transition-all min-h-[44px] ${collapsed ? 'justify-center' : ''}`}
        >
          <div className="w-8 h-8 rounded-full bg-[#2E75B6] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            PN
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">Promise Ndem</p>
              <p className="text-[10px] text-white/50 truncate">Super Admin</p>
            </div>
          )}
          {!collapsed && <LogOut size={14} className="text-white/40 flex-shrink-0" />}
        </Link>
      </div>
    </aside>
  );
}