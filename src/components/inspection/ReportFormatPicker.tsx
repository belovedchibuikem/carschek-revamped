'use client';

import React from 'react';
import type { ReportVariant } from '@/lib/inspection/reportTypes';

export type ReportFormatPickerProps = {
  onSelect: (variant: ReportVariant) => void;
  /** When true, render as centered modal overlay. */
  modal?: boolean;
  onClose?: () => void;
};

function FormatCards({ onSelect }: { onSelect: (v: ReportVariant) => void }) {
  return (
    <>
      <h2 className="mb-6 text-center font-heading text-xl font-bold text-[#1F2937]">Choose Your Report Format</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect('modern')}
          className="rounded-2xl border-2 border-[#E5E7EB] bg-[#FAFBFC] p-6 text-left transition hover:border-[#ff5722] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/40"
        >
          <p className="text-3xl" aria-hidden>
            📊
          </p>
          <p className="mt-3 font-heading text-lg font-bold text-[#1F2937]">Modern Report</p>
          <ul className="mt-3 space-y-1.5 text-sm text-[#6B7280]">
            <li>• Visual-first layout</li>
            <li>• Large Carschek Score</li>
            <li>• Photo gallery grid</li>
            <li>• Mobile-friendly</li>
            <li>• Shareable online</li>
          </ul>
          <p className="mt-5 rounded-xl bg-[#ff5722] py-2.5 text-center text-sm font-bold text-white">Select Modern</p>
        </button>
        <button
          type="button"
          onClick={() => onSelect('classic')}
          className="rounded-2xl border-2 border-[#E5E7EB] bg-[#FAFBFC] p-6 text-left transition hover:border-[#ff5722] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/40"
        >
          <p className="text-3xl" aria-hidden>
            📄
          </p>
          <p className="mt-3 font-heading text-lg font-bold text-[#1F2937]">Classic Report</p>
          <ul className="mt-3 space-y-1.5 text-sm text-[#6B7280]">
            <li>• Formal A4 layout</li>
            <li>• Dense table structure</li>
            <li>• Print-optimised</li>
            <li>• Full colour PDF</li>
            <li>• Professional PDF</li>
          </ul>
          <p className="mt-5 rounded-xl bg-[#ff5722] py-2.5 text-center text-sm font-bold text-white">Select Classic</p>
        </button>
      </div>
      <p className="mt-6 text-center text-sm text-[#6B7280]">
        Both formats contain identical inspection data.
        <br />
        You can switch between them after selecting.
      </p>
    </>
  );
}

export function ReportFormatPicker({ onSelect, modal, onClose }: ReportFormatPickerProps) {
  if (modal) {
    return (
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-format-title"
        onClick={onClose}
      >
        <div
          className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          onClick={e => e.stopPropagation()}
        >
          <FormatCards onSelect={onSelect} />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
      <FormatCards onSelect={onSelect} />
    </div>
  );
}
