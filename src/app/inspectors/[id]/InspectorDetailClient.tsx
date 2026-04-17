'use client';
import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname, useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, MapPin, Calendar, BarChart2, Clock } from 'lucide-react';
import { INSPECTORS, ORDERS } from '@/lib/mockData';
import { toast } from 'sonner';

const TABS = ['Overview', 'Schedule', 'Earnings', 'Account'] as const;
const TAB_PARAM = ['overview', 'schedule', 'earnings', 'account'] as const;

export default function InspectorDetailClient() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const inspectorId = params.id as string;
  const inspector = INSPECTORS.find(i => i.id === inspectorId) || INSPECTORS[0];

  const inspectorOrders = ORDERS.filter(o => o.inspectorId === inspector.id);

  const tabFromUrl = useMemo(() => {
    const t = (searchParams.get('tab') || 'overview').toLowerCase();
    const idx = TAB_PARAM.indexOf(t as (typeof TAB_PARAM)[number]);
    return idx >= 0 ? idx : 0;
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const setTab = (i: number) => {
    setActiveTab(i);
    const next = new URLSearchParams(searchParams.toString());
    next.set('tab', TAB_PARAM[i] ?? 'overview');
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <AppLayout currentPath={pathname}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/inspectors" className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E7EB] hover:bg-[#F4F6F8] transition-colors">
            <ArrowLeft size={16} className="text-[#6B7280]" />
          </Link>
          <h1 className="text-xl font-heading font-bold text-[#1F2937]">Inspector Profile</h1>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <div className="flex flex-wrap items-start gap-5">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-[#ff5722] flex items-center justify-center text-white text-2xl font-bold">
                {inspector.avatar}
              </div>
              <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${inspector.status === 'online' ? 'bg-green-500' : inspector.status === 'en-route' ? 'bg-amber-500' : 'bg-gray-400'}`} />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl font-heading font-bold text-[#1F2937]">{inspector.name}</h2>
                <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-semibold">{inspector.certBadge} Inspector</span>
              </div>
              <p className="text-sm text-[#6B7280] mb-3">{inspector.email} · {inspector.phone}</p>
              <div className="flex flex-wrap gap-2">
                {inspector.zone.map(z => (
                  <span key={z} className="flex items-center gap-1 text-xs bg-[#F4F6F8] text-[#6B7280] px-2.5 py-1 rounded-full">
                    <MapPin size={10} /> {z}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Rating', value: inspector.rating, icon: Star, color: 'text-amber-500' },
                { label: 'Total Jobs', value: inspector.totalJobs, icon: BarChart2, color: 'text-[#ff8a65]' },
                { label: 'Avg Score', value: inspector.avgScore, icon: Clock, color: 'text-[#1A7A4A]' },
                { label: 'Today', value: `${inspector.jobsCompleted}/${inspector.jobsToday}`, icon: Calendar, color: 'text-[#D35400]' },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <stat.icon size={18} className={`${stat.color} mx-auto mb-1`} />
                  <p className="text-lg font-bold text-[#1F2937]">{stat.value}</p>
                  <p className="text-xs text-[#6B7280]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-1 border-b border-[#E5E7EB] overflow-x-auto">
          {TABS.map((tab, i) => (
            <button key={tab} onClick={() => setTab(i)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${activeTab === i ? 'border-[#ff5722] text-[#ff5722]' : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 0 && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
              <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Recent Jobs</h3>
              {inspectorOrders.length > 0 ? (
                <div className="space-y-2">
                  {inspectorOrders.map(order => (
                    <Link key={order.id} href={`/orders/${order.id}`}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#F4F6F8] transition-colors">
                      <span className="font-mono text-xs font-semibold text-[#ff8a65]">{order.id}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#1F2937]">{order.vehicle}</p>
                        <p className="text-xs text-[#6B7280]">{order.zone}</p>
                      </div>
                      <span className="text-xs text-[#6B7280]">{new Date(order.scheduledAt).toLocaleDateString('en-NG')}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#6B7280]">No jobs assigned yet</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Weekly Schedule</h3>
            <div className="grid grid-cols-7 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <div key={day} className="text-center">
                  <p className="text-xs font-semibold text-[#6B7280] mb-2">{day}</p>
                  <div className={`h-20 rounded-lg ${i < 5 ? 'bg-[#ff5722]/10 border border-[#ff5722]/20' : 'bg-[#F4F6F8]'} flex items-center justify-center`}>
                    {i < 5 && <span className="text-xs text-[#ff5722] font-medium">Available</span>}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => toast.success('Time-off block added')} className="mt-4 px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F4F6F8] transition-colors">
              + Add Time Off Block
            </button>
          </div>
        )}

        {activeTab === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'This Month', value: '₦125,000', sub: '8 jobs' },
                { label: 'Last Month', value: '₦148,000', sub: '11 jobs' },
                { label: 'YTD', value: '₦892,000', sub: '67 jobs' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                  <p className="text-xs text-[#6B7280] mb-1">{s.label}</p>
                  <p className="text-2xl font-heading font-bold text-[#1F2937]">{s.value}</p>
                  <p className="text-xs text-[#9CA3AF]">{s.sub}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => toast.success('Payslip PDF generated')} className="px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19] transition-all">
                Generate Payslip
              </button>
              <button onClick={() => toast.success('Period marked as paid')} className="px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F4F6F8] transition-colors">
                Mark Period Paid
              </button>
            </div>
          </div>
        )}

        {activeTab === 3 && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Account Settings</h3>
            <div className="space-y-4 max-w-md">
              {[
                { label: 'Full Name', value: inspector.name },
                { label: 'Email', value: inspector.email },
                { label: 'Phone', value: inspector.phone },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">{f.label}</label>
                  <input defaultValue={f.value} className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30" />
                </div>
              ))}
              <button onClick={() => toast.success('Profile updated')} className="px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg hover:bg-[#e64a19] transition-all">
                Save Changes
              </button>
            </div>
            <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
              <h4 className="text-sm font-semibold text-[#C0392B] mb-3">Danger Zone</h4>
              <div className="flex gap-3">
                <button onClick={() => toast.error('Inspector suspended')} className="px-4 py-2.5 border border-[#C0392B] text-[#C0392B] text-sm font-medium rounded-lg hover:bg-red-50 transition-colors">Suspend</button>
                <button onClick={() => toast.error('Inspector deactivated')} className="px-4 py-2.5 bg-[#C0392B] text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">Deactivate</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
