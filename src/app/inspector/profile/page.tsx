'use client';
import React from 'react';
import InspectorLayout from '@/components/InspectorLayout';
import Link from 'next/link';
import { MapPin, LogOut } from 'lucide-react';


export default function InspectorProfilePage() {
  return (
    <InspectorLayout>
      <div className="p-4 space-y-4">
        <h1 className="text-xl font-heading font-bold text-[#1F2937]">My Profile</h1>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 text-center">
          <div className="relative inline-block mb-3">
            <div className="w-16 h-16 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-2xl font-bold mx-auto">EO</div>
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <h2 className="text-lg font-heading font-bold text-[#1F2937]">Emeka Okonkwo</h2>
          <p className="text-sm text-[#6B7280]">emeka.inspector@carschek.com</p>
          <span className="inline-block mt-2 text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Senior Inspector</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Rating', value: '4.8', icon: '⭐' },
            { label: 'Total Jobs', value: '142', icon: '📋' },
            { label: 'Avg Score', value: '81', icon: '📊' },
          ]?.map(s => (
            <div key={s?.label} className="bg-white rounded-2xl border border-[#E5E7EB] p-3 text-center">
              <p className="text-xl mb-0.5">{s?.icon}</p>
              <p className="text-lg font-bold text-[#1F2937]">{s?.value}</p>
              <p className="text-xs text-[#6B7280]">{s?.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 space-y-3">
          <h3 className="text-sm font-semibold text-[#1F2937]">My Zones</h3>
          {['Lagos Island', 'Lagos Mainland']?.map(zone => (
            <div key={zone} className="flex items-center gap-2 text-sm text-[#6B7280]">
              <MapPin size={14} /> {zone}
            </div>
          ))}
        </div>

        <Link href="/login" className="flex items-center justify-center gap-2 w-full py-3 border border-[#C0392B] text-[#C0392B] rounded-2xl text-sm font-semibold hover:bg-red-50 transition-colors">
          <LogOut size={16} /> Sign Out
        </Link>
      </div>
    </InspectorLayout>
  );
}
