'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import InspectorLayout from '@/components/InspectorLayout';
import { InspectionSession } from '@/components/inspection/InspectionSession';
import { JobDetailScreen } from '@/components/inspection/screens/JobDetailScreen';

export default function InspectorJobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  return (
    <InspectorLayout>
      <InspectionSession layout="pwa">
        <JobDetailScreen layout="pwa" jobId={jobId} />
      </InspectionSession>
    </InspectorLayout>
  );
}
