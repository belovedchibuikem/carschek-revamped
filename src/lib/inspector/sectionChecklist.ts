/** Shared checklist config for inspector section routes (`/inspector` + `/inspector-app`). */

export const SECTION_ITEMS = [
  { id: 'i1', name: 'Engine oil level', type: 'single' as const },
  { id: 'i2', name: 'Coolant level', type: 'single' as const },
  { id: 'i3', name: 'Engine mounts', type: 'single' as const },
  { id: 'i4', name: 'Timing belt condition', type: 'single' as const },
  { id: 'i5', name: 'Air filter', type: 'single' as const },
  { id: 'i6', name: 'Front brake pads', type: 'paired' as const, leftLabel: 'L', rightLabel: 'R' },
  { id: 'i7', name: 'Rear brake pads', type: 'paired' as const, leftLabel: 'L', rightLabel: 'R' },
  { id: 'i8', name: 'Exhaust system', type: 'single' as const },
];

export type SectionItemDef = (typeof SECTION_ITEMS)[number];
export type ItemResult = 'pass' | 'fail' | 'na' | null;

export function itemActioned(item: SectionItemDef, results: Record<string, ItemResult>) {
  if (item.type === 'paired') {
    return results[`${item.id}-L`] != null && results[`${item.id}-R`] != null;
  }
  return results[item.id] !== undefined && results[item.id] !== null;
}

export function itemHasFail(item: SectionItemDef, results: Record<string, ItemResult>) {
  if (item.type === 'paired') {
    return results[`${item.id}-L`] === 'fail' || results[`${item.id}-R`] === 'fail';
  }
  return results[item.id] === 'fail';
}
