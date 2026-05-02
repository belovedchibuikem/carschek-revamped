'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { InspectionSession } from '@/components/inspection/InspectionSession';
import { VehiclePhotos } from '@/components/inspection/VehiclePhotos';
import { useInspectorHref } from '@/contexts/InspectorRouteContext';

export default function InspectorAppVehiclePhotosPage() {
  const params = useParams();
  const jobId = params.id as string;
  const href = useInspectorHref();

  return (
    <InspectionSession
      layout="mobile-app"
      breadcrumb={[
        { label: 'Inspector App', href: '/inspector-app/jobs' },
        { label: 'Jobs', href: href('jobs') },
        { label: `Vehicle photos · ${jobId}` },
      ]}
    >
      <VehiclePhotos
        inspectionId={jobId}
        layout="full"
        presentation="page"
        backHref={href(`inspect/${jobId}/overview`)}
      />
    </InspectionSession>
  );
}
