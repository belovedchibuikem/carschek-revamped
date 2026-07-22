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

// Soften margin / oldMarketPrice / useEffect for null car
s = s.replace(
  `  const margin =
    car.salePrice || sellingPrice
      ? (((sellingPrice || car.salePrice || 0) - car.purchasePrice) / car.purchasePrice * 100).toFixed(2)
      : null;

  const computedMarketPrice = useMemo(() => {
    const n = Number(newListPrice.replace(/\\D/g, '')) || 0;
    return Math.round(n * (1 - pctOff / 100));
  }, [newListPrice, pctOff]);

  const oldMarketPrice = listing?.price ?? car.salePrice ?? car.purchasePrice;

  const anyDirty = editMain || editContact || Object.values(tabDirty).some(Boolean);

  useEffect(() => {
    setEditData({ ...car });
    setCurrentStage(PIPELINE_STAGES.indexOf(car.status as (typeof PIPELINE_STAGES)[number]));
    setSellingPrice(car.salePrice ?? 0);
  }, [car]);

  const markDirty = (tab: number) => setTabDirty(d => ({ ...d, [tab]: true }));`,
  `  const computedMarketPrice = useMemo(() => {
    const n = Number(newListPrice.replace(/\\D/g, '')) || 0;
    return Math.round(n * (1 - pctOff / 100));
  }, [newListPrice, pctOff]);

  const anyDirty = editMain || editContact || Object.values(tabDirty).some(Boolean);

  useEffect(() => {
    if (!car) return;
    setEditData({ ...car });
    setCurrentStage(PIPELINE_STAGES.indexOf(car.status as (typeof PIPELINE_STAGES)[number]));
    setSellingPrice(car.salePrice ?? 0);
  }, [car]);

  if (carLoading || !car || !editData) {
    return (
      <AppLayout currentPath={pathname}>
        <div className="p-8 text-sm text-[#6B7280]">{carError || 'Loading car…'}</div>
      </AppLayout>
    );
  }

  const margin =
    car.salePrice || sellingPrice
      ? ((((sellingPrice || car.salePrice || 0) - car.purchasePrice) / car.purchasePrice) * 100).toFixed(2)
      : null;

  const oldMarketPrice = listing?.price ?? car.salePrice ?? car.purchasePrice;

  const markDirty = (tab: number) => setTabDirty(d => ({ ...d, [tab]: true }));`
);

fs.writeFileSync(p, s);
console.log('cars detail early return after hooks:', s.indexOf('carLoading || !car') > s.indexOf('computedMarketPrice'));
console.log('hooks after early?', /if \(carLoading[\s\S]*?useMemo\(/.test(s));
