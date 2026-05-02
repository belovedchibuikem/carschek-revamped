'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { InspectionSession } from '@/components/inspection/InspectionSession';
import { ReviewScreen } from '@/components/inspection/screens/ReviewScreen';
import { useInspectorHref } from '@/contexts/InspectorRouteContext';

export default function InspectorAppReviewPage() {
  const params = useParams();
  const jobId = params.id as string;
  const href = useInspectorHref();

  return (
    <InspectionSession
      layout="mobile-app"
      breadcrumb={[
        { label: 'Inspector App', href: '/inspector-app/jobs' },
        { label: 'Jobs', href: href('jobs') },
        { label: 'Review' },
      ]}
    >
      <ReviewScreen layout="mobile-app" jobId={jobId} />
    </InspectionSession>
  );
}
