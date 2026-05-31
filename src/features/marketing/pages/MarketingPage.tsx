import { useState, useRef } from 'react';
import {
  Box, Container, Typography, Stack, Paper, Button,
  useMediaQuery, useTheme, Snackbar, Alert, Tooltip,
  CircularProgress, Autocomplete, TextField,
} from '@mui/material';
import { CropFree, ContentCopy, FileDownload, CheckCircleOutline } from '@mui/icons-material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useAppSelector } from '../../../store/hook';
import { selectIsBusiness, selectIsLocationManager, selectCurrentUser } from '../../../store/selectors/authSelectors';
import { useBusinessData } from '../../partner/hooks/useBusinessData';
import {
  BG_PAGE, GRADIENT_HERO, ALPHA_WHITE_15, ALPHA_WHITE_30, PRIMARY_MAIN, MOBILE_CONTENT_HEIGHT,
} from '../../../shared/colors';
import {
  POSTER_W, POSTER_H,
  THUMB_SCALE, THUMB_W, THUMB_H,
  THUMB_SCALE_MOBILE, THUMB_W_MOBILE, THUMB_H_MOBILE,
  HEADLINES, TEMPLATES,
} from '../components/PosterTemplates';

// ── SVG → PNG helper (ensures QR renders in html2canvas) ─────────────────────
async function svgToPngDataUrl(svgEl: SVGSVGElement, scale = 3): Promise<string> {
  const w = svgEl.clientWidth || Number(svgEl.getAttribute('width') ?? 150);
  const h = svgEl.clientHeight || Number(svgEl.getAttribute('height') ?? 150);
  const svgStr = new XMLSerializer().serializeToString(svgEl);
  const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = w * scale;
      canvas.height = h * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

// ── Page ──────────────────────────────────────────────────────────────────────
const MarketingPage = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isBusiness = useAppSelector(selectIsBusiness);
  const isManager = useAppSelector(selectIsLocationManager);
  const currentUser = useAppSelector(selectCurrentUser);
  const { data: businessData } = useBusinessData(isBusiness);

  const [selectedId, setSelectedId] = useState('classic');
  const [headline, setHeadline] = useState(HEADLINES[0]);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [snackbar, setSnackbar] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState<number | ''>('');
  const posterRef = useRef<HTMLDivElement>(null);

  const businessName = businessData?.name ?? 'Your Business';
  const locations = (isBusiness ? businessData?.locations?.filter((l) => l.is_active) : []) ?? [];

  const effectiveLocationId = isManager
    ? currentUser?.location_id ?? null
    : (selectedLocationId || null);

  const scanUrl = effectiveLocationId
    ? `${window.location.origin}/scan?l=${effectiveLocationId}`
    : window.location.origin;

  const thumbScale = isDesktop ? THUMB_SCALE : THUMB_SCALE_MOBILE;
  const thumbW = isDesktop ? THUMB_W : THUMB_W_MOBILE;
  const thumbH = isDesktop ? THUMB_H : THUMB_H_MOBILE;

  const selected = TEMPLATES.find(t => t.id === selectedId) ?? TEMPLATES[0];
  const SelectedPoster = selected.Component;

  const handleCopy = () => {
    navigator.clipboard.writeText(scanUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // ── PDF download: swap SVGs → PNG imgs before html2canvas ─────────────────
  const handleDownload = async () => {
    if (!posterRef.current) return;
    setDownloading(true);
    const swaps: Array<{ svg: SVGSVGElement; img: HTMLImageElement }> = [];
    const logoSwaps: Array<{ img: HTMLImageElement; originalSrc: string }> = [];
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

      // 4. Build PDF - use exact poster aspect ratio so nothing is cut
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = (POSTER_H / POSTER_W) * pageW; // exact ratio, no rounding surprises
      pdf.addImage(imgData, 'PNG', 0, 0, pageW, pageH);
      pdf.save(`winnbell-${selected.id}-poster.pdf`);
      setSnackbar('Poster downloaded!');
    } catch (err) {
      swaps.forEach(({ svg, img }) => { svg.style.display = ''; img.remove(); });
      logoSwaps.forEach(({ img, originalSrc }) => { img.src = originalSrc; });
      console.error(err);
      setSnackbar('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: BG_PAGE, minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: '100dvh' }, pb: 8 }}>
      {/* Hero */}
      <Box sx={{
        background: GRADIENT_HERO, pt: 3, pb: isDesktop ? 9 : 6, px: 3,
        color: 'white', borderRadius: '0 0 32px 32px',
      }}>
        <Container maxWidth='lg'>
          <Stack direction='row' alignItems='center' spacing={2}>
            <Box sx={{
              width: 52, height: 52, borderRadius: 2,
              bgcolor: ALPHA_WHITE_15, border: `1px solid ${ALPHA_WHITE_30}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CropFree sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant='h5' fontWeight={800}>Marketing Posters</Typography>
              <Typography variant='body2' sx={{ opacity: 0.75 }}>
                Choose a design, preview it live, and download as PDF
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth='lg' sx={{ mt: isDesktop ? -5 : -2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems='flex-start'>

          {/* ── Left: picker + full preview ── */}
          <Box sx={{ flex: 1, minWidth: 0 }}>

            {/* Thumbnail grid - 2×2, fixed pixel thumbnails with JS-computed scale */}
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 2.5, mb: 3 }}>
              <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 2, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.72rem' }}>
                Choose a template
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: { xs: 0.75, md: 1 }, justifyItems: 'center' }}>
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
                      {/* Scale the full 320×452 poster down to the thumb cell using a unitless decimal */}
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

                      {/* Active checkmark */}
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

                      {/* Label */}
                      <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, bgcolor: 'rgba(0,0,0,0.55)', py: 0.5, zIndex: 1 }}>
                        <Typography sx={{ fontSize: '0.58rem', color: 'white', fontWeight: 700, textAlign: 'center' }}>
                          {t.label}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Paper>

            {/* Full preview - boxShadow on outer wrapper, NOT on posterRef */}
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 2.5 }}>
              <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 2, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.72rem' }}>
                Preview - {selected.label}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
                {/* Outer wrapper carries the shadow so html2canvas only captures the poster */}
                <Box sx={{
                  flexShrink: 0,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                  transformOrigin: 'top center',
                  transform: { xs: 'scale(0.92)', sm: 'none' },
                  mb: { xs: `-${Math.round(POSTER_H * 0.08)}px`, sm: 0 },
                }}>
                  <Box ref={posterRef} style={{ width: POSTER_W, height: POSTER_H, overflow: 'hidden' }}>
                    <SelectedPoster businessName={businessName} scanUrl={scanUrl} headline={headline} />
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* ── Right: controls ── */}
          <Paper elevation={0} sx={{
            width: { xs: '100%', md: '45%' }, flexShrink: 0,
            borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 3,
                      }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant='h6' fontWeight={800} gutterBottom>Download Poster</Typography>
                <Typography variant='body2' color='text.secondary' lineHeight={1.6}>
                  High-resolution A5 PDF, ready to print or share digitally.
                </Typography>
              </Box>

              {/* Selected */}
              <Box sx={{ bgcolor: `${PRIMARY_MAIN}08`, borderRadius: 2, px: 2, py: 1.25, border: `1px solid ${PRIMARY_MAIN}20` }}>
                <Typography variant='caption' color='text.secondary' fontWeight={600} display='block' sx={{ mb: 0.25 }}>Selected design</Typography>
                <Typography variant='body2' fontWeight={700} color='primary.main'>{selected.label}</Typography>
              </Box>

              {/* Headline picker */}
              <Box>
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

              {isBusiness && locations.length > 0 && (
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
                      label='Select Location'
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  )}
                />
              )}

              {/* Download */}
              <Button
                fullWidth variant='contained' size='large'
                startIcon={downloading ? undefined : <FileDownload />}
                onClick={handleDownload}
                disabled={downloading || !effectiveLocationId}
                sx={{
                  py: 1.6, borderRadius: 2.5, fontWeight: 800, fontSize: '1rem', textTransform: 'none',
                  boxShadow: '0 4px 14px rgba(25,93,230,0.3)',
                  '&:hover': { boxShadow: '0 6px 20px rgba(25,93,230,0.4)' },
                }}
              >
                {downloading
                  ? <><CircularProgress size={20} color='inherit' sx={{ mr: 1 }} />Generating PDF...</>
                  : 'Download PDF'}
              </Button>

              {/* Copy */}
              <Box>
                <Typography variant='caption' fontWeight={700} color='text.secondary' display='block' sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Or share digitally
                </Typography>
                <Tooltip title={copied ? 'Copied!' : 'Copy link'} placement='top'>
                  <Button
                    fullWidth variant='outlined'
                    startIcon={<ContentCopy fontSize='small' />}
                    onClick={handleCopy}
                    sx={{
                      py: 1.2, borderRadius: 2.5, fontWeight: 700, textTransform: 'none',
                      borderColor: copied ? 'success.main' : 'divider',
                      color: copied ? 'success.main' : 'text.secondary',
                      '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: `${PRIMARY_MAIN}06` },
                    }}
                  >
                    {copied ? 'Copied!' : 'Copy Scan Link'}
                  </Button>
                </Tooltip>
              </Box>



              {/* Tips */}
              <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
                <Typography variant='caption' fontWeight={700} color='text.secondary' display='block' sx={{ mb: 1 }}>Print tips</Typography>
                {['A5 paper works great for counter displays', 'Laminate for durability in high-traffic areas', 'Share the link on WhatsApp or email too'].map(tip => (
                  <Typography key={tip} variant='caption' color='text.disabled' display='block' sx={{ mb: 0.5, lineHeight: 1.5 }}>· {tip}</Typography>
                ))}
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Container>

      <Snackbar open={!!snackbar} autoHideDuration={3500} onClose={() => setSnackbar('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.includes('failed') ? 'error' : 'success'} variant='filled' sx={{ width: '100%' }}>{snackbar}</Alert>
      </Snackbar>
    </Box>
  );
};

export default MarketingPage;
