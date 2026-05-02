'use client';
import React, { useState } from 'react';
import ListingsTable from './ListingsTable';
import ListingDetail from './ListingDetail';
import PricingGuidanceTool from './PricingGuidanceTool';
import DealerPortal from './DealerPortal';

export interface Listing {
  id: string;
  year: number;
  make: string;
  model: string;
  plate: string;
  score: number;
  askingPrice: number;
  views: number;
  inquiries: number;
  listedBy: string;
  daysOnMarket: number;
  status: 'pending' | 'active' | 'featured' | 'sold' | 'expired';
  zone: string;
  mileage: number;
  colour: string;
  transmission: 'Automatic' | 'Manual';
  fuelType: string;
  engineSize: string;
  vin: string;
  sellerPhone: string;
  sellerEmail: string;
  finalSalePrice?: number;
  buyerName?: string;
  commissionRate: number;
}

export const MOCK_LISTINGS: Listing[] = [
  { id: 'LST-001', year: 2019, make: 'Toyota', model: 'Camry', plate: 'LSD-441-XY', score: 82, askingPrice: 5200000, views: 347, inquiries: 12, listedBy: 'Chidi Okeke', daysOnMarket: 14, status: 'active', zone: 'Lagos Island', mileage: 68000, colour: 'Pearl White', transmission: 'Automatic', fuelType: 'Petrol', engineSize: '2.5L', vin: '4T1BF1FK5KU123456', sellerPhone: '+234 803 441 9921', sellerEmail: 'chidi.o@gmail.com', commissionRate: 5 },
  { id: 'LST-002', year: 2021, make: 'Mercedes-Benz', model: 'C300', plate: 'LSD-991-XY', score: 91, askingPrice: 18500000, views: 892, inquiries: 28, listedBy: 'Amaka Eze', daysOnMarket: 7, status: 'featured', zone: 'Lekki', mileage: 22000, colour: 'Obsidian Black', transmission: 'Automatic', fuelType: 'Petrol', engineSize: '2.0L Turbo', vin: 'WDDWF4HB5MR123789', sellerPhone: '+234 705 334 8821', sellerEmail: 'amaka.e@gmail.com', commissionRate: 5 },
  { id: 'LST-003', year: 2018, make: 'Honda', model: 'CR-V', plate: 'ABJ-556-EF', score: 74, askingPrice: 7800000, views: 215, inquiries: 8, listedBy: 'Emeka Nwosu', daysOnMarket: 21, status: 'pending', zone: 'Abuja', mileage: 95000, colour: 'Lunar Silver', transmission: 'Automatic', fuelType: 'Petrol', engineSize: '1.5L Turbo', vin: '2HKRW2H83JH123456', sellerPhone: '+234 901 667 4432', sellerEmail: 'emeka.n@gmail.com', commissionRate: 5 },
  { id: 'LST-004', year: 2016, make: 'Toyota', model: 'Highlander', plate: 'LSD-334-MN', score: 55, askingPrice: 9500000, views: 134, inquiries: 3, listedBy: 'Bola Adeyemi', daysOnMarket: 45, status: 'active', zone: 'Lagos Mainland', mileage: 148000, colour: 'Midnight Blue', transmission: 'Automatic', fuelType: 'Petrol', engineSize: '3.5L V6', vin: '5TDJZRFH0GS123456', sellerPhone: '+234 812 220 5543', sellerEmail: 'bola.a@gmail.com', commissionRate: 5 },
  { id: 'LST-005', year: 2020, make: 'Ford', model: 'Escape', plate: 'PHC-882-AA', score: 78, askingPrice: 6400000, views: 189, inquiries: 6, listedBy: 'Ngozi Ike', daysOnMarket: 9, status: 'active', zone: 'Port Harcourt', mileage: 54000, colour: 'Race Red', transmission: 'Automatic', fuelType: 'Petrol', engineSize: '1.5L EcoBoost', vin: '1FMCU9GD5LUA12345', sellerPhone: '+234 706 881 2234', sellerEmail: 'ngozi.i@gmail.com', commissionRate: 5 },
  { id: 'LST-006', year: 2017, make: 'Lexus', model: 'RX350', plate: 'LND-441-PQ', score: 88, askingPrice: 14200000, views: 621, inquiries: 19, listedBy: 'Tunde Babs', daysOnMarket: 3, status: 'featured', zone: 'VI', mileage: 78000, colour: 'Atomic Silver', transmission: 'Automatic', fuelType: 'Petrol', engineSize: '3.5L V6', vin: '2T2BZMCA5HC123456', sellerPhone: '+234 803 554 7761', sellerEmail: 'tunde.b@gmail.com', commissionRate: 5 },
  { id: 'LST-007', year: 2015, make: 'Nissan', model: 'Pathfinder', plate: 'IBD-223-BC', score: 62, askingPrice: 5800000, views: 98, inquiries: 2, listedBy: 'Fatima Sule', daysOnMarket: 60, status: 'expired', zone: 'Ibadan', mileage: 162000, colour: 'Gun Metallic', transmission: 'Automatic', fuelType: 'Petrol', engineSize: '3.5L V6', vin: '5N1AR2MM5FC123456', sellerPhone: '+234 812 443 6621', sellerEmail: 'fatima.s@gmail.com', commissionRate: 5 },
  { id: 'LST-008', year: 2022, make: 'Hyundai', model: 'Tucson', plate: 'KAN-112-GH', score: 95, askingPrice: 11800000, views: 445, inquiries: 15, listedBy: 'Ibrahim Garba', daysOnMarket: 5, status: 'sold', zone: 'Kano', mileage: 18000, colour: 'Phantom Black', transmission: 'Automatic', fuelType: 'Petrol', engineSize: '2.5L', vin: '5NMJE3AE5NH123456', sellerPhone: '+234 705 221 9934', sellerEmail: 'ibrahim.g@gmail.com', commissionRate: 5, finalSalePrice: 11500000, buyerName: 'Adaeze Mbah' },
];

type ActiveView = 'table' | 'detail' | 'pricing' | 'dealer';

export default function VehicleListingsModule() {
  const [activeView, setActiveView] = useState<ActiveView>('table');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const handleViewDetail = (listing: Listing) => {
    setSelectedListing(listing);
    setActiveView('detail');
  };

  const handleBack = () => {
    setActiveView('table');
    setSelectedListing(null);
  };

  if (activeView === 'detail' && selectedListing) {
    return <ListingDetail listing={selectedListing} onBack={handleBack} />;
  }

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveView('table')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeView === 'table' ? 'bg-[#ff5722] text-white' : 'border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F4F6F8]'}`}
        >
          All Listings
        </button>
        <button
          onClick={() => setActiveView('pricing')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeView === 'pricing' ? 'bg-[#ff5722] text-white' : 'border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F4F6F8]'}`}
        >
          Pricing Guidance
        </button>
        <button
          onClick={() => setActiveView('dealer')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeView === 'dealer' ? 'bg-[#ff5722] text-white' : 'border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F4F6F8]'}`}
        >
          Dealer Portal
        </button>
      </div>
      {activeView === 'pricing' ? (
        <PricingGuidanceTool onBack={handleBack} />
      ) : activeView === 'dealer' ? (
        <DealerPortal onBack={handleBack} listings={MOCK_LISTINGS} />
      ) : (
        <ListingsTable listings={MOCK_LISTINGS} onViewDetail={handleViewDetail} onOpenPricing={() => setActiveView('pricing')} />
      )}
    </div>
  );
}
