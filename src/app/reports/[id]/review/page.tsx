'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, X, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { REPORTS, getScoreLabel } from '@/lib/mockData';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { CarschekScore } from '@/components/shared/CarschekScore';
import { openPrintableReport } from '@/lib/print';
import { getReportVersionMeta } from '@/lib/reports/reportVersions';
import { enqueueQaReportApprove } from '@/lib/qaOfflineQueue';

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
  const [qaChecks, setQaChecks] = useState({
    photos: false,
    defects: false,
    score: false,
    completeness: false,
    accuracy: false,
    signature: false,
  });
  const [adminComment, setAdminComment] = useState('');
  const [approving, setApproving] = useState(false);
  const [correctionNote, setCorrectionNote] = useState('');
  const [showCorrectionForm, setShowCorrectionForm] = useState(false);
  const [qaRightTab, setQaRightTab] = useState<'checklist' | 'history'>('checklist');
  const versionHistory = getReportVersionMeta(report.id);

  const allChecked = Object.values(qaChecks).every(Boolean);

  const handleApprove = async () => {
    if (!allChecked) { toast.error('Complete all QA checks including QA signature acknowledgment'); return; }
    setApproving(true);
    await new Promise(r => setTimeout(r, 1500));
    setApproving(false);
    const offline = typeof navigator !== 'undefined' && !navigator.onLine;
    if (offline) {
      await enqueueQaReportApprove(reportId, {
        qaChecks,
        adminComment,
        at: Date.now(),
      });
      toast.success('Approved locally — queued for sync when you are back online.');
    } else {
      toast.success('Report approved! PDF generated and customer notified.');
    }
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
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <CarschekScore score={report.score} size={96} showLabel />
                <div>
                  <h2 className="text-lg font-heading font-bold text-[#1F2937]">{report.carName}</h2>
                  <p className="text-sm text-[#6B7280]">Carschek Score: {report.score}/100 — {getScoreLabel(report.score)}</p>
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
              <div className="flex gap-1 mb-4 border-b border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setQaRightTab('checklist')}
                  className={`flex-1 px-3 py-2 text-sm font-semibold rounded-t-lg border-b-2 -mb-px transition-colors ${
                    qaRightTab === 'checklist' ? 'border-[#1E3A5F] text-[#1E3A5F]' : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
                  }`}
                >
                  QA Checklist
                </button>
                <button
                  type="button"
                  onClick={() => setQaRightTab('history')}
                  className={`flex-1 px-3 py-2 text-sm font-semibold rounded-t-lg border-b-2 -mb-px transition-colors ${
                    qaRightTab === 'history' ? 'border-[#1E3A5F] text-[#1E3A5F]' : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
                  }`}
                >
                  History
                </button>
              </div>

              {qaRightTab === 'history' ? (
                <div className="space-y-0">
                  <p className="text-xs text-[#6B7280] mb-4">Version timeline for this report.</p>
                  <div className="relative pl-4 border-l-2 border-[#E5E7EB] space-y-6">
                    {versionHistory.map((v, i) => (
                      <div key={v.version} className="relative">
                        <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-[#1E3A5F] ring-4 ring-white" />
                        <p className="text-sm font-semibold text-[#1F2937]">
                          v{v.version} {v.kind}
                          {i < versionHistory.length - 1 ? (
                            <span className="text-[#9CA3AF] font-normal text-xs ml-2">→</span>
                          ) : null}
                        </p>
                        <p className="text-xs text-[#6B7280] mt-0.5">
                          {new Date(v.at).toLocaleString('en-NG', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          · {v.author}
                        </p>
                        {v.summary ? <p className="text-xs text-[#374151] mt-2 italic">&ldquo;{v.summary}&rdquo;</p> : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-5">
                    {[
                      { key: 'photos', label: 'All required photos present' },
                      { key: 'defects', label: 'Defects accurately documented' },
                      { key: 'score', label: 'Score calculation verified' },
                      { key: 'completeness', label: 'All 27 sections completed' },
                      { key: 'accuracy', label: 'Inspector notes are clear' },
                      { key: 'signature', label: 'Inspector e-sign present / verified (required)' },
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
                    <button
                      type="button"
                      onClick={() =>
                        openPrintableReport({
                          title: `QA review — ${report.id}`,
                          subtitle: report.carName,
                          bodyHtml: `<p><strong>Inspector:</strong> ${report.inspectorName}</p><p><strong>Score:</strong> ${report.score} (${getScoreLabel(report.score)})</p><p><strong>Defects:</strong> ${report.defects} total, ${report.criticalDefects} critical</p><p>QA checklist and section details are available in the app.</p>`,
                        })
                      }
                      className="w-full py-2.5 border border-[#E5E7EB] text-sm font-semibold rounded-xl text-[#1F2937] hover:bg-[#F9FAFB] transition-all"
                    >
                      Print review summary
                    </button>
                    <button type="button" onClick={handleApprove} disabled={approving || !allChecked}
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
