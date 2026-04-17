'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { AppointmentsListClient } from '@/components/appointments/AppointmentsListClient';

function Inner() {
  const pathname = usePathname();
  return <AppointmentsListClient variant="confirmed" title="Confirmed appointments" pathname={pathname} />;
}

export default function ConfirmedAppointmentsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-[#6B7280]">Loading…</div>}>
      <Inner />
    </Suspense>
  );
}
