'use client';

import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

/**
 * Shows when the browser fires `beforeinstallprompt` (Chromium).
 * Safari/iOS: user can “Add to Home Screen” manually — we show a hint once.
 */
export default function PwaInstallBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    const dismissedKey = 'carschek-pwa-install-dismissed';
    try {
      if (sessionStorage.getItem(dismissedKey)) setDismissed(true);
    } catch {
      /* ignore */
    }

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onBip);

    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isIos = /iPad|iPhone|iPod/.test(ua);
    const isStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isIos && !isStandalone && !sessionStorage.getItem(dismissedKey)) {
      setIosHint(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', onBip);
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('carschek-pwa-install-dismissed', '1');
    } catch {
      /* ignore */
    }
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    dismiss();
  };

  if (dismissed) return null;

  if (deferred) {
    return (
      <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-[#1E3A5F]/30 bg-[#EEF2FF] px-4 py-3 text-sm text-[#1F2937] dark:bg-[#1E3A5F]/20 dark:text-[#E5E7EB]">
        <div className="flex items-center gap-2 min-w-0">
          <Download size={18} className="shrink-0 text-[#1E3A5F]" />
          <span className="font-medium">Install Carschek Inspector for offline access</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={install}
            className="rounded-lg bg-[#1E3A5F] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#16304F]"
          >
            Install
          </button>
          <button type="button" onClick={dismiss} className="rounded-lg p-1.5 text-[#6B7280] hover:bg-white/50" aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  if (iosHint) {
    return (
      <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
        <p>
          <span className="font-semibold">iOS:</span> Tap Share → Add to Home Screen to use Inspector like an app.
        </p>
        <button type="button" onClick={dismiss} className="shrink-0 rounded p-1 text-amber-800 hover:bg-amber-100" aria-label="Dismiss">
          <X size={14} />
        </button>
      </div>
    );
  }

  return null;
}
