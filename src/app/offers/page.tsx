'use client';
import React, { Suspense } from 'react';
import AppLayout from '@/components/AppLayout';
import OffersModule from './components/OffersModule';

export default function OffersPage() {
  return (
    <AppLayout currentPath="/offers">
      <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading...</div>}>
        <OffersModule />
      </Suspense>
    </AppLayout>
  );
}
