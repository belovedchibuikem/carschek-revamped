'use client';
import React, { useState } from 'react';
import QAQueue from './QAQueue';
import ReportReviewPanel from './ReportReviewPanel';

export interface Report {
  id: string;
  orderId: string;
  vehicle: string;
  inspector: string;
  inspectorAvatar: string;
  submittedAt: string;
  minutesInQueue: number;
  defectsFound: number;
  score: number;
  priority: 'high' | 'medium' | 'low';
  qaStatus: 'awaiting' | 'under-review' | 'approved' | 'rejected';
  version: number;
}

export const MOCK_REPORTS: Report[] = [
  { id: 'RPT-501', orderId: 'ORD-1890', vehicle: '2020 Ford Escape — PHC-882-AA', inspector: 'Ngozi Okafor', inspectorAvatar: 'NO', submittedAt: '10 Apr 2026, 09:48', minutesInQueue: 154, defectsFound: 7, score: 74, priority: 'high', qaStatus: 'awaiting', version: 1 },
  { id: 'RPT-500', orderId: 'ORD-1888', vehicle: '2021 Mercedes C300 — LSD-991-XY', inspector: 'Adaora Nwosu', inspectorAvatar: 'AN', submittedAt: '10 Apr 2026, 10:22', minutesInQueue: 100, defectsFound: 2, score: 88, priority: 'medium', qaStatus: 'under-review', version: 2 },
  { id: 'RPT-499', orderId: 'ORD-1887', vehicle: '2022 Hyundai Tucson — ABJ-556-EF', inspector: 'Ibrahim Musa', inspectorAvatar: 'IM', submittedAt: '09 Apr 2026, 15:55', minutesInQueue: 48, defectsFound: 4, score: 81, priority: 'low', qaStatus: 'awaiting', version: 1 },
  { id: 'RPT-498', orderId: 'ORD-1886', vehicle: '2019 Kia Sorento — IBD-223-BC', inspector: 'Olumide Adeyemi', inspectorAvatar: 'OA', submittedAt: '09 Apr 2026, 09:30', minutesInQueue: 200, defectsFound: 9, score: 69, priority: 'high', qaStatus: 'rejected', version: 1 },
  { id: 'RPT-497', orderId: 'ORD-1885', vehicle: '2016 Toyota Highlander — LSD-334-MN', inspector: 'Emeka Okonkwo', inspectorAvatar: 'EO', submittedAt: '09 Apr 2026, 11:10', minutesInQueue: 0, defectsFound: 11, score: 55, priority: 'low', qaStatus: 'approved', version: 3 },
  { id: 'RPT-496', orderId: 'ORD-1884', vehicle: '2018 Nissan Pathfinder — LND-441-PQ', inspector: 'Chukwudi Eze', inspectorAvatar: 'CE', submittedAt: '10 Apr 2026, 07:45', minutesInQueue: 35, defectsFound: 5, score: 77, priority: 'low', qaStatus: 'awaiting', version: 1 },
];

export default function ReportsQAModule() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  if (selectedReport) {
    return <ReportReviewPanel report={selectedReport} onBack={() => setSelectedReport(null)} />;
  }

  return <QAQueue reports={MOCK_REPORTS} onSelectReport={setSelectedReport} />;
}