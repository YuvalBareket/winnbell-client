import { PRIMARY_MAIN } from '../colors';

// Show the winner's first name only (keep the surname private). Null-safe, trims whitespace,
// splits on any run of spaces. Falls back to `fallback` when name is absent.
export const winnerFirstName = (name?: string | null, fallback = 'A winner'): string =>
  name ? name.trim().split(/\s+/)[0] : fallback;

/** Get 2-letter initials from a full name */
export const getUserInitials = (fullName?: string | null): string =>
  fullName
    ? fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

/** Get display label for a user role */
export const getRoleLabel = (isAdmin: boolean, isBusiness: boolean, isManager: boolean): string =>
  isAdmin ? 'Admin' : isBusiness ? 'Business' : isManager ? 'Manager' : 'Member';

/** Get color for a user role */
export const getRoleColor = (isAdmin: boolean, isBusiness: boolean, isManager: boolean): string =>
  isAdmin ? '#7c3aed' : isBusiness ? '#10b981' : isManager ? '#f59e0b' : PRIMARY_MAIN;
