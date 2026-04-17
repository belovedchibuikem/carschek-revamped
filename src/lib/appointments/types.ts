export type AppointmentStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'rescheduled';

export type ServiceType = 'Inspection' | 'Buy a Car' | 'Sell a Car' | 'General Service';

export type CallStatus =
  | 'Not Called'
  | 'Called - No Answer'
  | 'Called & Confirmed'
  | 'Called & Rejected'
  | 'Rescheduled';

export interface Appointment {
  id: string;
  bookingId: string;
  salutation: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phone2?: string;
  /** Contact / mailing address (Section 1) */
  customerAddress?: string;
  agreeToSmsMarketing: boolean;
  agreedToEmailMarketing: boolean;
  make: string;
  model: string;
  year: number;
  trim?: string;
  transmission: string;
  vinNumber: string;
  plateNumber?: string;
  serviceType: ServiceType;
  status: AppointmentStatus;
  location: string;
  /** Full address where inspection or service takes place */
  serviceAddress: string;
  slot: string;
  bookingSource: string;
  callStatus: CallStatus;
  rejectionReason?: string;
  notes?: string;
  linkedCarId?: string;
  linkedInspectionId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}
