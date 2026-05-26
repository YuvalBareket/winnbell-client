import { Box, Typography } from '@mui/material';
import QRCode from 'react-qr-code';

// ── Poster dimensions (fixed, A4-ish ratio) ───────────────────────────────────
export const POSTER_W = 320;
export const POSTER_H = 452; // ~A4 ratio 1:1.414

// Thumbnail scale - a unitless decimal fraction (NOT a CSS percentage)
export const THUMB_SCALE = 0.27;
export const THUMB_W = Math.round(POSTER_W * THUMB_SCALE); // ~86px
export const THUMB_H = Math.round(POSTER_H * THUMB_SCALE); // ~122px

// Smaller scale for mobile (4 in a row on ~375px screens)
export const THUMB_SCALE_MOBILE = 0.19;
export const THUMB_W_MOBILE = Math.round(POSTER_W * THUMB_SCALE_MOBILE); // ~61px
export const THUMB_H_MOBILE = Math.round(POSTER_H * THUMB_SCALE_MOBILE); // ~86px

export const HEADLINES = [
  'You are one scan away',
  'Sometimes rewards start with a scan',
  'Scan. Submit. See what you unlock.',
];

export const LEGAL_TEXT =
  'This business participates in Winnbell campaigns. No purchase necessary. A purchase will not increase chances of winning. Alternative free entry method available on the platform. 18+. Void where prohibited. Participation opportunities may vary by business and campaign availability. Official Rules at Winnbell.com';

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

// ── Template 1: Classic Blue ──────────────────────────────────────────────────
export const PosterClassic = ({ businessName, scanUrl, headline }: PosterProps) => (
  <PosterWrap>
    {/* Header */}
    <Box sx={{
      background: 'linear-gradient(135deg, #195DE2 0%, #4A90E2 100%)',
      color: 'white', py: 3, px: 3, textAlign: 'center', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Box component='img' src='/winnbell_app_name.png' alt='Winnbell' sx={{ height: 34, width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
    </Box>

    {/* Body */}
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3, py: 2, bgcolor: 'white' }}>
      <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', textAlign: 'center', mb: 3, lineHeight: 1.5 }}>
        {headline}
      </Typography>
      <Box sx={{ p: '10px', border: '3px solid #195DE2', bgcolor: 'white' }}>
        <QRCode value={scanUrl} size={120} level='H' />
      </Box>

    </Box>

    {/* Footer */}
    <Box sx={{ bgcolor: '#EEF3FD', px: 2, pt: '10px', pb: '6px', borderTop: '1px solid rgba(25,93,230,0.15)', flexShrink: 0, textAlign: 'center' }}>
      <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#195DE2', mb: 0.25 }}>{businessName}</Typography>
      <Typography sx={{ fontSize: 9, color: '#888', letterSpacing: 1, textTransform: 'uppercase', mb: '6px' }}>Powered by Winnbell</Typography>
      <Typography sx={{ fontSize: '5.5px', color: '#aaa', lineHeight: 1.45 }}>{LEGAL_TEXT}</Typography>
    </Box>
  </PosterWrap>
);

// ── Template 2: Dark Premium ──────────────────────────────────────────────────
export const PosterDark = ({ businessName, scanUrl, headline }: PosterProps) => (
  <PosterWrap bg='#0D1B2A'>
    {/* Top */}
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', pt: 3, pb: 1.5, flexShrink: 0 }}>
      <Box component='img' src='/winnbell_app_name.png' alt='Winnbell' sx={{ height: 34, width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
    </Box>

    {/* Body */}
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'white', textAlign: 'center', mb: 3, lineHeight: 1.6 }}>
        {headline}
      </Typography>
      {/* Gold-framed QR */}
      <Box sx={{ p: '10px', background: 'linear-gradient(135deg, #F5B932, #E8A020)' }}>
        <Box sx={{ bgcolor: 'white', p: '8px' }}>
          <QRCode value={scanUrl} size={115} level='H' />
        </Box>
      </Box>
    </Box>

    {/* Footer */}
    <Box sx={{ borderTop: '1px solid rgba(245,185,50,0.2)', px: 3, pt: '10px', pb: '6px', textAlign: 'center', flexShrink: 0 }}>
      <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#F5B932', mb: 0.25 }}>{businessName}</Typography>
      <Typography sx={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5, textTransform: 'uppercase', mb: '6px' }}>
        Authorized Winnbell Partner
      </Typography>
      <Typography sx={{ fontSize: '5.5px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.45 }}>{LEGAL_TEXT}</Typography>
    </Box>
  </PosterWrap>
);

// ── Template 3: Fresh Green ───────────────────────────────────────────────────
export const PosterFresh = ({ businessName, scanUrl, headline }: PosterProps) => (
  <PosterWrap>
    {/* Header */}
    <Box sx={{ background: 'linear-gradient(135deg, #059669 0%, #10B981 60%, #34D399 100%)', py: 3, px: 3, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box component='img' src='/winnbell_app_name.png' alt='Winnbell' sx={{ height: 34, width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
    </Box>

    {/* Body */}
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3, py: 2, bgcolor: 'white' }}>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', mb: 3, textAlign: 'center' }}>
        {headline}
      </Typography>
      <Box sx={{ p: '10px', border: '3px solid #10B981', bgcolor: 'white' }}>
        <QRCode value={scanUrl} size={120} level='H' fgColor='#059669' />
      </Box>
    </Box>

    {/* Footer */}
    <Box sx={{ bgcolor: '#F0FDF7', px: 2, pt: '10px', pb: '6px', borderTop: '1px solid rgba(5,150,105,0.15)', flexShrink: 0, textAlign: 'center' }}>
      <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#059669', mb: 0.25 }}>{businessName}</Typography>
      <Typography sx={{ fontSize: 9, color: '#888', letterSpacing: 1, textTransform: 'uppercase', mb: '6px' }}>Powered by Winnbell</Typography>
      <Typography sx={{ fontSize: '5.5px', color: '#aaa', lineHeight: 1.45 }}>{LEGAL_TEXT}</Typography>
    </Box>
  </PosterWrap>
);

// ── Template 4: Light Pink ────────────────────────────────────────────────────
export const PosterPink = ({ businessName, scanUrl, headline }: PosterProps) => (
  <PosterWrap>
    {/* Header */}
    <Box sx={{ background: 'linear-gradient(135deg, #EC4899 0%, #F472B6 60%, #FBCFE8 100%)', py: 3, px: 3, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box component='img' src='/winnbell_app_name.png' alt='Winnbell' sx={{ height: 34, width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
    </Box>

    {/* Body */}
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3, py: 2, bgcolor: 'white' }}>
      <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', textAlign: 'center', mb: 3, lineHeight: 1.5 }}>
        {headline}
      </Typography>
      <Box sx={{ p: '10px', border: '3px solid #EC4899', bgcolor: 'white' }}>
        <QRCode value={scanUrl} size={120} level='H' fgColor='#BE185D' />
      </Box>
    </Box>

    {/* Footer */}
    <Box sx={{ bgcolor: '#FDF2F8', px: 2, pt: '10px', pb: '6px', borderTop: '1px solid rgba(236,72,153,0.15)', flexShrink: 0, textAlign: 'center' }}>
      <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#BE185D', mb: 0.25 }}>{businessName}</Typography>
      <Typography sx={{ fontSize: 9, color: '#aaa', letterSpacing: 1, textTransform: 'uppercase', mb: '6px' }}>Powered by Winnbell</Typography>
      <Typography sx={{ fontSize: '5.5px', color: '#aaa', lineHeight: 1.45 }}>{LEGAL_TEXT}</Typography>
    </Box>
  </PosterWrap>
);

// ── Template registry ─────────────────────────────────────────────────────────
export const TEMPLATES = [
  { id: 'classic', label: 'Classic Blue',  Component: PosterClassic },
  { id: 'dark',    label: 'Dark Premium',  Component: PosterDark },
  { id: 'fresh',   label: 'Fresh Green',   Component: PosterFresh },
  { id: 'pink',    label: 'Light Pink',    Component: PosterPink },
];
