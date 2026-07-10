import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Box, Typography, Stack, Paper, Button, CircularProgress,
} from '@mui/material';
import { FileDownload, ContentCopy, Download } from '@mui/icons-material';
import QRCodePlain from 'react-qr-code';
import {
  PRIMARY_MAIN, TEXT_HEADING, TEXT_SECONDARY,
  ALPHA_PRIMARY_06,
} from '../../../shared/colors';
import { downloadNodeAsPng } from '../utils/capture';
import { LEGAL_TEXT } from './posterConstants';

interface BrandKitTabProps {
  scanUrl: string;
  effectiveLocationId: number | null;
  onToast: (msg: string) => void;
  onRequireLocation: () => void;
}

const BrandKitTab = ({
  scanUrl,
  effectiveLocationId,
  onToast,
  onRequireLocation,
}: BrandKitTabProps) => {
  const [downloadingQr, setDownloadingQr] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [copiedLegal, setCopiedLegal] = useState(false);

  const qrRef = useRef<HTMLDivElement>(null);
  const legalRef = useRef<HTMLDivElement>(null);

  const handleDownloadQr = async () => {
    if (!qrRef.current || !effectiveLocationId) return;
    setDownloadingQr(true);
    try {
      await downloadNodeAsPng(qrRef.current, 'winnbell-qr.png', 2);
      onToast('QR downloaded!');
    } catch (err) {
      console.error(err);
      onToast('Download failed. Please try again.');
    } finally {
      setDownloadingQr(false);
    }
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex).then(() => {
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 2500);
    });
  };

  const handleCopyLegal = () => {
    navigator.clipboard.writeText(LEGAL_TEXT).then(() => {
      setCopiedLegal(true);
      setTimeout(() => setCopiedLegal(false), 2500);
    });
  };

  const handleDownloadLogo = (filename: string) => {
    const link = document.createElement('a');
    link.href = `/${filename}`;
    link.download = filename;
    link.click();
  };

  const BRAND_COLORS = [
    { name: 'Primary', hex: PRIMARY_MAIN },
    { name: 'Text Heading', hex: TEXT_HEADING },
    { name: 'Trophy Gold', hex: '#fbbf24' },
    { name: 'Accent Green', hex: '#2e7d32' },
  ];

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
                      <Typography variant='subtitle2' fontWeight={800} gutterBottom>Your scan QR</Typography>
                      <Typography variant='caption' color='text.secondary'>High-res QR for your location</Typography>
                    </Box>

                    {effectiveLocationId && (
                      <>
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
                          <QRCodePlain value={scanUrl} size={150} level='H' fgColor={TEXT_HEADING} />
                        </Box>

                        <Button
                          fullWidth
                          variant='contained'
                          size='small'
                          startIcon={downloadingQr ? <CircularProgress size={16} color='inherit' /> : <FileDownload sx={{ fontSize: 16 }} />}
                          onClick={handleDownloadQr}
                          disabled={downloadingQr}
                          sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.85rem' }}
                        >
                          {downloadingQr ? 'Generating...' : 'Download'}
                        </Button>
                      </>
                    )}

                    {!effectiveLocationId && (
                      <Button
                        fullWidth
                        variant='outlined'
                        size='small'
                        onClick={onRequireLocation}
                        sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.85rem' }}
                      >
                        Choose a location
                      </Button>
                    )}
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
                      <Button size='small' startIcon={<Download sx={{ fontSize: 14 }} />} onClick={() => handleDownloadLogo('winnbell_app_name.svg')} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem' }}>
                        Download
                      </Button>
                    </Box>

                    {/* Wordmark on dark bg */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, bgcolor: TEXT_HEADING, borderRadius: 1.5 }}>
                      <Box component='img' src='/winnbell_app_name_white.svg' alt='Winnbell' sx={{ height: 20 }} />
                      <Button size='small' startIcon={<Download sx={{ fontSize: 14 }} />} onClick={() => handleDownloadLogo('winnbell_app_name_white.svg')} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' } }}>
                        Download
                      </Button>
                    </Box>

                    {/* App icon */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1.5 }}>
                      <Box component='img' src='/winnbell_icon.svg' alt='Winnbell Icon' sx={{ height: 32 }} />
                      <Button size='small' startIcon={<Download sx={{ fontSize: 14 }} />} onClick={() => handleDownloadLogo('winnbell_icon.svg')} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem' }}>
                        Download
                      </Button>
                    </Box>

                    {/* App icon on dark bg (white) */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, bgcolor: TEXT_HEADING, borderRadius: 1.5 }}>
                      <Box component='img' src='/winnbell_icon_white.svg' alt='Winnbell Icon White' sx={{ height: 32 }} />
                      <Button size='small' startIcon={<Download sx={{ fontSize: 14 }} />} onClick={() => handleDownloadLogo('winnbell_icon_white.svg')} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' } }}>
                        Download
                      </Button>
                    </Box>
                  </Stack>
                </Paper>
              </motion.div>

              {/* Brand Colors Card */}
              <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} initial='hidden' animate='visible' transition={{ delay: 0.2, duration: 0.4 }}>
                <Paper elevation={0} sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider', p: 2, height: '100%' }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant='subtitle2' fontWeight={800} gutterBottom>Brand colors</Typography>
                      <Typography variant='caption' color='text.secondary'>Click to copy hex value</Typography>
                    </Box>

                    <Stack spacing={1}>
                      {BRAND_COLORS.map((color) => (
                        <Box
                          key={color.hex}
                          onClick={() => handleCopyHex(color.hex)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            p: 1,
                            borderRadius: 1.5,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            border: '1px solid',
                            borderColor: copiedHex === color.hex ? 'success.main' : 'divider',
                            bgcolor: copiedHex === color.hex ? 'rgba(46,125,50,0.04)' : 'transparent',
                            '&:hover': { borderColor: PRIMARY_MAIN, bgcolor: ALPHA_PRIMARY_06 },
                          }}
                        >
                          <Box sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: color.hex, flexShrink: 0 }} />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant='caption' fontWeight={700} display='block'>{color.name}</Typography>
                            <Typography variant='caption' color='text.secondary' sx={{ fontFamily: 'monospace' }}>{color.hex}</Typography>
                          </Box>
                          {copiedHex === color.hex && (
                            <Typography variant='caption' color='success.main' fontWeight={700}>Copied</Typography>
                          )}
                        </Box>
                      ))}
                    </Stack>
                  </Stack>
                </Paper>
              </motion.div>

              {/* Rules Card */}
              <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} initial='hidden' animate='visible' transition={{ delay: 0.25, duration: 0.4 }}>
                <Paper elevation={0} sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider', p: 2, height: '100%' }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant='subtitle2' fontWeight={800} gutterBottom>Rules for your own designs</Typography>
                      <Typography variant='caption' color='text.secondary'>Keep brand consistent and compliant</Typography>
                    </Box>

                    <Box sx={{ p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1.5 }}>
                      <Stack spacing={1}>
                        <Box>
                          <Typography variant='caption' fontWeight={700} display='block' sx={{ color: 'success.main', mb: 0.5 }}>Do</Typography>
                          <Stack spacing={0.5}>
                            <Typography variant='caption'>Include the scan QR or link</Typography>
                            <Typography variant='caption'>Say entry is free</Typography>
                            <Typography variant='caption'>Keep logo colors intact</Typography>
                          </Stack>
                        </Box>
                        <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 1 }}>
                          <Typography variant='caption' fontWeight={700} display='block' sx={{ color: '#c62828', mb: 0.5 }}>Don't</Typography>
                          <Stack spacing={0.5}>
                            <Typography variant='caption'>Promise winning or imply purchase improves odds</Typography>
                            <Typography variant='caption'>Alter logo colors or proportions</Typography>
                            <Typography variant='caption'>Forget the legal line</Typography>
                          </Stack>
                        </Box>
                      </Stack>
                    </Box>

                    <Box ref={legalRef} sx={{ p: 1.25, bgcolor: ALPHA_PRIMARY_06, borderRadius: 1 }}>
                      <Typography variant='caption' sx={{ lineHeight: 1.4, color: TEXT_SECONDARY }}>
                        {LEGAL_TEXT}
                      </Typography>
                    </Box>

                    <Button
                      fullWidth
                      variant='outlined'
                      size='small'
                      startIcon={<ContentCopy sx={{ fontSize: 14 }} />}
                      onClick={handleCopyLegal}
                      sx={{
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
    </motion.div>
  );
};

export default BrandKitTab;
