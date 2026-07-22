const fs = require('fs');

const p = 'c:/wamp64/www/carschek-main/src/app/cars/[id]/page.tsx';
let s = fs.readFileSync(p, 'utf8');

s = s.replace(
  "import { AUCTIONS, CARS, formatNaira, LISTINGS, REPORTS } from '@/lib/mockData';",
  `import { formatNaira } from '@/lib/mockData';
import { carsApi, auctionsApi, listingsApi, reportsApi } from '@/lib/api/services';
import { useApiResource, useApiList } from '@/hooks/useApiResource';`
);

s = s.replace(
  `  const carId = params.id as string;
  const car = CARS.find(c => c.id === carId) || CARS[0];

  const activeTab = useMemo(() => {`,
  `  const carId = params.id as string;
  const { data: car, loading: carLoading, error: carError } = useApiResource(() => carsApi.get(carId), [carId]);
  const { data: auctions } = useApiList(() => auctionsApi.list());
  const { data: listings } = useApiList(() => listingsApi.list());
  const { data: reports } = useApiList(() => reportsApi.list());

  const activeTab = useMemo(() => {`
);

s = s.replace(
  'const auction = useMemo(() => AUCTIONS.find(a => a.carId === car.id), [car.id]);',
  'const auction = useMemo(() => (car ? auctions.find(a => a.carId === car.id) : undefined), [car, auctions]);'
);
s = s.replace(
  'const listing = useMemo(() => LISTINGS.find(l => l.carId === car.id), [car.id]);',
  'const listing = useMemo(() => (car ? listings.find(l => l.carId === car.id) : undefined), [car, listings]);'
);

s = s.replace(
  'const [editData, setEditData] = useState({ ...car });',
  'const [editData, setEditData] = useState<Awaited<ReturnType<typeof carsApi.get>> | null>(null);'
);
s = s.replace(
  /const \[currentStage, setCurrentStage\] = useState\(PIPELINE_STAGES\.indexOf\(car\.status as \(typeof PIPELINE_STAGES\)\[number\]\)\);/,
  'const [currentStage, setCurrentStage] = useState(0);'
);
s = s.replace(
  /const \[marketplaceVisibility, setMarketplaceVisibility\] = useState<'Not Visible' \| 'Visible' \| 'Featured'>\(\s*\(listing\?\.visibility as 'Not Visible' \| 'Visible' \| 'Featured'\) \?\? 'Visible'\s*\);/,
  "const [marketplaceVisibility, setMarketplaceVisibility] = useState<'Not Visible' | 'Visible' | 'Featured'>('Visible');"
);
s = s.replace(
  'const [featuredToggle, setFeaturedToggle] = useState(listing?.featured ?? false);',
  'const [featuredToggle, setFeaturedToggle] = useState(false);'
);
s = s.replace(
  'const [newListPrice, setNewListPrice] = useState(String(listing?.price ?? car.salePrice ?? car.purchasePrice));',
  "const [newListPrice, setNewListPrice] = useState('');"
);

if (!s.includes('Hydrate car-dependent')) {
  s = s.replace(
    'const [pctOff, setPctOff] = useState<1 | 5 | 10 | 15 | 20>(5);',
    `const [pctOff, setPctOff] = useState<1 | 5 | 10 | 15 | 20>(5);
  const [carHydrated, setCarHydrated] = useState(false);

  // Hydrate car-dependent local state once loaded
  useEffect(() => {
    if (!car || carHydrated) return;
    setEditData({ ...car });
    setCurrentStage(PIPELINE_STAGES.indexOf(car.status as (typeof PIPELINE_STAGES)[number]));
    setMarketplaceVisibility((listing?.visibility as 'Not Visible' | 'Visible' | 'Featured') ?? 'Visible');
    setFeaturedToggle(listing?.featured ?? false);
    setNewListPrice(String(listing?.price ?? car.salePrice ?? car.purchasePrice ?? ''));
    setCarHydrated(true);
  }, [car, listing, carHydrated]);

  if (carLoading || !car || !editData) {
    return (
      <AppLayout currentPath={pathname}>
        <div className="p-8 text-sm text-[#6B7280]">{carError || 'Loading car…'}</div>
      </AppLayout>
    );
  }`
  );
}

// linked reports for this car
s = s.replace(/REPORTS\.filter\([^)]*\)/g, 'reports.filter(r => (r as { carId?: string }).carId === car.id)');
s = s.replace(/\bREPORTS\b/g, 'reports');

fs.writeFileSync(p, s);
console.log('cars/[id] updated, remaining CARS refs:', (s.match(/\bCARS\b/g) || []).length);
