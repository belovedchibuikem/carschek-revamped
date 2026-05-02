'use client';
import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { usePathname, useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Flag } from 'lucide-react';
import { CUSTOMERS } from '@/lib/mockData';
import { toast } from 'sonner';

const TABS = ['Overview', 'Orders', 'Communications', 'Notes'] as const;
const TAB_PARAM = ['overview', 'orders', 'communications', 'notes'] as const;

export default function CustomerDetailClient() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const customerId = params.id as string;
  const customer = CUSTOMERS.find(c => c.id === customerId) || CUSTOMERS[0];

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
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/customers" className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E7EB] hover:bg-[#F4F6F8] transition-colors">
            <ArrowLeft size={16} className="text-[#6B7280]" />
          </Link>
          <h1 className="text-xl font-heading font-bold text-[#1F2937]">Customer Profile</h1>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <div className="flex flex-wrap items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#ff5722] flex items-center justify-center text-white font-bold text-lg">{customer.avatar}</div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-lg font-heading font-bold text-[#1F2937]">{customer.name}</h2>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${customer.status === 'VIP' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{customer.status}</span>
              </div>
              <p className="text-sm text-[#6B7280]">{customer.email} · {customer.phone}</p>
              <p className="text-xs text-[#9CA3AF] mt-1">{customer.city}, {customer.state} · Joined {customer.createdAt}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => toast.success('Flagging customer')} className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-xs font-medium text-[#6B7280] hover:bg-[#F4F6F8] flex items-center gap-1.5">
                <Flag size={12} /> Flag
              </button>
              <button onClick={() => toast.success('NDPC data export downloading')} className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-xs font-medium text-[#6B7280] hover:bg-[#F4F6F8] flex items-center gap-1.5">
                <Download size={12} /> Export Data
              </button>
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Orders', value: customer.orders },
              { label: 'Customer Type', value: customer.type },
              { label: 'Location', value: `${customer.city}, ${customer.state}` },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-[#E5E7EB] p-4">
                <p className="text-xs text-[#6B7280] mb-1">{s.label}</p>
                <p className="text-lg font-bold text-[#1F2937]">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 1 && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Order History</h3>
            <p className="text-sm text-[#6B7280]">{customer.orders} orders placed</p>
          </div>
        )}

        {activeTab === 2 && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Communications</h3>
            <p className="text-sm text-[#6B7280]">No communications logged yet</p>
          </div>
        )}

        {activeTab === 3 && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <h3 className="text-sm font-heading font-semibold text-[#1F2937] mb-4">Notes</h3>
            <p className="text-sm text-[#6B7280]">No notes added yet</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
