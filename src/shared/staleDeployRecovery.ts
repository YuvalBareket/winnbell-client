// Recovery from a stale deploy: every build renames the hashed JS chunks, so a page (or
// PWA cache) from the PREVIOUS deploy fails when it lazily imports a route - the server
// answers the dead chunk URL with index.html ("text/html is not valid" module error).
// A plain reload usually heals it, but when the OLD service worker still controls the
// page it can keep serving the dead file names from its precache and the reload changes
// nothing - the field failure that motivated this (white screen after logging out during
// a version rollover) needed the SW and CacheStorage dropped before reloading.

const KEY = 'winnbell:stale-recover';

type Attempts = { count: number; at: number };

const readAttempts = (): Attempts => {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(KEY) ?? '') as Attempts;
    return { count: Number(parsed.count) || 0, at: Number(parsed.at) || 0 };
  } catch {
    return { count: 0, at: 0 };
  }
};

// True once a recovery reload has been scheduled on THIS page. Several chunks can fail
// in the same render pass (route + vendor split); every one of them must be suppressed,
// but only one reload scheduled and only one attempt counted. Page-scoped by design:
// the flag resets with the reload itself.
let reloadScheduled = false;

/** Unregister every service worker on this origin and drop CacheStorage, so the next
 *  load fetches a fresh index.html + chunks from the network. Safe: the SW re-registers
 *  and re-precaches on the next successful boot. No-op while offline - the PWA's offline
 *  copy must never be destroyed when the network is the actual problem. Never rejects;
 *  capped at 3 seconds so a hung browser API can never stall the reload behind it
 *  (`caches` is also absent on insecure origins - the try/catch absorbs that). */
export const purgeSwAndCaches = async (): Promise<void> => {
  if (!navigator.onLine) return;
  const purge = (async () => {
    try {
      const regs = (await navigator.serviceWorker?.getRegistrations?.()) ?? [];
      await Promise.allSettled(regs.map((r) => r.unregister()));
    } catch { /* no service worker support */ }
    try {
      const keys = (await caches?.keys?.()) ?? [];
      await Promise.allSettled(keys.map((k) => caches.delete(k)));
    } catch { /* no Cache API */ }
  })();
  await Promise.race([purge, new Promise<void>((resolve) => setTimeout(resolve, 3_000))]);
};

/** Attempt automatic recovery. Attempt 1: plain reload (fast path, heals the common
 *  case). Attempts 2-3: purge the service worker + caches first, in case the old SW is
 *  what keeps serving the dead chunk names. Gives up after 3 attempts inside 5 minutes,
 *  and never fires twice within 3 seconds, so a genuine outage or offline state surfaces
 *  as an error instead of a reload loop. Storage-blocked (private mode) also gives up:
 *  attempts could not be counted, so recovering blind could reload forever.
 *  Known limitation: a beforeunload prompt the user cancels burns an attempt without a
 *  reload - the ErrorBoundary Refresh button remains the counter-free escape hatch.
 *  Returns true when a recovery reload is (already) scheduled - caller should suppress
 *  the error; false when giving up - caller should let the error surface. */
export const tryRecoverFromStaleDeploy = (): boolean => {
  if (reloadScheduled) return true;
  const now = Date.now();
  const stored = readAttempts();
  const at = stored.at;
  const count = now - at > 5 * 60_000 ? 0 : stored.count;
  if (count >= 3 || now - at < 3_000) return false;
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ count: count + 1, at: now }));
  } catch {
    return false;
  }
  reloadScheduled = true;
  void (async () => {
    if (count >= 1) await purgeSwAndCaches();
    window.location.reload();
  })();
  return true;
};
