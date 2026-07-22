'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { History, ClipboardList, UserCircle, Car } from 'lucide-react';
import { ordersApi, customersApi, carsApi } from '@/lib/api/services';
import { useApiList } from '@/hooks/useApiResource';
import {
  loadRecentlyViewed,
  recordRecentlyViewed,
  type RecentlyViewedEntry,
} from '@/lib/recentlyViewed';

const TYPE_ICON = { order: ClipboardList, customer: UserCircle, car: Car } as const;

type OrderLite = { id: string; customerName?: string };
type CustomerLite = { id: string; name?: string };
type CarLite = { id: string; brand?: string; model?: string };

function entryFromPath(
  pathname: string,
  orders: OrderLite[],
  customers: CustomerLite[],
  cars: CarLite[]
): Omit<RecentlyViewedEntry, 'viewedAt'> | null {
  const order = pathname.match(/^\/orders\/([A-Za-z0-9-]+)$/)?.[1];
  if (order) {
    const o = orders.find(x => x.id === order);
    return { type: 'order', id: order, label: o ? `${order} — ${o.customerName}` : order, href: pathname };
  }
  const customer = pathname.match(/^\/customers\/([A-Za-z0-9-]+)$/)?.[1];
  if (customer) {
    const c = customers.find(x => x.id === customer);
    return { type: 'customer', id: customer, label: c?.name ?? customer, href: pathname };
  }
  const car = pathname.match(/^\/cars\/([A-Za-z0-9-]+)$/)?.[1];
  if (car && car !== 'new') {
    const c = cars.find(x => x.id === car);
    return { type: 'car', id: car, label: c ? `${car} — ${c.brand} ${c.model}` : car, href: pathname };
  }
  return null;
}

export function RecentlyViewedMenu() {
  const { data: orders } = useApiList(() => ordersApi.list());
  const { data: customers } = useApiList(() => customersApi.list());
  const { data: cars } = useApiList(() => carsApi.list());
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<RecentlyViewedEntry[]>([]);

  useEffect(() => {
    const entry = entryFromPath(pathname, orders, customers, cars);
    if (entry) setEntries(recordRecentlyViewed(entry));
    else setEntries(loadRecentlyViewed());
  }, [pathname, orders, customers, cars]);

  if (entries.length === 0) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E7EB] hover:bg-[#F4F6F8] text-[#6B7280]"
        aria-label="Recently viewed"
      >
        <History size={16} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-[#E5E7EB] shadow-lg z-50 overflow-hidden">
            <p className="px-3 py-2 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide border-b border-[#F4F6F8]">
              Recently viewed
            </p>
            <ul>
              {entries.map(e => {
                const Icon = TYPE_ICON[e.type];
                return (
                  <li key={`${e.type}-${e.id}`}>
                    <Link
                      href={e.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-[#F9FAFB]"
                    >
                      <Icon size={14} className="text-[#9CA3AF] shrink-0" />
                      <span className="truncate text-[#1F2937]">{e.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
