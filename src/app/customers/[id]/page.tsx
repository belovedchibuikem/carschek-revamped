import { Suspense } from 'react';
import CustomerDetailClient from './CustomerDetailClient';

export default function CustomerDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex items-center justify-center text-sm text-[#6B7280]">
          Loading customer…
        </div>
      }
    >
      <CustomerDetailClient />
    </Suspense>
  );
}
