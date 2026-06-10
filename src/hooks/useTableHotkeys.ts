'use client';

import { useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

type Options = {
  rowCount: number;
  /** Enter on the active row. */
  onOpen?: (index: number) => void;
  /** "e" on the active row (e.g. open edit view). Omit to disable. */
  onEdit?: (index: number) => void;
  /** Disable while modals/menus are open or the table is hidden. */
  enabled?: boolean;
};

function focusIsInteractive(): boolean {
  const tag = document.activeElement?.tagName;
  return tag === 'A' || tag === 'BUTTON';
}

/**
 * Table row keyboard navigation: j/k move the active row, Enter opens it,
 * "e" edits it. Inputs/textareas are ignored (react-hotkeys-hook default).
 * Returns the active row index (-1 = none) for highlight rendering.
 */
export function useTableHotkeys({ rowCount, onOpen, onEdit, enabled = true }: Options) {
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (activeIndex >= rowCount) setActiveIndex(rowCount > 0 ? rowCount - 1 : -1);
  }, [rowCount, activeIndex]);

  useHotkeys(
    'j',
    () => setActiveIndex(i => Math.min(i + 1, rowCount - 1)),
    { enabled: enabled && rowCount > 0 },
    [rowCount, enabled]
  );

  useHotkeys(
    'k',
    () => setActiveIndex(i => Math.max(i - 1, 0)),
    { enabled: enabled && rowCount > 0 },
    [rowCount, enabled]
  );

  useHotkeys(
    'enter',
    e => {
      // Let a focused link/button handle its own Enter
      if (focusIsInteractive() || activeIndex < 0) return;
      e.preventDefault();
      onOpen?.(activeIndex);
    },
    { enabled: enabled && activeIndex >= 0 && !!onOpen },
    [activeIndex, enabled, onOpen]
  );

  useHotkeys(
    'e',
    () => {
      if (activeIndex < 0) return;
      onEdit?.(activeIndex);
    },
    { enabled: enabled && activeIndex >= 0 && !!onEdit },
    [activeIndex, enabled, onEdit]
  );

  return { activeIndex, setActiveIndex };
}
