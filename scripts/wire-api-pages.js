/**
 * One-shot converter: wire priority list/detail pages to @/lib/api/services.
 * Run: node scripts/wire-api-pages.js
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
  // Remove named imports from mockData if only those remain; keep utils.
  return src.replace(
    /import\s*\{([^}]+)\}\s*from\s*'@\/lib\/mockData';/g,
    (m, inner) => {
      const parts = inner.split(',').map(s => s.trim()).filter(Boolean);
      const kept = parts.filter(p => {
        const name = p.split(/\s+as\s+/)[0].trim();
        return !names.includes(name);
      });
      if (kept.length === 0) return '';
      return `import { ${kept.join(', ')} } from '@/lib/mockData';`;
    }
  );
}

// ── Customers list ──────────────────────────────────────────────────────────
rw('app/customers/page.tsx', s => {
  s = stripMockImport(s, ['CUSTOMERS']);
  s = ensureImport(s, "import { customersApi } from '@/lib/api/services';");
  s = ensureImport(s, "import { useApiList } from '@/hooks/useApiResource';");
  s = s.replace(
    'const [rows, setRows] = useState(CUSTOMERS);',
    `const { data: rows, setData: setRows, loading, error, refresh } = useApiList(() => customersApi.list());
  const [saving, setSaving] = useState(false);`
  );
  s = s.replace(
    /const handleAdd = \(\) => \{[\s\S]*?setNewCustomer\(\{ name: '', email: '', phone: '', type: 'Individual', city: '', state: '' \}\);\n  \};/,
    `const handleAdd = async () => {
    if (!newCustomer.name || !newCustomer.email) {
      toast.error('Name and email are required');
      return;
    }
    const emailLower = newCustomer.email.trim().toLowerCase();
    if (rows.some(c => c.email.toLowerCase() === emailLower)) {
      toast.error('Duplicate email — a customer with this address already exists');
      return;
    }
    setSaving(true);
    try {
      const created = await customersApi.create({
        name: newCustomer.name.trim(),
        email: emailLower,
        phone: newCustomer.phone.trim() || '—',
        type: newCustomer.type,
        city: newCustomer.city.trim() || 'Lagos',
        state: newCustomer.state.trim() || 'Lagos',
        status: 'Active',
        avatar: newCustomer.name.trim().slice(0, 2).toUpperCase(),
      });
      setRows(prev => [...prev, created]);
      toast.success(\`Customer "\${newCustomer.name}" added\`);
      setShowAddModal(false);
      setNewCustomer({ name: '', email: '', phone: '', type: 'Individual', city: '', state: '' });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not add customer');
    } finally {
      setSaving(false);
    }
  };`
  );
  s = s.replace(
    '<p className="text-sm text-[#6B7280]">{rows.length} customers</p>',
    '<p className="text-sm text-[#6B7280]">{loading ? \'Loading…\' : `${rows.length} customers`}</p>'
  );
  s = s.replace(
    '{filtered.length === 0 ? (',
    `{error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex justify-between gap-3">
            <p className="text-sm text-red-700">{error}</p>
            <button type="button" onClick={() => void refresh()} className="text-sm font-semibold text-red-700 underline">Retry</button>
          </div>
        )}
        {loading ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-sm text-[#6B7280]">Loading customers…</div>
        ) : filtered.length === 0 ? (`
  );
  s = s.replace(
    'onClick={handleAdd} className="flex-1 px-4 py-2.5 bg-[#ff5722] text-white rounded-lg text-sm font-semibold hover:bg-[#e64a19]">Add Customer</button>',
    'onClick={() => void handleAdd()} disabled={saving} className="flex-1 px-4 py-2.5 bg-[#ff5722] text-white rounded-lg text-sm font-semibold hover:bg-[#e64a19] disabled:opacity-60">{saving ? \'Saving…\' : \'Add Customer\'}</button>'
  );
  return s;
});

// ── Inspectors list ─────────────────────────────────────────────────────────
rw('app/inspectors/page.tsx', s => {
  s = s.replace("import React, { useMemo, useState } from 'react';", "import React, { useMemo, useState } from 'react';");
  s = stripMockImport(s, ['INSPECTORS']);
  s = ensureImport(s, "import { inspectorsApi } from '@/lib/api/services';");
  s = ensureImport(s, "import { useApiList } from '@/hooks/useApiResource';");
  s = s.replace(
    `export default function InspectorsPage() {
  const pathname = usePathname();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    return INSPECTORS.filter(`,
    `export default function InspectorsPage() {
  const pathname = usePathname();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const { data: inspectors, loading, error, refresh } = useApiList(() => inspectorsApi.list());

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    return inspectors.filter(`
  );
  s = s.replace(
    '  }, [debouncedSearch]);',
    '  }, [debouncedSearch, inspectors]);'
  );
  s = s.replace(
    '{INSPECTORS.filter(i => i.status === \'online\').length}/{INSPECTORS.length} online',
    '{loading ? \'…\' : `${inspectors.filter(i => i.status === \'online\').length}/${inspectors.length}`} online'
  );
  s = s.replace(
    '{filtered.length === 0 ? (',
    `{error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex justify-between gap-3">
            <p className="text-sm text-red-700">{error}</p>
            <button type="button" onClick={() => void refresh()} className="text-sm font-semibold text-red-700 underline">Retry</button>
          </div>
        )}
        {loading ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-sm text-[#6B7280]">Loading inspectors…</div>
        ) : filtered.length === 0 ? (`
  );
  return s;
});

// ── Offers list ─────────────────────────────────────────────────────────────
rw('app/offers/page.tsx', s => {
  s = stripMockImport(s, ['OFFERS']);
  s = ensureImport(s, "import { offersApi } from '@/lib/api/services';");
  s = ensureImport(s, "import { useApiList } from '@/hooks/useApiResource';");
  s = s.replace(
    `export default function OffersPage() {
  const pathname = usePathname();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = useMemo(() => {
    return OFFERS?.filter(o => {`,
    `export default function OffersPage() {
  const pathname = usePathname();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [statusFilter, setStatusFilter] = useState('');
  const { data: offers, loading, error, refresh } = useApiList(() => offersApi.list());

  const filtered = useMemo(() => {
    return offers?.filter(o => {`
  );
  s = s.replace(
    '  }, [debouncedSearch, statusFilter]);',
    '  }, [debouncedSearch, statusFilter, offers]);'
  );
  s = s.replace(
    'const statusOptions = [...new Set(OFFERS.map(o => o.status))];',
    'const statusOptions = [...new Set(offers.map(o => o.status))];'
  );
  s = s.replace(
    '{OFFERS?.length} offers total',
    '{loading ? \'…\' : `${offers?.length ?? 0}`} offers total'
  );
  s = s.replace(
    '{filtered?.length === 0 ? (',
    `{error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex justify-between gap-3">
            <p className="text-sm text-red-700">{error}</p>
            <button type="button" onClick={() => void refresh()} className="text-sm font-semibold text-red-700 underline">Retry</button>
          </div>
        )}
        {loading ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-sm text-[#6B7280]">Loading offers…</div>
        ) : filtered?.length === 0 ? (`
  );
  return s;
});

// ── Deals list ──────────────────────────────────────────────────────────────
rw('app/deals/page.tsx', s => {
  s = stripMockImport(s, ['DEALS']);
  s = ensureImport(s, "import { dealsApi } from '@/lib/api/services';");
  s = ensureImport(s, "import { useApiList } from '@/hooks/useApiResource';");
  if (!s.includes('useApiList')) return s;
  // generic: if still uses DEALS constant for primary data
  if (s.includes('DEALS.filter') || s.includes('useState(DEALS)') || s.includes('DEALS.map') || s.includes('DEALS.length')) {
    s = s.replace(
      /export default function DealsPage\(\) \{[\s\S]*?const pathname = usePathname\(\);/,
      match => match
    );
    // Insert hook after pathname
    if (!s.includes('dealsApi.list')) {
      s = s.replace(
        'const pathname = usePathname();',
        `const pathname = usePathname();
  const { data: deals, setData: setDeals, loading, error, refresh } = useApiList(() => dealsApi.list());`
      );
    }
    s = s.replace(/\bDEALS\b/g, 'deals');
  }
  return s;
});

// ── Listings list ───────────────────────────────────────────────────────────
rw('app/listings/page.tsx', s => {
  s = stripMockImport(s, ['LISTINGS']);
  s = ensureImport(s, "import { listingsApi } from '@/lib/api/services';");
  s = ensureImport(s, "import { useApiList } from '@/hooks/useApiResource';");
  if (!s.includes('listingsApi.list')) {
    s = s.replace(
      'const pathname = usePathname();',
      `const pathname = usePathname();
  const { data: listings, setData: setListings, loading, error, refresh } = useApiList(() => listingsApi.list());`
    );
  }
  s = s.replace(/\bLISTINGS\b/g, 'listings');
  return s;
});

// ── Auctions list ───────────────────────────────────────────────────────────
rw('app/auctions/page.tsx', s => {
  s = stripMockImport(s, ['AUCTIONS']);
  s = ensureImport(s, "import { auctionsApi } from '@/lib/api/services';");
  s = ensureImport(s, "import { useApiList } from '@/hooks/useApiResource';");
  if (!s.includes('auctionsApi.list')) {
    s = s.replace(
      'const pathname = usePathname();',
      `const pathname = usePathname();
  const { data: auctions, setData: setAuctions, loading, error, refresh } = useApiList(() => auctionsApi.list());`
    );
  }
  s = s.replace(/\bAUCTIONS\b/g, 'auctions');
  return s;
});

// ── CRM list ────────────────────────────────────────────────────────────────
rw('app/crm/page.tsx', s => {
  s = stripMockImport(s, ['CRM_CONTACTS']);
  s = ensureImport(s, "import { crmApi } from '@/lib/api/services';");
  s = ensureImport(s, "import { useApiList } from '@/hooks/useApiResource';");
  if (!s.includes('crmApi.list')) {
    s = s.replace(
      'const pathname = usePathname();',
      `const pathname = usePathname();
  const { data: contacts, setData: setContacts, loading, error, refresh } = useApiList(() => crmApi.list());`
    );
  }
  s = s.replace(/\bCRM_CONTACTS\b/g, 'contacts');
  // fix handleAdd to call API
  s = s.replace(
    /const handleAdd = \(\) => \{[\s\S]*?setNewContact\(\{ name: '', email: '', phone: '', type: 'Individual', stage: 'Lead' \}\);\n  \};/,
    `const handleAdd = async () => {
    if (!newContact.name || !newContact.email) { toast.error('Name and email are required'); return; }
    try {
      const created = await crmApi.create(newContact);
      setContacts(prev => [...prev, created]);
      toast.success(\`Contact "\${newContact.name}" added to CRM\`);
      setShowAddModal(false);
      setNewContact({ name: '', email: '', phone: '', type: 'Individual', stage: 'Lead' });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not add contact');
    }
  };`
  );
  return s;
});

// ── Users list ──────────────────────────────────────────────────────────────
rw('app/users/page.tsx', s => {
  s = stripMockImport(s, ['USERS']);
  s = ensureImport(s, "import { usersApi } from '@/lib/api/services';");
  s = ensureImport(s, "import { useApiList } from '@/hooks/useApiResource';");
  if (!s.includes('usersApi.list')) {
    s = s.replace(
      'const pathname = usePathname();',
      `const pathname = usePathname();
  const { data: users, loading, error, refresh } = useApiList(() => usersApi.list());`
    );
  }
  s = s.replace(/\bUSERS\b/g, 'users');
  return s;
});

// ── Notifications ───────────────────────────────────────────────────────────
rw('app/notifications/page.tsx', s => {
  s = stripMockImport(s, ['NOTIFICATIONS']);
  s = ensureImport(s, "import { notificationsApi } from '@/lib/api/services';");
  s = ensureImport(s, "import { useApiList } from '@/hooks/useApiResource';");
  s = s.replace(
    'const [notifications, setNotifications] = useState(NOTIFICATIONS);',
    `const { data: notifications, setData: setNotifications, loading, error, refresh } = useApiList(() => notificationsApi.list());`
  );
  s = s.replace(
    /const markAllRead = \(\) => \{[\s\S]*?toast\.success\('All notifications marked as read'\);\n  \};/,
    `const markAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not mark all read');
    }
  };`
  );
  s = s.replace(
    /const markRead = \(id: string\) => \{[\s\S]*?\};/,
    `const markRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {
      /* ignore */
    }
  };`
  );
  return s;
});

// ── Activity ────────────────────────────────────────────────────────────────
rw('app/activity/page.tsx', s => {
  s = stripMockImport(s, ['ACTIVITY_LOG']);
  s = ensureImport(s, "import { activityApi } from '@/lib/api/services';");
  s = ensureImport(s, "import { useApiList } from '@/hooks/useApiResource';");
  if (!s.includes('activityApi.list')) {
    s = s.replace(
      'const pathname = usePathname();',
      `const pathname = usePathname();
  const { data: activityLog, loading, error, refresh } = useApiList(() => activityApi.list());`
    );
  }
  s = s.replace(/\bACTIVITY_LOG\b/g, 'activityLog');
  return s;
});

// ── Reports client ──────────────────────────────────────────────────────────
rw('app/reports/ReportsClient.tsx', s => {
  s = stripMockImport(s, ['REPORTS']);
  s = ensureImport(s, "import { reportsApi } from '@/lib/api/services';");
  s = ensureImport(s, "import { useApiList } from '@/hooks/useApiResource';");
  if (!s.includes('reportsApi.list')) {
    s = s.replace(
      'const pathname = usePathname();',
      `const pathname = usePathname();
  const { data: reports, loading, error, refresh } = useApiList(() => reportsApi.list());`
    );
  }
  s = s.replace(/\bREPORTS\b/g, 'reports');
  return s;
});

console.log('Batch 1 complete');
