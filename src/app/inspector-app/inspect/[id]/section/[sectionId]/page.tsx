'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { InspectionSession } from '@/components/inspection/InspectionSession';
import { SectionChecklistScreen } from '@/components/inspection/screens/SectionChecklistScreen';
import { useInspectorHref } from '@/contexts/InspectorRouteContext';
import { INSPECTION_SECTIONS } from '@/lib/mockData';

export default function InspectorAppSectionPage() {
  const params = useParams();
  const jobId = params.id as string;
  const sectionId = params.sectionId as string;
  const href = useInspectorHref();
  const name = INSPECTION_SECTIONS.find(s => s.id === sectionId)?.name ?? sectionId;

  return (
    <InspectionSession
      layout="mobile-app"
      breadcrumb={[
        { label: 'Inspector App', href: '/inspector-app/jobs' },
        { label: 'Jobs', href: href('jobs') },
        { label: 'Overview', href: href(`inspect/${jobId}/overview`) },
        { label: name },
      ]}
    >
      <SectionChecklistScreen layout="mobile-app" jobId={jobId} sectionId={sectionId} />
    </InspectionSession>
  );
}
