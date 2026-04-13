'use client';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import AuctionModule from './components/AuctionModule';

export default function AuctionPage() {
  return (
    <AppLayout currentPath="/auctions">
      <AuctionModule />
    </AppLayout>
  );
}
