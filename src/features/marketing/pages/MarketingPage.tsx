import { useState, useRef } from 'react';
import {
  Box, Container, Typography, Stack, Paper, Button,
  useMediaQuery, useTheme, Snackbar, Alert, Tooltip,
  CircularProgress,
} from '@mui/material';
import { CropFree, ContentCopy, FileDownload, CheckCircleOutline } from '@mui/icons-material';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useAppSelector } from '../../../store/hook';
import { selectIsBusiness } from '../../../store/selectors/authSelectors';
import { useBusinessData } from '../../partner/hooks/useBusinessData';
import {
  BG_PAGE, GRADIENT_HERO, ALPHA_WHITE_15, ALPHA_WHITE_30, PRIMARY_MAIN,
} from '../../../shared/colors';

// ── Poster dimensions (fixed, A4-ish ratio) ───────────────────────────────────
const POSTER_W = 320;
const POSTER_H = 452; // ~A4 ratio 1:1.414

// Thumbnail scale — a unitless decimal fraction (NOT a CSS percentage)
const THUMB_SCALE = 0.38;
const THUMB_W = Math.round(POSTER_W * THUMB_SCALE); // 122px
const THUMB_H = Math.round(POSTER_H * THUMB_SCALE); // 172px

// ── Shared poster wrapper ─────────────────────────────────────────────────────
const PosterWrap = ({ children, bg }: { children: React.ReactNode; bg?: string }) => (
  <Box sx={{
    width: POSTER_W, height: POSTER_H, flexShrink: 0,
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden', bgcolor: bg ?? 'white',
  }}>
    {children}
  </Box>
);

interface PosterProps { businessName: string; scanUrl: string }

// ── Template 1: Classic Blue ──────────────────────────────────────────────────
const PosterClassic = ({ businessName, scanUrl }: PosterProps) => (
  <PosterWrap>
    {/* Header */}
    <Box sx={{
      background: 'linear-gradient(135deg, #195DE2 0%, #4A90E2 100%)',
      color: 'white', py: 3, px: 3, textAlign: 'center', flexShrink: 0,
    }}>
      <Typography sx={{ fontSize: 28, fontWeight: 900, lineHeight: 1, mb: 0.5, letterSpacing: '-0.5px' }}>
        Winnbell
      </Typography>
      <Typography sx={{ fontSize: 11, fontWeight: 600, opacity: 0.9, letterSpacing: 3, textTransform: 'uppercase' }}>
        Scan · Shop · Win
      </Typography>
    </Box>

    {/* Body */}
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3, py: 2, bgcolor: 'white' }}>
      <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', textAlign: 'center', mb: 3, lineHeight: 1.5 }}>
        Scan to earn entries &amp; win monthly prizes!
      </Typography>
      <Box sx={{ p: '10px', border: '3px solid #195DE2', bgcolor: 'white' }}>
        <QRCode value={scanUrl} size={120} level='H' />
      </Box>
      <Typography sx={{ mt: 2.5, fontSize: 10, color: '#999', textAlign: 'center', letterSpacing: 0.3 }}>
        No purchase necessary · Free entry every week
      </Typography>
    </Box>

    {/* Footer */}
    <Box sx={{ bgcolor: '#EEF3FD', px: 2, py: '14px', borderTop: '1px solid rgba(25,93,230,0.15)', flexShrink: 0, textAlign: 'center' }}>
      <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#195DE2', mb: 0.25 }}>{businessName}</Typography>
      <Typography sx={{ fontSize: 9, color: '#888', letterSpacing: 1, textTransform: 'uppercase' }}>Powered by Winnbell</Typography>
    </Box>
  </PosterWrap>
);

// ── Template 2: Dark Premium ──────────────────────────────────────────────────
const PosterDark = ({ businessName, scanUrl }: PosterProps) => (
  <PosterWrap bg='#0D1B2A'>
    {/* Top badge */}
    <Box sx={{ textAlign: 'center', pt: 3, pb: 1.5, flexShrink: 0 }}>
      <Box sx={{ display: 'inline-block', px: 2, py: 0.5, border: '1px solid rgba(245,185,50,0.4)', mb: 1 }}>
        <Typography sx={{ fontSize: 9, fontWeight: 700, color: '#F5B932', letterSpacing: 2.5, textTransform: 'uppercase' }}>
          Monthly Campaign
        </Typography>
      </Box>
      <Typography sx={{ fontSize: 28, fontWeight: 900, color: 'white', lineHeight: 1, mb: 0.5, letterSpacing: '-0.5px' }}>
        Winnbell
      </Typography>
      <Typography sx={{ fontSize: 10, color: 'white', letterSpacing: 1.5 }}>
        Scan · Earn · Win
      </Typography>
    </Box>

    {/* Body */}
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'white', textAlign: 'center', mb: 3, lineHeight: 1.6 }}>
        Scan the QR code, submit your receipt, and enter to win a monthly cash prize
      </Typography>
      {/* Gold-framed QR */}
      <Box sx={{ p: '10px', background: 'linear-gradient(135deg, #F5B932, #E8A020)' }}>
        <Box sx={{ bgcolor: 'white', p: '8px' }}>
          <QRCode value={scanUrl} size={115} level='H' />
        </Box>
      </Box>
    </Box>

    {/* Footer */}
    <Box sx={{ borderTop: '1px solid rgba(245,185,50,0.2)', px: 3, py: '14px', textAlign: 'center', flexShrink: 0 }}>
      <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#F5B932', mb: 0.25 }}>{businessName}</Typography>
      <Typography sx={{ fontSize: 9, color: 'white', letterSpacing: 1.5, textTransform: 'uppercase' }}>
        Authorized Winnbell Partner
      </Typography>
    </Box>
  </PosterWrap>
);

// ── Template 3: Fresh Green ───────────────────────────────────────────────────
const PosterFresh = ({ businessName, scanUrl }: PosterProps) => (
  <PosterWrap>
    {/* Header */}
    <Box sx={{ background: 'linear-gradient(135deg, #059669 0%, #10B981 60%, #34D399 100%)', color: 'white', py: 3, px: 3, textAlign: 'center', flexShrink: 0 }}>
      <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', opacity: 0.9, mb: 1 }}>
        Winnbell Partner
      </Typography>
      <Typography sx={{ fontSize: 26, fontWeight: 900, lineHeight: 1.1, mb: 0.75 }}>
        Win Cash Prizes
      </Typography>
      <Typography sx={{ fontSize: 12, fontWeight: 500, opacity: 0.85, lineHeight: 1.5 }}>
        Every purchase is a chance to win.{' '}
        Free entry every week — no purchase needed.
      </Typography>
    </Box>

    {/* Body */}
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3, py: 2, bgcolor: 'white' }}>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', mb: 3, textAlign: 'center' }}>
        Scan here to get started
      </Typography>
      <Box sx={{ p: '10px', border: '3px solid #10B981', bgcolor: 'white' }}>
        <QRCode value={scanUrl} size={120} level='H' fgColor='#059669' />
      </Box>
    </Box>

    {/* Footer */}
    <Box sx={{ bgcolor: '#F0FDF7', px: 2, py: '14px', borderTop: '1px solid rgba(5,150,105,0.15)', flexShrink: 0, textAlign: 'center' }}>
      <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#059669', mb: 0.25 }}>{businessName}</Typography>
      <Typography sx={{ fontSize: 9, color: '#888', letterSpacing: 1, textTransform: 'uppercase' }}>Powered by Winnbell</Typography>
    </Box>
  </PosterWrap>
);

// ── Template registry ─────────────────────────────────────────────────────────
const TEMPLATES = [
  { id: 'classic', label: 'Classic Blue',  Component: PosterClassic },
  { id: 'dark',    label: 'Dark Premium',  Component: PosterDark },
  { id: 'fresh',   label: 'Fresh Green',   Component: PosterFresh },
];

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
  const { data: businessData } = useBusinessData(isBusiness);

  const [selectedId, setSelectedId] = useState('classic');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [snackbar, setSnackbar] = useState('');
  const posterRef = useRef<HTMLDivElement>(null);

  const businessName = businessData?.name ?? 'Your Business';
  const businessId = businessData?.id;
  const scanUrl = businessId ? `${window.location.origin}/scan?b=${businessId}` : 'https://winnbell.com';

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

      // 2. Capture poster canvas — use explicit pixel dimensions to avoid shadow bleed
      const canvas = await html2canvas(posterRef.current, {
        scale: 3,
        width: POSTER_W,
        height: POSTER_H,
        useCORS: true,
        backgroundColor: null,
        logging: false,
        imageTimeout: 0,
      });

      // 3. Restore SVGs
      swaps.forEach(({ svg, img }) => {
        svg.style.display = '';
        img.remove();
      });

      // 4. Build PDF — use exact poster aspect ratio so nothing is cut
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = (POSTER_H / POSTER_W) * pageW; // exact ratio, no rounding surprises
      pdf.addImage(imgData, 'PNG', 0, 0, pageW, pageH);
      pdf.save(`winnbell-${selected.id}-poster.pdf`);
      setSnackbar('Poster downloaded!');
    } catch (err) {
      swaps.forEach(({ svg, img }) => { svg.style.display = ''; img.remove(); });
      console.error(err);
      setSnackbar('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: BG_PAGE, minHeight: '100vh', pb: 8 }}>
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

            {/* Thumbnail grid — 2×2, fixed pixel thumbnails with JS-computed scale */}
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 2.5, mb: 3 }}>
              <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 2, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.72rem' }}>
                Choose a template
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: 1.5, justifyContent: 'start' }}>
                {TEMPLATES.map((t) => {
                  const Thumb = t.Component;
                  const isActive = t.id === selectedId;
                  return (
                    <Box
                      key={t.id}
                      onClick={() => setSelectedId(t.id)}
                      sx={{
                        cursor: 'pointer',
                        width: THUMB_W,
                        height: THUMB_H,
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
                          transform: `scale(${THUMB_SCALE})`,
                          pointerEvents: 'none',
                        }}
                      >
                        <Thumb businessName={businessName} scanUrl={scanUrl} />
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

            {/* Full preview — boxShadow on outer wrapper, NOT on posterRef */}
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 2.5 }}>
              <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 2, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.72rem' }}>
                Preview — {selected.label}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                {/* Outer wrapper carries the shadow so html2canvas only captures the poster */}
                <Box sx={{ flexShrink: 0, boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}>
                  <Box ref={posterRef} style={{ width: POSTER_W, height: POSTER_H, overflow: 'hidden' }}>
                    <SelectedPoster businessName={businessName} scanUrl={scanUrl} />
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* ── Right: controls ── */}
          <Paper elevation={0} sx={{
            width: { xs: '100%', md: 300 }, flexShrink: 0,
            borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 3,
            position: { md: 'sticky' }, top: { md: 24 },
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

              {/* Download */}
              <Button
                fullWidth variant='contained' size='large'
                startIcon={downloading ? undefined : <FileDownload />}
                onClick={handleDownload}
                disabled={downloading || !businessId}
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

              {/* URL */}
              {businessId && (
                <Box sx={{ bgcolor: 'action.hover', borderRadius: 1.5, p: 1.5 }}>
                  <Typography variant='caption' fontWeight={700} color='text.secondary' display='block' sx={{ mb: 0.5 }}>Scan URL</Typography>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'text.secondary', wordBreak: 'break-all', lineHeight: 1.5 }}>
                    {scanUrl}
                  </Typography>
                </Box>
              )}

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
