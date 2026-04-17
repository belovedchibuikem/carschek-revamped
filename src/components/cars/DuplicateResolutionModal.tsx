'use client';

import React, { useState } from 'react';
import { AlertTriangle, X, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export type DuplicateCarSnapshot = {
  id: string;
  vin: string;
  plate: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  colour: string;
  status: string;
  purchased: string;
  createdBy: string;
  createdAt: string;
};

const FIELDS: { key: keyof DuplicateCarSnapshot; label: string }[] = [
  { key: 'id', label: 'CK ID' },
  { key: 'vin', label: 'VIN' },
  { key: 'plate', label: 'Plate' },
  { key: 'make', label: 'Make' },
  { key: 'model', label: 'Model' },
  { key: 'year', label: 'Year' },
  { key: 'mileage', label: 'Mileage' },
  { key: 'colour', label: 'Colour' },
  { key: 'status', label: 'Status' },
  { key: 'purchased', label: 'Purchased' },
  { key: 'createdBy', label: 'Created By' },
  { key: 'createdAt', label: 'Created At' },
];

export interface DuplicateResolutionModalProps {
  open: boolean;
  onClose: () => void;
  current: DuplicateCarSnapshot;
  match: DuplicateCarSnapshot;
  duplicateCount?: number;
  onMarkUnique: () => void;
  onMerge: (masterId: string) => void;
  onDeleteMatching: (whichId: string) => void;
}

export default function DuplicateResolutionModal({
  open,
  onClose,
  current,
  match,
  duplicateCount = 1,
  onMarkUnique,
  onMerge,
  onDeleteMatching,
}: DuplicateResolutionModalProps) {
  const router = useRouter();
  const [mergeOpen, setMergeOpen] = useState(false);
  const [masterId, setMasterId] = useState<string>(current.id);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  if (!open) return null;

  const renderColumn = (title: string, snap: DuplicateCarSnapshot) => (
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-wide text-[#6B7280] mb-3">{title}</p>
      <div className="space-y-2">
        {FIELDS.map(({ key, label }) => {
          const v = snap[key];
          const curVal = current[key];
          const matchVal = match[key];
          const diff = curVal !== matchVal;
          const display = typeof v === 'number' ? v.toLocaleString() : String(v);
          return (
            <div
              key={key}
              className={`rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 ${diff ? 'border-l-4 border-l-amber-400' : ''}`}
            >
              <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">{label}</p>
              <p className={`text-sm font-medium mt-0.5 ${diff ? 'text-amber-950' : 'text-[#1F2937]'}`}>{display}</p>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
        <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close" onClick={onClose} />
        <div
          className="relative flex max-h-[80vh] w-full max-w-[900px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-start justify-between border-b border-[#E5E7EB] px-6 py-4">
            <div>
              <h2 className="text-lg font-heading font-semibold text-[#1F2937] flex items-center gap-2">
                <AlertTriangle className="text-amber-500" size={20} /> Potential Duplicate Detected
              </h2>
              <p className="mt-1 text-sm text-[#6B7280]">
                A car with a matching VIN or plate number already exists.
                {duplicateCount > 1 ? ` (${duplicateCount} matches)` : ''}
              </p>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-2 text-[#6B7280] hover:bg-[#F4F6F8]" aria-label="Close">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
              {renderColumn(`Current Car — ${current.id}`, current)}
              {renderColumn(`Matching Car — ${match.id}`, match)}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#E5E7EB] bg-[#F9FAFB] px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-[#374151] hover:bg-[#F4F6F8]"
            >
              Cancel — Keep Both as Separate
            </button>
            <button
              type="button"
              onClick={() => {
                onMarkUnique();
                toast.success('Marked as unique — warning dismissed');
                onClose();
              }}
              className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-900 hover:bg-amber-100"
            >
              Mark as Unique — Dismiss Warning
            </button>
            <button
              type="button"
              onClick={() => {
                setMasterId(current.id);
                setMergeOpen(true);
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-[#ff5722] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#e64a19]"
            >
              Merge Records <ChevronRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => setDeleteConfirm(true)}
              className="rounded-lg border border-[#C0392B] px-4 py-2.5 text-sm font-semibold text-[#C0392B] hover:bg-red-50"
            >
              Delete Matching Car
            </button>
          </div>
        </div>
      </div>

      {mergeOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/60" aria-label="Back" onClick={() => setMergeOpen(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-heading font-semibold text-[#1F2937] mb-1">Which record should be the master?</h3>
            <p className="text-sm text-[#6B7280] mb-4">
              The master record keeps its CK ID. All linked data from the other record (inspections, deals, offers, documents)
              will be merged into it.
            </p>
            <div className="space-y-3 mb-6">
              {[current, match].map(snap => (
                <label
                  key={snap.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                    masterId === snap.id ? 'border-[#ff5722] bg-[#ff5722]/5' : 'border-[#E5E7EB] hover:border-[#ff8a65]/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="master"
                    checked={masterId === snap.id}
                    onChange={() => setMasterId(snap.id)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-mono text-sm font-bold text-[#1F2937]">{snap.id}</p>
                    <p className="text-sm text-[#6B7280]">
                      {snap.make} {snap.model} {snap.year} · {snap.plate}
                    </p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMergeOpen(false)}
                className="flex-1 rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm font-medium text-[#374151] hover:bg-[#F4F6F8]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  onMerge(masterId);
                  setMergeOpen(false);
                  onClose();
                  toast.success(`Records merged — ${masterId} is the master`);
                  router.push(`/cars/${masterId}`);
                }}
                className="flex-1 rounded-lg bg-[#ff5722] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#e64a19]"
              >
                Confirm Merge
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteConfirm ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/60" onClick={() => setDeleteConfirm(false)} aria-label="Cancel" />
          <div className="relative z-10 w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-[#1F2937] mb-2">Delete matching car?</h3>
            <p className="text-sm text-[#6B7280] mb-5">
              This will remove <span className="font-mono font-semibold">{match.id}</span> from the registry. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(false)}
                className="flex-1 rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteMatching(match.id);
                  setDeleteConfirm(false);
                  onClose();
                  toast.success(`Car ${match.id} deleted`);
                }}
                className="flex-1 rounded-lg bg-[#C0392B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#A93226]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function carToDuplicateSnapshot(
  car: {
    id: string;
    vin: string;
    plate: string;
    brand: string;
    model: string;
    year: number;
    mileage: number;
    colour: string;
    status: string;
    purchasePrice: number;
    createdAt: string;
  },
  createdBy: string,
  formatPurchased: (n: number) => string
): DuplicateCarSnapshot {
  return {
    id: car.id,
    vin: car.vin,
    plate: car.plate,
    make: car.brand,
    model: car.model,
    year: car.year,
    mileage: car.mileage,
    colour: car.colour,
    status: car.status,
    purchased: formatPurchased(car.purchasePrice),
    createdBy,
    createdAt: car.createdAt,
  };
}
