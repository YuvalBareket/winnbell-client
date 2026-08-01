// ── Poster pure-data constants (no React components) ─────────────────────────
// Kept separate so PosterTemplates.tsx can export components only, satisfying
// the react-refresh/only-export-components lint rule.

// ── Poster dimensions ─────────────────────────────────────────────────────────
// The poster is laid out in DESIGN pixels (1414x2000, exactly the approved design
// canvas) and displayed through a CSS scale() wrapper. Layout in design space keeps
// every font size / spacing value integer-exact to the design; the browser rasterizes
// text at full resolution before scaling, so the preview stays crisp too.
export const DESIGN_W = 1414;
export const DESIGN_H = 2000;

export const POSTER_W = 320;
export const POSTER_H = Math.round(POSTER_W * (DESIGN_H / DESIGN_W)); // 453
export const POSTER_SCALE = POSTER_W / DESIGN_W;

// Thumbnail scale - a unitless decimal fraction (NOT a CSS percentage)
export const THUMB_SCALE = 0.27;
export const THUMB_W = Math.round(POSTER_W * THUMB_SCALE); // ~86px
export const THUMB_H = Math.round(POSTER_H * THUMB_SCALE); // ~122px

// Smaller scale for mobile (4 in a row on ~375px screens)
export const THUMB_SCALE_MOBILE = 0.19;
export const THUMB_W_MOBILE = Math.round(POSTER_W * THUMB_SCALE_MOBILE); // ~61px
export const THUMB_H_MOBILE = Math.round(POSTER_H * THUMB_SCALE_MOBILE); // ~86px

// Approved disclosure text (updated 2026-08-01) - includes the equal-odds sentence and
// the Official Rules pointer. Do not shorten: this is the AMOE compliance disclaimer.
// MUST stay identical to the required-disclosure quote in business-guidelines.md.
export const LEGAL_TEXT =
  'This business participates in campaigns operated by Winnbell. Alternative method of entry available. No purchase necessary to enter or win. Each entry has equal odds of winning, regardless of method of entry. 18+. Void where prohibited. Participation opportunities may vary by business and campaign availability. Official Rules at Winnbell.com';

export interface PosterProps { businessName: string; scanUrl: string; minAmountLabel?: string | null }
