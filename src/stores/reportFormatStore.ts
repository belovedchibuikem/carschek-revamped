'use client';

import { create } from 'zustand';
import type { ReportVariant } from '@/lib/inspection/reportTypes';
import { persistReportFormatChoice } from '@/lib/inspection/reportFormatPersistence';

type State = {
  choiceByInspection: Record<string, ReportVariant | undefined>;
  setReportFormat: (inspectionId: string, variant: ReportVariant) => void;
  seedFromDexie: (inspectionId: string, variant: ReportVariant | null) => void;
};

export const useReportFormatStore = create<State>((set, get) => ({
  choiceByInspection: {},
  setReportFormat: (inspectionId, variant) => {
    set(s => ({
      choiceByInspection: { ...s.choiceByInspection, [inspectionId]: variant },
    }));
    void persistReportFormatChoice(inspectionId, variant);
  },
  seedFromDexie: (inspectionId, variant) => {
    if (variant == null) return;
    if (get().choiceByInspection[inspectionId] != null) return;
    set(s => ({
      choiceByInspection: { ...s.choiceByInspection, [inspectionId]: variant },
    }));
  },
}));
