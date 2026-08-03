/** Canonical staff roles — matches Laravel `users.role`. */

export const STAFF_ROLES = [
  'super-admin',
  'ops-manager',
  'inspector',
  'finance',
  'support',
] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

export const ROLE_LABELS: Record<
  StaffRole,
  { label: string; color: string }
> = {
  'super-admin': { label: 'Super Admin', color: 'bg-amber-100 text-amber-800' },
  'ops-manager': { label: 'Ops Manager', color: 'bg-blue-100 text-blue-800' },
  inspector: { label: 'Inspector', color: 'bg-teal-100 text-teal-800' },
  finance: { label: 'Finance', color: 'bg-green-100 text-green-800' },
  support: { label: 'Support', color: 'bg-gray-100 text-gray-700' },
};

export type StaffUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin?: string | null;
  avatar?: string | null;
  phone?: string | null;
  inspectorId?: string | null;
};

export function roleMeta(role: string) {
  return ROLE_LABELS[role as StaffRole] ?? { label: role, color: 'bg-gray-100 text-gray-700' };
}

export function canAssignSuperAdmin(actorRole?: string | null) {
  return actorRole === 'super-admin';
}

export function assignableRoles(actorRole?: string | null): StaffRole[] {
  if (!actorRole || actorRole === 'super-admin') return [...STAFF_ROLES];
  if (actorRole === 'ops-manager') return STAFF_ROLES.filter(r => r !== 'super-admin');
  return [];
}

export function generateTempPassword(): string {
  return `Ck@${Math.random().toString(36).slice(2, 10)}A1`;
}

export function nameFromEmail(email: string): string {
  const local = email.split('@')[0] || 'user';
  return local
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}
