'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { Calendar, Pencil, Trash2, Wrench, Car, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import type { Appointment } from '@/lib/appointments/types';
import {
  appointmentStatusBadge,
  formatCreatedAt,
  slotLabelForDialog,
  isAppointmentConfirmed,
} from '@/lib/appointments/logic';
import { findCarIdByVinOrPlate } from '@/lib/appointments/lookup';

function ServiceNextBanner({ a }: { a: Appointment }) {
  const router = useRouter();
  if (!isAppointmentConfirmed(a)) return null;
  const carId = a.linkedCarId || findCarIdByVinOrPlate(a.vinNumber, a.plateNumber);
  if (a.serviceType === 'Inspection') {
    return (
      <div className="rounded-xl border border-[#1A7A4A]/30 bg-green-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#14532d]">
          This appointment is for an inspection. Ready to inspect this vehicle?
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.push(`/cars/new?from=appointment&appointmentId=${encodeURIComponent(a.id)}`)}
            className="text-xs font-semibold px-3 py-2 rounded-lg border border-[#1A7A4A] text-[#14532d] hover:bg-white"
          >
            Create car record first
          </button>
          <button
            type="button"
            onClick={() => {
              if (carId) router.push(`/inspector-app/inspect/${carId}/overview`);
              else toast.message('Link or create a car record first');
            }}
            className="text-xs font-semibold px-3 py-2 rounded-lg bg-[#1A7A4A] text-white hover:bg-[#158f43]"
          >
            Start inspection
          </button>
        </div>
      </div>
    );
  }
  if (a.serviceType === 'Buy a Car') {
    return (
      <div className="rounded-xl border border-[#ff8a65]/30 bg-sky-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#ff5722]">This customer wants to buy a car. Link them to a listing?</p>
        <div className="flex gap-2">
          <Link
            href="/listings"
            className="text-xs font-semibold px-3 py-2 rounded-lg bg-[#ff5722] text-white hover:bg-[#e64a19]"
          >
            Browse listings
          </Link>
        </div>
      </div>
    );
  }
  if (a.serviceType === 'Sell a Car') {
    return (
      <div className="rounded-xl border border-[#D35400]/30 bg-orange-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#7c2d12]">This customer wants to sell their car. Create a car record to list it?</p>
        <Link
          href={`/cars/new?from=appointment&appointmentId=${encodeURIComponent(a.id)}&serviceType=sell`}
          className="text-xs font-semibold px-3 py-2 rounded-lg bg-[#D35400] text-white hover:bg-[#b8470a]"
        >
          Create car record
        </Link>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#F4F6F8] px-4 py-3 text-sm text-[#374151]">
      This appointment is for a general service.
      {carId ? (
        <Link href={`/cars/${carId}`} className="ml-2 font-semibold text-[#ff8a65]">
          View car record →
        </Link>
      ) : null}
    </div>
  );
}

export default function AppointmentDetailPage() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [a, setA] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    let c = false;
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/appointments/${id}`, { cache: 'no-store' });
        const j = r.ok ? await r.json() : null;
        if (!c) setA(j?.appointment ?? null);
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [id]);

  const inspect = (row: Appointment) => {
    const carId = row.linkedCarId || findCarIdByVinOrPlate(row.vinNumber, row.plateNumber);
    if (carId) router.push(`/inspector-app/inspect/${carId}/overview`);
    else toast.message('Create a car record first — use Create car from the menu');
  };

  if (loading) {
    return (
      <AppLayout currentPath={pathname}>
        <p className="p-8 text-sm text-[#6B7280]">Loading…</p>
      </AppLayout>
    );
  }

  if (!a) {
    return (
      <AppLayout currentPath={pathname}>
        <p className="p-8 text-sm text-[#C0392B]">Appointment not found.</p>
        <Link href="/appointments" className="text-[#ff8a65] font-semibold text-sm px-8">
          Back
        </Link>
      </AppLayout>
    );
  }

  const badge = appointmentStatusBadge(a);

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-5 max-w-6xl">
        <div className="flex items-center gap-2 text-[#6B7280] text-sm">
          <Link href="/appointments" className="hover:text-[#ff5722]">
            Appointments
          </Link>
          <span>/</span>
          <span className="font-mono text-[#1F2937]">{a.bookingId}</span>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#ff5722]/10 flex items-center justify-center">
              <Calendar className="text-[#ff5722]" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-[#1F2937] font-mono">{a.bookingId}</h1>
              <p className="text-sm text-[#6B7280]">
                {a.firstName} {a.lastName} — {a.make} {a.model} {a.year}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.className}`}>{badge.label}</span>
            <Link
              href={`/appointments/${a.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm font-semibold hover:bg-[#F4F6F8]"
            >
              <Pencil size={14} /> Edit
            </Link>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-200 text-[#C0392B] rounded-lg text-sm font-semibold hover:bg-red-50"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>

        <ServiceNextBanner a={a} />

        <div className="grid lg:grid-cols-2 gap-5">
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h2 className="text-sm font-heading font-bold text-[#ff5722] mb-3">Booking details</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-[#6B7280]">Service type</dt>
                  <dd className="font-medium text-[#1F2937]">{a.serviceType}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[#6B7280]">Slot</dt>
                  <dd className="font-medium text-[#1F2937] text-right">{slotLabelForDialog(a.slot)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[#6B7280]">Location</dt>
                  <dd className="font-medium">{a.location}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[#6B7280]">Address</dt>
                  <dd className="font-medium text-right max-w-[220px]">{a.serviceAddress}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[#6B7280]">Booking source</dt>
                  <dd className="font-medium">{a.bookingSource}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[#6B7280]">Call status</dt>
                  <dd className="font-medium">{a.callStatus}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[#6B7280]">Created</dt>
                  <dd className="font-medium">{formatCreatedAt(a.createdAt)}</dd>
                </div>
                {a.notes ? (
                  <div>
                    <dt className="text-[#6B7280]">Notes</dt>
                    <dd className="mt-1 text-[#374151]">{a.notes}</dd>
                  </div>
                ) : null}
              </dl>
            </div>

            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h2 className="text-sm font-heading font-bold text-[#ff5722] mb-3">Vehicle (lead)</h2>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                <dt className="text-[#6B7280]">Make</dt>
                <dd className="font-medium">{a.make}</dd>
                <dt className="text-[#6B7280]">Model</dt>
                <dd className="font-medium">{a.model}</dd>
                <dt className="text-[#6B7280]">Year</dt>
                <dd className="font-medium">{a.year}</dd>
                <dt className="text-[#6B7280]">Trim</dt>
                <dd className="font-medium">{a.trim || '—'}</dd>
                <dt className="text-[#6B7280]">Transmission</dt>
                <dd className="font-medium">{a.transmission}</dd>
                <dt className="text-[#6B7280]">VIN</dt>
                <dd className="font-mono text-xs">{a.vinNumber}</dd>
                <dt className="text-[#6B7280]">Plate</dt>
                <dd className="font-mono">{a.plateNumber || '—'}</dd>
              </dl>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h2 className="text-sm font-heading font-bold text-[#ff5722] mb-3">Customer contact</h2>
              <p className="text-sm font-semibold text-[#1F2937]">
                {a.salutation}. {a.firstName} {a.lastName}
              </p>
              <p className="text-sm text-[#374151] mt-2">✉ {a.email}</p>
              <p className="text-sm text-[#374151]">📞 {a.phone}</p>
              {a.phone2 ? <p className="text-sm text-[#374151]">📞 {a.phone2}</p> : null}
              {a.customerAddress ? <p className="text-sm text-[#6B7280] mt-2">📍 {a.customerAddress}</p> : null}
              <p className="text-xs text-[#6B7280] mt-3">
                SMS marketing: {a.agreeToSmsMarketing ? 'Yes' : 'No'} · Email marketing:{' '}
                {a.agreedToEmailMarketing ? 'Yes' : 'No'}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h2 className="text-sm font-heading font-bold text-[#ff5722] mb-3">Linked records</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-[#6B7280] text-xs font-semibold uppercase mb-1">Car record</p>
                  {a.linkedCarId ? (
                    <Link
                      href={`/cars/${a.linkedCarId}`}
                      className="inline-flex items-center gap-1 font-mono font-semibold text-[#1A7A4A] hover:underline"
                    >
                      {a.linkedCarId} <ExternalLink size={12} />
                    </Link>
                  ) : (
                    <p className="text-[#9CA3AF]">No car linked yet</p>
                  )}
                </div>
                <div>
                  <p className="text-[#6B7280] text-xs font-semibold uppercase mb-1">Inspection</p>
                  {a.linkedInspectionId && a.linkedCarId ? (
                    <Link
                      href={`/inspector-app/inspect/${a.linkedCarId}/overview`}
                      className="inline-flex items-center gap-1 font-semibold text-[#ff8a65] hover:underline"
                    >
                      {a.linkedInspectionId} <ExternalLink size={12} />
                    </Link>
                  ) : (
                    <p className="text-[#9CA3AF]">No inspection yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white/95 backdrop-blur border border-[#E5E7EB] rounded-xl p-3 flex flex-wrap gap-2 justify-center shadow-sm">
          <button
            type="button"
            onClick={() => inspect(a)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1A7A4A] text-white text-sm font-semibold hover:bg-[#158f43]"
          >
            <Wrench size={16} /> Inspect car
          </button>
          <Link
            href={`/cars/new?from=appointment&appointmentId=${encodeURIComponent(a.id)}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1A7A4A]/15 text-[#14532d] text-sm font-semibold border border-[#1A7A4A]/30"
          >
            <Car size={16} /> Create car
          </Link>
          <Link
            href={`/appointments/${a.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#E5E7EB] text-sm font-semibold hover:bg-[#F4F6F8]"
          >
            <Pencil size={16} /> Edit
          </Link>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-[#C0392B] text-sm font-semibold hover:bg-red-50"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-semibold text-[#C0392B]">Delete appointment?</h3>
            <p className="text-sm text-[#6B7280]">
              Booking {a.bookingId} — this cannot be undone. Linked cars are not deleted.
            </p>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setDeleteOpen(false)} className="px-4 py-2 border rounded-lg text-sm">
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const r = await fetch(`/api/appointments/${a.id}`, { method: 'DELETE' });
                  setDeleteOpen(false);
                  if (r.ok) {
                    toast.success(`Appointment ${a.bookingId} deleted`);
                    router.push('/appointments');
                  } else toast.error('Delete failed');
                }}
                className="px-4 py-2 bg-[#C0392B] text-white rounded-lg text-sm font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
