export const CAR_DOCUMENT_TYPES = [
  'Vehicle Registration',
  'Proof of Ownership',
  'Insurance Certificate',
  'Road Worthiness',
  'Customs Papers',
  'Service History',
  'Inspection Report',
  'Sales Agreement',
] as const;

export type CarDocumentType = (typeof CAR_DOCUMENT_TYPES)[number];
