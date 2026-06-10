'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Pencil } from 'lucide-react';

/**
 * Click-to-edit table cell primitives. Display stays exactly as designed;
 * clicking swaps in a focused editor. Commit is optimistic — the caller
 * updates state immediately (and may offer an undo toast).
 */

type InlineSelectCellProps = {
  /** The normal cell content (badge, avatar row, etc.). */
  children: React.ReactNode;
  value: string;
  options: { value: string; label: string }[];
  onCommit: (value: string) => void;
  ariaLabel: string;
};

export function InlineSelectCell({ children, value, options, onCommit, ariaLabel }: InlineSelectCellProps) {
  const [editing, setEditing] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (editing) selectRef.current?.focus();
  }, [editing]);

  if (editing) {
    return (
      <select
        ref={selectRef}
        defaultValue={value}
        aria-label={ariaLabel}
        onClick={e => e.stopPropagation()}
        onChange={e => {
          e.stopPropagation();
          setEditing(false);
          if (e.target.value !== value) onCommit(e.target.value);
        }}
        onBlur={() => setEditing(false)}
        onKeyDown={e => {
          e.stopPropagation();
          if (e.key === 'Escape') setEditing(false);
        }}
        className="max-w-[160px] rounded-lg border border-[#ff8a65] bg-white dark:bg-slate-900 px-2 py-1 text-xs text-[#1F2937] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <button
      type="button"
      aria-label={`Edit ${ariaLabel}`}
      onClick={e => {
        e.stopPropagation();
        setEditing(true);
      }}
      className="group/inline inline-flex items-center gap-1 text-left"
    >
      {children}
      <Pencil size={11} className="shrink-0 text-[#9CA3AF] opacity-0 transition-opacity group-hover/inline:opacity-100" />
    </button>
  );
}

type InlineNumberCellProps = {
  children: React.ReactNode;
  value: number | null;
  onCommit: (value: number) => void;
  ariaLabel: string;
  min?: number;
};

export function InlineNumberCell({ children, value, onCommit, ariaLabel, min = 0 }: InlineNumberCellProps) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = () => {
    const next = Number(inputRef.current?.value);
    setEditing(false);
    if (Number.isFinite(next) && next >= min && next !== value) onCommit(next);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        defaultValue={value ?? ''}
        min={min}
        aria-label={ariaLabel}
        onClick={e => e.stopPropagation()}
        onBlur={commit}
        onKeyDown={e => {
          e.stopPropagation();
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') setEditing(false);
        }}
        className="w-28 rounded-lg border border-[#ff8a65] bg-white dark:bg-slate-900 px-2 py-1 text-xs text-[#1F2937] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
      />
    );
  }

  return (
    <button
      type="button"
      aria-label={`Edit ${ariaLabel}`}
      onClick={e => {
        e.stopPropagation();
        setEditing(true);
      }}
      className="group/inline inline-flex items-center gap-1 text-left"
    >
      {children}
      <Pencil size={11} className="shrink-0 text-[#9CA3AF] opacity-0 transition-opacity group-hover/inline:opacity-100" />
    </button>
  );
}
