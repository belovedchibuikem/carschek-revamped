'use client';
import React from 'react';
import InspectorLayout from '@/components/InspectorLayout';


import { NOTIFICATIONS } from '@/lib/mockData';

export default function InspectorNotificationsPage() {
  const myNotifs = NOTIFICATIONS?.filter(n => n?.type === 'order' || n?.type === 'system');

  return (
    <InspectorLayout>
      <div className="p-4 space-y-4">
        <h1 className="text-xl font-heading font-bold text-[#1F2937]">Notifications</h1>
        <div className="space-y-2">
          {myNotifs?.map(n => (
            <div key={n?.id} className={`bg-white rounded-2xl border p-4 ${!n?.read ? 'border-[#2E75B6] bg-blue-50/30' : 'border-[#E5E7EB]'}`}>
              <div className="flex items-start gap-3">
                <span className="text-xl">{n?.type === 'order' ? '📋' : '⚙️'}</span>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${!n?.read ? 'text-[#1F2937]' : 'text-[#6B7280]'}`}>{n?.title}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{n?.description}</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">{n?.time}</p>
                </div>
                {!n?.read && <span className="w-2.5 h-2.5 bg-[#2E75B6] rounded-full flex-shrink-0 mt-1" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </InspectorLayout>
  );
}
