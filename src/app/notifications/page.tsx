'use client';
import React, { Suspense, useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check, Bell } from 'lucide-react';

import { toast } from 'sonner';
import { notificationsApi } from '@/lib/api/services';
import { useApiList } from '@/hooks/useApiResource';

const FILTER_TABS = ['All', 'Orders', 'Reports', 'Payments', 'System'];

function NotificationsPageContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: notifications, setData: setNotifications, loading, error, refresh } = useApiList(() => notificationsApi.list());
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const f = searchParams.get('filter');
    if (f && FILTER_TABS.includes(f)) setActiveFilter(f);
  }, [searchParams]);

  const setFilter = (tab: string) => {
    setActiveFilter(tab);
    router.replace(`${pathname}?filter=${encodeURIComponent(tab)}`, { scroll: false });
  };

  const typeMap: Record<string, string> = {
    Orders: 'order',
    Reports: 'report',
    Payments: 'payment',
    System: 'system',
  };
  const filtered = notifications.filter(n => {
    if (activeFilter === 'All') return true;
    const want = typeMap[activeFilter] ?? activeFilter.toLowerCase();
    return n.type === want;
  });

  const markAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not mark all read');
    }
  };

  const markRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {
      /* ignore */
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const notifTypeIcon: Record<string, string> = {
    order: '📋', report: '📄', payment: '💰', auction: '🔨', system: '⚙️',
  };

  const grouped = {
    Today: filtered.filter(n => n.time.includes('m ago') || n.time.includes('h ago')),
    Yesterday: filtered.filter(n => n.time === '1d ago'),
    Older: filtered.filter(n => n.time !== '1d ago' && !n.time.includes('m ago') && !n.time.includes('h ago')),
  };

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-5 max-w-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Notifications</h1>
            <p className="text-sm text-[#6B7280]">{unreadCount} unread</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-2 px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F4F6F8] transition-colors">
              <Check size={14} /> Mark all read
            </button>
          )}
        </div>

        <div className="flex gap-1 border-b border-[#E5E7EB] overflow-x-auto">
          {FILTER_TABS.map(tab => (
            <button key={tab} type="button" onClick={() => setFilter(tab)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${activeFilter === tab ? 'border-[#ff5722] text-[#ff5722]' : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'}`}>
              {tab}
            </button>
          ))}
        </div>

        {Object.entries(grouped).map(([group, items]) => items.length > 0 && (
          <div key={group}>
            <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">{group}</h3>
            <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
              {items.map((n, i) => (
                <Link key={n.id} href={n.link} onClick={() => markRead(n.id)}
                  className={`flex items-start gap-4 px-5 py-4 hover:bg-[#F9FAFB] transition-colors border-b border-[#F4F6F8] last:border-0 ${!n.read ? 'bg-blue-50/30' : ''}`}>
                  <span className="text-xl flex-shrink-0 mt-0.5">{notifTypeIcon[n.type] || '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${!n.read ? 'text-[#1F2937]' : 'text-[#6B7280]'}`}>{n.title}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">{n.description}</p>
                    <p className="text-xs text-[#9CA3AF] mt-1">{n.time}</p>
                  </div>
                  {!n.read && <span className="w-2.5 h-2.5 bg-[#ff8a65] rounded-full flex-shrink-0 mt-1.5" />}
                </Link>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center">
            <Bell size={40} className="mx-auto mb-3 text-[#E5E7EB]" />
            <p className="font-medium text-[#1F2937]">No notifications</p>
            <p className="text-sm text-[#6B7280] mt-1">You&apos;re all caught up!</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={
      <AppLayout currentPath="/notifications">
        <div className="p-8 text-sm text-[#6B7280]">Loading…</div>
      </AppLayout>
    }>
      <NotificationsPageContent />
    </Suspense>
  );
}
