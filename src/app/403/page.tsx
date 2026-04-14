'use client';
import React from 'react';
import Link from 'next/link';
import { ShieldOff, Home } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShieldOff size={40} className="text-[#C0392B]" />
        </div>
        <h1 className="text-4xl font-heading font-bold text-[#1F2937] mb-2">403</h1>
        <p className="text-lg font-semibold text-[#1F2937] mb-2">Access Denied</p>
        <p className="text-sm text-[#6B7280] mb-8">You don&apos;t have permission to access this page. Contact your administrator if you believe this is an error.</p>
        <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E3A5F] text-white font-semibold rounded-xl hover:bg-[#16304F] transition-all">
          <Home size={16} /> Go to your home page
        </Link>
      </div>
    </div>
  );
}
