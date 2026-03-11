// ── User Management Types ────────────────────────────────────────
// Da aggiungere al file @/types/index.ts o @/types/user-management.ts

export type UserRole = 'ADMIN' | 'DEV' | 'DOC' | 'USER';

export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  ADMIN: 'Amministratore',
  DEV: 'Developer',
  DOC: 'Dottore',
  USER: 'Paziente',
};

export interface UserManagement {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  enabled: boolean;
  emailVerified: boolean;
  anonymized?: boolean;
  lastLoginAt?: string;
  lastLoginIp?: string;
  createdAt: string;
  deletedAt?: string;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  deleted: number;
}

export interface UserFilters {
  search: string;
  role: string;       // 'ALL' | 'ADMIN' | 'DEV' | 'DOC' | 'USER'
  status: string;     // 'ALL' | 'enabled' | 'disabled' | 'deleted'
  emailVerified: string; // 'ALL' | 'true' | 'false'
}