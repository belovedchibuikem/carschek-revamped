const fs = require('fs');
const p = 'c:/wamp64/www/carschek-main/src/app/cars/[id]/page.tsx';
let s = fs.readFileSync(p, 'utf8');

const early = `  if (carLoading || !car || !editData) {
    return (
      <AppLayout currentPath={pathname}>
        <div className="p-8 text-sm text-[#6B7280]">{carError || 'Loading car…'}</div>
      </AppLayout>
    );
  }
`;
s = s.replace(early, '');

if (!s.includes('carsApi.list()')) {
  s = s.replace(
    'const { data: reports } = useApiList(() => reportsApi.list());',
    `const { data: reports } = useApiList(() => reportsApi.list());
  const { data: allCars } = useApiList(() => carsApi.list());`
  );
}
s = s.replace(/\bCARS\b/g, 'allCars');

s = s.replace(
  ">([{ id: '1', amount: car.purchasePrice, type: 'Final', date: car.createdAt, by: 'Promise Ndem' }]);",
  '>([]);'
);
s = s.replace(
  'const [sellingPrice, setSellingPrice] = useState(car.salePrice ?? 0);',
  'const [sellingPrice, setSellingPrice] = useState(0);'
);

s = s.replace(
  `const matchCar = useMemo(() => {
    const vinMatch = allCars.find(c => c.id !== car.id && c.vin === car.vin);
    if (vinMatch) return vinMatch;
    if (car.hasDuplicate) return allCars.find(c => c.id !== car.id) ?? null;
    return null;
  }, [car]);`,
  `const matchCar = useMemo(() => {
    if (!car) return null;
    const vinMatch = allCars.find(c => c.id !== car.id && c.vin === car.vin);
    if (vinMatch) return vinMatch;
    if (car.hasDuplicate) return allCars.find(c => c.id !== car.id) ?? null;
    return null;
  }, [car, allCars]);`
);

s = s.replace(
  `const duplicateMatchCount = useMemo(
    () => allCars.filter(c => c.id !== car.id && (c.vin === car.vin || c.plate === car.plate)).length,
    [car]
  );`,
  `const duplicateMatchCount = useMemo(
    () => (car ? allCars.filter(c => c.id !== car.id && (c.vin === car.vin || c.plate === car.plate)).length : 0),
    [car, allCars]
  );`
);

s = s.replace(
  'const linkedInspection = useMemo(() => reports.some(r => r.carId === car.id), [car.id]);',
  'const linkedInspection = useMemo(() => (car ? reports.some(r => (r as { carId?: string }).carId === car.id) : false), [car, reports]);'
);

s = s.replace(
  `useEffect(() => {
    setDuplicateDismissed(false);
  }, [car.id]);`,
  `useEffect(() => {
    setDuplicateDismissed(false);
  }, [car?.id]);`
);

s = s.replace(
  `setNewListPrice(String(listing?.price ?? car.salePrice ?? car.purchasePrice ?? ''));
    setCarHydrated(true);`,
  `setNewListPrice(String(listing?.price ?? car.salePrice ?? car.purchasePrice ?? ''));
    setSellingPrice(car.salePrice ?? 0);
    setPurchasePrices([{ id: '1', amount: car.purchasePrice, type: 'Final', date: car.createdAt, by: 'Promise Ndem' }]);
    setCarHydrated(true);`
);

const marker = '  const margin =';
const idx = s.indexOf(marker);
if (idx < 0) throw new Error('margin marker missing');
const guard = `  if (carLoading || !car || !editData) {
    return (
      <AppLayout currentPath={pathname}>
        <div className="p-8 text-sm text-[#6B7280]">{carError || 'Loading car…'}</div>
      </AppLayout>
    );
  }

`;
if (!s.includes('carLoading || !car || !editData')) {
  s = s.slice(0, idx) + guard + s.slice(idx);
} else if (s.indexOf('carLoading || !car || !editData') > idx) {
  // already has guard after margin somehow
} else {
  // guard might still be missing before margin
  const beforeMargin = s.slice(0, idx);
  if (!beforeMargin.includes('carLoading || !car || !editData')) {
    s = s.slice(0, idx) + guard + s.slice(idx);
  }
}

fs.writeFileSync(p, s);
console.log('ok CARS left', (s.match(/\bCARS\b/g) || []).length);
console.log('guard before margin', s.indexOf('carLoading || !car || !editData') < s.indexOf(marker));
