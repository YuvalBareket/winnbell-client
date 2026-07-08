import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Box, Typography, Stack, Paper, Button,
  useMediaQuery, useTheme, CircularProgress,
} from '@mui/material';
import {
  CheckCircleOutline, FileDownload, Print, ContentCopy,
} from '@mui/icons-material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  PRIMARY_MAIN, SHADOW_CARD,
} from '../../../shared/colors';
import { svgToPngDataUrl } from '../utils/capture';
import {
  POSTER_W, POSTER_H,
  THUMB_SCALE, THUMB_W, THUMB_H,
  THUMB_SCALE_MOBILE, THUMB_W_MOBILE, THUMB_H_MOBILE,
  HEADLINES, TEMPLATES,
} from './PosterTemplates';

interface PostersTabProps {
  businessName: string;
  scanUrl: string;
  effectiveLocationId: number | null;
  onToast: (msg: string) => void;
  onRequireLocation: () => void;
  copied: boolean;
  onCopy: () => void;
}

const PostersTab = ({
  businessName,
  scanUrl,
  effectiveLocationId,
  onToast,
  onRequireLocation,
  copied,
  onCopy,
}: PostersTabProps) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const [selectedId, setSelectedId] = useState('classic');
  const [headline, setHeadline] = useState(HEADLINES[0]);
  const [downloading, setDownloading] = useState(false);

  const posterRef = useRef<HTMLDivElement>(null);

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
