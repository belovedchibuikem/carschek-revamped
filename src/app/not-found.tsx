'use client';
import React from 'react';
import Link from 'next/link';
import { Home, Search, AlertTriangle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-[#1E3A5F]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={40} className="text-[#1E3A5F]" />
        </div>
        <h1 className="text-4xl font-heading font-bold text-[#1F2937] mb-2">404</h1>
        <p className="text-lg font-semibold text-[#1F2937] mb-2">Page not found</p>
        <p className="text-sm text-[#6B7280] mb-8">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard" className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1E3A5F] text-white font-semibold rounded-xl hover:bg-[#16304F] transition-all">
            <Home size={16} /> Go to Dashboard
          </Link>
          <Link href="/cars" className="flex items-center justify-center gap-2 px-6 py-3 border border-[#E5E7EB] text-[#6B7280] font-medium rounded-xl hover:bg-white transition-all">
            <Search size={16} /> Browse Cars
          </Link>
        </div>
        <div className="mt-8 text-xs text-[#9CA3AF]">
          <p>Suggested links:</p>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {['/dashboard', '/orders', '/cars', '/inspectors', '/reports']?.map(path => (
              <Link key={path} href={path} className="text-[#2E75B6] hover:underline">{path}</Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}