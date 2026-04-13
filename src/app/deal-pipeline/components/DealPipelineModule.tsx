'use client';
import React, { useState } from 'react';
import DealKanban from './DealKanban';
import DealDetail from './DealDetail';

export interface Deal {
  id: string;
  vehicle: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  score: number;
  listedPrice: number;
  offerPrice: number;
  agreedPrice?: number;
  buyerName: string;
  buyerAvatar: string;
  buyerPhone: string;
  buyerEmail: string;
  sellerName: string;
  sellerAvatar: string;
  sellerPhone: string;
  sellerEmail: string;
  agentName: string;
  agentAvatar: string;
  stage: 'interest' | 'offer' | 'negotiating' | 'payment' | 'handover' | 'completed';
  minutesInStage: number;
  slaMins: number;
  createdAt: string;
  escrowRef?: string;
  handoverDate?: string;
  handoverLocation?: string;
  commissionRate: number;
}

export const MOCK_DEALS: Deal[] = [
  {
    id: 'DL-001', vehicle: '2019 Toyota Camry', make: 'Toyota', model: 'Camry', year: 2019, plate: 'LSD-441-XY', score: 82,
    listedPrice: 5200000, offerPrice: 4800000, agreedPrice: 5000000,
    buyerName: 'Adaeze Mbah', buyerAvatar: 'AM', buyerPhone: '+234 803 441 9921', buyerEmail: 'adaeze.m@gmail.com',
    sellerName: 'Chidi Okeke', sellerAvatar: 'CO', sellerPhone: '+234 705 334 8821', sellerEmail: 'chidi.o@gmail.com',
    agentName: 'Emeka Okonkwo', agentAvatar: 'EO',
    stage: 'payment', minutesInStage: 45, slaMins: 120, createdAt: '08 Apr 2026',
    escrowRef: 'ESC-2026-0441', commissionRate: 5,
  },
  {
    id: 'DL-002', vehicle: '2021 Mercedes-Benz C300', make: 'Mercedes-Benz', model: 'C300', year: 2021, plate: 'LSD-991-XY', score: 91,
    listedPrice: 18500000, offerPrice: 17000000,
    buyerName: 'Tunde Babs', buyerAvatar: 'TB', buyerPhone: '+234 812 220 5543', buyerEmail: 'tunde.b@gmail.com',
    sellerName: 'Amaka Eze', sellerAvatar: 'AE', sellerPhone: '+234 901 667 4432', sellerEmail: 'amaka.e@gmail.com',
    agentName: 'Adaora Nwosu', agentAvatar: 'AN',
    stage: 'negotiating', minutesInStage: 200, slaMins: 180, createdAt: '09 Apr 2026', commissionRate: 5,
  },
  {
    id: 'DL-003', vehicle: '2018 Honda CR-V', make: 'Honda', model: 'CR-V', year: 2018, plate: 'ABJ-556-EF', score: 74,
    listedPrice: 7800000, offerPrice: 7500000, agreedPrice: 7600000,
    buyerName: 'Ngozi Ike', buyerAvatar: 'NI', buyerPhone: '+234 706 881 2234', buyerEmail: 'ngozi.i@gmail.com',
    sellerName: 'Emeka Nwosu', sellerAvatar: 'EN', sellerPhone: '+234 803 554 7761', sellerEmail: 'emeka.n@gmail.com',
    agentName: 'Chukwudi Eze', agentAvatar: 'CE',
    stage: 'handover', minutesInStage: 30, slaMins: 240, createdAt: '07 Apr 2026',
    escrowRef: 'ESC-2026-0438', handoverDate: '12 Apr 2026, 10:00', handoverLocation: 'Carschek Hub, Lekki Phase 1', commissionRate: 5,
  },
  {
    id: 'DL-004', vehicle: '2022 Hyundai Tucson', make: 'Hyundai', model: 'Tucson', year: 2022, plate: 'KAN-112-GH', score: 95,
    listedPrice: 11800000, offerPrice: 11800000, agreedPrice: 11500000,
    buyerName: 'Ibrahim Garba', buyerAvatar: 'IG', buyerPhone: '+234 705 221 9934', buyerEmail: 'ibrahim.g@gmail.com',
    sellerName: 'Fatima Sule', sellerAvatar: 'FS', sellerPhone: '+234 812 443 6621', sellerEmail: 'fatima.s@gmail.com',
    agentName: 'Ngozi Okafor', agentAvatar: 'NO',
    stage: 'completed', minutesInStage: 0, slaMins: 60, createdAt: '05 Apr 2026',
    escrowRef: 'ESC-2026-0430', commissionRate: 5,
  },
  {
    id: 'DL-005', vehicle: '2017 Lexus RX350', make: 'Lexus', model: 'RX350', year: 2017, plate: 'LND-441-PQ', score: 88,
    listedPrice: 14200000, offerPrice: 13000000,
    buyerName: 'Bola Adeyemi', buyerAvatar: 'BA', buyerPhone: '+234 803 441 7761', buyerEmail: 'bola.a@gmail.com',
    sellerName: 'Tunde Babs', sellerAvatar: 'TB', sellerPhone: '+234 705 334 8821', sellerEmail: 'tunde.b@gmail.com',
    agentName: 'Ibrahim Musa', agentAvatar: 'IM',
    stage: 'offer', minutesInStage: 80, slaMins: 120, createdAt: '10 Apr 2026', commissionRate: 5,
  },
  {
    id: 'DL-006', vehicle: '2020 Ford Escape', make: 'Ford', model: 'Escape', year: 2020, plate: 'PHC-882-AA', score: 78,
    listedPrice: 6400000, offerPrice: 6400000,
    buyerName: 'Seun Adeyemi', buyerAvatar: 'SA', buyerPhone: '+234 812 220 1234', buyerEmail: 'seun.a@gmail.com',
    sellerName: 'Ngozi Ike', sellerAvatar: 'NI', sellerPhone: '+234 706 881 2234', sellerEmail: 'ngozi.i@gmail.com',
    agentName: 'Taiwo Ogundimu', agentAvatar: 'TO',
    stage: 'interest', minutesInStage: 15, slaMins: 60, createdAt: '10 Apr 2026', commissionRate: 5,
  },
];

export default function DealPipelineModule() {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  if (selectedDeal) {
    return <DealDetail deal={selectedDeal} onBack={() => setSelectedDeal(null)} />;
  }

  return <DealKanban deals={MOCK_DEALS} onViewDeal={setSelectedDeal} />;
}
