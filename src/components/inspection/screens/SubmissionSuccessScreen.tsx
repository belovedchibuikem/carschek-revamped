'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { useInspectorHref } from '@/contexts/InspectorRouteContext';
import type { InspectionLayoutMode } from '@/components/inspection/InspectionSession';

type Props = {
  layout: InspectionLayoutMode;
  jobId: string;
};

export function SubmissionSuccessScreen({ layout, jobId }: Props) {
  const href = useInspectorHref();

  return (
    <div
      className={`flex min-h-[70vh] flex-col items-center justify-center px-6 text-center ${
        layout === 'mobile-app' ? 'mx-auto max-w-lg' : ''
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#1A7A4A] shadow-lg">
        <CheckCircle size={48} className="text-white" aria-hidden />
      </div>
      <h1 className="font-heading text-2xl font-black text-[#1F2937]">Report Submitted!</h1>
      <p className="mt-2 max-w-sm text-sm text-[#6B7280]">
        Your inspection has been sent to QA. The team will review within 2 hours and notify you when approved.
      </p>
      <p className="mt-1 font-mono text-xs text-[#9CA3AF]">Order {jobId}</p>

      <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
        <Link
          href={href(`inspect/${jobId}/report`)}
          className="w-full rounded-2xl bg-[#ff5722] py-4 text-center text-sm font-bold text-white shadow-md"
        >
          View Report Preview
        </Link>
        <Link
          href={href('jobs')}
          className="w-full rounded-2xl border border-[#E5E7EB] bg-white py-3 text-center text-sm font-semibold text-[#374151]"
        >
          Back to Jobs
        </Link>
      </div>
    </div>
  );
}
