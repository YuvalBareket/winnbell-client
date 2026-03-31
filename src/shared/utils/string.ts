import { PRIMARY_MAIN } from '../colors';

/** Get 2-letter initials from a full name */
export const getUserInitials = (fullName?: string | null): string =>
  fullName
    ? fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

/** Get display label for a user role */
export const getRoleLabel = (isAdmin: boolean, isBusiness: boolean, isManager: boolean): string =>
  isAdmin ? 'Admin' : isBusiness ? 'Partner' : isManager ? 'Manager' : 'Member';

/** Get color for a user role */
export const getRoleColor = (isAdmin: boolean, isBusiness: boolean, isManager: boolean): string =>
  isAdmin ? '#7c3aed' : isBusiness ? '#10b981' : isManager ? '#f59e0b' : PRIMARY_MAIN;
