/**
 * AES-GCM helpers for sensitive IndexedDB payloads — wire PBKDF2 + device id in production.
 */

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export async function encryptData(plain: string, password = 'dev-only'): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password.padEnd(32, '0').slice(0, 32)), 'AES-GCM', false, [
    'encrypt',
  ]);
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, keyMaterial, encoder.encode(plain));
  const combined = new Uint8Array(iv.length + cipher.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(cipher), iv.length);
  return btoa(String.fromCharCode(...combined));
}

export async function decryptData(encoded: string, password = 'dev-only'): Promise<string> {
  const raw = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
  const iv = raw.slice(0, 12);
  const data = raw.slice(12);
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password.padEnd(32, '0').slice(0, 32)), 'AES-GCM', false, [
    'decrypt',
  ]);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, keyMaterial, data);
  return decoder.decode(plain);
}
