'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useHotkeys } from 'react-hotkeys-hook';

function isFormTarget(t: EventTarget | null): boolean {
  if (!t || !(t instanceof HTMLElement)) return false;
  const tag = t.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return t.isContentEditable;
}

const WINDOW_MS = 800;

/**
 * Mission shortcuts: press `g`, then within 800ms press a second key to navigate.
 * Implemented with `react-hotkeys-hook` (g + d/c/o/i/r/f).
 */
export function useGSequenceNavigation(): void {
  const router = useRouter();
  const gPressedAt = useRef(0);

  useHotkeys(
    'g',
    e => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isFormTarget(e.target)) return;
      gPressedAt.current = Date.now();
    },
    { enableOnFormTags: false, preventDefault: false }
  );

  const goIfSequence = (path: string) => {
    if (Date.now() - gPressedAt.current > WINDOW_MS) return;
    gPressedAt.current = 0;
    router.push(path);
  };

  const secondKey = (e: KeyboardEvent, path: string) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (isFormTarget(e.target)) return;
    e.preventDefault();
    goIfSequence(path);
  };

  useHotkeys('d', e => secondKey(e, '/dashboard'), { enableOnFormTags: false });
  useHotkeys('c', e => secondKey(e, '/cars'), { enableOnFormTags: false });
  useHotkeys('o', e => secondKey(e, '/orders'), { enableOnFormTags: false });
  useHotkeys('i', e => secondKey(e, '/inspectors'), { enableOnFormTags: false });
  useHotkeys('r', e => secondKey(e, '/reports'), { enableOnFormTags: false });
  useHotkeys('f', e => secondKey(e, '/finance'), { enableOnFormTags: false });
}
