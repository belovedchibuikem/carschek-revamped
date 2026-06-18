import Dexie, { type Table } from 'dexie';

export interface InspectionRow {
  id?: number;
  serverId?: string;
  orderId: string;
  inspectorId: string;
  status: string;
  startedAt?: number;
  completedAt?: number;
  score?: number;
}

export interface SectionRow {
  id?: number;
  inspectionId: number;
  sectionKey: string;
  status: string;
  completedAt?: number;
  elapsedSeconds?: number;
  synced?: boolean;
}

export interface ItemRow {
  id?: number;
  sectionId: number;
  itemKey: string;
  side?: string;
  result?: string;
  severity?: string;
  defectNote?: string;
  photoIds?: string;
  voiceNote?: string;
  synced?: boolean;
}

export interface PhotoRow {
  id?: number;
  itemId?: number;
  inspectionId: number;
  type: string;
  blob?: ArrayBuffer;
  compressed?: boolean;
  synced?: boolean;
  syncedAt?: number;
}

export interface VehiclePhotoRow {
  id?: number;
  inspectionId: number;
  angle: string;
  blob?: ArrayBuffer;
  compressed?: boolean;
  synced?: boolean;
  mimeType?: string;
  sizeKb?: number;
  capturedAt?: number;
  uploadedUrl?: string;
}

export interface DamagePhotoRow {
  id?: number;
  inspectionId: number;
  orderId: string;
  sectionId: string;
  itemKey: string;
  blob?: ArrayBuffer;
  mimeType?: string;
  sizeKb?: number;
  synced?: boolean;
  capturedAt?: number;
  /** Inspector comment entered when capturing hub damage photos. */
  comment?: string;
  /** Human-readable damage name (v7 — preferred over parsing itemKey). */
  damageLabel?: string;
  /** AI-suggested severity when captured. */
  aiSeverity?: string;
  /** Set after successful upload (sync v5 index). */
  uploadedUrl?: string;
}

export interface SyncQueueRow {
  id?: number;
  type: string;
  /** Normalized entity kind for sync processor (optional; inferred from `type` when missing). */
  entityType?: string;
  entityId: string;
  payload: string;
  attempts: number;
  lastAttempt?: number;
  createdAt: number;
  synced?: boolean;
  /** Last error message when sync failed. */
  error?: string;
}

/** Audio note attached to a damage photo (recorded on-site, offline-first). */
export interface VoiceNoteRow {
  id?: number;
  orderId: string;
  /** `damagePhotos` row id this note belongs to. */
  damagePhotoId: number;
  blob?: ArrayBuffer;
  mimeType?: string;
  durationSec?: number;
  createdAt: number;
  synced?: boolean;
}

export interface CachedJobRow {
  orderId: string;
  data: string;
  cachedAt: number;
}

export interface DraftRow {
  id?: number;
  formName: string;
  userId: string;
  data: string;
  savedAt: number;
}

/** Local checklist JSON per order+section (inspector flow; offline-first). */
export interface ChecklistStateRow {
  id?: number;
  /** Unique `${orderId}::${sectionId}` */
  orderSectionKey: string;
  orderId: string;
  sectionId: string;
  payload: string;
  updatedAt: number;
}

/** Dexie database — persisted name `carschek_inspector` (Prompt 10 “CarschekDB” semantics). */
export class CarschekDB extends Dexie {
  inspections!: Table<InspectionRow, number>;
  sections!: Table<SectionRow, number>;
  items!: Table<ItemRow, number>;
  photos!: Table<PhotoRow, number>;
  vehiclePhotos!: Table<VehiclePhotoRow, number>;
  damagePhotos!: Table<DamagePhotoRow, number>;
  syncQueue!: Table<SyncQueueRow, number>;
  cachedJobs!: Table<CachedJobRow, string>;
  drafts!: Table<DraftRow, number>;
  checklistStates!: Table<ChecklistStateRow, number>;
  voiceNotes!: Table<VoiceNoteRow, number>;

  constructor() {
    super('carschek_inspector');
    this.version(2).stores({
      inspections: '++id, serverId, orderId, inspectorId, status, startedAt, completedAt, score',
      sections: '++id, inspectionId, sectionKey, status, completedAt, elapsedSeconds',
      items: '++id, sectionId, itemKey, side, result, severity, defectNote, photoIds, voiceNote',
      photos: '++id, itemId, inspectionId, type, blob, compressed, synced, syncedAt',
      vehiclePhotos: '++id, inspectionId, angle, blob, compressed, synced',
      syncQueue: '++id, type, entityId, payload, attempts, lastAttempt, createdAt, synced',
      cachedJobs: 'orderId, data, cachedAt',
      drafts: '++id, formName, userId, data, savedAt',
    });
    this.version(3).stores({
      checklistStates: '++id, &orderSectionKey, orderId, sectionId, updatedAt',
    });
    this.version(4).stores({
      damagePhotos: '++id, inspectionId, orderId, sectionId, itemKey, capturedAt, synced',
    });
    this.version(5).stores({
      inspections: '++id, serverId, orderId, inspectorId, status, startedAt, completedAt, score',
      sections: '++id, inspectionId, sectionKey, status, completedAt, elapsedSeconds, synced',
      items: '++id, sectionId, itemKey, side, result, severity, defectNote, photoIds, voiceNote, synced',
      photos: '++id, itemId, inspectionId, type, blob, compressed, synced, syncedAt',
      vehiclePhotos: '++id, inspectionId, angle, blob, compressed, synced, mimeType, uploadedUrl',
      damagePhotos: '++id, inspectionId, orderId, sectionId, itemKey, capturedAt, synced, uploadedUrl',
      syncQueue: '++id, type, entityType, entityId, payload, attempts, lastAttempt, createdAt, synced, error',
      cachedJobs: 'orderId, data, cachedAt, expiresAt',
      drafts: '++id, formName, userId, data, savedAt',
      checklistStates: '++id, &orderSectionKey, orderId, sectionId, updatedAt',
    });
    this.version(6).stores({
      voiceNotes: '++id, orderId, damagePhotoId, createdAt, synced',
    });
    this.version(7).stores({
      damagePhotos: '++id, inspectionId, orderId, sectionId, itemKey, capturedAt, synced, uploadedUrl, damageLabel',
    });
  }
}

/** @deprecated Use `CarschekDB` */
export const CarschekDexie = CarschekDB;

export const db = typeof window !== 'undefined' ? new CarschekDB() : null;

export type InspectionRecord = InspectionRow;
export type SectionRecord = SectionRow;
export type ItemRecord = ItemRow;
export type VehiclePhotoRecord = VehiclePhotoRow;
export type DamagePhotoRecord = DamagePhotoRow;
export type SyncQueueRecord = SyncQueueRow;
export type DraftRecord = DraftRow;
export type CachedJobRecord = CachedJobRow;
