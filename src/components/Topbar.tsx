'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Bell, Menu, Wifi, WifiOff, ChevronDown, X, Sun, Moon, Command, Car, ClipboardList, Users, UserCircle, Check } from 'lucide-react';
import Link from 'next/link';
import { NOTIFICATIONS, CARS, CUSTOMERS, ORDERS, INSPECTORS } from '@/lib/mockData';

interface TopbarProps {
  onMenuToggle: () => void;
  mobileSidebarOpen?: boolean;
  pageTitle?: string;
}

const SEARCH_DATA = [
  ...CARS.map(c => ({ type: 'Car', label: `${c.brand} ${c.model} ${c.year}`, sub: c.id, href: `/cars/${c.id}`, icon: Car })),
  ...CUSTOMERS.map(c => ({ type: 'Customer', label: c.name, sub: c.email, href: `/customers/${c.id}`, icon: UserCircle })),
  ...ORDERS.map(o => ({ type: 'Order', label: o.id, sub: o.vehicle, href: `/orders/${o.id}`, icon: ClipboardList })),
  ...INSPECTORS.map(i => ({ type: 'Inspector', label: i.name, sub: i.zone.join(', '), href: `/inspectors/${i.id}`, icon: Users })),
];

export default function Topbar({ onMenuToggle, mobileSidebarOpen, pageTitle }: TopbarProps) {
  const [online] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof SEARCH_DATA>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const searchRef = useRef<HTMLInputElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  const openSearch = useCallback(() => {
    setSearchOpen(true);
    setTimeout(() => searchRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setNotifOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openSearch]);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const q = searchQuery.toLowerCase();
    setSearchResults(SEARCH_DATA.filter(d =>
      d.label.toLowerCase().includes(q) || d.sub.toLowerCase().includes(q) || d.type.toLowerCase().includes(q)
    ).slice(0, 8));
    setSelectedIdx(0);
  }, [searchQuery]);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const notifTypeIcon: Record<string, string> = {
    order: '📋', report: '📄', payment: '💰', auction: '🔨', system: '⚙️',
  };

  return (
    <>
      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden animate-fade-in">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E7EB]">
              <Search size={18} className="text-[#6B7280] flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search cars, customers, orders, inspectors…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'ArrowDown') setSelectedIdx(i => Math.min(i + 1, searchResults.length - 1));
                  if (e.key === 'ArrowUp') setSelectedIdx(i => Math.max(i - 1, 0));
                }}
                className="flex-1 text-sm text-[#1F2937] placeholder-[#9CA3AF] outline-none bg-transparent"
              />
              <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 bg-[#F4F6F8] rounded text-[10px] text-[#6B7280] font-mono">Esc</kbd>
            </div>
            {searchResults.length > 0 ? (
              <div className="max-h-80 overflow-y-auto py-2">
                {searchResults.map((r, i) => (
                  <Link
                    key={`sr-${i}`}
                    href={r.href}
                    onClick={() => setSearchOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 hover:bg-[#F4F6F8] transition-colors ${i === selectedIdx ? 'bg-[#F4F6F8]' : ''}`}
                  >
                    <span className="text-[10px] font-semibold text-[#6B7280] bg-[#F4F6F8] px-1.5 py-0.5 rounded w-16 text-center flex-shrink-0">{r.type}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1F2937] truncate">{r.label}</p>
                      <p className="text-xs text-[#6B7280] truncate">{r.sub}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="px-4 py-8 text-center text-sm text-[#6B7280]">No results for &quot;{searchQuery}&quot;</div>
            ) : (
              <div className="px-4 py-4">
                <p className="text-xs font-semibold text-[#6B7280] mb-2">Quick Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Register New Car', href: '/cars/new' },
                    { label: 'New Order', href: '/orders/new' },
                    { label: 'Add Customer', href: '/customers' },
                    { label: 'View Dashboard', href: '/dashboard' },
                  ].map(a => (
                    <Link key={a.href} href={a.href} onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 bg-[#F4F6F8] rounded-lg text-sm text-[#1F2937] hover:bg-[#E5E7EB] transition-colors">
                      {a.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center px-3 sm:px-6 gap-2 sm:gap-4 flex-shrink-0 z-30 relative">
        {/* Hamburger */}
        <button
          onClick={onMenuToggle}
          className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          aria-label="Toggle menu"
        >
          {mobileSidebarOpen ? <X size={20} className="text-[#6B7280]" /> : <Menu size={20} className="text-[#6B7280]" />}
        </button>

        {/* Page title on desktop */}
        {pageTitle && (
          <h1 className="hidden md:block text-base font-semibold text-[#1F2937] truncate">{pageTitle}</h1>
        )}

        {/* Search bar */}
        <button
          onClick={openSearch}
          className="hidden sm:flex flex-1 max-w-sm items-center gap-2 px-3 py-2 bg-[#F4F6F8] border border-[#E5E7EB] rounded-lg text-sm text-[#9CA3AF] hover:border-[#2E75B6] transition-colors"
        >
          <Search size={15} />
          <span className="flex-1 text-left">Search…</span>
          <kbd className="flex items-center gap-0.5 text-[10px] font-mono text-[#9CA3AF]">
            <Command size={10} />K
          </kbd>
        </button>

        {/* Mobile search */}
        <button onClick={openSearch} className="sm:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100">
          <Search size={20} className="text-[#6B7280]" />
        </button>

        <div className="flex items-center gap-1 sm:gap-2 ml-auto">
          {/* Online status */}
          <div className={`hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${online ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {online ? <Wifi size={11} /> : <WifiOff size={11} />}
            <span>{online ? 'Online' : 'Offline'}</span>
          </div>
          <div className={`sm:hidden w-2.5 h-2.5 rounded-full ${online ? 'bg-green-500' : 'bg-red-500'}`} />

          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(d => !d)}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-[#F4F6F8] transition-colors"
          >
            {darkMode ? <Sun size={17} className="text-[#6B7280]" /> : <Moon size={17} className="text-[#6B7280]" />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setNotifOpen(o => !o); setUserMenuOpen(false); }}
              className="relative min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-[#F4F6F8] transition-colors"
            >
              <Bell size={17} className="text-[#6B7280]" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#C0392B] rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-[340px] bg-white rounded-xl shadow-2xl border border-[#E5E7EB] z-50 animate-fade-in overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-[#1F2937]">Notifications</h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-[#2E75B6] hover:underline flex items-center gap-1">
                          <Check size={12} /> Mark all read
                        </button>
                      )}
                      <Link href="/notifications" onClick={() => setNotifOpen(false)} className="text-xs text-[#2E75B6] hover:underline">View all</Link>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.slice(0, 6).map(n => (
                      <Link
                        key={n.id}
                        href={n.link}
                        onClick={() => { markRead(n.id); setNotifOpen(false); }}
                        className={`flex items-start gap-3 px-4 py-3 hover:bg-[#F4F6F8] border-b border-[#F4F6F8] last:border-0 transition-colors ${!n.read ? 'bg-blue-50/50' : ''}`}
                      >
                        <span className="text-lg flex-shrink-0 mt-0.5">{notifTypeIcon[n.type] || '🔔'}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium ${!n.read ? 'text-[#1F2937]' : 'text-[#6B7280]'} truncate`}>{n.title}</p>
                          <p className="text-[11px] text-[#6B7280] mt-0.5 line-clamp-2">{n.description}</p>
                          <p className="text-[10px] text-[#9CA3AF] mt-1">{n.time}</p>
                        </div>
                        {!n.read && <span className="w-2 h-2 bg-[#2E75B6] rounded-full flex-shrink-0 mt-1.5" />}
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => { setUserMenuOpen(o => !o); setNotifOpen(false); }}
              className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-[#E5E7EB] cursor-pointer min-h-[44px] hover:bg-[#F4F6F8] rounded-lg px-2 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">PN</div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-[#1F2937]">Promise Ndem</p>
                <p className="text-[10px] text-[#6B7280]">Super Admin</p>
              </div>
              <ChevronDown size={14} className="hidden sm:block text-[#6B7280]" />
            </button>
            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-2xl border border-[#E5E7EB] z-50 animate-fade-in overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#E5E7EB]">
                    <p className="text-sm font-semibold text-[#1F2937]">Promise Ndem</p>
                    <p className="text-xs text-[#6B7280]">promise@carschek.com</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Super Admin</span>
                  </div>
                  <div className="py-1">
                    {[
                      { label: 'Profile', href: '/users/USR-001' },
                      { label: 'Settings', href: '/settings' },
                      { label: 'Switch to Inspector Mode', href: '/inspector/jobs' },
                    ].map(item => (
                      <Link key={item.href} href={item.href} onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-[#1F2937] hover:bg-[#F4F6F8] transition-colors">
                        {item.label}
                      </Link>
                    ))}
                    <div className="border-t border-[#E5E7EB] mt-1 pt-1">
                      <Link href="/login" className="block px-4 py-2.5 text-sm text-[#C0392B] hover:bg-red-50 transition-colors">
                        Logout
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}