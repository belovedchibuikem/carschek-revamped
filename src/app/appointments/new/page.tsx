'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { AppointmentForm } from '@/components/appointments/AppointmentForm';
import type { Appointment } from '@/lib/appointments/types';
import { APPOINTMENTS_SEED } from '@/lib/appointments/seed';

function NewAppointmentInner() {
  const pathname = usePathname();
  const router = useRouter();
  const [all, setAll] = useState<Appointment[]>([...APPOINTMENTS_SEED]);
  const [nextStep, setNextStep] = useState<{ id: string; bookingId: string; serviceType: string } | null>(null);

  const refreshList = async () => {
    try {
      const r = await fetch('/api/appointments', { cache: 'no-store' });
      const j = await r.json();
      setAll(j.appointments ?? []);
    } catch {
      /* keep seed */
    }
  };

  React.useEffect(() => {
    void refreshList();
  }, []);

  return (
    <AppLayout currentPath={pathname}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/appointments"
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E7EB] hover:bg-[#F4F6F8]"
          >
            <ArrowLeft size={16} className="text-[#6B7280]" />
          </Link>
          <div>
            <h1 className="text-xl font-heading font-bold text-[#1F2937]">Create appointment</h1>
            <p className="text-sm text-[#6B7280]">Add a booking with full contact and vehicle details</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <AppointmentForm
            mode="create"
            initial={null}
            allAppointments={all}
            onCancel={() => router.push('/appointments')}
            submitLabel="Submit"
            onSubmit={async payload => {
              const r = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...payload, createdBy: 'USR-001' }),
              });
              const j = await r.json().catch(() => ({}));
              if (!r.ok) {
                toast.error(typeof j.error === 'string' ? j.error : 'Could not create');
                return;
              }
              const apt = j.appointment as Appointment;
              toast.success(`Appointment created — Booking ID: ${apt.bookingId}`);
              await refreshList();
              setNextStep({ id: apt.id, bookingId: apt.bookingId, serviceType: apt.serviceType });
            }}
          />
        </div>
      </div>

      {nextStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setNextStep(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-semibold text-[#1F2937]">What&apos;s next?</h3>
            {nextStep.serviceType === 'Inspection' && (
              <p className="text-sm text-[#6B7280]">Start inspection for this booking now?</p>
            )}
            {(nextStep.serviceType === 'Buy a Car' || nextStep.serviceType === 'Sell a Car') && (
              <p className="text-sm text-[#6B7280]">Create a car listing for this booking?</p>
            )}
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setNextStep(null);
                  router.push(`/appointments?highlight=${encodeURIComponent(nextStep.bookingId)}`);
                }}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                View list
              </button>
              {nextStep.serviceType === 'Inspection' && (
                <Link
                  href={`/cars/new?from=appointment&appointmentId=${encodeURIComponent(nextStep.id)}`}
                  className="px-3 py-2 bg-[#1A7A4A] text-white rounded-lg text-sm font-semibold"
                  onClick={() => setNextStep(null)}
                >
                  Go to inspection prep
                </Link>
              )}
              {(nextStep.serviceType === 'Buy a Car' || nextStep.serviceType === 'Sell a Car') && (
                <Link
                  href={`/cars/new?from=appointment&appointmentId=${encodeURIComponent(nextStep.id)}`}
                  className="px-3 py-2 bg-[#1E3A5F] text-white rounded-lg text-sm font-semibold"
                  onClick={() => setNextStep(null)}
                >
                  Create car listing
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default function NewAppointmentPage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-[#6B7280]">Loading…</div>}>
      <NewAppointmentInner />
    </Suspense>
  );
}
