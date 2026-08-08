import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // <--- Import this
import { initViewportUnstick } from './shared/viewportUnstick';
import { tryRecoverFromStaleDeploy } from './shared/staleDeployRecovery';

// Heal stale-dvh tab restores (scroll-below-footer bug) - see shared/viewportUnstick.ts
initViewportUnstick();

// Stale-deploy self-heal: Vite emits 'vite:preloadError' when a lazily imported chunk
// fails to load (typically because a new deploy renamed the chunks under this old page).
// Escalating recovery lives in shared/staleDeployRecovery.ts: reload, then purge the
// stale service worker + caches and reload, then give up and let the error surface.
window.addEventListener('vite:preloadError', (event) => {
  if (tryRecoverFromStaleDeploy()) event.preventDefault();
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
