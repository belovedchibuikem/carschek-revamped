'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import InspectorLayout from '@/components/InspectorLayout';
import { InspectionSession } from '@/components/inspection/InspectionSession';
import { OverviewScreen } from '@/components/inspection/screens/OverviewScreen';

export default function InspectionOverviewPage() {
  const params = useParams();
  const jobId = params.id as string;
  return (
    <InspectorLayout>
      <InspectionSession layout="pwa">
        <OverviewScreen layout="pwa" jobId={jobId} />
      </InspectionSession>
    </InspectorLayout>
  );
}
