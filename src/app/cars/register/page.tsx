'use client';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import CarRegistrationWizard from '../components/CarRegistrationWizard';

export default function CarRegisterPage() {
  return (
    <AppLayout currentPath="/cars">
      <CarRegistrationWizard />
    </AppLayout>
  );
}
