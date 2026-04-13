import React from 'react';
import AppLayout from '@/components/AppLayout';
import DashboardKPIs from './components/DashboardKPIs';
import BookingTrendChart from './components/BookingTrendChart';
import RevenueBreakdownChart from './components/RevenueBreakdownChart';
import InspectorLeaderboard from './components/InspectorLeaderboard';
import DealFunnel from './components/DealFunnel';
import ActivityFeed from './components/ActivityFeed';
import NigeriaZoneMap from './components/NigeriaZoneMap';

export default function AdminDashboardPage() {
  return (
    <AppLayout currentPath="/admin-dashboard">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-heading font-bold text-[#1F2937]">Operations Dashboard</h1>
            <p className="text-sm text-[#6B7280] mt-0.5">Friday, 10 April 2026 — WAT (West Africa Time)</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-[#1A7A4A] bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
              <span className="w-1.5 h-1.5 bg-[#1A7A4A] rounded-full animate-pulse" />
              Live data
            </span>
            <button className="px-4 py-2.5 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F] transition-all active:scale-[0.98] min-h-[44px]">
              + New Order
            </button>
          </div>
        </div>
        <DashboardKPIs />
        <BookingTrendChart />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <RevenueBreakdownChart />
          <NigeriaZoneMap />
        </div>
        <InspectorLeaderboard />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <DealFunnel />
          <ActivityFeed />
        </div>
      </div>
    </AppLayout>
  );
}