'use client';
import React from 'react';
import Link from 'next/link';
import { Home, Bell, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useInspectorBasePath } from '@/contexts/InspectorRouteContext';

interface InspectorLayoutProps {
  children: React.ReactNode;
}

export default function InspectorLayout({ children }: InspectorLayoutProps) {
  const pathname = usePathname();
  const base = useInspectorBasePath();

  const navItems = [
    { icon: Home, label: 'Jobs', href: `${base}/jobs` },
    { icon: Bell, label: 'Alerts', href: `${base}/notifications` },
    { icon: User, label: 'Profile', href: `${base}/profile` },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col max-w-md mx-auto relative">
      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
        {children}
      </div>

      {/* Bottom nav — keep in sync with SectionChecklistScreen tab bar offset (5rem + safe area) */}
      <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-[#E5E7EB] bg-white pb-[env(safe-area-inset-bottom,0px)]">
        <div className="flex items-center justify-around px-4 py-2">
          {navItems.map(item => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all min-w-[64px] ${active ? 'text-[#ff5722]' : 'text-[#9CA3AF]'}`}>
                <item.icon size={22} className={active ? 'text-[#ff5722]' : 'text-[#9CA3AF]'} />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            );
          })}
          <div className="flex flex-col items-center gap-1 px-4 py-2">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
            <span className="text-[10px] font-semibold text-[#9CA3AF]">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}
