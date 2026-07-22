/**
 * Batch 2: orders, detail pages, Topbar, reference, finance, dashboard, cars new/detail
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', 'src');

function rw(rel, transform) {
  const full = path.join(root, rel);
  const before = fs.readFileSync(full, 'utf8');
  const after = transform(before);
  if (after === before) {
    console.log('NOCHANGE', rel);
    return false;
  }
  fs.writeFileSync(full, after);
  console.log('UPDATED', rel);
  return true;
}

function ensureImport(src, importLine) {
  if (src.includes(importLine)) return src;
  const lines = src.split('\n');
  let lastImport = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) lastImport = i;
  }
  lines.splice(lastImport + 1, 0, importLine);
  return lines.join('\n');
}

function stripMockImport(src, names) {
  return src.replace(/import\s*\{([^}]+)\}\s*from\s*'@\/lib\/mockData';/g, (m, inner) => {
    const parts = inner.split(',').map(s => s.trim()).filter(Boolean);
    const kept = parts.filter(p => {
      const name = p.split(/\s+as\s+/)[0].trim();
      return !names.includes(name);
    });
    if (kept.length === 0) return '';
    return `import { ${kept.join(', ')} } from '@/lib/mockData';`;
  });
}

// ── Orders list ─────────────────────────────────────────────────────────────
rw('app/orders/page.tsx', s => {
  s = stripMockImport(s, ['ORDERS', 'INSPECTORS']);
  // ORDERS as ORDERS_SEED
  s = s.replace(/import\s*\{([^}]+)\}\s*from\s*'@\/lib\/mockData';/g, (m, inner) => {
    const parts = inner.split(',').map(x => x.trim()).filter(Boolean);
    const kept = parts.filter(p => {
      const name = p.split(/\s+as\s+/)[0].trim();
      return !['ORDERS', 'INSPECTORS'].includes(name);
    });
    if (kept.length === 0) return '';
    return `import { ${kept.join(', ')} } from '@/lib/mockData';`;
  });
  s = ensureImport(s, "import { ordersApi, inspectorsApi } from '@/lib/api/services';");
  s = ensureImport(s, "import { useApiList } from '@/hooks/useApiResource';");
  s = s.replace(
    "type OrderRow = (typeof ORDERS_SEED)[number];",
    "type OrderRow = Awaited<ReturnType<typeof ordersApi.list>>[number];"
  );
  s = s.replace(
    'const [orders, setOrders] = useState<OrderRow[]>(ORDERS_SEED);',
    `const { data: orders, setData: setOrders, loading, error, refresh } = useApiList(() => ordersApi.list());
  const { data: inspectors } = useApiList(() => inspectorsApi.list());`
  );
  s = s.replace(/\bINSPECTORS\b/g, 'inspectors');
  // wrap assign mutations lightly - leave local state updates; they'll call API where assign happens
  return s;
});

// ── Topbar notifications ────────────────────────────────────────────────────
rw('components/Topbar.tsx', s => {
  s = stripMockImport(s, ['NOTIFICATIONS']);
  s = ensureImport(s, "import { notificationsApi } from '@/lib/api/services';");
  s = s.replace(
    'const [notifications, setNotifications] = useState(NOTIFICATIONS);',
    `const [notifications, setNotifications] = useState<Awaited<ReturnType<typeof notificationsApi.list>>>([]);`
  );
  // insert load effect after mounted effect
  if (!s.includes('notificationsApi.list()')) {
    s = s.replace(
      `useEffect(() => {
    setMounted(true);
  }, []);`,
      `useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void notificationsApi
      .list()
      .then(list => {
        if (!cancelled) setNotifications(list);
      })
      .catch(() => {
        /* keep empty on failure */
      });
    return () => {
      cancelled = true;
    };
  }, []);`
    );
  }
  s = s.replace(
    'const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));',
    `const markAllRead = () => {
    void notificationsApi.markAllRead().catch(() => undefined);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };`
  );
  s = s.replace(
    'const markRead = (id: string) => setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));',
    `const markRead = (id: string) => {
    void notificationsApi.markRead(id).catch(() => undefined);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };`
  );
  return s;
});

// ── Generic detail: load via get(id) ────────────────────────────────────────
function wireDetail(rel, {
  mockNames,
  apiImport,
  apiVar,
  getCall,
  findExpr,
  fallbackExpr,
  entityVar,
}) {
  rw(rel, s => {
    s = stripMockImport(s, mockNames);
    s = ensureImport(s, apiImport);
    s = ensureImport(s, "import { useApiResource } from '@/hooks/useApiResource';");
    // Ensure useEffect/useState available
    if (!s.includes('useEffect') && s.includes("from 'react'")) {
      s = s.replace(/import React,\s*\{([^}]+)\}\s*from 'react'/, (m, inner) => {
        const parts = inner.split(',').map(x => x.trim()).filter(Boolean);
        if (!parts.includes('useEffect')) parts.push('useEffect');
        if (!parts.includes('useState')) parts.push('useState');
        return `import React, { ${parts.join(', ')} } from 'react'`;
      });
    }
    // Replace sync find with resource hook — patterns vary; do targeted replace of the find line
    if (s.includes(findExpr) && !s.includes(getCall)) {
      s = s.replace(
        findExpr,
        `${entityVar}Raw = null as any; // wired below\n  const __unused = null;\n  // PLACEHOLDER`
      );
      // Better approach: inject after id extraction
    }
    return s;
  });
}

// Manual detail rewrites via string patterns

rw('app/orders/[id]/page.tsx', s => {
  s = stripMockImport(s, ['ORDERS']);
  s = ensureImport(s, "import { ordersApi, inspectorsApi } from '@/lib/api/services';");
  s = ensureImport(s, "import { useApiResource, useApiList } from '@/hooks/useApiResource';");
  s = s.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';");
  if (!s.includes('ordersApi.get')) {
    s = s.replace(
      `export default function OrderDetailPage() {
  const pathname = usePathname();
  const params = useParams();
  const orderId = params.id as string;
  const order = ORDERS.find(o => o.id === orderId) || ORDERS[0];
  const [reassignModal, setReassignModal] = useState(false);`,
      `export default function OrderDetailPage() {
  const pathname = usePathname();
  const params = useParams();
  const orderId = params.id as string;
  const { data: order, loading, error } = useApiResource(() => ordersApi.get(orderId), [orderId]);
  const { data: inspectors } = useApiList(() => inspectorsApi.list());
  const [reassignModal, setReassignModal] = useState(false);

  if (loading) {
    return (
      <AppLayout currentPath={pathname}>
        <div className="p-8 text-sm text-[#6B7280]">Loading order…</div>
      </AppLayout>
    );
  }
  if (error || !order) {
    return (
      <AppLayout currentPath={pathname}>
        <div className="p-8 text-sm text-red-700">{error || 'Order not found'}</div>
      </AppLayout>
    );
  }`
    );
  }
  return s;
});

rw('app/reports/[id]/page.tsx', s => {
  s = stripMockImport(s, ['REPORTS']);
  s = ensureImport(s, "import { reportsApi } from '@/lib/api/services';");
  s = ensureImport(s, "import { useApiResource } from '@/hooks/useApiResource';");
  if (s.includes('REPORTS.find') && !s.includes('reportsApi.get')) {
    s = s.replace(
      /const report = REPORTS\.find\([^)]+\)[^\n]*/,
      `const { data: report, loading, error } = useApiResource(() => reportsApi.get(params.id as string), [params.id]);
  if (loading) return <AppLayout currentPath={pathname}><div className="p-8 text-sm text-[#6B7280]">Loading report…</div></AppLayout>;
  if (error || !report) return <AppLayout currentPath={pathname}><div className="p-8 text-sm text-red-700">{error || 'Report not found'}</div></AppLayout>;`
    );
  }
  // try alternate patterns
  s = s.replace(/\bREPORTS\b/g, (m) => {
    // don't break if already converted
    return m;
  });
  return s;
});

rw('app/offers/[id]/page.tsx', s => {
  s = stripMockImport(s, ['OFFERS']);
  s = ensureImport(s, "import { offersApi } from '@/lib/api/services';");
  s = ensureImport(s, "import { useApiResource } from '@/hooks/useApiResource';");
  if (s.includes('OFFERS.find') && !s.includes('offersApi.get')) {
    s = s.replace(
      /const offer = OFFERS\.find\([^)]+\)[^\n]*/,
      `const { data: offer, loading, error } = useApiResource(() => offersApi.get(params.id as string), [params.id]);
  if (loading) return <AppLayout currentPath={pathname}><div className="p-8 text-sm text-[#6B7280]">Loading offer…</div></AppLayout>;
  if (error || !offer) return <AppLayout currentPath={pathname}><div className="p-8 text-sm text-red-700">{error || 'Offer not found'}</div></AppLayout>;`
    );
  }
  return s;
});

rw('app/deals/[id]/page.tsx', s => {
  s = stripMockImport(s, ['DEALS']);
  s = ensureImport(s, "import { dealsApi } from '@/lib/api/services';");
  s = ensureImport(s, "import { useApiResource } from '@/hooks/useApiResource';");
  if (s.includes('DEALS.find') && !s.includes('dealsApi.get')) {
    s = s.replace(
      /const deal = DEALS\.find\([^)]+\)[^\n]*/,
      `const { data: deal, loading, error } = useApiResource(() => dealsApi.get(params.id as string), [params.id]);
  if (loading) return <AppLayout currentPath={pathname}><div className="p-8 text-sm text-[#6B7280]">Loading deal…</div></AppLayout>;
  if (error || !deal) return <AppLayout currentPath={pathname}><div className="p-8 text-sm text-red-700">{error || 'Deal not found'}</div></AppLayout>;`
    );
  }
  return s;
});

rw('app/listings/[id]/page.tsx', s => {
  s = stripMockImport(s, ['LISTINGS']);
  s = ensureImport(s, "import { listingsApi } from '@/lib/api/services';");
  s = ensureImport(s, "import { useApiResource } from '@/hooks/useApiResource';");
  if (s.includes('LISTINGS.find') && !s.includes('listingsApi.get')) {
    s = s.replace(
      /const listing = LISTINGS\.find\([^)]+\)[^\n]*/,
      `const { data: listing, loading, error } = useApiResource(() => listingsApi.get(params.id as string), [params.id]);
  if (loading) return <AppLayout currentPath={pathname}><div className="p-8 text-sm text-[#6B7280]">Loading listing…</div></AppLayout>;
  if (error || !listing) return <AppLayout currentPath={pathname}><div className="p-8 text-sm text-red-700">{error || 'Listing not found'}</div></AppLayout>;`
    );
  }
  return s;
});

rw('app/auctions/[id]/page.tsx', s => {
  s = stripMockImport(s, ['AUCTIONS']);
  s = ensureImport(s, "import { auctionsApi } from '@/lib/api/services';");
  s = ensureImport(s, "import { useApiResource } from '@/hooks/useApiResource';");
  if (s.includes('AUCTIONS.find') && !s.includes('auctionsApi.get')) {
    s = s.replace(
      /const auction = AUCTIONS\.find\([^)]+\)[^\n]*/,
      `const { data: auction, loading, error } = useApiResource(() => auctionsApi.get(params.id as string), [params.id]);
  if (loading) return <AppLayout currentPath={pathname}><div className="p-8 text-sm text-[#6B7280]">Loading auction…</div></AppLayout>;
  if (error || !auction) return <AppLayout currentPath={pathname}><div className="p-8 text-sm text-red-700">{error || 'Auction not found'}</div></AppLayout>;`
    );
  }
  return s;
});

rw('app/crm/[id]/page.tsx', s => {
  s = stripMockImport(s, ['CRM_CONTACTS', 'OFFERS']);
  s = ensureImport(s, "import { crmApi, offersApi } from '@/lib/api/services';");
  s = ensureImport(s, "import { useApiResource, useApiList } from '@/hooks/useApiResource';");
  if (s.includes('CRM_CONTACTS.find') && !s.includes('crmApi.get')) {
    s = s.replace(
      /const contact = CRM_CONTACTS\.find\([^)]+\)[^\n]*/,
      `const { data: contact, loading, error } = useApiResource(() => crmApi.get(params.id as string), [params.id]);
  const { data: offers } = useApiList(() => offersApi.list());
  if (loading) return <AppLayout currentPath={pathname}><div className="p-8 text-sm text-[#6B7280]">Loading contact…</div></AppLayout>;
  if (error || !contact) return <AppLayout currentPath={pathname}><div className="p-8 text-sm text-red-700">{error || 'Contact not found'}</div></AppLayout>;`
    );
  }
  s = s.replace(/\bOFFERS\b/g, 'offers');
  return s;
});

rw('app/customers/[id]/CustomerDetailClient.tsx', s => {
  s = stripMockImport(s, ['CUSTOMERS']);
  s = ensureImport(s, "import { customersApi } from '@/lib/api/services';");
  s = ensureImport(s, "import { useApiResource } from '@/hooks/useApiResource';");
  if (s.includes('CUSTOMERS.find') && !s.includes('customersApi.get')) {
    s = s.replace(
      /const customer = CUSTOMERS\.find\([^)]+\)[^\n]*/,
      `const { data: customer, loading, error } = useApiResource(() => customersApi.get(customerId), [customerId]);
  if (loading) return <div className="p-8 text-sm text-[#6B7280]">Loading customer…</div>;
  if (error || !customer) return <div className="p-8 text-sm text-red-700">{error || 'Customer not found'}</div>;`
    );
  }
  return s;
});

rw('app/inspectors/[id]/InspectorDetailClient.tsx', s => {
  s = stripMockImport(s, ['INSPECTORS', 'ORDERS']);
  s = ensureImport(s, "import { inspectorsApi } from '@/lib/api/services';");
  s = ensureImport(s, "import { useApiResource } from '@/hooks/useApiResource';");
  if (s.includes('INSPECTORS.find') && !s.includes('inspectorsApi.get')) {
    s = s.replace(
      /const inspector = INSPECTORS\.find\([^)]+\)[^\n]*/,
      `const { data: inspector, loading, error } = useApiResource(() => inspectorsApi.get(inspectorId), [inspectorId]);
  const { data: jobs } = useApiResource(async () => (inspectorId ? ((await inspectorsApi.jobs(inspectorId)) as unknown[]) : []), [inspectorId]);
  if (loading) return <div className="p-8 text-sm text-[#6B7280]">Loading inspector…</div>;
  if (error || !inspector) return <div className="p-8 text-sm text-red-700">{error || 'Inspector not found'}</div>;`
    );
  }
  // replace ORDERS.filter usages for jobs if present
  s = s.replace(/ORDERS\.filter\([^)]+\)[^\n]*/g, 'jobs ?? []');
  return s;
});

rw('app/reports/[id]/review/page.tsx', s => {
  s = stripMockImport(s, ['REPORTS']);
  s = ensureImport(s, "import { reportsApi } from '@/lib/api/services';");
  s = ensureImport(s, "import { useApiResource } from '@/hooks/useApiResource';");
  if (s.includes('REPORTS.find') && !s.includes('reportsApi.get')) {
    s = s.replace(
      /const report = REPORTS\.find\([^)]+\)[^\n]*/,
      `const { data: report, loading, error } = useApiResource(() => reportsApi.get(params.id as string), [params.id]);
  if (loading) return <AppLayout currentPath={pathname}><div className="p-8 text-sm text-[#6B7280]">Loading report…</div></AppLayout>;
  if (error || !report) return <AppLayout currentPath={pathname}><div className="p-8 text-sm text-red-700">{error || 'Report not found'}</div></AppLayout>;`
    );
  }
  return s;
});

console.log('Batch 2 complete');
