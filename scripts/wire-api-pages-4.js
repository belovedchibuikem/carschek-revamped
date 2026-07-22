const fs = require('fs');

// offers/new
{
  const p = 'c:/wamp64/www/carschek-main/src/app/offers/new/page.tsx';
  let s = fs.readFileSync(p, 'utf8');
  s = s.replace(
    "import { CARS, CRM_CONTACTS, formatNaira } from '@/lib/mockData';",
    `import { formatNaira } from '@/lib/mockData';
import { carsApi, crmApi, offersApi } from '@/lib/api/services';
import { useApiList } from '@/hooks/useApiResource';`
  );
  if (!s.includes('carsApi.list')) {
    s = s.replace(
      /const pathname = usePathname\(\);/,
      `const pathname = usePathname();
  const { data: cars } = useApiList(() => carsApi.list());
  const { data: contacts } = useApiList(() => crmApi.list());`
    );
  }
  s = s.replace(/\bCARS\b/g, 'cars');
  s = s.replace(/\bCRM_CONTACTS\b/g, 'contacts');
  // wire create if toast-only submit exists
  if (s.includes('offersApi') === false) {
    // already imported
  }
  fs.writeFileSync(p, s);
  console.log('offers/new');
}

// AppointmentForm
{
  const p = 'c:/wamp64/www/carschek-main/src/components/appointments/AppointmentForm.tsx';
  let s = fs.readFileSync(p, 'utf8');
  s = s.replace("import { BRANDS, MODELS } from '@/lib/mockData';\nimport { CARS } from '@/lib/mockData';", '');
  s = s.replace("import { BRANDS, MODELS } from '@/lib/mockData';", '');
  s = s.replace("import { CARS } from '@/lib/mockData';", '');
  if (!s.includes('carsApi')) {
    s = s.replace(
      /import .+ from '@\/lib\/api\/services';/,
      m => m
    );
    if (!s.includes("from '@/lib/api/services'")) {
      s = s.replace(
        /^('use client';\n)/,
        `$1import { carsApi } from '@/lib/api/services';\nimport { useApiList } from '@/hooks/useApiResource';\nimport { hydrateReferenceCache, getCachedBrands, getCachedModels } from '@/lib/reference/referenceCache';\n`
      );
    } else {
      s = s.replace(
        "from '@/lib/api/services';",
        "from '@/lib/api/services';\nimport { useApiList } from '@/hooks/useApiResource';\nimport { hydrateReferenceCache, getCachedBrands, getCachedModels } from '@/lib/reference/referenceCache';"
      );
      // might duplicate - check
    }
  }
  // Ensure imports present cleanly
  if (!s.includes('useApiList')) {
    const lines = s.split('\n');
    let i = 0;
    while (i < lines.length && (lines[i].startsWith('import ') || lines[i].startsWith("'use client'") || lines[i] === '')) i++;
    lines.splice(i, 0,
      "import { carsApi } from '@/lib/api/services';",
      "import { useApiList } from '@/hooks/useApiResource';",
      "import { hydrateReferenceCache, getCachedBrands, getCachedModels } from '@/lib/reference/referenceCache';"
    );
    s = lines.join('\n');
  }
  if (!s.includes('carsApi.list')) {
    // find component function start and inject
    s = s.replace(
      /(export default function AppointmentForm[^{]*\{)/,
      `$1
  const { data: cars } = useApiList(() => carsApi.list());
  const [brands, setBrands] = useState(() => getCachedBrands());
  const [models, setModels] = useState(() => getCachedModels());
  useEffect(() => {
    void hydrateReferenceCache().then(() => {
      setBrands(getCachedBrands());
      setModels(getCachedModels());
    });
  }, []);`
    );
  }
  s = s.replace(/\bBRANDS\b/g, 'brands');
  s = s.replace(/\bMODELS\b/g, 'models');
  s = s.replace(/\bCARS\b/g, 'cars');
  // ensure useState/useEffect imported
  if (!s.includes('useEffect')) {
    s = s.replace(/import React, \{([^}]+)\} from 'react'/, (m, inner) => {
      const parts = inner.split(',').map(x => x.trim()).filter(Boolean);
      if (!parts.includes('useEffect')) parts.push('useEffect');
      if (!parts.includes('useState')) parts.push('useState');
      return `import React, { ${parts.join(', ')} } from 'react'`;
    });
  }
  fs.writeFileSync(p, s);
  console.log('AppointmentForm');
}

// proof-of-sale
{
  const p = 'c:/wamp64/www/carschek-main/src/app/cars/[id]/proof-of-sale/page.tsx';
  let s = fs.readFileSync(p, 'utf8');
  s = s.replace(
    "import { CARS, formatNaira } from '@/lib/mockData';",
    `import { formatNaira } from '@/lib/mockData';
import { carsApi } from '@/lib/api/services';
import { useApiResource } from '@/hooks/useApiResource';`
  );
  if (s.includes('CARS.find') && !s.includes('carsApi.get')) {
    s = s.replace(
      /const car = CARS\.find\([^)]+\)[^\n]*/,
      `const { data: car, loading, error } = useApiResource(() => carsApi.get(params.id as string), [params.id]);
  if (loading) return <AppLayout currentPath={pathname}><div className="p-8 text-sm text-[#6B7280]">Loading…</div></AppLayout>;
  if (error || !car) return <AppLayout currentPath={pathname}><div className="p-8 text-sm text-red-700">{error || 'Car not found'}</div></AppLayout>;`
    );
  }
  fs.writeFileSync(p, s);
  console.log('proof-of-sale');
}

// finance invoice detail
{
  const p = 'c:/wamp64/www/carschek-main/src/app/finance/invoices/[id]/page.tsx';
  let s = fs.readFileSync(p, 'utf8');
  if (!s.includes('financeApi')) {
    s = s.replace(
      "import { formatNaira } from '@/lib/mockData';",
      `import { formatNaira } from '@/lib/mockData';
import { financeApi } from '@/lib/api/services';
import { useApiResource } from '@/hooks/useApiResource';`
    );
  }
  // if it uses getAllFinanceInvoiceRows or local seed only, add API load
  if (!s.includes('financeApi.getInvoice') && s.includes('useParams')) {
    s = s.replace(
      /const (?:params|id)[^\n]*\n/,
      m => m + `  const invoiceId = (typeof params !== 'undefined' ? (params as {id:string}).id : '') || '';\n  const { data: apiInvoice } = useApiResource(() => financeApi.getInvoice(invoiceId), [invoiceId]);\n`
    );
  }
  fs.writeFileSync(p, s);
  console.log('invoice detail');
}

// orders page — call API on status/assign
{
  const p = 'c:/wamp64/www/carschek-main/src/app/orders/page.tsx';
  let s = fs.readFileSync(p, 'utf8');
  // find updateStatus local and wrap with API
  s = s.replace(
    /const updateStatus = \([^)]*\) => \{\n\s*setOrders\(prev => prev\.map\(o => \(o\.id === orderId \? \{ \.\.\.o, status: newStatus as OrderRow\['status'\] \} : o\)\)\);/,
    `const updateStatus = (orderId: string, newStatus: string) => {
    void ordersApi.updateStatus(orderId, newStatus).catch(() => toast.error('Could not update status'));
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: newStatus as OrderRow['status'] } : o)));`
  );
  fs.writeFileSync(p, s);
  console.log('orders mutations');
}

// orders detail assign
{
  const p = 'c:/wamp64/www/carschek-main/src/app/orders/[id]/page.tsx';
  let s = fs.readFileSync(p, 'utf8');
  s = s.replace(
    `{['Emeka Okonkwo', 'Chidinma Eze', 'Ngozi Obi'].map(name => (
                <button key={name} onClick={() => { toast.success(\`Inspector \${name} assigned\`); setReassignModal(false); }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-[#E5E7EB] hover:border-[#ff8a65] hover:bg-blue-50 transition-all text-left">
                  <div className="w-8 h-8 rounded-full bg-[#ff5722] flex items-center justify-center text-white text-xs font-bold">
                    {name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1F2937]">{name}</p>
                    <p className="text-xs text-[#1A7A4A]">● Available</p>
                  </div>
                </button>
              ))}`,
    `{(inspectors.length ? inspectors : []).slice(0, 8).map(ins => (
                <button key={ins.id} onClick={() => {
                  void ordersApi.assign(orderId, ins.id).then(() => {
                    toast.success(\`Inspector \${ins.name} assigned\`);
                    setReassignModal(false);
                  }).catch(e => toast.error(e instanceof Error ? e.message : 'Assign failed'));
                }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-[#E5E7EB] hover:border-[#ff8a65] hover:bg-blue-50 transition-all text-left">
                  <div className="w-8 h-8 rounded-full bg-[#ff5722] flex items-center justify-center text-white text-xs font-bold">
                    {ins.avatar || ins.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1F2937]">{ins.name}</p>
                    <p className="text-xs text-[#1A7A4A]">● {ins.status === 'online' ? 'Available' : ins.status}</p>
                  </div>
                </button>
              ))}`
  );
  fs.writeFileSync(p, s);
  console.log('orders detail assign');
}

console.log('batch 4 done');
