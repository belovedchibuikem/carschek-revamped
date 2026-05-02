'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname } from 'next/navigation';
import { InspectorRouteProvider } from '@/contexts/InspectorRouteContext';
import PwaServiceWorkerRegister from '@/components/PwaServiceWorkerRegister';

export default function InspectorAppSegmentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AppLayout currentPath={pathname}>
      <PwaServiceWorkerRegister />
      <InspectorRouteProvider basePath="/inspector-app">
        <div className="w-full max-w-6xl mx-auto min-h-[60vh]">{children}</div>
      </InspectorRouteProvider>
    </AppLayout>
  );
}
