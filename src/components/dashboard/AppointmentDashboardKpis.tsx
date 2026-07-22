'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarCheck, CalendarClock, CalendarDays, Wrench, Hash, Phone } from 'lucide-react';
import type { Appointment } from '@/lib/appointments/types';
import { computeAppointmentKpis } from '@/lib/appointments/logic';
import { appointmentsApi } from '@/lib/api/services';

export function AppointmentDashboardKpis() {
  const [stats, setStats] = useState<ReturnType<typeof computeAppointmentKpis> | null>(null);

  useEffect(() => {
    let c = false;
    appointmentsApi
      .list()
      .then((appointments: Appointment[]) => {
        if (c) return;
        setStats(computeAppointmentKpis(appointments));
      })
      .catch(() => {});
    return () => {
      c = true;
    };
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-28 rounded-xl border border-[#E5E7EB] bg-white animate-pulse" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Confirmed bookings',
      value: stats.confirmed,
      sub: `+${stats.confirmedTodayDelta} today`,
      href: '/appointments/confirmed',
      icon: CalendarCheck,
      color: '#1A7A4A',
    },
    {
      label: 'Unconfirmed bookings',
      value: stats.unconfirmed,
      sub: 'Needs attention',
      href: '/appointments/unconfirmed',
      icon: CalendarClock,
      color: '#D35400',
    },
    {
      label: "Today\'s appointments",
      value: stats.todayCount,
      sub: stats.nextTodaySlot ? `Next: ${stats.nextTodaySlot}` : 'No upcoming today',
      href: '/appointments?date=today',
      icon: CalendarDays,
      color: '#ff5722',
    },
    {
      label: 'Ready to inspect',
      value: stats.readyToInspect,
      sub: 'Cars awaiting inspection start',
      href: '/appointments?serviceType=inspection&status=confirmed&inspectionLinked=false',
      icon: Wrench,
      color: '#ff8a65',
    },
    {
      label: 'Total appointments',
      value: stats.total,
      sub: `This month: ${stats.monthNew}`,
      href: '/appointments',
      icon: Hash,
      color: '#374151',
    },
    {
      label: 'Not called yet',
      value: stats.notCalled,
      sub: stats.oldestNotCalledDays != null ? `Oldest: ${stats.oldestNotCalledDays}d` : '—',
      href: '/appointments?callStatus=not-called',
      icon: Phone,
      color: '#C0392B',
    },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-heading font-semibold text-[#1F2937]">Appointments</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((k, i) => (
          <Link
            key={`apt-kpi-${i}`}
            href={k.href}
            className="bg-white rounded-xl border border-[#E5E7EB] p-5 hover:shadow-md transition-all hover:border-[#ff8a65]/30 group"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${k.color}15` }}>
                <k.icon size={20} style={{ color: k.color }} />
              </div>
              <ArrowRight size={14} className="text-[#9CA3AF] group-hover:text-[#ff8a65] transition-colors" />
            </div>
            <div className="text-2xl font-heading font-bold text-[#1F2937] tabular-nums">{k.value.toLocaleString()}</div>
            <p className="text-xs text-[#6B7280] mt-1">{k.label}</p>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">{k.sub}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
