// ── Sticker pure-data constants (no React components) ────────────────────────
// Exact values measured from the approved "winnbell-sticker-colorways" design.
// Two shapes (round 4in, square 3in) x three colorways.

export const STICKER_ROUND_SIZE = 410;   // design px, 4in artwork
export const STICKER_SQUARE_SIZE = 308;  // design px, 3in artwork
export const STICKER_SQUARE_RADIUS = 24;

export type StickerShape = 'round' | 'square';

export interface StickerColorway {
  id: string;
  label: string;
  bg: string;
  logoVariant: 'white' | 'navy';
  textColor: string;
  /** Small separation shadow for the white QR card - only the ivory colorway needs it. */
  cardShadow: string | null;
}

// The big sticker drop shadows and dashed cut-line circles in the design export are
// gallery presentation, not printable artwork - deliberately not reproduced.
export const STICKER_COLORWAYS: StickerColorway[] = [
  {
    id: 'midnight-blue',
    label: 'Midnight Blue',
    bg: 'linear-gradient(168deg, #0F3A6B 0%, #1565C0 52%, #0A2747 100%)',
    logoVariant: 'white',
    textColor: 'rgba(255,255,255,0.8)',
    cardShadow: null,
  },
  {
    id: 'midnight-ink',
    label: 'Midnight Ink',
    bg: 'linear-gradient(168deg, #0F172A 0%, #0A2747 48%, #0F3A6B 82%, #0A2747 100%)',
    logoVariant: 'white',
    textColor: 'rgba(255,255,255,0.8)',
    cardShadow: null,
  },
  {
    id: 'light-ivory',
    label: 'Light Ivory',
    bg: 'linear-gradient(168deg, #FFFFFF 0%, #EEF4FD 52%, #DCE9FA 100%)',
    logoVariant: 'navy',
    textColor: 'rgba(15,39,71,0.75)',
    cardShadow: '0px 6px 18px -10px rgba(15,39,71,0.4)',
  },
];
