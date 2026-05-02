'use client';

import { create } from 'zustand';

type State = {
  signatureByOrder: Record<string, string | null>;
  setSignature: (orderId: string, dataUrl: string | null) => void;
};

export const useInspectionSignOffStore = create<State>(set => ({
  signatureByOrder: {},
  setSignature: (orderId, dataUrl) =>
    set(s => ({
      signatureByOrder: { ...s.signatureByOrder, [orderId]: dataUrl },
    })),
}));
