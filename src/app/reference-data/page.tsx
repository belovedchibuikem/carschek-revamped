'use client';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import ReferenceDataModule from './components/ReferenceDataModule';

export default function ReferenceDataPage() {
  return (
    <AppLayout currentPath="/reference-data">
      <ReferenceDataModule />
    </AppLayout>
  );
}
