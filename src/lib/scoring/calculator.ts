/**
 * Carschek Score — weighted sections, severity penalties.
 * UI thresholds: match product (red / amber / green / navy bands) in consuming components.
 */

export type Severity = 'minor' | 'major' | 'critical';

const SECTION_WEIGHTS: Record<string, number> = {
  'engine-bay': 0.2,
  'body-frame': 0.15,
  underbody: 0.12,
  electrical: 0.1,
  lights: 0.08,
  'tyres-wheels': 0.08,
  interior: 0.07,
  glass: 0.05,
  shields: 0.05,
  equipment: 0.04,
  'fluids-filters': 0.04,
  mirrors: 0.01,
};

const SEVERITY_PENALTY: Record<Severity, number> = {
  minor: 0.5,
  major: 2,
  critical: 5,
};

/** Remaining section keys share the leftover weight so total = 1. */
const DEFAULT_SECTION_KEY = 'misc';

export interface SectionDefects {
  sectionKey: string;
  defects: { severity: Severity }[];
}

export interface CarschekScoreResult {
  score: number;
  breakdown: { sectionKey: string; weightedPenalty: number }[];
}

function normalizeWeights(keys: string[]): Map<string, number> {
  const map = new Map<string, number>();
  const known = keys.filter(k => SECTION_WEIGHTS[k] != null);
  const unknown = keys.filter(k => SECTION_WEIGHTS[k] == null);
  let assigned = 0;
  known.forEach(k => {
    const w = SECTION_WEIGHTS[k] ?? 0;
    map.set(k, w);
    assigned += w;
  });
  const remainder = Math.max(0, 1 - assigned);
  const share = unknown.length ? remainder / unknown.length : 0;
  unknown.forEach(k => map.set(k, share));
  return map;
}

/**
 * Start at 100. For each section, subtract severity penalties, multiply by section weight, sum penalties.
 * Final score = max(0, floor(100 - totalWeightedPenalty)).
 */
export function calculateCarschekScore(sectionDefects: SectionDefects[]): CarschekScoreResult {
  const keys = sectionDefects.length
    ? sectionDefects.map(s => s.sectionKey)
    : [DEFAULT_SECTION_KEY];
  const weights = normalizeWeights(keys);

  const breakdown: { sectionKey: string; weightedPenalty: number }[] = [];
  let total = 0;

  for (const block of sectionDefects) {
    const w = weights.get(block.sectionKey) ?? 0;
    let sectionPenalty = 0;
    for (const d of block.defects) {
      sectionPenalty += SEVERITY_PENALTY[d.severity] ?? 0;
    }
    const weighted = sectionPenalty * w;
    breakdown.push({ sectionKey: block.sectionKey, weightedPenalty: weighted });
    total += weighted;
  }

  const score = Math.max(0, Math.min(100, Math.floor(100 - total)));
  return { score, breakdown };
}

export function scoreBand(score: number): 'poor' | 'fair' | 'good' | 'very-good' | 'excellent' {
  if (score <= 40) return 'poor';
  if (score <= 60) return 'fair';
  if (score <= 75) return 'good';
  if (score <= 90) return 'very-good';
  return 'excellent';
}
