'use client';

/**
 * Root error boundary — do not use `app/500/page.tsx` (breaks `next build` / export step).
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error-handling
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F4F6F8] flex flex-col items-center justify-center p-6 text-[#1F2937]">
        <h1 className="text-xl font-bold font-heading">Something went wrong</h1>
        <p className="text-sm text-[#6B7280] mt-2 max-w-md text-center">{error.message || 'An unexpected error occurred.'}</p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 px-6 py-3 rounded-xl bg-[#ff5722] text-white text-sm font-semibold hover:bg-[#e64a19]"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
