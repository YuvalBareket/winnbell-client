import { isAxiosError } from 'axios';

// Extract the server's error text from an unknown thrown value, with a fallback. Reads both
// conventions the API uses: `{ error }` (stripe/subscription routes) and `{ message }`
// (business/location routes), so a real reason is always surfaced when one exists.
export const apiErrorMessage = (err: unknown, fallback: string): string => {
  const data = isAxiosError(err) ? (err.response?.data as { error?: string; message?: string } | undefined) : undefined;
  return data?.error ?? data?.message ?? fallback;
};

// Machine-readable error code the server may attach alongside the message (e.g.
// RECEIPT_CONTEST_IMAGE_REQUIRED), for branching that must not depend on message text.
export const apiErrorCode = (err: unknown): string | undefined => {
  const data = isAxiosError(err) ? (err.response?.data as { code?: string } | undefined) : undefined;
  return data?.code;
};
