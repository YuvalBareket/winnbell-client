import { useState, useEffect, useCallback, useRef } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'install_prompt_dismissed';
const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

const getIsIos = () => {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream) return true;
  if (/Macintosh/.test(ua) && !/Android/i.test(ua) && 'ontouchend' in document) return true;
  return false;
};

const getIsMobile = () => {
  if (/Android|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i.test(navigator.userAgent)) return true;
  if ('ontouchstart' in window && window.innerWidth < 768) return true;
  return false;
};

const getIsInStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  ('standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone);

// Capture beforeinstallprompt IMMEDIATELY at module load - before React mounts.
// This prevents Chrome from showing its own banner and stores the event for later use.
let earlyPromptEvent: BeforeInstallPromptEvent | null = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  earlyPromptEvent = e as BeforeInstallPromptEvent;
});

export const useInstallPrompt = () => {
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(earlyPromptEvent);
  const [hasNativePrompt, setHasNativePrompt] = useState(!!earlyPromptEvent);
  const [dismissed, setDismissed] = useState(() => {
    const val = localStorage.getItem(DISMISSED_KEY);
    if (!val) return false;
    const ts = parseInt(val, 10);
    if (isNaN(ts)) return true;
    return Date.now() - ts < FIVE_DAYS_MS;
  });
  const [installed, setInstalled] = useState(getIsInStandalone);
  const [triggered, setTriggered] = useState(false);
  const [isIos] = useState(getIsIos);
  const [isMobile] = useState(getIsMobile);

  const canInstall = isMobile && !installed;

  useEffect(() => {
    if (installed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      earlyPromptEvent = null; // no longer needed
      setHasNativePrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    const installedHandler = () => {
      setInstalled(true);
      deferredPrompt.current = null;
    };
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, [installed]);

  const install = useCallback(async () => {
    if (!deferredPrompt.current) return false;
    await deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    deferredPrompt.current = null;
    setHasNativePrompt(false);
    if (outcome === 'accepted') {
      setInstalled(true);
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

  return { canInstall, installed, dismissed, triggered, isIos, isMobile, hasNativePrompt, install, dismiss, trigger };
};
