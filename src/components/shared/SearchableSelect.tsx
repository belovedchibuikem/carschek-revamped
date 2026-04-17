'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export type SearchableSelectOption = { value: string; label: string };

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  /** Adds error border (e.g. validation) */
  invalid?: boolean;
  className?: string;
  buttonClassName?: string;
  id?: string;
  'aria-label'?: string;
};

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  disabled = false,
  searchPlaceholder = 'Search…',
  emptyText = 'No matches',
  invalid = false,
  className = '',
  buttonClassName = '',
  id,
  'aria-label': ariaLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedLabel = useMemo(() => {
    const o = options.find(x => x.value === value);
    if (o) return o.label;
    return value || '';
  }, [options, value]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return options;
    return options.filter(
      o => o.label.toLowerCase().includes(s) || o.value.toLowerCase().includes(s)
    );
  }, [options, q]);

  useEffect(() => {
    if (!open) return;
    const fn = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [open]);

  useEffect(() => {
    if (open) setQ('');
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div ref={rootRef} className={['relative', className].filter(Boolean).join(' ')}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen(o => !o)}
        className={[
          'w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm border rounded-lg text-left transition-colors',
          disabled ? 'opacity-50 cursor-not-allowed bg-[#F9FAFB]' : 'bg-white hover:border-[#2E75B6]/40 cursor-pointer',
          invalid ? 'border-[#C0392B]' : 'border-[#E5E7EB]',
          buttonClassName,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className={selectedLabel ? 'text-[#1F2937] truncate min-w-0' : 'text-[#9CA3AF] truncate min-w-0'}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-[#6B7280] flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {open && !disabled && (
        <div className="absolute z-[100] mt-1 w-full min-w-[220px] rounded-lg border border-[#E5E7EB] bg-white shadow-lg overflow-hidden flex flex-col max-h-72">
          <div className="p-2 border-b border-[#F4F6F8] flex items-center gap-2">
            <Search size={14} className="text-[#9CA3AF] flex-shrink-0" aria-hidden />
            <input
              autoFocus
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full text-sm outline-none bg-transparent placeholder:text-[#9CA3AF] text-[#1F2937]"
              aria-label="Filter options"
            />
          </div>
          <ul className="overflow-y-auto py-1 max-h-52" role="listbox">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-[#9CA3AF]">{emptyText}</li>
            ) : (
              filtered.map(o => (
                <li key={`${o.value}-${o.label}`} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={o.value === value}
                    className={[
                      'w-full text-left px-3 py-2 text-sm transition-colors',
                      o.value === value
                        ? 'bg-[#1E3A5F]/10 font-semibold text-[#1E3A5F]'
                        : 'text-[#374151] hover:bg-[#F4F6F8]',
                    ].join(' ')}
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                    }}
                  >
                    {o.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
