'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Bell, Menu, ChevronDown, X, Sun, Moon, Command, Check } from 'lucide-react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

import { useOnlineStatus } from '@/components/providers/NetworkProvider';
import { clearCarschekSessionCookies } from '@/lib/auth/session';
import { clearAccessToken } from '@/lib/api/client';
import { authApi, notificationsApi } from '@/lib/api/services';
import { getSyncQueuePendingCount } from '@/lib/db/sync';
import { NetworkStatusChip } from '@/components/network/NetworkStatusChip';
import { RecentlyViewedMenu } from '@/components/shared/RecentlyViewedMenu';
import { useCommandPaletteStore } from '@/stores/commandPaletteStore';

interface TopbarProps {
  onMenuToggle: () => void;
  mobileSidebarOpen?: boolean;
  pageTitle?: string;
}

const SIMULATED_NOTIFICATION_POOL = [
  {
    title: 'New booking: Chidi Obi — 2018 Honda Accord, Lagos',
    description: 'Inspection scheduled for tomorrow 10:00 AM',
    type: 'order' as const,
    link: '/orders/ORD-1894',
  },
  {
    title: 'Inspection complete: Emeka A. scored CK-41 at 78/100',
    description: 'Report submitted and awaiting QA',
    type: 'report' as const,
    link: '/reports/RPT-445',
  },
  {
    title: 'Payment received: ₦5,100,000 for deal #D-089',
    description: 'Funds cleared to escrow',
    type: 'payment' as const,
    link: '/finance',
  },
  {
    title: 'New bid on auction CK-38: ₦4,200,000 by AOR Autos',
    description: 'Auction AUC-001',
    type: 'auction' as const,
    link: '/auctions/AUC-001',
  },
  {
    title: 'Report flagged for QA by Inspector Tunde',
    description: 'RPT-446 needs review',
    type: 'report' as const,
    link: '/reports/RPT-446',
  },
];

export default function Topbar({ onMenuToggle, mobileSidebarOpen, pageTitle }: TopbarProps) {
  const router = useRouter();
  const { online, retrySync } = useOnlineStatus();
  const [notifOpen, setNotifOpen] = useState(false);
  const setCommandPaletteOpen = useCommandPaletteStore(s => s.setOpen);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Awaited<ReturnType<typeof notificationsApi.list>>>([]);
  const [syncPending, setSyncPending] = useState(0);
  const [syncRunning, setSyncRunning] = useState(false);

  const runSyncNow = useCallback(() => {
    setSyncRunning(true);
    void retrySync()
      .then(() => getSyncQueuePendingCount().then(setSyncPending))
      .finally(() => setSyncRunning(false));
  }, [retrySync]);

  const openSearch = useCallback(() => {
    setCommandPaletteOpen(true);
  }, [setCommandPaletteOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setNotifOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openSearch]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void notificationsApi
      .list()
      .then(list => {
        if (!cancelled) setNotifications(list);
      })
      .catch(() => {
        /* keep empty on failure */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      void getSyncQueuePendingCount().then(n => {
        if (!cancelled) setSyncPending(n);
      });
    };
    refresh();
    const id = window.setInterval(refresh, 10_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  /** Simulated real-time notification (spec: ~45s cadence). */
  useEffect(() => {
    const id = window.setInterval(() => {
      const pick = SIMULATED_NOTIFICATION_POOL[Math.floor(Math.random() * SIMULATED_NOTIFICATION_POOL.length)];
      if (!pick) return;
      const nid = `N-sim-${Date.now()}`;
      setNotifications(prev => [
        {
          id: nid,
          type: pick.type,
          title: pick.title,
          description: pick.description,
          time: '2m ago',
          read: false,
          link: pick.link,
        },
        ...prev,
      ].slice(0, 24));
    }, 45000);
    return () => window.clearInterval(id);
  }, []);

  const isDark = mounted && (resolvedTheme === 'dark' || theme === 'dark');
  const toggleDarkMode = () => setTheme(isDark ? 'light' : 'dark');

  const markAllRead = () => {
    void notificationsApi.markAllRead().catch(() => undefined);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };
  const markRead = (id: string) => {
    void notificationsApi.markRead(id).catch(() => undefined);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const notifTypeIcon: Record<string, string> = {
    order: '📋',
    report: '📄',
    payment: '💰',
    auction: '🔨',
    system: '⚙️',
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    void authApi.logout().catch(() => clearAccessToken());
    clearAccessToken();
    clearCarschekSessionCookies();
    setUserMenuOpen(false);
    router.push('/authentication-screen');
  };

  return (
    <>
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-[#E5E7EB] dark:border-slate-700 flex items-center px-3 sm:px-6 gap-2 sm:gap-4 flex-shrink-0 z-30 relative">
        <button
          onClick={onMenuToggle}
          className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
          aria-label="Toggle menu"
        >
          {mobileSidebarOpen ? <X size={20} className="text-[#6B7280]" /> : <Menu size={20} className="text-[#6B7280]" />}
        </button>

        {pageTitle && (
          <h1 className="hidden md:block text-base font-semibold text-[#1F2937] dark:text-slate-100 truncate">{pageTitle}</h1>
        )}

        <button
          onClick={openSearch}
          className="hidden sm:flex flex-1 max-w-sm items-center gap-2 px-3 py-2 bg-[#F4F6F8] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 rounded-lg text-sm text-[#9CA3AF] hover:border-[#ff8a65] transition-colors"
        >
          <Search size={15} />
          <span className="flex-1 text-left">Search…</span>
          <kbd className="flex items-center gap-0.5 text-[10px] font-mono text-[#9CA3AF]">
            <Command size={10} />K
          </kbd>
        </button>

        <button onClick={openSearch} className="sm:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
          <Search size={20} className="text-[#6B7280]" />
        </button>

        <div className="flex items-center gap-1 sm:gap-2 ml-auto">
          <div className="hidden sm:flex items-center gap-2 rounded-full px-2.5 py-1">
            <NetworkStatusChip />
            {syncPending > 0 && (
              <button
                type="button"
                onClick={runSyncNow}
                disabled={syncRunning || !online}
                className="inline-flex items-center rounded-full bg-[#ff5722]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#ff5722] dark:bg-slate-700 dark:text-slate-200 hover:bg-[#ff5722]/20 disabled:opacity-50"
                title={online ? 'Sync now (offline queue)' : 'Go online to sync'}
              >
                {syncRunning ? '…' : `${syncPending} sync`}
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 sm:hidden">
            <NetworkStatusChip />
            {syncPending > 0 && online && (
              <button
                type="button"
                onClick={runSyncNow}
                disabled={syncRunning}
                className="text-[10px] font-semibold text-[#ff5722]"
              >
                {syncRunning ? '…' : `${syncPending}`}
              </button>
            )}
          </div>

          <RecentlyViewedMenu />

          <button
            type="button"
            onClick={toggleDarkMode}
            aria-pressed={isDark}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-[#F4F6F8] dark:hover:bg-slate-800 transition-colors"
          >
            {isDark ? <Sun size={17} className="text-[#6B7280]" /> : <Moon size={17} className="text-[#6B7280]" />}
          </button>

          <div className="relative">
            <button
              onClick={() => {
                setNotifOpen(o => !o);
                setUserMenuOpen(false);
              }}
              className="relative min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-[#F4F6F8] dark:hover:bg-slate-800 transition-colors"
            >
              <Bell size={17} className="text-[#6B7280]" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#C0392B] rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-[min(100vw-2rem,400px)] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-[#E5E7EB] dark:border-slate-700 z-50 animate-fade-in overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#E5E7EB] dark:border-slate-700 flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-[#1F2937] dark:text-slate-100">Notifications</h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button type="button" onClick={markAllRead} className="text-xs text-[#ff8a65] hover:underline flex items-center gap-1">
                          <Check size={12} /> Mark all read
                        </button>
                      )}
                      <Link href="/notifications" onClick={() => setNotifOpen(false)} className="text-xs text-[#ff8a65] hover:underline">
                        View all
                      </Link>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.slice(0, 8).map(n => (
                      <Link
                        key={n.id}
                        href={n.link}
                        onClick={() => {
                          markRead(n.id);
                          setNotifOpen(false);
                        }}
                        className={`flex items-start gap-3 px-4 py-3 hover:bg-[#F4F6F8] dark:hover:bg-slate-800 border-b border-[#F4F6F8] dark:border-slate-800 last:border-0 transition-colors ${!n.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
                      >
                        <span className="text-lg flex-shrink-0 mt-0.5">{notifTypeIcon[n.type] || '🔔'}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium ${!n.read ? 'text-[#1F2937] dark:text-slate-100' : 'text-[#6B7280]'} truncate`}>{n.title}</p>
                          <p className="text-[11px] text-[#6B7280] mt-0.5 line-clamp-2">{n.description}</p>
                          <p className="text-[10px] text-[#9CA3AF] mt-1">{n.time}</p>
                        </div>
                        {!n.read && <span className="w-2 h-2 bg-[#ff8a65] rounded-full flex-shrink-0 mt-1.5" />}
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setUserMenuOpen(o => !o);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-[#E5E7EB] dark:border-slate-700 cursor-pointer min-h-[44px] hover:bg-[#F4F6F8] dark:hover:bg-slate-800 rounded-lg px-2 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#ff5722] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">PN</div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-[#1F2937] dark:text-slate-100">Promise Ndem</p>
                <p className="text-[10px] text-[#6B7280]">Super Admin</p>
              </div>
              <ChevronDown size={14} className="hidden sm:block text-[#6B7280]" />
            </button>
            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-[#E5E7EB] dark:border-slate-700 z-50 animate-fade-in overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#E5E7EB] dark:border-slate-700">
                    <p className="text-sm font-semibold text-[#1F2937] dark:text-slate-100">Promise Ndem</p>
                    <p className="text-xs text-[#6B7280]">promise@carschek.com</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Super Admin</span>
                  </div>
                  <div className="py-1">
                    {[
                      { label: 'Profile', href: '/users/USR-001' },
                      { label: 'Settings', href: '/settings' },
                      { label: 'Switch to Inspector Mode', href: '/inspector/jobs' },
                      { label: 'Inspector App (admin shell)', href: '/inspector-app/jobs' },
                    ].map(item => (
                      <Link key={item.href} href={item.href} onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm text-[#1F2937] dark:text-slate-100 hover:bg-[#F4F6F8] dark:hover:bg-slate-800 transition-colors">
                        {item.label}
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        toggleDarkMode();
                        setUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[#1F2937] dark:text-slate-100 hover:bg-[#F4F6F8] dark:hover:bg-slate-800 transition-colors"
                    >
                      {isDark ? <Sun size={15} className="text-[#6B7280]" /> : <Moon size={15} className="text-[#6B7280]" />}
                      {isDark ? 'Light mode' : 'Dark mode'}
                    </button>
                    <div className="border-t border-[#E5E7EB] dark:border-slate-700 mt-1 pt-1">
                      <button type="button" onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-[#C0392B] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                        Logout
                      </button>
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
