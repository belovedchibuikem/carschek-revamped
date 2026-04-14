// Next.js reserves /500 - this file intentionally redirects
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FiveHundred() {
  const router = useRouter();
  useEffect(() => { router.replace('/server-error'); }, [router]);
  return null;
}
