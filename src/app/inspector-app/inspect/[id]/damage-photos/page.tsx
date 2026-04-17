'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { InspectionSession } from '@/components/inspection/InspectionSession';
import { DamagePhotosHubScreen } from '@/components/inspection/screens/DamagePhotosHubScreen';
import { useInspectorHref } from '@/contexts/InspectorRouteContext';

export default function InspectorAppDamagePhotosPage() {
  const params = useParams();
  const jobId = params.id as string;
  const href = useInspectorHref();

  return (
    <InspectionSession
      layout="mobile-app"
      breadcrumb={[
        { label: 'Inspector App', href: '/inspector-app/jobs' },
        { label: 'Jobs', href: href('jobs') },
        { label: `Damage photos · ${jobId}` },
      ]}
    >
      <DamagePhotosHubScreen layout="mobile-app" jobId={jobId} backHref={href(`inspect/${jobId}/overview`)} />
    </InspectionSession>
  );
}
