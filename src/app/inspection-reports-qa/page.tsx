import React from 'react';
import AppLayout from '@/components/AppLayout';
import ReportsQAModule from './components/ReportsQAModule';

export default function InspectionReportsQAPage() {
  return (
    <AppLayout currentPath="/inspection-reports-qa">
      <ReportsQAModule />
    </AppLayout>
  );
}