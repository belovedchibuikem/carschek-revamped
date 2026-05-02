'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import InspectorLayout from '@/components/InspectorLayout';
import { InspectionSession } from '@/components/inspection/InspectionSession';
import { ReviewScreen } from '@/components/inspection/screens/ReviewScreen';

export default function InspectionReviewPage() {
  const params = useParams();
  const jobId = params.id as string;
  return (
    <InspectorLayout>
      <InspectionSession layout="pwa">
        <ReviewScreen layout="pwa" jobId={jobId} />
      </InspectionSession>
    </InspectorLayout>
  );
}
