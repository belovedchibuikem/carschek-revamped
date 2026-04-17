'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { UserCircle } from 'lucide-react';

export default function UserDetailPage() {
  const pathname = usePathname();
  const params = useParams();
  const id = params.id as string;

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[#6B7280] text-sm">
          <Link href="/users" className="hover:text-[#ff5722]">
            Users
          </Link>
          <span>/</span>
          <span className="font-mono text-[#1F2937]">{id}</span>
        </div>
        <h1 className="text-2xl font-heading font-bold text-[#1F2937] flex items-center gap-2">
          <UserCircle className="text-[#ff5722]" size={26} />
          User profile
        </h1>
        <p className="text-sm text-[#6B7280] max-w-xl">
          Detail and actions for user <span className="font-mono font-semibold">{id}</span>.
        </p>
      </div>
    </AppLayout>
  );
}
