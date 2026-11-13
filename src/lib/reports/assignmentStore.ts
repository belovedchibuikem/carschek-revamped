/** Mock report ↔ portal-user links when USE_API_MOCK. */

export type PortalUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  isDealer: boolean;
  role: 'customer';
  status: string;
};

export type AssignmentRow = {
  reportId: string;
  user: PortalUser;
  assignedAt: string;
};

const USERS_KEY = 'carschek-portal-users';
const LINKS_KEY = 'carschek-report-assignments';

const SEED: PortalUser[] = [
  {
    id: 'USR-C001',
    name: 'Ada Dealer',
    email: 'ada.dealer@example.com',
    phone: '08030001111',
    isDealer: true,
    role: 'customer',
    status: 'Active',
  },
  {
    id: 'USR-C002',
    name: 'Tunde Buyer',
    email: 'tunde.buyer@example.com',
    phone: '08030002222',
    isDealer: false,
    role: 'customer',
    status: 'Active',
  },
];

function readUsers(): PortalUser[] {
  if (typeof window === 'undefined') return [...SEED];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(SEED));
      return [...SEED];
    }
    const parsed = JSON.parse(raw) as PortalUser[];
    return Array.isArray(parsed) ? parsed : [...SEED];
  } catch {
    return [...SEED];
  }
}

function writeUsers(rows: PortalUser[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_KEY, JSON.stringify(rows));
}

function readLinks(): AssignmentRow[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LINKS_KEY);
    const parsed = raw ? (JSON.parse(raw) as AssignmentRow[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLinks(rows: AssignmentRow[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LINKS_KEY, JSON.stringify(rows));
}

export function searchLocalPortalUsers(q: string): PortalUser[] {
  const s = q.trim().toLowerCase();
  return readUsers().filter(
    u =>
      !s ||
      u.name.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s) ||
      (u.phone || '').toLowerCase().includes(s) ||
      u.id.toLowerCase().includes(s)
  );
}

export function createLocalPortalUser(input: {
  name: string;
  email: string;
  phone?: string | null;
  isDealer?: boolean;
}): PortalUser {
  const all = readUsers();
  const user: PortalUser = {
    id: `USR-C${String(all.length + 1).padStart(3, '0')}`,
    name: input.name,
    email: input.email,
    phone: input.phone ?? null,
    isDealer: Boolean(input.isDealer),
    role: 'customer',
    status: 'Active',
  };
  writeUsers([user, ...all]);
  return user;
}

export function listLocalAssignees(reportId: string): AssignmentRow[] {
  return readLinks().filter(l => l.reportId === reportId);
}

export function assignLocal(reportId: string, user: PortalUser): AssignmentRow {
  const all = readLinks().filter(l => !(l.reportId === reportId && l.user.id === user.id));
  const row: AssignmentRow = { reportId, user, assignedAt: new Date().toISOString() };
  writeLinks([row, ...all]);
  return row;
}

export function unassignLocal(reportId: string, userId: string): void {
  writeLinks(readLinks().filter(l => !(l.reportId === reportId && l.user.id === userId)));
}

export function reportsForLocalUser(userId: string): string[] {
  return readLinks().filter(l => l.user.id === userId).map(l => l.reportId);
}
