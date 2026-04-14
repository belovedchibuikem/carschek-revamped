'use client';
import React, { useState } from 'react';
import InspectorLayout from '@/components/InspectorLayout';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import { getScoreColor, getScoreLabel } from '@/lib/mockData';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function InspectionReviewPage() {
  const params = useParams();
  const jobId = params.id as string;
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [signed, setSigned] = useState(false);

  const score = 72;
  const defects = [
    { section: 'Engine & Powertrain', item: 'Engine mounts', severity: 'Minor', note: 'Slight vibration at idle' },
    { section: 'Frame & Body', item: 'Rear bumper', severity: 'Major', note: 'Crack on right side' },
    { section: 'Electrical System', item: 'Dashboard warning lights', severity: 'Critical', note: 'Check engine light on' },
    { section: 'Tyres & Wheels', item: 'Front left tyre', severity: 'Minor', note: 'Tread depth below 3mm' },
  ];

  const handleSubmit = async () => {
    if (!signed) { toast.error('Please sign the inspection report'); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 2000));
    setSubmitting(false);
    toast.success('Report submitted successfully!');
    router.push(`/inspector/inspect/${jobId}/report`);
  };

  return (
    <InspectorLayout>
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Link href={`/inspector/inspect/${jobId}/overview`} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-[#E5E7EB]">
            <ArrowLeft size={18} className="text-[#6B7280]" />
          </Link>
          <h1 className="text-lg font-heading font-bold text-[#1F2937]">Review & Submit</h1>
        </div>

        {/* Score */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 text-center">
          <div className="relative w-28 h-28 mx-auto mb-3">
            <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="32" fill="none" stroke="#F4F6F8" strokeWidth="8" />
              <circle cx="40" cy="40" r="32" fill="none" stroke={getScoreColor(score)} strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 32}`}
                strokeDashoffset={`${2 * Math.PI * 32 * (1 - score / 100)}`}
                strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-[#1F2937]">{score}</span>
              <span className="text-xs text-[#6B7280]">/100</span>
            </div>
          </div>
          <p className="text-xl font-heading font-bold" style={{ color: getScoreColor(score) }}>{getScoreLabel(score)}</p>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: 'Total', value: 127, color: '#1E3A5F' },
              { label: 'Pass', value: 123, color: '#1A7A4A' },
              { label: 'Fail', value: defects.length, color: '#C0392B' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs text-[#6B7280]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Defects */}
        {defects.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4">
            <h2 className="text-sm font-heading font-semibold text-[#1F2937] mb-3">Defects Found ({defects.length})</h2>
            <div className="space-y-2">
              {defects.map((d, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-[#F9FAFB] rounded-xl">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${d.severity === 'Critical' ? 'bg-red-100 text-red-700' : d.severity === 'Major' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {d.severity}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1F2937]">{d.item}</p>
                    <p className="text-[10px] text-[#6B7280]">{d.section}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">{d.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Signature */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4">
          <h2 className="text-sm font-heading font-semibold text-[#1F2937] mb-3">Inspector Signature</h2>
          <div className={`h-24 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-all ${signed ? 'border-[#1A7A4A] bg-green-50' : 'border-[#E5E7EB] hover:border-[#2E75B6]'}`}
            onClick={() => setSigned(true)}>
            {signed ? (
              <div className="text-center">
                <Check size={24} className="text-[#1A7A4A] mx-auto mb-1" />
                <p className="text-xs text-[#1A7A4A] font-semibold">Signed by Emeka Okonkwo</p>
              </div>
            ) : (
              <p className="text-sm text-[#9CA3AF]">Tap to sign</p>
            )}
          </div>
        </div>

        <button onClick={handleSubmit} disabled={submitting}
          className="w-full py-4 bg-[#1E3A5F] text-white rounded-2xl text-sm font-bold hover:bg-[#16304F] disabled:opacity-60 transition-all">
          {submitting ? 'Submitting…' : 'Submit Report →'}
        </button>
      </div>
    </InspectorLayout>
  );
}
