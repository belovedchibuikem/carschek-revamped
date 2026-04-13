'use client';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import CarDetailPage from '../components/CarDetailPage';

export default function CarDetailRoute() {
  return (
    <AppLayout currentPath="/cars">
      <CarDetailPage />
    </AppLayout>
  );
}
