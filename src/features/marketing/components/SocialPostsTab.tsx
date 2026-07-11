import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, Typography, Stack, Paper, Button, CircularProgress, useMediaQuery, useTheme,
} from '@mui/material';
import { FileDownload, ContentCopy } from '@mui/icons-material';
import {
  GRADIENT_POST_NAVY, GRADIENT_POST_LIGHT, GRADIENT_POST_ORANGE, GRADIENT_POST_PURPLE,
  GRADIENT_DRAW_CARD, GRADIENT_SUCCESS_GREEN, GRADIENT_PRIMARY,
  GOLD_TROPHY, ACCENT_GOLD_LIGHT, ALPHA_WHITE_80,
  PRIMARY_MAIN, TEXT_HEADING, TEXT_SECONDARY, BORDER_SUBTLE,
} from '../../../shared/colors';
import { downloadNodeAsPng } from '../utils/capture';

interface SocialPostsTabProps {
  businessName: string;
  scanUrl: string;
  canDownload: boolean;
  onRequireLocation: () => void;
  onToast: (msg: string) => void;
}

// Ratio presets (drop post-4-5)
type RatioId = 'story' | 'square-1-1';
interface Ratio { id: RatioId; label: string; w: number; h: number }

const RATIOS: Ratio[] = [
  { id: 'square-1-1', label: 'Square · 1:1', w: 540, h: 540 },
  { id: 'story', label: 'Story · 9:16', w: 440, h: 780 },
];

// Style presets: { id, label, background gradient, primary text, accent, fineprint }
interface StylePreset {
  id: string;
  label: string;
  background: string;
  textPrimary: string;
  textAccent: string;
  fineprint: string;
}

const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'navy',
    label: 'Navy',
    background: GRADIENT_POST_NAVY,
    textPrimary: '#fff',
    textAccent: ACCENT_GOLD_LIGHT,
    fineprint: ALPHA_WHITE_80,
  },
  {
    id: 'light',
    label: 'Light',
    background: GRADIENT_POST_LIGHT,
    textPrimary: TEXT_HEADING,
    textAccent: PRIMARY_MAIN,
    fineprint: TEXT_SECONDARY,
  },
  {
    id: 'orange',
    label: 'Orange',
    background: GRADIENT_POST_ORANGE,
    textPrimary: '#fff',
    textAccent: ALPHA_WHITE_80,
    fineprint: ALPHA_WHITE_80,
  },
  {
    id: 'purple',
    label: 'Purple',
    background: GRADIENT_POST_PURPLE,
    textPrimary: '#fff',
    textAccent: ALPHA_WHITE_80,
    fineprint: ALPHA_WHITE_80,
  },
  {
    id: 'draw',
    label: 'Blue',
    background: GRADIENT_DRAW_CARD,
    textPrimary: '#fff',
    textAccent: GOLD_TROPHY,
    fineprint: ALPHA_WHITE_80,
  },
  {
    id: 'success',
    label: 'Green',
    background: GRADIENT_SUCCESS_GREEN,
    textPrimary: '#fff',
    textAccent: '#fff',
    fineprint: ALPHA_WHITE_80,
  },
];

const SocialPostsTab = ({
  businessName,
  scanUrl,
  canDownload,
  onRequireLocation,
  onToast,
}: SocialPostsTabProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [savingImage, setSavingImage] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState<RatioId>('square-1-1');
  const [selectedStyle, setSelectedStyle] = useState<string>('navy');
  const [headline, setHeadline] = useState("This month's draw is live.");
  const [tagline, setTagline] = useState('Shop local.');
  const [subtext, setSubtext] = useState(`Join this month's draw at ${businessName}`);
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

  const handleSaveImage = async () => {
    if (!canDownload) { onRequireLocation(); return; }
    setSavingImage(true);
    try {
      if (imageRef.current) {
        await downloadNodeAsPng(imageRef.current, `winnbell-post-${selectedRatio}.png`, 2);
        onToast('Image downloaded!');
      }
    } catch (err) {
      console.error(err);
      onToast('Download failed. Please try again.');
    } finally {
      setSavingImage(false);
    }
  };

  const handleCopyLink = () => {
    if (!canDownload) { onRequireLocation(); return; }
    navigator.clipboard.writeText(scanUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  // Compute preview dimensions based on ratio
  const previewW = currentRatio.w * previewScale;
  const previewH = currentRatio.h * previewScale;

  // Render the design: adaptive typography and layout per ratio
  const renderDesign = (w: number, h: number, style: StylePreset, isDarkText: boolean) => {
    const isStory = h > w;

    // Scale typography per ratio
    const kickerSize = isStory ? 11 : 10;
    const headlineSize = isStory ? 52 : 48;
    const subtextSize = isStory ? 15 : 13;
    const logoHeight = isStory ? 38 : 34;

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
        {/* Header - Wordmark */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
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
              fontSize: kickerSize,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: style.textAccent,
              mb: 1,
            }}
          >
            {tagline}
          </Typography>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: headlineSize,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              whiteSpace: 'pre-line',
              mb: subtext ? 1.5 : 0,
            }}
          >
            {headline}
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
            'Pick a size and a color, then write your message or keep ours.',
            'Download the PNG and copy your link with the buttons below.',
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
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0,392px) 1fr' },
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

            {/* Headline Input */}
            <Box>
              <Typography sx={{ fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: TEXT_SECONDARY, mb: 1 }}>
                Headline
              </Typography>
              <Box
                component='textarea'
                value={headline}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.length <= 90) setHeadline(val);
                }}
                placeholder='Enter headline'
                rows={3}
                sx={{
                  width: '100%',
                  background: '#f7f9fc',
                  border: '1px solid',
                  borderColor: BORDER_SUBTLE,
                  borderRadius: '12px',
                  p: '12px',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  fontWeight: 800,
                  color: TEXT_HEADING,
                  resize: 'none',
                  '&:focus': {
                    outline: 'none',
                    borderColor: PRIMARY_MAIN,
                  },
                }}
              />
              <Typography sx={{ fontSize: '11px', color: TEXT_SECONDARY, mt: 0.5 }}>
                {headline.length} / 90
              </Typography>
            </Box>

            {/* Tagline + Subtext Grid - single column on narrow screens */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: TEXT_SECONDARY, mb: 1 }}>
                  Tagline
                </Typography>
                <Box
                  component='input'
                  type='text'
                  value={tagline}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.length <= 40) setTagline(val);
                  }}
                  placeholder='Shop local.'
                  sx={{
                    width: '100%',
                    background: '#f7f9fc',
                    border: '1px solid',
                    borderColor: BORDER_SUBTLE,
                    borderRadius: '12px',
                    p: '10px 12px',
                    fontFamily: 'inherit',
                    fontSize: '13px',
                    fontWeight: 800,
                    color: TEXT_HEADING,
                    boxSizing: 'border-box',
                    '&:focus': {
                      outline: 'none',
                      borderColor: PRIMARY_MAIN,
                    },
                  }}
                />
                <Typography sx={{ fontSize: '11px', color: TEXT_SECONDARY, mt: 0.5 }}>
                  {tagline.length} / 40
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: TEXT_SECONDARY, mb: 1 }}>
                  Subtext
                </Typography>
                <Box
                  component='input'
                  type='text'
                  value={subtext}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.length <= 60) setSubtext(val);
                  }}
                  placeholder='Optional'
                  sx={{
                    width: '100%',
                    background: '#f7f9fc',
                    border: '1px solid',
                    borderColor: BORDER_SUBTLE,
                    borderRadius: '12px',
                    p: '10px 12px',
                    fontFamily: 'inherit',
                    fontSize: '13px',
                    fontWeight: 800,
                    color: TEXT_HEADING,
                    boxSizing: 'border-box',
                    '&:focus': {
                      outline: 'none',
                      borderColor: PRIMARY_MAIN,
                    },
                  }}
                />
                <Typography sx={{ fontSize: '11px', color: TEXT_SECONDARY, mt: 0.5 }}>
                  {subtext.length} / 60
                </Typography>
              </Box>
            </Box>

            {/* Color Swatches */}
            <Box>
              <Typography sx={{ fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: TEXT_SECONDARY, mb: 1 }}>
                Color
              </Typography>
              <Stack direction='row' spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1.5 }}>
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
              {/* Column on mobile (two side-by-side labels overflow narrow screens), row on sm+ */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button
                  variant='contained'
                  startIcon={savingImage ? <CircularProgress size={16} color='inherit' /> : <FileDownload sx={{ fontSize: 16 }} />}
                  onClick={handleSaveImage}
                  disabled={savingImage}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    background: GRADIENT_PRIMARY,
                    textTransform: 'none',
                    fontWeight: 800,
                    fontSize: '13px',
                    borderRadius: '12px',
                    py: 1.2,
                  }}
                >
                  {savingImage ? 'Saving...' : 'Download PNG'}
                </Button>

                <Button
                  variant='outlined'
                  startIcon={<ContentCopy sx={{ fontSize: 16 }} />}
                  onClick={handleCopyLink}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    textTransform: 'none',
                    fontWeight: 800,
                    fontSize: '13px',
                    borderRadius: '12px',
                    py: 1.2,
                    borderColor: copiedLink ? 'success.main' : BORDER_SUBTLE,
                    color: copiedLink ? 'success.main' : TEXT_HEADING,
                  }}
                >
                  {copiedLink ? 'Copied!' : 'Copy your link'}
                </Button>
              </Stack>

              <Typography sx={{ fontSize: '12px', color: TEXT_SECONDARY, fontWeight: 500, textAlign: 'center' }}>
                Post it to your story with a link sticker, or drop your link in the caption or bio.
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
