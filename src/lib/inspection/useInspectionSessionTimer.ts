'use client';

import { useEffect, useState } from 'react';
import { loadSessionTimerSeconds, persistSessionTimerSeconds } from '@/lib/inspection/sessionDexie';

export function useInspectionSessionTimer(orderId: string, enabled: boolean): number {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    void loadSessionTimerSeconds(orderId).then(setSeconds);
  }, [orderId]);

  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => {
      setSeconds(s => {
        const n = s + 1;
        if (n % 10 === 0) void persistSessionTimerSeconds(orderId, n);
        return n;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [enabled, orderId]);

  return seconds;
}
