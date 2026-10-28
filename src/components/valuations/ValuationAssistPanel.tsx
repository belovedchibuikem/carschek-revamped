'use client';

import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { PHASE1_DISCLAIMER, PHASE1_VALUATION_ASSIST } from '@/lib/ai/phase1Flags';
import { suggestValuation, type ValuationAssistInput } from '@/lib/ai/valuationAssistant';

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}

type Props = {
  input: ValuationAssistInput;
  onApply: (values: {
    marketValue: number;
    fsv: number;
    conditionValue: number;
  }) => void;
};

/** Suggest-only panel — never writes prices unless the user clicks Apply. */
export function ValuationAssistPanel({ input, onApply }: Props) {
  const result = useMemo(() => {
    if (!PHASE1_VALUATION_ASSIST) return null;
    return suggestValuation(input);
  }, [input]);

  if (!PHASE1_VALUATION_ASSIST || !result) return null;

  return (
    <div className="rounded-xl border border-dashed border-[#2E75B6]/40 bg-[#E8F1FB]/50 p-4">
      <div className="mb-2 flex items-center gap-2 text-[#1E3A5F]">
        <Sparkles size={16} />
        <p className="text-xs font-bold uppercase tracking-wide">Valuation assistant (suggest only)</p>
        <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[#6B7280]">
          Confidence: {result.confidence}
        </span>
      </div>
      <p className="text-sm font-semibold text-[#1F2937]">
        Suggested market {formatNaira(result.suggestedMarketValue)}{' '}
        <span className="font-normal text-[#6B7280]">
          (range {formatNaira(result.rangeLow)} – {formatNaira(result.rangeHigh)})
        </span>
      </p>
      <p className="mt-1 text-xs text-[#374151]">
        FSV {formatNaira(result.suggestedFsv)} · Condition {formatNaira(result.suggestedConditionValue)}
      </p>
      <ul className="mt-2 list-disc space-y-0.5 pl-4 text-[11px] text-[#6B7280]">
        {result.drivers.slice(0, 6).map((d, i) => (
          <li key={i}>{d}</li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() =>
          onApply({
            marketValue: result.suggestedMarketValue,
            fsv: result.suggestedFsv,
            conditionValue: result.suggestedConditionValue,
          })
        }
        className="mt-3 rounded-lg bg-[#1E3A5F] px-3 py-2 text-xs font-bold text-white hover:bg-[#16304f]"
      >
        Apply suggestions to form
      </button>
      <p className="mt-2 text-[10px] leading-relaxed text-[#6B7280]">
        {result.disclaimer} {PHASE1_DISCLAIMER}
      </p>
    </div>
  );
}
