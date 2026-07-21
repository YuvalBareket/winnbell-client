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
  const url = (event.notification.data as { url: string }).url;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return (client as WindowClient).focus();
      }
      return self.clients.openWindow(url);
    }),
  );
});
