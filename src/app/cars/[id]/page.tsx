'use client';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import CarDetailModule from '../components/CarDetailModule';

export default function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return (
    <AppLayout currentPath="/cars">
      <CarDetailModule carId={id} />
    </AppLayout>
  );
}
