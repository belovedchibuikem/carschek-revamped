import React from 'react';
import AppLayout from '@/components/AppLayout';
import CustomerModule from './components/CustomerModule';

export default function CustomerManagementPage() {
  return (
    <AppLayout currentPath="/customer-management">
      <CustomerModule />
    </AppLayout>
  );
}