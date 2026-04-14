'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, X, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { REPORTS } from '@/lib/mockData';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const SECTIONS = [
  { id: 'S01', name: 'Engine & Powertrain', items: [
    { name: 'Engine oil level', result: 'pass' }, { name: 'Coolant level', result: 'pass' },
    { name: 'Engine mounts', result: 'fail', severity: 'Minor', note: 'Slight vibration at idle' },
    { name: 'Timing belt condition', result: 'pass' }, { name: 'Air filter', result: 'pass' },
  ]},
  { id: 'S02', name: 'Frame & Body', items: [
    { name: 'Front bumper', result: 'pass' }, { name: 'Rear bumper', result: 'fail', severity: 'Major', note: 'Crack on right side' },
    { name: 'Hood', result: 'pass' }, { name: 'Doors alignment', result: 'pass' },
  ]},
  { id: 'S03', name: 'Electrical System', items: [
    { name: 'Battery condition', result: 'pass' }, { name: 'Alternator output', result: 'pass' },
    { name: 'Dashboard warning lights', result: 'fail', severity: 'Critical', note: 'Check engine light on' },
  ]},
];

export default function ReportReviewPage() {
  const pathname = usePathname();
  const params = useParams();
  const reportId = params.id as string;
  const report = REPORTS.find(r => r.id === reportId) || REPORTS[0];
  const router = useRouter();

  const [expandedSections, setExpandedSections] = useState<string[]>(['S01']);
  const [qaChecks, setQaChecks] = useState({ photos: false, defects: false, score: false, completeness: false, accuracy: false });
  const [adminComment, setAdminComment] = useState('');
  const [approving, setApproving] = useState(false);
  const [correctionNote, setCorrectionNote] = useState('');
  const [showCorrectionForm, setShowCorrectionForm] = useState(false);

  const allChecked = Object.values(qaChecks).every(Boolean);

  const handleApprove = async () => {
    if (!allChecked) { toast.error('Please complete all QA checks before approving'); return; }
    setApproving(true);
    await new Promise(r => setTimeout(r, 1500));
    setApproving(false);
    toast.success('Report approved! PDF generated and customer notified.');
    router.push('/reports?tab=approved');
  };

  const handleRequestCorrections = () => {
    if (!correctionNote) { toast.error('Please provide correction notes'); return; }
    toast.success('Corrections requested. Inspector notified.');
    setShowCorrectionForm(false);
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/reports" className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E7EB] hover:bg-[#F4F6F8] transition-colors">
            <ArrowLeft size={16} className="text-[#6B7280]" />
          </Link>
          <div>
            <h1 className="text-xl font-heading font-bold text-[#1F2937]">QA Review — {report.id}</h1>
            <p className="text-sm text-[#6B7280]">{report.carName} · Inspector: {report.inspectorName}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Report */}
          <div className="lg:col-span-3 space-y-4">
            {/* Score */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <div className="flex items-center gap-5">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#F4F6F8" strokeWidth="8" />
                    <circle cx="40" cy="40" r="32" fill="none" stroke={report.score >= 80 ? '#1A7A4A' : report.score >= 60 ? '#D35400' : '#C0392B'} strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={`${2 * Math.PI * 32 * (1 - report.score / 100)}`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-[#1F2937]">{report.score}</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-heading font-bold text-[#1F2937]">{report.carName}</h2>
                  <p className="text-sm text-[#6B7280]">Carschek Score: {report.score}/100</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-[#6B7280]">{report.defects} defects found</span>
                    {report.criticalDefects > 0 && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-[#C0392B] bg-red-50 px-2 py-0.5 rounded-full">
                        <AlertTriangle size={11} /> {report.criticalDefects} critical
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sections */}
            {SECTIONS.map(section => (
              <div key={section.id} className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
                <button onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#F9FAFB] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-[#1F2937]">{section.name}</span>
                    <span className="text-xs text-[#6B7280]">{section.items.length} items</span>
                    {section.items.some(i => i.result === 'fail') && (
                      <span className="text-xs font-semibold text-[#C0392B] bg-red-50 px-2 py-0.5 rounded-full">
                        {section.items.filter(i => i.result === 'fail').length} fail
                      </span>
                    )}
                  </div>
                  {expandedSections.includes(section.id) ? <ChevronUp size={16} className="text-[#6B7280]" /> : <ChevronDown size={16} className="text-[#6B7280]" />}
                </button>
                {expandedSections.includes(section.id) && (
                  <div className="border-t border-[#E5E7EB]">
                    {section.items.map((item, i) => (
                      <div key={i} className={`flex items-start gap-3 px-5 py-3 border-b border-[#F4F6F8] last:border-0 ${item.result === 'fail' ? 'bg-red-50/50' : ''}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${item.result === 'pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {item.result === 'pass' ? <Check size={11} /> : <X size={11} />}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm text-[#1F2937]">{item.name}</p>
                          {item.result === 'fail' && (
                            <div className="mt-1 flex items-center gap-2">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.severity === 'Critical' ? 'bg-red-100 text-red-700' : item.severity === 'Major' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {item.severity}
                              </span>
                              <span className="text-xs text-[#6B7280]">{item.note}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right: QA Controls */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 sticky top-4">
              <h2 className="text-base font-heading font-semibold text-[#1F2937] mb-4">QA Checklist</h2>
              <div className="space-y-3 mb-5">
                {[
                  { key: 'photos', label: 'All required photos present' },
                  { key: 'defects', label: 'Defects accurately documented' },
                  { key: 'score', label: 'Score calculation verified' },
                  { key: 'completeness', label: 'All 27 sections completed' },
                  { key: 'accuracy', label: 'Inspector notes are clear' },
                ].map(check => (
                  <label key={check.key} className="flex items-center gap-3 cursor-pointer group">
                    <button
                      onClick={() => setQaChecks(prev => ({ ...prev, [check.key]: !prev[check.key as keyof typeof prev] }))}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${qaChecks[check.key as keyof typeof qaChecks] ? 'bg-[#1A7A4A] border-[#1A7A4A]' : 'border-[#E5E7EB] group-hover:border-[#2E75B6]'}`}>
                      {qaChecks[check.key as keyof typeof qaChecks] && <Check size={11} className="text-white" />}
                    </button>
                    <span className="text-sm text-[#1F2937]">{check.label}</span>
                  </label>
                ))}
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">Admin Comment</label>
                <textarea value={adminComment} onChange={e => setAdminComment(e.target.value)}
                  placeholder="Add QA notes…" rows={3}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30" />
              </div>

              {!allChecked && (
                <p className="text-xs text-amber-600 mb-3 flex items-center gap-1">
                  <AlertTriangle size={12} /> Complete all QA checks to approve
                </p>
              )}

              <div className="space-y-2">
                <button onClick={handleApprove} disabled={approving || !allChecked}
                  className="w-full py-3 bg-[#1A7A4A] text-white text-sm font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-all">
                  {approving ? 'Approving…' : '✓ APPROVE REPORT'}
                </button>
                <button onClick={() => setShowCorrectionForm(true)}
                  className="w-full py-2.5 bg-[#D35400] text-white text-sm font-semibold rounded-xl hover:bg-orange-700 transition-all">
                  Request Corrections
                </button>
                <button onClick={() => toast.success('Report rejected')}
                  className="w-full py-2.5 border border-[#C0392B] text-[#C0392B] text-sm font-semibold rounded-xl hover:bg-red-50 transition-all">
                  Reject Report
                </button>
              </div>

              {showCorrectionForm && (
                <div className="mt-4 p-4 bg-[#F4F6F8] rounded-xl">
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Correction Notes</label>
                  <textarea value={correctionNote} onChange={e => setCorrectionNote(e.target.value)}
                    placeholder="Describe what needs to be corrected…" rows={3}
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 bg-white" />
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setShowCorrectionForm(false)} className="flex-1 py-2 border border-[#E5E7EB] rounded-lg text-xs font-medium hover:bg-white transition-colors">Cancel</button>
                    <button onClick={handleRequestCorrections} className="flex-1 py-2 bg-[#D35400] text-white rounded-lg text-xs font-semibold hover:bg-orange-700 transition-colors">Send</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
