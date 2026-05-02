'use client';

import React from 'react';
import InspectorLayout from '@/components/InspectorLayout';
import { InspectionSession } from '@/components/inspection/InspectionSession';
import { JobsScreen } from '@/components/inspection/screens/JobsScreen';

export default function InspectorJobsPage() {
  return (
    <InspectorLayout>
      <InspectionSession layout="pwa">
        <JobsScreen layout="pwa" />
      </InspectionSession>
    </InspectorLayout>
  );
}
