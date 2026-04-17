'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Car,
  ClipboardList,
  Users,
  UserCircle,
  Plus,
  Calendar,
} from 'lucide-react';
import { CARS, CUSTOMERS, ORDERS, INSPECTORS } from '@/lib/mockData';
import { useCommandPaletteStore } from '@/stores/commandPaletteStore';

const RECENT_KEY = 'carschek-cmdk-recent-v2';
const DEBOUNCE_MS = 150;

type RecentEntry = { label: string; href: string };

type Hit = {
  cat: 'CARS' | 'CUSTOMERS' | 'ORDERS' | 'INSPECTORS';
  label: string;
  sub: string;
  href: string;
  icon: typeof Car;
};

function collectHits(q: string): Hit[] {
  const d = q.toLowerCase();
  const cars = CARS.filter(
    c =>
      c.id.toLowerCase().includes(d) ||
      c.vin.toLowerCase().includes(d) ||
      c.plate.toLowerCase().includes(d) ||
      `${c.brand} ${c.model}`.toLowerCase().includes(d)
  )
    .slice(0, 3)
    .map(
      c =>
        ({
          cat: 'CARS',
          label: `${c.id} — ${c.brand} ${c.model} ${c.year}`,
          sub: `${c.plate} · ${c.vin.slice(0, 12)}…`,
          href: `/cars/${c.id}`,
          icon: Car,
        }) satisfies Hit
    );

  const customers = CUSTOMERS.filter(
    cu => cu.name.toLowerCase().includes(d) || cu.email.toLowerCase().includes(d) || cu.phone.includes(d)
  )
    .slice(0, 3)
    .map(
      cu =>
        ({
          cat: 'CUSTOMERS',
          label: cu.name,
          sub: cu.email,
          href: `/customers/${cu.id}`,
          icon: UserCircle,
        }) satisfies Hit
    );

  const orders = ORDERS.filter(
    o =>
      o.id.toLowerCase().includes(d) ||
      o.vehicle.toLowerCase().includes(d) ||
      o.customerName.toLowerCase().includes(d)
  )
    .slice(0, 3)
    .map(
      o =>
        ({
          cat: 'ORDERS',
          label: `${o.id} — ${o.vehicle}`,
          sub: o.status,
          href: `/orders/${o.id}`,
          icon: ClipboardList,
        }) satisfies Hit
    );

  const inspectors = INSPECTORS.filter(
    i => i.name.toLowerCase().includes(d) || i.zone.some(z => z.toLowerCase().includes(d))
  )
    .slice(0, 3)
    .map(
      i =>
        ({
          cat: 'INSPECTORS',
          label: i.name,
          sub: i.zone.join(', '),
          href: `/inspectors/${i.id}`,
          icon: Users,
        }) satisfies Hit
    );

  return [...cars, ...customers, ...orders, ...inspectors];
}

const QUICK: { label: string; href: string; icon: typeof Plus }[] = [
  { label: 'Register New Car', href: '/cars/new', icon: Plus },
  { label: 'New Inspection Order', href: '/orders/new', icon: Calendar },
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPaletteMount() {
  const open = useCommandPaletteStore(s => s.open);
  const setOpen = useCommandPaletteStore(s => s.setOpen);
  return <CommandPalette open={open} onOpenChange={setOpen} />;
}

export default function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [recent, setRecent] = useState<RecentEntry[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [q]);

  const hits = useMemo(() => collectHits(debounced), [debounced]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw) as RecentEntry[]);
    } catch {
      /* ignore */
    }
  }, [open]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [debounced]);

  useEffect(() => {
    if (open) {
      setQ('');
      setDebounced('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  const pushRecent = (entry: RecentEntry) => {
    const next = [entry, ...recent.filter(r => r.href !== entry.href)].slice(0, 8);
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const navigate = (href: string, label: string) => {
    pushRecent({ label, href });
    router.push(href);
    onOpenChange(false);
    setQ('');
  };

  if (!open) return null;

  const onKeyDownInput = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (hits.length === 0) return;
      setSelectedIdx(i => Math.min(i + 1, hits.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(i => Math.max(i - 1, 0));
    }
    if (e.key === 'Enter' && hits[selectedIdx]) {
      e.preventDefault();
      const h = hits[selectedIdx];
      navigate(h.href, h.label);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-center px-4 pt-[20vh]">
      <button type="button" className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-label="Close" onClick={() => onOpenChange(false)} />
      <div className="relative w-full max-w-[640px] max-h-[70vh] flex flex-col rounded-2xl border border-[#E5E7EB] bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 overflow-hidden animate-fade-in">
        <div className="flex items-center gap-3 border-b border-[#E5E7EB] px-4 py-3 dark:border-slate-700">
          <Search size={18} className="flex-shrink-0 text-[#6B7280]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search Carschek…"
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={onKeyDownInput}
            className="flex-1 bg-transparent text-sm text-[#1F2937] outline-none placeholder-[#9CA3AF] dark:text-slate-100"
          />
          <kbd className="hidden sm:flex items-center rounded bg-[#F4F6F8] px-2 py-1 font-mono text-[10px] text-[#6B7280] dark:bg-slate-800">
            Esc
          </kbd>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {hits.length > 0 ? (
            hits.map((h, idx) => {
              const showHead = idx === 0 || hits[idx - 1].cat !== h.cat;
              const active = idx === selectedIdx;
              return (
                <React.Fragment key={`${h.cat}-${h.href}-${idx}`}>
                  {showHead ? (
                    <p className="px-4 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] first:pt-0">
                      {h.cat}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => navigate(h.href, h.label)}
                    onMouseEnter={() => setSelectedIdx(idx)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      active ? 'bg-[#F4F6F8] dark:bg-slate-800' : 'hover:bg-[#F4F6F8]/80 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <h.icon size={16} className="flex-shrink-0 text-[#6B7280]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#1F2937] dark:text-slate-100">{h.label}</p>
                      <p className="truncate text-xs text-[#6B7280]">{h.sub}</p>
                    </div>
                  </button>
                </React.Fragment>
              );
            })
          ) : q ? (
            <div className="px-4 py-10 text-center text-sm text-[#6B7280]">No results for &quot;{q}&quot;</div>
          ) : (
            <div className="px-4 py-3">
              {recent.length > 0 ? (
                <>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">Recent Searches</p>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {recent.map(r => (
                      <button
                        key={r.href + r.label}
                        type="button"
                        onClick={() => navigate(r.href, r.label)}
                        className="rounded-full bg-[#F4F6F8] px-3 py-1 text-xs font-medium text-[#374151] hover:bg-[#E5E7EB] dark:bg-slate-800 dark:text-slate-200"
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">Quick Actions</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {QUICK.map(a => (
                  <Link
                    key={a.href}
                    href={a.href}
                    onClick={() => {
                      pushRecent({ label: a.label, href: a.href });
                      onOpenChange(false);
                    }}
                    className="flex items-center gap-2 rounded-lg bg-[#F4F6F8] px-3 py-2.5 text-sm text-[#1F2937] hover:bg-[#E5E7EB] dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                  >
                    <a.icon size={16} className="text-[#6B7280]" />
                    {a.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
