'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import InspectorLayout from '@/components/InspectorLayout';
import { InspectionSession } from '@/components/inspection/InspectionSession';
import { SectionChecklistScreen } from '@/components/inspection/screens/SectionChecklistScreen';

export default function InspectionSectionPage() {
  const params = useParams();
  const jobId = params.id as string;
  const sectionId = params.sectionId as string;
  return (
    <InspectorLayout>
      <InspectionSession layout="pwa">
        <SectionChecklistScreen layout="pwa" jobId={jobId} sectionId={sectionId} />
      </InspectionSession>
    </InspectorLayout>
  );
}
