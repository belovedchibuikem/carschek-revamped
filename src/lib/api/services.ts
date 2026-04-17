/**
 * Typed resource facades — feature modules should import from here instead of raw mock arrays.
 * Set NEXT_PUBLIC_USE_API_MOCK=false and NEXT_PUBLIC_API_BASE_URL for Laravel.
 */
import { apiRequest, USE_API_MOCK } from '@/lib/api/client';
import {
  CARS,
  CUSTOMERS,
  ORDERS,
  REPORTS,
  DEALS,
  LISTINGS,
  INSPECTORS,
  AUCTIONS,
  BRANDS,
  MODELS,
} from '@/lib/mockData';
import type { Appointment } from '@/lib/appointments/types';
import { APPOINTMENTS_SEED } from '@/lib/appointments/seed';

async function mockData<T>(data: T): Promise<T> {
  return data;
}

export const carsApi = {
  list: () => (USE_API_MOCK ? mockData([...CARS]) : apiRequest<typeof CARS>({ method: 'GET', url: '/cars' })),
  get: (id: string) =>
    USE_API_MOCK
      ? mockData(CARS.find(c => c.id === id) ?? CARS[0])
      : apiRequest<(typeof CARS)[0]>({ method: 'GET', url: `/cars/${id}` }),
};

export const ordersApi = {
  list: () => (USE_API_MOCK ? mockData([...ORDERS]) : apiRequest<typeof ORDERS>({ method: 'GET', url: '/orders' })),
  get: (id: string) =>
    USE_API_MOCK
      ? mockData(ORDERS.find(o => o.id === id) ?? ORDERS[0])
      : apiRequest<(typeof ORDERS)[0]>({ method: 'GET', url: `/orders/${id}` }),
};

export const customersApi = {
  list: () =>
    USE_API_MOCK ? mockData([...CUSTOMERS]) : apiRequest<typeof CUSTOMERS>({ method: 'GET', url: '/customers' }),
  get: (id: string) =>
    USE_API_MOCK
      ? mockData(CUSTOMERS.find(c => c.id === id) ?? CUSTOMERS[0])
      : apiRequest<(typeof CUSTOMERS)[0]>({ method: 'GET', url: `/customers/${id}` }),
};

export const reportsApi = {
  list: () => (USE_API_MOCK ? mockData([...REPORTS]) : apiRequest<typeof REPORTS>({ method: 'GET', url: '/reports' })),
  get: (id: string) =>
    USE_API_MOCK
      ? mockData(REPORTS.find(r => r.id === id) ?? REPORTS[0])
      : apiRequest<(typeof REPORTS)[0]>({ method: 'GET', url: `/reports/${id}` }),
};

export const dealsApi = {
  list: () => (USE_API_MOCK ? mockData([...DEALS]) : apiRequest<typeof DEALS>({ method: 'GET', url: '/deals' })),
  get: (id: string) =>
    USE_API_MOCK
      ? mockData(DEALS.find(d => d.id === id) ?? DEALS[0])
      : apiRequest<(typeof DEALS)[0]>({ method: 'GET', url: `/deals/${id}` }),
};

export const listingsApi = {
  list: () =>
    USE_API_MOCK ? mockData([...LISTINGS]) : apiRequest<typeof LISTINGS>({ method: 'GET', url: '/listings' }),
  get: (id: string) =>
    USE_API_MOCK
      ? mockData(LISTINGS.find(l => l.id === id) ?? LISTINGS[0])
      : apiRequest<(typeof LISTINGS)[0]>({ method: 'GET', url: `/listings/${id}` }),
};

export const inspectorsApi = {
  list: () =>
    USE_API_MOCK ? mockData([...INSPECTORS]) : apiRequest<typeof INSPECTORS>({ method: 'GET', url: '/inspectors' }),
  get: (id: string) =>
    USE_API_MOCK
      ? mockData(INSPECTORS.find(i => i.id === id) ?? INSPECTORS[0])
      : apiRequest<(typeof INSPECTORS)[0]>({ method: 'GET', url: `/inspectors/${id}` }),
};

export const auctionsApi = {
  list: () =>
    USE_API_MOCK ? mockData([...AUCTIONS]) : apiRequest<typeof AUCTIONS>({ method: 'GET', url: '/auctions' }),
  get: (id: string) =>
    USE_API_MOCK
      ? mockData(AUCTIONS.find(a => a.id === id) ?? AUCTIONS[0])
      : apiRequest<(typeof AUCTIONS)[0]>({ method: 'GET', url: `/auctions/${id}` }),
};

export const appointmentsApi = {
  list: () =>
    USE_API_MOCK
      ? mockData([...APPOINTMENTS_SEED] as Appointment[])
      : apiRequest<Appointment[]>({ method: 'GET', url: '/appointments' }),
};

export const referenceApi = {
  brands: () =>
    USE_API_MOCK ? mockData([...BRANDS]) : apiRequest<typeof BRANDS>({ method: 'GET', url: '/reference/brands' }),
  models: () =>
    USE_API_MOCK ? mockData([...MODELS]) : apiRequest<typeof MODELS>({ method: 'GET', url: '/reference/models' }),
};
