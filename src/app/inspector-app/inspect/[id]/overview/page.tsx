'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { InspectionSession } from '@/components/inspection/InspectionSession';
import { OverviewScreen } from '@/components/inspection/screens/OverviewScreen';
import { useInspectorHref } from '@/contexts/InspectorRouteContext';

export default function InspectorAppOverviewPage() {
  const params = useParams();
  const jobId = params.id as string;
  const href = useInspectorHref();

  return (
    <InspectionSession
      layout="mobile-app"
      breadcrumb={[
        { label: 'Inspector App', href: '/inspector-app/jobs' },
        { label: 'Jobs', href: href('jobs') },
        { label: `Inspection · ${jobId}` },
      ]}
    >
      <OverviewScreen layout="mobile-app" jobId={jobId} />
    </InspectionSession>
  );
}
