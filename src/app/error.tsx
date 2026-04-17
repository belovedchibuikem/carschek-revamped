'use client';

import React from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#E5E7EB] p-8 text-center shadow-sm">
        <h1 className="text-xl font-heading font-bold text-[#1F2937] mb-2">Something went wrong</h1>
        <p className="text-sm text-[#6B7280] mb-6">{error.message || 'An unexpected error occurred.'}</p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg"
          >
            Try again
          </button>
          <Link href="/dashboard" className="px-4 py-2.5 border border-[#E5E7EB] text-sm font-semibold rounded-lg inline-flex items-center justify-center">
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
