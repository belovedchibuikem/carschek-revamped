'use client';
import React, { useEffect, useState } from 'react';
import InspectorLayout from '@/components/InspectorLayout';
import { notificationsApi } from '@/lib/api/services';
import { toast } from 'sonner';

type Notif = Awaited<ReturnType<typeof notificationsApi.list>>[number];

export default function InspectorNotificationsPage() {
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void notificationsApi
      .list()
      .then(list => {
        if (cancelled) return;
        setItems(list.filter(n => n?.type === 'order' || n?.type === 'system'));
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load notifications');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const markRead = async (id: string) => {
    setItems(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    try {
      await notificationsApi.markRead(id);
    } catch {
      /* keep optimistic */
    }
  };

  return (
    <InspectorLayout>
      <div className="p-4 space-y-4">
        <h1 className="text-xl font-heading font-bold text-[#1F2937]">Notifications</h1>
        {loading && <p className="text-sm text-[#6B7280]">Loading…</p>}
        {!loading && items.length === 0 && (
          <p className="text-sm text-[#6B7280]">No notifications yet.</p>
        )}
        <div className="space-y-2">
          {items.map(n => (
            <button
              key={n.id}
              type="button"
              onClick={() => void markRead(n.id)}
              className={`w-full text-left bg-white rounded-2xl border p-4 ${!n.read ? 'border-[#ff8a65] bg-blue-50/30' : 'border-[#E5E7EB]'}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{n.type === 'order' ? '📋' : '⚙️'}</span>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${!n.read ? 'text-[#1F2937]' : 'text-[#6B7280]'}`}>{n.title}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{n.description}</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">{n.time}</p>
                </div>
                {!n.read && <span className="w-2.5 h-2.5 bg-[#ff8a65] rounded-full flex-shrink-0 mt-1" />}
              </div>
            </button>
          ))}
        </div>
      </div>
    </InspectorLayout>
  );
}
