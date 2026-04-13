import React from 'react';
import AppLayout from '@/components/AppLayout';
import InspectorModule from './components/InspectorModule';

export default function InspectorManagementPage() {
  return (
    <AppLayout currentPath="/inspector-management">
      <InspectorModule />
    </AppLayout>
  );
}