'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { InspectionSession } from '@/components/inspection/InspectionSession';
import { JobDetailScreen } from '@/components/inspection/screens/JobDetailScreen';
import { useInspectorHref } from '@/contexts/InspectorRouteContext';
import { findMockJob } from '@/lib/inspection/mockInspectorJobs';

export default function InspectorAppJobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  const href = useInspectorHref();
  const job = findMockJob(jobId);
  const title = job ? `${jobId} ${job.vehicleLabel}` : jobId;

  return (
    <InspectionSession
      layout="mobile-app"
      breadcrumb={[
        { label: 'Inspector App', href: '/inspector-app/jobs' },
        { label: 'Jobs', href: href('jobs') },
        { label: title },
      ]}
    >
      <JobDetailScreen layout="mobile-app" jobId={jobId} />
    </InspectionSession>
  );
}
