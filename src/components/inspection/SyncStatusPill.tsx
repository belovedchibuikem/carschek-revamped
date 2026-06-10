'use client';

import React, { useEffect, useState } from 'react';
import { CloudOff, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '@/components/providers/NetworkProvider';
import { getSyncQueuePendingCount } from '@/lib/db/sync';

/**
 * Live sync status for the inspector bottom nav: online/offline state plus the
 * number of queued offline items. Tapping it (when online with a queue) runs
 * a manual sync immediately.
 */
export function SyncStatusPill() {
  const { online, syncing, retrySync } = useOnlineStatus();
  const [pending, setPending] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      void getSyncQueuePendingCount().then(n => {
        if (!cancelled) setPending(n);
      });
    };
    refresh();
    const id = window.setInterval(refresh, 5_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [online, syncing]);

  const handleRetry = () => {
    if (!online || syncing || pending === 0) return;
    void retrySync().then(() => getSyncQueuePendingCount().then(setPending));
  };

  const label = !online ? `Offline${pending > 0 ? ` · ${pending}` : ''}` : syncing ? 'Syncing…' : pending > 0 ? `${pending} queued` : 'Online';

  return (
    <button
      type="button"
      onClick={handleRetry}
      disabled={!online || syncing || pending === 0}
      title={
        !online
          ? pending > 0
            ? `${pending} item(s) queued — will sync when back online`
            : 'Offline'
          : pending > 0
            ? 'Tap to sync queued items now'
            : 'All synced'
      }
      className="flex flex-col items-center gap-1 px-4 py-2 disabled:cursor-default"
    >
      {!online ? (
        <CloudOff size={14} className="text-amber-600" />
      ) : syncing ? (
        <RefreshCw size={14} className="animate-spin text-[#ff5722]" />
      ) : (
        <span className={`block h-2.5 w-2.5 rounded-full ${pending > 0 ? 'bg-[#ff5722]' : 'bg-green-500'}`} />
      )}
      <span className={`text-[10px] font-semibold ${!online ? 'text-amber-700' : pending > 0 ? 'text-[#ff5722]' : 'text-[#9CA3AF]'}`}>
        {label}
      </span>
    </button>
  );
}
