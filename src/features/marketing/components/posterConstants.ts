// ── Poster pure-data constants (no React components) ─────────────────────────
// Kept separate so PosterTemplates.tsx can export components only, satisfying
// the react-refresh/only-export-components lint rule.

// ── Poster dimensions ─────────────────────────────────────────────────────────
// Canvas is 1545x2000 = US Letter ratio (8.5x11), so it prints on Letter paper without
// cropping. The composition was authored on the approved 1414x2000 (A4) canvas; widening
// to 1545 for Letter keeps the headline and logo left-anchored while the QR column and the
// 3-step row are centered on the full width and the legal disclosure is bottom-anchored so
// it reaches the end of the flyer. Layout stays in DESIGN pixels and is shown through a CSS scale() wrapper,
// so every font/spacing value stays integer-exact and the browser rasterizes text at full
// resolution before scaling (crisp preview + 1:1 print capture).
export const DESIGN_W = 1545;
export const DESIGN_H = 2000;

// Half-sheet flyer (5.5x8.5 in) - a DIFFERENT aspect ratio (0.647 vs Letter's 0.773),
// so it re-renders the canvas at this width (same 2000 height) rather than scaling the
// Letter image (which would stretch or letterbox). 2000 * 5.5/8.5 = 1294.
export const HALF_DESIGN_W = 1294;

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

export interface PosterProps {
  businessName: string;
  scanUrl: string;
  minAmountLabel?: string | null;
  /** Canvas width in design px. Default DESIGN_W (Letter); pass HALF_DESIGN_W for 5.5x8.5.
   *  The canvas re-flows: text metrics scale by the headline-column ratio, right-anchored
   *  art tracks the edge, centered elements re-center. */
  pageW?: number;
}
