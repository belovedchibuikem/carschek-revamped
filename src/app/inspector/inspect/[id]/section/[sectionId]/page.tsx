'use client';
import React, { useState } from 'react';
import InspectorLayout from '@/components/InspectorLayout';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Camera, Mic } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const SECTION_ITEMS = [
  { id: 'i1', name: 'Engine oil level', type: 'single' },
  { id: 'i2', name: 'Coolant level', type: 'single' },
  { id: 'i3', name: 'Engine mounts', type: 'single' },
  { id: 'i4', name: 'Timing belt condition', type: 'single' },
  { id: 'i5', name: 'Air filter', type: 'single' },
  { id: 'i6', name: 'Front brake pads', type: 'paired', leftLabel: 'L', rightLabel: 'R' },
  { id: 'i7', name: 'Rear brake pads', type: 'paired', leftLabel: 'L', rightLabel: 'R' },
  { id: 'i8', name: 'Exhaust system', type: 'single' },
];

type ItemResult = 'pass' | 'fail' | 'na' | null;

export default function InspectionSectionPage() {
  const params = useParams();
  const jobId = params.id as string;
  const sectionId = params.sectionId as string;
  const router = useRouter();

  const [results, setResults] = useState<Record<string, ItemResult>>({});
  const [defects, setDefects] = useState<Record<string, { severity: string; note: string }>>({});
  const [expandedDefect, setExpandedDefect] = useState<string | null>(null);

  const setResult = (itemId: string, result: ItemResult) => {
    setResults(prev => ({ ...prev, [itemId]: result }));
    if (result === 'fail') {
      setExpandedDefect(itemId);
      setDefects(prev => ({ ...prev, [itemId]: prev[itemId] || { severity: 'Minor', note: '' } }));
    } else {
      if (expandedDefect === itemId) setExpandedDefect(null);
    }
  };

  const completed = Object.values(results).filter(r => r !== null).length;
  const progress = (completed / SECTION_ITEMS.length) * 100;

  const handleComplete = () => {
    const allActioned = SECTION_ITEMS.every(item => results[item.id] !== undefined && results[item.id] !== null);
    if (!allActioned) { toast.error('Please action all items before completing'); return; }
    toast.success(`Section ${sectionId} completed!`);
    router.push(`/inspector/inspect/${jobId}/overview`);
  };

  return (
    <InspectorLayout>
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Link href={`/inspector/inspect/${jobId}/overview`} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-[#E5E7EB]">
            <ArrowLeft size={18} className="text-[#6B7280]" />
          </Link>
          <div className="flex-1">
            <h1 className="text-base font-heading font-bold text-[#1F2937]">Section {sectionId}</h1>
            <p className="text-xs text-[#6B7280]">💾 Auto-saved</p>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#6B7280]">{completed}/{SECTION_ITEMS.length} items</span>
            <span className="text-xs font-semibold text-[#1E3A5F]">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-[#F4F6F8] rounded-full overflow-hidden">
            <div className="h-full bg-[#1E3A5F] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Items */}
        <div className="space-y-2">
          {SECTION_ITEMS.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
              <div className="p-4">
                <p className="text-sm font-medium text-[#1F2937] mb-3">{item.name}</p>
                {item.type === 'single' ? (
                  <div className="flex gap-2">
                    {(['pass', 'fail', 'na'] as const).map(r => (
                      <button key={r} onClick={() => setResult(item.id, r)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${results[item.id] === r
                          ? r === 'pass' ? 'bg-[#1A7A4A] text-white' : r === 'fail' ? 'bg-[#C0392B] text-white' : 'bg-[#6B7280] text-white'
                          : 'bg-[#F4F6F8] text-[#6B7280] hover:bg-[#E5E7EB]'}`}>
                        {r === 'pass' ? '✓ Pass' : r === 'fail' ? '✗ Fail' : 'N/A'}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {['L', 'R'].map(side => (
                      <div key={side}>
                        <p className="text-xs text-[#6B7280] mb-1.5">{side === 'L' ? 'Left' : 'Right'}</p>
                        <div className="flex gap-1">
                          {(['pass', 'fail'] as const).map(r => (
                            <button key={r} onClick={() => setResult(`${item.id}-${side}`, r)}
                              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${results[`${item.id}-${side}`] === r
                                ? r === 'pass' ? 'bg-[#1A7A4A] text-white' : 'bg-[#C0392B] text-white'
                                : 'bg-[#F4F6F8] text-[#6B7280]'}`}>
                              {r === 'pass' ? '✓' : '✗'}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Defect panel */}
              {(results[item.id] === 'fail' || expandedDefect === item.id) && (
                <div className="border-t border-[#F4F6F8] bg-red-50 p-4 space-y-3">
                  <p className="text-xs font-semibold text-[#C0392B]">Defect Details</p>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1.5">Severity</p>
                    <div className="flex gap-2">
                      {['Minor', 'Major', 'Critical'].map(s => (
                        <button key={s} onClick={() => setDefects(prev => ({ ...prev, [item.id]: { ...prev[item.id], severity: s } }))}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${defects[item.id]?.severity === s
                            ? s === 'Critical' ? 'bg-[#C0392B] text-white' : s === 'Major' ? 'bg-[#D35400] text-white' : 'bg-amber-500 text-white'
                            : 'bg-white border border-[#E5E7EB] text-[#6B7280]'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={defects[item.id]?.note || ''}
                    onChange={e => setDefects(prev => ({ ...prev, [item.id]: { ...prev[item.id], note: e.target.value } }))}
                    placeholder="Describe the defect…"
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-[#E5E7EB] rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 bg-white"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => toast.success('Camera opened')} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E5E7EB] rounded-xl text-xs font-medium text-[#6B7280]">
                      <Camera size={12} /> Photo
                    </button>
                    <button onClick={() => toast.success('Voice recording started')} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E5E7EB] rounded-xl text-xs font-medium text-[#6B7280]">
                      <Mic size={12} /> Voice
                    </button>
                    <button onClick={() => { setResult(item.id, null); setExpandedDefect(null); }}
                      className="ml-auto px-3 py-2 text-xs font-medium text-[#C0392B] hover:bg-red-100 rounded-xl transition-colors">
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button onClick={handleComplete}
          className="w-full py-4 bg-[#1A7A4A] text-white rounded-2xl text-sm font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200">
          Section Complete ✓
        </button>
      </div>
    </InspectorLayout>
  );
}
