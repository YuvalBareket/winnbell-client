// Heals the Chrome tab-restore bug where a long-idle tab wakes up with stale dynamic
// viewport metrics: 100dvh resolves LARGER than the actually visible viewport, so every
// page grows a white strip below the fixed footer, and a reload does NOT fix it because
// the viewport state is per-tab. Seen in the wild 2026-07-11 (Chrome, bottom address bar);
// self-heals only on a real viewport event (e.g. switching tabs and back).
//
// How it works: every full-page height in the app is written as var(--dvh100, 100dvh).
// Normally the var is unset, pure CSS 100dvh applies and this module does nothing at all.
// Only at tab-restore moments (pageshow / tab becomes visible) it measures a 100dvh probe
// against visualViewport.height; on a clear mismatch it pins --dvh100 to the real visible
// height, and removes the pin the moment the browser's dvh agrees with reality again.

const MISMATCH_PX = 40; // URL-bar sized differences are normal dvh behavior; only act beyond this

function dvhPx(): number {
  const probe = document.createElement('div');
  probe.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:100dvh;visibility:hidden;pointer-events:none;';
  document.body.appendChild(probe);
  const h = probe.offsetHeight;
  probe.remove();
  return h;
}

function isTyping(): boolean {
  const el = document.activeElement;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA');
}

let active = false;

function clear() {
  if (!active) return;
  active = false;
  document.documentElement.style.removeProperty('--dvh100');
  window.visualViewport?.removeEventListener('resize', recheck);
}

// While the pin is active, track the viewport: drop the pin as soon as the browser's own
// dvh matches reality again; otherwise keep the pin in sync with the visible height.
function recheck() {
  const vv = window.visualViewport;
  if (!vv) { clear(); return; }
  if (Math.abs(dvhPx() - vv.height) <= MISMATCH_PX) {
    clear();
  } else if (vv.scale === 1 && !isTyping()) {
    // Never resize the page under the on-screen keyboard or a pinch-zoomed viewport.
    document.documentElement.style.setProperty('--dvh100', `${Math.round(vv.height)}px`);
  }
}

function check() {
  const vv = window.visualViewport;
  // A pinch-zoomed visual viewport is not comparable to layout pixels, and an open
  // keyboard legitimately shrinks it below 100dvh - skip both entirely.
  if (!vv || vv.scale !== 1 || isTyping()) return;
  const dvh = dvhPx();
  if (Math.abs(dvh - vv.height) > MISMATCH_PX) {
    console.warn(`[viewport] stale 100dvh detected (100dvh=${dvh}px, visible=${Math.round(vv.height)}px) - applying correction`);
    document.documentElement.style.setProperty('--dvh100', `${Math.round(vv.height)}px`);
    if (!active) {
      active = true;
      window.visualViewport?.addEventListener('resize', recheck);
    }
  } else {
    clear();
  }
}

export function initViewportUnstick() {
  // pageshow covers bfcache restores and fresh loads; visibilitychange covers frozen-tab
  // wakes. Both are idle-time events - this never runs during scrolling or animations.
  window.addEventListener('pageshow', check);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') check();
  });
}
