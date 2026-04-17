/** Eleven vehicle angles — Prompt 05 (exact order & labels). */

export const VEHICLE_PHOTO_ANGLES = [
  { id: 'front', label: 'Front View' },
  { id: 'rear', label: 'Rear View' },
  { id: 'left_side', label: 'Left Side (Driver)' },
  { id: 'right_side', label: 'Right Side (Passenger)' },
  { id: 'front_left_45', label: 'Front-Left 45°' },
  { id: 'front_right_45', label: 'Front-Right 45°' },
  { id: 'rear_left_45', label: 'Rear-Left 45°' },
  { id: 'rear-right_45', label: 'Rear-Right 45°' },
  { id: 'interior', label: 'Interior / Dashboard' },
  { id: 'odometer', label: 'Odometer' },
  { id: 'engine_bay', label: 'Engine Bay' },
] as const;

export type VehicleAngleId = (typeof VEHICLE_PHOTO_ANGLES)[number]['id'];

export const VEHICLE_PHOTO_SLOTS: { id: VehicleAngleId; label: string; required: boolean }[] =
  VEHICLE_PHOTO_ANGLES.map((slot, i) => ({
    id: slot.id,
    label: slot.label,
    required: i < 4,
  }));

export const REQUIRED_VEHICLE_PHOTOS = VEHICLE_PHOTO_SLOTS.filter(s => s.required).length;

/** Grid order for capture UI (11 slots; matches inspector product layout). */
export const VEHICLE_PHOTO_GRID_ORDER: VehicleAngleId[] = [
  'front',
  'front_left_45',
  'front_right_45',
  'rear',
  'rear_left_45',
  'rear-right_45',
  'left_side',
  'right_side',
  'interior',
  'odometer',
  'engine_bay',
];

const CARD_TITLE: Record<VehicleAngleId, string> = {
  front: 'Car Overview',
  front_left_45: 'Car Front Left',
  front_right_45: 'Car Front Right',
  rear: 'Car Back',
  rear_left_45: 'Car Back Left',
  'rear-right_45': 'Car Back Right',
  left_side: 'Left Side',
  right_side: 'Right Side',
  interior: 'Car Inside Front',
  odometer: 'Car Inside Back',
  engine_bay: 'Car Motor',
};

export function vehiclePhotoCardTitle(id: VehicleAngleId): string {
  return CARD_TITLE[id] ?? VEHICLE_PHOTO_SLOTS.find(s => s.id === id)?.label ?? id;
}

/** Pre–Prompt-05 Dexie / UI keys → canonical ids */
export const LEGACY_VEHICLE_ANGLE_IDS: Record<string, VehicleAngleId> = {
  left: 'left_side',
  right: 'right_side',
  fl45: 'front_left_45',
  fr45: 'front_right_45',
  rl45: 'rear_left_45',
  rr45: 'rear-right_45',
  engine: 'engine_bay',
};

export function normalizeVehicleAngleId(raw: string): VehicleAngleId {
  const mapped = LEGACY_VEHICLE_ANGLE_IDS[raw] ?? raw;
  const slot = VEHICLE_PHOTO_SLOTS.find(s => s.id === mapped);
  return slot ? slot.id : VEHICLE_PHOTO_SLOTS[0]!.id;
}
