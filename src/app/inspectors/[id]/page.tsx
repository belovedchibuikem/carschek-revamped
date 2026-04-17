import { Suspense } from 'react';
import InspectorDetailClient from './InspectorDetailClient';

export default function InspectorProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex items-center justify-center text-sm text-[#6B7280]">
          Loading inspector…
        </div>
      }
    >
      <InspectorDetailClient />
    </Suspense>
  );
}
