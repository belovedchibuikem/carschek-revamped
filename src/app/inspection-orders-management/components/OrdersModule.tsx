'use client';
import React, { useState } from 'react';
import OrdersListView from './OrdersListView';
import OrdersKanban from './OrdersKanban';
import OrderDetailPanel from './OrderDetailPanel';

export type OrderStatus = 'new' | 'assigned' | 'in-progress' | 'reported' | 'qa-review' | 'closed' | 'cancelled';

export interface Order {
  id: string;
  customer: { name: string; phone: string; email: string; avatar: string };
  vehicle: { make: string; model: string; year: number; plate: string; color: string; vin: string };
  zone: string;
  scheduledAt: string;
  inspector: string | null;
  inspectorAvatar: string | null;
  status: OrderStatus;
  score: number | null;
  createdAt: string;
}

export const MOCK_ORDERS: Order[] = [
  { id: 'ORD-1892', customer: { name: 'Adaeze Mbah', phone: '+234 803 441 2291', email: 'adaeze.mbah@gmail.com', avatar: 'AM' }, vehicle: { make: 'Toyota', model: 'Camry', year: 2019, plate: 'LSD-421-KJ', color: 'Silver', vin: 'JT2BF22K1W0123456' }, zone: 'Lekki Phase 1', scheduledAt: '10 Apr 2026, 10:00', inspector: 'Emeka Okonkwo', inspectorAvatar: 'EO', status: 'in-progress', score: null, createdAt: '09 Apr 2026' },
  { id: 'ORD-1891', customer: { name: 'Tunde Babatunde', phone: '+234 812 334 5567', email: 'tunde.b@yahoo.com', avatar: 'TB' }, vehicle: { make: 'Honda', model: 'Accord', year: 2018, plate: 'ABJ-114-CD', color: 'Black', vin: '1HGCM82633A123456' }, zone: 'Abuja Wuse', scheduledAt: '10 Apr 2026, 11:30', inspector: 'Fatima Bello', inspectorAvatar: 'FB', status: 'assigned', score: null, createdAt: '09 Apr 2026' },
  { id: 'ORD-1890', customer: { name: 'Ngozi Ike', phone: '+234 705 221 8834', email: 'ngozi.ike@outlook.com', avatar: 'NI' }, vehicle: { make: 'Ford', model: 'Escape', year: 2020, plate: 'PHC-882-AA', color: 'White', vin: '1FMCU9GD0LUA12345' }, zone: 'Port Harcourt GRA', scheduledAt: '10 Apr 2026, 09:00', inspector: 'Ngozi Okafor', inspectorAvatar: 'NO', status: 'reported', score: 74, createdAt: '08 Apr 2026' },
  { id: 'ORD-1889', customer: { name: 'Chidi Obi', phone: '+234 901 557 2213', email: 'chidi.obi@cardealer.ng', avatar: 'CO' }, vehicle: { make: 'Lexus', model: 'RX350', year: 2017, plate: 'LND-772-GH', color: 'Champagne', vin: '2T2BZMCA7HC012345' }, zone: 'Victoria Island', scheduledAt: '10 Apr 2026, 14:00', inspector: null, inspectorAvatar: null, status: 'new', score: null, createdAt: '10 Apr 2026' },
  { id: 'ORD-1888', customer: { name: 'Amaka Okonkwo', phone: '+234 816 443 1122', email: 'amaka.ok@gmail.com', avatar: 'AO' }, vehicle: { make: 'Mercedes-Benz', model: 'C300', year: 2021, plate: 'LSD-991-XY', color: 'Navy', vin: 'WDD2050432R012345' }, zone: 'Ikoyi', scheduledAt: '10 Apr 2026, 15:30', inspector: 'Adaora Nwosu', inspectorAvatar: 'AN', status: 'qa-review', score: 88, createdAt: '08 Apr 2026' },
  { id: 'ORD-1887', customer: { name: 'Emeka Nwachukwu', phone: '+234 803 667 9910', email: 'enwa@hotmail.com', avatar: 'EN' }, vehicle: { make: 'Hyundai', model: 'Tucson', year: 2022, plate: 'ABJ-556-EF', color: 'Red', vin: 'KM8J3CA41MU012345' }, zone: 'Abuja Garki', scheduledAt: '09 Apr 2026, 16:00', inspector: 'Ibrahim Musa', inspectorAvatar: 'IM', status: 'closed', score: 81, createdAt: '07 Apr 2026' },
  { id: 'ORD-1886', customer: { name: 'Yetunde Adeleke', phone: '+234 706 881 3345', email: 'yetunde.a@gmail.com', avatar: 'YA' }, vehicle: { make: 'Kia', model: 'Sorento', year: 2019, plate: 'IBD-223-BC', color: 'Grey', vin: '5XYPGDA52KG012345' }, zone: 'Ibadan Bodija', scheduledAt: '09 Apr 2026, 10:00', inspector: 'Olumide Adeyemi', inspectorAvatar: 'OA', status: 'closed', score: 69, createdAt: '07 Apr 2026' },
  { id: 'ORD-1885', customer: { name: 'Bola Fashola', phone: '+234 812 990 4421', email: 'bola.f@gmail.com', avatar: 'BF' }, vehicle: { make: 'Toyota', model: 'Highlander', year: 2016, plate: 'LSD-334-MN', color: 'Black', vin: '5TDDKRFH0GS012345' }, zone: 'Lagos Island', scheduledAt: '09 Apr 2026, 09:30', inspector: 'Emeka Okonkwo', inspectorAvatar: 'EO', status: 'closed', score: 55, createdAt: '07 Apr 2026' },
  { id: 'ORD-1884', customer: { name: 'Kemi Adeyemi', phone: '+234 705 334 7821', email: 'kemi.a@yahoo.com', avatar: 'KA' }, vehicle: { make: 'Nissan', model: 'Pathfinder', year: 2018, plate: 'LND-441-PQ', color: 'White', vin: '5N1AR2MM4JC012345' }, zone: 'Victoria Island', scheduledAt: '11 Apr 2026, 11:00', inspector: null, inspectorAvatar: null, status: 'new', score: null, createdAt: '10 Apr 2026' },
  { id: 'ORD-1883', customer: { name: 'Olu Martins', phone: '+234 901 112 5543', email: 'olu.martins@business.ng', avatar: 'OM' }, vehicle: { make: 'BMW', model: 'X5', year: 2020, plate: 'LSD-887-ST', color: 'White', vin: '5UXCR6C59KLL12345' }, zone: 'Lekki Phase 2', scheduledAt: '11 Apr 2026, 09:00', inspector: 'Chukwudi Eze', inspectorAvatar: 'CE', status: 'assigned', score: null, createdAt: '10 Apr 2026' },
];

export default function OrdersModule() {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[#1F2937]">Inspection Orders</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">{MOCK_ORDERS.length} total orders · 9 active today</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-[#F4F6F8] p-1 rounded-lg border border-[#E5E7EB]">
            {(['list', 'kanban'] as const).map(mode => (
              <button
                key={`view-${mode}`}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all ${viewMode === mode ? 'bg-white text-[#1E3A5F] shadow-sm' : 'text-[#6B7280] hover:text-[#1F2937]'}`}
              >
                {mode === 'list' ? 'List View' : 'Pipeline View'}
              </button>
            ))}
          </div>
          <button className="px-4 py-2 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg hover:bg-[#16304F] transition-all active:scale-[0.98]">
            + New Order
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <OrdersListView orders={MOCK_ORDERS} onSelectOrder={setSelectedOrder} />
      ) : (
        <OrdersKanban orders={MOCK_ORDERS} onSelectOrder={setSelectedOrder} />
      )}

      {selectedOrder && (
        <OrderDetailPanel order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}