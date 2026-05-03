'use client';
import Dexie, { type Table } from 'dexie';

export interface InspectionRecord {
  id?: number;
  serverId?: string;
  orderId: string;
  status: 'draft' | 'in-progress' | 'complete' | 'synced';
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    plate: string;
    vin?: string;
    customer: string;
  };
  startedAt: string;
  completedAt?: string;
  createdAt: string;
  synced: boolean;
}

export interface SectionRecord {
  id?: number;
  inspectionId: number;
  sectionKey: string;
  sectionName: string;
  status: 'not-started' | 'in-progress' | 'complete';
  completedAt?: string;
}

export interface ItemRecord {
  id?: number;
  sectionId: number;
  itemKey: string;
  itemName: string;
  mode: 'paired' | 'single';
  leftResult?: 'pass' | 'fail' | 'na' | null;
  rightResult?: 'pass' | 'fail' | 'na' | null;
  singleResult?: 'pass' | 'fail' | 'na' | null;
  severity?: 'Minor' | 'Major' | 'Critical' | null;
  defectNote?: string;
  aiAnalysis?: string;
  updatedAt: string;
}

export interface PhotoRecord {
  id?: number;
  inspectionId: number;
  itemId?: number;
  photoType: 'vehicle' | 'damage';
  label: string;
  blob?: Blob;
  dataUrl?: string;
  aiResult?: string;
  aiSeverity?: string;
  synced: boolean;
  createdAt: string;
}

export interface SyncQueueRecord {
  id?: number;
  type: 'inspection' | 'section' | 'item' | 'photo';
  payload: string;
  attempts: number;
  createdAt: string;
  lastAttempt?: string;
}

export interface CachedJobRecord {
  orderId: string;
  data: string;
  cachedAt: string;
}

export interface GradeRecord {
  id?: number;
  inspectionId: number;
  categoryId: string;
  categoryName: string;
  weight: number;
  score: number | null;
  maxScore: number;
  note: string;
  updatedAt: string;
}

class InspectionDatabase extends Dexie {
  inspections!: Table<InspectionRecord>;
  sections!: Table<SectionRecord>;
  items!: Table<ItemRecord>;
  photos!: Table<PhotoRecord>;
  syncQueue!: Table<SyncQueueRecord>;
  cachedJobs!: Table<CachedJobRecord>;
  grades!: Table<GradeRecord>;

  constructor() {
    super('CarschekInspectionDB');
    this.version(1).stores({
      inspections: '++id, serverId, orderId, status, createdAt, synced',
      sections: '++id, inspectionId, sectionKey, completedAt',
      items: '++id, sectionId, itemKey, updatedAt',
      photos: '++id, inspectionId, itemId, photoType, synced',
      syncQueue: '++id, type, attempts, createdAt',
      cachedJobs: 'orderId, cachedAt',
      grades: '++id, inspectionId, categoryId',
    });
  }
}

let dbInstance: InspectionDatabase | null = null;

export function getDb(): InspectionDatabase {
  if (typeof window === 'undefined') {
    throw new Error('IndexedDB is only available in the browser');
  }
  if (!dbInstance) {
    dbInstance = new InspectionDatabase();
  }
  return dbInstance;
}

export async function saveItemToDb(
  inspectionId: number,
  sectionId: number,
  item: Omit<ItemRecord, 'id' | 'sectionId'>
): Promise<number> {
  const db = getDb();
  const existing = await db.items
    .where('sectionId').equals(sectionId)
    .and(i => i.itemKey === item.itemKey)
    .first();

  if (existing?.id) {
    await db.items.update(existing.id, { ...item, updatedAt: new Date().toISOString() });
    return existing.id;
  } else {
    return await db.items.add({ ...item, sectionId, updatedAt: new Date().toISOString() });
  }
}

export async function getOrCreateInspection(orderId: string, vehicleInfo: InspectionRecord['vehicleInfo']): Promise<InspectionRecord> {
  const db = getDb();
  const existing = await db.inspections.where('orderId').equals(orderId).first();
  if (existing) return existing;

  const id = await db.inspections.add({
    orderId,
    status: 'draft',
    vehicleInfo,
    startedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    synced: false,
  });
  return (await db.inspections.get(id))!;
}

export async function addToSyncQueue(type: SyncQueueRecord['type'], payload: object): Promise<void> {
  const db = getDb();
  await db.syncQueue.add({
    type,
    payload: JSON.stringify(payload),
    attempts: 0,
    createdAt: new Date().toISOString(),
  });
}
