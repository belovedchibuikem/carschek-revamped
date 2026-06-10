/**
 * Shared Brand → Model → Year cascade for every car form/filter in the app.
 *
 * Single source of truth: reference data in `mockData` (swappable for the
 * API later via `referenceApi`). Forms store either reference ids ('b1'/'m1')
 * or display names ('Toyota'/'Camry') — helpers exist for both so each call
 * site keeps its existing data shape.
 */
import { BRANDS, MODELS, YEARS } from '@/lib/mockData';
import type { SearchableSelectOption } from '@/components/shared/SearchableSelect';

type ModelRecord = (typeof MODELS)[number];

const norm = (s: string) => s.trim().toLowerCase();

// ── Brands ────────────────────────────────────────────────────────────────

export function activeBrands() {
  return BRANDS.filter(b => b.active);
}

/** Options keyed by brand id ('b1'). */
export function brandOptionsById(): SearchableSelectOption[] {
  return activeBrands().map(b => ({ value: b.id, label: b.name }));
}

/** Options keyed by brand display name ('Toyota'). */
export function brandOptionsByName(): SearchableSelectOption[] {
  return activeBrands().map(b => ({ value: b.name, label: b.name }));
}

export function findBrandByName(name: string | undefined | null) {
  if (!name) return undefined;
  return BRANDS.find(b => norm(b.name) === norm(name));
}

// ── Models (cascade off brand) ────────────────────────────────────────────

export function modelsForBrandId(brandId: string | undefined | null): ModelRecord[] {
  if (!brandId) return [];
  return MODELS.filter(m => m.active && m.brandId === brandId);
}

export function modelsForBrandName(brandName: string | undefined | null): ModelRecord[] {
  return modelsForBrandId(findBrandByName(brandName)?.id);
}

/** Options keyed by model id ('m1'), for a brand id. */
export function modelOptionsById(brandId: string | undefined | null): SearchableSelectOption[] {
  return modelsForBrandId(brandId).map(m => ({ value: m.id, label: m.name }));
}

/** Options keyed by model display name ('Camry'), for a brand display name. */
export function modelOptionsByName(brandName: string | undefined | null): SearchableSelectOption[] {
  return modelsForBrandName(brandName).map(m => ({ value: m.name, label: m.name }));
}

export function findModelById(modelId: string | undefined | null) {
  if (!modelId) return undefined;
  return MODELS.find(m => m.id === modelId);
}

export function findModelByName(
  brandName: string | undefined | null,
  modelName: string | undefined | null
) {
  if (!modelName) return undefined;
  const brand = findBrandByName(brandName);
  return MODELS.find(
    m => norm(m.name) === norm(modelName) && (!brand || m.brandId === brand.id)
  );
}

// ── Years (cascade off model) ─────────────────────────────────────────────

function activeYearNumbers(): number[] {
  return YEARS.filter(y => y.active)
    .map(y => y.year)
    .sort((a, b) => b - a);
}

/**
 * Years available for a model record — the active reference years clamped to
 * the model's production range. No model (or no range) → all active years.
 */
export function yearsForModel(model: ModelRecord | undefined): number[] {
  const all = activeYearNumbers();
  if (!model?.yearFrom) return all;
  const to = model.yearTo ?? new Date().getFullYear() + 1;
  return all.filter(y => y >= model.yearFrom && y <= to);
}

export function yearsForModelId(modelId: string | undefined | null): number[] {
  return yearsForModel(findModelById(modelId));
}

export function yearsForModelName(
  brandName: string | undefined | null,
  modelName: string | undefined | null
): number[] {
  return yearsForModel(findModelByName(brandName, modelName));
}

export function yearOptionsForModel(model: ModelRecord | undefined): SearchableSelectOption[] {
  return yearsForModel(model).map(y => ({ value: String(y), label: String(y) }));
}

export function yearOptionsForModelId(modelId: string | undefined | null): SearchableSelectOption[] {
  return yearOptionsForModel(findModelById(modelId));
}

export function yearOptionsForModelName(
  brandName: string | undefined | null,
  modelName: string | undefined | null
): SearchableSelectOption[] {
  return yearOptionsForModel(findModelByName(brandName, modelName));
}
