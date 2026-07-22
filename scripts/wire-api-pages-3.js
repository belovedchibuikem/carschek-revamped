const fs = require('fs');

// ── cars/new ──
{
  const p = 'c:/wamp64/www/carschek-main/src/app/cars/new/page.tsx';
  let s = fs.readFileSync(p, 'utf8');
  s = s.replace(
    "import { BRANDS, MODELS, YEARS, NIGERIAN_STATES, CARS, CRM_CONTACTS, SALES_STAFF } from '@/lib/mockData';",
    `import { NIGERIAN_STATES, SALES_STAFF } from '@/lib/mockData';
import { carsApi, crmApi, referenceApi } from '@/lib/api/services';
import { useApiList } from '@/hooks/useApiResource';
import { hydrateReferenceCache, getCachedBrands, getCachedModels } from '@/lib/reference/referenceCache';`
  );
  s = s.replace(
    "import { appointmentsApi } from '@/lib/api/services';",
    "import { appointmentsApi } from '@/lib/api/services';"
  );

  // After form state, load inventories
  if (!s.includes('carsApi.list')) {
    s = s.replace(
      'const [errors, setErrors] = useState<Record<string, string>>({});',
      `const [errors, setErrors] = useState<Record<string, string>>({});
  const { data: inventory } = useApiList(() => carsApi.list());
  const { data: crmContacts } = useApiList(() => crmApi.list());
  const [brands, setBrands] = useState(() => getCachedBrands());
  const [models, setModels] = useState(() => getCachedModels());
  const [, setRefTick] = useState(0);

  useEffect(() => {
    void hydrateReferenceCache().then(() => {
      setBrands(getCachedBrands());
      setModels(getCachedModels());
      setRefTick(t => t + 1);
    });
  }, []);`
    );
  }

  s = s.replace(/\bBRANDS\b/g, 'brands');
  s = s.replace(/\bMODELS\b/g, 'models');
  // YEARS might still be used — leave via cascade
  s = s.replace(/\bCARS\b/g, 'inventory');
  s = s.replace(/\bCRM_CONTACTS\b/g, 'crmContacts');

  // handleSubmit → carsApi.create
  s = s.replace(
    /setSaving\(true\);\n    await new Promise\(r => setTimeout\(r, 1500\)\);\n    setSaving\(false\);\n    clearDraft\(DRAFT_FORM, uid\);\n    const newCarId = 'CK-49';/,
    `setSaving(true);
    let newCarId = 'CK-49';
    try {
      const brand = brands.find(b => b.id === form.brandId);
      const model = models.find(m => m.id === form.modelId);
      const created = await carsApi.create({
        brand: brand?.name ?? '',
        model: model?.name ?? '',
        year: Number(form.year) || new Date().getFullYear(),
        plate: form.plate,
        vin: form.vin,
        colour: form.colourCustom || form.colour,
        mileage: Number(String(form.mileage).replace(/,/g, '')) || 0,
        city: form.city,
        state: form.state,
        channel: form.channel,
        purchasePrice: Number(form.purchasePrice) || 0,
        status: 'Acquired',
        transmission: form.transmission,
        bodyType: form.bodyType,
        engineNumber: form.engineNumber,
        contactType: form.contactType,
        contactName: [form.firstName, form.lastName].filter(Boolean).join(' '),
        contactEmail: form.email,
        contactPhone: form.phone,
        salesPerson: form.salesPerson,
        purchaseDate: form.purchaseDate,
      });
      newCarId = created.id;
    } catch (e) {
      setSaving(false);
      toast.error(e instanceof Error ? e.message : 'Could not register car');
      return;
    }
    setSaving(false);
    clearDraft(DRAFT_FORM, uid);`
  );

  // Fix toast that hardcodes CK-49
  s = s.replace("toast.success('CK-49 Created Successfully');", 'toast.success(`${newCarId} Created Successfully`);');

  fs.writeFileSync(p, s);
  console.log('cars/new updated');
}

// ── reference brands ──
{
  const p = 'c:/wamp64/www/carschek-main/src/app/reference/brands/page.tsx';
  let s = fs.readFileSync(p, 'utf8');
  s = s.replace("import { BRANDS, MODELS, CARS } from '@/lib/mockData';", '');
  if (!s.includes('referenceApi')) {
    s = s.replace(
      "import { toast } from 'sonner';",
      `import { toast } from 'sonner';
import { referenceApi, carsApi } from '@/lib/api/services';
import { useApiList } from '@/hooks/useApiResource';`
    );
  }
  s = s.replace(
    'const [brands, setBrands] = useState(BRANDS);',
    `const { data: brands, setData: setBrands, loading, error, refresh } = useApiList(() => referenceApi.brands());
  const { data: models } = useApiList(() => referenceApi.models());
  const { data: cars } = useApiList(() => carsApi.list());`
  );
  s = s.replace(/\bMODELS\b/g, 'models');
  s = s.replace(/\bCARS\b/g, 'cars');
  s = s.replace(
    /const handleAdd = \(\) => \{[\s\S]*?toast\.success\(`Brand "\$\{newBrand\.name\}" added successfully`\);\n  \};/,
    `const handleAdd = async () => {
    if (!newBrand.name) { toast.error('Brand name is required'); return; }
    try {
      const created = await referenceApi.storeBrand(newBrand) as (typeof brands)[number];
      setBrands(prev => [...prev, { id: (created as { id?: string }).id || \`b\${Date.now()}\`, name: newBrand.name, country: newBrand.country, flag: '🌍', models: 0, cars: 0, active: newBrand.active, logo: newBrand.name[0].toUpperCase(), ...created }]);
      setShowAddModal(false);
      setNewBrand({ name: '', country: '', active: true });
      toast.success(\`Brand "\${newBrand.name}" added successfully\`);
      void refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not add brand');
    }
  };`
  );
  s = s.replace(
    /const handleDelete = \(id: string\) => \{[\s\S]*?toast\.success\('Brand deleted'\);\n  \};/,
    `const handleDelete = async (id: string) => {
    const brand = brands.find(b => b.id === id);
    if (!brand) return;
    const modelCount = models.filter(m => m.brandId === id).length;
    const carCount = cars.filter(c => c.brand === brand.name).length;
    if (modelCount > 0 || carCount > 0) {
      toast.error(\`Cannot delete \${brand.name} — \${modelCount} model(s) and \${carCount} car(s) are linked\`);
      setDeleteConfirm(null);
      return;
    }
    try {
      await referenceApi.deleteBrand(id);
      setBrands(prev => prev.filter(b => b.id !== id));
      setDeleteConfirm(null);
      toast.success('Brand deleted');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not delete brand');
    }
  };`
  );
  fs.writeFileSync(p, s);
  console.log('brands updated');
}

// ── reference models ──
{
  const p = 'c:/wamp64/www/carschek-main/src/app/reference/models/page.tsx';
  let s = fs.readFileSync(p, 'utf8');
  s = s.replace("import { MODELS, BRANDS } from '@/lib/mockData';", '');
  if (!s.includes('referenceApi')) {
    s = s.replace(
      /import \{ toast \} from 'sonner';/,
      `import { toast } from 'sonner';
import { referenceApi } from '@/lib/api/services';
import { useApiList } from '@/hooks/useApiResource';`
    );
  }
  // inject hooks after pathname
  if (!s.includes('referenceApi.models')) {
    s = s.replace(
      'const pathname = usePathname();',
      `const pathname = usePathname();
  const { data: models, setData: setModels, loading, error, refresh } = useApiList(() => referenceApi.models());
  const { data: brands } = useApiList(() => referenceApi.brands());`
    );
  }
  s = s.replace(/\bMODELS\b/g, 'models');
  s = s.replace(/\bBRANDS\b/g, 'brands');
  // if useState(models) was created wrongly from MODELS replace of useState(MODELS)
  s = s.replace('const [models, setModels] = useState(models);', '// models from API');
  fs.writeFileSync(p, s);
  console.log('models updated');
}

// ── reference years ──
{
  const p = 'c:/wamp64/www/carschek-main/src/app/reference/years/page.tsx';
  let s = fs.readFileSync(p, 'utf8');
  s = s.replace(
    "import { MODELS, BRANDS, YEARS, CARS, formatNaira, getScoreColor } from '@/lib/mockData';",
    "import { formatNaira, getScoreColor } from '@/lib/mockData';"
  );
  if (!s.includes('referenceApi')) {
    s = s.replace(
      /import \{ toast \} from 'sonner';/,
      `import { toast } from 'sonner';
import { referenceApi, carsApi } from '@/lib/api/services';
import { useApiList } from '@/hooks/useApiResource';`
    );
  }
  if (!s.includes('referenceApi.years')) {
    s = s.replace(
      'const pathname = usePathname();',
      `const pathname = usePathname();
  const { data: years, setData: setYears, loading, error, refresh } = useApiList(() => referenceApi.years());
  const { data: models } = useApiList(() => referenceApi.models());
  const { data: brands } = useApiList(() => referenceApi.brands());
  const { data: cars } = useApiList(() => carsApi.list());`
    );
  }
  s = s.replace(/\bYEARS\b/g, 'years');
  s = s.replace(/\bMODELS\b/g, 'models');
  s = s.replace(/\bBRANDS\b/g, 'brands');
  s = s.replace(/\bCARS\b/g, 'cars');
  s = s.replace('const [years, setYears] = useState(years);', '// years from API');
  fs.writeFileSync(p, s);
  console.log('years updated');
}

// ── finance summary ──
{
  const p = 'c:/wamp64/www/carschek-main/src/app/finance/page.tsx';
  let s = fs.readFileSync(p, 'utf8');
  s = s.replace(
    "import { FINANCE_SUMMARY, formatNaira } from '@/lib/mockData';",
    "import { formatNaira } from '@/lib/mockData';\nimport { financeApi } from '@/lib/api/services';\nimport { useApiResource, useApiList } from '@/hooks/useApiResource';"
  );
  if (!s.includes('financeApi.summary')) {
    s = s.replace(
      'const [activeTab, setActiveTab] = useState(\'Revenue\');',
      `const { data: financeSummary } = useApiResource(() => financeApi.summary());
  const { data: apiInvoices, refresh: refreshApiInvoices } = useApiList(() => financeApi.listInvoices());
  const [activeTab, setActiveTab] = useState('Revenue');`
    );
  }
  s = s.replace(/\bFINANCE_SUMMARY\b/g, '(financeSummary ?? { revenue: 0, expenses: 0, profit: 0, pendingPayouts: 0, outstandingInvoices: 0 })');
  // Prefer API invoices when available
  s = s.replace(
    'const [invoices, setInvoices] = useState<FinanceInvoiceListRow[]>(() => getAllFinanceInvoiceRows());',
    `const [invoices, setInvoices] = useState<FinanceInvoiceListRow[]>(() => getAllFinanceInvoiceRows());
  useEffect(() => {
    if (apiInvoices && apiInvoices.length > 0) {
      setInvoices(apiInvoices as unknown as FinanceInvoiceListRow[]);
    }
  }, [apiInvoices]);`
  );
  fs.writeFileSync(p, s);
  console.log('finance updated');
}

// ── dashboard KPIs ──
{
  const p = 'c:/wamp64/www/carschek-main/src/app/dashboard/page.tsx';
  let s = fs.readFileSync(p, 'utf8');
  s = s.replace(
    "import { formatNaira, getScoreColor, INSPECTORS } from '@/lib/mockData';",
    "import { formatNaira, getScoreColor } from '@/lib/mockData';\nimport { dashboardApi, inspectorsApi } from '@/lib/api/services';\nimport { useApiResource, useApiList } from '@/hooks/useApiResource';"
  );
  if (!s.includes('dashboardApi.kpis')) {
    s = s.replace(
      'export default function DashboardPage() {\n  const pathname = usePathname();',
      `export default function DashboardPage() {
  const pathname = usePathname();
  const { data: kpis } = useApiResource(() => dashboardApi.kpis());
  const { data: inspectors } = useApiList(() => inspectorsApi.list());`
    );
  }
  s = s.replace(/\bINSPECTORS\b/g, 'inspectors');
  fs.writeFileSync(p, s);
  console.log('dashboard updated, kpis var unused ok:', s.includes('kpis'));
}

// ── admin-dashboard KPIs ──
{
  const p = 'c:/wamp64/www/carschek-main/src/app/admin-dashboard/components/DashboardKPIs.tsx';
  let s = fs.readFileSync(p, 'utf8');
  if (!s.includes('dashboardApi')) {
    s = s.replace(
      "import { useRechartsTheme } from '@/lib/charts/rechartsTheme';",
      `import { useRechartsTheme } from '@/lib/charts/rechartsTheme';
import { dashboardApi } from '@/lib/api/services';
import { useApiResource } from '@/hooks/useApiResource';`
    );
    s = s.replace(
      'export default function DashboardKPIs() {\n  const t = useRechartsTheme();\n  const inspections = useCountUp(47);\n  const pending = useCountUp(9);\n  const scoreVal = useCountUp(78);',
      `export default function DashboardKPIs() {
  const t = useRechartsTheme();
  const { data: kpis } = useApiResource(() => dashboardApi.kpis());
  const inspTotal = Number((kpis as { appointments?: { today?: number }; orders?: { total?: number } } | null)?.appointments?.today
    ?? (kpis as { orders?: { total?: number } } | null)?.orders?.total
    ?? 47);
  const pendingTotal = Number((kpis as { orders?: { new?: number; assigned?: number; inProgress?: number } } | null)?.orders
    ? ((kpis as { orders: { new?: number; assigned?: number; inProgress?: number } }).orders.new ?? 0)
      + ((kpis as { orders: { new?: number; assigned?: number; inProgress?: number } }).orders.assigned ?? 0)
      + ((kpis as { orders: { new?: number; assigned?: number; inProgress?: number } }).orders.inProgress ?? 0)
    : 9);
  const inspections = useCountUp(inspTotal);
  const pending = useCountUp(pendingTotal);
  const scoreVal = useCountUp(78);`
    );
  }
  fs.writeFileSync(p, s);
  console.log('admin DashboardKPIs updated');
}

console.log('batch 3 done');
