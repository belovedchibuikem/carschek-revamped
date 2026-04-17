import Link from 'next/link';

export default function TwoFactorPage() {
  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-8 space-y-4">
        <h1 className="text-xl font-heading font-bold text-[#1F2937]">Two-factor authentication</h1>
        <p className="text-sm text-[#6B7280]">
          The demo login flow includes an in-page 2FA step. Continue from the main authentication screen.
        </p>
        <Link
          href="/authentication-screen"
          className="inline-flex justify-center w-full py-3 rounded-xl bg-[#1E3A5F] text-white text-sm font-semibold hover:bg-[#16304F]"
        >
          Go to sign in
        </Link>
      </div>
    </div>
  );
}
