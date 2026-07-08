import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box, Typography, Stack, Paper, Button, CircularProgress, Collapse, useMediaQuery, useTheme,
} from '@mui/material';
import { ExpandMoreRounded } from '@mui/icons-material';
import {
  QrCode2, Check, BookRounded,
  TrendingUpRounded, LocationOnRounded, CardGiftcardRounded,
} from '@mui/icons-material';
import QRCodePlain from 'react-qr-code';
import {
  PRIMARY_MAIN, PRIMARY_DEEP,
  GOLD_TROPHY, AMBER_HOURGLASS, ACCENT_GOLD_LIGHT, ACCENT_GOLD_DARK, ALPHA_WHITE_15, ALPHA_WHITE_20, ALPHA_WHITE_80, ALPHA_WHITE_90,
  TEXT_HEADING, TEXT_SECONDARY,
  GRADIENT_GOLD_VIVID,
  METRIC_GOOD,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Playbook state
  const [playbook, setPlaybook] = useState([false, false, false, false]);
  const [playbookOpen, setPlaybookOpen] = useState(false);
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

  const handleDownloadQr = async () => {
    if (!heroQrRef.current) return;
    setDownloadingQr(true);
    try {
      await downloadNodeAsPng(heroQrRef.current, 'winnbell-scan-qr.png', 2);
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
    <Box sx={{ p: 0 }}>
      {/* ════════════════════════════════════════════════════════════════════════
          ROW 1: BLUE CARD (QR / new customer) | GOLD CARD (guide, desktop only)
      ════════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.35fr 1fr' },
            gap: { xs: 1.5, md: 2.5 },
            alignItems: 'stretch',
            mb: { xs: 1.5, md: 2.5 },
          }}
        >
          {/* ── BLUE CARD: the QR / new customer welcome (kept on mobile, guide folded in) ── */}
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
                  {/* Pill badge */}
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
                {/* Hidden high-resolution QR (with white quiet-zone) used only for the download */}
                {effectiveLocationId && (
                  <Box ref={heroQrRef} aria-hidden sx={{ position: 'absolute', left: -99999, top: 0, bgcolor: '#fff', p: '48px', display: 'inline-flex' }}>
                    <QRCodePlain value={scanUrl} size={1000} level='H' fgColor={TEXT_HEADING} />
                  </Box>
                )}
              </Stack>

              {/* Actions */}
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
                {/* Mobile only: the guide action folded into this card (gold card is desktop-only) */}
                {isMobile && (
                  <Button
                    variant='outlined'
                    startIcon={<BookRounded sx={{ fontSize: 16 }} />}
                    onClick={handleScrollToPlaybook}
                    sx={{ color: '#fff', borderColor: ALPHA_WHITE_20, bgcolor: ALPHA_WHITE_15, fontWeight: 700, textTransform: 'none', borderRadius: 1.5, px: 1.5, py: 0.65, fontSize: '0.85rem', flex: 1, '&:hover': { borderColor: '#fff', bgcolor: ALPHA_WHITE_15 } }}
                  >
                    See the guide
                  </Button>
                )}
              </Stack>
            </Stack>
          </Paper>

          {/* ── GOLD CARD: the guide (desktop only; folded into the blue card on mobile) ── */}
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
                {/* Gold pill badge */}
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

                {/* Heading - gold gradient text */}
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
                  onClick={handleScrollToPlaybook}
                  sx={{ background: GRADIENT_GOLD_VIVID, color: '#fff', fontWeight: 800, textTransform: 'none', borderRadius: 1.5, px: 2, py: 0.75, fontSize: '0.85rem', mt: 0.5, '&:hover': { background: GRADIENT_GOLD_VIVID, opacity: 0.94 } }}
                >
                  See the guide
                </Button>
              </Stack>
            </Paper>
          )}
        </Box>
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════════════
          ROW 2: THE CUSTOMER LOOP (3 CARDS)
      ════════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Typography
          sx={{
            fontSize: '0.7rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: TEXT_SECONDARY,
            mb: 2,
          }}
        >
          The customer loop
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: { xs: 1.5, md: 2 },
            mb: { xs: 1.5, md: 2.5 },
          }}
        >
          {[
            {
              num: 1,
              title: 'They scan your code',
              desc: 'New customers join Winnbell in seconds. Members land right on receipt submission, with your location already selected.',
              shortDesc: 'Join or submit, in seconds',
            },
            {
              num: 2,
              title: 'They enter the draw',
              desc: 'Submitting a receipt from your shop puts them in this month\'s draw, and keeps your business on their radar.',
              shortDesc: 'Receipts become draw entries',
            },
            {
              num: 3,
              title: 'They come back',
              desc: 'Repeat visits grow, and nearby shoppers discover you on the map.',
              shortDesc: 'Repeat visits and map discovery',
            },
          ].map((item) => (
            <Paper
              key={item.num}
              elevation={0}
              sx={{
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                p: { xs: 1.75, md: 2 },
                background: '#fff',
                boxShadow: `0 1px 3px rgba(0,0,0,0.04)`,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Top row: badge + icon */}
              <Stack direction='row' spacing={1} alignItems='flex-start' sx={{ mb: 1.5 }}>
                {/* Navy badge with number */}
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: 1,
                    bgcolor: TEXT_HEADING,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 800,
                      color: '#fff',
                    }}
                  >
                    {item.num}
                  </Typography>
                </Box>

                {/* Icon square - tinted bg */}
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.25,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    ...(item.num === 1
                      ? {
                          bgcolor: `${PRIMARY_MAIN}14`,
                          color: PRIMARY_MAIN,
                        }
                      : item.num === 2
                      ? {
                          bgcolor: `${METRIC_GOOD}14`,
                          color: METRIC_GOOD,
                        }
                      : {
                          bgcolor: `${ACCENT_GOLD_DARK}14`,
                          color: ACCENT_GOLD_DARK,
                        }),
                  }}
                >
                  {item.num === 1 && <QrCode2 sx={{ fontSize: 18 }} />}
                  {item.num === 2 && <CardGiftcardRounded sx={{ fontSize: 18 }} />}
                  {item.num === 3 && <TrendingUpRounded sx={{ fontSize: 18 }} />}
                </Box>
              </Stack>

              {/* Title + description */}
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  color: TEXT_HEADING,
                  mb: 0.75,
                }}
              >
                {item.title}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  color: TEXT_SECONDARY,
                  lineHeight: 1.55,
                  display: { xs: 'none', md: 'block' },
                }}
              >
                {item.desc}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  color: TEXT_SECONDARY,
                  lineHeight: 1.55,
                  display: { xs: 'block', md: 'none' },
                }}
              >
                {item.shortDesc}
              </Typography>
            </Paper>
          ))}
        </Box>
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════════════
          ROW 3: BENEFITS STRIP (HORIZONTAL)
      ════════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <Paper
          elevation={0}
          sx={{
            background: '#fff',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            p: { xs: 2, md: 2.5 },
            mb: { xs: 1.5, md: 2.5 },
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: { xs: 2, md: 2.5 },
            }}
          >
            {[
              {
                icon: TrendingUpRounded,
                title: 'More repeat visits',
                subtitle: 'A reason to come back every time.',
              },
              {
                icon: LocationOnRounded,
                title: 'New discovery',
                subtitle: 'Found by nearby shoppers.',
              },
              {
                icon: CardGiftcardRounded,
                title: 'No discounts',
                subtitle: 'Loyalty without cutting your prices.',
              },
            ].map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <Stack
                  key={idx}
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={1.75}
                  alignItems={{ xs: 'center', md: 'flex-start' }}
                  sx={{ textAlign: { xs: 'center', md: 'left' } }}
                >
                  {/* Icon tile - white rounded */}
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 1.5,
                      bgcolor: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: `0 1px 3px rgba(0,0,0,0.06)`,
                      color:
                        idx === 0
                          ? PRIMARY_MAIN
                          : idx === 1
                          ? METRIC_GOOD
                          : METRIC_GOOD,
                    }}
                  >
                    {idx === 2 ? (
                      <Check sx={{ fontSize: 20 }} />
                    ) : (
                      <IconComponent sx={{ fontSize: 20 }} />
                    )}
                  </Box>

                  {/* Text content */}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: { xs: '1.05rem', md: '1.1rem' },
                        fontWeight: 800,
                        color: TEXT_HEADING,
                        lineHeight: 1.2,
                        mb: 0.5,
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: TEXT_SECONDARY,
                      }}
                    >
                      {item.subtitle}
                    </Typography>
                  </Box>
                </Stack>
              );
            })}
          </Box>
        </Paper>
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════════════
          ROW 4: YOUR GROWTH PLAYBOOK (PRESERVE EXISTING)
      ════════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Paper
          ref={playbookRef}
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            p: { xs: 2, md: 3 },
            mb: 3,
            background: '#fff',
          }}
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

            {isMobile && (
              <Button
                fullWidth
                variant='outlined'
                onClick={() => setPlaybookOpen((o) => !o)}
                endIcon={<ExpandMoreRounded sx={{ transform: playbookOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />}
                sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'divider', color: 'primary.main', '&:hover': { borderColor: 'primary.main' } }}
              >
                {playbookOpen ? 'Hide steps' : 'View steps'}
              </Button>
            )}

            <Collapse in={!isMobile || playbookOpen} timeout='auto' unmountOnExit sx={{ width: '100%' }}>
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
            </Collapse>
          </Stack>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default OverviewTab;
