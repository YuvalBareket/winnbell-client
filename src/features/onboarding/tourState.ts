// First-run tour state. Profile-setup completion (a once-per-signup event) arms the flag;
// /scan consumes it and runs the on-screen spotlight tour, so only new consumer signups
// ever see it. localStorage (not server state) on purpose: a per-device "seen it" marker
// is UI state, and re-showing the coach marks after a device switch is harmless.

const TOUR_PENDING_KEY = 'wb_scan_tour_pending';

export const markScanTourPending = (): void => {
  try { localStorage.setItem(TOUR_PENDING_KEY, '1'); } catch { /* private mode: tour just skips */ }
};

export const isScanTourPending = (): boolean => {
  try { return localStorage.getItem(TOUR_PENDING_KEY) === '1'; } catch { return false; }
};

export const clearScanTourPending = (): void => {
  try { localStorage.removeItem(TOUR_PENDING_KEY); } catch { /* nothing to clear */ }
};
