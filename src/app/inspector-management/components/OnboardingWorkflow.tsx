'use client';
import React, { useState } from 'react';
import { ArrowLeft, Mail, FileText, Shield, CheckCircle, XCircle, User, Upload, AlertTriangle, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface OnboardingInspector {
  id: string;
  name: string;
  email: string;
  phone: string;
  invitedAt: string;
  step: 0 | 1 | 2 | 3 | 4;
  documents: {
    id: string;
    label: string;
    status: 'pending' | 'uploaded' | 'approved' | 'rejected';
    uploadedAt?: string;
    rejectionReason?: string;
  }[];
}

const STEPS = [
  { id: 0, label: 'Invite Sent', icon: Mail, description: 'Invitation email sent to candidate' },
  { id: 1, label: 'Details Submitted', icon: User, description: 'Personal info form completed' },
  { id: 2, label: 'Documents Uploaded', icon: Upload, description: 'All required documents uploaded' },
  { id: 3, label: 'Admin Review', icon: Shield, description: 'Documents under admin review' },
  { id: 4, label: 'Account Activated', icon: CheckCircle, description: 'Inspector account is live' },
];

const MOCK_ONBOARDING: OnboardingInspector[] = [
  {
    id: 'onb-001', name: 'Kelechi Obi', email: 'kelechi.obi@gmail.com', phone: '+234 803 441 9921', invitedAt: '08 Apr 2026',
    step: 3,
    documents: [
      { id: 'doc-nin', label: 'National ID (NIN)', status: 'approved', uploadedAt: '09 Apr 2026' },
      { id: 'doc-dl', label: "Driver's License", status: 'approved', uploadedAt: '09 Apr 2026' },
      { id: 'doc-ins', label: 'Insurance Certificate', status: 'rejected', uploadedAt: '09 Apr 2026', rejectionReason: 'Document is expired — please upload a valid certificate' },
    ],
  },
  {
    id: 'onb-002', name: 'Amara Okonkwo', email: 'amara.o@gmail.com', phone: '+234 705 334 8821', invitedAt: '07 Apr 2026',
    step: 2,
    documents: [
      { id: 'doc-nin', label: 'National ID (NIN)', status: 'uploaded', uploadedAt: '08 Apr 2026' },
      { id: 'doc-dl', label: "Driver's License", status: 'uploaded', uploadedAt: '08 Apr 2026' },
      { id: 'doc-ins', label: 'Insurance Certificate', status: 'pending' },
    ],
  },
  {
    id: 'onb-003', name: 'Seun Adeyemi', email: 'seun.a@gmail.com', phone: '+234 901 667 4432', invitedAt: '10 Apr 2026',
    step: 1,
    documents: [
      { id: 'doc-nin', label: 'National ID (NIN)', status: 'pending' },
      { id: 'doc-dl', label: "Driver's License", status: 'pending' },
      { id: 'doc-ins', label: 'Insurance Certificate', status: 'pending' },
    ],
  },
  {
    id: 'onb-004', name: 'Blessing Nwosu', email: 'blessing.n@gmail.com', phone: '+234 812 220 5543', invitedAt: '05 Apr 2026',
    step: 4,
    documents: [
      { id: 'doc-nin', label: 'National ID (NIN)', status: 'approved', uploadedAt: '06 Apr 2026' },
      { id: 'doc-dl', label: "Driver's License", status: 'approved', uploadedAt: '06 Apr 2026' },
      { id: 'doc-ins', label: 'Insurance Certificate', status: 'approved', uploadedAt: '06 Apr 2026' },
    ],
  },
];

interface Props { onBack: () => void; }

export default function OnboardingWorkflow({ onBack }: Props) {
  const [candidates, setCandidates] = useState<OnboardingInspector[]>(MOCK_ONBOARDING);
  const [selectedCandidate, setSelectedCandidate] = useState<OnboardingInspector | null>(null);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');

  const handleDocAction = (candidateId: string, docId: string, action: 'approved' | 'rejected', reason?: string) => {
    setCandidates(prev => prev.map(c => {
      if (c.id !== candidateId) return c;
      return {
        ...c,
        documents: c.documents.map(d => d.id === docId ? { ...d, status: action, rejectionReason: reason } : d),
      };
    }));
    if (selectedCandidate?.id === candidateId) {
      setSelectedCandidate(prev => prev ? {
        ...prev,
        documents: prev.documents.map(d => d.id === docId ? { ...d, status: action, rejectionReason: reason } : d),
      } : null);
    }
    toast[action === 'approved' ? 'success' : 'error'](`Document ${action}`);
  };

  const handleActivate = (candidateId: string) => {
    setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, step: 4 } : c));
    setSelectedCandidate(null);
    setShowActivateModal(false);
    toast.success('Inspector account activated successfully!');
  };

  const handleSendInvite = () => {
    if (!inviteEmail || !inviteName) { toast.error('Please fill in all fields'); return; }
    const newCandidate: OnboardingInspector = {
      id: `onb-${Date.now()}`, name: inviteName, email: inviteEmail, phone: '—', invitedAt: '10 Apr 2026',
      step: 0,
      documents: [
        { id: 'doc-nin', label: 'National ID (NIN)', status: 'pending' },
        { id: 'doc-dl', label: "Driver's License", status: 'pending' },
        { id: 'doc-ins', label: 'Insurance Certificate', status: 'pending' },
      ],
    };
    setCandidates(prev => [newCandidate, ...prev]);
    setShowInviteModal(false);
    setInviteEmail(''); setInviteName('');
    toast.success(`Invitation sent to ${inviteEmail}`);
  };

  const getStepColor = (step: number, current: number) => {
    if (step < current) return 'bg-[#1A7A4A] border-[#1A7A4A] text-white';
    if (step === current) return 'bg-[#ff5722] border-[#ff5722] text-white ring-4 ring-[#ff5722]/20';
    return 'bg-white border-[#E5E7EB] text-[#6B7280]';
  };

  const getDocStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-50 text-green-700 border border-green-200';
      case 'rejected': return 'bg-red-50 text-red-700 border border-red-200';
      case 'uploaded': return 'bg-blue-50 text-blue-700 border border-blue-200';
      default: return 'bg-gray-100 text-gray-500 border border-gray-200';
    }
  };

  if (selectedCandidate) {
    const allDocsReviewed = selectedCandidate.documents.every(d => d.status === 'approved' || d.status === 'rejected');
    const allApproved = selectedCandidate.documents.every(d => d.status === 'approved');

    return (
      <div className="space-y-5">
        <button onClick={() => setSelectedCandidate(null)} className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#1F2937] transition-colors">
          <ArrowLeft size={16} /> Back to Onboarding Queue
        </button>

        {/* Candidate header */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#ff5722] flex items-center justify-center text-white text-lg font-bold">
                {selectedCandidate.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h2 className="text-lg font-heading font-bold text-[#1F2937]">{selectedCandidate.name}</h2>
                <p className="text-sm text-[#6B7280]">{selectedCandidate.email} · {selectedCandidate.phone}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">Invited: {selectedCandidate.invitedAt}</p>
              </div>
            </div>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
              selectedCandidate.step === 4 ? 'bg-green-50 text-green-700' :
              selectedCandidate.step === 3 ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
            }`}>
              {STEPS[selectedCandidate.step]?.label}
            </span>
          </div>
        </div>

        {/* Stepper */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
          <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-6">Onboarding Progress</h3>
          <div className="relative">
            {/* Connector line */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-[#E5E7EB] hidden sm:block" style={{ zIndex: 0 }} />
            <div className="flex justify-between relative" style={{ zIndex: 1 }}>
              {STEPS.map((step, idx) => {
                const isComplete = idx < selectedCandidate.step;
                const isCurrent = idx === selectedCandidate.step;
                return (
                  <div key={step.id} className="flex flex-col items-center gap-2 flex-1">
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${getStepColor(idx, selectedCandidate.step)}`}>
                      {isComplete ? <CheckCircle size={18} /> : <step.icon size={16} />}
                    </div>
                    <div className="text-center">
                      <p className={`text-[10px] font-semibold ${isCurrent ? 'text-[#ff5722]' : isComplete ? 'text-[#1A7A4A]' : 'text-[#6B7280]'}`}>{step.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Document Review (Admin Review step) */}
        {selectedCandidate.step >= 2 && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm">
            <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-4 flex items-center gap-2">
              <FileText size={15} className="text-[#ff8a65]" /> Document Review
            </h3>
            <div className="space-y-3">
              {selectedCandidate.documents.map(doc => (
                <div key={doc.id} className="p-4 bg-[#F4F6F8] rounded-xl border border-[#E5E7EB]">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Shield size={18} className={
                        doc.status === 'approved' ? 'text-[#1A7A4A]' :
                        doc.status === 'rejected' ? 'text-[#C0392B]' :
                        doc.status === 'uploaded' ? 'text-[#ff8a65]' : 'text-[#6B7280]'
                      } />
                      <div>
                        <p className="text-sm font-semibold text-[#1F2937]">{doc.label}</p>
                        {doc.uploadedAt && <p className="text-[10px] text-[#6B7280]">Uploaded: {doc.uploadedAt}</p>}
                        {doc.rejectionReason && (
                          <p className="text-[10px] text-[#C0392B] mt-0.5 flex items-center gap-1">
                            <AlertTriangle size={10} /> {doc.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${getDocStatusBadge(doc.status)}`}>
                        {doc.status === 'uploaded' ? 'Awaiting Review' : doc.status}
                      </span>
                      {(doc.status === 'uploaded' || doc.status === 'pending') && doc.status === 'uploaded' && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleDocAction(selectedCandidate.id, doc.id, 'approved')}
                            className="flex items-center gap-1 px-2.5 py-1 bg-[#1A7A4A] text-white text-[10px] font-semibold rounded-lg hover:bg-[#155F3A] transition-colors"
                          >
                            <CheckCircle size={11} /> Approve
                          </button>
                          <button
                            onClick={() => handleDocAction(selectedCandidate.id, doc.id, 'rejected', 'Document quality insufficient — please resubmit')}
                            className="flex items-center gap-1 px-2.5 py-1 bg-[#C0392B] text-white text-[10px] font-semibold rounded-lg hover:bg-[#A93226] transition-colors"
                          >
                            <XCircle size={11} /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Activate button */}
            {allDocsReviewed && allApproved && selectedCandidate.step < 4 && (
              <div className="mt-5 p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-sm font-semibold text-[#1A7A4A] mb-3 flex items-center gap-2">
                  <CheckCircle size={15} /> All documents approved — ready to activate
                </p>
                <button
                  onClick={() => setShowActivateModal(true)}
                  className="px-5 py-2.5 bg-[#1A7A4A] text-white text-sm font-semibold rounded-lg hover:bg-[#155F3A] transition-all"
                >
                  Activate Inspector Account
                </button>
              </div>
            )}
            {allDocsReviewed && !allApproved && (
              <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm font-semibold text-[#C0392B] flex items-center gap-2">
                  <AlertTriangle size={15} /> Some documents were rejected — inspector must resubmit
                </p>
              </div>
            )}
          </div>
        )}

        {/* Activation confirmation modal */}
        {showActivateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowActivateModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle size={20} className="text-[#1A7A4A]" />
                </div>
                <h3 className="font-heading font-bold text-[#1F2937]">Activate Inspector Account</h3>
              </div>
              <p className="text-sm text-[#6B7280] mb-2">You are about to activate the account for:</p>
              <div className="p-3 bg-[#F4F6F8] rounded-lg mb-5">
                <p className="text-sm font-semibold text-[#1F2937]">{selectedCandidate.name}</p>
                <p className="text-xs text-[#6B7280]">{selectedCandidate.email}</p>
              </div>
              <p className="text-xs text-[#6B7280] mb-5">The inspector will receive a welcome email with login credentials and can immediately start accepting jobs.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowActivateModal(false)} className="flex-1 py-2.5 border border-[#E5E7EB] text-sm font-semibold text-[#6B7280] rounded-lg hover:bg-[#F4F6F8]">Cancel</button>
                <button onClick={() => handleActivate(selectedCandidate.id)} className="flex-1 py-2.5 bg-[#1A7A4A] text-white text-sm font-semibold rounded-lg hover:bg-[#155F3A]">Activate Account</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-heading font-bold text-[#1F2937]">Inspector Onboarding</h2>
          <p className="text-sm text-[#6B7280]">{candidates.filter(c => c.step < 4).length} candidates in progress</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19] transition-all"
        >
          <Mail size={15} /> Invite Inspector
        </button>
      </div>

      {/* Pipeline overview */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {STEPS.map(step => {
          const count = candidates.filter(c => c.step === step.id).length;
          return (
            <div key={step.id} className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm text-center">
              <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${count > 0 ? 'bg-[#ff5722] text-white' : 'bg-[#F4F6F8] text-[#6B7280]'}`}>
                <step.icon size={14} />
              </div>
              <p className="text-xl font-heading font-bold text-[#1F2937] tabular-nums">{count}</p>
              <p className="text-[10px] text-[#6B7280] font-medium leading-tight mt-0.5">{step.label}</p>
            </div>
          );
        })}
      </div>

      {/* Candidates list */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-sm font-heading font-semibold text-[#1F2937]">Onboarding Queue</h3>
        </div>
        <div className="divide-y divide-[#F4F6F8]">
          {candidates.map(candidate => {
            const step = STEPS[candidate.step];
            const docsUploaded = candidate.documents.filter(d => d.status !== 'pending').length;
            const docsApproved = candidate.documents.filter(d => d.status === 'approved').length;
            const hasRejected = candidate.documents.some(d => d.status === 'rejected');
            return (
              <div key={candidate.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#F4F6F8]/60 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-[#ff5722] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {candidate.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-[#1F2937]">{candidate.name}</p>
                    {candidate.step === 4 && <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-full font-semibold">Active</span>}
                    {hasRejected && candidate.step < 4 && <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded-full font-semibold">Docs Rejected</span>}
                  </div>
                  <p className="text-xs text-[#6B7280] truncate">{candidate.email}</p>
                </div>
                <div className="hidden sm:flex items-center gap-1">
                  {STEPS.map((s, idx) => (
                    <div key={s.id} className={`w-2 h-2 rounded-full ${idx < candidate.step ? 'bg-[#1A7A4A]' : idx === candidate.step ? 'bg-[#ff5722]' : 'bg-[#E5E7EB]'}`} />
                  ))}
                </div>
                <div className="hidden md:block text-center">
                  <p className="text-xs font-semibold text-[#1F2937]">{docsApproved}/{candidate.documents.length}</p>
                  <p className="text-[10px] text-[#6B7280]">docs approved</p>
                </div>
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full hidden sm:block ${
                  candidate.step === 4 ? 'bg-green-50 text-green-700' :
                  candidate.step === 3 ? 'bg-amber-50 text-amber-700' :
                  candidate.step === 2 ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'
                }`}>{step?.label}</span>
                <button
                  onClick={() => setSelectedCandidate(candidate)}
                  className="flex items-center gap-1 text-xs text-[#ff8a65] font-semibold hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Review <ChevronRight size={13} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowInviteModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            <h3 className="font-heading font-bold text-[#1F2937] mb-1">Invite Inspector</h3>
            <p className="text-xs text-[#6B7280] mb-5">Send an onboarding invitation. The role will be pre-set to Inspector.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">Full Name</label>
                <input type="text" value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="e.g. Kelechi Obi" className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20 focus:border-[#ff5722] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">Email Address</label>
                <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="inspector@example.com" className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20 focus:border-[#ff5722] transition-all" />
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-[#ff8a65]">Role: <span className="font-semibold">Inspector</span> · The candidate will receive a link to complete their profile and upload documents.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowInviteModal(false)} className="flex-1 py-2.5 border border-[#E5E7EB] text-sm font-semibold text-[#6B7280] rounded-lg hover:bg-[#F4F6F8]">Cancel</button>
              <button onClick={handleSendInvite} className="flex-1 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19] flex items-center justify-center gap-2">
                <Mail size={14} /> Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
