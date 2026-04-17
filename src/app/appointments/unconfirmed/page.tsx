'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { AppointmentsListClient } from '@/components/appointments/AppointmentsListClient';

function Inner() {
  const pathname = usePathname();
  return (
    <AppointmentsListClient
      variant="unconfirmed"
      title="Unconfirmed appointments — action required"
      showUnconfirmedBanner
      pathname={pathname}
    />
  );
}

export default function UnconfirmedAppointmentsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-[#6B7280]">Loading…</div>}>
      <Inner />
    </Suspense>
  );
}
