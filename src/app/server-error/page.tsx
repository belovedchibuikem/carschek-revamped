'use client';
import React from 'react';
import Link from 'next/link';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';

export default function ServerErrorPage() {
  return (
    <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertOctagon size={40} className="text-[#D35400]" />
        </div>
        <h1 className="text-4xl font-heading font-bold text-[#1F2937] mb-2">Server Error</h1>
        <p className="text-lg font-semibold text-[#1F2937] mb-2">Something went wrong</p>
        <p className="text-sm text-[#6B7280] mb-8">Something went wrong on our end. Please try again or contact support if the issue persists.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => window.location?.reload()} className="flex items-center justify-center gap-2 px-6 py-3 bg-[#D35400] text-white font-semibold rounded-xl hover:bg-orange-700 transition-all">
            <RefreshCw size={16} /> Retry
          </button>
          <Link href="/dashboard" className="flex items-center justify-center gap-2 px-6 py-3 border border-[#E5E7EB] text-[#6B7280] font-medium rounded-xl hover:bg-white transition-all">
            <Home size={16} /> Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
