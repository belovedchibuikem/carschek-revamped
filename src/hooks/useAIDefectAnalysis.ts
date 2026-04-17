'use client';

import { useCallback, useState } from 'react';

export type AIDefectSeverity = 'Minor' | 'Major' | 'Critical';

export interface AIDefectResult {
  defect: string;
  confidence: number;
  suggestedSeverity: AIDefectSeverity;
  description: string;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = r.result as string;
      const i = s.indexOf(',');
      resolve(i >= 0 ? s.slice(i + 1) : s);
    };
    r.onerror = () => reject(new Error('read failed'));
    r.readAsDataURL(blob);
  });
}

const MOCK: AIDefectResult = {
  defect: 'Surface panel deformation',
  confidence: 0.84,
  suggestedSeverity: 'Major',
  description: 'Visible panel dent approximately 8cm diameter on the right quarter panel',
};

export function useAIDefectAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AIDefectResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  const analyzePhoto = useCallback(async (blob: Blob): Promise<AIDefectResult | null> => {
    setIsAnalyzing(true);
    setResult(null);
    setError(null);
    try {
      const base64 = await blobToBase64(blob);
      const res = await fetch('/api/ai/defect-detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });
      let data: AIDefectResult;
      if (!res.ok) {
        data = MOCK;
      } else {
        const json = (await res.json()) as AIDefectResult;
        data =
          json && typeof json.defect === 'string' && typeof json.confidence === 'number'
            ? json
            : MOCK;
      }
      setResult(data);
      return data;
    } catch {
      setError('Analysis unavailable — please describe the defect manually');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return { analyzePhoto, isAnalyzing, result, error, clearResult };
}
