/**
 * Phase 1 — explainable "Observed risks" from inspection defects + score.
 * Rule-based only (no ML). Safe to show with explicit disclaimer.
 */

import type { DefectSummary, ReportSectionBreakdown } from '@/lib/inspection/reportTypes';

export type ObservedRiskLevel = 'low' | 'moderate' | 'elevated' | 'high';

export type ObservedRisk = {
  id: string;
  systemArea: string;
  level: ObservedRiskLevel;
  title: string;
  drivers: string[];
  basedOn: 'defects' | 'score' | 'section_fail_rate';
};

export type ObservedRisksPayload = {
  overallLevel: ObservedRiskLevel;
  summary: string;
  risks: ObservedRisk[];
  disclaimer: string;
};

const DISCLAIMER =
  'Observed risks are assisted insights from this inspection’s recorded defects and Carschek score. They are not predictions of future failure and do not replace professional diagnosis.';

const SECTION_AREA: Record<string, string> = {
  S05: 'Body / exterior',
  S06: 'Body / exterior',
  S07: 'Glass / mirrors',
  S08: 'Lights',
  S09: 'Tyres / wheels',
  S10: 'Underbody',
  S11: 'Engine bay',
  S12: 'Engine bay',
  S13: 'Fluids / filters',
  S14: 'Transmission',
  S15: 'Suspension',
  S16: 'Brakes',
  S17: 'Electrical',
  S18: 'Interior',
  S19: 'Interior',
  S20: 'Safety systems',
  S21: 'Equipment',
  S22: 'Equipment',
  S23: 'Documents',
  S24: 'OBD / electronics',
  S25: 'Damage',
  S26: 'Inspector notes',
};

function levelRank(level: ObservedRiskLevel): number {
  if (level === 'high') return 3;
  if (level === 'elevated') return 2;
  if (level === 'moderate') return 1;
  return 0;
}

function maxLevel(a: ObservedRiskLevel, b: ObservedRiskLevel): ObservedRiskLevel {
  return levelRank(a) >= levelRank(b) ? a : b;
}

function severityLevel(sev: string): ObservedRiskLevel {
  const s = sev.toLowerCase();
  if (s === 'critical') return 'high';
  if (s === 'major') return 'elevated';
  return 'moderate';
}

export function buildObservedRisks(input: {
  score: number;
  defects: DefectSummary[];
  sectionBreakdowns?: ReportSectionBreakdown[];
}): ObservedRisksPayload {
  const risks: ObservedRisk[] = [];
  const byArea = new Map<string, { level: ObservedRiskLevel; drivers: string[]; basedOn: ObservedRisk['basedOn'] }>();

  for (const d of input.defects) {
    const area = SECTION_AREA[d.sectionId] || d.sectionName || 'General';
    const level = severityLevel(d.severity);
    const driver = `${d.itemLabel}${d.severity ? ` (${d.severity})` : ''}${d.note ? `: ${d.note.slice(0, 80)}` : ''}`;
    const prev = byArea.get(area);
    if (!prev) {
      byArea.set(area, { level, drivers: [driver], basedOn: 'defects' });
    } else {
      prev.level = maxLevel(prev.level, level);
      if (prev.drivers.length < 5) prev.drivers.push(driver);
    }
  }

  for (const [area, v] of byArea) {
    risks.push({
      id: `risk-${area.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      systemArea: area,
      level: v.level,
      title: `${area} — ${v.level} observed risk`,
      drivers: v.drivers,
      basedOn: v.basedOn,
    });
  }

  if (input.sectionBreakdowns) {
    for (const sec of input.sectionBreakdowns) {
      if (!sec.anyFailure || sec.total <= 0) continue;
      const failRate = (sec.total - sec.passed) / sec.total;
      if (failRate < 0.35) continue;
      const area = SECTION_AREA[sec.sectionId] || sec.name;
      if (byArea.has(area)) continue;
      risks.push({
        id: `risk-rate-${sec.sectionId}`,
        systemArea: area,
        level: failRate >= 0.6 ? 'elevated' : 'moderate',
        title: `${area} — elevated fail rate in checklist`,
        drivers: [`${sec.passed}/${sec.total} items passed (${Math.round(failRate * 100)}% not OK)`],
        basedOn: 'section_fail_rate',
      });
    }
  }

  let overall: ObservedRiskLevel = 'low';
  if (input.score > 0 && input.score < 40) overall = 'high';
  else if (input.score > 0 && input.score < 60) overall = 'elevated';
  else if (input.score > 0 && input.score < 75) overall = 'moderate';

  for (const r of risks) {
    overall = maxLevel(overall, r.level);
  }

  if (input.score > 0 && input.score < 75) {
    risks.unshift({
      id: 'risk-overall-score',
      systemArea: 'Overall condition',
      level: input.score < 40 ? 'high' : input.score < 60 ? 'elevated' : 'moderate',
      title: `Carschek score ${input.score}/100`,
      drivers: [
        input.score < 40
          ? 'Score indicates significant recorded defects — prioritize critical repairs before listing.'
          : input.score < 60
            ? 'Score is below typical retail readiness — review major defects carefully.'
            : 'Score is moderate — verify outstanding defects before sale or financing.',
      ],
      basedOn: 'score',
    });
  }

  risks.sort((a, b) => levelRank(b.level) - levelRank(a.level));

  const summary =
    overall === 'high'
      ? 'High observed risk from recorded critical/major findings and/or low Carschek score.'
      : overall === 'elevated'
        ? 'Elevated observed risk — review listed drivers before purchase or financing.'
        : overall === 'moderate'
          ? 'Moderate observed risk — some defects or score bands warrant attention.'
          : risks.length
            ? 'Limited observed risk from recorded findings.'
            : 'No defect-based observed risks from this inspection record.';

  return { overallLevel: overall, summary, risks: risks.slice(0, 12), disclaimer: DISCLAIMER };
}
