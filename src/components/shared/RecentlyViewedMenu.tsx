'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { History, ClipboardList, UserCircle, Car } from 'lucide-react';
import { ORDERS, CUSTOMERS, CARS } from '@/lib/mockData';
import {
  loadRecentlyViewed,
  recordRecentlyViewed,
  type RecentlyViewedEntry,
} from '@/lib/recentlyViewed';

const TYPE_ICON = { order: ClipboardList, customer: UserCircle, car: Car } as const;

/** Resolves a pathname to a recently-viewed entry, or null when not a tracked detail page. */
function entryFromPath(pathname: string): Omit<RecentlyViewedEntry, 'viewedAt'> | null {
  const order = pathname.match(/^\/orders\/([A-Za-z0-9-]+)$/)?.[1];
  if (order) {
    const o = ORDERS.find(x => x.id === order);
    return { type: 'order', id: order, label: o ? `${order} — ${o.customerName}` : order, href: pathname };
  }
  const customer = pathname.match(/^\/customers\/([A-Za-z0-9-]+)$/)?.[1];
  if (customer) {
    const c = CUSTOMERS.find(x => x.id === customer);
    return { type: 'customer', id: customer, label: c ? c.name : customer, href: pathname };
  }
  const car = pathname.match(/^\/cars\/([A-Za-z0-9-]+)$/)?.[1];
  if (car && car !== 'new') {
    const c = CARS.find(x => x.id === car);
    return { type: 'car', id: car, label: c ? `${car} — ${c.brand} ${c.model}` : car, href: pathname };
  }
  return null;
}

/**
 * Header quick-switcher: tracks visits to order/customer/car detail pages and
 * offers the last 5 in a dropdown for one-click jumps.
 */
export function RecentlyViewedMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<RecentlyViewedEntry[]>([]);

  useEffect(() => {
    const entry = entryFromPath(pathname);
    if (entry) setEntries(recordRecentlyViewed(entry));
    else setEntries(loadRecentlyViewed());
  }, [pathname]);

  if (entries.length === 0) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Recently viewed"
        title="Recently viewed"
        className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-[#F4F6F8] dark:hover:bg-slate-800 transition-colors"
      >
        <History size={17} className="text-[#6B7280]" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-[#E5E7EB] dark:border-slate-700 z-50 animate-fade-in overflow-hidden">
            <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
              Recently viewed
            </p>
            <div className="pb-1">
              {entries.map(e => {
                const Icon = TYPE_ICON[e.type];
                return (
                  <Link
                    key={e.href}
                    href={e.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#F4F6F8] dark:hover:bg-slate-800 transition-colors"
                  >
                    <Icon size={14} className="shrink-0 text-[#6B7280]" />
                    <span className="min-w-0 flex-1 truncate text-sm text-[#1F2937] dark:text-slate-100">{e.label}</span>
                    <span className="text-[10px] uppercase text-[#9CA3AF]">{e.type}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
