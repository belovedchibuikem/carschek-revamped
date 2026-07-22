import type { InspectorJobCard, InspectorJobStatusUi } from '@/lib/inspection/mockInspectorJobs';

type OrderLike = {
  id: string;
  status?: string;
  vehicle?: string;
  plate?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  zone?: string | null;
  notes?: string | null;
  scheduledAt?: string | null;
  carId?: string | null;
};

function mapStatus(status?: string): InspectorJobStatusUi {
  switch (status) {
    case 'In Progress':
      return 'in-progress';
    case 'QA Review':
      return 'awaiting-qa';
    case 'Reported':
    case 'Closed':
      return 'completed';
    case 'Assigned':
      return 'en-route';
    default:
      return 'upcoming';
  }
}

function maskPhone(phone?: string | null): { masked: string; full: string } {
  const full = (phone || '').trim() || '+234 800 000 0000';
  const digits = full.replace(/\D/g, '');
  if (digits.length < 4) return { masked: '+234 *** *** ****', full };
  const last4 = digits.slice(-4);
  return { masked: `+234 *** *** ${last4}`, full };
}

function timeLabel(iso?: string | null): string {
  if (!iso) return 'TBD';
  try {
    return new Date(iso).toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' });
  } catch {
    return 'TBD';
  }
}

/** Map an order API row into the inspector job card shape used by PWA screens. */
export function mapOrderToJobCard(order: OrderLike, opts?: { vin?: string; score?: number | null }): InspectorJobCard {
  const phone = maskPhone(order.customerPhone);
  return {
    id: order.id,
    status: mapStatus(order.status),
    vehicleLabel: order.vehicle || 'Vehicle',
    plate: order.plate || '—',
    vin: opts?.vin || '—',
    customer: order.customerName || 'Customer',
    phoneMasked: phone.masked,
    phoneFull: phone.full,
    address: order.zone || 'Lagos',
    distanceKm: 0,
    lat: 6.4541,
    lng: 3.3947,
    timeLabel: timeLabel(order.scheduledAt),
    carschekScore: opts?.score ?? null,
  };
}
