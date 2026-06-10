/** Shared domain types for Cars, CRM, Auctions, Offers, Reference Data (design mocks). */

export type PhysicalStatus =
  | 'acquired'
  | 'at_inspector'
  | 'at_buyer'
  | 'listed'
  | 'sold'
  | 'cancelled';

export type PipelineStep = 'acquired' | 'inspection_linked' | 'at_buyer' | 'listed' | 'sold';

export type PurchaseChannel = 'auction' | 'market_place' | 'offline' | 'b2b' | 'other';

export type SalesChannel = 'auction' | 'market_place' | 'offline' | 'b2b' | 'direct' | 'other';

export type DocumentKey =
  | 'custom_clearance'
  | 'insurance_clearance'
  | 'means_of_id'
  | 'number_plate'
  | 'road_worthiness'
  | 'proof_of_ownership'
  | 'plate_allocation'
  | 'purchase_receipt';

export type DocReviewStatus = 'missing' | 'uploaded_pending' | 'approved' | 'rejected';

export interface CarDocument {
  key: DocumentKey;
  name: string;
  required: boolean;
  status: DocReviewStatus;
  fileName?: string;
  fileSize?: number;
  uploadedAt?: string;
  uploadedBy?: string;
  rejectReason?: string;
  comment?: string;
}

export interface CarListRow {
  id: string;
  ckId: string;
  brand: string;
  model: string;
  year: number;
  transmission: string;
  bodyType: string;
  colour: string;
  vin: string;
  plate: string;
  physicalStatus: PhysicalStatus;
  purchaseChannel: PurchaseChannel;
  salesChannel: SalesChannel;
  purchasePrice: number;
  purchaseDate: string;
  soldPrice: number | null;
  marginPct: number | null;
  score: number | null;
  warningCount: number;
  potentialDuplicate: boolean;
  duplicateOfCkId?: string;
  docsUploaded: number;
  docsTotal: number;
  createdAt: string;
  createdBy: string;
  locationLabel: string;
}

export interface PriceEntry {
  id: string;
  amount: number;
  type: 'ear' | 'final' | 'adjustment';
  effectiveDate: string;
  createdBy: string;
}

export interface PaymentInfo {
  totalAmount: number;
  status: 'done' | 'pending' | 'overdue';
  paymentDate?: string;
  method?: string;
}

export interface CarContact {
  contactType: 'individual' | 'dealer' | 'corporate';
  inspectionSubType?: string;
  salutation?: string;
  firstName: string;
  lastName: string;
  company?: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
}

export interface CarPurchaseDetail {
  channel: PurchaseChannel;
  date: string;
  salesPerson: string;
  agent?: string;
  location: string;
  cancellationReason?: string;
  comment?: string;
  prices: PriceEntry[];
  payment: PaymentInfo;
  handoverFromSellerDate?: string;
}

export interface CarSalesDetail {
  channel: SalesChannel;
  soldTo?: string;
  soldDate?: string;
  salesPerson?: string;
  location?: string;
  invoiceNo?: string;
  invoiceDate?: string;
  comment?: string;
  sellingPrice: number;
  purchasePriceRef: number;
  payment: PaymentInfo;
  handoverFromSellerDate?: string;
}

export interface AuctionState {
  hasAuction: boolean;
  active?: boolean;
  startingBid?: number;
  currentBid?: number;
  bidCount?: number;
  endsAt?: string;
}

export type MarketplaceVisibility = 'not_visible' | 'visible' | 'featured';

export interface MarketplaceState {
  visibility: MarketplaceVisibility;
  featured: boolean;
  currentPrice: number;
}

export interface CarDetail extends CarListRow {
  engineNumber?: string;
  registeredCity?: string;
  registeredState?: string;
  mileage: number;
  pipelineStep: PipelineStep;
  inspectionLinked: boolean;
  graded: boolean;
  inAuction: boolean;
  docsCompleteForListing: boolean;
  contact: CarContact;
  purchase: CarPurchaseDetail;
  sales: CarSalesDetail;
  auction: AuctionState;
  marketplace: MarketplaceState;
  documents: CarDocument[];
}

export interface Brand {
  id: string;
  name: string;
  logoUrl?: string;
  countryCode: string;
  countryName: string;
  active: boolean;
  modelCount: number;
  carCount: number;
  createdAt: string;
}

export interface CarModel {
  id: string;
  brandId: string;
  name: string;
  bodyTypes: string[];
  active: boolean;
  carsInSystem: number;
  createdAt: string;
  /** Production year range — drives the Model → Year cascade. */
  yearFrom?: number;
  yearTo?: number;
}

export interface CarYear {
  year: number;
  active: boolean;
  carsRegistered: number;
  createdAt: string;
}

export type CrmContactType = 'buyer' | 'seller' | 'dealer' | 'lead';

export type CrmStage =
  | 'new'
  | 'contacted'
  | 'interested'
  | 'offer_sent'
  | 'negotiating'
  | 'closed_won'
  | 'closed_lost';

export interface CrmNote {
  id: string;
  text: string;
  author: string;
  at: string;
}

export interface CrmComm {
  id: string;
  channel: 'sms' | 'email' | 'call' | 'note';
  content: string;
  at: string;
  by: string;
}

export interface CrmCarLink {
  ckId: string;
  title: string;
  role: 'buyer' | 'seller';
  price: number;
  date: string;
  status: PhysicalStatus;
}

export interface CrmOfferBrief {
  id: string;
  carCk: string;
  amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  validUntil: string;
}

export interface CrmContact {
  id: string;
  name: string;
  type: CrmContactType;
  phone: string;
  email: string;
  stage: CrmStage;
  lastContact: string;
  carsLinked: number;
  assignedTo: string;
  avatar: string;
  followUpDate?: string;
  totalDeals: number;
  carsBought: number;
  carsSold: number;
  transactionValue: number;
  notes: CrmNote[];
  communications: CrmComm[];
  cars: CrmCarLink[];
  offers: CrmOfferBrief[];
}

export type AuctionAdminStatus = 'active' | 'extended' | 'ended_no_sale' | 'ended_sale';

export interface AuctionRow {
  id: string;
  carId: string;
  ckId: string;
  vehicleLabel: string;
  vin: string;
  startingBid: number;
  highestBid: number;
  bidCount: number;
  reserveMet: boolean;
  endsAt: string;
  startedAt: string;
  status: AuctionAdminStatus;
  reservePrice?: number;
}

export interface AuctionBid {
  id: string;
  bidder: string;
  anonymous: boolean;
  amount: number;
  at: string;
  isHighest: boolean;
}

export type OfferStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

export interface OfferRow {
  id: string;
  carId: string;
  ckId: string;
  carName: string;
  contactId: string;
  contactName: string;
  amount: number;
  validUntil: string;
  status: OfferStatus;
  createdBy: string;
  createdAt: string;
}

export interface MockUser {
  id: string;
  name: string;
}
