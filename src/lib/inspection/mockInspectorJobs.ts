import type { VehicleAngleId } from '@/lib/inspection/vehiclePhotoAngles';

export type InspectorJobStatusUi =
  | 'upcoming'
  | 'en-route'
  | 'in-progress'
  | 'awaiting-qa'
  | 'completed';

export type InspectorJobCard = {
  id: string;
  status: InspectorJobStatusUi;
  vehicleLabel: string;
  plate: string;
  vin: string;
  customer: string;
  phoneMasked: string;
  phoneFull: string;
  address: string;
  distanceKm: number;
  lat: number;
  lng: number;
  timeLabel: string;
  carschekScore?: number | null;
};

export const MOCK_INSPECTOR_NAME = 'Emeka Okonkwo';

export const MOCK_INSPECTOR_JOBS: InspectorJobCard[] = [
  {
    id: 'ORD-1892',
    status: 'in-progress',
    vehicleLabel: '2019 Toyota Camry',
    plate: 'LSD260JE',
    vin: '4T1BF3EK9BU228086',
    customer: 'Adaeze Mensah',
    phoneMasked: '+234 *** *** 0188',
    phoneFull: '+234 801 234 0188',
    address: '45 Admiralty Way, Lekki',
    distanceKm: 3.2,
    lat: 6.4281,
    lng: 3.4219,
    timeLabel: '10:30 AM',
    carschekScore: null,
  },
  {
    id: 'ORD-1895',
    status: 'upcoming',
    vehicleLabel: '2017 BMW 3 Series',
    plate: 'KN-123-KN',
    vin: 'WBA8E9G50HNU12345',
    customer: 'Ibrahim Musa',
    phoneMasked: '+234 *** *** 8901',
    phoneFull: '+234 804 567 8901',
    address: 'Victoria Island, Lagos',
    distanceKm: 5.1,
    lat: 6.4281,
    lng: 3.4219,
    timeLabel: '2:00 PM',
    carschekScore: null,
  },
  {
    id: 'ORD-1897',
    status: 'completed',
    vehicleLabel: '2020 Mercedes C-Class',
    plate: 'LND-789-KJ',
    vin: 'WDDWF4KB0KR012345',
    customer: 'Adaeze Mensah',
    phoneMasked: '+234 *** *** 5678',
    phoneFull: '+234 801 234 5678',
    address: 'Lagos Island, Lagos',
    distanceKm: 0,
    lat: 6.4541,
    lng: 3.3947,
    timeLabel: '10:00 AM',
    carschekScore: 88,
  },
];

export function findMockJob(id: string): InspectorJobCard | undefined {
  return MOCK_INSPECTOR_JOBS.find(j => j.id === id);
}

export type VehiclePhotoLocalState = Partial<Record<VehicleAngleId, string>>;
