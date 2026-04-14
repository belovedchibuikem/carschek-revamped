'use client';
import React from 'react';
import InspectorLayout from '@/components/InspectorLayout';
import Link from 'next/link';
import { MapPin, Clock, ChevronRight, Navigation, Star } from 'lucide-react';

const JOBS = [
  { id: 'ORD-1892', status: 'Due Now', vehicle: 'Toyota Camry 2015', customer: 'Adaeze M.', phone: '+234 801 ***5678', time: '10:00 AM', location: 'Lagos Island, Lagos', distance: '2.3 km', score: null },
  { id: 'ORD-1895', status: 'Upcoming', vehicle: 'BMW 3 Series 2017', customer: 'Ibrahim M.', phone: '+234 804 ***8901', time: '2:00 PM', location: 'Victoria Island, Lagos', distance: '5.1 km', score: null },
  { id: 'ORD-1897', status: 'Completed', vehicle: 'Mercedes C-Class 2020', customer: 'Adaeze M.', phone: '+234 801 ***5678', time: '10:00 AM', location: 'Lagos Island, Lagos', distance: '0 km', score: 88 },
];

export default function InspectorJobsPage() {
  const today = new Date()?.toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <InspectorLayout>
      <div className="p-4 space-y-4">
        {/* Greeting */}
        <div className="bg-[#1E3A5F] rounded-2xl p-5 text-white">
          <p className="text-white/70 text-sm">{today}</p>
          <h1 className="text-xl font-heading font-bold mt-1">Good morning, Emeka 👋</h1>
          <div className="grid grid-cols-4 gap-3 mt-4">
            {[
              { label: 'Today', value: 3 },
              { label: 'Done', value: 1 },
              { label: 'Pending', value: 2 },
              { label: 'Avg Score', value: 81 },
            ]?.map(s => (
              <div key={s?.label} className="text-center">
                <p className="text-xl font-bold text-white">{s?.value}</p>
                <p className="text-[10px] text-white/60">{s?.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Job cards */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wide">Today&apos;s Jobs</h2>
          {JOBS?.map(job => (
            <div key={job?.id} className={`bg-white rounded-2xl border p-4 ${job?.status === 'Due Now' ? 'border-[#D35400] shadow-sm' : job?.status === 'Completed' ? 'border-[#E5E7EB] opacity-75' : 'border-[#E5E7EB]'}`}>
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${job?.status === 'Due Now' ? 'bg-[#D35400] text-white' : job?.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {job?.status}
                </span>
                <span className="font-mono text-xs text-[#6B7280]">{job?.id}</span>
              </div>
              <h3 className="text-base font-semibold text-[#1F2937] mb-1">{job?.vehicle}</h3>
              <p className="text-sm text-[#6B7280] mb-3">{job?.customer}</p>
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                  <Clock size={12} /> {job?.time}
                </div>
                <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                  <MapPin size={12} /> {job?.location} · {job?.distance}
                </div>
              </div>
              {job?.status === 'Completed' && job?.score && (
                <div className="flex items-center gap-2 mb-3">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-[#1F2937]">Score: {job?.score}/100</span>
                </div>
              )}
              <div className="flex gap-2">
                {job?.status !== 'Completed' && (
                  <button onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(job?.location)}`, '_blank')}
                    className="flex items-center gap-1.5 px-3 py-2 border border-[#E5E7EB] rounded-xl text-xs font-medium text-[#6B7280] hover:bg-[#F4F6F8] transition-colors">
                    <Navigation size={12} /> Navigate
                  </button>
                )}
                <Link href={`/inspector/jobs/${job?.id}`}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${job?.status === 'Due Now' ? 'bg-[#D35400] text-white hover:bg-orange-700' : job?.status === 'Completed' ? 'bg-[#F4F6F8] text-[#6B7280]' : 'bg-[#1E3A5F] text-white hover:bg-[#16304F]'}`}>
                  {job?.status === 'Due Now' ? 'Start' : job?.status === 'Completed' ? 'View Report' : 'View'}
                  <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </InspectorLayout>
  );
}
