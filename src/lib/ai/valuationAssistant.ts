/**
 * Phase 1 — heuristic valuation suggestions.
 * Suggest only; valuator remains accountable. Never silently overwrite prices.
 */

export type ValuationAssistInput = {
  make?: string | null;
  model?: string | null;
  year?: number | null;
  mileage?: number | null;
  /** Optional Carschek score 0–100 */
  score?: number | null;
  /** Peer valuations for comps (same make/year band when available) */
  comps?: Array<{
    make?: string | null;
    model?: string | null;
    year?: number | null;
    mileage?: number | null;
    marketValue: number;
    conditionValue?: number;
  }>;
};

export type ValuationAssistResult = {
  suggestedMarketValue: number;
  suggestedFsv: number;
  suggestedConditionValue: number;
  rangeLow: number;
  rangeHigh: number;
  confidence: 'low' | 'medium' | 'high';
  drivers: string[];
  disclaimer: string;
};

const FSV_RATIO = 0.7;

const DISCLAIMER =
  'Suggested values are heuristic assists from year, mileage, optional score, and similar Carschek valuations. Confirm with market comps before issuing a bank/client report.';

/** Rough NG retail anchors by age band (₦) — adjustable later from live sales. */
function baseByAge(year: number, nowYear: number): number {
  const age = Math.max(0, nowYear - year);
  if (age <= 2) return 12_000_000;
  if (age <= 5) return 8_500_000;
  if (age <= 8) return 5_500_000;
  if (age <= 12) return 3_500_000;
  if (age <= 16) return 2_200_000;
  return 1_200_000;
}

function mileageFactor(mileage: number | null | undefined): { factor: number; note?: string } {
  if (mileage == null || !Number.isFinite(mileage) || mileage <= 0) return { factor: 1 };
  if (mileage < 40_000) return { factor: 1.08, note: 'Lower mileage uplift applied' };
  if (mileage < 80_000) return { factor: 1.0 };
  if (mileage < 120_000) return { factor: 0.92, note: 'Mileage discount applied' };
  if (mileage < 180_000) return { factor: 0.84, note: 'Higher mileage discount applied' };
  return { factor: 0.75, note: 'Very high mileage discount applied' };
}

function scoreFactor(score: number | null | undefined): { factor: number; note?: string } {
  if (score == null || !Number.isFinite(score) || score <= 0) return { factor: 1 };
  if (score >= 90) return { factor: 1.06, note: 'Strong Carschek score uplift' };
  if (score >= 75) return { factor: 1.0 };
  if (score >= 60) return { factor: 0.94, note: 'Moderate score discount' };
  if (score >= 40) return { factor: 0.85, note: 'Below-average score discount' };
  return { factor: 0.72, note: 'Low score heavy discount' };
}

function makeFactor(make?: string | null): { factor: number; note?: string } {
  const m = (make || '').toUpperCase();
  if (!m) return { factor: 1 };
  if (['TOYOTA', 'LEXUS', 'HONDA'].includes(m)) return { factor: 1.05, note: `${m} demand uplift` };
  if (['MERCEDES', 'BMW', 'AUDI'].includes(m)) return { factor: 1.08, note: 'Premium brand uplift' };
  if (['KIA', 'HYUNDAI', 'NISSAN'].includes(m)) return { factor: 0.98 };
  return { factor: 1 };
}

export function suggestValuation(input: ValuationAssistInput): ValuationAssistResult | null {
  const nowYear = new Date().getFullYear();
  const year = input.year && input.year >= 1980 && input.year <= nowYear + 1 ? input.year : null;
  const drivers: string[] = [];

  let market = year ? baseByAge(year, nowYear) : 3_500_000;
  if (year) drivers.push(`Age band base for ${year} model year`);
  else drivers.push('No year — using generic base; add year for better assist');

  const mf = makeFactor(input.make);
  market *= mf.factor;
  if (mf.note) drivers.push(mf.note);

  const miles = mileageFactor(input.mileage ?? null);
  market *= miles.factor;
  if (miles.note) drivers.push(miles.note);

  const sf = scoreFactor(input.score ?? null);
  market *= sf.factor;
  if (sf.note) drivers.push(sf.note);

  const comps = (input.comps ?? []).filter(c => c.marketValue > 0);
  const sameMake = comps.filter(
    c =>
      (input.make && c.make && c.make.toUpperCase() === input.make.toUpperCase()) ||
      (year && c.year && Math.abs(c.year - year) <= 2)
  );
  const peer = sameMake.length ? sameMake : comps;
  if (peer.length >= 2) {
    const avg = peer.reduce((a, c) => a + c.marketValue, 0) / peer.length;
    market = Math.round(market * 0.45 + avg * 0.55);
    drivers.push(`Blended with ${peer.length} Carschek valuation comp(s)`);
  } else if (peer.length === 1) {
    market = Math.round(market * 0.65 + peer[0]!.marketValue * 0.35);
    drivers.push('Light blend with 1 valuation comp');
  } else {
    drivers.push('No comps available — heuristic only (lower confidence)');
  }

  market = Math.round(market / 50_000) * 50_000;
  const rangeLow = Math.round((market * 0.9) / 50_000) * 50_000;
  const rangeHigh = Math.round((market * 1.1) / 50_000) * 50_000;
  const fsv = Math.round(market * FSV_RATIO);
  let condition = market;
  if (input.score != null && input.score > 0) {
    condition = Math.round((market * (0.55 + (input.score / 100) * 0.4)) / 50_000) * 50_000;
    drivers.push('Condition value scaled from score');
  } else {
    condition = Math.round(market * 0.85);
  }

  const confidence: ValuationAssistResult['confidence'] =
    peer.length >= 3 && year && input.mileage != null ? 'high' : peer.length >= 1 || year ? 'medium' : 'low';

  return {
    suggestedMarketValue: market,
    suggestedFsv: fsv,
    suggestedConditionValue: condition,
    rangeLow,
    rangeHigh,
    confidence,
    drivers,
    disclaimer: DISCLAIMER,
  };
}
