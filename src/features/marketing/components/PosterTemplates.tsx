import { Box, Typography } from '@mui/material';
import qrcode from 'qrcode-generator';
import { LEGAL_TEXT } from './posterConstants';
import type { PosterProps } from './posterConstants';

// Rounded-dot QR matching the design's module style (0.88 squares, rx 0.16, 0.12 gap).
// Level H tolerates the styling; rendered as a plain inline SVG so the existing
// html2canvas download/print pipeline rasterizes it like any other icon.
const DottedQR = ({ value, size, fgColor }: { value: string; size: number; fgColor: string }) => {
  const qr = qrcode(0, 'H');
  qr.addData(value);
  qr.make();
  const n = qr.getModuleCount();
  const rects: React.ReactNode[] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.isDark(r, c)) {
        rects.push(<rect key={`${r}-${c}`} x={c + 0.06} y={r + 0.06} width={0.88} height={0.88} rx={0.16} fill={fgColor} />);
      }
    }
  }
  return <svg viewBox={`0 0 ${n} ${n}`} width={size} height={size} style={{ display: 'block' }}>{rects}</svg>;
};

// ── Shared poster wrapper ─────────────────────────────────────────────────────
export const PosterWrap = ({ children, bg }: { children: React.ReactNode; bg?: string }) => (
  <Box sx={{
    width: 320, height: 414, flexShrink: 0,
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden', bgcolor: bg ?? 'white',
  }}>
    {children}
  </Box>
);

const SANS = '"Plus Jakarta Sans", system-ui, sans-serif';

// All design-file dimensions (600px-wide flyers) are scaled by 320/600 = 0.533
// to our US Letter canvas. html2canvas rules: no box-shadow, no gradient text.

// ── Inline SVG icons copied from the design file (rasterized on download) ────
const GiftIcon = ({ color, size }: { color: string; size: number }) => (
  <svg viewBox='0 0 24 24' width={size} height={size} fill='none' stroke={color} strokeWidth={2.2} strokeLinecap='round' strokeLinejoin='round'>
    <path d='M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z' />
  </svg>
);

const ArrowUpIcon = ({ color, size }: { color: string; size: number }) => (
  <svg viewBox='0 0 24 24' width={size} height={size} fill='none' stroke={color} strokeWidth={3} strokeLinecap='round' strokeLinejoin='round'>
    <path d='M12 19V5M6 11l6-6 6 6' />
  </svg>
);

const ArrowRightIcon = ({ color, size }: { color: string; size: number }) => (
  <svg viewBox='0 0 24 24' width={size} height={size} fill='none' stroke={color} strokeWidth={3} strokeLinecap='round' strokeLinejoin='round'>
    <path d='M5 12h14M13 6l6 6-6 6' />
  </svg>
);

// Soft radial glow as a real SVG (NOT css radial-gradient: html2canvas redraws
// CSS gradients itself and botches radial ones in the PDF download; inline SVGs
// are rasterized by the browser first, so download matches the preview exactly).
// Eased multi-stop falloff - a single linear stop leaves a visible ring edge.
const GLOW_STOPS: Array<[string, number]> = [
  ['0%', 1], ['20%', 0.85], ['40%', 0.55], ['60%', 0.28], ['80%', 0.09], ['100%', 0],
];

const Glow = ({ color, opacity, size }: { color: string; opacity: number; size: number }) => {
  const id = `glow-${color.replace(/[^a-zA-Z0-9]/g, '')}-${Math.round(opacity * 100)}`;
  return (
    <svg width={size} height={size} style={{ display: 'block' }}>
      <defs>
        <radialGradient id={id}>
          {GLOW_STOPS.map(([offset, a]) => (
            <stop key={offset} offset={offset} stopColor={color} stopOpacity={a * opacity} />
          ))}
        </radialGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
    </svg>
  );
};

// ── QR corner brackets (the design's scan-frame) ─────────────────────────────
const Brackets = ({ color, size, thickness, offset, radius }: {
  color: string; size: number; thickness: number; offset: number; radius: number;
}) => (
  <>
    <Box sx={{ position: 'absolute', top: offset, left: offset, width: size, height: size,
      borderTop: `${thickness}px solid ${color}`, borderLeft: `${thickness}px solid ${color}`,
      borderRadius: `${radius}px 0 0 0` }} />
    <Box sx={{ position: 'absolute', top: offset, right: offset, width: size, height: size,
      borderTop: `${thickness}px solid ${color}`, borderRight: `${thickness}px solid ${color}`,
      borderRadius: `0 ${radius}px 0 0` }} />
    <Box sx={{ position: 'absolute', bottom: offset, left: offset, width: size, height: size,
      borderBottom: `${thickness}px solid ${color}`, borderLeft: `${thickness}px solid ${color}`,
      borderRadius: `0 0 0 ${radius}px` }} />
    <Box sx={{ position: 'absolute', bottom: offset, right: offset, width: size, height: size,
      borderBottom: `${thickness}px solid ${color}`, borderRight: `${thickness}px solid ${color}`,
      borderRadius: `0 0 ${radius}px 0` }} />
  </>
);

// ── Layout A: dark gradient, gold ribbon, stacked SCAN. PLAY. WIN. (1c / 2a) ──
interface ThemeA {
  bg: string;              // page gradient
  accent: string;          // brackets, icons, arrows (gold family)
  winColor: string;        // solid fallback for the gradient "Win." text
  pillBg: string;
  pillBorder: string;
  qrFg: string;
}

const LayoutA = ({ businessName, scanUrl, minAmountLabel, t }: PosterProps & { t: ThemeA }) => (
  <PosterWrap bg='transparent'>
    <Box sx={{
      width: 320, height: 414, position: 'relative', overflow: 'hidden',
      background: t.bg, color: 'white',
      display: 'flex', flexDirection: 'column', p: '24px 26px 18px',
    }}>
      {/* Top row: wordmark + highlighted business name badge */}
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 'auto' }}>
        <Box component='img' src='/winnbell_app_name_white.svg' alt='Winnbell'
          sx={{ height: 22, width: 'auto', objectFit: 'contain' }} />
        <Box sx={{
          border: '1px solid rgba(255,255,255,.3)',
          borderRadius: '999px', p: '4px 9px', maxWidth: 150,
        }}>
          <Typography noWrap sx={{ fontFamily: SANS, fontSize: '9px', fontWeight: 800, color: 'white', letterSpacing: '-0.01em', lineHeight: 1 }}>
            {businessName}
          </Typography>
        </Box>
      </Box>

      {/* Hero: stacked Scan. Play. Win. + prize pill */}
      <Box sx={{ position: 'relative', my: 1 }}>
        <Box sx={{ fontSize: 36, lineHeight: 0.92, fontWeight: 800, letterSpacing: '-1.4px', textTransform: 'uppercase', fontFamily: SANS }}>
          <Typography sx={{ font: 'inherit', letterSpacing: 'inherit', color: 'white' }}>Scan.</Typography>
          <Typography sx={{ font: 'inherit', letterSpacing: 'inherit', color: 'white' }}>Play.</Typography>
          <Typography sx={{ font: 'inherit', letterSpacing: 'inherit', color: t.winColor }}>Win.</Typography>
        </Box>
        <Box sx={{
          display: 'inline-flex', alignItems: 'center', gap: '5px', mt: '11px',
          bgcolor: t.pillBg, border: `1px solid ${t.pillBorder}`, borderRadius: '7px', p: '5px 9px',
        }}>
          <GiftIcon color={t.accent} size={10} />
          <Typography sx={{ fontFamily: SANS, fontSize: '8px', fontWeight: 700, color: 'white' }}>
            Scan to see this month's prize
          </Typography>
        </Box>
      </Box>

      {/* QR block: bracket frame + white card, then SCAN HERE */}
      <Box sx={{ position: 'relative', mt: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ position: 'relative', p: '7px' }}>
          <Brackets color={t.accent} size={17} thickness={2} offset={0} radius={4} />
          <Box sx={{ width: 90, height: 90, bgcolor: 'white', borderRadius: '8px', p: '7px', display: 'flex' }}>
            <DottedQR value={scanUrl} size={76} fgColor={t.qrFg} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px', mt: '9px' }}>
          <Typography sx={{ fontFamily: SANS, fontSize: 12, fontWeight: 800, letterSpacing: '-0.01em', color: 'white', textTransform: 'uppercase' }}>
            Scan here
          </Typography>
          <ArrowUpIcon color={t.accent} size={13} />
        </Box>
        <Typography sx={{ fontFamily: SANS, fontSize: '7px', color: 'rgba(255,255,255,.8)', fontWeight: 600, mt: '6px' }}>
          Free to enter · no app to download
          {minAmountLabel ? ` · receipts of ${minAmountLabel}+ enter the draw` : ''}
        </Typography>
        <Typography sx={{
          fontFamily: SANS, fontSize: '5px', color: 'rgba(255,255,255,.5)', fontWeight: 500,
          mt: '7px', textAlign: 'center', lineHeight: 1.35, maxWidth: 260,
        }}>
          {LEGAL_TEXT}
        </Typography>
      </Box>
    </Box>
  </PosterWrap>
);

// ── Layout B: light editorial, "Your first entry is on us." (1b / 2c) ────────
interface ThemeB {
  bg: string;              // page gradient
  border: string;          // page + ticket card border
  glow: string;            // radial glow color (solid; opacity separate)
  glowOpacity: number;
  giftTileBg: string;      // gradient tile behind the gift icon
  eyebrowColor: string;
  onUsColor: string;       // solid fallback for the gradient "on us." text
  step3Bg: string;         // gradient circle for step 3
  accent: string;          // brackets + arrow
  reassureText: string;
}

const LayoutB = ({ businessName, scanUrl, minAmountLabel, t }: PosterProps & { t: ThemeB }) => (
  <PosterWrap bg='transparent'>
    <Box sx={{
      width: 320, height: 414, position: 'relative', overflow: 'hidden',
      background: t.bg, border: `1px solid ${t.border}`, color: '#0f2747',
      display: 'flex', flexDirection: 'column', p: '22px 24px 16px',
    }}>
      {/* Soft radial glow, top-right */}
      <Box sx={{ position: 'absolute', top: -64, right: -53, pointerEvents: 'none' }}>
        <Glow color={t.glow} opacity={t.glowOpacity} size={203} />
      </Box>

      {/* Top row: colored wordmark + highlighted business name badge */}
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box component='img' src='/winnbell_app_name.svg' alt='Winnbell'
          sx={{ height: 22, width: 'auto', objectFit: 'contain' }} />
        <Box sx={{
          border: `1.5px solid ${t.accent}`,
          borderRadius: '999px', p: '4px 9px', maxWidth: 150,
        }}>
          <Typography noWrap sx={{ fontFamily: SANS, fontSize: '9px', fontWeight: 800, color: '#0f2747', letterSpacing: '-0.01em', lineHeight: 1 }}>
            {businessName}
          </Typography>
        </Box>
      </Box>

      {/* Hero: gift tile, eyebrow, headline, body */}
      <Box sx={{ position: 'relative', mt: 'auto' }}>
        <Box sx={{
          width: 22, height: 22, borderRadius: '7px', background: t.giftTileBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', mb: '9px',
        }}>
          <GiftIcon color='#fff' size={12} />
        </Box>
        <Typography sx={{
          fontFamily: SANS, fontSize: '7px', fontWeight: 800, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: t.eyebrowColor, mb: '5px',
        }}>
          A lucky start
        </Typography>
        <Typography sx={{ fontFamily: SANS, fontSize: 31, lineHeight: 0.98, fontWeight: 800, letterSpacing: '-1.1px', color: '#0f2747' }}>
          Your first<br />entry is <Box component='span' sx={{ color: t.onUsColor }}>on us.</Box>
        </Typography>
        <Typography sx={{ fontFamily: SANS, fontSize: '8.5px', lineHeight: 1.55, color: '#475569', fontWeight: 500, maxWidth: 215, mt: '9px' }}>
          Join Winnbell here and we'll drop a <Box component='b' sx={{ color: '#0f2747' }}>free entry</Box> into
          this month's draw. Scan to see what's up for grabs.
        </Typography>
      </Box>

      {/* Steps 1-2-3 */}
      <Box sx={{ position: 'relative', display: 'flex', gap: '6px', mt: '14px' }}>
        {[
          { n: '1', label: 'Scan the code', bg: '#0f2747' },
          { n: '2', label: 'Join in seconds', bg: '#0f2747' },
          { n: '3', label: 'Your entry lands free', bg: t.step3Bg },
        ].map((s) => (
          <Box key={s.n} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '4px' }}>
            <Box sx={{
              width: 15, height: 15, borderRadius: '50%', background: s.bg, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Typography sx={{ fontFamily: SANS, fontSize: '7.5px', fontWeight: 800, lineHeight: 1 }}>{s.n}</Typography>
            </Box>
            <Typography sx={{ fontFamily: SANS, fontSize: '7px', fontWeight: 700, color: '#0f2747', lineHeight: 1.35 }}>
              {s.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* QR ticket card: QR left, copy right */}
      <Box sx={{
        position: 'relative', mt: 'auto', display: 'flex', alignItems: 'center', gap: '11px',
        bgcolor: '#fff', border: `1px solid ${t.border}`, borderRadius: '10px', p: '10px',
      }}>
        <Box sx={{ position: 'relative', flexShrink: 0 }}>
          <Brackets color={t.accent} size={13} thickness={2} offset={-3} radius={4} />
          <Box sx={{ width: 74, height: 74, bgcolor: '#fff', borderRadius: '6px', p: '5px', display: 'flex' }}>
            <DottedQR value={scanUrl} size={64} fgColor='#0f2747' />
          </Box>
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Typography sx={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 800, letterSpacing: '-0.02em', color: '#0f2747' }}>
              Scan to join
            </Typography>
            <ArrowRightIcon color={t.accent} size={11} />
          </Box>
          <Typography sx={{ fontFamily: SANS, fontSize: '7px', color: '#475569', fontWeight: 500, lineHeight: 1.45, mt: '3px' }}>
            {t.reassureText}
            {minAmountLabel ? ` Receipts of ${minAmountLabel}+ enter the draw.` : ''}
          </Typography>
          <Typography sx={{ fontFamily: SANS, fontSize: '5px', color: '#94a3b8', fontWeight: 500, mt: '5px', lineHeight: 1.35 }}>
            {LEGAL_TEXT}
          </Typography>
        </Box>
      </Box>
    </Box>
  </PosterWrap>
);

// ── Template 1: Bold Blue (design 1c) ─────────────────────────────────────────
export const PosterBlue = (p: PosterProps) => (
  <LayoutA {...p} t={{
    bg: 'linear-gradient(200deg, #63b8ff 0%, #2196f3 28%, #1565c0 55%, #0e3a70 80%, #0a2747 100%)',
    accent: '#c5a047',
    winColor: '#e0c47f',
    pillBg: 'rgba(255,255,255,.12)',
    pillBorder: 'rgba(255,255,255,.2)',
    qrFg: '#0f2747',
  }} />
);

// ── Template 2: Emerald (design 2a) ───────────────────────────────────────────
export const PosterEmerald = (p: PosterProps) => (
  <LayoutA {...p} t={{
    bg: 'linear-gradient(200deg, #5eead4 0%, #34d399 28%, #10b981 55%, #0a6e5c 80%, #053b3a 100%)',
    accent: '#fbe9b8',
    winColor: '#e0c47f',
    pillBg: 'rgba(255,255,255,.14)',
    pillBorder: 'rgba(255,255,255,.24)',
    qrFg: '#0f2747',
  }} />
);

// ── Template 3: Cream Gold (design 1b) ────────────────────────────────────────
export const PosterCream = (p: PosterProps) => (
  <LayoutB {...p} t={{
    bg: 'linear-gradient(168deg, #fffdf6 0%, #fbf3d9 30%, #f6e8bd 55%, #eeda9d 78%, #e2c87e 100%)',
    border: '#efe4c4',
    glow: '#c5a047',
    glowOpacity: 0.22,
    giftTileBg: 'linear-gradient(135deg, #c5a047, #a0822f)',
    eyebrowColor: '#a0822f',
    onUsColor: '#b2913b',
    step3Bg: 'linear-gradient(135deg, #c5a047, #a0822f)',
    accent: '#c5a047',
    reassureText: 'Free to enter · no app to download · winners drawn monthly.',
  }} />
);

// ── Template 4: Sunset Pink (design 2c) ───────────────────────────────────────
export const PosterSunset = (p: PosterProps) => (
  <LayoutB {...p} t={{
    bg: 'linear-gradient(168deg, #fff7f8 0%, #ffe6ec 30%, #ffd0dc 55%, #ffb6c9 78%, #ff9cb6 100%)',
    border: '#ffd2db',
    glow: '#ec5a76',
    glowOpacity: 0.24,
    giftTileBg: 'linear-gradient(135deg, #ffa9be, #ec5a76)',
    eyebrowColor: '#c94a68',
    onUsColor: '#f57493',
    step3Bg: 'linear-gradient(135deg, #ffa9be, #ec5a76)',
    accent: '#ec5a76',
    reassureText: 'Free to enter · no app · winners drawn monthly.',
  }} />
);
