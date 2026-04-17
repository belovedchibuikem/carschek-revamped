'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { InspectionSession } from '@/components/inspection/InspectionSession';
import { ReportScreen } from '@/components/inspection/ReportScreen';
import { useInspectorHref } from '@/contexts/InspectorRouteContext';

export default function InspectorAppReportPage() {
  const params = useParams();
  const inspectionId = params.id as string;
  const href = useInspectorHref();

  return (
    <InspectionSession
      layout="mobile-app"
      breadcrumb={[
        { label: 'Inspector App', href: '/inspector-app/jobs' },
        { label: 'Jobs', href: href('jobs') },
        { label: 'Report' },
      ]}
    >
      <ReportScreen inspectionId={inspectionId} layout="mobile-app" />
    </InspectionSession>
  );
}
