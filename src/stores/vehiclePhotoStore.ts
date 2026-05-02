'use client';

import { create } from 'zustand';
import type { VehicleAngleId } from '@/lib/inspection/vehiclePhotoAngles';

/** Use in Zustand selectors instead of `?? {}` so referential equality stays stable when a job has no photos. */
export const EMPTY_VEHICLE_PHOTO_MAP: Partial<Record<VehicleAngleId, string>> = {};

type State = {
  urlsByOrder: Record<string, Partial<Record<VehicleAngleId, string>>>;
  setPhoto: (orderId: string, angle: VehicleAngleId, url: string) => void;
};

export const useVehiclePhotoStore = create<State>(set => ({
  urlsByOrder: {},
  setPhoto: (orderId, angle, url) =>
    set(s => ({
      urlsByOrder: {
        ...s.urlsByOrder,
        [orderId]: { ...s.urlsByOrder[orderId], [angle]: url },
      },
    })),
}));
