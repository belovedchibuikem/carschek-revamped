'use client';

import { Loader2 } from 'lucide-react';
import { useOnlineStatus } from '@/components/providers/NetworkProvider';

type Props = {
  /** Slightly smaller copy for inspector shell */
  compact?: boolean;
};

export function NetworkStatusChip({ compact }: Props) {
  const { online, syncState, syncProgress, syncFailedCount, retrySync } = useOnlineStatus();

  if (!online) {
    return (
      <div
        className={`flex items-center gap-1.5 font-medium text-amber-800 dark:text-amber-300 ${
          compact ? 'text-[11px]' : 'text-xs'
        }`}
      >
        <span className="h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-amber-500" aria-hidden />
        <span className="hidden sm:inline">Offline — saving locally</span>
        <span className="sm:hidden">Offline</span>
      </div>
    );
  }

  if (syncState === 'syncing') {
    const { processed, total } = syncProgress;
    return (
      <div
        className={`flex items-center gap-1.5 font-medium text-[#ff5722] dark:text-sky-300 ${
          compact ? 'text-[11px]' : 'text-xs'
        }`}
      >
        <Loader2 size={compact ? 12 : 14} className="flex-shrink-0 animate-spin" aria-hidden />
        <span className="hidden sm:inline">
          Syncing {processed}/{total}…
        </span>
        <span className="sm:hidden">Sync…</span>
      </div>
    );
  }

  if (syncState === 'error') {
    return (
      <div className={`flex items-center gap-2 font-medium ${compact ? 'text-[11px]' : 'text-xs'}`}>
        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-red-500" aria-hidden />
        <span className="hidden sm:inline text-red-700 dark:text-red-400">
          {syncFailedCount} item{syncFailedCount === 1 ? '' : 's'} failed
        </span>
        <button type="button" onClick={() => void retrySync()} className="font-semibold text-[#ff8a65] hover:underline">
          Retry
        </button>
      </div>
    );
  }

  if (syncState === 'done') {
    return (
      <div
        className={`flex items-center gap-1.5 font-medium text-green-700 dark:text-green-400 ${
          compact ? 'text-[11px]' : 'text-xs'
        }`}
      >
        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-green-500" aria-hidden />
        <span className="hidden sm:inline">✅ All synced</span>
        <span className="sm:hidden">✓</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5" title="Online">
      <span className="h-2 w-2 flex-shrink-0 rounded-full bg-green-500" aria-hidden />
    </div>
  );
}
