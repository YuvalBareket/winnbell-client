import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Stack, Paper, Button, CircularProgress,
} from '@mui/material';
import { FileDownload, ContentCopy, Download, FactCheckRounded, ArrowForwardRounded } from '@mui/icons-material';
import QRCodePlain from 'react-qr-code';
import {
  PRIMARY_MAIN, TEXT_HEADING, TEXT_SECONDARY,
  ALPHA_PRIMARY_06,
} from '../../../shared/colors';
import { svgToPngDataUrl } from '../utils/capture';
import { LEGAL_TEXT } from './posterConstants';
import { useLocationGatedActions } from '../hooks/useLocationGatedActions';
import GuidelinesAgreementDialog from './GuidelinesAgreementDialog';

// Persists the "don't show again" choice for the brand-guidelines download agreement.
const GUIDELINES_AGREED_KEY = 'winnbell:brandkit:guidelinesAgreed';

interface BrandKitTabProps {
  scanUrl: string;
  effectiveLocationId: number | null;
  onToast: (msg: string) => void;
  onRequireLocation: () => void;
  /** Parent's location-picker dialog state, used to resume a click after picking */
  locationPickerOpen: boolean;
  /** Bumped on every actual pick - distinguishes picking from dismissing the dialog */
  locationPickVersion: number;
  /** Re-ask the location on every action (owner with 2+ locations) */
  alwaysAskLocation: boolean;
}

const BrandKitTab = ({
  scanUrl,
  effectiveLocationId,
  onToast,
  onRequireLocation,
  locationPickerOpen,
  locationPickVersion,
  alwaysAskLocation,
}: BrandKitTabProps) => {
  const navigate = useNavigate();
  const [downloadingQr, setDownloadingQr] = useState(false);
  const [copiedLegal, setCopiedLegal] = useState(false);

  // Brand-guidelines agreement gate for every Brand Kit download. The pending download is held
  // in a ref (no re-render needed) and run once the business agrees.
  const [agreementOpen, setAgreementOpen] = useState(false);
  const pendingDownloadRef = useRef<(() => void) | null>(null);

  const qrRef = useRef<HTMLDivElement>(null);
  const legalRef = useRef<HTMLDivElement>(null);

  // Route every download through the guidelines agreement. If the business ticked "don't show
  // again" previously, download straight away; otherwise open the dialog and hold the action.
  const requestDownload = (action: () => void) => {
    let agreed = false;
    try { agreed = localStorage.getItem(GUIDELINES_AGREED_KEY) === 'true'; } catch { /* private mode */ }
    if (agreed) { action(); return; }
    pendingDownloadRef.current = action;
    setAgreementOpen(true);
  };

  const handleAgree = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      try { localStorage.setItem(GUIDELINES_AGREED_KEY, 'true'); } catch { /* private mode */ }
    }
    setAgreementOpen(false);
    const action = pendingDownloadRef.current;
    pendingDownloadRef.current = null;
    action?.();
  };

  const handleCancelAgreement = () => {
    setAgreementOpen(false);
    pendingDownloadRef.current = null;
  };

  const handleDownloadQr = async () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg || !effectiveLocationId) return;
    setDownloadingQr(true);
    try {
      // Serialize the QR's own SVG (transparent background) instead of capturing the
      // white preview card - the download is a clean square PNG with transparent bg,
      // ready to drop onto any design. 8x the 150px preview = 1200px, print-sharp.
      const pngUrl = await svgToPngDataUrl(svg as SVGSVGElement, 8);
      const link = document.createElement('a');
      link.download = 'winnbell-qr.png';
      link.href = pngUrl;
      link.click();
      onToast('QR downloaded!');
    } catch (err) {
      console.error(err);
      onToast('Download failed. Please try again.');
    } finally {
      setDownloadingQr(false);
    }
  };

  // Location gate: clicking Download with no location chosen opens the picker
  // and the download resumes automatically once a location is picked (the QR
  // mounts on that same render, so the capture sees it).
  const runGated = useLocationGatedActions({
    ready: !!effectiveLocationId,
    pickerOpen: locationPickerOpen,
    requestLocation: onRequireLocation,
    pickVersion: locationPickVersion,
    alwaysAsk: alwaysAskLocation,
    actions: {
      qr: () => { void handleDownloadQr(); },
    },
  });

  const handleCopyLegal = () => {
    navigator.clipboard.writeText(LEGAL_TEXT).then(() => {
      setCopiedLegal(true);
      setTimeout(() => setCopiedLegal(false), 2500);
    });
  };

  // Rasterize the SVG asset to a transparent PNG (long edge ~1200px) - businesses can drop
  // a PNG straight into Canva/posts, while raw SVGs just open in a browser tab.
  const handleDownloadLogo = async (filename: string) => {
    try {
      const img = new Image();
      img.src = `/${filename}`;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Could not load ${filename}`));
      });
      const w = img.naturalWidth || 1200;
      const h = img.naturalHeight || 400;
      const scale = Math.max(1, 1200 / Math.max(w, h));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No canvas context');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('PNG export failed');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename.replace(/\.svg$/i, '.png');
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      onToast('Download failed. Please try again.');
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
              <Typography variant='h6' fontWeight={800} gutterBottom>Brand Kit</Typography>
              <Typography variant='body2' color='text.secondary'>Assets to build your own marketing materials with Winnbell branding.</Typography>
            </Box>

            {/* Grid: 2 columns desktop, 1 mobile */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: { xs: 1.5, md: 2 },
            }}>
              {/* Your Scan QR Card */}
              <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} initial='hidden' animate='visible' transition={{ delay: 0.1, duration: 0.4 }}>
                <Paper elevation={0} sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider', p: 2, height: '100%' }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant='subtitle2' fontWeight={800} gutterBottom>Your QR Code</Typography>
                      <Typography variant='caption' color='text.secondary'>High-res QR for your location</Typography>
                    </Box>

                    {effectiveLocationId && (
                      <Box
                        ref={qrRef}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: '#fff',
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          p: 2,
                        }}
                      >
                        {/* Transparent QR background: the white preview card provides contrast
                            on screen, and the downloaded PNG stays transparent. */}
                        <QRCodePlain value={scanUrl} size={150} level='H' fgColor={TEXT_HEADING} bgColor='transparent' />
                      </Box>
                    )}

                    <Button
                      fullWidth
                      variant='contained'
                      size='small'
                      startIcon={downloadingQr ? <CircularProgress size={16} color='inherit' /> : <FileDownload sx={{ fontSize: 16 }} />}
                      onClick={() => requestDownload(() => runGated('qr'))}
                      disabled={downloadingQr}
                      sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.85rem' }}
                    >
                      {downloadingQr ? 'Generating...' : 'Download'}
                    </Button>
                  </Stack>
                </Paper>
              </motion.div>

              {/* Logos Card */}
              <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} initial='hidden' animate='visible' transition={{ delay: 0.15, duration: 0.4 }}>
                <Paper elevation={0} sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider', p: 2, height: '100%' }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant='subtitle2' fontWeight={800} gutterBottom>Logos</Typography>
                      <Typography variant='caption' color='text.secondary'>Wordmark and app icon</Typography>
                    </Box>

                    {/* Wordmark on light bg */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1.5 }}>
                      <Box component='img' src='/winnbell_app_name.svg' alt='Winnbell' sx={{ height: 20 }} />
                      <Button size='small' startIcon={<Download sx={{ fontSize: 14 }} />} onClick={() => requestDownload(() => handleDownloadLogo('winnbell_app_name.svg'))} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem' }}>
                        Download
                      </Button>
                    </Box>

                    {/* Wordmark on dark bg */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, bgcolor: TEXT_HEADING, borderRadius: 1.5 }}>
                      <Box component='img' src='/winnbell_app_name_white.svg' alt='Winnbell' sx={{ height: 20 }} />
                      <Button size='small' startIcon={<Download sx={{ fontSize: 14 }} />} onClick={() => requestDownload(() => handleDownloadLogo('winnbell_app_name_white.svg'))} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' } }}>
                        Download
                      </Button>
                    </Box>

                    {/* App icon */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1.5 }}>
                      <Box component='img' src='/winnbell_icon.svg' alt='Winnbell Icon' sx={{ height: 32 }} />
                      <Button size='small' startIcon={<Download sx={{ fontSize: 14 }} />} onClick={() => requestDownload(() => handleDownloadLogo('winnbell_icon.svg'))} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem' }}>
                        Download
                      </Button>
                    </Box>

                    {/* App icon on dark bg (white) */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, bgcolor: TEXT_HEADING, borderRadius: 1.5 }}>
                      <Box component='img' src='/winnbell_icon_white.svg' alt='Winnbell Icon White' sx={{ height: 32 }} />
                      <Button size='small' startIcon={<Download sx={{ fontSize: 14 }} />} onClick={() => requestDownload(() => handleDownloadLogo('winnbell_icon_white.svg'))} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' } }}>
                        Download
                      </Button>
                    </Box>
                  </Stack>
                </Paper>
              </motion.div>

              {/* Guidelines Card - links to the Business Participation Guidelines document */}
              <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} initial='hidden' animate='visible' transition={{ delay: 0.25, duration: 0.4 }} style={{ height: '100%' }}>
                <Paper elevation={0} sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider', p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Stack spacing={2} sx={{ flex: 1 }}>
                    {/* Hero band */}
                    <Box
                      onClick={() => navigate('/business-guidelines')}
                      sx={{
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: 2,
                        p: 2.25,
                        background: `linear-gradient(135deg, ${ALPHA_PRIMARY_06}, ${PRIMARY_MAIN}14)`,
                        border: `1px solid ${PRIMARY_MAIN}22`,
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                        '&:hover': {
                          borderColor: PRIMARY_MAIN,
                          boxShadow: `0 6px 18px -8px ${PRIMARY_MAIN}55`,
                          '& .guide-arrow': { transform: 'translateX(3px)' },
                        },
                        '&:active': { transform: 'scale(0.99)' },
                      }}
                    >
                      <Box sx={{ position: 'absolute', top: -50, right: -40, width: 150, height: 150, borderRadius: '50%', background: `radial-gradient(circle, ${PRIMARY_MAIN}14 0%, transparent 68%)`, pointerEvents: 'none' }} />
                      <Stack direction='row' spacing={1.75} alignItems='center' sx={{ position: 'relative' }}>
                        <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: '#fff', color: PRIMARY_MAIN, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 12px -4px ${PRIMARY_MAIN}44` }}>
                          <FactCheckRounded sx={{ fontSize: 22 }} />
                        </Box>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: TEXT_HEADING, lineHeight: 1.25 }}>
                            Business Participation Guidelines
                          </Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: TEXT_SECONDARY, mt: 0.25 }}>
                            The rules your own designs and staff need to follow.
                          </Typography>
                        </Box>
                        <ArrowForwardRounded className='guide-arrow' sx={{ fontSize: 18, color: PRIMARY_MAIN, flexShrink: 0, transition: 'transform 0.18s ease' }} />
                      </Stack>
                    </Box>

                    {/* Required disclosure - the one thing every custom design must carry */}
                    <Box>
                      <Typography variant='caption' fontWeight={700} color='text.secondary' display='block' sx={{ mb: 0.75, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Include the legal text below and follow the Winnbell guidelines
                      </Typography>
                      <Box ref={legalRef} sx={{ p: 1.25, bgcolor: ALPHA_PRIMARY_06, borderRadius: 1 }}>
                        <Typography variant='caption' sx={{ lineHeight: 1.4, color: TEXT_SECONDARY }}>
                          {LEGAL_TEXT}
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      fullWidth
                      variant='outlined'
                      size='small'
                      startIcon={<ContentCopy sx={{ fontSize: 14 }} />}
                      onClick={handleCopyLegal}
                      sx={{
                        mt: 'auto',
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        borderColor: copiedLegal ? 'success.main' : 'divider',
                        color: copiedLegal ? 'success.main' : 'text.primary',
                      }}
                    >
                      {copiedLegal ? 'Copied!' : 'Copy legal text'}
                    </Button>
                  </Stack>
                </Paper>
              </motion.div>
            </Box>
          </Stack>
        </Paper>
      </Box>

      <GuidelinesAgreementDialog
        open={agreementOpen}
        onClose={handleCancelAgreement}
        onAgree={handleAgree}
      />
    </motion.div>
  );
};

export default BrandKitTab;
