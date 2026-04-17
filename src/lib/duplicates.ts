/**
 * Smart duplicate detection (spec Part 10) — use before save / registration.
 */

export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i]![0] = i;
  for (let j = 0; j <= n; j++) dp[0]![j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i]![j] = Math.min(dp[i - 1]![j]! + 1, dp[i]![j - 1]! + 1, dp[i - 1]![j - 1]! + cost);
    }
  }
  return dp[m]![n]!;
}

export function findSimilarVins(input: string, existing: string[], maxDistance = 2): string[] {
  const v = input.trim().toUpperCase();
  if (v.length !== 17) return [];
  return existing.filter(e => e.length === 17 && levenshtein(v, e.toUpperCase()) <= maxDistance && v !== e.toUpperCase());
}

/** Normalize plate for OCR confusion (0/O, 1/I). */
export function normalizePlate(p: string): string {
  return p.toUpperCase().replace(/\s+/g, '').replace(/O/g, '0').replace(/I/g, '1');
}

export function platesPossiblyEqual(a: string, b: string): boolean {
  return normalizePlate(a) === normalizePlate(b);
}
