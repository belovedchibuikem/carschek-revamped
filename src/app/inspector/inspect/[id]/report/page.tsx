'use client';
import React from 'react';
import InspectorLayout from '@/components/InspectorLayout';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Share2, MessageCircle, Flag } from 'lucide-react';
import { getScoreColor, getScoreLabel } from '@/lib/mockData';
import { toast } from 'sonner';

export default function InspectionReportPage() {
  const params = useParams();
  const jobId = params.id as string;
  const score = 72;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'Carschek Inspection Report', text: `Vehicle inspection score: ${score}/100`, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Report link copied!');
    }
  };

  return (
    <InspectorLayout>
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/inspector/jobs" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-[#E5E7EB]">
            <ArrowLeft size={18} className="text-[#6B7280]" />
          </Link>
          <h1 className="text-lg font-heading font-bold text-[#1F2937]">Inspection Report</h1>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
          <div className="bg-[#1E3A5F] p-5 text-white text-center">
            <p className="text-white/70 text-xs mb-1">CARSCHEK INSPECTION REPORT</p>
            <p className="font-mono text-sm">RPT-{jobId}</p>
          </div>
          <div className="p-5 text-center">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="32" fill="none" stroke="#F4F6F8" strokeWidth="8" />
                <circle cx="40" cy="40" r="32" fill="none" stroke={getScoreColor(score)} strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - score / 100)}`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-[#1F2937]">{score}</span>
                <span className="text-[10px] text-[#6B7280]">/100</span>
              </div>
            </div>
            <p className="text-xl font-heading font-bold" style={{ color: getScoreColor(score) }}>{getScoreLabel(score)}</p>
            <p className="text-sm text-[#6B7280] mt-1">Toyota Camry 2015</p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">Inspected by Emeka Okonkwo</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button onClick={handleShare} className="flex flex-col items-center gap-1.5 p-3 bg-white border border-[#E5E7EB] rounded-2xl hover:bg-[#F4F6F8] transition-colors">
            <Share2 size={20} className="text-[#2E75B6]" />
            <span className="text-xs font-medium text-[#6B7280]">Share</span>
          </button>
          <button onClick={() => toast.success('WhatsApp share opened')} className="flex flex-col items-center gap-1.5 p-3 bg-white border border-[#E5E7EB] rounded-2xl hover:bg-[#F4F6F8] transition-colors">
            <MessageCircle size={20} className="text-green-600" />
            <span className="text-xs font-medium text-[#6B7280]">WhatsApp</span>
          </button>
          <button onClick={() => toast.success('Report flagged for QA review')} className="flex flex-col items-center gap-1.5 p-3 bg-white border border-[#E5E7EB] rounded-2xl hover:bg-[#F4F6F8] transition-colors">
            <Flag size={20} className="text-[#D35400]" />
            <span className="text-xs font-medium text-[#6B7280]">Flag QA</span>
          </button>
        </div>

        <Link href="/inspector/jobs" className="block w-full py-3 bg-[#1E3A5F] text-white rounded-2xl text-sm font-bold text-center hover:bg-[#16304F] transition-all">
          Back to Jobs
        </Link>
      </div>
    </InspectorLayout>
  );
}
