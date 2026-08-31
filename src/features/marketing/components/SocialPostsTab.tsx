import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, Typography, Stack, Paper, Button, CircularProgress, useMediaQuery, useTheme,
} from '@mui/material';
import { FileDownload, ContentCopy, IosShare } from '@mui/icons-material';
import {
  GRADIENT_POST_NAVY, GRADIENT_POST_LIGHT, GRADIENT_POST_ORANGE, GRADIENT_POST_PURPLE,
  GRADIENT_DRAW_CARD, GRADIENT_SUCCESS_GREEN, GRADIENT_PRIMARY,
  GOLD_TROPHY, ACCENT_GOLD_LIGHT, ALPHA_WHITE_80,
  PRIMARY_MAIN, TEXT_HEADING, TEXT_SECONDARY, BORDER_SUBTLE,
} from '../../../shared/colors';
import { captureNodeToBlob, shareImageBlob, triggerBlobDownload } from '../utils/capture';
import { useLocationGatedActions } from '../hooks/useLocationGatedActions';

interface SocialPostsTabProps {
  businessName: string;
  scanUrl: string;
  canDownload: boolean;
  onRequireLocation: () => void;
  /** Parent's location-picker dialog state, used to resume a click after picking */
  locationPickerOpen: boolean;
  /** Bumped on every actual pick - distinguishes picking from dismissing the dialog */
  locationPickVersion: number;
  /** Re-ask the location on every action (owner with 2+ locations) */
  alwaysAskLocation: boolean;
  onToast: (msg: string) => void;
  /** Current draw prize figure baked into the post ("$3,000"). */
  prizeLabel: string;
}

// Ratio presets (drop post-4-5)
type RatioId = 'story' | 'square-1-1';
interface Ratio { id: RatioId; label: string; w: number; h: number }

const RATIOS: Ratio[] = [
  { id: 'story', label: 'Story · 9:16', w: 440, h: 780 },
  { id: 'square-1-1', label: 'Post · 1:1', w: 540, h: 540 },
];

// Style presets: { id, label, background gradient, primary text, accent, fineprint }
interface StylePreset {
  id: string;
  label: string;
  background: string;
  textPrimary: string;
  textAccent: string;
  fineprint: string;
  decorMain: string;       // festive decoration layer colors
}

// ── Festive decoration layer ─────────────────────────────────────────────────
// Confetti, sparkles, rings and prize icons scattered behind the text so the
// post reads as "there's a draw!". One inline SVG: the PNG download pipeline
// rasterizes inner SVGs natively, so the export matches the preview exactly.
const SPARKLE_PATH = 'M12 0 L14.6 9.4 24 12 14.6 14.6 12 24 9.4 14.6 0 12 9.4 9.4 Z';
const TROPHY_PATH = 'M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2M5 8V7h2v3.82C5.84 10.4 5 9.3 5 8m14 0c0 1.3-.84 2.4-2 2.82V7h2z';
const GIFT_PATH = 'M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2m-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1M9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1m11 15H4v-2h16zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20z';
const TICKET_PATH = 'M22 10V6c0-1.11-.9-2-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2m-9 7.5h-2v-2h2zm0-4.5h-2v-2h2zm0-4.5h-2v-2h2z';
const PARTY_PATH = 'm2 22 14-5-9-9zm12.53-9.47 5.59-5.59c.49-.49 1.28-.49 1.77 0l.59.59 1.06-1.06-.59-.59c-1.07-1.07-2.82-1.07-3.89 0l-5.59 5.59zm-4.47-5.65-.59.59 1.06 1.06.59-.59c1.07-1.07 1.07-2.82 0-3.89l-.59-.59-1.06 1.07.59.59c.48.48.48 1.28 0 1.76m7 5-1.59 1.59 1.06 1.06 1.59-1.59c.49-.49 1.28-.49 1.77 0l1.61 1.61 1.06-1.06-1.61-1.61c-1.08-1.07-2.82-1.07-3.89 0m-2-6-3.59 3.59 1.06 1.06 3.59-3.59c1.07-1.07 1.07-2.82 0-3.89l-1.59-1.59-1.06 1.06 1.59 1.59c.48.49.48 1.29 0 1.77';

const BELL_PATH = 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2m6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1z';

// Festive multi-color gradients used to fill the decoration shapes/icons
const DECOR_GRADS: Array<[string, string, string]> = [
  ['dgGold', '#fbe9b8', '#c5a047'],
  ['dgPink', '#ff8fb0', '#ec5a76'],
  ['dgTeal', '#5eead4', '#10b981'],
  ['dgSky', '#63b8ff', '#1565c0'],
  ['dgOrange', '#ffd54f', '#ff8a3d'],
  ['dgPurple', '#c4b5fd', '#8b5cf6'],
];

const DecorLayer = ({ w, h, main }: { w: number; h: number; main: string }) => {
  // Renders a 24-unit icon path at (x,y) with the given pixel size and rotation
  const icon = (d: string, x: number, y: number, size: number, deg: number, fill: string, op: number) => (
    <g transform={`translate(${x},${y}) scale(${size / 24}) rotate(${deg} 12 12)`}>
      <path d={d} fill={fill} opacity={op} />
    </g>
  );
  // Small rotated confetti rect
  const confetti = (x: number, y: number, deg: number, fill: string, op: number) => (
    <rect x={x} y={y} width={10} height={4.5} rx={2.25} fill={fill} opacity={op} transform={`rotate(${deg} ${x + 5} ${y + 2.25})`} />
  );
  const g = (name: string) => `url(#${name})`;
  // Story drops the wordmark ~84px down (below Instagram's username overlay), so
  // the party popper moves up into the freed top-left corner instead of under it.
  const story = h > w;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <defs>
        {DECOR_GRADS.map(([id, from, to]) => (
          <linearGradient key={id} id={id} x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor={from} />
            <stop offset='100%' stopColor={to} />
          </linearGradient>
        ))}
      </defs>

      {/* soft blobs + rings, one per corner zone */}
      <circle cx={w * 0.95} cy={h * 0.04} r={w * 0.17} fill={g('dgGold')} opacity={0.22} />
      <circle cx={w * 0.03} cy={h * 0.97} r={w * 0.14} fill={g('dgPink')} opacity={0.2} />
      <circle cx={w * 0.06} cy={h * 0.3} r={w * 0.055} stroke={g('dgTeal')} strokeWidth={3.5} fill='none' opacity={0.5} />
      <circle cx={w * 0.9} cy={h * 0.85} r={w * 0.045} stroke={g('dgOrange')} strokeWidth={3} fill='none' opacity={0.55} />
      <circle cx={w * 0.55} cy={h * 0.03} r={w * 0.03} stroke={g('dgPink')} strokeWidth={2.5} fill='none' opacity={0.45} />

      {/* prize icons, spread clockwise around the frame edges */}
      {icon(PARTY_PATH, w * 0.06, h * (story ? 0.035 : 0.14), w * 0.1, -8, g('dgOrange'), 0.75)}
      {icon(TROPHY_PATH, w * 0.79, h * 0.1, w * 0.12, 12, g('dgGold'), 0.85)}
      {icon(TICKET_PATH, w * 0.88, h * 0.42, w * 0.085, -18, g('dgPink'), 0.7)}
      {icon(GIFT_PATH, w * 0.82, h * 0.87, w * 0.1, 10, g('dgTeal'), 0.7)}
      {icon(BELL_PATH, w * 0.3, h * 0.9, w * 0.08, -14, g('dgGold'), 0.65)}

      {/* sparkles at the gaps between icons */}
      {icon(SPARKLE_PATH, w * 0.33, h * 0.1, w * 0.05, 15, g('dgGold'), 0.85)}
      {icon(SPARKLE_PATH, w * 0.95, h * 0.26, w * 0.035, 0, g('dgPink'), 0.75)}
      {icon(SPARKLE_PATH, w * 0.03, h * 0.74, w * 0.04, 20, g('dgTeal'), 0.8)}
      {icon(SPARKLE_PATH, w * 0.13, h * 0.82, w * 0.05, 10, g('dgOrange'), 0.8)}
      {icon(SPARKLE_PATH, w * 0.6, h * 0.9, w * 0.032, 0, g('dgPurple'), 0.7)}
      {icon(SPARKLE_PATH, w * 0.68, h * 0.06, w * 0.028, 25, main, 0.55)}

      {/* confetti spread across the whole frame */}
      {confetti(w * 0.16, h * 0.05, 25, g('dgPink'), 0.75)}
      {confetti(w * 0.47, h * 0.1, -15, g('dgTeal'), 0.7)}
      {confetti(w * 0.93, h * 0.15, 60, g('dgPurple'), 0.7)}
      {confetti(w * 0.03, h * 0.22, -35, g('dgGold'), 0.7)}
      {confetti(w * 0.94, h * 0.6, -30, g('dgTeal'), 0.7)}
      {confetti(w * 0.08, h * 0.7, -20, g('dgPurple'), 0.65)}
      {confetti(w * 0.45, h * 0.94, 45, g('dgPink'), 0.7)}
      {confetti(w * 0.72, h * 0.92, -45, g('dgOrange'), 0.7)}

      {/* tiny dots filling the remaining gaps */}
      <circle cx={w * 0.58} cy={h * 0.14} r={3.5} fill={g('dgPink')} opacity={0.7} />
      <circle cx={w * 0.9} cy={h * 0.33} r={3} fill={g('dgGold')} opacity={0.7} />
      <circle cx={w * 0.22} cy={h * 0.95} r={3.5} fill={g('dgSky')} opacity={0.65} />
      <circle cx={w * 0.04} cy={h * 0.09} r={3} fill={g('dgPink')} opacity={0.6} />
      <circle cx={w * 0.75} cy={h * 0.04} r={2.5} fill={main} opacity={0.5} />
      <circle cx={w * 0.96} cy={h * 0.73} r={3} fill={g('dgGold')} opacity={0.65} />
    </svg>
  );
};

const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'navy',
    label: 'Navy',
    background: GRADIENT_POST_NAVY,
    textPrimary: '#fff',
    textAccent: ACCENT_GOLD_LIGHT,
    fineprint: ALPHA_WHITE_80,
    decorMain: '#fff',
  },
  {
    id: 'light',
    label: 'Light',
    background: GRADIENT_POST_LIGHT,
    textPrimary: TEXT_HEADING,
    textAccent: PRIMARY_MAIN,
    fineprint: TEXT_SECONDARY,
    decorMain: PRIMARY_MAIN,
  },
  {
    id: 'orange',
    label: 'Orange',
    background: GRADIENT_POST_ORANGE,
    textPrimary: '#fff',
    textAccent: ALPHA_WHITE_80,
    fineprint: ALPHA_WHITE_80,
    decorMain: '#fff',
  },
  {
    id: 'purple',
    label: 'Purple',
    background: GRADIENT_POST_PURPLE,
    textPrimary: '#fff',
    textAccent: ALPHA_WHITE_80,
    fineprint: ALPHA_WHITE_80,
    decorMain: '#fff',
  },
  {
    id: 'draw',
    label: 'Blue',
    background: GRADIENT_DRAW_CARD,
    textPrimary: '#fff',
    textAccent: GOLD_TROPHY,
    fineprint: ALPHA_WHITE_80,
    decorMain: '#fff',
  },
  {
    id: 'success',
    label: 'Green',
    background: GRADIENT_SUCCESS_GREEN,
    textPrimary: '#fff',
    textAccent: '#fff',
    fineprint: ALPHA_WHITE_80,
    decorMain: '#fff',
  },
];

const SocialPostsTab = ({
  scanUrl,
  canDownload,
  onRequireLocation,
  locationPickerOpen,
  locationPickVersion,
  alwaysAskLocation,
  onToast,
  prizeLabel,
}: SocialPostsTabProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [savingImage, setSavingImage] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState<RatioId>('story');
  const [selectedStyle, setSelectedStyle] = useState<string>('navy');
  // Fixed marketing copy baked into the generated image. No longer user-editable: businesses
  // share the campaign link (shown in the controls) instead of rewriting the post text.
  const headline = 'WE ARE NOW ON WINNBELL!';
  const subtext = 'Every qualifying purchase can enter you into the current cash prize campaign';
  const imageRef = useRef<HTMLDivElement>(null);

  const currentRatio = RATIOS.find((r) => r.id === selectedRatio) || RATIOS[0];
  const currentStyle = STYLE_PRESETS.find((s) => s.id === selectedStyle) || STYLE_PRESETS[0];

  // Preview scale: ~430px tall on desktop, smaller on mobile - and always clamped to the
  // measured pane width so the preview can never overflow a narrow screen.
  const paneRef = useRef<HTMLDivElement>(null);
  const [paneW, setPaneW] = useState<number | null>(null);
  useEffect(() => {
    const el = paneRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setPaneW(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const baseScale = isMobile ? 0.48 : 0.55;
  const previewScale = paneW ? Math.min(baseScale, paneW / currentRatio.w) : baseScale;

  // Touch devices get the native share sheet ("Save Image" to gallery, or straight
  // to Instagram/WhatsApp); desktop gets a plain download.
  const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

  // The rendered image is cached per design, and on touch devices it is captured
  // in the BACKGROUND (debounced) as the design settles. navigator.share only
  // works close to a real tap, and the html2canvas capture is slow enough to burn
  // that window - pre-capturing means the tap shares instantly on the first try.
  // Only inputs that are actually rendered into the image; the scan link is not.
  const captureKey = JSON.stringify([selectedRatio, selectedStyle, headline, subtext, prizeLabel]);
  const blobCacheRef = useRef<{ key: string; blob: Blob } | null>(null);
  const pendingCaptureRef = useRef<{ key: string; promise: Promise<Blob> } | null>(null);

  const startCapture = useCallback((key: string, node: HTMLElement) => {
    const promise = captureNodeToBlob(node, 3, 'jpeg').then((blob) => {
      blobCacheRef.current = { key, blob };
      return blob;
    });
    pendingCaptureRef.current = { key, promise };
    promise.catch(() => {}).finally(() => {
      if (pendingCaptureRef.current?.key === key) pendingCaptureRef.current = null;
    });
    return promise;
  }, []);

  useEffect(() => {
    if (!isTouchDevice) return;
    if (blobCacheRef.current?.key === captureKey || pendingCaptureRef.current?.key === captureKey) return;
    const t = window.setTimeout(() => {
      if (imageRef.current) startCapture(captureKey, imageRef.current).catch(() => {});
    }, 900);
    return () => window.clearTimeout(t);
  }, [captureKey, isTouchDevice, startCapture]);

  const doSaveImage = useCallback(async () => {
    setSavingImage(true);
    try {
      if (!imageRef.current) return;
      // 3x: the story master is 440px wide, so 2x exported under Instagram's
      // 1080px and phones upscaled it soft. 3x = 1320px, sharp on every feed.
      // JPEG keeps the gradient backgrounds small without visible quality loss.
      let blob = blobCacheRef.current?.key === captureKey ? blobCacheRef.current.blob : null;
      if (!blob && pendingCaptureRef.current) {
        // A background capture is running (this design or a stale one): wait for it
        // rather than mutating the same DOM node from two captures at once.
        try { await pendingCaptureRef.current.promise; } catch { /* retried below */ }
        blob = blobCacheRef.current?.key === captureKey ? blobCacheRef.current.blob : null;
      }
      if (!blob) blob = await startCapture(captureKey, imageRef.current);
      const filename = `winnbell-post-${selectedRatio}.jpg`;
      if (isTouchDevice) {
        const result = await shareImageBlob(blob, filename, 'jpeg');
        if (result === 'shared' || result === 'cancelled') return;
        if (result === 'blocked') {
          // Rare: the tap's activation expired before share() (e.g. the user
          // tapped while a fresh design was still rendering). The blob is cached
          // now, so one more tap opens the share sheet instantly.
          onToast('Your image is ready. Tap Post image once more.');
          return;
        }
        // 'unsupported': no share sheet in this browser - deliver as a download
      }
      triggerBlobDownload(blob, filename);
      onToast('Image downloaded!');
    } catch (err) {
      console.error(err);
      onToast('Could not create the image. Please try again.');
    } finally {
      setSavingImage(false);
    }
  }, [captureKey, selectedRatio, isTouchDevice, onToast, startCapture]);

  const doCopyLink = useCallback(() => {
    navigator.clipboard.writeText(scanUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  }, [scanUrl]);

  // Location gate: only the scan LINK is location-specific (it carries ?l=<id>).
  // The post image itself has no location data, so sharing/downloading it never
  // asks for a location.
  const runGated = useLocationGatedActions({
    ready: canDownload,
    pickerOpen: locationPickerOpen,
    requestLocation: onRequireLocation,
    pickVersion: locationPickVersion,
    alwaysAsk: alwaysAskLocation,
    actions: {
      copy: doCopyLink,
    },
  });

  const handleSaveImage = () => { void doSaveImage(); };
  const handleCopyLink = () => runGated('copy');

  // Compute preview dimensions based on ratio
  const previewW = currentRatio.w * previewScale;
  const previewH = currentRatio.h * previewScale;

  // Render the design: adaptive typography and layout per ratio
  const renderDesign = (w: number, h: number, style: StylePreset, isDarkText: boolean) => {
    const isStory = h > w;

    // Scale typography per ratio
    const headlineSize = isStory ? 52 : 48;
    const subtextSize = isStory ? 15 : 13;
    const logoHeight = isStory ? 50 : 44;
    // Prize block mirrors the poster headline: big figure + "This Current Draw." accent
    const prizeSize = isStory ? 64 : 52;
    const prizeDrawSize = isStory ? 27 : 23;

    return (
      <Box
        sx={{
          width: w,
          height: h,
          background: style.background,
          color: style.textPrimary,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
          // No radius/shadow here: the downloaded PNG must be full-bleed. The preview
          // wrapper adds the rounded floating-card look.
          transition: 'background .25s ease',
        }}
      >
        {/* Festive background decorations (behind all text) */}
        <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <DecorLayer w={w} h={h} main={style.decorMain} />
        </Box>

        {/* Header - Wordmark. On story the logo drops below Instagram's username
            overlay (~top 13% of a story is covered by the poster's own handle). */}
        <Box sx={{ position: 'relative', zIndex: 1, mt: isStory ? '74px' : 0 }}>
          <Box
            component='img'
            src={isDarkText ? '/winnbell_app_name.svg' : '/winnbell_app_name_white.svg'}
            alt='Winnbell'
            sx={{ height: logoHeight, display: 'block' }}
          />
        </Box>

        {/* Middle - Content (vertically centered) */}
        <Box sx={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: headlineSize,
              letterSpacing: '-0.03em',
              wordSpacing: '0.18em',
              lineHeight: 1.05,
              whiteSpace: 'pre-line',
              mb: 1.5,
            }}
          >
            {headline}
          </Typography>
          {/* Prize - same structure as the flyer headline: figure in the primary text
              color, "This Current Draw." in the accent. */}
          <Typography sx={{ fontWeight: 800, fontSize: prizeSize, letterSpacing: '-0.03em', lineHeight: 1.05, color: style.textPrimary }}>
            {prizeLabel}
          </Typography>
          <Typography sx={{ fontWeight: 800, fontSize: prizeDrawSize, letterSpacing: '-0.02em', lineHeight: 1.2, color: style.textAccent, mb: subtext ? 1.5 : 0 }}>
            This Current Draw.
          </Typography>
          {subtext && (
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: subtextSize,
                opacity: 0.92,
              }}
            >
              {subtext}
            </Typography>
          )}
        </Box>

        {/* Story only: white pill marking where the Instagram link sticker goes -
            the owner places the real tappable sticker on top of it when posting */}
        {isStory && (
          <Box sx={{ position: 'absolute', bottom: 100, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', zIndex: 1 }}>
            <Box sx={{ bgcolor: '#fff', borderRadius: '999px', px: '18px', py: '10px', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <svg viewBox='0 0 24 24' width={16} height={16} fill={PRIMARY_MAIN}>
                <path d='M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1M8 13h8v-2H8zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5' />
              </svg>
              <Typography sx={{ fontWeight: 800, fontSize: 14, color: PRIMARY_MAIN, lineHeight: 1 }}>
                Put your link here
              </Typography>
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: 13, color: style.textPrimary, textAlign: 'center' }}>
              First entry on us via the link above
            </Typography>
          </Box>
        )}

        {/* Footer - Fine print (matches the QR sticker's legal disclosure) */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography sx={{ color: style.fineprint, fontSize: 11, fontWeight: 600, lineHeight: 1.4, whiteSpace: 'pre-line' }}>
            {'No purchase necessary.\nAlternative method of entry & official rules available at Winnbell.com'}
          </Typography>
        </Box>
      </Box>
    );
  };

  const isDarkText = selectedStyle === 'light';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 }}
    >
      <Box sx={{ pb: 4 }}>
        {/* Section Header */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: '18px', fontWeight: 800, color: TEXT_HEADING, letterSpacing: '-0.01em' }}>
            Design a post in seconds
          </Typography>
          <Typography sx={{ fontSize: '13px', color: TEXT_SECONDARY, fontWeight: 500 }}>
            Type your message and pick a look. Winnbell branding is added automatically.
          </Typography>
        </Box>

        {/* How to do it well - numbered steps like the guide */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: { xs: 1, md: 1.5 },
            mb: 3,
          }}
        >
          {[
            'Pick a size and a color for your post.',
            'Download the image and copy your campaign link with the buttons below.',
            'Post it. Add a link sticker on stories, or put the link in your caption or bio.',
          ].map((text, idx) => (
            <Stack key={idx} direction='row' spacing={1.25} alignItems='flex-start'>
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  bgcolor: `${PRIMARY_MAIN}10`,
                  color: PRIMARY_MAIN,
                  fontSize: '11px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  mt: '1px',
                }}
              >
                {idx + 1}
              </Box>
              <Typography sx={{ fontSize: '12.5px', color: TEXT_SECONDARY, lineHeight: 1.5 }}>
                {text}
              </Typography>
            </Stack>
          ))}
        </Box>

        {/* Main Card */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: '20px',
            border: '1px solid',
            borderColor: BORDER_SUBTLE,
            p: '22px',
            mb: 3,
            display: 'grid',
            // minmax(0, ...) everywhere: a bare 1fr floors at the content's min width, and
            // the nowrap campaign link is wider than a phone - it pushed the whole card
            // past the viewport (swatches and Copy button clipped on small screens).
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 392px) minmax(0, 1fr)' },
            gap: '26px',
            alignItems: 'stretch',
          }}
        >
          {/* Preview Pane */}
          <Box
            ref={paneRef}
            sx={{
              background: 'radial-gradient(120% 120% at 30% 0%, #eef4fd, #e2eaf6)',
              border: '1px solid',
              borderColor: BORDER_SUBTLE,
              borderRadius: '16px',
              p: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              order: { xs: 2, md: 1 },
            }}
          >
            {/* Key only on ratio: switching size re-animates, but typing and color picks
                update in place (style changes ease via the design's CSS transition). */}
            <AnimatePresence mode='wait'>
              <motion.div
                key={selectedRatio}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Box
                  sx={{
                    width: previewW,
                    height: previewH,
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '18px',
                    boxShadow: '0 26px 46px -20px rgba(15,39,71,.55)',
                  }}
                >
                  <Box sx={{ position: 'absolute', top: 0, left: 0, transform: `scale(${previewScale})`, transformOrigin: 'top left' }}>
                    {renderDesign(currentRatio.w, currentRatio.h, currentStyle, isDarkText)}
                  </Box>
                </Box>
              </motion.div>
            </AnimatePresence>
          </Box>

          {/* Controls Pane */}
          <Stack spacing={3} sx={{ order: { xs: 1, md: 2 } }}>
            {/* Size Segmented Control */}
            <Box>
              <Typography sx={{ fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: TEXT_SECONDARY, mb: 1 }}>
                Size
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: '3px',
                  background: '#f7f9fc',
                  border: '1px solid',
                  borderColor: BORDER_SUBTLE,
                  borderRadius: '12px',
                  p: '3px',
                  width: { xs: '100%', sm: '320px' },
                }}
              >
                {RATIOS.map((ratio) => (
                  <motion.button
                    key={ratio.id}
                    onClick={() => setSelectedRatio(ratio.id)}
                    style={{
                      flex: 1,
                      padding: '9px 16px',
                      border: 'none',
                      borderRadius: '10px',
                      background: selectedRatio === ratio.id ? '#fff' : 'transparent',
                      color: selectedRatio === ratio.id ? PRIMARY_MAIN : TEXT_SECONDARY,
                      fontSize: '13px',
                      fontWeight: selectedRatio === ratio.id ? 800 : 600,
                      cursor: 'pointer',
                      boxShadow: selectedRatio === ratio.id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {ratio.label}
                  </motion.button>
                ))}
              </Box>
            </Box>

            {/* Your campaign link — the business must add this to the post so customers can enter */}
            <Box>
              <Typography sx={{ fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: TEXT_SECONDARY, mb: 1 }}>
                Your link
              </Typography>
              <Typography sx={{ fontSize: '12px', color: TEXT_SECONDARY, mb: 1.25, lineHeight: 1.5 }}>
                Add this link to your post so customers can join the campaign - put it in your caption or bio, or as a story link sticker.
              </Typography>
              <Stack direction='row' spacing={1} alignItems='stretch'>
                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    alignItems: 'center',
                    background: '#f7f9fc',
                    border: '1px solid',
                    borderColor: BORDER_SUBTLE,
                    borderRadius: '12px',
                    px: 1.5,
                  }}
                >
                  <Typography noWrap sx={{ fontSize: '13px', fontWeight: 700, color: TEXT_HEADING }}>
                    {scanUrl}
                  </Typography>
                </Box>
                <Button
                  variant='contained'
                  onClick={handleCopyLink}
                  startIcon={<ContentCopy sx={{ fontSize: 16 }} />}
                  sx={{
                    flexShrink: 0,
                    textTransform: 'none',
                    fontWeight: 800,
                    fontSize: '13px',
                    borderRadius: '12px',
                    px: 2,
                    py: 1.2,
                    background: copiedLink ? undefined : GRADIENT_PRIMARY,
                    bgcolor: copiedLink ? 'success.main' : undefined,
                  }}
                >
                  {copiedLink ? 'Copied!' : 'Copy'}
                </Button>
              </Stack>
            </Box>

            {/* Color Swatches */}
            <Box>
              <Typography sx={{ fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: TEXT_SECONDARY, mb: 1 }}>
                Color
              </Typography>
              {/* gap only (no Stack spacing): spacing adds margins ON TOP of the flex gap,
                  double-spacing the row and wrapping the last swatch on phones. */}
              <Stack direction='row' sx={{ flexWrap: 'wrap', gap: 1.5 }}>
                {STYLE_PRESETS.map((preset) => (
                  <motion.div
                    key={preset.id}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Box
                      onClick={() => setSelectedStyle(preset.id)}
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '11px',
                        background: preset.background,
                        cursor: 'pointer',
                        boxShadow: selectedStyle === preset.id ? '0 0 0 2px #fff, 0 0 0 4.5px ' + PRIMARY_MAIN : 'none',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: selectedStyle === preset.id ? '0 0 0 2px #fff, 0 0 0 4.5px ' + PRIMARY_MAIN : '0 4px 12px rgba(0,0,0,0.12)',
                        },
                      }}
                      title={preset.label}
                    />
                  </motion.div>
                ))}
              </Stack>
            </Box>

            {/* Buttons */}
            <Stack spacing={1.5} sx={{ mt: 'auto' }}>
              <Button
                variant='contained'
                startIcon={savingImage ? <CircularProgress size={16} color='inherit' /> : (isTouchDevice ? <IosShare sx={{ fontSize: 16 }} /> : <FileDownload sx={{ fontSize: 16 }} />)}
                onClick={handleSaveImage}
                disabled={savingImage}
                sx={{
                  background: GRADIENT_PRIMARY,
                  textTransform: 'none',
                  fontWeight: 800,
                  fontSize: '13px',
                  borderRadius: '12px',
                  py: 1.2,
                }}
              >
                {savingImage ? 'Preparing...' : (isTouchDevice ? 'Post image' : 'Download image')}
              </Button>

              <Typography sx={{ fontSize: '12px', color: TEXT_SECONDARY, fontWeight: 500, textAlign: 'center' }}>
                Download the image and post it, then add your link (above) in the caption, bio, or a story link sticker.
              </Typography>
            </Stack>
          </Stack>
        </Paper>

        {/* Off-screen full-size master for capture */}
        <Box aria-hidden sx={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
          <Box ref={imageRef} sx={{ width: currentRatio.w, height: currentRatio.h }}>
            {renderDesign(currentRatio.w, currentRatio.h, currentStyle, isDarkText)}
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

export default SocialPostsTab;
