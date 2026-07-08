import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Box, Typography, Stack, Paper, Button, Chip, CircularProgress,
} from '@mui/material';
import {
  ContentCopy, FileDownload, RecordVoiceOverOutlined,
} from '@mui/icons-material';
import html2canvas from 'html2canvas';
import QRCodePlain from 'react-qr-code';
import {
  PRIMARY_MAIN, BRAND_ICON_BLUE,
} from '../../../shared/colors';
import { svgToPngDataUrl } from '../utils/capture';
import iconMain from '../assets/winnbell_icon_main.svg';
import iconNavy from '../assets/winnbell_icon_navy.svg';
import iconBrand from '../assets/winnbell_icon_brand.svg';

// Sticker color themes
const STICKER_THEMES = [
  { color: PRIMARY_MAIN, icon: iconMain },
  { color: '#0f3a6b', icon: iconNavy },
  { color: BRAND_ICON_BLUE, icon: iconBrand },
];

interface ScriptsTabProps {
  scanUrl: string;
  effectiveLocationId: number | null;
  onToast: (msg: string) => void;
  onRequireLocation: () => void;
}

const SCRIPTS = [
  { label: 'At checkout', text: 'By the way, we\'re on Winnbell. Scan this code, submit your receipt, and you\'re in this month\'s prize draw. It takes seconds.' },
  { label: 'New to Winnbell', text: 'Have you tried Winnbell? Join through our code and you\'ll start off with a welcome entry from us into this month\'s draw.' },
  { label: 'Regulars', text: 'Don\'t forget to submit your receipt for this month\'s Winnbell draw. Scan our code and it opens ready to go.' },
  { label: 'Already a member', text: 'Already on Winnbell? Our code is the fastest way in. It takes you straight to receipt submission with our store already selected.' },
];

const ScriptsTab = ({
  scanUrl,
  effectiveLocationId,
  onToast,
  onRequireLocation,
}: ScriptsTabProps) => {
  const [stickerIdx, setStickerIdx] = useState(0);
  const [downloadingSticker, setDownloadingSticker] = useState(false);

  const stickerRef = useRef<HTMLDivElement>(null);
  const stickerTheme = STICKER_THEMES[stickerIdx];

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      onToast('Script copied to clipboard!');
    });
  };

  // ── Download sticker as PNG: swap SVGs → PNG, html2canvas, then download ──
  const handleDownloadSticker = async () => {
    if (!stickerRef.current) return;
    setDownloadingSticker(true);
    const swaps: Array<{ svg: SVGSVGElement; img: HTMLImageElement }> = [];

    try {
      const svgEls = Array.from(stickerRef.current.querySelectorAll<SVGSVGElement>('svg'));
      for (const svg of svgEls) {
        const pngUrl = await svgToPngDataUrl(svg, 3);
        const img = document.createElement('img');
        img.src = pngUrl;
        const w = svg.clientWidth || Number(svg.getAttribute('width') ?? 150);
        const h = svg.clientHeight || Number(svg.getAttribute('height') ?? 150);
        img.style.cssText = `width:${w}px;height:${h}px;display:block;`;
        svg.parentNode!.insertBefore(img, svg);
        svg.style.display = 'none';
        swaps.push({ svg, img });
      }

      const canvas = await html2canvas(stickerRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false,
        imageTimeout: 0,
      });

      swaps.forEach(({ svg, img }) => { svg.style.display = ''; img.remove(); });

      const link = document.createElement('a');
      link.download = 'winnbell-sticker.png';
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      onToast('Sticker downloaded!');
    } catch (err) {
      swaps.forEach(({ svg, img }) => { svg.style.display = ''; img.remove(); });
      console.error(err);
      onToast('Download failed. Please try again.');
    } finally {
      setDownloadingSticker(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 }}
    >
      <Box sx={{ pb: 4 }}>
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', p: { xs: 2.5, md: 3.5 } }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant='h6' fontWeight={800} gutterBottom>Staff Boost</Typography>
              <Typography variant='body2' color='text.secondary'>Turn every checkout into an entry.</Typography>
            </Box>

            {/* Why it matters callout */}
            <Paper elevation={0} sx={{ borderRadius: 2, bgcolor: `${PRIMARY_MAIN}08`, border: `1px solid ${PRIMARY_MAIN}20`, p: 2.5 }}>
              <Stack direction='row' spacing={2} alignItems='flex-start'>
                <RecordVoiceOverOutlined sx={{ color: PRIMARY_MAIN, fontSize: 24, flexShrink: 0, mt: 0.5 }} />
                <Stack spacing={1} sx={{ flex: 1 }}>
                  <Typography variant='body2' fontWeight={800}>
                    Your team is your best marketing.
                  </Typography>
                  <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
                    A five-second mention at the register is the single biggest driver of scans, far more than any sign. The shops that grow fastest on Winnbell are the ones whose team asks on every order. It costs nothing and takes seconds.
                  </Typography>
                </Stack>
              </Stack>
            </Paper>

            {/* Scripts + Sticker side-by-side */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              {/* LEFT: Scripts in single-column stack */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant='caption' fontWeight={700} color='text.secondary' display='block' sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Scripts your team can use
                </Typography>
                <Stack spacing={2}>
                  {SCRIPTS.map((script, idx) => (
                    <Paper key={idx} elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', p: 2 }}>
                      <Stack spacing={1.5}>
                        <Chip
                          label={script.label}
                          size='small'
                          variant='outlined'
                          sx={{ width: 'fit-content', fontSize: '0.75rem', fontWeight: 700 }}
                        />
                        <Typography variant='body2' sx={{ fontStyle: 'italic', lineHeight: 1.6, color: 'text.primary' }}>
                          "{script.text}"
                        </Typography>
                        <Button
                          fullWidth
                          variant='outlined'
                          size='small'
                          startIcon={<ContentCopy fontSize='small' />}
                          onClick={() => handleCopyText(script.text)}
                          sx={{ textTransform: 'none', fontWeight: 700 }}
                        >
                          Copy
                        </Button>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>

              {/* RIGHT: Sticker card */}
              <Box sx={{ width: { xs: '100%', md: 340 }, flexShrink: 0 }}>
                <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 2.5 }}>
                  <Stack spacing={2.5}>
                    {/* Headline + Subtitle */}
                    <Box>
                      <Typography variant='h6' fontWeight={800} gutterBottom>
                        Be a proud Winnbell partner
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        Add our sticker so customers notice.
                      </Typography>
                    </Box>

                    {/* Sticker preview */}
                    <Box
                      ref={stickerRef}
                      sx={{
                        background: `linear-gradient(160deg, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0) 42%, rgba(0,0,0,0.34) 100%), ${stickerTheme.color}`,
                        borderRadius: '50%',
                        padding: '26px',
                        width: 290,
                        height: 290,
                        alignSelf: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-evenly',
                        alignItems: 'center',
                      }}
                    >
                      {/* Top: Wordmark */}
                      <Box component='img' src='/winnbell_app_name_white.svg' sx={{ height: 22 }} />

                      {/* Middle: QR in white panel */}
                      <Box
                        sx={{
                          borderRadius: '14px',
                          backgroundColor: 'white',
                          padding: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <QRCodePlain value={scanUrl} size={150} level='H' fgColor={stickerTheme.color} />
                      </Box>

                      {/* Bottom: compliance fine print only */}
                      <Typography
                        sx={{
                          color: 'white',
                          fontSize: '0.6rem',
                          textAlign: 'center',
                          opacity: 0.85,
                          letterSpacing: 0.3,
                        }}
                      >
                        No purchase necessary
                      </Typography>
                    </Box>

                    {/* Gradient picker */}
                    <Box>
                      <Typography variant='caption' fontWeight={700} color='text.secondary' display='block' sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Sticker color
                      </Typography>
                      <Stack direction='row' spacing={1.5} justifyContent='center'>
                        {STICKER_THEMES.map((option, i) => (
                          <Box
                            key={i}
                            onClick={() => setStickerIdx(i)}
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: '8px',
                              background: option.color,
                              cursor: 'pointer',
                              border: stickerIdx === i ? `2px solid ${PRIMARY_MAIN}` : '2px solid transparent',
                              boxShadow: stickerIdx === i ? `0 0 0 2px white, 0 0 0 4px ${PRIMARY_MAIN}` : 'none',
                              transition: 'all 0.2s',
                              '&:hover': { borderColor: PRIMARY_MAIN },
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>

                    {/* Download, or a prompt-button that jumps to the location picker */}
                    {effectiveLocationId ? (
                      <Button
                        fullWidth
                        variant='contained'
                        size='large'
                        startIcon={downloadingSticker ? undefined : <FileDownload />}
                        onClick={handleDownloadSticker}
                        disabled={downloadingSticker}
                        sx={{
                          py: 1.2,
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          textTransform: 'none',
                        }}
                      >
                        {downloadingSticker ? <><CircularProgress size={18} color='inherit' sx={{ mr: 1 }} />Generating...</> : 'Download sticker'}
                      </Button>
                    ) : (
                      <Button
                        fullWidth
                        variant='outlined'
                        size='large'
                        onClick={onRequireLocation}
                        sx={{
                          py: 1.2,
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          textTransform: 'none',
                        }}
                      >
                        Choose a location to download
                      </Button>
                    )}
                  </Stack>
                </Paper>
              </Box>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </motion.div>
  );
};

export default ScriptsTab;
