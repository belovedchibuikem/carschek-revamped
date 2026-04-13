'use client';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import VehicleListingsModule from './components/VehicleListingsModule';

export default function VehicleListingsPage() {
  return (
    <AppLayout currentPath="/vehicle-listings">
      <VehicleListingsModule />
    </AppLayout>
  );
}
