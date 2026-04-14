'use client';
import React, { useState, useEffect } from 'react';
import InspectorLayout from '@/components/InspectorLayout';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Check, AlertTriangle, Clock } from 'lucide-react';
import { INSPECTION_SECTIONS } from '@/lib/mockData';
import { toast } from 'sonner';

export default function InspectionOverviewPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [elapsed, setElapsed] = useState(0);
  const [sectionStatus, setSectionStatus] = useState<Record<string, 'pending' | 'in-progress' | 'complete' | 'fail'>>(
    Object.fromEntries(INSPECTION_SECTIONS.map(s => [s.id, 'pending']))
  );

  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const completed = Object.values(sectionStatus).filter(s => s === 'complete').length;
  const failed = Object.values(sectionStatus).filter(s => s === 'fail').length;
  const progress = (completed / INSPECTION_SECTIONS.length) * 100;
  const allDone = completed + failed === INSPECTION_SECTIONS.length;

  const statusColor = (s: string) => {
    if (s === 'complete') return 'bg-green-100 border-green-300 text-green-700';
    if (s === 'fail') return 'bg-red-100 border-red-300 text-red-700';
    if (s === 'in-progress') return 'bg-amber-100 border-amber-300 text-amber-700';
    return 'bg-[#F4F6F8] border-[#E5E7EB] text-[#6B7280]';
  };

  const handleAllPass = () => {
    const newStatus = { ...sectionStatus };
    Object.keys(newStatus).forEach(k => { if (newStatus[k] === 'pending') newStatus[k] = 'complete'; });
    setSectionStatus(newStatus);
    toast.success('All sections marked as passing');
  };

  return (
    <InspectorLayout>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Link href={`/inspector/jobs/${jobId}`} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-[#E5E7EB]">
            <ArrowLeft size={18} className="text-[#6B7280]" />
          </Link>
          <div className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-xl px-3 py-2">
            <Clock size={14} className="text-[#D35400]" />
            <span className="font-mono text-sm font-bold text-[#1F2937]">{formatTime(elapsed)}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-[#1E3A5F] rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white/70 text-xs">Inspection Progress</p>
              <p className="text-2xl font-bold">{completed}/{INSPECTION_SECTIONS.length}</p>
              <p className="text-white/70 text-xs">sections complete</p>
            </div>
            <div className="relative w-16 h-16">
              <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
                <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
                <circle cx="32" cy="32" r="26" fill="none" stroke="white" strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 26}`}
                  strokeDashoffset={`${2 * Math.PI * 26 * (1 - progress / 100)}`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-white">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
          {failed > 0 && (
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
              <AlertTriangle size={14} className="text-amber-300" />
              <span className="text-xs text-white">{failed} defects found</span>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="flex gap-2">
          <button onClick={handleAllPass} className="flex-1 py-2.5 border border-[#E5E7EB] bg-white rounded-xl text-xs font-semibold text-[#6B7280] hover:bg-[#F4F6F8] transition-colors">
            ✓ All Pass
          </button>
          {allDone && (
            <Link href={`/inspector/inspect/${jobId}/review`}
              className="flex-1 py-2.5 bg-[#1A7A4A] text-white rounded-xl text-xs font-bold text-center hover:bg-green-700 transition-all">
              Finish & Review →
            </Link>
          )}
        </div>

        {/* Sections grid */}
        <div className="grid grid-cols-2 gap-3">
          {INSPECTION_SECTIONS.map(section => (
            <Link key={section.id} href={`/inspector/inspect/${jobId}/section/${section.id}`}
              className={`p-3 rounded-2xl border-2 transition-all ${statusColor(sectionStatus[section.id])}`}>
              <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wide opacity-60">{section.id}</span>
                {sectionStatus[section.id] === 'complete' && <Check size={14} className="text-green-600" />}
                {sectionStatus[section.id] === 'fail' && <AlertTriangle size={14} className="text-red-600" />}
              </div>
              <p className="text-xs font-semibold leading-tight mb-1">{section.name}</p>
              <p className="text-[10px] opacity-60">{section.items} items · {section.timeEstimate}</p>
            </Link>
          ))}
        </div>
      </div>
    </InspectorLayout>
  );
}
