'use client';

import React, { useEffect, useState } from 'react';
import { InvoicePrintTemplate } from '@/components/finance/InvoicePrintTemplate';
import type { PrintableInvoice } from '@/lib/finance/invoiceTypes';

export default function InvoicePreviewPage() {
  const [inv, setInv] = useState<PrintableInvoice | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('ck-invoice-preview');
      if (raw) setInv(JSON.parse(raw) as PrintableInvoice);
    } catch {
      setInv(null);
    }
  }, []);

  if (!inv) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] p-8 text-center">
        <p className="font-medium text-[#1F2937]">No preview data</p>
        <p className="mt-2 text-sm text-[#6B7280]">Use &quot;Preview Invoice&quot; from the Create Invoice modal on the Finance page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] py-8">
      <div className="mx-auto shadow-lg" style={{ width: 794 }}>
        <InvoicePrintTemplate invoice={inv} />
      </div>
    </div>
  );
}
