/** Local draft storage for admin forms — swap for API when backend exists. */

const PREFIX = 'draft_';

export function draftKey(formName: string, userId: string): string {
  return `${PREFIX}${formName}_${userId}`;
}

export function loadDraft<T>(formName: string, userId: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(draftKey(formName, userId));
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function saveDraft(formName: string, userId: string, data: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(draftKey(formName, userId), JSON.stringify(data));
  } catch {
    /* quota */
  }
}

export function clearDraft(formName: string, userId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(draftKey(formName, userId));
  } catch {
    /* ignore */
  }
}

export function getGuestUserId(): string {
  if (typeof window === 'undefined') return 'guest';
  try {
    let id = localStorage.getItem('carschek-guest-id');
    if (!id) {
      id = `guest-${Date.now()}`;
      localStorage.setItem('carschek-guest-id', id);
    }
    return id;
  } catch {
    return 'guest';
  }
}
