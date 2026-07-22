const fs = require('fs');

// CommandPalette — load via APIs when opened
{
  const p = 'c:/wamp64/www/carschek-main/src/components/shared/CommandPalette.tsx';
  let s = fs.readFileSync(p, 'utf8');
  s = s.replace(
    "import { CARS, CUSTOMERS, ORDERS, INSPECTORS, REPORTS } from '@/lib/mockData';",
    `import { carsApi, customersApi, ordersApi, inspectorsApi, reportsApi } from '@/lib/api/services';`
  );
  // Make collectHits accept data bags
  if (!s.includes('type SearchIndex')) {
    s = s.replace(
      'type Hit = {',
      `type SearchIndex = {
  cars: Awaited<ReturnType<typeof carsApi.list>>;
  customers: Awaited<ReturnType<typeof customersApi.list>>;
  orders: Awaited<ReturnType<typeof ordersApi.list>>;
  inspectors: Awaited<ReturnType<typeof inspectorsApi.list>>;
  reports: Awaited<ReturnType<typeof reportsApi.list>>;
};

type Hit = {`
    );
    s = s.replace('function collectHits(q: string): Hit[] {', 'function collectHits(q: string, idx: SearchIndex): Hit[] {');
    s = s.replace(/\bCARS\b/g, 'idx.cars');
    s = s.replace(/\bCUSTOMERS\b/g, 'idx.customers');
    s = s.replace(/\bORDERS\b/g, 'idx.orders');
    s = s.replace(/\bINSPECTORS\b/g, 'idx.inspectors');
    s = s.replace(/\bREPORTS\b/g, 'idx.reports');
    // Fix Hit cat type which got mangled
    s = s.replace(
      "cat: 'idx.cars' | 'idx.customers' | 'idx.orders' | 'idx.inspectors' | 'idx.reports';",
      "cat: 'CARS' | 'CUSTOMERS' | 'ORDERS' | 'INSPECTORS' | 'REPORTS';"
    );
    // restore string literals in cat assignments if mangled
    s = s.replace(/cat: 'idx\.cars'/g, "cat: 'CARS'");
    s = s.replace(/cat: 'idx\.customers'/g, "cat: 'CUSTOMERS'");
    s = s.replace(/cat: 'idx\.orders'/g, "cat: 'ORDERS'");
    s = s.replace(/cat: 'idx\.inspectors'/g, "cat: 'INSPECTORS'");
    s = s.replace(/cat: 'idx\.reports'/g, "cat: 'REPORTS'");
  }
  // In component, load index
  if (!s.includes('carsApi.list()')) {
    s = s.replace(
      /export function CommandPalette[^{]*\{/,
      m => `${m}
  const [idx, setIdx] = useState<SearchIndex>({ cars: [], customers: [], orders: [], inspectors: [], reports: [] });
  useEffect(() => {
    void Promise.all([
      carsApi.list(),
      customersApi.list(),
      ordersApi.list(),
      inspectorsApi.list(),
      reportsApi.list(),
    ]).then(([cars, customers, orders, inspectors, reports]) => {
      setIdx({ cars, customers, orders, inspectors, reports });
    });
  }, []);`
    );
  }
  s = s.replace(/collectHits\(([^,\)]+)\)/g, 'collectHits($1, idx)');
  fs.writeFileSync(p, s);
  console.log('CommandPalette');
}

// RecentlyViewedMenu
{
  const p = 'c:/wamp64/www/carschek-main/src/components/shared/RecentlyViewedMenu.tsx';
  let s = fs.readFileSync(p, 'utf8');
  s = s.replace(
    "import { ORDERS, CUSTOMERS, CARS } from '@/lib/mockData';",
    `import { ordersApi, customersApi, carsApi } from '@/lib/api/services';
import { useApiList } from '@/hooks/useApiResource';`
  );
  if (!s.includes('carsApi.list')) {
    s = s.replace(
      /export function RecentlyViewedMenu[^{]*\{/,
      m => `${m}
  const { data: orders } = useApiList(() => ordersApi.list());
  const { data: customers } = useApiList(() => customersApi.list());
  const { data: cars } = useApiList(() => carsApi.list());`
    );
  }
  s = s.replace(/\bORDERS\b/g, 'orders');
  s = s.replace(/\bCUSTOMERS\b/g, 'customers');
  s = s.replace(/\bCARS\b/g, 'cars');
  fs.writeFileSync(p, s);
  console.log('RecentlyViewed');
}

console.log('done');
