'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import InspectorLayout from '@/components/InspectorLayout';
import { InspectionSession } from '@/components/inspection/InspectionSession';
import { VehiclePhotos } from '@/components/inspection/VehiclePhotos';
import { useInspectorHref } from '@/contexts/InspectorRouteContext';

export default function InspectorVehiclePhotosPage() {
  const params = useParams();
  const jobId = params.id as string;
  const href = useInspectorHref();

  return (
    <InspectorLayout>
      <InspectionSession layout="pwa">
        <VehiclePhotos
          inspectionId={jobId}
          layout="full"
          presentation="page"
          backHref={href(`inspect/${jobId}/overview`)}
        />
      </InspectionSession>
    </InspectorLayout>
  );
}
