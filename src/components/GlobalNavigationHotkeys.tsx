'use client';

import { useGSequenceNavigation } from '@/hooks/useGSequenceNavigation';

/** Mission: g then d / c / o / i / r / f — see `useGSequenceNavigation` (react-hotkeys-hook). */
export default function GlobalNavigationHotkeys() {
  useGSequenceNavigation();
  return null;
}
