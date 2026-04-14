'use client';
import React, { useState } from 'react';
import InspectorLayout from '@/components/InspectorLayout';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, MapPin, Clock, Car } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function InspectorJobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  const job = {
    id: jobId,
    vehicle: 'Toyota Camry 2015',
    plate: 'LND-234-KJ',
    customer: 'Adaeze Madu',
    phone: '+234 801 234 5678',
    location: 'Lagos Island, Lagos',
    time: '10:00 AM',
    notes: 'Customer wants thorough engine check',
  };

  const handleStart = () => {
    setShowConfirm(false);
    toast.success('Inspection started!');
    router.push(`/inspector/inspect/${jobId}/overview`);
  };

  return (
    <InspectorLayout>
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowConfirm(false)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm animate-slide-up">
            <h3 className="text-base font-heading font-bold text-[#1F2937] mb-2">Start Inspection?</h3>
            <p className="text-sm text-[#6B7280] mb-5">You are about to begin the inspection for {job.vehicle}. This will start the timer.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 border border-[#E5E7EB] rounded-xl text-sm font-medium text-[#6B7280]">Cancel</button>
              <button onClick={handleStart} className="flex-1 py-3 bg-[#D35400] text-white rounded-xl text-sm font-bold hover:bg-orange-700 transition-all">Start Now</button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/inspector/jobs" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-[#E5E7EB]">
            <ArrowLeft size={18} className="text-[#6B7280]" />
          </Link>
          <h1 className="text-lg font-heading font-bold text-[#1F2937]">Job Details</h1>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 bg-[#1E3A5F]/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Car size={24} className="text-[#1E3A5F]" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-bold text-[#1F2937]">{job.vehicle}</h2>
              <p className="font-mono text-sm text-[#6B7280]">{job.plate}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-[#F4F6F8] rounded-xl">
              <div className="w-8 h-8 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-xs font-bold">AM</div>
              <div>
                <p className="text-sm font-medium text-[#1F2937]">{job.customer}</p>
                <p className="text-xs text-[#6B7280]">{job.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#6B7280]">
              <Clock size={15} /> {job.time}
            </div>
            <div className="flex items-center gap-2 text-sm text-[#6B7280]">
              <MapPin size={15} /> {job.location}
            </div>
            {job.notes && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs font-semibold text-amber-700 mb-1">Inspector Notes</p>
                <p className="text-sm text-amber-800">{job.notes}</p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(job.location)}`, '_blank')}
          className="w-full py-3 border border-[#E5E7EB] bg-white rounded-2xl text-sm font-semibold text-[#1F2937] flex items-center justify-center gap-2 hover:bg-[#F4F6F8] transition-colors">
          <MapPin size={16} /> Open in Maps
        </button>

        <button
          onClick={() => setShowConfirm(true)}
          className="w-full py-4 bg-[#D35400] text-white rounded-2xl text-base font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200">
          START INSPECTION →
        </button>
      </div>
    </InspectorLayout>
  );
}
