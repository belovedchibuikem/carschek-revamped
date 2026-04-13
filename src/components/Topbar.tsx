'use client';
import React, { useState } from 'react';
import { Search, Bell, Menu, Wifi, WifiOff, ChevronDown, X } from 'lucide-react';

interface TopbarProps {
  onMenuToggle: () => void;
  mobileSidebarOpen?: boolean;
}

export default function Topbar({ onMenuToggle, mobileSidebarOpen }: TopbarProps) {
  const [online] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center px-3 sm:px-6 gap-2 sm:gap-4 flex-shrink-0 z-30 relative">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuToggle}
        className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
        aria-label="Toggle menu"
      >
        {mobileSidebarOpen ? (
          <X size={20} className="text-[#6B7280]" />
        ) : (
          <Menu size={20} className="text-[#6B7280]" />
        )}
      </button>

      {/* Search — hidden on mobile, shown when searchOpen */}
      <div className={`${searchOpen ? 'flex absolute inset-x-0 top-0 h-16 bg-white px-4 z-10 items-center gap-2' : 'hidden sm:flex'} flex-1 max-w-md`}>
        {searchOpen && (
          <button
            onClick={() => setSearchOpen(false)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X size={20} className="text-[#6B7280]" />
          </button>
        )}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search orders, customers, plates…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-[#F4F6F8] border border-[#E5E7EB] rounded-lg text-[#1F2937] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 focus:border-[#2E75B6] transition-all"
          />
        </div>
      </div>

      {/* Mobile search trigger */}
      {!searchOpen && (
        <button
          onClick={() => setSearchOpen(true)}
          className="sm:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Search"
        >
          <Search size={20} className="text-[#6B7280]" />
        </button>
      )}

      <div className="flex items-center gap-1 sm:gap-3 ml-auto">
        {/* Online status — hidden on smallest screens */}
        <div className={`hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${online ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {online ? <Wifi size={12} /> : <WifiOff size={12} />}
          <span>{online ? 'Online' : 'Offline'}</span>
        </div>
        {/* Mobile online dot */}
        <div className={`sm:hidden w-2.5 h-2.5 rounded-full flex-shrink-0 ${online ? 'bg-green-500' : 'bg-red-500'}`} />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(o => !o)}
            className="relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-[#F4F6F8] transition-colors"
            aria-label="Notifications"
          >
            <Bell size={18} className="text-[#6B7280]" />
            <span className="absolute top-2 right-2 w-4 h-4 bg-[#C0392B] rounded-full text-white text-[9px] font-bold flex items-center justify-center">8</span>
          </button>
          {notifOpen && (
            <>
              {/* Mobile backdrop */}
              <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-[calc(100vw-24px)] sm:w-80 max-w-sm bg-white rounded-xl shadow-xl border border-[#E5E7EB] z-50 animate-fade-in">
                <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-[#1F2937]">Notifications</h3>
                  <button onClick={() => setNotifOpen(false)} className="min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg hover:bg-gray-100">
                    <X size={16} className="text-[#6B7280]" />
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {[
                    { text: 'Order #1892 stuck in QA for 2h 30m', time: '2m ago', type: 'danger' },
                    { text: 'Inspector Emeka O. completed 5 jobs today', time: '15m ago', type: 'success' },
                    { text: 'New booking from Adaeze M. — Lagos Island', time: '32m ago', type: 'info' },
                    { text: 'Report #445 approved by QA team', time: '1h ago', type: 'success' },
                  ].map((n, i) => (
                    <div key={`notif-${i}`} className="px-4 py-3 hover:bg-[#F4F6F8] cursor-pointer border-b border-[#E5E7EB] last:border-0 min-h-[56px] flex items-start">
                      <div className="flex items-start gap-3 w-full">
                        <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === 'danger' ? 'bg-[#C0392B]' : n.type === 'success' ? 'bg-[#1A7A4A]' : 'bg-[#2E75B6]'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-[#1F2937]">{n.text}</p>
                          <p className="text-[10px] text-[#6B7280] mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User */}
        <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-[#E5E7EB] cursor-pointer group min-h-[44px]">
          <div className="w-8 h-8 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">PN</div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-[#1F2937]">Promise Ndem</p>
            <p className="text-[10px] text-[#6B7280]">Super Admin</p>
          </div>
          <ChevronDown size={14} className="hidden sm:block text-[#6B7280] group-hover:text-[#1F2937] transition-colors" />
        </div>
      </div>
    </header>
  );
}