import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // <--- Import this
import { initViewportUnstick } from './shared/viewportUnstick';

// Heal stale-dvh tab restores (scroll-below-footer bug) - see shared/viewportUnstick.ts
initViewportUnstick();

// TEMPORARY crash reporter (2026-08-08): hunting a white-screen-after-logout report from
// the field. Alerts the first uncaught error / rejection so the device owner can read it.
// One alert max per page load so a crash loop cannot spam. REMOVE once the cause is found.
let crashAlerted = false;
export const alertCrashOnce = (source: string, detail: string) => {
  if (crashAlerted) return;
  crashAlerted = true;
  try { window.alert(`[winnbell debug] ${source}\n${detail.slice(0, 600)}`); } catch { /* alert blocked */ }
};
window.addEventListener('error', (e) => {
  alertCrashOnce('window.error', `${e.message}\n${e.filename ?? ''}:${e.lineno ?? ''}\n${String(e.error?.stack ?? '').split('\n').slice(0, 4).join('\n')}`);
});
window.addEventListener('unhandledrejection', (e) => {
  const r = e.reason;
  alertCrashOnce('unhandledrejection', `${String(r?.message ?? r)}\n${String(r?.stack ?? '').split('\n').slice(0, 4).join('\n')}`);
});

// Stale-deploy self-heal: every build renames the hashed JS chunks, so a tab (or PWA cache)
// from the PREVIOUS deploy fails when it lazily imports a route ("Failed to fetch dynamically
// imported module"). Vite emits 'vite:preloadError' for exactly this; reload once so the
// browser picks up the new index.html + chunk names instead of crashing to the error screen.
// The sessionStorage timestamp guards against a reload loop when the failure is NOT a stale
// deploy (e.g. genuinely offline): one attempt per minute, then let the error surface.
window.addEventListener('vite:preloadError', (event) => {
  const KEY = 'winnbell:chunk-reload-at';
  const last = Number(sessionStorage.getItem(KEY) ?? 0);
  if (Date.now() - last < 60_000) return;
  sessionStorage.setItem(KEY, String(Date.now()));
  event.preventDefault();
  window.location.reload();
});

// Google Fonts loads with media="print" in index.html so it never blocks first paint;
// flipping to 'all' here applies it once the app boots. This used to be an inline
// onload= handler, moved here so the CSP needs no inline-script exception.
const googleFonts = document.getElementById('google-fonts') as HTMLLinkElement | null;
if (googleFonts) googleFonts.media = 'all';

// PWA update handoff: sw.ts activates new versions immediately (skipWaiting + claim).
// When the new SW takes control of this already-open page, reload once so the page's
// code matches the new precache (old lazy chunks are gone after cleanup). The
// hadController guard skips the reload on the very first install, and the refreshed
// flag makes sure we never reload twice.
if ('serviceWorker' in navigator) {
  let hadController = !!navigator.serviceWorker.controller;
  let refreshed = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) { hadController = true; return; }
    if (refreshed) return;
    refreshed = true;
    window.location.reload();
  });
}

// 1. Create the Client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:          60_000,      // data is fresh for 1 min by default
      gcTime:             5 * 60_000,  // keep unused data in cache for 5 min
      retry:              1,           // retry once on network failure
      refetchOnWindowFocus: true,      // re-validate when user tabs back in
    },
  },
});

// Reuse the root across Vite HMR updates. Calling createRoot() twice on the
// same container leaves React with a stale tree and throws
// "removeChild ... not a child of this node" on the next reconcile.
const container = document.getElementById('root')!;
const w = window as unknown as { __APP_ROOT__?: ReactDOM.Root };
const root = w.__APP_ROOT__ ?? ReactDOM.createRoot(container);
w.__APP_ROOT__ = root;

root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
);
