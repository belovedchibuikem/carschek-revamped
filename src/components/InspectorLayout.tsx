'use client';
import React from 'react';
import Link from 'next/link';
import { Home, Bell, User } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface InspectorLayoutProps {
  children: React.ReactNode;
}

export default function InspectorLayout({ children }: InspectorLayoutProps) {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: 'Jobs', href: '/inspector/jobs' },
    { icon: Bell, label: 'Alerts', href: '/inspector/notifications' },
    { icon: User, label: 'Profile', href: '/inspector/profile' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col max-w-md mx-auto relative">
      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {children}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-[#E5E7EB] z-50">
        <div className="flex items-center justify-around px-4 py-2">
          {navItems.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all min-w-[64px] ${active ? 'text-[#1E3A5F]' : 'text-[#9CA3AF]'}`}>
                <item.icon size={22} className={active ? 'text-[#1E3A5F]' : 'text-[#9CA3AF]'} />
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
