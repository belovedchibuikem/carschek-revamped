'use client';

import React from 'react';
import { InspectorRouteProvider } from '@/contexts/InspectorRouteContext';
import PwaServiceWorkerRegister from '@/components/PwaServiceWorkerRegister';

export default function InspectorSegmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PwaServiceWorkerRegister />
      <InspectorRouteProvider basePath="/inspector">{children}</InspectorRouteProvider>
    </>
  );
}
