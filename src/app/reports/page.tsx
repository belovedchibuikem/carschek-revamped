import { Suspense } from 'react';
import ReportsClient from './ReportsClient';

export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex items-center justify-center text-sm text-[#6B7280]">
          Loading reports…
        </div>
      }
    >
      <ReportsClient />
    </Suspense>
  );
}
