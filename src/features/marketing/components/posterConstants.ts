// ── Poster pure-data constants (no React components) ─────────────────────────
// Kept separate so PosterTemplates.tsx can export components only, satisfying
// the react-refresh/only-export-components lint rule.

// ── Poster dimensions (US Letter ratio 8.5:11 = 1:1.294) ─────────────────────
export const POSTER_W = 320;
export const POSTER_H = 414; // US Letter ratio 1:1.294

// Thumbnail scale - a unitless decimal fraction (NOT a CSS percentage)
export const THUMB_SCALE = 0.27;
export const THUMB_W = Math.round(POSTER_W * THUMB_SCALE); // ~86px
export const THUMB_H = Math.round(POSTER_H * THUMB_SCALE); // ~122px

// Smaller scale for mobile (4 in a row on ~375px screens)
export const THUMB_SCALE_MOBILE = 0.19;
export const THUMB_W_MOBILE = Math.round(POSTER_W * THUMB_SCALE_MOBILE); // ~61px
export const THUMB_H_MOBILE = Math.round(POSTER_H * THUMB_SCALE_MOBILE); // ~86px

export const LEGAL_TEXT =
  'This business participates in campaigns operated by Winnbell. No purchase necessary. A purchase will not increase chances of winning. Alternative method of entry available on the platform. 18+. Void where prohibited. Participation opportunities may vary by business and campaign availability. Official Rules at Winnbell.com';

export interface PosterProps { businessName: string; scanUrl: string; minAmountLabel?: string | null }
