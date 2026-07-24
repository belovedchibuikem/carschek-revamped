'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import {
  Plus,
  Search,
  MoreVertical,
  CheckCircle2,
  Clock,
  XCircle,
  PhoneMissed,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Appointment } from '@/lib/appointments/types';
import {
  appointmentStatusBadge,
  callStatusBadgeClass,
  formatCreatedAt,
  formatSlotDisplay,
  isAppointmentConfirmed,
  isAppointmentUnconfirmed,
  isInspectedAppointment,
  slotLabelForDialog,
} from '@/lib/appointments/logic';
import { findCarIdByVinOrPlate } from '@/lib/appointments/lookup';
import { storeAppointmentInspectionPrefill } from '@/lib/inspection/appointmentPrefill';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { appointmentsApi, carsApi } from '@/lib/api/services';

export type AppointmentsListVariant = 'all' | 'confirmed' | 'unconfirmed' | 'inspected';

type Props = {
  variant: AppointmentsListVariant;
  title: string;
  showUnconfirmedBanner?: boolean;
  pathname: string;
};

async function fetchAppointments(): Promise<Appointment[]> {
  return appointmentsApi.list();
}

export function AppointmentsListClient({ variant, title, showUnconfirmedBanner, pathname }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [brandFilter, setBrandFilter] = useState('');
  const [locFilter, setLocFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [confirmRow, setConfirmRow] = useState<Appointment | null>(null);
  const [confirmCallStatus, setConfirmCallStatus] = useState('Called & Confirmed');
  const [confirmNotes, setConfirmNotes] = useState('');

  const [deleteRow, setDeleteRow] = useState<Appointment | null>(null);

  const [inspectNoCar, setInspectNoCar] = useState<Appointment | null>(null);

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkCallStatus, setBulkCallStatus] = useState('Called & Confirmed');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAppointments();
      setRows(data);
    } catch {
      toast.error('Could not load appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const highlightBooking = searchParams.get('highlight') ?? '';

  const queryFiltered = useMemo(() => {
    let list = [...rows];
    const q = debouncedSearch.toLowerCase().trim();
    if (q) {
      list = list.filter(
        a =>
          a.bookingId.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.phone.includes(q) ||
          a.make.toLowerCase().includes(q) ||
          a.model.toLowerCase().includes(q) ||
          `${a.firstName} ${a.lastName}`.toLowerCase().includes(q)
      );
    }
    if (brandFilter) list = list.filter(a => a.make === brandFilter);
    if (locFilter) list = list.filter(a => a.location === locFilter);
    if (dateFilter) {
      const df = dateFilter;
      list = list.filter(a => a.slot.slice(0, 10) === df);
    }

    const today = new Date().toISOString().slice(0, 10);
    if (searchParams.get('date') === 'today') {
      list = list.filter(a => a.slot.slice(0, 10) === today);
    }
    if (searchParams.get('callStatus') === 'not-called') {
      list = list.filter(a => a.callStatus === 'Not Called');
    }
    const st = searchParams.get('serviceType');
    if (st === 'inspection') {
      list = list.filter(a => a.serviceType === 'Inspection');
    }
    if (searchParams.get('status') === 'confirmed') {
      list = list.filter(isAppointmentConfirmed);
    }
    if (searchParams.get('inspectionLinked') === 'true') {
      list = list.filter(a => !!a.linkedInspectionId);
    }
    if (searchParams.get('inspectionLinked') === 'false') {
      list = list.filter(a => !a.linkedInspectionId);
    }

    if (variant === 'confirmed') list = list.filter(isAppointmentConfirmed);
    if (variant === 'unconfirmed') list = list.filter(isAppointmentUnconfirmed);
    if (variant === 'inspected') list = list.filter(isInspectedAppointment);

    if (variant === 'unconfirmed') {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    return list;
  }, [rows, debouncedSearch, brandFilter, locFilter, dateFilter, variant, searchParams]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, brandFilter, locFilter, dateFilter, variant, searchParams]);

  const paginated = useMemo(
    () => queryFiltered.slice((page - 1) * perPage, page * perPage),
    [queryFiltered, page, perPage]
  );
  const totalPages = Math.max(1, Math.ceil(queryFiltered.length / perPage));

  const brands = useMemo(() => [...new Set(rows.map(r => r.make))].sort(), [rows]);
  const locs = useMemo(() => [...new Set(rows.map(r => r.location))].sort(), [rows]);

  const counts = useMemo(() => {
    const all = rows.length;
    const conf = rows.filter(isAppointmentConfirmed).length;
    const unconf = rows.filter(isAppointmentUnconfirmed).length;
    return { all, conf, unconf };
  }, [rows]);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const toggleSelectAllOnPage = () => {
    const ids = paginated.map(p => p.id);
    const allOn = ids.every(id => selected.has(id));
    setSelected(prev => {
      const n = new Set(prev);
      if (allOn) ids.forEach(id => n.delete(id));
      else ids.forEach(id => n.add(id));
      return n;
    });
  };

  const runConfirm = async (a: Appointment, callStatus: string, notes: string) => {
    try {
      await appointmentsApi.update(a.id, {
        callStatus,
        status: callStatus === 'Called & Confirmed' ? 'confirmed' : a.status,
        notes: notes || a.notes,
      });
    } catch {
      toast.error('Could not confirm');
      return;
    }
    toast.success(`Appointment confirmed — ${a.bookingId}`);
    setConfirmRow(null);
    await refresh();
    router.push(`/appointments/confirmed?highlight=${encodeURIComponent(a.bookingId)}`);
  };

  const runDelete = async (a: Appointment) => {
    setDeleteRow(null);
    setRemovingIds(prev => new Set(prev).add(a.id));
    try {
      await appointmentsApi.remove(a.id);
      window.setTimeout(async () => {
        toast.success(`Appointment ${a.bookingId} deleted`);
        await refresh();
        setRemovingIds(prev => {
          const n = new Set(prev);
          n.delete(a.id);
          return n;
        });
      }, 280);
    } catch {
      toast.error('Delete failed');
      setRemovingIds(prev => {
        const n = new Set(prev);
        n.delete(a.id);
        return n;
      });
    }
  };

  const inspectCar = async (a: Appointment) => {
    const carId = a.linkedCarId || findCarIdByVinOrPlate(a.vinNumber, a.plateNumber);
    if (!carId) {
      setInspectNoCar(a);
      return;
    }
    let car: Awaited<ReturnType<typeof carsApi.get>> | null = null;
    try {
      car = await carsApi.get(carId);
    } catch {
      /* appointment fields alone are enough for core prefill */
    }
    storeAppointmentInspectionPrefill(a, { car, carId });
    toast.message(`Opening inspection for ${carId} — booking details prefilled`);
    router.push(`/inspector-app/inspect/${carId}/overview`);
  };

  const createCarHref = (a: Appointment) =>
    `/cars/new?from=appointment&appointmentId=${encodeURIComponent(a.id)}`;

  const statusIcon = (a: Appointment) => {
    const b = appointmentStatusBadge(a);
    if (b.key === 'confirmed') return <CheckCircle2 size={14} className="text-green-600 shrink-0" />;
    if (b.key === 'rejected') return <XCircle size={14} className="text-red-500 shrink-0" />;
    if (b.key === 'no-answer') return <PhoneMissed size={14} className="text-gray-500 shrink-0" />;
    return <Clock size={14} className="text-amber-500 shrink-0" />;
  };

  const showLinkedCol = variant === 'confirmed' || variant === 'inspected';

  const bulkConfirm = async () => {
    const ids = [...selected].filter(id => {
      const a = rows.find(r => r.id === id);
      return a && isAppointmentUnconfirmed(a);
    });
    if (!ids.length) {
      toast.error('Select unconfirmed appointments');
      return;
    }
    for (const id of ids) {
      await appointmentsApi.update(id, { callStatus: bulkCallStatus, status: 'confirmed' });
    }
    toast.success(`Confirmed ${ids.length} appointments`);
    setBulkOpen(false);
    setSelected(new Set());
    await refresh();
  };

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#1F2937]">{title}</h1>
            <p className="text-sm text-[#6B7280]">{queryFiltered.length} shown · {rows.length} total in system</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {variant === 'unconfirmed' && selected.size > 0 && (
              <button
                type="button"
                onClick={() => setBulkOpen(true)}
                className="px-3 py-2.5 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700"
              >
                Bulk confirm ({selected.size})
              </button>
            )}
            <Link
              href="/appointments/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19] min-h-[44px]"
            >
              <Plus size={16} /> Create appointment
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-[#E5E7EB] pb-3">
          <Link
            href="/appointments"
            className={`px-3 py-2 rounded-lg text-sm font-semibold ${pathname === '/appointments' ? 'bg-[#ff5722] text-white' : 'bg-[#F4F6F8] text-[#374151] hover:bg-[#E5E7EB]'}`}
          >
            All ({counts.all})
          </Link>
          <Link
            href="/appointments/confirmed"
            className={`px-3 py-2 rounded-lg text-sm font-semibold ${pathname.startsWith('/appointments/confirmed') ? 'bg-[#ff5722] text-white' : 'bg-[#F4F6F8] text-[#374151] hover:bg-[#E5E7EB]'}`}
          >
            Confirmed ({counts.conf})
          </Link>
          <Link
            href="/appointments/unconfirmed"
            className={`px-3 py-2 rounded-lg text-sm font-semibold ${pathname.startsWith('/appointments/unconfirmed') ? 'bg-amber-600 text-white' : 'bg-[#F4F6F8] text-[#374151] hover:bg-[#E5E7EB]'}`}
          >
            Unconfirmed ({counts.unconf})
          </Link>
          <Link
            href="/appointments/inspected"
            className={`px-3 py-2 rounded-lg text-sm font-semibold ${pathname.startsWith('/appointments/inspected') ? 'bg-[#ff5722] text-white' : 'bg-[#F4F6F8] text-[#374151] hover:bg-[#E5E7EB]'}`}
          >
            Inspected
          </Link>
        </div>

        {showUnconfirmedBanner && counts.unconf > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <strong>{counts.unconf}</strong> appointments are awaiting confirmation. Call customers to confirm their slots.
          </div>
        )}

        <div className="flex flex-wrap gap-3 items-end">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search booking, email, phone, vehicle…"
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-[#6B7280] uppercase mb-1">Brand</label>
            <select
              value={brandFilter}
              onChange={e => setBrandFilter(e.target.value)}
              className="text-sm border border-[#E5E7EB] rounded-lg px-3 py-2.5 bg-white"
            >
              <option value="">All</option>
              {brands.map(b => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-[#6B7280] uppercase mb-1">Location</label>
            <select
              value={locFilter}
              onChange={e => setLocFilter(e.target.value)}
              className="text-sm border border-[#E5E7EB] rounded-lg px-3 py-2.5 bg-white"
            >
              <option value="">All</option>
              {locs.map(b => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-[#6B7280] uppercase mb-1">Slot date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="text-sm border border-[#E5E7EB] rounded-lg px-3 py-2.5 bg-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-[#6B7280] uppercase mb-1">Rows</label>
            <select
              value={perPage}
              onChange={e => setPerPage(Number(e.target.value))}
              className="text-sm border border-[#E5E7EB] rounded-lg px-3 py-2.5 bg-white"
            >
              {[10, 25, 50].map(n => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-x-auto">
          {loading ? (
            <p className="p-8 text-sm text-[#6B7280]">Loading…</p>
          ) : queryFiltered.length === 0 ? (
            <p className="p-8 text-sm text-[#6B7280]">No appointments match.</p>
          ) : (
            <table className="w-full text-sm min-w-[1100px]">
              <thead>
                <tr className="bg-[#F4F6F8] text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">
                  {variant === 'unconfirmed' && (
                    <th className="px-2 py-3 w-10">
                      <input type="checkbox" aria-label="Select page" onChange={toggleSelectAllOnPage} />
                    </th>
                  )}
                  <th className="px-3 py-3 text-left">Brand</th>
                  <th className="px-3 py-3 text-left">Email</th>
                  <th className="px-3 py-3 text-left">Phone</th>
                  <th className="px-3 py-3 text-left">Location slot</th>
                  <th className="px-3 py-3 text-left">Location</th>
                  <th className="px-3 py-3 text-left">Address</th>
                  <th className="px-3 py-3 text-left font-mono">Booking ID</th>
                  <th className="px-3 py-3 text-left">Service</th>
                  <th className="px-3 py-3 text-left">Status</th>
                  <th className="px-3 py-3 text-left">Call / rejection</th>
                  <th className="px-3 py-3 text-left">Created</th>
                  {showLinkedCol && <th className="px-3 py-3 text-left">Linked to</th>}
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F6F8]">
                {paginated.map(a => {
                  const badge = appointmentStatusBadge(a);
                  const hl = highlightBooking && a.bookingId === highlightBooking;
                  const fading = removingIds.has(a.id);
                  return (
                    <tr
                      key={a.id}
                      className={`hover:bg-[#F9FAFB] transition-opacity duration-300 ${hl ? 'bg-sky-50' : ''} ${fading ? 'opacity-0' : ''}`}
                    >
                      {variant === 'unconfirmed' && (
                        <td className="px-2 py-2">
                          {isAppointmentUnconfirmed(a) && (
                            <input
                              type="checkbox"
                              checked={selected.has(a.id)}
                              onChange={() => toggleSelect(a.id)}
                            />
                          )}
                        </td>
                      )}
                      <td className="px-3 py-2 font-medium text-[#1F2937]">
                        <button type="button" onClick={() => router.push(`/appointments/${a.id}`)} className="text-left hover:underline">
                          {a.make}
                        </button>
                      </td>
                      <td className="px-3 py-2 text-[#374151] max-w-[140px] truncate">{a.email}</td>
                      <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">{a.phone}</td>
                      <td className="px-3 py-2 text-xs text-[#6B7280] max-w-[180px]">{formatSlotDisplay(a.slot)}</td>
                      <td className="px-3 py-2">{a.location}</td>
                      <td className="px-3 py-2 text-xs text-[#6B7280] max-w-[160px] truncate">{a.serviceAddress}</td>
                      <td className="px-3 py-2 font-mono text-xs text-[#ff5722]">{a.bookingId}</td>
                      <td className="px-3 py-2 text-xs">{a.serviceType}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.className}`}>
                          {statusIcon(a)}
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-0.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-md w-fit ${callStatusBadgeClass(a.callStatus)}`}>
                            {a.callStatus}
                          </span>
                          {a.rejectionReason ? (
                            <span className="text-[10px] text-red-600 max-w-[200px] truncate">{a.rejectionReason}</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-[#6B7280] whitespace-nowrap">{formatCreatedAt(a.createdAt)}</td>
                      {showLinkedCol && (
                        <td className="px-3 py-2 text-xs">
                          <div className="flex flex-col gap-1">
                            {a.linkedCarId ? (
                              <Link href={`/cars/${a.linkedCarId}`} className="text-[#1A7A4A] font-mono hover:underline">
                                {a.linkedCarId}
                              </Link>
                            ) : (
                              <span className="text-[#9CA3AF]">No car</span>
                            )}
                            {a.linkedInspectionId ? (
                              <Link
                                href={a.linkedCarId ? `/inspector-app/inspect/${a.linkedCarId}/overview` : '#'}
                                className="text-[#ff8a65] hover:underline"
                              >
                                {a.linkedInspectionId}
                              </Link>
                            ) : (
                              <span className="text-[#9CA3AF]">No inspection</span>
                            )}
                          </div>
                        </td>
                      )}
                      <td className="px-3 py-2 text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          {isAppointmentUnconfirmed(a) && (
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmRow(a);
                                setConfirmCallStatus('Called & Confirmed');
                                setConfirmNotes('');
                              }}
                              className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md bg-[#1A7A4A] text-white hover:bg-[#158f43]"
                            >
                              Confirm now
                            </button>
                          )}
                          <div className="relative">
                            <button
                              type="button"
                              className="p-2 rounded-lg border border-transparent hover:border-[#E5E7EB] hover:bg-[#F4F6F8]"
                              aria-label="Actions"
                              onClick={() => setMenuId(menuId === a.id ? null : a.id)}
                            >
                              <MoreVertical size={16} className="text-[#6B7280]" />
                            </button>
                            {menuId === a.id && (
                              <div className="absolute right-0 z-20 mt-1 w-52 rounded-lg border border-[#E5E7EB] bg-white shadow-lg py-1 text-left">
                                <button
                                  type="button"
                                  className="w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#1A7A4A] hover:bg-[#F4F6F8]"
                                  onClick={() => {
                                    setMenuId(null);
                                    void inspectCar(a);
                                  }}
                                >
                                  Inspect car
                                </button>
                                <Link
                                  href={createCarHref(a)}
                                  className="block w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#1A7A4A] hover:bg-[#F4F6F8]"
                                  onClick={() => setMenuId(null)}
                                >
                                  Create car
                                </Link>
                                <Link
                                  href={`/appointments/${a.id}/edit`}
                                  className="block w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#D35400] hover:bg-[#F4F6F8]"
                                  onClick={() => setMenuId(null)}
                                >
                                  Edit appointment
                                </Link>
                                <button
                                  type="button"
                                  className="w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#C0392B] hover:bg-red-50"
                                  onClick={() => {
                                    setMenuId(null);
                                    setDeleteRow(a);
                                  }}
                                >
                                  Delete appointment
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {!loading && queryFiltered.length > 0 && (
            <div className="px-4 py-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#6B7280]">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-1.5 rounded-lg border border-[#E5E7EB] disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-1.5 rounded-lg border border-[#E5E7EB] disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {confirmRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmRow(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-semibold text-[#1F2937]">Confirm this appointment?</h3>
            <p className="text-sm text-[#6B7280]">
              Booking ID: <span className="font-mono font-semibold text-[#1F2937]">{confirmRow.bookingId}</span>
            </p>
            <p className="text-sm text-[#6B7280]">
              Customer:{' '}
              <strong>
                {confirmRow.firstName} {confirmRow.lastName}
              </strong>{' '}
              — {confirmRow.make} {confirmRow.model} {confirmRow.year}
            </p>
            <p className="text-sm text-[#6B7280]">Slot: {slotLabelForDialog(confirmRow.slot)}</p>
            <div>
              <label className="block text-xs font-semibold mb-1">Call status</label>
              <select
                value={confirmCallStatus}
                onChange={e => setConfirmCallStatus(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm"
              >
                <option value="Called & Confirmed">Called &amp; Confirmed</option>
                <option value="Rescheduled">Rescheduled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Notes (optional)</label>
              <textarea
                value={confirmNotes}
                onChange={e => setConfirmNotes(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm"
                rows={2}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setConfirmRow(null)} className="px-4 py-2 border rounded-lg text-sm">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void runConfirm(confirmRow, confirmCallStatus, confirmNotes)}
                className="px-4 py-2 bg-[#1A7A4A] text-white rounded-lg text-sm font-semibold"
              >
                Confirm appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteRow(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-semibold text-[#C0392B]">Delete appointment?</h3>
            <p className="text-sm text-[#6B7280]">
              Booking ID: <span className="font-mono">{deleteRow.bookingId}</span>
              <br />
              Customer: {deleteRow.firstName} {deleteRow.lastName} — {deleteRow.make} {deleteRow.model}
              <br />
              Slot: {slotLabelForDialog(deleteRow.slot)}
            </p>
            <p className="text-sm text-[#374151]">
              This cannot be undone. If a car record was linked, the car record will <strong>not</strong> be deleted.
            </p>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setDeleteRow(null)} className="px-4 py-2 border rounded-lg text-sm">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void runDelete(deleteRow)}
                className="px-4 py-2 bg-[#C0392B] text-white rounded-lg text-sm font-semibold"
              >
                Delete appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {inspectNoCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setInspectNoCar(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-semibold text-[#1F2937]">No car record found</h3>
            <p className="text-sm text-[#6B7280]">
              VIN: <span className="font-mono">{inspectNoCar.vinNumber}</span>
              <br />
              {inspectNoCar.make} {inspectNoCar.model} {inspectNoCar.year}
            </p>
            <p className="text-sm text-[#374151]">Create a car record first, then start the inspection?</p>
            <div className="flex gap-2 justify-end flex-wrap">
              <button type="button" onClick={() => setInspectNoCar(null)} className="px-4 py-2 border rounded-lg text-sm">
                Cancel
              </button>
              <Link
                href={`${createCarHref(inspectNoCar)}&inspectAfter=1`}
                className="px-4 py-2 bg-[#1A7A4A] text-white rounded-lg text-sm font-semibold inline-flex items-center"
                onClick={() => setInspectNoCar(null)}
              >
                Create car &amp; inspect
              </Link>
            </div>
          </div>
        </div>
      )}
      {bulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setBulkOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-semibold">Confirm {selected.size} appointments?</h3>
            <ul className="text-sm text-[#6B7280] space-y-1 max-h-40 overflow-y-auto font-mono text-xs">
              {[...selected].map(id => {
                const a = rows.find(r => r.id === id);
                return a ? (
                  <li key={id}>
                    {a.bookingId} — {a.firstName} {a.lastName}
                  </li>
                ) : null;
              })}
            </ul>
            <div>
              <label className="block text-xs font-semibold mb-1">Call status for all</label>
              <select
                value={bulkCallStatus}
                onChange={e => setBulkCallStatus(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="Called & Confirmed">Called &amp; Confirmed</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setBulkOpen(false)} className="px-4 py-2 border rounded-lg text-sm">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void bulkConfirm()}
                className="px-4 py-2 bg-[#1A7A4A] text-white rounded-lg text-sm font-semibold"
              >
                Confirm all {selected.size}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
