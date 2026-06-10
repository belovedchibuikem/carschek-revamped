/** Tracks the last visited detail pages (orders/customers/cars) per user — localStorage. */

import { getGuestUserId } from '@/lib/drafts';

export type RecentlyViewedEntry = {
  type: 'order' | 'customer' | 'car';
  id: string;
  label: string;
  href: string;
  viewedAt: number;
};

const MAX_ENTRIES = 5;

function storageKey(): string {
  return `carschek-recently-viewed_${getGuestUserId()}`;
}

export function loadRecentlyViewed(): RecentlyViewedEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentlyViewedEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordRecentlyViewed(entry: Omit<RecentlyViewedEntry, 'viewedAt'>): RecentlyViewedEntry[] {
  const next = [
    { ...entry, viewedAt: Date.now() },
    ...loadRecentlyViewed().filter(e => e.href !== entry.href),
  ].slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(storageKey(), JSON.stringify(next));
  } catch {
    /* quota */
  }
  return next;
}
