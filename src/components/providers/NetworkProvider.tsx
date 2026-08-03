'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { getSyncQueuePendingCount, processSyncQueue, startSyncInterval } from '@/lib/db/sync';

export type NetworkSyncPhase = 'back-online' | 'syncing' | 'synced' | 'failed' | null;

export type SyncState = 'idle' | 'syncing' | 'done' | 'error';

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export type ReconnectDemoOpts = {
  simulateFailure?: boolean;
  onPhase?: (phase: NetworkSyncPhase) => void;
};

/**
 * Demo + QA: real Dexie `processSyncQueue` with the 3-step Sonner sequence.
 * Used by `/offline-pwa` preview buttons (keeps in-page phase callbacks in sync).
 */
export async function playReconnectSyncSequenceDemo(opts?: ReconnectDemoOpts): Promise<void> {
  if (opts?.simulateFailure) {
    opts?.onPhase?.('failed');
    toast.warning('⚠ 1 item failed to sync', {
      duration: Infinity,
      action: {
        label: 'Retry',
        onClick: () => {
          void playReconnectSyncSequenceDemo({ ...opts, simulateFailure: false });
        },
      },
    });
    return;
  }

  opts?.onPhase?.('back-online');
  toast.success('📶 Back online!', { duration: 2000 });
  await sleep(500);

  const pending = await getSyncQueuePendingCount();
  opts?.onPhase?.('syncing');

  if (pending === 0) {
    opts?.onPhase?.('synced');
    toast.success('✅ All changes synced', { duration: 3000 });
    opts?.onPhase?.(null);
    return;
  }

  const loadingId = toast.loading(`Syncing ${pending} item${pending === 1 ? '' : 's'}...`);

  const result = await processSyncQueue({
    onProgress(done, total) {
      toast.loading(`Syncing ${done}/${total}…`, { id: loadingId });
    },
  });

  toast.dismiss(loadingId);

  if (result.failed > 0) {
    opts?.onPhase?.('failed');
    toast.warning(`⚠ ${result.failed} item${result.failed === 1 ? '' : 's'} failed to sync`, {
      duration: Infinity,
      action: {
        label: 'Retry',
        onClick: () => {
          void playReconnectSyncSequenceDemo({ ...opts, simulateFailure: false });
        },
      },
    });
  } else {
    opts?.onPhase?.('synced');
    toast.success('✅ All changes synced', { duration: 3000 });
  }

  opts?.onPhase?.(null);
}

type NetworkContextValue = {
  online: boolean;
  syncing: boolean;
  syncState: SyncState;
  syncProgress: { processed: number; total: number };
  lastSyncMessage: string | null;
  syncFailedCount: number;
  retrySync: () => Promise<void>;
};

const NetworkContext = createContext<NetworkContextValue>({
  online: true,
  syncing: false,
  syncState: 'idle',
  syncProgress: { processed: 0, total: 0 },
  lastSyncMessage: null,
  syncFailedCount: 0,
  retrySync: async () => {},
});

function SyncToastManager() {
  return null;
}

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  // Always start as online so SSR HTML matches the first client paint; sync in useEffect.
  const [online, setOnline] = useState(true);
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [syncProgress, setSyncProgress] = useState({ processed: 0, total: 0 });
  const [lastSyncMessage, setLastSyncMessage] = useState<string | null>(null);
  const [syncFailedCount, setSyncFailedCount] = useState(0);
  const doneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDoneTimer = () => {
    if (doneTimerRef.current) {
      clearTimeout(doneTimerRef.current);
      doneTimerRef.current = null;
    }
  };

  const drainQueueWithUi = useCallback(async (announceOnline: boolean) => {
    if (!navigator.onLine) return;
    clearDoneTimer();
    setSyncState('syncing');
    setSyncFailedCount(0);

    const pending = await getSyncQueuePendingCount();
    setSyncProgress({ processed: 0, total: Math.max(1, pending) });

    if (announceOnline) {
      toast.success('📶 Back online!', { duration: 2000 });
      await sleep(500);
    }

    if (pending === 0) {
      setSyncState('done');
      setLastSyncMessage('Queue empty');
      toast.success('✅ All changes synced', { duration: 3000 });
      doneTimerRef.current = setTimeout(() => {
        setSyncState('idle');
        setLastSyncMessage(null);
      }, 3000);
      return;
    }

    const loadingId = toast.loading(`Syncing ${pending} item${pending === 1 ? '' : 's'}...`);

    const result = await processSyncQueue({
      onProgress(done, total) {
        setSyncProgress({ processed: done, total });
        toast.loading(`Syncing ${done}/${total}…`, { id: loadingId });
      },
    });

    toast.dismiss(loadingId);
    setSyncProgress({ processed: result.processed, total: Math.max(1, pending) });

    if (result.failed > 0) {
      setSyncState('error');
      setSyncFailedCount(result.failed);
      setLastSyncMessage(`${result.failed} item(s) failed`);
      toast.warning(`⚠ ${result.failed} item${result.failed === 1 ? '' : 's'} failed to sync`, {
        duration: Infinity,
        action: {
          label: 'Retry',
          onClick: () => {
            void drainQueueWithUi(false);
          },
        },
      });
      return;
    }

    setSyncState('done');
    setLastSyncMessage(`Synced ${result.processed} item(s)`);
    if (result.processed > 0 || pending === 0) {
      toast.success('✅ All changes synced', { duration: 3000 });
    }
    doneTimerRef.current = setTimeout(() => {
      setSyncState('idle');
      setLastSyncMessage(null);
    }, 3000);
  }, []);

  const runReconnectFlow = useCallback(() => drainQueueWithUi(true), [drainQueueWithUi]);

  const retrySync = useCallback(() => drainQueueWithUi(false), [drainQueueWithUi]);

  useEffect(() => {
    const onOnline = () => {
      setOnline(true);
      runReconnectFlow();
    };
    const onOffline = () => {
      setOnline(false);
      setSyncState('idle');
      clearDoneTimer();
    };

    setOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    startSyncInterval();
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [runReconnectFlow]);

  const syncing = syncState === 'syncing';

  return (
    <NetworkContext.Provider
      value={{
        online,
        syncing,
        syncState,
        syncProgress,
        lastSyncMessage,
        syncFailedCount,
        retrySync,
      }}
    >
      {children}
      <SyncToastManager />
    </NetworkContext.Provider>
  );
}

export function useOnlineStatus(): NetworkContextValue {
  return useContext(NetworkContext);
}
