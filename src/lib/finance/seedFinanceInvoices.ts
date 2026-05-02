import type { ClientType, DiscountType, FinanceInvoiceListRow, PrintableInvoice } from '@/lib/finance/invoiceTypes';

function buildPrintable(base: {
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
  notes: string;
  paymentAccount: string;
  discountType?: DiscountType;
  discountValue?: number;
  vatRate?: number;
}): PrintableInvoice {
  const discountType = base.discountType ?? '₦';
  const discountValue = base.discountValue ?? 0;
  const vatRate = base.vatRate ?? 0.075;
  const { lines, discountType: _dt, discountValue: _dv, vatRate: _vr, ...rest } = base;
  const subtotal = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
  const discountAmount =
    discountType === '%' ? subtotal * (discountValue / 100) : Math.min(discountValue, subtotal);
  const taxable = Math.max(0, subtotal - discountAmount);
  const vat = taxable * vatRate;
  const total = taxable + vat;
  return {
    invoiceNumber: rest.invoiceNumber,
    status: rest.status,
    clientType: rest.clientType,
    clientName: rest.clientName,
    company: rest.company,
    email: rest.email,
    phone: rest.phone,
    billingAddress: rest.billingAddress,
    invoiceDate: rest.invoiceDate,
    dueDate: rest.dueDate,
    invoiceFor: rest.invoiceFor,
    lines,
    notes: rest.notes,
    paymentAccount: rest.paymentAccount,
    discountType,
    discountValue,
    discountAmount,
    vatRate,
    vat,
    subtotal,
    total,
  };
}

const INV_023_PRINT = buildPrintable({
  invoiceNumber: 'INV-023',
  status: 'Overdue',
  clientType: 'Dealer',
  clientName: 'AutoDeals Nigeria',
  company: 'AutoDeals Nigeria Ltd',
  email: 'info@autodeals.ng',
  phone: '+234 808 901 2345',
  billingAddress: '15 Industrial Avenue, Ikeja, Lagos',
  invoiceDate: '2026-04-01',
  dueDate: '2026-04-10',
  invoiceFor: 'Dealer Package',
  lines: [
    { description: 'Platform listing fee (March)', qty: 1, unitPrice: 25000 },
    { description: 'Featured boost — 7 days', qty: 1, unitPrice: 20000 },
  ],
  notes: 'Payment due within 30 days from invoice date.',
  paymentAccount: 'Carschek Ltd | GTBank | 0123456789 | Sort: 058-000000',
});

const INV_024_PRINT = buildPrintable({
  invoiceNumber: 'INV-024',
  status: 'Paid',
  clientType: 'Corporate',
  clientName: 'Tunde Fashola',
  company: 'Fashola Holdings',
  email: 'tunde.f@corp.ng',
  phone: '+234 806 789 0123',
  billingAddress: '22 Adeola Odeku Street, VI, Lagos',
  invoiceDate: '2026-04-12',
  dueDate: '2026-04-19',
  invoiceFor: 'Vehicle Sale Commission',
  lines: [{ description: 'Vehicle transaction — Mercedes C-Class', qty: 1, unitPrice: 24000000 }],
  notes: 'Thank you for your business.',
  paymentAccount: 'Carschek Ltd | GTBank | 0123456789 | Sort: 058-000000',
});

const INV_025_PRINT = buildPrintable({
  invoiceNumber: 'INV-025',
  status: 'Sent',
  clientType: 'Individual',
  clientName: 'Adaeze Madu',
  company: '',
  email: 'adaeze@gmail.com',
  phone: '+234 801 234 5678',
  billingAddress: '7 Admiralty Road, Lekki Phase 1, Lagos',
  invoiceDate: '2026-04-13',
  dueDate: '2026-04-20',
  invoiceFor: 'Inspection Service',
  lines: [{ description: 'Inspection report PDF package', qty: 3, unitPrice: 5000 }],
  notes: 'Payment due within 30 days from invoice date.',
  paymentAccount: 'Carschek Ltd | GTBank | 0123456789 | Sort: 058-000000',
});

const invoiceRegistry = new Map<string, FinanceInvoiceListRow>();

export const INITIAL_FINANCE_INVOICE_ROWS: FinanceInvoiceListRow[] = [
  {
    id: 'INV-023',
    customer: 'AutoDeals Nigeria',
    amount: INV_023_PRINT.total,
    date: '2026-04-01',
    dueDate: '2026-04-10',
    status: 'Overdue',
    printable: INV_023_PRINT,
  },
  {
    id: 'INV-024',
    customer: 'Tunde Fashola',
    amount: INV_024_PRINT.total,
    date: '2026-04-12',
    dueDate: '2026-04-19',
    status: 'Paid',
    printable: INV_024_PRINT,
  },
  {
    id: 'INV-025',
    customer: 'Adaeze Madu',
    amount: INV_025_PRINT.total,
    date: '2026-04-13',
    dueDate: '2026-04-20',
    status: 'Sent',
    printable: INV_025_PRINT,
  },
];

INITIAL_FINANCE_INVOICE_ROWS.forEach(r => invoiceRegistry.set(r.id, r));

export function upsertFinanceInvoiceRow(row: FinanceInvoiceListRow): void {
  invoiceRegistry.set(row.id, row);
}

export function getAllFinanceInvoiceRows(): FinanceInvoiceListRow[] {
  return Array.from(invoiceRegistry.values()).sort((a, b) => b.date.localeCompare(a.date));
}

export function getFinanceInvoiceRow(id: string): FinanceInvoiceListRow | undefined {
  return invoiceRegistry.get(id);
}

export function getInvoiceDetailPagePayload(id: string):
  | {
      customer: string;
      amount: number;
      status: string;
      date: string;
      dueDate: string;
      lines: { desc: string; qty: number; unit: number }[];
    }
  | undefined {
  const row = invoiceRegistry.get(id);
  if (!row) return undefined;
  const { printable: pr } = row;
  return {
    customer: pr.clientName,
    amount: pr.total,
    status: pr.status,
    date: pr.invoiceDate,
    dueDate: pr.dueDate,
    lines: pr.lines.map(l => ({ desc: l.description, qty: l.qty, unit: l.unitPrice })),
  };
}
