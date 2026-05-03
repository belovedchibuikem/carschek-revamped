// CARSCHEK Mock Data — mirrors real API contract

export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT (Abuja)', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

export const BRANDS = [
  { id: 'b1', name: 'Toyota', country: 'Japan', flag: '🇯🇵', models: 12, cars: 34, active: true, logo: 'T' },
  { id: 'b2', name: 'Honda', country: 'Japan', flag: '🇯🇵', models: 8, cars: 21, active: true, logo: 'H' },
  { id: 'b3', name: 'Mercedes-Benz', country: 'Germany', flag: '🇩🇪', models: 10, cars: 15, active: true, logo: 'MB' },
  { id: 'b4', name: 'BMW', country: 'Germany', flag: '🇩🇪', models: 9, cars: 12, active: true, logo: 'BMW' },
  { id: 'b5', name: 'Lexus', country: 'Japan', flag: '🇯🇵', models: 6, cars: 18, active: true, logo: 'L' },
  { id: 'b6', name: 'Ford', country: 'USA', flag: '🇺🇸', models: 7, cars: 9, active: true, logo: 'F' },
  { id: 'b7', name: 'Hyundai', country: 'South Korea', flag: '🇰🇷', models: 8, cars: 11, active: true, logo: 'HY' },
  { id: 'b8', name: 'Kia', country: 'South Korea', flag: '🇰🇷', models: 7, cars: 8, active: true, logo: 'K' },
  { id: 'b9', name: 'Nissan', country: 'Japan', flag: '🇯🇵', models: 8, cars: 14, active: true, logo: 'N' },
  { id: 'b10', name: 'Volkswagen', country: 'Germany', flag: '🇩🇪', models: 6, cars: 7, active: true, logo: 'VW' },
  { id: 'b11', name: 'Peugeot', country: 'France', flag: '🇫🇷', models: 5, cars: 6, active: true, logo: 'P' },
  { id: 'b12', name: 'Mitsubishi', country: 'Japan', flag: '🇯🇵', models: 5, cars: 8, active: false, logo: 'M' },
];

export const MODELS = [
  { id: 'm1', brandId: 'b1', brandName: 'Toyota', name: 'Camry', bodyTypes: ['Sedan'], cars: 12, active: true },
  { id: 'm2', brandId: 'b1', brandName: 'Toyota', name: 'Corolla', bodyTypes: ['Sedan', 'Hatchback'], cars: 8, active: true },
  { id: 'm3', brandId: 'b1', brandName: 'Toyota', name: 'RAV4', bodyTypes: ['SUV'], cars: 6, active: true },
  { id: 'm4', brandId: 'b1', brandName: 'Toyota', name: 'Highlander', bodyTypes: ['SUV'], cars: 4, active: true },
  { id: 'm5', brandId: 'b1', brandName: 'Toyota', name: 'Land Cruiser', bodyTypes: ['SUV'], cars: 4, active: true },
  { id: 'm6', brandId: 'b2', brandName: 'Honda', name: 'Accord', bodyTypes: ['Sedan'], cars: 9, active: true },
  { id: 'm7', brandId: 'b2', brandName: 'Honda', name: 'Civic', bodyTypes: ['Sedan', 'Hatchback'], cars: 7, active: true },
  { id: 'm8', brandId: 'b2', brandName: 'Honda', name: 'CR-V', bodyTypes: ['SUV'], cars: 5, active: true },
  { id: 'm9', brandId: 'b3', brandName: 'Mercedes-Benz', name: 'C-Class', bodyTypes: ['Sedan'], cars: 5, active: true },
  { id: 'm10', brandId: 'b3', brandName: 'Mercedes-Benz', name: 'E-Class', bodyTypes: ['Sedan'], cars: 4, active: true },
  { id: 'm11', brandId: 'b4', brandName: 'BMW', name: '3 Series', bodyTypes: ['Sedan'], cars: 4, active: true },
  { id: 'm12', brandId: 'b4', brandName: 'BMW', name: '5 Series', bodyTypes: ['Sedan'], cars: 3, active: true },
  { id: 'm13', brandId: 'b5', brandName: 'Lexus', name: 'RX', bodyTypes: ['SUV'], cars: 6, active: true },
  { id: 'm14', brandId: 'b5', brandName: 'Lexus', name: 'ES', bodyTypes: ['Sedan'], cars: 5, active: true },
  { id: 'm15', brandId: 'b7', brandName: 'Hyundai', name: 'Elantra', bodyTypes: ['Sedan'], cars: 4, active: true },
  { id: 'm16', brandId: 'b7', brandName: 'Hyundai', name: 'Tucson', bodyTypes: ['SUV'], cars: 3, active: true },
];

export const YEARS = Array.from({ length: 36 }, (_, i) => ({
  id: `y${i}`,
  year: 2025 - i,
  active: true,
  /** Deterministic mock count — avoid Math.random() at module scope (SSR/client hydration mismatch). */
  cars: (i * 7 + 3) % 19,
}));

export const CARS = [
  { id: 'CK-41', brand: 'Toyota', model: 'Camry', year: 2011, plate: 'LND-234-KJ', status: 'Listed', score: 72, purchasePrice: 5000000, salePrice: 5100000, mileage: 145000, colour: 'Silver', vin: 'JTDBE32K413012345', city: 'Lagos', state: 'Lagos', channel: 'Auction', createdAt: '2026-01-15', docs: 6, hasDuplicate: true, warnings: 2 },
  { id: 'CK-42', brand: 'Honda', model: 'Accord', year: 2015, plate: 'ABJ-567-FC', status: 'Acquired', score: 85, purchasePrice: 7500000, salePrice: null, mileage: 89000, colour: 'Black', vin: 'JHMCM56557C012345', city: 'Abuja', state: 'FCT (Abuja)', channel: 'Market Place', createdAt: '2026-02-01', docs: 4, hasDuplicate: false, warnings: 1 },
  { id: 'CK-43', brand: 'Lexus', model: 'RX', year: 2018, plate: 'PH-890-RS', status: 'At Buyer', score: 91, purchasePrice: 18000000, salePrice: 19500000, mileage: 62000, colour: 'White', vin: '2T2BZMCA5JC012345', city: 'Port Harcourt', state: 'Rivers', channel: 'B2B', createdAt: '2026-02-10', docs: 8, hasDuplicate: false, warnings: 0 },
  { id: 'CK-44', brand: 'Mercedes-Benz', model: 'C-Class', year: 2019, plate: 'KN-123-KN', status: 'Sold', score: 88, purchasePrice: 22000000, salePrice: 24000000, mileage: 45000, colour: 'Navy Blue', vin: 'WDDWF4KB0KR012345', city: 'Kano', state: 'Kano', channel: 'Offline', createdAt: '2026-01-20', docs: 7, hasDuplicate: false, warnings: 0 },
  { id: 'CK-45', brand: 'Toyota', model: 'Highlander', year: 2016, plate: 'IB-456-OY', status: 'Inspection Linked', score: 67, purchasePrice: 12000000, salePrice: null, mileage: 112000, colour: 'Red', vin: '5TDBK3EH8GS012345', city: 'Ibadan', state: 'Oyo', channel: 'Auction', createdAt: '2026-03-01', docs: 3, hasDuplicate: false, warnings: 3 },
  { id: 'CK-46', brand: 'BMW', model: '3 Series', year: 2017, plate: 'LND-789-KJ', status: 'Listed', score: 79, purchasePrice: 16000000, salePrice: null, mileage: 78000, colour: 'Grey', vin: 'WBA8E9G50HNU12345', city: 'Lagos', state: 'Lagos', channel: 'Market Place', createdAt: '2026-03-05', docs: 5, hasDuplicate: false, warnings: 1 },
  { id: 'CK-47', brand: 'Honda', model: 'CR-V', year: 2020, plate: 'ABJ-321-FC', status: 'Acquired', score: 94, purchasePrice: 14000000, salePrice: null, mileage: 38000, colour: 'Pearl White', vin: '7FARW2H54LE012345', city: 'Abuja', state: 'FCT (Abuja)', channel: 'B2B', createdAt: '2026-03-12', docs: 6, hasDuplicate: false, warnings: 0 },
  { id: 'CK-48', brand: 'Hyundai', model: 'Elantra', year: 2014, plate: 'EN-654-EN', status: 'Sold', score: 61, purchasePrice: 4500000, salePrice: 4800000, mileage: 167000, colour: 'Blue', vin: '5NPD84LF5EH012345', city: 'Enugu', state: 'Enugu', channel: 'Offline', createdAt: '2026-01-08', docs: 5, hasDuplicate: true, warnings: 2 },
  { id: 'CK-49', brand: 'Toyota', model: 'Corolla', year: 2012, plate: 'LAG-112-AB', status: 'Acquired', score: 70, purchasePrice: 3800000, salePrice: null, mileage: 120000, colour: 'Silver', vin: '2T1BURHE0JC999999', city: 'Lagos', state: 'Lagos', channel: 'Auction', createdAt: '2026-04-14', docs: 0, hasDuplicate: false, warnings: 0 },
];

export const INSPECTORS = [
  { id: 'INS-001', name: 'Emeka Okonkwo', email: 'emeka.inspector@carschek.com', phone: '+2348012345678', zone: ['Lagos Island', 'Lagos Mainland'], status: 'online', rating: 4.8, jobsToday: 3, jobsCompleted: 2, totalJobs: 142, avgScore: 81, certBadge: 'Senior', avatar: 'EO' },
  { id: 'INS-002', name: 'Chidinma Eze', email: 'chidinma@carschek.com', phone: '+2348023456789', zone: ['Abuja Central', 'Abuja Outskirts'], status: 'online', rating: 4.9, jobsToday: 2, jobsCompleted: 2, totalJobs: 98, avgScore: 85, certBadge: 'Senior', avatar: 'CE' },
  { id: 'INS-003', name: 'Babatunde Adeyemi', email: 'babs@carschek.com', phone: '+2348034567890', zone: ['Lagos Island'], status: 'offline', rating: 4.5, jobsToday: 1, jobsCompleted: 0, totalJobs: 67, avgScore: 77, certBadge: 'Standard', avatar: 'BA' },
  { id: 'INS-004', name: 'Ngozi Obi', email: 'ngozi@carschek.com', phone: '+2348045678901', zone: ['Port Harcourt'], status: 'online', rating: 4.7, jobsToday: 4, jobsCompleted: 3, totalJobs: 115, avgScore: 82, certBadge: 'Senior', avatar: 'NO' },
  { id: 'INS-005', name: 'Seun Afolabi', email: 'seun@carschek.com', phone: '+2348056789012', zone: ['Ibadan', 'Ogun'], status: 'en-route', rating: 4.6, jobsToday: 2, jobsCompleted: 1, totalJobs: 89, avgScore: 79, certBadge: 'Standard', avatar: 'SA' },
];

export const ORDERS = [
  { id: 'ORD-1892', customerId: 'CUS-001', customerName: 'Adaeze Madu', customerPhone: '+2348012345678', vehicle: 'Toyota Camry 2015', plate: 'LND-234-KJ', inspectorId: 'INS-001', inspectorName: 'Emeka Okonkwo', status: 'QA Review', zone: 'Lagos Island', scheduledAt: '2026-04-13T10:00:00', createdAt: '2026-04-12T14:30:00', notes: 'Customer wants thorough engine check', reportId: 'RPT-445' },
  { id: 'ORD-1893', customerId: 'CUS-002', customerName: 'Chukwuemeka Nwosu', customerPhone: '+2348023456789', vehicle: 'Honda Accord 2018', plate: 'ABJ-567-FC', inspectorId: 'INS-002', inspectorName: 'Chidinma Eze', status: 'In Progress', zone: 'Abuja Central', scheduledAt: '2026-04-13T11:30:00', createdAt: '2026-04-13T09:00:00', notes: '', reportId: null },
  { id: 'ORD-1894', customerId: 'CUS-003', customerName: 'Funmilayo Okafor', customerPhone: '+2348034567890', vehicle: 'Lexus RX 2019', plate: 'PH-890-RS', inspectorId: null, inspectorName: null, status: 'New', zone: 'Port Harcourt', scheduledAt: '2026-04-14T09:00:00', createdAt: '2026-04-13T11:00:00', notes: 'Urgent — buyer flying in from London', reportId: null },
  { id: 'ORD-1895', customerId: 'CUS-004', customerName: 'Ibrahim Musa', customerPhone: '+2348045678901', vehicle: 'BMW 3 Series 2017', plate: 'KN-123-KN', inspectorId: 'INS-003', inspectorName: 'Babatunde Adeyemi', status: 'Assigned', zone: 'Lagos Island', scheduledAt: '2026-04-13T14:00:00', createdAt: '2026-04-13T08:00:00', notes: '', reportId: null },
  { id: 'ORD-1896', customerId: 'CUS-005', customerName: 'Blessing Eze', customerPhone: '+2348056789012', vehicle: 'Toyota Highlander 2016', plate: 'IB-456-OY', inspectorId: 'INS-005', inspectorName: 'Seun Afolabi', status: 'Reported', zone: 'Ibadan', scheduledAt: '2026-04-12T10:00:00', createdAt: '2026-04-11T16:00:00', notes: '', reportId: 'RPT-446' },
  { id: 'ORD-1897', customerId: 'CUS-001', customerName: 'Adaeze Madu', customerPhone: '+2348012345678', vehicle: 'Mercedes C-Class 2020', plate: 'LND-789-KJ', inspectorId: 'INS-001', inspectorName: 'Emeka Okonkwo', status: 'Closed', zone: 'Lagos Island', scheduledAt: '2026-04-10T10:00:00', createdAt: '2026-04-09T14:00:00', notes: '', reportId: 'RPT-440' },
];

export const CUSTOMERS = [
  { id: 'CUS-001', name: 'Adaeze Madu', email: 'adaeze@gmail.com', phone: '+2348012345678', type: 'Individual', city: 'Lagos', state: 'Lagos', orders: 3, status: 'Active', createdAt: '2025-11-01', avatar: 'AM' },
  { id: 'CUS-002', name: 'Chukwuemeka Nwosu', email: 'emeka.nwosu@company.ng', phone: '+2348023456789', type: 'Corporate', city: 'Abuja', state: 'FCT (Abuja)', orders: 1, status: 'Active', createdAt: '2026-01-15', avatar: 'CN' },
  { id: 'CUS-003', name: 'Funmilayo Okafor', email: 'funmi@yahoo.com', phone: '+2348034567890', type: 'Individual', city: 'Port Harcourt', state: 'Rivers', orders: 2, status: 'Active', createdAt: '2025-12-20', avatar: 'FO' },
  { id: 'CUS-004', name: 'Ibrahim Musa', email: 'ibrahim.musa@dealer.ng', phone: '+2348045678901', type: 'Dealer', city: 'Kano', state: 'Kano', orders: 5, status: 'Active', createdAt: '2025-09-10', avatar: 'IM' },
  { id: 'CUS-005', name: 'Blessing Eze', email: 'blessing@gmail.com', phone: '+2348056789012', type: 'Individual', city: 'Ibadan', state: 'Oyo', orders: 1, status: 'Active', createdAt: '2026-02-28', avatar: 'BE' },
  { id: 'CUS-006', name: 'Tunde Fashola', email: 'tunde.f@corp.ng', phone: '+2348067890123', type: 'Corporate', city: 'Lagos', state: 'Lagos', orders: 8, status: 'VIP', createdAt: '2025-06-01', avatar: 'TF' },
];

export const CRM_CONTACTS = [
  { id: 'CRM-001', name: 'Adaeze Madu', email: 'adaeze@gmail.com', phone: '+2348012345678', type: 'Individual', stage: 'Active', assignedTo: 'Promise Ndem', lastContact: '2026-04-10', value: 5100000, avatar: 'AM' },
  { id: 'CRM-002', name: 'Tunde Fashola', email: 'tunde.f@corp.ng', phone: '+2348067890123', type: 'Corporate', stage: 'Hot Lead', assignedTo: 'Chukwuemeka Obi', lastContact: '2026-04-12', value: 24000000, avatar: 'TF' },
  { id: 'CRM-003', name: 'Ngozi Chukwu', email: 'ngozi.c@gmail.com', phone: '+2348078901234', type: 'Individual', stage: 'Lead', assignedTo: 'Promise Ndem', lastContact: '2026-04-08', value: 0, avatar: 'NC' },
  { id: 'CRM-004', name: 'AutoDeals Nigeria', email: 'info@autodeals.ng', phone: '+2348089012345', type: 'Dealer', stage: 'Negotiation', assignedTo: 'Chukwuemeka Obi', lastContact: '2026-04-11', value: 45000000, avatar: 'AD' },
  { id: 'CRM-005', name: 'Emeka Obi', email: 'emeka.obi@gmail.com', phone: '+2348090123456', type: 'Individual', stage: 'Closed Won', assignedTo: 'Promise Ndem', lastContact: '2026-03-28', value: 7500000, avatar: 'EO' },
  { id: 'CRM-006', name: 'Kemi Adeyemi', email: 'kemi@yahoo.com', phone: '+2348001234567', type: 'Individual', stage: 'Cold', assignedTo: 'Chukwuemeka Obi', lastContact: '2026-02-15', value: 0, avatar: 'KA' },
];

export const OFFERS = [
  { id: 'OFR-001', carId: 'CK-41', carName: 'Toyota Camry 2011', contactId: 'CRM-001', contactName: 'Adaeze Madu', offerPrice: 5000000, status: 'Sent', validUntil: '2026-04-20', createdAt: '2026-04-13', sentVia: ['Email', 'SMS'] },
  { id: 'OFR-002', carId: 'CK-43', carName: 'Lexus RX 2018', contactId: 'CRM-002', contactName: 'Tunde Fashola', offerPrice: 19000000, status: 'Accepted', validUntil: '2026-04-15', createdAt: '2026-04-10', sentVia: ['Email'] },
  { id: 'OFR-003', carId: 'CK-46', carName: 'BMW 3 Series 2017', contactId: 'CRM-004', contactName: 'AutoDeals Nigeria', offerPrice: 15500000, status: 'Negotiating', validUntil: '2026-04-18', createdAt: '2026-04-11', sentVia: ['Email', 'SMS'] },
  { id: 'OFR-004', carId: 'CK-42', carName: 'Honda Accord 2015', contactId: 'CRM-003', contactName: 'Ngozi Chukwu', offerPrice: 7200000, status: 'Draft', validUntil: '2026-04-25', createdAt: '2026-04-13', sentVia: [] },
  { id: 'OFR-005', carId: 'CK-48', carName: 'Hyundai Elantra 2014', contactId: 'CRM-006', contactName: 'Kemi Adeyemi', offerPrice: 4600000, status: 'Rejected', validUntil: '2026-04-05', createdAt: '2026-04-01', sentVia: ['SMS'] },
];

export const AUCTIONS = [
  { id: 'AUC-001', carId: 'CK-41', carName: 'Toyota Camry 2011', startingBid: 4500000, currentBid: 4950000, bidCount: 7, reservePrice: 5000000, reserveMet: false, startedAt: '2026-04-10T09:00:00', endsAt: '2026-04-15T18:00:00', status: 'Active', platformFee: 5 },
  { id: 'AUC-002', carId: 'CK-44', carName: 'Mercedes C-Class 2019', startingBid: 20000000, currentBid: 23500000, bidCount: 12, reservePrice: 22000000, reserveMet: true, startedAt: '2026-04-05T09:00:00', endsAt: '2026-04-12T18:00:00', status: 'Ended-Sale', platformFee: 5 },
  { id: 'AUC-003', carId: 'CK-45', carName: 'Toyota Highlander 2016', startingBid: 10000000, currentBid: 10000000, bidCount: 0, reservePrice: 12000000, reserveMet: false, startedAt: '2026-04-13T09:00:00', endsAt: '2026-04-20T18:00:00', status: 'Active', platformFee: 10 },
];

export const REPORTS = [
  { id: 'RPT-445', orderId: 'ORD-1892', carId: 'CK-41', carName: 'Toyota Camry 2015', inspectorId: 'INS-001', inspectorName: 'Emeka Okonkwo', score: 72, status: 'QA Review', submittedAt: '2026-04-13T12:30:00', qaReviewedAt: null, version: 1, defects: 4, criticalDefects: 1 },
  { id: 'RPT-446', orderId: 'ORD-1896', carId: 'CK-45', carName: 'Toyota Highlander 2016', inspectorId: 'INS-005', inspectorName: 'Seun Afolabi', score: 67, status: 'QA Review', submittedAt: '2026-04-12T16:00:00', qaReviewedAt: null, version: 1, defects: 6, criticalDefects: 2 },
  { id: 'RPT-440', orderId: 'ORD-1897', carId: 'CK-44', carName: 'Mercedes C-Class 2020', inspectorId: 'INS-001', inspectorName: 'Emeka Okonkwo', score: 88, status: 'Approved', submittedAt: '2026-04-10T14:00:00', qaReviewedAt: '2026-04-10T16:30:00', version: 2, defects: 2, criticalDefects: 0 },
  { id: 'RPT-439', orderId: 'ORD-1891', carId: 'CK-43', carName: 'Lexus RX 2018', inspectorId: 'INS-004', inspectorName: 'Ngozi Obi', score: 91, status: 'Approved', submittedAt: '2026-04-09T11:00:00', qaReviewedAt: '2026-04-09T14:00:00', version: 1, defects: 1, criticalDefects: 0 },
  { id: 'RPT-437', orderId: 'ORD-1888', carId: 'CK-48', carName: 'Hyundai Elantra 2014', inspectorId: 'INS-003', inspectorName: 'Babatunde Adeyemi', score: 52, status: 'Rejected', submittedAt: '2026-04-08T10:00:00', qaReviewedAt: '2026-04-08T15:00:00', version: 1, defects: 12, criticalDefects: 4 },
];

export const NOTIFICATIONS = [
  { id: 'N001', type: 'order', title: 'New Booking', description: 'Order #1894 from Funmilayo Okafor — Port Harcourt', time: '2m ago', read: false, link: '/orders/ORD-1894' },
  { id: 'N002', type: 'report', title: 'Report Ready for QA', description: 'Report RPT-446 submitted by Seun Afolabi', time: '15m ago', read: false, link: '/reports/RPT-446' },
  { id: 'N003', type: 'payment', title: 'Payment Received', description: '₦5,100,000 received for CK-41 Toyota Camry', time: '1h ago', read: false, link: '/finance' },
  { id: 'N004', type: 'auction', title: 'New Bid on Auction', description: 'AUC-001: New bid of ₦4,950,000 by AutoDeals Nigeria', time: '2h ago', read: true, link: '/auctions/AUC-001' },
  { id: 'N005', type: 'system', title: 'Inspector Online', description: 'Emeka Okonkwo is now online and available', time: '3h ago', read: true, link: '/inspectors/INS-001' },
  { id: 'N006', type: 'order', title: 'Order Stuck in QA', description: 'ORD-1892 has been in QA Review for 2h 30m', time: '4h ago', read: true, link: '/orders/ORD-1892' },
  { id: 'N007', type: 'report', title: 'Report Approved', description: 'RPT-440 approved by QA team', time: '1d ago', read: true, link: '/reports/RPT-440' },
  { id: 'N008', type: 'payment', title: 'Invoice Overdue', description: 'Invoice INV-023 is 3 days overdue', time: '1d ago', read: true, link: '/finance' },
];

export const ACTIVITY_LOG = [
  { id: 'ACT-001', actor: 'Promise Ndem', action: 'Approved report', target: 'RPT-440', targetType: 'report', timestamp: '2026-04-10T16:30:00', ip: '102.89.45.12', role: 'Super Admin' },
  { id: 'ACT-002', actor: 'Emeka Okonkwo', action: 'Submitted inspection', target: 'RPT-445', targetType: 'report', timestamp: '2026-04-13T12:30:00', ip: '197.210.54.89', role: 'Inspector' },
  { id: 'ACT-003', actor: 'Chukwuemeka Obi', action: 'Assigned inspector', target: 'ORD-1895', targetType: 'order', timestamp: '2026-04-13T08:05:00', ip: '102.89.45.15', role: 'Ops Manager' },
  { id: 'ACT-004', actor: 'Promise Ndem', action: 'Registered car', target: 'CK-47', targetType: 'car', timestamp: '2026-03-12T10:00:00', ip: '102.89.45.12', role: 'Super Admin' },
  { id: 'ACT-005', actor: 'Promise Ndem', action: 'Updated marketplace price', target: 'CK-46', targetType: 'car', timestamp: '2026-03-06T14:30:00', ip: '102.89.45.12', role: 'Super Admin' },
];

export const FINANCE_SUMMARY = {
  revenueMTD: 12450000,
  revenueTarget: 20000000,
  revenueYTD: 48750000,
  pendingPayments: 3,
  pendingAmount: 8500000,
  inspectorPayouts: 1250000,
  refundsPending: 2,
};

export const DEALS = [
  { id: 'DEAL-001', carId: 'CK-43', carName: 'Lexus RX 2018', buyerId: 'CRM-002', buyerName: 'Tunde Fashola', stage: 'Negotiation', amount: 19000000, createdAt: '2026-04-10', assignedTo: 'Promise Ndem' },
  { id: 'DEAL-002', carId: 'CK-44', carName: 'Mercedes C-Class 2019', buyerId: 'CRM-004', buyerName: 'AutoDeals Nigeria', stage: 'Closed Won', amount: 24000000, createdAt: '2026-04-05', assignedTo: 'Chukwuemeka Obi' },
  { id: 'DEAL-003', carId: 'CK-41', carName: 'Toyota Camry 2011', buyerId: 'CRM-001', buyerName: 'Adaeze Madu', stage: 'Offer Sent', amount: 5000000, createdAt: '2026-04-13', assignedTo: 'Promise Ndem' },
  { id: 'DEAL-004', carId: 'CK-46', carName: 'BMW 3 Series 2017', buyerId: 'CRM-004', buyerName: 'AutoDeals Nigeria', stage: 'Qualified', amount: 15500000, createdAt: '2026-04-11', assignedTo: 'Chukwuemeka Obi' },
];

export const LISTINGS = [
  { id: 'LST-001', carId: 'CK-41', carName: 'Toyota Camry 2011', price: 5100000, visibility: 'Visible', featured: false, score: 72, views: 234, inquiries: 12, listedAt: '2026-03-20' },
  { id: 'LST-002', carId: 'CK-43', carName: 'Lexus RX 2018', price: 19500000, visibility: 'Featured', featured: true, score: 91, views: 567, inquiries: 34, listedAt: '2026-03-15' },
  { id: 'LST-003', carId: 'CK-46', carName: 'BMW 3 Series 2017', price: 16000000, visibility: 'Visible', featured: false, score: 79, views: 189, inquiries: 8, listedAt: '2026-03-25' },
];

/** @deprecated for list UIs — use GET /api/appointments (mutable store). Kept for typing importers. */
export const APPOINTMENTS: unknown[] = [];
export type Appointment = Record<string, unknown>;

export const USERS = [
  { id: 'USR-001', name: 'Promise Ndem', email: 'promise@carschek.com', role: 'super-admin', status: 'Active', lastLogin: '2026-04-13T08:00:00', avatar: 'PN' },
  { id: 'USR-002', name: 'Chukwuemeka Obi', email: 'operations@carschek.com', role: 'ops-manager', status: 'Active', lastLogin: '2026-04-13T07:45:00', avatar: 'CO' },
  { id: 'USR-003', name: 'Emeka Okonkwo', email: 'emeka.inspector@carschek.com', role: 'inspector', status: 'Active', lastLogin: '2026-04-13T09:00:00', avatar: 'EO' },
  { id: 'USR-004', name: 'Amaka Finance', email: 'finance@carschek.com', role: 'finance', status: 'Active', lastLogin: '2026-04-12T16:00:00', avatar: 'AF' },
  { id: 'USR-005', name: 'Kola Support', email: 'support@carschek.com', role: 'support', status: 'Active', lastLogin: '2026-04-13T10:00:00', avatar: 'KS' },
];

/** Sales / inspector staff shown on car purchase step */
export const SALES_STAFF = [
  { id: 'USR-001', name: 'Promise Ndem' },
  { id: 'USR-002', name: 'Chukwuemeka Obi' },
  { id: 'USR-003', name: 'Emeka Okonkwo' },
  { id: 'INS-002', name: 'Chidinma Eze' },
  { id: 'INS-004', name: 'Ngozi Obi' },
  { id: 'INS-005', name: 'Seun Afolabi' },
];

export const INSPECTION_SECTIONS = [
  { id: 'S01', name: 'Customer Details', weight: 4, items: 11, timeEstimate: '5 min' },
  { id: 'S02', name: 'Documentation', weight: 4, items: 9, timeEstimate: '4 min' },
  { id: 'S03', name: 'Car Details', weight: 5, items: 16, timeEstimate: '6 min' },
  { id: 'S04', name: 'Photos', weight: 5, items: 11, timeEstimate: '10 min' },
  { id: 'S05', name: 'Body Frame Checklist', weight: 8, items: 15, timeEstimate: '7 min' },
  { id: 'S06', name: 'Shields', weight: 5, items: 15, timeEstimate: '6 min' },
  { id: 'S07', name: 'Lights', weight: 4, items: 6, timeEstimate: '4 min' },
  { id: 'S08', name: 'Mirrors', weight: 3, items: 6, timeEstimate: '3 min' },
  { id: 'S09', name: 'Equipment', weight: 3, items: 5, timeEstimate: '3 min' },
  { id: 'S10', name: 'Fluids / Filters Check', weight: 6, items: 15, timeEstimate: '6 min' },
  { id: 'S11', name: 'Car Frame', weight: 5, items: 6, timeEstimate: '4 min' },
  { id: 'S12', name: 'Exhaust Check', weight: 4, items: 4, timeEstimate: '3 min' },
  { id: 'S13', name: 'Engine Check', weight: 8, items: 8, timeEstimate: '6 min' },
  { id: 'S14', name: 'Brakes', weight: 6, items: 4, timeEstimate: '4 min' },
  { id: 'S15', name: 'Suspension Steering', weight: 6, items: 8, timeEstimate: '5 min' },
  { id: 'S16', name: 'Steering Control', weight: 4, items: 7, timeEstimate: '4 min' },
  { id: 'S17', name: 'Transmission', weight: 6, items: 10, timeEstimate: '5 min' },
  { id: 'S18', name: 'Seats', weight: 4, items: 11, timeEstimate: '5 min' },
  { id: 'S19', name: 'Windows', weight: 3, items: 6, timeEstimate: '3 min' },
  { id: 'S20', name: 'Electronic Control', weight: 4, items: 7, timeEstimate: '4 min' },
  { id: 'S21', name: 'General Upholstery', weight: 4, items: 10, timeEstimate: '5 min' },
  { id: 'S22', name: 'AC', weight: 4, items: 6, timeEstimate: '4 min' },
  { id: 'S23', name: 'Electrical Electronics', weight: 4, items: 4, timeEstimate: '3 min' },
  { id: 'S24', name: 'OBD', weight: 5, items: 15, timeEstimate: '6 min' },
  { id: 'S25', name: 'Damages', weight: 5, items: 0, timeEstimate: '8 min' },
  { id: 'S26', name: 'Comments', weight: 2, items: 6, timeEstimate: '4 min' },
  { id: 'S27', name: 'Save Report', weight: 1, items: 0, timeEstimate: '2 min' },
];

export const formatNaira = (amount: number): string => {
  return `₦${amount.toLocaleString('en-NG')}`;
};

export const getScoreColor = (score: number): string => {
  if (score >= 80) return '#1A7A4A';
  if (score >= 60) return '#D35400';
  return '#C0392B';
};

/** Circular gauge / report — 5-band scale (Prompt 04 / CarschekScore) */
export const getGaugeStrokeColor = (score: number): string => {
  if (score <= 40) return '#C0392B';
  if (score <= 60) return '#D35400';
  if (score <= 75) return '#1A7A4A';
  if (score <= 90) return '#ff5722';
  return '#0E6655';
};

export const getGaugeConditionLabel = (score: number): string => {
  if (score >= 91) return 'Excellent';
  if (score >= 76) return 'Very Good';
  if (score >= 61) return 'Good Condition';
  if (score >= 41) return 'Fair Condition';
  return 'Poor Condition';
};

export const getScoreLabel = (score: number): string => {
  if (score >= 90) return 'Outstanding';
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Poor';
};

export const STATUS_COLORS: Record<string, string> = {
  'New': 'bg-blue-100 text-blue-800',
  'Assigned': 'bg-purple-100 text-purple-800',
  'In Progress': 'bg-amber-100 text-amber-800',
  'Reported': 'bg-orange-100 text-orange-800',
  'QA Review': 'bg-yellow-100 text-yellow-800',
  'Closed': 'bg-gray-100 text-gray-700',
  'Approved': 'bg-green-100 text-green-800',
  'Rejected': 'bg-red-100 text-red-800',
  'Active': 'bg-green-100 text-green-800',
  'Acquired': 'bg-blue-100 text-blue-800',
  'Inspection Linked': 'bg-purple-100 text-purple-800',
  'At Buyer': 'bg-amber-100 text-amber-800',
  'Listed': 'bg-teal-100 text-teal-800',
  'Sold': 'bg-gray-100 text-gray-700',
  'Sent': 'bg-blue-100 text-blue-800',
  'Accepted': 'bg-green-100 text-green-800',
  'Negotiating': 'bg-amber-100 text-amber-800',
  'Draft': 'bg-gray-100 text-gray-700',
  'Rejected_offer': 'bg-red-100 text-red-800',
  'Ended-Sale': 'bg-green-100 text-green-800',
  'Ended-No Sale': 'bg-gray-100 text-gray-700',
  'Extended': 'bg-amber-100 text-amber-800',
  'Confirmed': 'bg-green-100 text-green-800',
  'Pending': 'bg-yellow-100 text-yellow-800',
  'Hot Lead': 'bg-red-100 text-red-800',
  'Lead': 'bg-blue-100 text-blue-800',
  'Negotiation': 'bg-amber-100 text-amber-800',
  'Closed Won': 'bg-green-100 text-green-800',
  'Cold': 'bg-gray-100 text-gray-700',
  'Offer Sent': 'bg-blue-100 text-blue-800',
  'Qualified': 'bg-purple-100 text-purple-800',
};
