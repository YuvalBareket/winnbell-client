import { Box, Button, Stack, Typography, CircularProgress, Snackbar, Alert, Container, Paper, useMediaQuery, useTheme } from '@mui/material';
import { ContentCopyOutlined, CheckCircleOutlined, PersonAddOutlined, ShareOutlined, CardGiftcardOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useReferralLink } from '../hooks/useReferralLink';
import {
  GRADIENT_HERO, PRIMARY_MAIN, PRIMARY_LIGHT, ALPHA_WHITE_15, ALPHA_WHITE_30,
  BORDER_LIGHT, SHADOW_CARD, SHADOW_CARD_HOVER, MOBILE_CONTENT_HEIGHT,
  TEXT_SECONDARY, TEXT_HEADING,
} from '../../../shared/colors';

const InviteFriendsPage = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { data: referralLink, isLoading } = useReferralLink();
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState('');

  const handleCopyLink = async () => {
    if (!referralLink?.link) return;
    try {
      await navigator.clipboard.writeText(referralLink.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setShareError('Failed to copy link');
    }
  };

  const handleWebShare = async () => {
    if (!referralLink?.link) return;
    if (!navigator.share) {
      handleCopyLink();
      return;
    }
    try {
      await navigator.share({
        title: 'Join Winnbell',
        text: 'Get a free bonus entry when you join through my link.',
        url: referralLink.link,
      });
    } catch (err: unknown) {
      const error = err as { name?: string };
      if (error?.name !== 'AbortError') {
        setShareError('Failed to share');
      }
    }
  };

  const steps = [
    {
      icon: <ShareOutlined />,
      title: 'Share your link',
      text: 'Know someone who could use a little extra luck this month? Share your link and invite them to join Winnbell. Because sometimes the little things mean the most.',
    },
    {
      icon: <PersonAddOutlined />,
      title: 'They join free',
      text: 'Your friends create an account and sign up through your link with no payment required.',
    },
    {
      icon: <CardGiftcardOutlined />,
      title: 'Bonus entry granted',
      text: 'They receive a free bonus entry in the current monthly draw right away.',
    },
  ];

  const referralLinkCard = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.23 }}
    >
      {isLoading ? (
        <Box
          sx={{
            p: 3,
            border: `1px solid ${BORDER_LIGHT}`,
            borderRadius: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 160,
            bgcolor: 'white',
          }}
        >
          <CircularProgress size={34} thickness={4} />
        </Box>
      ) : referralLink ? (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: 2,
            border: `1px solid ${BORDER_LIGHT}`,
            boxShadow: SHADOW_CARD,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: SHADOW_CARD_HOVER,
            },
          }}
        >
          <Stack spacing={2.5}>
            {/* Value proposition header */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    color: TEXT_HEADING,
                    lineHeight: 1.3,
                  }}
                >
                  Give your friends a free entry
                </Typography>
              </Box>
              <Typography
                sx={{
                  color: TEXT_SECONDARY,
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                }}
              >
Know someone who could use a little extra luck this month? Share your link and invite them to join Winnbell. Because sometimes the little things mean the most.              </Typography>
            </Box>

            {/* Link display */}
            <Box
              sx={{
                p: 2,
                bgcolor: '#f8fafb',
                borderRadius: 2,
                border: `1px solid ${BORDER_LIGHT}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
                overflow: 'hidden',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.85rem',
                  color: TEXT_SECONDARY,
                  fontFamily: 'monospace',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {referralLink.link}
              </Typography>
              <motion.div
                initial={false}
                animate={{
                  scale: copied ? 1.05 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <Button
                  size="small"
                  variant="text"
                  onClick={handleCopyLink}
                  startIcon={copied ? <CheckCircleOutlined /> : <ContentCopyOutlined />}
                  sx={{
                    color: copied ? 'green' : PRIMARY_MAIN,
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    textTransform: 'none',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      bgcolor: 'rgba(21, 101, 192, 0.05)',
                    },
                  }}
                >
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </motion.div>
            </Box>

            {/* Share button */}
            <Button
              variant="contained"
              fullWidth
              onClick={handleWebShare}
              endIcon={<ShareOutlined />}
              sx={{
                bgcolor: PRIMARY_MAIN,
                color: 'white',
                fontWeight: 800,
                fontSize: '0.95rem',
                py: 1.4,
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: `0 4px 12px rgba(21, 101, 192, 0.25)`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: '#1248a8',
                  boxShadow: `0 8px 20px rgba(21, 101, 192, 0.35)`,
                  transform: 'translateY(-2px)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              Share with friends
            </Button>
          </Stack>
        </Paper>
      ) : null}
    </motion.div>
  );

  const howItWorksSection = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.31 }}
    >
      <Stack
        spacing={3}
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 3,
        }}
      >
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.39 + i * 0.08 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 2,
                border: `1px solid ${BORDER_LIGHT}`,
                boxShadow: SHADOW_CARD,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                height: '100%',
                '&:hover': {
                  boxShadow: SHADOW_CARD_HOVER,
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <Stack spacing={1.5}>
                {i === 0 && (
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: '1rem',
                      color: TEXT_HEADING,
                      mb: 0.5,
                    }}
                  >
                    How it works
                  </Typography>
                )}

                {/* Step number + icon */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: PRIMARY_MAIN,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      flexShrink: 0,
                      '& svg': {
                        fontSize: 24,
                      },
                    }}
                  >
                    {step.icon}
                  </Box>
                  <Box
                    sx={{
                      px: 1.2,
                      py: 0.4,
                      borderRadius: 1.5,
                      bgcolor: 'rgba(21, 101, 192, 0.08)',
                      color: PRIMARY_MAIN,
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Step {i + 1}
                  </Box>
                </Box>

                {/* Text */}
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      color: TEXT_HEADING,
                      mb: 0.5,
                      lineHeight: 1.3,
                    }}
                  >
                    {step.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.85rem',
                      color: TEXT_SECONDARY,
                      lineHeight: 1.5,
                    }}
                  >
                    {step.text}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </motion.div>
        ))}
      </Stack>
    </motion.div>
  );

  const reinforcementLine = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.63 }}
    >
      <Box sx={{ textAlign: 'center', py: { xs: 2, md: 3 } }}>
        <Typography
          sx={{
            fontWeight: 650,
            fontSize: { xs: '0.9rem', md: '1rem' },
            textAlign: 'center',
            display: 'inline-block',
            background: `linear-gradient(110deg, ${PRIMARY_MAIN} 0%, ${PRIMARY_MAIN} 43%, ${PRIMARY_LIGHT} 50%, ${PRIMARY_MAIN} 57%, ${PRIMARY_MAIN} 100%)`,
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            willChange: 'background-position',
            animation: 'inviteShimmer 2.8s linear infinite',
            '@keyframes inviteShimmer': {
              '0%': { backgroundPosition: '100% 0' },
              '100%': { backgroundPosition: '-100% 0' },
            },
          }}
        >
          Good things are better shared. It only takes a moment to bring a friend along.
        </Typography>
      </Box>
    </motion.div>
  );

  // DESKTOP LAYOUT
  if (isDesktop) {
    return (
      <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: '100dvh' }, pb: 6 }}>
        {/* Hero */}
        <Box sx={{ background: GRADIENT_HERO, pt: 3, pb: 9, px: 3, color: 'white', borderRadius: '0 0 32px 32px' }}>
          <Container maxWidth='lg'>
            <Stack direction='row' alignItems='center' spacing={2}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Box sx={{
                  width: 52, height: 52, borderRadius: 2,
                  bgcolor: ALPHA_WHITE_15, border: `1px solid ${ALPHA_WHITE_30}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CardGiftcardOutlined sx={{ color: 'white', fontSize: 28 }} />
                </Box>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Box>
                  <Typography variant='h5' fontWeight={800}>
                    Invite Friends
                  </Typography>
                  <Typography variant='body2' sx={{ opacity: 0.75 }}>
                    Share Winnbell and give them a free bonus entry
                  </Typography>
                </Box>
              </motion.div>
            </Stack>
          </Container>
        </Box>

        <Container maxWidth='lg' sx={{ mt: -5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.1fr)', gap: 3, alignItems: 'flex-start' }}>
            {/* Left column: How it works (sticky at top) */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ position: 'sticky', top: 24, zIndex: 10 }}
            >
              <Stack spacing={3}>
                {steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.39 + i * 0.08 }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        border: `1px solid ${BORDER_LIGHT}`,
                        boxShadow: SHADOW_CARD,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          boxShadow: SHADOW_CARD_HOVER,
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <Stack spacing={1.5}>
                        {i === 0 && (
                          <Typography
                            sx={{
                              fontWeight: 800,
                              fontSize: '1rem',
                              color: TEXT_HEADING,
                              mb: 0.5,
                            }}
                          >
                            How it works
                          </Typography>
                        )}

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              bgcolor: PRIMARY_MAIN,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              flexShrink: 0,
                              '& svg': {
                                fontSize: 20,
                              },
                            }}
                          >
                            {step.icon}
                          </Box>
                          <Box
                            sx={{
                              px: 1,
                              py: 0.3,
                              borderRadius: 1.5,
                              bgcolor: 'rgba(21, 101, 192, 0.08)',
                              color: PRIMARY_MAIN,
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              letterSpacing: '0.05em',
                              textTransform: 'uppercase',
                            }}
                          >
                            Step {i + 1}
                          </Box>
                        </Box>

                        <Box>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.9rem',
                              color: TEXT_HEADING,
                              mb: 0.25,
                              lineHeight: 1.3,
                            }}
                          >
                            {step.title}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '0.8rem',
                              color: TEXT_SECONDARY,
                              lineHeight: 1.4,
                            }}
                          >
                            {step.text}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </motion.div>
                ))}
              </Stack>
            </motion.div>

            {/* Right column: Share card + reinforcement */}
            <Stack spacing={3} sx={{ minWidth: 0 }}>
              {referralLinkCard}

              {reinforcementLine}
            </Stack>
          </Box>
        </Container>

        {/* Toast notifications */}
        <Snackbar open={copied} autoHideDuration={2500} onClose={() => setCopied(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert severity="success" sx={{ fontWeight: 600 }}>
            Link copied to clipboard
          </Alert>
        </Snackbar>

        <Snackbar open={!!shareError} autoHideDuration={3000} onClose={() => setShareError('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert severity="error" sx={{ fontWeight: 600 }}>
            {shareError}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  // MOBILE LAYOUT
  return (
    <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: '100dvh' }, zoom: { xs: 0.9, md: 1 }, pb: 4 }}>
      {/* Heading card on MainLayout gradient (no painted hero) */}
      <Box sx={{ pt: 2, px: 2, pb: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Stack direction='row' alignItems='center' spacing={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
          bgcolor: ALPHA_WHITE_15, border: `1px solid ${ALPHA_WHITE_30}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: SHADOW_CARD,
                flexShrink: 0,
              }}
            >
              <CardGiftcardOutlined sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant='h6' fontWeight={800} sx={{ fontSize: '1.1rem' ,color:'white'}}>
                Invite Friends
              </Typography>
              <Typography variant='caption' sx={{ color: 'white' }}>
                Share Winnbell with friends
              </Typography>
            </Box>
          </Stack>
        </motion.div>
      </Box>

      {/* Main content */}
      <Box sx={{ px: 2 }}>
        <Stack spacing={3} sx={{ minWidth: 0 }}>
          {referralLinkCard}

          {howItWorksSection}

          {reinforcementLine}
        </Stack>
      </Box>

      {/* Toast notifications */}
      <Snackbar open={copied} autoHideDuration={2500} onClose={() => setCopied(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" sx={{ fontWeight: 600 }}>
          Link copied to clipboard
        </Alert>
      </Snackbar>

      <Snackbar open={!!shareError} autoHideDuration={3000} onClose={() => setShareError('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" sx={{ fontWeight: 600 }}>
          {shareError}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InviteFriendsPage;
