import { useState, useRef, useEffect } from 'react';
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
import QRCodePlain from 'react-qr-code';
import {
  PRIMARY_MAIN, BRAND_ICON_BLUE, BRAND_NAVY, SHADOW_CARD,
} from '../../../shared/colors';
import { svgToPngDataUrl, downloadNodeAsPng } from '../utils/capture';
import { useLocationGatedActions } from '../hooks/useLocationGatedActions';

// Sticker color themes
const STICKER_THEMES = [
  { color: PRIMARY_MAIN },
  { color: BRAND_NAVY },
  { color: BRAND_ICON_BLUE },
];
import {
  POSTER_W, POSTER_H,
  THUMB_SCALE, THUMB_W, THUMB_H,
  THUMB_SCALE_MOBILE, THUMB_W_MOBILE, THUMB_H_MOBILE,
} from './posterConstants';
import {
  PosterBlue, PosterEmerald, PosterCream, PosterSunset,
} from './PosterTemplates';

// Capture scale for PDF/print: 8 x 320px over an 8.5in US Letter page ~= 300 DPI.
const PDF_SCALE = 8;

const TEMPLATES = [
  { id: 'blue',    label: 'Bold Blue',    Component: PosterBlue },
  { id: 'cream',   label: 'Cream Gold',   Component: PosterCream },
  { id: 'emerald', label: 'Emerald',      Component: PosterEmerald },
  { id: 'sunset',  label: 'Sunset Pink',  Component: PosterSunset },
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
  /** Parent's location-picker dialog state, used to resume a click after picking */
  locationPickerOpen: boolean;
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
  locationPickerOpen,
  copied,
  onCopy,
  minAmountLabel,
}: PostersTabProps) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const [selectedId, setSelectedId] = useState('blue');
  const [downloading, setDownloading] = useState(false);

  const posterRef = useRef<HTMLDivElement>(null);

  // Mobile print keeps its hidden overlay + print CSS mounted until the next
  // print or unmount; iOS re-renders the preview on any setting change (zoom,
  // paper size) and needs them still present.
  const printNodesRef = useRef<HTMLElement[]>([]);
  const removePrintNodes = () => {
    printNodesRef.current.forEach((el) => el.remove());
    printNodesRef.current = [];
  };
  useEffect(() => removePrintNodes, []);

  // ── Partner sticker (moved here from the Scripts tab) ─────────────────────
  const [stickerIdx, setStickerIdx] = useState(0);
  const [downloadingSticker, setDownloadingSticker] = useState(false);
  const stickerRef = useRef<HTMLDivElement>(null);
  const stickerTheme = STICKER_THEMES[stickerIdx];

  const handleDownloadSticker = async () => {
    if (!stickerRef.current) return;
    setDownloadingSticker(true);
    try {
      // Shared capture util: also swaps the svg wordmark img, which html2canvas
      // otherwise leaves blank in the exported sticker.
      await downloadNodeAsPng(stickerRef.current, 'winnbell-sticker.png', 3);
      onToast('Sticker downloaded!');
    } catch (err) {
      console.error(err);
      onToast('Download failed. Please try again.');
    } finally {
      setDownloadingSticker(false);
    }
  };

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
      // 1. Convert every SVG inside the poster to a PNG img. Rasterize at the same
      //    scale as the final capture so the QR stays sharp at print resolution.
      const svgEls = Array.from(posterRef.current.querySelectorAll<SVGSVGElement>('svg'));
      for (const svg of svgEls) {
        const pngUrl = await svgToPngDataUrl(svg, PDF_SCALE);
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
        const pngUrl = await svgImgToPngDataUrl(imgEl, PDF_SCALE);
        imgEl.src = pngUrl;
        // Wait one microtask so the browser applies the new src before capture.
        await new Promise<void>((r) => { const t = new Image(); t.onload = () => r(); t.onerror = () => r(); t.src = pngUrl; });
        logoSwaps.push({ img: imgEl, originalSrc });
      }

      // 2. Capture poster canvas - PDF_SCALE x 320px over an 8.5in page ~= 300 DPI print
      const canvas = await html2canvas(posterRef.current, {
        scale: PDF_SCALE,
        width: POSTER_W,
        height: POSTER_H,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 0,
      });

      // 3. Restore SVGs and logo imgs
      swaps.forEach(({ svg, img }) => {
        svg.style.display = '';
        img.remove();
      });
      logoSwaps.forEach(({ img, originalSrc }) => { img.src = originalSrc; });

      // 4. Build PDF - US Letter, image fills entire page. JPEG, not PNG: the gradient
      //    backgrounds make PNGs huge (multi-MB) while JPEG at 0.92 is visually identical.
      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'JPEG', 0, 0, pageW, pageH);
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
        const pngUrl = await svgToPngDataUrl(svg, PDF_SCALE);
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
        const pngUrl = await svgImgToPngDataUrl(imgEl, PDF_SCALE);
        imgEl.src = pngUrl;
        await new Promise<void>((r) => { const t = new Image(); t.onload = () => r(); t.onerror = () => r(); t.src = pngUrl; });
        logoSwaps.push({ img: imgEl, originalSrc });
      }

      const canvas = await html2canvas(posterRef.current, {
        scale: PDF_SCALE,
        width: POSTER_W,
        height: POSTER_H,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 0,
      });

      swaps.forEach(({ svg, img }) => { svg.style.display = ''; img.remove(); });
      logoSwaps.forEach(({ img, originalSrc }) => { img.src = originalSrc; });

      const imgData = canvas.toDataURL('image/jpeg', 0.92);

      if (isDesktop) {
        // Desktop: build the exact same US Letter PDF the Download button produces
        // and print it from a hidden iframe (popup-free, gesture-free).
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, 'JPEG', 0, 0, pageW, pageH);
        const blobUrl = URL.createObjectURL(pdf.output('blob'));
        const iframe = document.createElement('iframe');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
        iframe.src = blobUrl;
        iframe.onload = () => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          window.setTimeout(() => { iframe.remove(); URL.revokeObjectURL(blobUrl); }, 1000);
        };
        document.body.appendChild(iframe);
      } else {
        // Mobile: iOS/Android cannot print a PDF loaded in an iframe; calling
        // print() there falls back to printing the whole app page. Instead, print
        // the main document with print-only CSS that hides the app and shows just
        // the poster image on a single US Letter page.
        const overlay = document.createElement('div');
        overlay.className = 'poster-print-overlay';
        const style = document.createElement('style');
        style.textContent = `
          .poster-print-overlay{display:none}
          @media print{
            @page{size:letter portrait;margin:0}
            body>*:not(.poster-print-overlay){display:none !important}
            .poster-print-overlay{display:block !important}
            .poster-print-overlay img{display:block;width:100%;height:auto;page-break-inside:avoid;break-inside:avoid}
          }
        `;
        const posterImg = document.createElement('img');
        posterImg.src = imgData;
        overlay.appendChild(posterImg);
        // Replace any overlay from a previous print, then keep the new one
        // mounted. Do NOT remove it on afterprint: iOS fires afterprint as soon
        // as the preview opens, and any setting change (zoom, paper size)
        // re-renders the preview from the live page - if the print CSS is gone
        // by then, the preview flips back to the whole app. The overlay is
        // display:none on screen, so leaving it costs nothing visible.
        removePrintNodes();
        document.body.appendChild(style);
        document.body.appendChild(overlay);
        printNodesRef.current = [style, overlay];

        await new Promise<void>((r) => {
          if (posterImg.complete) r();
          else { posterImg.onload = () => r(); posterImg.onerror = () => r(); }
        });
        window.print();
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

  // Location gate: any action clicked before a location is chosen opens the
  // picker and resumes automatically once a location is picked.
  const runGated = useLocationGatedActions({
    ready: !!effectiveLocationId,
    pickerOpen: locationPickerOpen,
    requestLocation: onRequireLocation,
    actions: {
      download: () => { void handleDownload(); },
      print: () => { void handlePrint(); },
      copy: onCopy,
      sticker: () => { void handleDownloadSticker(); },
    },
  });

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
                            <Thumb businessName={businessName} scanUrl={scanUrl} minAmountLabel={minAmountLabel} />
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
                            return <Comp businessName={businessName} scanUrl={scanUrl} minAmountLabel={minAmountLabel} />;
                          })()
                          : null
                        }
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Right column: Download/Print/Copy controls */}
              <Box sx={{ flexShrink: 0, width: { xs: '100%', md: 360 }, alignSelf: 'flex-start', p: { xs: 2, md: 2.5 }, borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: SHADOW_CARD }}>
                {/* Download + Print + Copy. All gated: with no location chosen the
                    picker opens and the clicked action resumes after the pick. */}
                <Stack spacing={1.5}>
                  <Stack direction={{ xs: 'column', md: 'column' }} spacing={1.5}>
                    <Button
                      fullWidth
                      variant='contained'
                      size='large'
                      startIcon={downloading ? undefined : <FileDownload />}
                      onClick={() => runGated('download')}
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
                      onClick={() => runGated('print')}
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
                    onClick={() => runGated('copy')}
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
                </Stack>
              </Box>
            </Stack>
          </Stack>
        </Paper>

        {/* Partner sticker (moved from Scripts) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
        >
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', p: { xs: 2.5, md: 3.5 }, mt: 3 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2.5, md: 4 }} alignItems={{ xs: 'stretch', md: 'center' }}>
              {/* Text + controls */}
              <Stack spacing={2.5} sx={{ flex: 1, minWidth: 0 }}>
                <Box>
                  <Typography variant='h6' fontWeight={800} gutterBottom>
                    Be a proud Winnbell partner
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Add our sticker to your door or register so customers notice.
                  </Typography>
                </Box>

                <Box>
                  <Typography variant='caption' fontWeight={700} color='text.secondary' display='block' sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Sticker color
                  </Typography>
                  <Stack direction='row' spacing={1.5}>
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

                <Button
                  variant='contained'
                  size='large'
                  startIcon={downloadingSticker ? undefined : <FileDownload />}
                  onClick={() => runGated('sticker')}
                  disabled={downloadingSticker}
                  sx={{ py: 1.2, fontWeight: 800, fontSize: '0.9rem', textTransform: 'none', alignSelf: { xs: 'stretch', md: 'flex-start' }, px: { md: 4 } }}
                >
                  {downloadingSticker ? <><CircularProgress size={18} color='inherit' sx={{ mr: 1 }} />Generating...</> : 'Download sticker'}
                </Button>
              </Stack>

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
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                }}
              >
                <Box component='img' src='/winnbell_app_name_white.svg' sx={{ height: 22 }} />
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
                  <QRCodePlain value={scanUrl} size={136} level='H' fgColor={stickerTheme.color} />
                </Box>
                {/* Fixed 3-line break, shortest line at the bottom, so nothing touches the
                    curved edge (near the circle's bottom the usable width is the chord). */}
                <Typography
                  sx={{
                    color: 'white',
                    fontSize: '0.55rem',
                    textAlign: 'center',
                    opacity: 0.85,
                    letterSpacing: 0.2,
                    lineHeight: 1.45,
                    whiteSpace: 'pre-line',
                    mb: '-5px',
                  }}
                >
                  {'No purchase necessary.\nAlternative method of entry & official rules\navailable at Winnbell.com'}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </motion.div>
      </Box>
    </motion.div>
  );
};

export default PostersTab;
