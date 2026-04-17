import Link from 'next/link';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-8 space-y-4">
        <h1 className="text-xl font-heading font-bold text-[#1F2937]">Reset password</h1>
        <p className="text-sm text-[#6B7280]">
          Open the authentication screen to set a new password after you receive a reset link.
        </p>
        <Link
          href="/authentication-screen"
          className="inline-flex justify-center w-full py-3 rounded-xl bg-[#1E3A5F] text-white text-sm font-semibold hover:bg-[#16304F]"
        >
          Go to authentication
        </Link>
      </div>
    </div>
  );
}
