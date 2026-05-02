'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import InspectorLayout from '@/components/InspectorLayout';
import { InspectionSession } from '@/components/inspection/InspectionSession';
import { DamagePhotosHubScreen } from '@/components/inspection/screens/DamagePhotosHubScreen';
import { useInspectorHref } from '@/contexts/InspectorRouteContext';

export default function InspectorDamagePhotosPage() {
  const params = useParams();
  const jobId = params.id as string;
  const href = useInspectorHref();

  return (
    <InspectorLayout>
      <InspectionSession layout="pwa">
        <DamagePhotosHubScreen layout="pwa" jobId={jobId} backHref={href(`inspect/${jobId}/overview`)} />
      </InspectionSession>
    </InspectorLayout>
  );
}
