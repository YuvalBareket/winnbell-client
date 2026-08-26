// Funnel analytics tracker (FUNNEL_ANALYTICS_PLAN_2026_08_15.md).
//
// Design contract:
//  - NEVER blocks or breaks UX: fire-and-forget, fail-silent, bounded queue.
//  - Batched: events queue in memory and flush every 5s / at 10 events / on tab-hide
//    (fetch keepalive so the last batch survives navigation and tab close).
//  - Session: one UUID per JOURNEY, in localStorage (NOT sessionStorage - the Supabase
//    email-confirm link opens a new tab and must stay in the same journey), rotated
//    after 30 minutes of inactivity.
//  - The session id also rides every api call as the x-wb-fsid header, so
//    server-authoritative events (account_created, submission_accepted...) join the
//    same journey.
//  - PII-free by construction: callers can only pass event type + whitelisted fields.

import { api } from '../api/client';
import { store } from '../../store/store';

export type FunnelClientEvent =
  | 'scan_landing_viewed'
  | 'join_landing_viewed'
  | 'registration_page_viewed'
  | 'registration_started'
  | 'registration_email_entered'
  | 'terms_accepted'
  | 'registration_submitted'
  | 'registration_failed'
  | 'email_verification_pending'
  | 'profile_setup_viewed'
  | 'submit_page_viewed'
  | 'submit_business_selected'
  | 'submit_amount_entered'
  | 'submit_receipt_id_entered'
  | 'receipt_scan_used'
  | 'submit_image_attached'
  | 'submit_image_upload_failed'
  | 'submit_attempted'
  | 'submission_confirmed_shown';

interface QueuedEvent {
  id: string;
  type: FunnelClientEvent;
  ts: number;
  locationId?: number;
  reason?: 'email_taken' | 'weak_password' | 'provider_error';
  meta?: { preselected?: boolean; stage?: 'convert' | 'upload' };
}

const SESSION_KEY = 'wb_fsid';
const SESSION_IDLE_MS = 30 * 60 * 1000;
const FLUSH_INTERVAL_MS = 5_000;
const FLUSH_AT_COUNT = 10;
const QUEUE_CAP = 50;

const uuid = (): string =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    // Proper v4-shaped fallback (old WebViews): the server validates UUID shape strictly,
    // so a malformed fallback would silently drop every event from those devices.
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });

// ── Session ──────────────────────────────────────────────────────────────────

let cachedSessionId: string | null = null;

const getSessionId = (): string => {
  try {
    const now = Date.now();
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { id?: string; t?: number };
      if (parsed.id && typeof parsed.t === 'number' && now - parsed.t < SESSION_IDLE_MS) {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ id: parsed.id, t: now }));
        cachedSessionId = parsed.id;
        return parsed.id;
      }
    }
    const id = uuid();
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id, t: now }));
    cachedSessionId = id;
    return id;
  } catch {
    // Storage unavailable (private mode edge cases): keep one in-memory id per page life.
    if (!cachedSessionId) cachedSessionId = uuid();
    return cachedSessionId;
  }
};

/** Keep server-side events on the same journey: every api call carries the session id. */
const syncApiHeader = (id: string) => {
  try {
    api.defaults.headers.common['x-wb-fsid'] = id;
  } catch { /* analytics must never throw */ }
};
syncApiHeader(getSessionId());

// ── Queue + flush ────────────────────────────────────────────────────────────

const queue: QueuedEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

const isStandalonePwa = (): boolean => {
  try {
    return window.matchMedia('(display-mode: standalone)').matches
      || (navigator as Navigator & { standalone?: boolean }).standalone === true;
  } catch {
    return false;
  }
};

const flush = (useKeepalive = false): void => {
  if (queue.length === 0) return;
  const events = queue.splice(0, queue.length);
  if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
  try {
    const sessionId = getSessionId();
    syncApiHeader(sessionId);
    const token = store.getState().auth.token;
    const base = String(api.defaults.baseURL ?? '/').replace(/\/?$/, '/');
    void fetch(`${base}events`, {
      method: 'POST',
      keepalive: useKeepalive,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ sessionId, pwa: isStandalonePwa(), events }),
    }).catch(() => { /* dropped events are accepted; the app never notices */ });
  } catch { /* never throw from analytics */ }
};

/** Record one funnel event. Safe to call from anywhere, including render effects.
 *  flushNow: for events that immediately precede a server-emitted counterpart
 *  (submit_attempted, registration_submitted) - flushing right away keeps their
 *  server-side arrival order ahead of the server event instead of up to 5s behind. */
export const trackFunnel = (
  type: FunnelClientEvent,
  fields?: { locationId?: number; reason?: QueuedEvent['reason']; meta?: QueuedEvent['meta']; flushNow?: boolean },
): void => {
  try {
    const { flushNow, ...eventFields } = fields ?? {};
    if (queue.length >= QUEUE_CAP) queue.shift();
    queue.push({ id: uuid(), type, ts: Date.now(), ...eventFields });
    if (flushNow || queue.length >= FLUSH_AT_COUNT) {
      flush();
    } else if (!flushTimer) {
      flushTimer = setTimeout(() => { flushTimer = null; flush(); }, FLUSH_INTERVAL_MS);
    }
  } catch { /* never throw from analytics */ }
};

// Last-chance flush when the tab hides (navigation away, app switch, close).
try {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush(true);
  });
} catch { /* non-browser context */ }
