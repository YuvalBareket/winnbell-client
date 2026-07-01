import { Box, Typography } from '@mui/material';
import QRCode from 'react-qr-code';
import iconBlue  from '../assets/winnbell_icon_blue.svg';
import iconGold  from '../assets/winnbell_icon_gold.svg';
import iconGreen from '../assets/winnbell_icon_green.svg';
import iconPink  from '../assets/winnbell_icon_pink.svg';

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

export const HEADLINES = [
  "Don't miss this month's campaign",
  'You are one scan away',
  'Scan now. See what you unlock.',
];

export const LEGAL_TEXT =
  'This business participates in campaigns operated by Winnbell. No purchase necessary. A purchase will not increase chances of winning. Alternative free entry method available on the platform. 18+. Void where prohibited. Participation opportunities may vary by business and campaign availability. Official Rules at Winnbell.com';

// ── Color palettes per template (html2canvas-safe: solid fills, no shadows/glows) ──
const PALETTE_CLASSIC = { primary: '#195DE2', light: '#4A90E2', accent: '#EEF3FD' };
const PALETTE_DARK    = { primary: '#0D1B2A', frame: '#1a2f47', gold: '#F5B932' };
const PALETTE_FRESH   = { primary: '#059669', dark: '#047857', light: '#34D399', accent: '#F0FDF7' };
const PALETTE_PINK    = { primary: '#EC4899', dark: '#BE185D', light: '#F472B6', accent: '#FDF2F8' };

// ── Shared poster wrapper ─────────────────────────────────────────────────────
export const PosterWrap = ({ children, bg }: { children: React.ReactNode; bg?: string }) => (
  <Box sx={{
    width: POSTER_W, height: POSTER_H, flexShrink: 0,
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden', bgcolor: bg ?? 'white',
  }}>
    {children}
  </Box>
);

export interface PosterProps { businessName: string; scanUrl: string; headline: string }

// ── QR code with centered logo bubble (WhatsApp-style) ───────────────────────
export const QRWithBrand = ({ value, size, fgColor, logoSrc }: {
  value: string; size: number; fgColor?: string; logoSrc?: string;
}) => {
  const bubbleSize = Math.round(size * 0.7);
  const logoSize  = Math.round(size * 0.27);
  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <QRCode value={value} size={size} level='H' fgColor={fgColor} />
      {/* White fade so the centered logo stays legible (required, renders fine in PDF) */}
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: bubbleSize, height: bubbleSize,
        background: 'radial-gradient(circle, rgba(255,255,255,0.82) 15%, rgba(255,255,255,0) 60%, rgba(255,255,255,0) 75%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Box component='img' src={logoSrc ?? '/winnbell_icon.svg'} alt='Winnbell'
          sx={{ height: logoSize, width: 'auto', display: 'block' }} />
      </Box>
    </Box>
  );
};

// Display font for headlines (Coiny is loaded app-wide in index.html). The Dark
// template overrides with a heavy Jakarta for a more luxe, serious feel.
const DISPLAY_FONT = '"Sora", "Plus Jakarta Sans", system-ui, sans-serif';
const SANS_FONT = '"Plus Jakarta Sans", system-ui, sans-serif';

// ── Theme contract for the shared base ────────────────────────────────────────
interface PosterTheme {
  pageBg: string;
  headerBg: string;            // gradient or solid for the brand band
  badgeBg: string;
  badgeText: string;
  headlineColor: string;
  headlineFont?: string;       // defaults to the Coiny display face
  headlineWeight?: number;     // for sans display (Coiny is single-weight)
  qrFg: string;                // QR foreground - always dark/high-contrast on white
  qrFrameBorder: string;
  qrFrameBg: string;
  qrOnDark?: boolean;          // wrap QR in a white card (dark templates)
  logoSrc: string;
  ctaBg: string;
  ctaText: string;
  reassureColor: string;
  footerBg?: string;
  footerBorder: string;
  businessColor: string;
  poweredColor: string;
  legalColor: string;
}

// Single source of truth for layout + fit. Vertical budget (total 414):
// header ~52 + footer ~78 leaves ~284 for the body. The body holds three blocks
// (message / QR / CTA) ~244px tall, distributed with space-evenly so the
// whitespace is balanced and nothing clips. Keep this rhythm when editing.
const PosterBase = ({ businessName, scanUrl, headline, t }: PosterProps & { t: PosterTheme }) => (
  <PosterWrap bg={t.pageBg}>
    {/* Brand band */}
    <Box sx={{
      background: t.headerBg, color: 'white', py: 1.5, px: 3, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Box component='img' src='/winnbell_app_name_white.svg' alt='Winnbell'
        sx={{ height: 28, width: 'auto', objectFit: 'contain' }} />
    </Box>

    {/* Body: three evenly-spaced blocks - message / QR / call to action */}
    <Box sx={{
      flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'space-evenly', px: 3, py: 1, bgcolor: t.pageBg,
    }}>
      {/* Block 1: badge eyebrow + headline (grouped so the badge reads as a kicker) */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
          bgcolor: t.badgeBg, color: t.badgeText, px: 2, py: 0.6, borderRadius: '999px',
          fontFamily: SANS_FONT, fontSize: '8.5px', fontWeight: 800, letterSpacing: 1.4,
          textTransform: 'uppercase', textIndent: '1.4px', mb: 1,
        }}>
          Free to Enter
        </Box>
        <Typography sx={{
          fontFamily: t.headlineFont ?? DISPLAY_FONT, fontWeight: t.headlineWeight ?? 600,
          fontSize: 18, color: t.headlineColor, textAlign: 'center',
          lineHeight: 1.18, letterSpacing: '-0.2px', maxWidth: '95%',
        }}>
          {headline}
        </Typography>
      </Box>

      {/* Block 2: the hero - QR */}
      <Box sx={{ p: 0.75, bgcolor: t.qrFrameBg, borderRadius: 1, border: `3px solid ${t.qrFrameBorder}` }}>
        {t.qrOnDark ? (
          <Box sx={{ bgcolor: 'white', p: '5px', borderRadius: 0.5 }}>
            <QRWithBrand value={scanUrl} size={110} fgColor={t.qrFg} logoSrc={t.logoSrc} />
          </Box>
        ) : (
          <QRWithBrand value={scanUrl} size={110} fgColor={t.qrFg} logoSrc={t.logoSrc} />
        )}
      </Box>

      {/* Block 3: loud CTA + reassurance */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
          bgcolor: t.ctaBg, color: t.ctaText, px: 2.25, py: 0.6, borderRadius: '999px',
          fontFamily: SANS_FONT, fontSize: '9.5px', fontWeight: 800, letterSpacing: 1.2,
          textTransform: 'uppercase', textIndent: '1.2px', mb: 0.75,
        }}>
          Scan Now
        </Box>
        <Typography sx={{
          fontFamily: SANS_FONT, fontSize: '8px', fontWeight: 600, color: t.reassureColor,
          textAlign: 'center', lineHeight: 1.35,
        }}>
          No purchase necessary. Takes seconds.
        </Typography>
      </Box>
    </Box>

    {/* Footer: business + powered + legal */}
    <Box sx={{
      bgcolor: t.footerBg ?? t.pageBg, px: 2, pt: '8px', pb: '6px',
      borderTop: `1px solid ${t.footerBorder}`, flexShrink: 0, textAlign: 'center',
    }}>
      <Typography sx={{ fontFamily: SANS_FONT, fontSize: 12.5, fontWeight: 800, color: t.businessColor, mb: 0.2 }}>{businessName}</Typography>
      <Typography sx={{ fontFamily: SANS_FONT, fontSize: 7.5, color: t.poweredColor, letterSpacing: 0.8, textTransform: 'uppercase', mb: '4px' }}>
        Powered by Winnbell
      </Typography>
      <Typography sx={{ fontFamily: SANS_FONT, fontSize: '5.5px', color: t.legalColor, lineHeight: 1.45 }}>{LEGAL_TEXT}</Typography>
    </Box>
  </PosterWrap>
);

// ── Template 1: Classic Blue ──────────────────────────────────────────────────
export const PosterClassic = (p: PosterProps) => (
  <PosterBase {...p} t={{
    pageBg: 'white',
    headerBg: `linear-gradient(135deg, ${PALETTE_CLASSIC.primary} 0%, ${PALETTE_CLASSIC.light} 100%)`,
    badgeBg: PALETTE_CLASSIC.primary, badgeText: 'white',
    headlineColor: PALETTE_CLASSIC.primary,
    qrFg: PALETTE_CLASSIC.primary, qrFrameBorder: PALETTE_CLASSIC.primary, qrFrameBg: 'white',
    logoSrc: iconBlue,
    ctaBg: PALETTE_CLASSIC.primary, ctaText: 'white',
    reassureColor: '#5f6b7a',
    footerBg: PALETTE_CLASSIC.accent, footerBorder: `${PALETTE_CLASSIC.primary}26`,
    businessColor: PALETTE_CLASSIC.primary, poweredColor: '#8a93a0', legalColor: '#9aa0a6',
  }} />
);

// ── Template 2: Dark Premium ──────────────────────────────────────────────────
export const PosterDark = (p: PosterProps) => (
  <PosterBase {...p} t={{
    pageBg: PALETTE_DARK.primary,
    headerBg: PALETTE_DARK.primary,
    badgeBg: PALETTE_DARK.gold, badgeText: PALETTE_DARK.primary,
    headlineColor: 'white',
    qrFg: PALETTE_DARK.primary, qrFrameBorder: PALETTE_DARK.gold, qrFrameBg: PALETTE_DARK.frame, qrOnDark: true,
    logoSrc: iconGold,
    ctaBg: PALETTE_DARK.gold, ctaText: PALETTE_DARK.primary,
    reassureColor: 'rgba(255,255,255,0.7)',
    footerBg: PALETTE_DARK.primary, footerBorder: `${PALETTE_DARK.gold}40`,
    businessColor: PALETTE_DARK.gold, poweredColor: 'rgba(255,255,255,0.6)', legalColor: 'rgba(255,255,255,0.45)',
  }} />
);

// ── Template 3: Fresh Green ───────────────────────────────────────────────────
export const PosterFresh = (p: PosterProps) => (
  <PosterBase {...p} t={{
    pageBg: 'white',
    headerBg: `linear-gradient(135deg, ${PALETTE_FRESH.dark} 0%, ${PALETTE_FRESH.primary} 60%, ${PALETTE_FRESH.light} 100%)`,
    badgeBg: PALETTE_FRESH.primary, badgeText: 'white',
    headlineColor: '#064e3b',
    qrFg: PALETTE_FRESH.dark, qrFrameBorder: PALETTE_FRESH.primary, qrFrameBg: 'white',
    logoSrc: iconGreen,
    ctaBg: PALETTE_FRESH.primary, ctaText: 'white',
    reassureColor: '#5f6b7a',
    footerBg: PALETTE_FRESH.accent, footerBorder: `${PALETTE_FRESH.primary}26`,
    businessColor: PALETTE_FRESH.dark, poweredColor: '#8a93a0', legalColor: '#9aa0a6',
  }} />
);

// ── Template 4: Light Pink ────────────────────────────────────────────────────
export const PosterPink = (p: PosterProps) => (
  <PosterBase {...p} t={{
    pageBg: 'white',
    headerBg: `linear-gradient(135deg, ${PALETTE_PINK.primary} 0%, ${PALETTE_PINK.light} 60%, #F8B4D5 100%)`,
    badgeBg: PALETTE_PINK.primary, badgeText: 'white',
    headlineColor: '#831843',
    qrFg: PALETTE_PINK.dark, qrFrameBorder: PALETTE_PINK.primary, qrFrameBg: 'white',
    logoSrc: iconPink,
    ctaBg: PALETTE_PINK.primary, ctaText: 'white',
    reassureColor: '#5f6b7a',
    footerBg: PALETTE_PINK.accent, footerBorder: `${PALETTE_PINK.primary}26`,
    businessColor: PALETTE_PINK.dark, poweredColor: '#999', legalColor: '#9aa0a6',
  }} />
);

// ── Template registry ─────────────────────────────────────────────────────────
export const TEMPLATES = [
  { id: 'classic', label: 'Classic Blue',  Component: PosterClassic },
  { id: 'dark',    label: 'Dark Premium',  Component: PosterDark },
  { id: 'fresh',   label: 'Fresh Green',   Component: PosterFresh },
  { id: 'pink',    label: 'Light Pink',    Component: PosterPink },
];
