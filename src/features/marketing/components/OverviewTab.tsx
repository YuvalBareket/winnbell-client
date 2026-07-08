import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box, Typography, Stack, Paper, Button, CircularProgress,
} from '@mui/material';
import {
  ContentCopy, QrCode2, Check, AutoAwesomeRounded, ArrowForwardRounded,
} from '@mui/icons-material';
import QRCodePlain from 'react-qr-code';
import {
  PRIMARY_MAIN,
  GOLD_TROPHY, ACCENT_GOLD_LIGHT, ALPHA_WHITE_15, ALPHA_WHITE_20, ALPHA_WHITE_80,
  TEXT_HEADING,
  GRADIENT_GOLD_VIVID,
  ALPHA_AMBER_12, ALPHA_AMBER_25,
} from '../../../shared/colors';
import { downloadNodeAsPng } from '../utils/capture';
import { StarRounded } from '@mui/icons-material';

interface OverviewTabProps {
  effectiveLocationId: number | null;
  scanUrl: string;
  onToast: (msg: string) => void;
  onRequireLocation: () => void;
  onTabSwitch: (tabName: 'Social Posts' | 'Posters' | 'Scripts') => void;
}

const OverviewTab = ({
  effectiveLocationId,
  scanUrl,
  onToast,
  onRequireLocation,
  onTabSwitch,
}: OverviewTabProps) => {
  // Playbook state
  const [playbook, setPlaybook] = useState([false, false, false, false]);
  const [copied, setCopied] = useState(false);
  const [downloadingQr, setDownloadingQr] = useState(false);

  // Ref for QR download
  const heroQrRef = useRef<HTMLDivElement>(null);

  // Ref for playbook card (for scroll-to-anchor)
  const playbookRef = useRef<HTMLDivElement>(null);

  // Load playbook from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('winnbell_grow_playbook');
    if (saved) {
      try {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) setPlaybook([Boolean(arr[0]), Boolean(arr[1]), Boolean(arr[2]), Boolean(arr[3])]);
      } catch {
        // Ignore parse errors for corrupted localStorage
      }
    }
  }, []);

  // Save playbook to localStorage
  const updatePlaybook = (index: number) => {
    const updated = [...playbook];
    updated[index] = !updated[index];
    setPlaybook(updated);
    localStorage.setItem('winnbell_grow_playbook', JSON.stringify(updated));
  };

  const handleCopyScanUrl = () => {
    navigator.clipboard.writeText(scanUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleDownloadQr = async () => {
    if (!heroQrRef.current) return;
    setDownloadingQr(true);
    try {
      await downloadNodeAsPng(heroQrRef.current, 'winnbell-scan-qr.png', 3);
      onToast('QR downloaded!');
    } catch (err) {
      console.error(err);
      onToast('Download failed. Please try again.');
    } finally {
      setDownloadingQr(false);
    }
  };

  const handleScrollToPlaybook = () => {
    if (playbookRef.current) {
      playbookRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Optional: trigger a subtle highlight pulse on arrival
      const elem = playbookRef.current;
      elem.style.transition = 'box-shadow 0.4s ease-out';
      elem.style.boxShadow = `0 0 24px ${GOLD_TROPHY}40`;
      setTimeout(() => {
        elem.style.boxShadow = '0 0 0px transparent';
      }, 1200);
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* ════════════════════════════════════════════════════════════════════════
          GROWTH PLAYBOOK CTA (Attractor - first thing on the page)
      ════════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        <motion.div
          whileHover={{ scale: 1.012 }}
          whileTap={{ scale: 0.99 }}
          animate={{ scale: [1, 1.012, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Paper
            elevation={0}
            onClick={handleScrollToPlaybook}
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 3,
              p: { xs: 3, md: 4 },
              mb: 3,
              background: '#fff',
              border: `1px solid ${GOLD_TROPHY}55`,
              cursor: 'pointer',
              boxShadow: `0 6px 18px ${ALPHA_AMBER_12}`,
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '-50%',
                right: '-15%',
                width: 280,
                height: 280,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${GOLD_TROPHY}22 0%, transparent 70%)`,
                pointerEvents: 'none',
              },
            }}
          >
            <Stack spacing={2} alignItems='flex-start' sx={{ position: 'relative', zIndex: 1, maxWidth: 560 }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.5rem', md: '1.9rem' },
                  lineHeight: 1.2,
                  letterSpacing: '-0.01em',
                  background: GRADIENT_GOLD_VIVID,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                }}
              >
                Get the most out of Winnbell
              </Typography>
              <motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                <Button
                  startIcon={<AutoAwesomeRounded />}
                  endIcon={<ArrowForwardRounded />}
                  sx={{
                    background: GRADIENT_GOLD_VIVID,
                    color: '#fff',
                    fontWeight: 800,
                    textTransform: 'none',
                    borderRadius: 1.5,
                    px: 2.25,
                    py: 0.9,
                    fontSize: '0.82rem',
                    boxShadow: `0 4px 14px ${ALPHA_AMBER_25}`,
                    '& .MuiSvgIcon-root': { fontSize: 17 },
                    '&:hover': { background: GRADIENT_GOLD_VIVID, opacity: 0.94 },
                  }}
                >
                  See the Growth playbook
                </Button>
              </motion.div>
            </Stack>
          </Paper>
        </motion.div>
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════════════
          SECTION A: NEW CUSTOMER WELCOME (hero banner)
      ════════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        <Paper
          elevation={0}
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 3,
            p: { xs: 2.5, md: 4 },
            background: `linear-gradient(135deg, ${PRIMARY_MAIN} 0%, #0f3a6b 100%)`,
            color: '#fff',
            mb: 3,
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
                    onClick={onRequireLocation}
                    sx={{ bgcolor: '#fff', color: PRIMARY_MAIN, fontWeight: 800, textTransform: 'none', borderRadius: 2, px: 2.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                  >
                    Choose a location to start
                  </Button>
                )}
              </Stack>
            </Box>
            {/* QR panel - off-screen on mobile via absolute positioning, static on desktop */}
            {effectiveLocationId && (
              <Box sx={{ position: { xs: 'absolute', md: 'static' }, left: { xs: -9999, md: 'auto' }, top: { xs: 0, md: 'auto' }, flexShrink: 0, textAlign: 'center' }}>
                <Box ref={heroQrRef} sx={{ bgcolor: '#fff', borderRadius: '18px', p: 2, display: 'flex' }}>
                  <QRCodePlain value={scanUrl} size={128} level='H' fgColor={TEXT_HEADING} />
                </Box>
                <Typography sx={{ color: ALPHA_WHITE_80, fontSize: '0.68rem', mt: 1 }}>No purchase necessary</Typography>
              </Box>
            )}
          </Stack>
        </Paper>
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════════════
          SECTION C: YOUR GROWTH PLAYBOOK
      ════════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Paper
          ref={playbookRef}
          elevation={0}
          sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', p: { xs: 2.5, md: 3.5 }, mb: 3 }}
        >
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
                { title: 'Put a QR at your checkout', desc: 'This is the #1 driver of scans', action: 'See QR', tabName: 'Posters' as const },
                { title: 'Brief your team', desc: 'Teach them the script to ask', action: 'View script', tabName: 'Scripts' as const },
                { title: 'Add another QR spot', desc: 'Beyond checkout for more reach', action: 'Design posters', tabName: 'Posters' as const },
                { title: 'Put up your Winnbell sticker', desc: 'A branded QR right at your counter', action: 'Get sticker', tabName: 'Scripts' as const },
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
                    onClick={() => {
                      if (item.tabName === 'Posters') onTabSwitch('Posters');
                      else if (item.tabName === 'Scripts') onTabSwitch('Scripts');
                    }}
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
  );
};

export default OverviewTab;
