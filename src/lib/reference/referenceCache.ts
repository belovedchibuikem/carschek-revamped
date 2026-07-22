/**
 * Mutable reference snapshot so sync cascade helpers can use live API data
 * after `hydrateReferenceCache()` (or stay on mock seeds when USE_API_MOCK).
 */
import { BRANDS, MODELS, YEARS } from '@/lib/mockData';
import { referenceApi } from '@/lib/api/services';

export type BrandRow = (typeof BRANDS)[number];
export type ModelRow = (typeof MODELS)[number];
export type YearRow = (typeof YEARS)[number];

let brands: BrandRow[] = [...BRANDS];
let models: ModelRow[] = [...MODELS];
let years: YearRow[] = [...YEARS];
let hydrated = false;
let inflight: Promise<void> | null = null;

export function getCachedBrands() {
  return brands;
}
export function getCachedModels() {
  return models;
}
export function getCachedYears() {
  return years;
}

export async function hydrateReferenceCache(force = false): Promise<void> {
  if (hydrated && !force) return;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const [b, m, y] = await Promise.all([referenceApi.brands(), referenceApi.models(), referenceApi.years()]);
      brands = b as BrandRow[];
      models = m as ModelRow[];
      years = y as YearRow[];
      hydrated = true;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}
