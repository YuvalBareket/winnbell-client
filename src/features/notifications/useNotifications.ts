import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../shared/api/client';

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
};

const isSupported =
  typeof window !== 'undefined' &&
  'Notification' in window &&
  'serviceWorker' in navigator &&
  'PushManager' in window;

export const useNotifications = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>(
    isSupported ? Notification.permission : 'denied',
  );

  // Check if there's an active push subscription on mount
  useEffect(() => {
    if (!isSupported) return;
    navigator.serviceWorker.ready.then((reg) =>
      reg.pushManager.getSubscription().then((sub) => setIsSubscribed(!!sub)),
    );
  }, []);

  const { mutateAsync: subscribe, isPending: isSubscribing } = useMutation({
    mutationFn: async () => {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== 'granted') throw new Error('Permission denied');

      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY) as BufferSource,
      });

      await api.post('/notifications/subscribe', subscription.toJSON());
      setIsSubscribed(true);
      return subscription;
    },
  });

  const { mutateAsync: unsubscribe, isPending: isUnsubscribing } = useMutation({
    mutationFn: async () => {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();
      if (subscription) {
        await api.post('/notifications/unsubscribe', { endpoint: subscription.endpoint });
        await subscription.unsubscribe();
      }
      setIsSubscribed(false);
    },
  });

  return {
    subscribe,
    unsubscribe,
    isPending: isSubscribing || isUnsubscribing,
    isSupported,
    isSubscribed,
    permission,
  };
};
