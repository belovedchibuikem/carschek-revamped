/** Voice notes attached to damage photos — Dexie `voiceNotes` table, offline-first. */

import { db } from '@/lib/db/schema';

export type VoiceNoteWithUrl = {
  id: number;
  damagePhotoId: number;
  url: string;
  durationSec?: number;
};

export async function persistDamageVoiceNote(
  orderId: string,
  damagePhotoId: number,
  blob: Blob,
  durationSec: number
): Promise<void> {
  if (!db) return;
  const buf = await blob.arrayBuffer();
  // One note per damage photo — replace any existing recording
  await db.voiceNotes.where('damagePhotoId').equals(damagePhotoId).delete();
  await db.voiceNotes.add({
    orderId,
    damagePhotoId,
    blob: buf,
    mimeType: blob.type || 'audio/webm',
    durationSec,
    createdAt: Date.now(),
    synced: false,
  });
}

export async function deleteVoiceNoteForDamagePhoto(damagePhotoId: number): Promise<void> {
  if (!db) return;
  await db.voiceNotes.where('damagePhotoId').equals(damagePhotoId).delete();
}

/**
 * Loads all voice notes for an order as object URLs, keyed by damage photo id.
 * Call `revoke()` on unmount to release the object URLs.
 */
export async function loadVoiceNotesForOrder(
  orderId: string
): Promise<{ notes: Map<number, VoiceNoteWithUrl>; revoke: () => void }> {
  const notes = new Map<number, VoiceNoteWithUrl>();
  if (!db) return { notes, revoke: () => undefined };
  const rows = await db.voiceNotes.where('orderId').equals(orderId).toArray();
  const urls: string[] = [];
  for (const row of rows) {
    if (row.id == null || !row.blob) continue;
    const url = URL.createObjectURL(new Blob([row.blob], { type: row.mimeType || 'audio/webm' }));
    urls.push(url);
    notes.set(row.damagePhotoId, { id: row.id, damagePhotoId: row.damagePhotoId, url, durationSec: row.durationSec });
  }
  return {
    notes,
    revoke: () => {
      for (const u of urls) URL.revokeObjectURL(u);
    },
  };
}
