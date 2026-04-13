'use client';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import CRMModule from './components/CRMModule';

export default function CRMPage() {
  return (
    <AppLayout currentPath="/crm">
      <CRMModule />
    </AppLayout>
  );
}
