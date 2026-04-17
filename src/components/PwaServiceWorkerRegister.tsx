'use client';

import { useEffect } from 'react';

/** Registers `/public/sw.js` for offline shell caching (inspector PWA path). Safe no-op if unsupported. */
export default function PwaServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost && process.env.NODE_ENV === 'development') return;
    void navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);
  return null;
}
