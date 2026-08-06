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

import { BG_SUBTLE, TEXT_PRIMARY, ERROR_MAIN, TEXT_TERTIARY } from './colors';

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

// ── Stuck visual viewport sync (permanent; field-diagnosed 2026-08-06) ───────
// iOS Chrome can leave visualViewport.height FROZEN at a native-sheet-era value after
// Share -> Add to Home Screen -> Cancel (owner reproduced 4/4 on staging): layout metrics
// all report the full height (inner/client/dvh 746) while visualViewport stays stuck
// (533) - and the browser PAINTS position:fixed elements against the stuck visual
// viewport, so the bottom nav floats mid-screen over a white void. The dvh-vs-vv
// comparison in check() detects exactly this state, but check() only runs on pageshow /
// visibilitychange and the sheet dismissal fires neither. This hook runs the same
// comparison on vv-resize itself, with the flight recorder's field-proven guards:
// skip keyboard (typing), pinch-zoom, overscroll rubber-banding (pull-to-refresh false
// positive seen 2026-07-15), backgrounding (vvH < 200), and sub-second animation
// transients (900ms confirmation - the real bug persists for minutes). On confirm it
// hands off to check(), which pins --dvh100 to the painted height and un-pins via its
// existing recheck the moment the viewport heals (heal events DO fire - captured).
const VV_CONFIRM_MS = 900;
const VV_MIN_H = 200;
let vvConfirmTimer = 0;

function vvMismatchNow(): boolean {
  const vv = window.visualViewport;
  if (!vv || vv.scale !== 1 || isTyping()) return false;
  if (vv.height < VV_MIN_H) return false; // app-switch/backgrounding reports ~0 momentarily
  if (window.scrollY < -1 || vv.offsetTop < -1) return false; // overscroll rubber-band
  return Math.abs(dvhPx() - vv.height) > MISMATCH_PX;
}

function vvResizeCheck() {
  window.clearTimeout(vvConfirmTimer);
  if (!vvMismatchNow()) return;
  vvConfirmTimer = window.setTimeout(() => {
    if (vvMismatchNow()) check();
  }, VV_CONFIRM_MS);
}

// ── Viewport flight recorder (staging/dev only) ─────────────────────────────
// Trap for the iOS Chrome variant seen 2026-07-15: the browser misplaces
// position:fixed elements mid-session (bottom nav floats mid-screen, then the
// classic scroll-below-footer white void) while every height metric it reports
// may be self-consistently wrong, so the dvh-vs-visualViewport check above never
// fires. The recorder samples every metric we can read at every viewport event,
// keeps a rolling per-tab history (sessionStorage, survives the refreshes that
// do NOT heal this bug), and flags samples where the fixed-position probe
// disagrees with the visual viewport. A small on-screen badge (staging has no
// devtools on iPhone) turns red when something was flagged; tapping it shows
// the samples with a copy button. Pure DOM on purpose - it must keep working
// when the React tree is in a broken-viewport tab.

const RECORDER_ON = import.meta.env.VITE_APP_ENV !== 'production';
const STORE_KEY = 'vv-flight-recorder';
const MAX_SAMPLES = 60;

type VvSample = {
  t: string;          // wall-clock time
  trig: string;       // which event captured it
  innerH: number;
  outerH: number;
  clientH: number;    // documentElement.clientHeight (layout viewport)
  vvH: number | null;
  vvTop: number | null;
  vvScale: number | null;
  dvh: number;        // 100dvh probe
  fixedBottom: number; // fixed bottom:0 probe rect.bottom - where the browser REALLY anchors fixed elements
  screenH: number;
  availH: number;
  scrollY: number;
  pin: string;        // current --dvh100 pin, if any
  typing: boolean;
  flag: boolean;      // raw mismatch in this sample (may be a gesture transient)
  conf?: boolean;     // mismatch persisted through the confirmation re-sample = real
};

let fixedProbe: HTMLDivElement | null = null;
let badge: HTMLButtonElement | null = null;
let panel: HTMLDivElement | null = null;
let hasFlagged = false;

function loadSamples(): VvSample[] {
  try { return JSON.parse(sessionStorage.getItem(STORE_KEY) ?? '[]'); } catch { return []; }
}

function saveSamples(samples: VvSample[]) {
  try { sessionStorage.setItem(STORE_KEY, JSON.stringify(samples.slice(-MAX_SAMPLES))); } catch { /* full/blocked - keep going */ }
}

function takeSample(trig: string): VvSample {
  const vv = window.visualViewport;
  const rect = fixedProbe?.getBoundingClientRect();
  const s: VvSample = {
    t: new Date().toISOString().slice(11, 23),
    trig,
    innerH: window.innerHeight,
    outerH: window.outerHeight,
    clientH: document.documentElement.clientHeight,
    vvH: vv ? Math.round(vv.height) : null,
    vvTop: vv ? Math.round(vv.offsetTop) : null,
    vvScale: vv ? vv.scale : null,
    dvh: dvhPx(),
    fixedBottom: rect ? Math.round(rect.bottom) : -1,
    screenH: screen.height,
    availH: screen.availHeight,
    scrollY: Math.round(window.scrollY),
    pin: document.documentElement.style.getPropertyValue('--dvh100') || 'none',
    typing: isTyping(),
    flag: false,
  };
  // Anomalies (only meaningful unzoomed, without the keyboard, and NOT during an
  // overscroll gesture - pull-to-refresh rubber-banding shows negative offsets and
  // legitimately displaces the viewport for a moment; field false positive 2026-07-15):
  // 1. The browser anchors fixed elements somewhere other than the visual viewport
  //    bottom - this is the "floating footer" state made measurable.
  // 2. The existing stale-dvh mismatch.
  const overscrolled = s.scrollY < -1 || (s.vvTop !== null && s.vvTop < -1);
  if (s.vvScale === 1 && !s.typing && !overscrolled && s.vvH !== null && s.vvTop !== null) {
    const fixedVsViewport = Math.abs(s.fixedBottom - (s.vvH + s.vvTop));
    const dvhVsViewport = Math.abs(s.dvh - s.vvH);
    s.flag = fixedVsViewport > MISMATCH_PX || dvhVsViewport > MISMATCH_PX;
  }
  return s;
}

// The real bug is a PERSISTENT state (sticks for minutes); gesture/animation
// transients last milliseconds. A raw mismatch only turns the badge red if it
// still mismatches on a confirmation re-sample ~1s later.
const CONFIRM_MS = 900;
let confirmPending = false;

function record(trig: string) {
  if (!RECORDER_ON || !fixedProbe) return;
  const s = takeSample(trig);
  const samples = loadSamples();
  samples.push(s);
  saveSamples(samples);
  if (s.flag && !confirmPending) {
    confirmPending = true;
    window.setTimeout(() => {
      confirmPending = false;
      const c = takeSample('confirm');
      c.conf = c.flag;
      const latest = loadSamples();
      latest.push(c);
      saveSamples(latest);
      if (c.conf) {
        hasFlagged = true;
        console.warn(`[viewport] recorder CONFIRMED stale anchor: fixedBottom=${c.fixedBottom} vv=${c.vvH}+${c.vvTop} dvh=${c.dvh}`);
        styleBadge();
      }
    }, CONFIRM_MS);
  }
}

function styleBadge() {
  if (!badge) return;
  badge.textContent = hasFlagged ? 'VV!' : 'VV';
  badge.style.cssText =
    'position:fixed;top:calc(env(safe-area-inset-top, 0px) + 6px);left:6px;z-index:2147483647;' +
    'border:0;border-radius:10px;font:700 10px system-ui;padding:3px 7px;cursor:pointer;' +
    (hasFlagged
      ? `background:${ERROR_MAIN};color:${BG_SUBTLE};opacity:0.95;`
      : `background:${TEXT_TERTIARY};color:${BG_SUBTLE};opacity:0.35;`);
}

function showPanel() {
  panel?.remove();
  panel = document.createElement('div');
  panel.style.cssText =
    'position:fixed;inset:0;z-index:2147483647;background:' + BG_SUBTLE + ';color:' + TEXT_PRIMARY + ';' +
    'font:11px/1.5 monospace;overflow:auto;padding:44px 10px 20px;white-space:pre;';
  const samples = loadSamples();
  const text = samples.map(s =>
    `${s.conf ? '‼ ' : s.flag ? '⚠ ' : '  '}${s.t} ${s.trig} inner=${s.innerH} client=${s.clientH} vv=${s.vvH}+${s.vvTop}@${s.vvScale} dvh=${s.dvh} fixed=${s.fixedBottom} scr=${s.scrollY} pin=${s.pin}${s.typing ? ' kb' : ''}`,
  ).join('\n') || 'no samples yet';
  const bar = document.createElement('div');
  bar.style.cssText = 'position:fixed;top:calc(env(safe-area-inset-top, 0px) + 6px);right:10px;display:flex;gap:8px;';
  const mkBtn = (label: string, onTap: () => void) => {
    const b = document.createElement('button');
    b.textContent = label;
    b.style.cssText = `border:0;border-radius:8px;font:700 12px system-ui;padding:6px 12px;background:${TEXT_PRIMARY};color:${BG_SUBTLE};`;
    b.addEventListener('click', onTap);
    bar.appendChild(b);
  };
  mkBtn('Sample', () => { record('manual'); showPanel(); });
  mkBtn('Copy', () => { navigator.clipboard?.writeText(JSON.stringify(samples)).catch(() => {}); });
  mkBtn('Clear', () => { saveSamples([]); hasFlagged = false; styleBadge(); showPanel(); });
  mkBtn('X', () => { panel?.remove(); panel = null; });
  panel.textContent = text;
  panel.appendChild(bar);
  document.body.appendChild(panel);
}

function debounced(fn: () => void, ms: number) {
  let id = 0;
  return () => { window.clearTimeout(id); id = window.setTimeout(fn, ms); };
}

function initRecorder() {
  if (!RECORDER_ON) return;
  fixedProbe = document.createElement('div');
  fixedProbe.style.cssText = 'position:fixed;bottom:0;left:0;width:1px;height:1px;visibility:hidden;pointer-events:none;';
  document.body.appendChild(fixedProbe);

  hasFlagged = loadSamples().some(s => s.conf);
  badge = document.createElement('button');
  badge.setAttribute('aria-label', 'viewport debug');
  badge.addEventListener('click', () => (panel ? (panel.remove(), (panel = null)) : showPanel()));
  styleBadge();
  document.body.appendChild(badge);

  record('init');
  window.addEventListener('pageshow', () => record('pageshow'));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') record('visible');
  });
  const vv = window.visualViewport;
  vv?.addEventListener('resize', debounced(() => record('vv-resize'), 300));
  vv?.addEventListener('scroll', debounced(() => record('vv-scroll'), 300));
  window.addEventListener('scroll', debounced(() => record('scroll'), 400), { passive: true });
}

export function initViewportUnstick() {
  // pageshow covers bfcache restores and fresh loads; visibilitychange covers frozen-tab
  // wakes. Both are idle-time events - this never runs during scrolling or animations.
  window.addEventListener('pageshow', check);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') check();
  });
  // The stuck-visual-viewport variant announces itself ONLY via a vv resize (no pageshow /
  // visibility event fires when a native sheet is dismissed) - listen there too.
  window.visualViewport?.addEventListener('resize', vvResizeCheck);
  initRecorder();
}
