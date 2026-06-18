'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import InspectorLayout from '@/components/InspectorLayout';
import { InspectionSession } from '@/components/inspection/InspectionSession';
import { SubmissionSuccessScreen } from '@/components/inspection/screens/SubmissionSuccessScreen';

export default function InspectionSuccessPage() {
  const params = useParams();
  const jobId = params.id as string;
  return (
    <InspectorLayout>
      <InspectionSession layout="pwa">
        <SubmissionSuccessScreen layout="pwa" jobId={jobId} />
      </InspectionSession>
    </InspectorLayout>
  );
}
