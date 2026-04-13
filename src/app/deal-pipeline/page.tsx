'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import DealPipelineModule from './components/DealPipelineModule';

export default function DealPipelinePage() {
  return (
    <AppLayout>
      <DealPipelineModule />
    </AppLayout>
  );
}
