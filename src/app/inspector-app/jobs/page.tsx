'use client';

import React from 'react';
import { InspectionSession } from '@/components/inspection/InspectionSession';
import { JobsScreen } from '@/components/inspection/screens/JobsScreen';

export default function InspectorAppJobsPage() {
  return (
    <InspectionSession
      layout="mobile-app"
      breadcrumb={[
        { label: 'Inspector App', href: '/inspector-app/jobs' },
        { label: 'Jobs' },
      ]}
    >
      <JobsScreen layout="mobile-app" />
    </InspectionSession>
  );
}
