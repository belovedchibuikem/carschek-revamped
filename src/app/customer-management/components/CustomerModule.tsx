'use client';
import React, { useState } from 'react';
import CustomerList from './CustomerList';
import CustomerProfile from './CustomerProfile';

export interface Customer {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  totalBookings: number;
  lastActive: string;
  lifetimeValue: number;
  status: 'active' | 'flagged' | 'suspended';
  memberSince: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  bvnVerified: boolean;
  vehiclesInspected: number;
}

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'cust-001', name: 'Adaeze Mbah', avatar: 'AM', phone: '+234 803 441 2291', email: 'adaeze.mbah@gmail.com', totalBookings: 7, lastActive: '10 Apr 2026', lifetimeValue: 378000, status: 'active', memberSince: 'Feb 2024', phoneVerified: true, emailVerified: true, bvnVerified: true, vehiclesInspected: 7 },
  { id: 'cust-002', name: 'Tunde Babatunde', avatar: 'TB', phone: '+234 812 334 5567', email: 'tunde.b@yahoo.com', totalBookings: 3, lastActive: '09 Apr 2026', lifetimeValue: 162000, status: 'active', memberSince: 'Jun 2024', phoneVerified: true, emailVerified: true, bvnVerified: false, vehiclesInspected: 3 },
  { id: 'cust-003', name: 'Chidi Obi', avatar: 'CO', phone: '+234 901 557 2213', email: 'chidi.obi@cardealer.ng', totalBookings: 18, lastActive: '10 Apr 2026', lifetimeValue: 972000, status: 'active', memberSince: 'Jan 2023', phoneVerified: true, emailVerified: true, bvnVerified: true, vehiclesInspected: 18 },
  { id: 'cust-004', name: 'Kemi Adeyemi', avatar: 'KA', phone: '+234 705 334 7821', email: 'kemi.a@yahoo.com', totalBookings: 2, lastActive: '08 Apr 2026', lifetimeValue: 108000, status: 'flagged', memberSince: 'Nov 2024', phoneVerified: true, emailVerified: false, bvnVerified: false, vehiclesInspected: 2 },
  { id: 'cust-005', name: 'Bola Fashola', avatar: 'BF', phone: '+234 812 990 4421', email: 'bola.f@gmail.com', totalBookings: 5, lastActive: '09 Apr 2026', lifetimeValue: 270000, status: 'active', memberSince: 'Apr 2024', phoneVerified: true, emailVerified: true, bvnVerified: true, vehiclesInspected: 5 },
  { id: 'cust-006', name: 'Ngozi Ike', avatar: 'NI', phone: '+234 705 221 8834', email: 'ngozi.ike@outlook.com', totalBookings: 4, lastActive: '10 Apr 2026', lifetimeValue: 216000, status: 'active', memberSince: 'Mar 2024', phoneVerified: true, emailVerified: true, bvnVerified: true, vehiclesInspected: 4 },
  { id: 'cust-007', name: 'Emeka Nwachukwu', avatar: 'EN', phone: '+234 803 667 9910', email: 'enwa@hotmail.com', totalBookings: 1, lastActive: '07 Apr 2026', lifetimeValue: 54000, status: 'suspended', memberSince: 'Jan 2026', phoneVerified: false, emailVerified: false, bvnVerified: false, vehiclesInspected: 1 },
  { id: 'cust-008', name: 'Yetunde Adeleke', avatar: 'YA', phone: '+234 706 881 3345', email: 'yetunde.a@gmail.com', totalBookings: 6, lastActive: '09 Apr 2026', lifetimeValue: 324000, status: 'active', memberSince: 'May 2024', phoneVerified: true, emailVerified: true, bvnVerified: true, vehiclesInspected: 6 },
  { id: 'cust-009', name: 'Olu Martins', avatar: 'OM', phone: '+234 901 112 5543', email: 'olu.martins@business.ng', totalBookings: 12, lastActive: '10 Apr 2026', lifetimeValue: 648000, status: 'active', memberSince: 'Aug 2023', phoneVerified: true, emailVerified: true, bvnVerified: true, vehiclesInspected: 12 },
  { id: 'cust-010', name: 'Amaka Okonkwo', avatar: 'AO', phone: '+234 816 443 1122', email: 'amaka.ok@gmail.com', totalBookings: 9, lastActive: '10 Apr 2026', lifetimeValue: 486000, status: 'active', memberSince: 'Dec 2023', phoneVerified: true, emailVerified: true, bvnVerified: true, vehiclesInspected: 9 },
];

export default function CustomerModule() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  if (selectedCustomer) {
    return <CustomerProfile customer={selectedCustomer} onBack={() => setSelectedCustomer(null)} />;
  }

  return <CustomerList customers={MOCK_CUSTOMERS} onSelectCustomer={setSelectedCustomer} />;
}