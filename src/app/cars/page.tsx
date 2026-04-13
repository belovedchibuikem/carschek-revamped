'use client';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import CarsListModule from './components/CarsListModule';

export default function CarsPage() {
  return (
    <AppLayout currentPath="/cars">
      <CarsListModule />
    </AppLayout>
  );
}
