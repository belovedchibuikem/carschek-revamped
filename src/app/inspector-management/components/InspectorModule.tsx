'use client';
import React, { useState } from 'react';
import InspectorList from './InspectorList';
import InspectorProfile from './InspectorProfile';
import OnboardingWorkflow from './OnboardingWorkflow';

export interface Inspector {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  zones: string[];
  status: 'available' | 'busy' | 'off-duty';
  jobsToday: number;
  jobsMonth: number;
  earningsMTD: number;
  certification: string;
  phone: string;
  email: string;
  onTimeRate: number;
  totalJobs: number;
  joinedDate: string;
}

export const MOCK_INSPECTORS: Inspector[] = [
  { id: 'insp-001', name: 'Emeka Okonkwo', avatar: 'EO', rating: 4.9, zones: ['Lagos Island', 'Lekki', 'VI'], status: 'available', jobsToday: 5, jobsMonth: 28, earningsMTD: 185000, certification: 'Senior Inspector', phone: '+234 803 441 9921', email: 'emeka.o@carschek.com', onTimeRate: 98, totalJobs: 234, joinedDate: 'Jan 2023' },
  { id: 'insp-002', name: 'Adaora Nwosu', avatar: 'AN', rating: 4.8, zones: ['Lekki Phase 2', 'VI', 'Ikoyi'], status: 'busy', jobsToday: 4, jobsMonth: 24, earningsMTD: 162000, certification: 'Senior Inspector', phone: '+234 705 334 8821', email: 'adaora.n@carschek.com', onTimeRate: 96, totalJobs: 198, joinedDate: 'Mar 2023' },
  { id: 'insp-003', name: 'Chukwudi Eze', avatar: 'CE', rating: 4.7, zones: ['Abuja Central', 'Wuse', 'Maitama'], status: 'available', jobsToday: 3, jobsMonth: 22, earningsMTD: 148000, certification: 'Inspector', phone: '+234 901 667 4432', email: 'chukwudi.e@carschek.com', onTimeRate: 94, totalJobs: 167, joinedDate: 'May 2023' },
  { id: 'insp-004', name: 'Fatima Bello', avatar: 'FB', rating: 4.6, zones: ['Kano Metro', 'Sabon Gari'], status: 'available', jobsToday: 4, jobsMonth: 19, earningsMTD: 128000, certification: 'Inspector', phone: '+234 812 220 5543', email: 'fatima.b@carschek.com', onTimeRate: 91, totalJobs: 142, joinedDate: 'Jun 2023' },
  { id: 'insp-005', name: 'Olumide Adeyemi', avatar: 'OA', rating: 4.5, zones: ['Ibadan', 'Bodija'], status: 'off-duty', jobsToday: 0, jobsMonth: 17, earningsMTD: 114000, certification: 'Inspector', phone: '+234 706 881 2234', email: 'olumide.a@carschek.com', onTimeRate: 89, totalJobs: 128, joinedDate: 'Aug 2023' },
  { id: 'insp-006', name: 'Ngozi Okafor', avatar: 'NO', rating: 4.4, zones: ['Port Harcourt', 'GRA', 'Trans Amadi'], status: 'busy', jobsToday: 3, jobsMonth: 16, earningsMTD: 107000, certification: 'Inspector', phone: '+234 803 554 7761', email: 'ngozi.o@carschek.com', onTimeRate: 87, totalJobs: 112, joinedDate: 'Sep 2023' },
  { id: 'insp-007', name: 'Ibrahim Musa', avatar: 'IM', rating: 4.3, zones: ['Abuja Suburbs', 'Gwagwalada'], status: 'available', jobsToday: 2, jobsMonth: 14, earningsMTD: 94000, certification: 'Junior Inspector', phone: '+234 812 443 6621', email: 'ibrahim.m@carschek.com', onTimeRate: 85, totalJobs: 89, joinedDate: 'Nov 2023' },
  { id: 'insp-008', name: 'Taiwo Ogundimu', avatar: 'TO', rating: 4.2, zones: ['Lagos Mainland', 'Surulere'], status: 'off-duty', jobsToday: 0, jobsMonth: 13, earningsMTD: 87000, certification: 'Junior Inspector', phone: '+234 705 221 9934', email: 'taiwo.o@carschek.com', onTimeRate: 82, totalJobs: 74, joinedDate: 'Jan 2024' },
];

export default function InspectorModule() {
  const [selectedInspector, setSelectedInspector] = useState<Inspector | null>(null);
  const [activeView, setActiveView] = useState<'list' | 'onboarding'>('list');

  if (selectedInspector) {
    return <InspectorProfile inspector={selectedInspector} onBack={() => setSelectedInspector(null)} />;
  }

  if (activeView === 'onboarding') {
    return <OnboardingWorkflow onBack={() => setActiveView('list')} />;
  }

  return (
    <div className="space-y-4">
      {/* View toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveView('list')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeView === 'list' ? 'bg-[#1E3A5F] text-white' : 'border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F4F6F8]'}`}
        >
          Inspector List
        </button>
        <button
          onClick={() => setActiveView('onboarding')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeView === 'onboarding' ? 'bg-[#1E3A5F] text-white' : 'border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F4F6F8]'}`}
        >
          Onboarding Workflow
        </button>
      </div>
      <InspectorList inspectors={MOCK_INSPECTORS} onSelectInspector={setSelectedInspector} />
    </div>
  );
}