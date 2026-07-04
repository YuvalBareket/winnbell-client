import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import AppPageHero from '../../../shared/components/AppPageHero';
import {
  Box, Container, Typography, Stack, Paper, Button, Chip,
  useMediaQuery, useTheme, Snackbar, Alert,
  CircularProgress, Autocomplete, TextField,
  Dialog, DialogTitle, List, ListItemButton, ListItemIcon, ListItemText,
} from '@mui/material';
import { LocationOnOutlined } from '@mui/icons-material';
import {
  ContentCopy, FileDownload, Print,
  CheckCircleOutline, Check, RecordVoiceOverOutlined, StarRounded, QrCode2,
} from '@mui/icons-material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import QRCodePlain from 'react-qr-code';
import { useAppSelector } from '../../../store/hook';
import { selectIsBusiness, selectIsLocationManager, selectCurrentUser } from '../../../store/selectors/authSelectors';
import { useBusinessData } from '../../partner/hooks/useBusinessData';
import {
   PRIMARY_MAIN, PRIMARY_DEEP, BRAND_ICON_BLUE, MOBILE_CONTENT_HEIGHT,
   SHADOW_CARD, GOLD_TROPHY, ACCENT_GOLD_LIGHT, ALPHA_WHITE_15, ALPHA_WHITE_20, ALPHA_WHITE_80, TEXT_HEADING,
} from '../../../shared/colors';
import { ReadyToShare } from '../components/ShareCards';
import { svgToPngDataUrl, downloadNodeAsPng } from '../utils/capture';
import { useGetDraws } from '../../draw/hooks/useGetDraws';
import { formatCurrency } from '../../../shared/utils/date';
import {
  POSTER_W, POSTER_H,
  THUMB_SCALE, THUMB_W, THUMB_H,
  THUMB_SCALE_MOBILE, THUMB_W_MOBILE, THUMB_H_MOBILE,
  HEADLINES, TEMPLATES, QRWithBrand,
} from '../components/PosterTemplates';
import iconMain from '../assets/winnbell_icon_main.svg';
import iconNavy from '../assets/winnbell_icon_navy.svg';
import iconBrand from '../assets/winnbell_icon_brand.svg';

// Sticker color themes: one solid color per swatch used for the background, the QR, and the icon.
const STICKER_THEMES = [
  { color: PRIMARY_MAIN, icon: iconMain },      // #1565c0
  { color: PRIMARY_DEEP, icon: iconNavy },      // #0f3a6b navy
  { color: BRAND_ICON_BLUE, icon: iconBrand },  // #195DE2 bright blue
];

// ── Page ──────────────────────────────────────────────────────────────────────
const MarketingPage = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isBusiness = useAppSelector(selectIsBusiness);
  const isManager = useAppSelector(selectIsLocationManager);
  const currentUser = useAppSelector(selectCurrentUser);
  const { data: businessData } = useBusinessData(isBusiness);
  // Live draw prize for the "Prize post" share card (card hidden when no open draw).
  const { data: activeDraws } = useGetDraws();
  const openDraw = activeDraws?.find((d) => d.status?.toLowerCase() === 'open') ?? activeDraws?.[0];
  const prizeLabel = openDraw?.prize_amount != null ? formatCurrency(openDraw.prize_amount) : null;

  // State
  const [selectedId, setSelectedId] = useState('classic');
  const [headline, setHeadline] = useState(HEADLINES[0]);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadingSticker, setDownloadingSticker] = useState(false);
  const [snackbar, setSnackbar] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState<number | ''>('');
  const [playbook, setPlaybook] = useState([false, false, false, false]);
  const [stickerIdx, setStickerIdx] = useState(0);
  const stickerTheme = STICKER_THEMES[stickerIdx];

  // Refs for scroll-to-section
  const topRef = useRef<HTMLDivElement>(null);
  const playRef = useRef<HTMLDivElement>(null);
  const staffRef = useRef<HTMLDivElement>(null);
  const postersRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const stickerRef = useRef<HTMLDivElement>(null);
  const heroQrRef = useRef<HTMLDivElement>(null);
  const [downloadingQr, setDownloadingQr] = useState(false);
  // "Choose a location" buttons open this picker directly (no scroll-to-top hunting).
  const [locPickerOpen, setLocPickerOpen] = useState(false);

  // Load playbook from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('winnbell_grow_playbook');
    if (saved) {
      try {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) setPlaybook([Boolean(arr[0]), Boolean(arr[1]), Boolean(arr[2]), Boolean(arr[3])]);
      } catch {}
    }
  }, []);

  // Save playbook to localStorage
  const updatePlaybook = (index: number) => {
    const updated = [...playbook];
    updated[index] = !updated[index];
    setPlaybook(updated);
    localStorage.setItem('winnbell_grow_playbook', JSON.stringify(updated));
  };

  const businessName = businessData?.name ?? 'Your Business';
  const locations = (isBusiness ? businessData?.locations?.filter((l) => l.is_active) : []) ?? [];

  const effectiveLocationId = isManager
    ? currentUser?.location_id ?? null
    : (selectedLocationId || (locations.length === 1 ? locations[0].id : null));

  const baseScanUrl = effectiveLocationId
    ? `${window.location.origin}/scan?l=${effectiveLocationId}`
    : window.location.origin;

  const scanUrl = baseScanUrl;

  const thumbScale = isDesktop ? THUMB_SCALE : THUMB_SCALE_MOBILE;
  const thumbW = isDesktop ? THUMB_W : THUMB_W_MOBILE;
  const thumbH = isDesktop ? THUMB_H : THUMB_H_MOBILE;

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleCopyScanUrl = () => {
    navigator.clipboard.writeText(scanUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setSnackbar('Script copied to clipboard!');
    });
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Download just the hero QR (white panel) as a PNG.
  const handleDownloadQr = async () => {
    if (!heroQrRef.current) return;
    setDownloadingQr(true);
    try {
      await downloadNodeAsPng(heroQrRef.current, 'winnbell-scan-qr.png', 3);
      setSnackbar('QR downloaded!');
    } catch (err) {
      console.error(err);
      setSnackbar('Download failed. Please try again.');
    } finally {
      setDownloadingQr(false);
    }
  };

  // ── PDF download: swap SVGs → PNG imgs before html2canvas ─────────────────
  const handleDownload = async () => {
    if (!posterRef.current) return;
    setDownloading(true);
    const selected = TEMPLATES.find(t => t.id === selectedId) ?? TEMPLATES[0];
    const swaps: Array<{ svg: SVGSVGElement; img: HTMLImageElement }> = [];
    const logoSwaps: Array<{ img: HTMLImageElement; originalSrc: string }> = [];

    // Remove mobile CSS transform so html2canvas captures at full size
    const scaleWrapper = posterRef.current.parentElement;
    const savedTransform = scaleWrapper?.style.transform ?? '';
    const savedMarginBottom = scaleWrapper?.style.marginBottom ?? '';
    if (scaleWrapper) {
      scaleWrapper.style.transform = 'none';
      scaleWrapper.style.marginBottom = '0';
    }

    try {
      // 1. Convert every SVG inside the poster to a PNG img
      const svgEls = Array.from(posterRef.current.querySelectorAll<SVGSVGElement>('svg'));
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

      // 2. Capture poster canvas - use explicit pixel dimensions to avoid shadow bleed
      const canvas = await html2canvas(posterRef.current, {
        scale: 3,
        width: POSTER_W,
        height: POSTER_H,
        useCORS: true,
        backgroundColor: null,
        logging: false,
        imageTimeout: 0,
      });

      // 3. Restore SVGs and logo imgs
      swaps.forEach(({ svg, img }) => {
        svg.style.display = '';
        img.remove();
      });
      logoSwaps.forEach(({ img, originalSrc }) => { img.src = originalSrc; });

      // 4. Build PDF - US Letter, image fills entire page
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pageW, pageH);
      pdf.save(`winnbell-${selected.id}-poster.pdf`);
      setSnackbar('Poster downloaded!');
    } catch (err) {
      swaps.forEach(({ svg, img }) => { svg.style.display = ''; img.remove(); });
      logoSwaps.forEach(({ img, originalSrc }) => { img.src = originalSrc; });
      console.error(err);
      setSnackbar('Download failed. Please try again.');
    } finally {
      // Restore mobile transform
      if (scaleWrapper) {
        scaleWrapper.style.transform = savedTransform;
        scaleWrapper.style.marginBottom = savedMarginBottom;
      }
      setDownloading(false);
    }
  };

  // ── Print: render poster to a new window and trigger browser print dialog ──
  const handlePrint = async () => {
    if (!posterRef.current) return;
    setDownloading(true);
    const swaps: Array<{ svg: SVGSVGElement; img: HTMLImageElement }> = [];

    const scaleWrapper = posterRef.current.parentElement;
    const savedTransform = scaleWrapper?.style.transform ?? '';
    const savedMarginBottom = scaleWrapper?.style.marginBottom ?? '';
    if (scaleWrapper) {
      scaleWrapper.style.transform = 'none';
      scaleWrapper.style.marginBottom = '0';
    }

    try {
      const svgEls = Array.from(posterRef.current.querySelectorAll<SVGSVGElement>('svg'));
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

      const canvas = await html2canvas(posterRef.current, {
        scale: 3,
        width: POSTER_W,
        height: POSTER_H,
        useCORS: true,
        backgroundColor: null,
        logging: false,
        imageTimeout: 0,
      });

      swaps.forEach(({ svg, img }) => { svg.style.display = ''; img.remove(); });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const printWin = window.open('', '_blank');
      if (printWin) {
        printWin.document.write(`<html><head><title>Winnbell Poster</title><style>@page{size:letter;margin:0}*{margin:0;padding:0}body{display:flex;justify-content:center;align-items:center}img{width:100vw;height:100vh;object-fit:fill}</style></head><body><img src="${imgData}" onload="window.print();window.close()"/></body></html>`);
        printWin.document.close();
      }
    } catch (err) {
      swaps.forEach(({ svg, img }) => { svg.style.display = ''; img.remove(); });
      console.error(err);
      setSnackbar('Print failed. Please try again.');
    } finally {
      if (scaleWrapper) {
        scaleWrapper.style.transform = savedTransform;
        scaleWrapper.style.marginBottom = savedMarginBottom;
      }
      setDownloading(false);
    }
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
      setSnackbar('Sticker downloaded!');
    } catch (err) {
      swaps.forEach(({ svg, img }) => { svg.style.display = ''; img.remove(); });
      console.error(err);
      setSnackbar('Download failed. Please try again.');
    } finally {
      setDownloadingSticker(false);
    }
  };

  const showLocationSelector = isBusiness && locations.length > 1 && !isManager;
  // Desktop: a compact location dropdown in the header card. Mobile: the full "Choose a
  // location" card stays in the body below.
  const headerLocationControl = showLocationSelector ? (
    <Autocomplete
      size='small'
      options={locations}
      getOptionLabel={(opt) => opt.name}
      value={locations.find(l => l.id === selectedLocationId) ?? null}
      onChange={(_, val) => setSelectedLocationId(val?.id ?? '')}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      renderInput={(params) => <TextField {...params} label='Location' placeholder='Pick a location' />}
      sx={{ minWidth: 220 }}
    />
  ) : null;

  return (
    <Box ref={topRef} sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: '100dvh' }, pb: 8 }}>
      <AppPageHero
        title='Grow Engagement'
        subtitle='Turn more customers into scans and see what is working'
        actions={isDesktop ? headerLocationControl : undefined}
      />

      <Container maxWidth='lg' sx={{ mt: { xs: 2, md: 1 }, position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
            gap: { xs: 2.5, md: 3 },
            pb: 4,
          }}
        >

          {/* ════════════════════════════════════════════════════════════════════════
              SECTION A: NEW CUSTOMER WELCOME (hero banner)
          ════════════════════════════════════════════════════════════════════════ */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Paper
                elevation={0}
                sx={{
                  position: 'relative', overflow: 'hidden',
                  borderRadius: 3, p: { xs: 2.5, md: 4 },
                  background: `linear-gradient(135deg, ${PRIMARY_MAIN} 0%, ${PRIMARY_DEEP} 100%)`,
                  color: '#fff',
                }}
              >
                <Box sx={{ position: 'absolute', top: '-45%', right: '-8%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 45%, transparent 70%)', pointerEvents: 'none' }} />
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2.5, md: 4 }} alignItems={{ md: 'center' }} sx={{ position: 'relative' }}>
                  {/* Copy + actions */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: ALPHA_WHITE_15, border: `1px solid ${ALPHA_WHITE_20}`, borderRadius: '999px', px: 1.5, py: 0.5, mb: 2 }}>
                      <StarRounded sx={{ fontSize: 14, color: GOLD_TROPHY }} />
                      <Typography sx={{ fontSize: '0.66rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: ACCENT_GOLD_LIGHT }}>
                        New customer welcome
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.45rem', md: '1.9rem' }, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                      Customers new to Winnbell get a{' '}
                      <Box component='span' sx={{ color: GOLD_TROPHY }}>free entry</Box>{' '}
                      when they scan
                    </Typography>
                    <Typography sx={{ color: ALPHA_WHITE_80, mt: 1.25, lineHeight: 1.6, fontSize: '0.9rem', maxWidth: 520 }}>
                      A lucky start on the house. Anyone joining Winnbell for the first time at your counter scans your code, gets a free entry into this month's draw, and remembers you for it.
                    </Typography>
                    <Stack direction='row' spacing={1.5} sx={{ mt: 2.5, flexWrap: 'wrap', gap: 1 }}>
                      {effectiveLocationId ? (
                        <>
                          <Button
                            variant='contained'
                            startIcon={<ContentCopy sx={{ fontSize: 18 }} />}
                            onClick={handleCopyScanUrl}
                            sx={{ bgcolor: '#fff', color: PRIMARY_MAIN, fontWeight: 800, textTransform: 'none', borderRadius: 2, px: 2.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                          >
                            {copied ? 'Copied!' : 'Copy scan link'}
                          </Button>
                          <Button
                            variant='outlined'
                            startIcon={downloadingQr ? <CircularProgress size={16} color='inherit' /> : <QrCode2 sx={{ fontSize: 18 }} />}
                            onClick={handleDownloadQr}
                            disabled={downloadingQr}
                            sx={{ color: '#fff', borderColor: ALPHA_WHITE_20, fontWeight: 700, textTransform: 'none', borderRadius: 2, px: 2.5, '&:hover': { borderColor: '#fff', bgcolor: ALPHA_WHITE_15 } }}
                          >
                            Download QR
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant='contained'
                          onClick={() => setLocPickerOpen(true)}
                          sx={{ bgcolor: '#fff', color: PRIMARY_MAIN, fontWeight: 800, textTransform: 'none', borderRadius: 2, px: 2.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                        >
                          Choose a location to start
                        </Button>
                      )}
                    </Stack>
                  </Box>
                  {/* QR panel. Shown on desktop; on mobile it stays rendered OFF-SCREEN (not
                      display:none) so the Download QR capture still has a painted node. */}
                  {effectiveLocationId && (
                    <Box sx={{ position: { xs: 'absolute', md: 'static' }, left: { xs: -9999, md: 'auto' }, top: { xs: 0, md: 'auto' }, flexShrink: 0, textAlign: 'center' }}>
                      <Box ref={heroQrRef} sx={{ bgcolor: '#fff', borderRadius: '18px', p: 2, display: 'flex' }}>
                        {/* Plain QR (no brand icon) - scans more reliably and matches the posts. */}
                        <QRCodePlain value={scanUrl} size={128} level='H' fgColor={TEXT_HEADING} />
                      </Box>
                      <Typography sx={{ color: ALPHA_WHITE_80, fontSize: '0.68rem', mt: 1 }}>No purchase necessary</Typography>
                    </Box>
                  )}
                </Stack>
              </Paper>
            </motion.div>
          </Box>

          {/* ════════════════════════════════════════════════════════════════════════
              LOCATION SELECTOR (mobile only - on desktop it lives in the header card)
          ════════════════════════════════════════════════════════════════════════ */}
          {!isDesktop && showLocationSelector && (
            <Box sx={{ gridColumn: '1 / -1' }}>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
              <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 2.5, maxWidth: { xs: '100%', md: 400 } }}>
                <Typography variant='subtitle2' fontWeight={800} gutterBottom>Choose a location</Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 2, lineHeight: 1.5 }}>
                  Your posters and QR codes are unique to each location. Pick one to generate its scan materials.
                </Typography>
                <Autocomplete
                  size='small'
                  fullWidth
                  options={locations}
                  getOptionLabel={(opt) => opt.name}
                  value={locations.find(l => l.id === selectedLocationId) ?? null}
                  onChange={(_, val) => setSelectedLocationId(val?.id ?? '')}
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='Location'
                      placeholder='Pick a location'
                    />
                  )}
                />
              </Paper>
              </motion.div>
            </Box>
          )}

          {/* ════════════════════════════════════════════════════════════════════════
              SECTION B: YOUR GROWTH PLAYBOOK
          ════════════════════════════════════════════════════════════════════════ */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <motion.div
              ref={playRef}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', p: { xs: 2.5, md: 3.5 } }}>
              <Stack spacing={3}>
                <Box>
                  <Stack direction='row' alignItems='center' justifyContent='space-between' spacing={2} sx={{ mb: 2 }}>
                    <Box>
                      <Typography variant='h6' fontWeight={800}>Your growth playbook</Typography>
                      <Typography variant='caption' color='text.secondary'>Complete all 4 steps to maximize your scans.</Typography>
                    </Box>
                    <Box sx={{ position: 'relative', width: 70, height: 70, flexShrink: 0 }}>
                      <CircularProgress
                        variant='determinate'
                        value={(playbook.filter(Boolean).length / 4) * 100}
                        size={70}
                        thickness={3}
                        sx={{ color: 'primary.main' }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          textAlign: 'center',
                        }}
                      >
                        <Typography variant='caption' fontWeight={800} sx={{ display: 'block', lineHeight: 1 }}>
                          {playbook.filter(Boolean).length}/4
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                  {playbook.every(Boolean) && (
                    <Typography variant='body2' sx={{ color: 'success.main', fontWeight: 700, mb: 2 }}>
                      You're all set! Keep scanning and watching the growth.
                    </Typography>
                  )}
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
                  {[
                    { title: 'Put a QR at your checkout', desc: 'This is the #1 driver of scans', action: 'See QR', ref: postersRef },
                    { title: 'Brief your team', desc: 'Teach them the script to ask', action: 'View script', ref: staffRef },
                    { title: 'Add another QR spot', desc: 'Beyond checkout for more reach', action: 'Design posters', ref: postersRef },
                    { title: 'Put up your Winnbell sticker', desc: 'A branded QR right at your counter', action: 'Get sticker', ref: staffRef },
                  ].map((item, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: 'primary.main', bgcolor: `${PRIMARY_MAIN}04` },
                      }}
                    >
                      <Box
                        onClick={() => updatePlaybook(idx)}
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          border: '2px solid',
                          borderColor: playbook[idx] ? 'primary.main' : 'divider',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          bgcolor: playbook[idx] ? 'primary.main' : 'transparent',
                          '&:hover': { borderColor: 'primary.main' },
                        }}
                      >
                        {playbook[idx] && <Check sx={{ color: 'white', fontSize: 18 }} />}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant='body2' fontWeight={700}>{item.title}</Typography>
                        <Typography variant='caption' color='text.secondary'>{item.desc}</Typography>
                      </Box>
                      <Button
                        variant='text'
                        size='small'
                        sx={{ textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}
                        onClick={() => scrollToSection(item.ref)}
                      >
                        {item.action}
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Stack>
            </Paper>
            </motion.div>
          </Box>

          {/* ════════════════════════════════════════════════════════════════════════
              SECTION B2: READY TO SHARE (social images)
          ════════════════════════════════════════════════════════════════════════ */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.28 }}
            >
              <ReadyToShare
                businessName={businessName}
                locationLabel={locations.find(l => l.id === effectiveLocationId)?.name ?? ''}
                scanUrl={scanUrl}
                prizeLabel={prizeLabel}
                canDownload={!!effectiveLocationId}
                onRequireLocation={() => setLocPickerOpen(true)}
                onToast={(msg) => setSnackbar(msg)}
              />
            </motion.div>
          </Box>

          {/* ════════════════════════════════════════════════════════════════════════
              SECTION C: STAFF BOOST
          ════════════════════════════════════════════════════════════════════════ */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <motion.div
              ref={staffRef}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
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
                      {[
                        { label: 'At checkout', text: 'By the way, we\'re on Winnbell. Scan this and you\'re in this month\'s prize draw. It only takes five seconds.' },
                        { label: 'New customer', text: 'Have you tried Winnbell? Scan our code and you\'re entered into this month\'s prize draw. It\'s free and takes seconds.' },
                        { label: 'Regulars', text: 'Don\'t forget to scan for this month\'s Winnbell draw before you head out.' },
                        { label: 'Free entry', text: 'You can join this month\'s draw for free, no purchase needed. Just scan our code.' },
                      ].map((script, idx) => (
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
                            <QRWithBrand value={scanUrl} size={150} fgColor={stickerTheme.color} logoSrc={stickerTheme.icon} />
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
                            onClick={() => setLocPickerOpen(true)}
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
            </motion.div>
          </Box>

          {/* ════════════════════════════════════════════════════════════════════════
              SECTION E: POSTERS & PLACEMENT
          ════════════════════════════════════════════════════════════════════════ */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <motion.div
              ref={postersRef}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', p: { xs: 2.5, md: 3.5 } }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant='h6' fontWeight={800} gutterBottom>Posters</Typography>
                  <Typography variant='body2' color='text.secondary'>Pick a design, choose a location, and download to print.</Typography>
                </Box>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                  {/* Left column: Template picker + Preview */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* Template picker */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant='caption' fontWeight={700} color='text.secondary' display='block' sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Choose template
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: { xs: 0.75, md: 1 }, justifyItems: 'center' }}>
                        {TEMPLATES.map((t) => {
                          const Thumb = t.Component;
                          const isActive = t.id === selectedId;
                          return (
                            <Box
                              key={t.id}
                              onClick={() => setSelectedId(t.id)}
                              sx={{
                                cursor: 'pointer',
                                width: thumbW,
                                height: thumbH,
                                position: 'relative',
                                overflow: 'hidden',
                                border: '2px solid',
                                borderColor: isActive ? PRIMARY_MAIN : 'divider',
                                boxShadow: isActive ? `0 0 0 3px ${PRIMARY_MAIN}30` : 'none',
                                transition: 'all 0.15s',
                                '&:hover': { borderColor: isActive ? PRIMARY_MAIN : 'rgba(0,0,0,0.3)' },
                              }}
                            >
                              <Box
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: POSTER_W,
                                  height: POSTER_H,
                                  transformOrigin: 'top left',
                                  transform: `scale(${thumbScale})`,
                                  pointerEvents: 'none',
                                }}
                              >
                                <Thumb businessName={businessName} scanUrl={scanUrl} headline={headline} />
                              </Box>
                              {isActive && (
                                <Box sx={{
                                  position: 'absolute', top: 4, right: 4,
                                  width: 18, height: 18, borderRadius: '50%',
                                  bgcolor: PRIMARY_MAIN, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  zIndex: 1,
                                }}>
                                  <CheckCircleOutline sx={{ fontSize: 12, color: 'white' }} />
                                </Box>
                              )}
                              <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, bgcolor: 'rgba(0,0,0,0.55)', py: 0.5, zIndex: 1 }}>
                                <Typography sx={{ fontSize: '0.58rem', color: 'white', fontWeight: 700, textAlign: 'center' }}>
                                  {t.label}
                                </Typography>
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>

                    {/* Preview */}
                    <Box>
                      <Typography variant='caption' fontWeight={700} color='text.secondary' display='block' sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Preview
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
                        <Box sx={{
                          flexShrink: 0,
                          boxShadow: SHADOW_CARD,
                          border: '1px solid',
                          borderColor: 'divider',
                          transformOrigin: 'top center',
                          transform: { xs: 'scale(0.92)', sm: 'none' },
                          mb: { xs: `-${Math.round(POSTER_H * 0.08)}px`, sm: 0 },
                        }}>
                          <Box ref={posterRef} style={{ width: POSTER_W, height: POSTER_H, overflow: 'hidden' }}>
                            {TEMPLATES.find(t => t.id === selectedId)?.Component
                              ? (() => {
                                const Comp = TEMPLATES.find(t => t.id === selectedId)!.Component;
                                return <Comp businessName={businessName} scanUrl={scanUrl} headline={headline} />;
                              })()
                              : null
                            }
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Right column: Headline picker + Download/Print/Copy controls */}
                  <Box sx={{ flexShrink: 0, width: { xs: '100%', md: 360 }, alignSelf: 'flex-start', p: { xs: 2, md: 2.5 }, borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: SHADOW_CARD }}>
                    {/* Headline picker */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant='caption' fontWeight={700} color='text.secondary' display='block' sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Headline text
                      </Typography>
                      <Stack spacing={1}>
                        {HEADLINES.map((h) => {
                          const active = h === headline;
                          return (
                            <Box
                              key={h}
                              onClick={() => setHeadline(h)}
                              sx={{
                                px: 1.5, py: 1, borderRadius: 2, cursor: 'pointer',
                                border: '1px solid',
                                borderColor: active ? 'primary.main' : 'divider',
                                bgcolor: active ? `${PRIMARY_MAIN}08` : 'transparent',
                                transition: 'all 0.15s',
                                '&:hover': { borderColor: 'primary.main', bgcolor: `${PRIMARY_MAIN}06` },
                              }}
                            >
                              <Typography variant='body2' fontWeight={active ? 700 : 500} color={active ? 'primary.main' : 'text.primary'} sx={{ lineHeight: 1.4 }}>
                                {h}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Stack>
                    </Box>

                    {/* Download + Print + Copy */}
                    <Stack spacing={1.5}>
                      {effectiveLocationId ? (
                        <>
                          <Stack direction={{ xs: 'column', md: 'column' }} spacing={1.5}>
                            <Button
                              fullWidth
                              variant='contained'
                              size='large'
                              startIcon={downloading ? undefined : <FileDownload />}
                              onClick={handleDownload}
                              disabled={downloading}
                              sx={{
                                py: 1.4,
                                fontWeight: 800,
                                fontSize: '0.95rem',
                                textTransform: 'none',
                              }}
                            >
                              {downloading ? <><CircularProgress size={18} color='inherit' sx={{ mr: 1 }} />Generating...</> : 'Download PDF'}
                            </Button>
                            <Button
                              fullWidth
                              variant='outlined'
                              size='large'
                              startIcon={<Print />}
                              onClick={handlePrint}
                              disabled={downloading}
                              sx={{
                                py: 1.4,
                                fontWeight: 800,
                                fontSize: '0.95rem',
                                textTransform: 'none',
                              }}
                            >
                              Print
                            </Button>
                          </Stack>
                          <Button
                            fullWidth
                            variant='outlined'
                            size='small'
                            startIcon={<ContentCopy fontSize='small' />}
                            onClick={handleCopyScanUrl}
                            sx={{
                              py: 1.1,
                              fontWeight: 700,
                              textTransform: 'none',
                              borderColor: copied ? 'success.main' : 'divider',
                              color: copied ? 'success.main' : 'text.secondary',
                              '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: `${PRIMARY_MAIN}06` },
                            }}
                          >
                            {copied ? 'Copied!' : 'Copy scan link'}
                          </Button>
                        </>
                      ) : (
                        <Button
                          fullWidth
                          variant='outlined'
                          size='large'
                          onClick={() => setLocPickerOpen(true)}
                          sx={{
                            py: 1.4,
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            textTransform: 'none',
                          }}
                        >
                          Choose a location to download
                        </Button>
                      )}
                    </Stack>
                  </Box>
                </Stack>
              </Stack>
            </Paper>
            </motion.div>
          </Box>

        </Box>
      </Container>

      {/* Location picker - opened by every "Choose a location" button so the pick
          happens right where you clicked, no scrolling back to the top. */}
      <Dialog open={locPickerOpen} onClose={() => setLocPickerOpen(false)} maxWidth='xs' fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Choose a location</DialogTitle>
        <Typography variant='body2' color='text.secondary' sx={{ px: 3, pb: 1 }}>
          Your QR codes and materials are unique to each location.
        </Typography>
        <List sx={{ pb: 2, px: 1.5 }}>
          {locations.map((loc) => (
            <ListItemButton
              key={loc.id}
              onClick={() => { setSelectedLocationId(loc.id); setLocPickerOpen(false); }}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 38 }}>
                <LocationOnOutlined sx={{ color: PRIMARY_MAIN }} />
              </ListItemIcon>
              <ListItemText
                primary={loc.name}
                secondary={loc.address}
                primaryTypographyProps={{ fontWeight: 700 }}
                secondaryTypographyProps={{ noWrap: true }}
              />
            </ListItemButton>
          ))}
        </List>
      </Dialog>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={3500}
        onClose={() => setSnackbar('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.includes('failed') ? 'error' : 'success'}
          variant='filled'
          sx={{ width: '100%' }}
        >
          {snackbar}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MarketingPage;
