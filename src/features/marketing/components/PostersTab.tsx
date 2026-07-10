import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Stack, Paper, Button,
  useMediaQuery, useTheme, CircularProgress,
} from '@mui/material';
import {
  CheckCircleOutline, FileDownload, Print, ContentCopy, QrCode2, BookRounded, StarRounded,
} from '@mui/icons-material';
import QRCodePlain from 'react-qr-code';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  PRIMARY_MAIN, PRIMARY_DEEP, SHADOW_CARD,
  GOLD_TROPHY, ACCENT_GOLD_LIGHT, ALPHA_WHITE_15, ALPHA_WHITE_20, ALPHA_WHITE_80, ALPHA_WHITE_90,
  TEXT_HEADING, TEXT_SECONDARY, AMBER_HOURGLASS,
  GRADIENT_GOLD_VIVID,
} from '../../../shared/colors';
import { svgToPngDataUrl } from '../utils/capture';
import {
  POSTER_W, POSTER_H,
  THUMB_SCALE, THUMB_W, THUMB_H,
  THUMB_SCALE_MOBILE, THUMB_W_MOBILE, THUMB_H_MOBILE,
  HEADLINES,
} from './posterConstants';
import {
  PosterClassic, PosterDark, PosterFresh, PosterPink,
} from './PosterTemplates';

const TEMPLATES = [
  { id: 'classic', label: 'Classic Blue',  Component: PosterClassic },
  { id: 'dark',    label: 'Dark Premium',  Component: PosterDark },
  { id: 'fresh',   label: 'Fresh Green',   Component: PosterFresh },
  { id: 'pink',    label: 'Light Pink',    Component: PosterPink },
];

// Convert an <img src="...svg"> element to a PNG data URL at 2x rendered size.
// Uses an offscreen canvas so the raster is sharp on retina and html2canvas picks it up.
function svgImgToPngDataUrl(img: HTMLImageElement, scale = 2): Promise<string> {
  const w = img.clientWidth || img.naturalWidth || 100;
  const h = img.clientHeight || img.naturalHeight || 30;
  return new Promise((resolve, reject) => {
    const tmp = new Image();
    tmp.crossOrigin = 'anonymous';
    tmp.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = w * scale;
      canvas.height = h * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(tmp, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/png'));
    };
    tmp.onerror = reject;
    tmp.src = img.src;
  });
}

interface PostersTabProps {
  businessName: string;
  scanUrl: string;
  effectiveLocationId: number | null;
  onToast: (msg: string) => void;
  onRequireLocation: () => void;
  copied: boolean;
  onCopy: () => void;
  minAmountLabel?: string | null;
}

const PostersTab = ({
  businessName,
  scanUrl,
  effectiveLocationId,
  onToast,
  onRequireLocation,
  copied,
  onCopy,
  minAmountLabel,
}: PostersTabProps) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const [selectedId, setSelectedId] = useState('classic');
  const [headline, setHeadline] = useState(HEADLINES[0]);
  const [downloading, setDownloading] = useState(false);

  const posterRef = useRef<HTMLDivElement>(null);
  const heroQrRef = useRef<HTMLDivElement>(null);
  const [downloadingQr, setDownloadingQr] = useState(false);

  const handleDownloadQr = async () => {
    if (!heroQrRef.current) return;
    setDownloadingQr(true);
    try {
      const { downloadNodeAsPng } = await import('../utils/capture');
      await downloadNodeAsPng(heroQrRef.current, 'winnbell-scan-qr.png', 2);
      onToast('QR downloaded!');
    } catch (err) {
      console.error(err);
      onToast('Download failed. Please try again.');
    } finally {
      setDownloadingQr(false);
    }
  };

  const handleOpenGuide = () => navigate('/marketing/guide');

  const thumbScale = isDesktop ? THUMB_SCALE : THUMB_SCALE_MOBILE;
  const thumbW = isDesktop ? THUMB_W : THUMB_W_MOBILE;
  const thumbH = isDesktop ? THUMB_H : THUMB_H_MOBILE;

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

      // 1b. Convert <img src="...svg"> elements (e.g. wordmark) to PNG data URLs so
      //     html2canvas does not leave them blank in the captured output.
      const svgImgEls = Array.from(
        posterRef.current.querySelectorAll<HTMLImageElement>('img[src$=".svg"]'),
      );
      for (const imgEl of svgImgEls) {
        const originalSrc = imgEl.src;
        const pngUrl = await svgImgToPngDataUrl(imgEl, 2);
        imgEl.src = pngUrl;
        // Wait one microtask so the browser applies the new src before capture.
        await new Promise<void>((r) => { const t = new Image(); t.onload = () => r(); t.onerror = () => r(); t.src = pngUrl; });
        logoSwaps.push({ img: imgEl, originalSrc });
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
      onToast('Poster downloaded!');
    } catch (err) {
      swaps.forEach(({ svg, img }) => { svg.style.display = ''; img.remove(); });
      logoSwaps.forEach(({ img, originalSrc }) => { img.src = originalSrc; });
      console.error(err);
      onToast('Download failed. Please try again.');
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
  // handlePrint also rasterizes via html2canvas, so SVG img elements need the
  // same swap treatment as handleDownload to avoid blank wordmarks in the output.
  const handlePrint = async () => {
    if (!posterRef.current) return;
    setDownloading(true);
    const swaps: Array<{ svg: SVGSVGElement; img: HTMLImageElement }> = [];
    const logoSwaps: Array<{ img: HTMLImageElement; originalSrc: string }> = [];

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

      const svgImgEls = Array.from(
        posterRef.current.querySelectorAll<HTMLImageElement>('img[src$=".svg"]'),
      );
      for (const imgEl of svgImgEls) {
        const originalSrc = imgEl.src;
        const pngUrl = await svgImgToPngDataUrl(imgEl, 2);
        imgEl.src = pngUrl;
        await new Promise<void>((r) => { const t = new Image(); t.onload = () => r(); t.onerror = () => r(); t.src = pngUrl; });
        logoSwaps.push({ img: imgEl, originalSrc });
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
      logoSwaps.forEach(({ img, originalSrc }) => { img.src = originalSrc; });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const printWin = window.open('', '_blank');
      if (printWin) {
        printWin.document.write(`<html><head><title>Winnbell Poster</title><style>@page{size:letter;margin:0}*{margin:0;padding:0}body{display:flex;justify-content:center;align-items:center}img{width:100vw;height:100vh;object-fit:fill}</style></head><body><img src="${imgData}" onload="window.print();window.close()"/></body></html>`);
        printWin.document.close();
      }
    } catch (err) {
      swaps.forEach(({ svg, img }) => { svg.style.display = ''; img.remove(); });
      logoSwaps.forEach(({ img, originalSrc }) => { img.src = originalSrc; });
      console.error(err);
      onToast('Print failed. Please try again.');
    } finally {
      if (scaleWrapper) {
        scaleWrapper.style.transform = savedTransform;
        scaleWrapper.style.marginBottom = savedMarginBottom;
      }
      setDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 }}
    >
      <Box sx={{ pb: 4 }}>
        {/* Blue + Gold cards (moved from Overview) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.35fr 1fr' },
              gap: { xs: 1.5, md: 2.5 },
              alignItems: 'stretch',
              mb: { xs: 2, md: 3 },
            }}
          >
            {/* Blue QR Card */}
            <Paper
              elevation={0}
              sx={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 3,
                p: { xs: 2, md: 2.5 },
                background: `linear-gradient(135deg, ${PRIMARY_DEEP}, ${PRIMARY_MAIN})`,
                color: '#fff',
              }}
            >
              <Box sx={{ position: 'absolute', top: '-30%', right: '-8%', width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${ALPHA_WHITE_20} 0%, transparent 70%)`, pointerEvents: 'none' }} />
              <Stack spacing={1.75} sx={{ position: 'relative', zIndex: 1 }}>
                <Stack direction='row' spacing={2} alignItems='flex-start'>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        bgcolor: ALPHA_WHITE_15,
                        border: `1px solid ${ALPHA_WHITE_20}`,
                        borderRadius: '999px',
                        px: 1.25,
                        py: 0.5,
                        mb: 1.25,
                      }}
                    >
                      <StarRounded sx={{ fontSize: 12, color: GOLD_TROPHY }} />
                      <Typography sx={{ fontSize: '0.66rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff' }}>
                        Your scan code
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: { xs: '1.25rem', md: '1.45rem' }, fontWeight: 800, lineHeight: 1.2 }}>
                      One code that{' '}
                      <Box component='span' sx={{ color: GOLD_TROPHY }}>welcomes</Box>{' '}
                      every customer
                    </Typography>
                    <Typography sx={{ fontSize: { xs: '0.8rem', md: '0.85rem' }, color: ALPHA_WHITE_80, lineHeight: 1.55, mt: 1 }}>
                      It welcomes new members with a welcome entry from your business, and takes returning ones straight to receipt submission with your location already set.
                    </Typography>
                  </Box>
                  {effectiveLocationId && (
                    <Box sx={{ bgcolor: '#fff', borderRadius: 1.5, p: 0.75, flexShrink: 0, display: 'flex' }}>
                      <QRCodePlain value={scanUrl} size={isMobile ? 74 : 92} level='H' fgColor={TEXT_HEADING} />
                    </Box>
                  )}
                  {effectiveLocationId && (
                    <Box ref={heroQrRef} aria-hidden sx={{ position: 'absolute', left: -99999, top: 0, bgcolor: '#fff', p: '48px', display: 'inline-flex' }}>
                      <QRCodePlain value={scanUrl} size={1000} level='H' fgColor={TEXT_HEADING} />
                    </Box>
                  )}
                </Stack>

                <Stack direction='row' spacing={1}>
                  {effectiveLocationId ? (
                    <Button
                      variant='contained'
                      startIcon={downloadingQr ? <CircularProgress size={16} color='inherit' /> : <QrCode2 sx={{ fontSize: 16 }} />}
                      onClick={handleDownloadQr}
                      disabled={downloadingQr}
                      sx={{ bgcolor: '#fff', color: PRIMARY_MAIN, fontWeight: 800, textTransform: 'none', borderRadius: 1.5, px: 1.5, py: 0.65, fontSize: '0.85rem', flex: 1, '&:hover': { bgcolor: ALPHA_WHITE_90 } }}
                    >
                      Download QR
                    </Button>
                  ) : (
                    <Button
                      variant='contained'
                      onClick={onRequireLocation}
                      sx={{ bgcolor: '#fff', color: PRIMARY_MAIN, fontWeight: 800, textTransform: 'none', borderRadius: 1.5, px: 1.5, py: 0.65, fontSize: '0.85rem', flex: 1, '&:hover': { bgcolor: ALPHA_WHITE_90 } }}
                    >
                      Choose a location to start
                    </Button>
                  )}
                  {isMobile && (
                    <Button
                      variant='outlined'
                      startIcon={<BookRounded sx={{ fontSize: 16 }} />}
                      onClick={handleOpenGuide}
                      sx={{ color: '#fff', borderColor: ALPHA_WHITE_20, bgcolor: ALPHA_WHITE_15, fontWeight: 700, textTransform: 'none', borderRadius: 1.5, px: 1.5, py: 0.65, fontSize: '0.85rem', flex: 1, '&:hover': { borderColor: '#fff', bgcolor: ALPHA_WHITE_15 } }}
                    >
                      See the guide
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Paper>

            {/* Gold Guide Card (desktop only, folded into blue on mobile) */}
            {!isMobile && (
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1.5px solid ${GOLD_TROPHY}55`,
                  background: '#fff',
                  boxShadow: `0 2px 8px ${GOLD_TROPHY}22`,
                  p: { xs: 2, md: 2.5 },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <Stack spacing={1.5} alignItems='flex-start'>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      bgcolor: ACCENT_GOLD_LIGHT,
                      border: `1px solid ${AMBER_HOURGLASS}`,
                      borderRadius: '999px',
                      px: 1.25,
                      py: 0.5,
                    }}
                  >
                    <BookRounded sx={{ fontSize: 12, color: AMBER_HOURGLASS }} />
                    <Typography sx={{ fontSize: '0.66rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: AMBER_HOURGLASS }}>
                      Grow with Winnbell
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: '1.2rem', md: '1.4rem' },
                      lineHeight: 1.2,
                      background: GRADIENT_GOLD_VIVID,
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      color: 'transparent',
                    }}
                  >
                    Get the most out of Winnbell
                  </Typography>

                  <Typography sx={{ fontSize: '0.85rem', color: TEXT_SECONDARY, lineHeight: 1.55 }}>
                    Simple ways to bring in more customers and get more from every campaign.
                  </Typography>

                  <Button
                    variant='contained'
                    startIcon={<BookRounded sx={{ fontSize: 16 }} />}
                    onClick={handleOpenGuide}
                    sx={{ background: GRADIENT_GOLD_VIVID, color: '#fff', fontWeight: 800, textTransform: 'none', borderRadius: 1.5, px: 2, py: 0.75, fontSize: '0.85rem', mt: 0.5, '&:hover': { background: GRADIENT_GOLD_VIVID, opacity: 0.94 } }}
                  >
                    See the guide
                  </Button>
                </Stack>
              </Paper>
            )}
          </Box>
        </motion.div>

        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', p: { xs: 2.5, md: 3.5 } }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant='h6' fontWeight={800} gutterBottom>Posters</Typography>
              <Typography variant='body2' color='text.secondary'>Place this at your register or another visible spot so customers can easily see it and join your campaigns.</Typography>
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
                            <Thumb businessName={businessName} scanUrl={scanUrl} headline={headline} minAmountLabel={minAmountLabel} />
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
                            return <Comp businessName={businessName} scanUrl={scanUrl} headline={headline} minAmountLabel={minAmountLabel} />;
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
                        onClick={onCopy}
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
                      onClick={onRequireLocation}
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
      </Box>
    </motion.div>
  );
};

export default PostersTab;
