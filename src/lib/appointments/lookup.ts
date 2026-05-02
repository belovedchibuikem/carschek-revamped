import { CARS } from '@/lib/mockData';
import { platesPossiblyEqual } from '@/lib/duplicates';

export function findCarIdByVinOrPlate(vin: string, plate?: string | null): string | null {
  const nv = vin.replace(/\s/g, '').toUpperCase();
  for (const c of CARS) {
    if (c.vin.replace(/\s/g, '').toUpperCase() === nv) return c.id;
    if (plate?.trim() && platesPossiblyEqual(c.plate, plate)) return c.id;
  }
  return null;
}
