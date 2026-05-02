import type { CallStatus } from './types';

export const SALUTATIONS = ['Mr', 'Mrs', 'Ms', 'Dr', 'Engr'] as const;

export const CALL_STATUSES: CallStatus[] = [
  'Not Called',
  'Called - No Answer',
  'Called & Confirmed',
  'Called & Rejected',
  'Rescheduled',
];

export const BOOKING_SOURCES = [
  'Website',
  'Phone Call',
  'WhatsApp',
  'Walk-In',
  'Referral',
  'Social Media',
] as const;

export const SERVICE_TYPES = ['Inspection', 'Buy a Car', 'Sell a Car', 'General Service'] as const;

export const APPOINTMENT_STATUSES = ['pending', 'confirmed', 'rejected', 'cancelled', 'rescheduled'] as const;

export const LOCATIONS_SAMPLE = ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano', 'Enugu'] as const;

export const TRANSMISSIONS = ['Automatic', 'Manual', 'CVT'] as const;
