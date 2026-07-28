import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// True auto-update: a freshly installed SW activates immediately (skipWaiting) and takes
// control of open pages (clients.claim) instead of waiting for every tab to close.
// main.tsx reloads the page once when the new SW takes over, so users always run the
// latest deploy on their next visit.
self.skipWaiting();
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(self.clients.claim());
});

// Legacy hook kept for older register scripts that message SKIP_WAITING explicitly.
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return;

  let data: { title: string; body: string; url?: string };
  try {
    data = event.data.json() as { title: string; body: string; url?: string };
  } catch {
    return;
  }
  if (!data.title || !data.body) return;

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/winnbell_icon_192.png',
      badge: '/winnbell_icon_192.png',
      data: { url: data.url ?? '/' },
    }),
  );
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  const rawUrl = (event.notification.data as { url?: string }).url ?? '/';
  // Resolve to an absolute same-origin URL so we can compare it against an open window.
  let target = rawUrl;
  try { target = new URL(rawUrl, self.location.origin).href; } catch { /* keep raw */ }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          const wc = client as WindowClient;
          // App already open: take it to the notification's target BEFORE focusing, otherwise a
          // deep-linked notification (winner announcement, admin broadcast URL) just refocuses the
          // current page and drops the link. navigate() only works for a same-origin, SW-controlled
          // client; if it isn't there / throws / is unsupported we simply focus - never worse than
          // the previous focus-only behaviour.
          if ('navigate' in wc && wc.url !== target) {
            try {
              const navigated = await wc.navigate(target);
              return (navigated ?? wc).focus();
            } catch { /* cross-origin or unsupported — fall through to focus */ }
          }
          return wc.focus();
        }
      }
      return self.clients.openWindow(target);
    }),
  );
});
