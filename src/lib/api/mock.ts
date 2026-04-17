/**
 * Central mock responses — replace imports in feature modules when API is live.
 */
import { CARS, CUSTOMERS, ORDERS, REPORTS } from '@/lib/mockData';

export async function mockListCars() {
  return { data: CARS };
}

export async function mockListOrders() {
  return { data: ORDERS };
}

export async function mockListReports() {
  return { data: REPORTS };
}

export async function mockListCustomers() {
  return { data: CUSTOMERS };
}
