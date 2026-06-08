import { useState, useEffect, useCallback, useRef } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'install_prompt_dismissed';
const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

const getIsIos = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;

const getIsInStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  ('standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone);

export const useInstallPrompt = () => {
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    const val = localStorage.getItem(DISMISSED_KEY);
    if (!val) return false;
    const ts = parseInt(val, 10);
    if (isNaN(ts)) return true; // legacy "1" value, treat as dismissed
    return Date.now() - ts < FIVE_DAYS_MS;
  });
  const [installed, setInstalled] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const [isIos] = useState(getIsIos);

  useEffect(() => {
    if (getIsInStandalone()) {
      setInstalled(true);
      return;
    }

    // iOS can always "install" via share menu
    if (isIos) {
      setCanInstall(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    const installedHandler = () => {
      setInstalled(true);
      setCanInstall(false);
      deferredPrompt.current = null;
    };
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, [isIos]);

  const install = useCallback(async () => {
    if (!deferredPrompt.current) return false;
    await deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    deferredPrompt.current = null;
    if (outcome === 'accepted') {
      setInstalled(true);
      setCanInstall(false);
      return true;
    }
    return false;
  }, []);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setDismissed(true);
  }, []);

  const trigger = useCallback(() => {
    setTriggered(true);
  }, []);

  return { canInstall, installed, dismissed, triggered, isIos, install, dismiss, trigger };
};
