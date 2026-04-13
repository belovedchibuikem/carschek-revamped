import React from 'react';
import AppLayout from '@/components/AppLayout';
import OrdersModule from './components/OrdersModule';

export default function InspectionOrdersPage() {
  return (
    <AppLayout currentPath="/inspection-orders-management">
      <OrdersModule />
    </AppLayout>
  );
}