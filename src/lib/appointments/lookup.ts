import { CARS } from '@/lib/mockData';

/** Optional live inventory for VIN/plate lookup when hydrated from the API. */
let liveCars: { id: string; vin: string; plate: string }[] | null = null;

export function setAppointmentLookupCars(cars: { id: string; vin: string; plate: string }[]) {
  liveCars = cars;
}

function inventory() {
  return liveCars && liveCars.length > 0 ? liveCars : CARS;
}

/** Find a car id by VIN or plate (case-insensitive, plate ignores spaces/dashes). */
export function findCarIdByVinOrPlate(vin?: string | null, plate?: string | null): string | null {
  const v = (vin ?? '').replace(/\s/g, '').toUpperCase();
  const p = (plate ?? '').replace(/[\s-]/g, '').toUpperCase();
  for (const c of inventory()) {
    if (v && c.vin.replace(/\s/g, '').toUpperCase() === v) return c.id;
    if (p && c.plate.replace(/[\s-]/g, '').toUpperCase() === p) return c.id;
  }
  return null;
}
