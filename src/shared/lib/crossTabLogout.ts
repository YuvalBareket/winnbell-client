// Cross-tab logout signal. Before F1, a real logout propagated to other tabs via Supabase's
// SIGNED_OUT event; decoupling from Supabase removed that, so we own it here with a
// localStorage broadcast (universally supported in webviews/PWAs). The `storage` event
// fires only in OTHER documents, never the tab that wrote the key — so the initiating tab
// (which already cleared its own state) never double-handles its own broadcast.

const LOGOUT_KEY = 'winnbell_logout_broadcast';

// Tell every other tab/window to log out.
export const broadcastLogout = (): void => {
  try {
    localStorage.setItem(LOGOUT_KEY, String(Date.now()));
  } catch {
    // storage unavailable (private mode edge) — cross-tab logout is best-effort.
  }
};

// Run `handler` in THIS tab whenever another tab broadcasts a logout. Returns an unsubscribe.
export const onCrossTabLogout = (handler: () => void): (() => void) => {
  const listener = (e: StorageEvent) => {
    if (e.key === LOGOUT_KEY && e.newValue) handler();
  };
  window.addEventListener('storage', listener);
  return () => window.removeEventListener('storage', listener);
};
