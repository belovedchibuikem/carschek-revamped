'use client';

import React from 'react';

export function TableSkeleton({ rows = 8, cols = 8 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse space-y-2 p-4" aria-hidden>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-2">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-8 flex-1 rounded-lg bg-[#E5E7EB] dark:bg-slate-700" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="px-6 py-14 text-center text-sm text-[#6B7280]">
      <p className="font-medium text-[#1F2937]">{title}</p>
      {hint && <p className="mt-1">{hint}</p>}
    </div>
  );
}
