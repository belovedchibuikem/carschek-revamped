export type ClientType = 'Individual' | 'Dealer' | 'Corporate';

export type InvoiceForOption =
  | 'Inspection Service' |'Vehicle Sale Commission' |'Re-inspection Fee' |'Loan Referral' |'Dealer Package' |'Custom';

export type DiscountType = '%' | '₦';

export type InvoiceLine = {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
};

/** Full invoice for PDF / print template */
export type PrintableInvoice = {
  invoiceNumber: string;
  status: string;
  clientType: ClientType;
  clientName: string;
  company: string;
  email: string;
  phone: string;
  billingAddress: string;
  invoiceDate: string;
  dueDate: string;
  invoiceFor: string;
  lines: { description: string; qty: number; unitPrice: number }[];
  subtotal: number;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  /** e.g. 0.075 for 7.5% */
  vatRate: number;
  vat: number;
  total: number;
  notes: string;
  paymentAccount: string;
};

export type FinanceInvoiceListRow = {
  id: string;
  customer: string;
  amount: number;
  date: string;
  dueDate: string;
  status: string;
  printable: PrintableInvoice;
};

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const seq = Math.floor(1000 + Math.random() * 9000);
  return `INV-${year}-${seq}`;
}

export function formatInvoiceMoney(n: number): string {
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function computeInvoiceTotals(
  lines: { qty: number; unitPrice: number }[],
  discountType: DiscountType,
  discountValue: number,
  vatRate = 0.075
): { subtotal: number; discountAmount: number; vat: number; total: number } {
  const subtotal = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
  const discountAmount =
    discountType === '%' ? subtotal * (discountValue / 100) : Math.min(discountValue, subtotal);
  const taxable = Math.max(0, subtotal - discountAmount);
  const vat = taxable * vatRate;
  const total = taxable + vat;
  return { subtotal, discountAmount, vat, total };
}
