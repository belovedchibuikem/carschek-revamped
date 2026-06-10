/** Shapes for inspection report rendering & PDF (Prompt 03–04). */

export type ReportVariant = 'modern' | 'classic';

export type CarschekScore = {
  total: number;
  label: string;
  strokeColor: string;
};

export type ScoreCategoryBreakdown = {
  body: number;
  engine: number;
  interior: number;
  electrical: number;
};

export type ReportInspectionMeta = {
  id: string;
  reportNumber: string;
  inspectionDate: string;
  inspectionDateLong: string;
  completedAtTime: string;
  durationLabel: string;
  durationHuman: string;
  score: number;
  version: number;
  zone: string;
  photoDocSubheading: string;
  qrVerifyUrl: string;
};

export type ReportVehicle = {
  make: string;
  model: string;
  trim: string;
  year: number;
  plate: string;
  vin: string;
  mileage: string;
  colour: string;
  transmission: string;
  engineNumber: string;
  city: string;
};

export type ReportInspector = {
  name: string;
  certNumber: string;
  signatureDataUrl: string | null;
  photoUrl: string | null;
  initials: string;
};

export type VehiclePhotoSlot = {
  angleId: string;
  label: string;
  url: string | null;
};

export type InspectionSectionSummary = {
  id: string;
  name: string;
  itemCount: number;
  status: string;
};

export type SectionLineResult = {
  label: string;
  result: 'pass' | 'fail' | 'na';
  severity?: string;
  note?: string;
  /** For form/comment sections: the recorded value (rendered as label → value, no OK badge). */
  value?: string;
};

export type ReportSectionBreakdown = {
  sectionId: string;
  name: string;
  passed: number;
  total: number;
  pct: number;
  anyFailure: boolean;
  lines: SectionLineResult[];
};

export type InspectionItemSummary = {
  sectionId: string;
  itemKey: string;
  label: string;
  result: string | null;
  severity?: string;
  note?: string;
};

export type DamagePhotoRef = {
  itemId: string;
  url: string | null;
};

export type DefectSummary = {
  sectionId: string;
  sectionName: string;
  itemLabel: string;
  severity: 'Minor' | 'Major' | 'Critical';
  note: string;
  damagePhotoUrls: string[];
  aiAnalysis: string | null;
};

export type RepairCostRow = {
  item: string;
  severity: string;
  low: number;
  high: number;
  openEnded?: boolean;
};

export type InspectionReportData = {
  inspection: ReportInspectionMeta;
  vehicle: ReportVehicle;
  inspector: ReportInspector;
  vehiclePhotos: VehiclePhotoSlot[];
  sections: InspectionSectionSummary[];
  sectionBreakdowns: ReportSectionBreakdown[];
  items: InspectionItemSummary[];
  damagePhotos: DamagePhotoRef[];
  defects: DefectSummary[];
  criticalDefects: DefectSummary[];
  score: CarschekScore;
  scoreCategories: ScoreCategoryBreakdown;
  repairCosts: RepairCostRow[] | null;
};
