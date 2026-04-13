'use client';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import OffersModule from './components/OffersModule';

export default function OffersPage() {
  return (
    <AppLayout currentPath="/offers">
      <OffersModule />
    </AppLayout>
  );
}
