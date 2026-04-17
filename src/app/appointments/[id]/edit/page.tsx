'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { AppointmentForm } from '@/components/appointments/AppointmentForm';
import type { Appointment } from '@/lib/appointments/types';

function EditInner() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<Appointment | null>(null);
  const [all, setAll] = useState<Appointment[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [one, list] = await Promise.all([
          fetch(`/api/appointments/${id}`, { cache: 'no-store' }).then(r => (r.ok ? r.json() : null)),
          fetch('/api/appointments', { cache: 'no-store' }).then(r => r.json()),
        ]);
        if (cancelled) return;
        setRow(one?.appointment ?? null);
        setAll(list.appointments ?? []);
      } catch {
        if (!cancelled) setRow(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <AppLayout currentPath={pathname}>
        <p className="p-8 text-sm text-[#6B7280]">Loading…</p>
      </AppLayout>
    );
  }

  if (!row) {
    return (
      <AppLayout currentPath={pathname}>
        <p className="p-8 text-sm text-[#C0392B]">Appointment not found.</p>
        <Link href="/appointments" className="text-[#2E75B6] text-sm font-semibold">
          Back to list
        </Link>
      </AppLayout>
    );
  }

  return (
    <AppLayout currentPath={pathname}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/appointments/${id}`}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E7EB] hover:bg-[#F4F6F8]"
          >
            <ArrowLeft size={16} className="text-[#6B7280]" />
          </Link>
          <div>
            <h1 className="text-xl font-heading font-bold text-[#1F2937]">
              Edit appointment — <span className="font-mono">{row.bookingId}</span>
            </h1>
            <p className="text-sm text-[#6B7280]">Update contact, vehicle, and booking fields</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <AppointmentForm
            key={row.id}
            mode="edit"
            initial={row}
            allAppointments={all}
            excludeId={id}
            onCancel={() => router.push(`/appointments/${id}`)}
            submitLabel="Save changes"
            onSubmit={async payload => {
              const r = await fetch(`/api/appointments/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              });
              const j = await r.json().catch(() => ({}));
              if (!r.ok) {
                toast.error(typeof j.error === 'string' ? j.error : 'Could not save');
                return;
              }
              toast.success('Appointment updated');
              router.push(`/appointments?highlight=${encodeURIComponent(row.bookingId)}`);
            }}
          />
        </div>
      </div>
    </AppLayout>
  );
}

export default function EditAppointmentPage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-[#6B7280]">Loading…</div>}>
      <EditInner />
    </Suspense>
  );
}
