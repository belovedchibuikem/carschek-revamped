'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import InspectorLayout from '@/components/InspectorLayout';
import { InspectionSession } from '@/components/inspection/InspectionSession';
import { ReportScreen } from '@/components/inspection/ReportScreen';

export default function InspectionReportPage() {
  const params = useParams();
  const inspectionId = params.id as string;
  return (
    <InspectorLayout>
      <InspectionSession layout="pwa">
        <ReportScreen inspectionId={inspectionId} layout="pwa" />
      </InspectionSession>
    </InspectorLayout>
  );
}
