'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { toast } from 'sonner';

const STAGES = ['Acquired', 'Inspection Linked', 'At Buyer', 'Listed', 'Sold'] as const;
export type CarPipelineStage = (typeof STAGES)[number];

export interface StatusStepperProps {
  carId: string;
  currentStageIndex: number;
  onStageIndexChange: (next: number) => void;
  linkedInspection: boolean;
  carschekScore: number;
  docsUploaded: number;
  docsRequired?: number;
}

function validateAdvancePath(
  fromIdx: number,
  toIdx: number,
  linkedInspection: boolean,
  carschekScore: number,
  docsUploaded: number
): string | null {
  for (let s = fromIdx; s < toIdx; s++) {
    if (s === 0 && !linkedInspection) return 'Link an inspection before advancing';
    if (s === 2 && (carschekScore === 0 || docsUploaded < 6))
      return 'Grade the car and upload required documents first';
  }
  return null;
}

export function StatusStepper({
  carId,
  currentStageIndex,
  onStageIndexChange,
  linkedInspection,
  carschekScore,
  docsUploaded,
  docsRequired: _docsRequired = 8,
}: StatusStepperProps) {
  const [confirmIdx, setConfirmIdx] = useState<number | null>(null);
  const [pending, setPending] = useState(false);

  const handleStageClick = (i: number) => {
    if (i === currentStageIndex) return;
    if (i < currentStageIndex) {
      toast.message('Status cannot be reversed');
      return;
    }
    const pathErr = validateAdvancePath(currentStageIndex, i, linkedInspection, carschekScore, docsUploaded);
    if (pathErr) {
      toast.message(pathErr);
      return;
    }
    setConfirmIdx(i);
  };

  const confirmAdvance = async () => {
    if (confirmIdx === null) return;
    const pathErr = validateAdvancePath(
      currentStageIndex,
      confirmIdx,
      linkedInspection,
      carschekScore,
      docsUploaded
    );
    if (pathErr) {
      toast.message(pathErr);
      setConfirmIdx(null);
      return;
    }
    setPending(true);
    try {
      const res = await fetch(`/api/cars/${encodeURIComponent(carId)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: STAGES[confirmIdx] }),
      });
      if (!res.ok) throw new Error('Status update failed');
      onStageIndexChange(confirmIdx);
      toast.success('Status advanced — logged to activity trail');
    } catch {
      toast.error('Could not update status');
    } finally {
      setPending(false);
      setConfirmIdx(null);
    }
  };

  return (
    <>
      <div className="flex w-full items-center gap-0 min-w-[520px]">
        {STAGES.map((stage, i) => (
          <React.Fragment key={stage}>
            <div className="flex flex-col items-center flex-shrink-0 w-[72px] sm:w-[88px]">
              <button
                type="button"
                title={i < currentStageIndex ? 'Status cannot be reversed' : undefined}
                onClick={() => handleStageClick(i)}
                className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2E75B6]"
                style={
                  i < currentStageIndex
                    ? { background: '#1E3A5F', borderColor: '#1E3A5F' }
                    : i === currentStageIndex
                      ? { background: '#D35400', borderColor: '#D35400' }
                      : { background: 'white', borderColor: '#D1D5DB' }
                }
              >
                {i === currentStageIndex ? (
                  <span
                    className="pointer-events-none absolute inline-flex h-9 w-9 rounded-full bg-[#D35400] opacity-30 animate-ping"
                    aria-hidden
                  />
                ) : null}
                {i < currentStageIndex ? (
                  <Check size={14} className="relative z-[1] text-white" />
                ) : (
                  <span
                    className={`relative z-[1] text-xs font-bold ${i === currentStageIndex ? 'text-white' : 'text-[#9CA3AF]'}`}
                  >
                    {i + 1}
                  </span>
                )}
              </button>
              <p
                className={`mt-1.5 text-center text-[10px] sm:text-[11px] font-semibold leading-tight px-0.5 ${
                  i === currentStageIndex ? 'text-[#D35400]' : i < currentStageIndex ? 'text-[#1E3A5F]' : 'text-[#9CA3AF]'
                }`}
              >
                {stage}
              </p>
            </div>
            {i < STAGES.length - 1 ? (
              <div
                className="h-0.5 flex-1 min-w-[8px] -mt-6 rounded-full"
                style={{ background: i < currentStageIndex ? '#1E3A5F' : '#E5E7EB' }}
                aria-hidden
              />
            ) : null}
          </React.Fragment>
        ))}
      </div>

      {confirmIdx !== null ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close" onClick={() => setConfirmIdx(null)} />
          <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl animate-fade-in">
            <h3 className="text-base font-heading font-semibold text-[#1F2937] mb-2">
              Advance to {STAGES[confirmIdx]}?
            </h3>
            <p className="text-sm text-[#6B7280] mb-5">
              This will update the car&apos;s status and log this change to the activity trail.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmIdx(null)}
                className="flex-1 rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm font-medium text-[#374151] hover:bg-[#F4F6F8] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => void confirmAdvance()}
                className="flex-1 rounded-lg bg-[#1E3A5F] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#16304F] transition-colors disabled:opacity-60"
              >
                {pending ? 'Saving…' : 'Advance Status'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default StatusStepper;
