'use client';

import React from 'react';
import Link from 'next/link';
import { useOnlineStatus } from '@/components/providers/NetworkProvider';
import { NetworkStatusChip } from '@/components/network/NetworkStatusChip';
import { ChevronRight } from 'lucide-react';

export type InspectionLayoutMode = 'pwa' | 'mobile-app';

export type BreadcrumbItem = { label: string; href?: string };

type Props = {
  layout: InspectionLayoutMode;
  children: React.ReactNode;
  /** Admin-shell breadcrumb trail (mobile-app only) */
  breadcrumb?: BreadcrumbItem[];
  /** Optional class on inner content wrapper */
  className?: string;
};

export function InspectionSession({ layout, children, breadcrumb, className = '' }: Props) {
  const { online, syncing } = useOnlineStatus();
  const isMobileApp = layout === 'mobile-app';

  return (
    <div
      data-inspection-layout={layout}
      className={
        isMobileApp
          ? 'w-full min-h-[50vh]'
          : 'w-full max-w-md mx-auto min-h-[50vh]'
      }
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-2">
          {!online && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              You&apos;re offline — all changes saved locally
            </div>
          )}
          {online && syncing && (
            <div className="rounded-xl border border-[#2E75B6]/25 bg-[#EEF4FB] px-3 py-2 text-sm text-[#1E3A5F]">
              Back online — syncing queued changes…
            </div>
          )}
        </div>
        <div className="flex-shrink-0 pt-0.5">
          <NetworkStatusChip compact />
        </div>
      </div>

      {isMobileApp && breadcrumb && breadcrumb.length > 0 && (
        <nav className="mb-4 flex flex-wrap items-center gap-1 text-xs text-[#6B7280]">
          {breadcrumb.map((b, i) => (
            <React.Fragment key={`${b.label}-${i}`}>
              {i > 0 && <ChevronRight size={12} className="text-[#D1D5DB]" />}
              {b.href ? (
                <Link href={b.href} className="hover:text-[#1E3A5F] font-medium">
                  {b.label}
                </Link>
              ) : (
                <span className="font-semibold text-[#1F2937]">{b.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className={className}>{children}</div>
    </div>
  );
}
