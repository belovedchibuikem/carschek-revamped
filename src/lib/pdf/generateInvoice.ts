'use client';

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { PrintableInvoice } from '@/lib/finance/invoiceTypes';

async function waitForImages(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll('img'));
  await Promise.all(
    imgs.map(
      img =>
        new Promise<void>(resolve => {
          if (img.complete) resolve();
          else {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }
        })
    )
  );
}

export async function generateInvoicePDF(invoice: PrintableInvoice): Promise<void> {
  const el = document.getElementById('invoice-print-target');
  if (!el) {
    throw new Error('Invoice print target not found');
  }

  const prevVisibility = el.style.visibility;
  const prevPosition = el.style.position;
  const prevLeft = el.style.left;
  el.style.visibility = 'visible';
  el.style.position = 'fixed';
  el.style.left = '0';
  el.style.top = '0';
  el.style.zIndex = '9999';

  await new Promise(r => setTimeout(r, 120));
  await waitForImages(el);

  try {
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      width: 794,
      windowWidth: 794,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const pdf = new jsPDF({ format: 'a4', unit: 'mm', orientation: 'portrait' });
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    const safe = invoice.invoiceNumber.replace(/[^A-Z0-9-]/gi, '');
    pdf.save(`Carschek-Invoice-${safe}.pdf`);
  } finally {
    el.style.visibility = prevVisibility;
    el.style.position = prevPosition;
    el.style.left = prevLeft;
    el.style.top = '';
    el.style.zIndex = '';
  }
}
