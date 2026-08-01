import { SquareQR } from './PosterTemplates';
import {
  STICKER_ROUND_SIZE, STICKER_SQUARE_SIZE, STICKER_SQUARE_RADIUS,
} from './stickerConstants';
import type { StickerShape, StickerColorway } from './stickerConstants';

// ─────────────────────────────────────────────────────────────────────────────
// Partner sticker - EXACT replica of the approved "winnbell-sticker-colorways"
// design. All values are design pixels measured from the export:
//   round:  410 circle, pad 29, logo 277x94 (mt 14), card 170 r13 (mt 18), QR 150,
//           caption 11px/600 ls 0.22 (mt 5)
//   square: 308 r24,   pad 19, logo 218x74 (mt 11), card 138 r11 (mt 14), QR 122,
//           caption 10px/600 ls 0.2  (mt 5)
// ─────────────────────────────────────────────────────────────────────────────

const SANS = '"Plus Jakarta Sans", system-ui, sans-serif';

export interface StickerCanvasProps {
  shape: StickerShape;
  colorway: StickerColorway;
  scanUrl: string;
}

// Full-size canvas in design pixels. The root has NO background outside the sticker
// shape, so PNG downloads keep transparent corners (round) / margins.
export const StickerCanvas = ({ shape, colorway, scanUrl }: StickerCanvasProps) => {
  const round = shape === 'round';
  const size = round ? STICKER_ROUND_SIZE : STICKER_SQUARE_SIZE;
  const m = round
    ? { pad: 29, logoW: 277, logoH: 94, logoMt: 14, card: 170, cardR: 13, cardMt: 18, qr: 150, fs: 11, ls: 0.22, capMt: 5 }
    : { pad: 19, logoW: 218, logoH: 74, logoMt: 11, card: 138, cardR: 11, cardMt: 14, qr: 122, fs: 10, ls: 0.2, capMt: 5 };
  const logoSrc = colorway.logoVariant === 'white' ? '/winnbell_app_name_white.svg' : '/winnbell_app_name.svg';

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: round ? '50%' : STICKER_SQUARE_RADIUS,
        background: colorway.bg,
        padding: m.pad,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: SANS,
        flexShrink: 0,
      }}
    >
      <img
        src={logoSrc}
        alt='Winnbell'
        style={{ width: m.logoW, height: m.logoH, marginTop: m.logoMt, objectFit: 'contain', display: 'block' }}
      />
      <div
        style={{
          width: m.card,
          height: m.card,
          background: '#FFFFFF',
          borderRadius: m.cardR,
          marginTop: m.cardMt,
          position: 'relative',
          boxShadow: colorway.cardShadow ?? undefined,
        }}
      >
        <div style={{ position: 'absolute', left: (m.card - m.qr) / 2, top: (m.card - m.qr) / 2, width: m.qr, height: m.qr }}>
          <SquareQR value={scanUrl} size={m.qr} />
        </div>
      </div>
      <div style={{ fontSize: m.fs, fontWeight: 600, letterSpacing: m.ls, color: colorway.textColor, marginTop: m.capMt, whiteSpace: 'nowrap' }}>
        No purchase necessary
      </div>
    </div>
  );
};

// Display wrapper: shows a canvas scaled to the given on-screen width.
export const StickerPreview = ({ displayWidth, ...p }: StickerCanvasProps & { displayWidth: number }) => {
  const size = p.shape === 'round' ? STICKER_ROUND_SIZE : STICKER_SQUARE_SIZE;
  const k = displayWidth / size;
  return (
    <div style={{ width: displayWidth, height: displayWidth, overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ width: size, height: size, transform: `scale(${k})`, transformOrigin: 'top left' }}>
        <StickerCanvas {...p} />
      </div>
    </div>
  );
};
