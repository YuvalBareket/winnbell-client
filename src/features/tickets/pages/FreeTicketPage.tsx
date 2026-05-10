import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Zoom,
  Fade,
  Dialog,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LockIcon from '@mui/icons-material/Lock';
import BoltIcon from '@mui/icons-material/Bolt';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import { useFreeTicket } from '../hooks/useFreeTicket';
import { AMBER_HOURGLASS, SHADOW_PRIMARY_MEDIUM, GRADIENT_HERO, ALPHA_WHITE_20, ALPHA_WHITE_10, GRADIENT_SUCCESS, GOLD_TROPHY } from '../../../shared/colors';

const getNextSunday = (): Date => {
  const now = new Date();
  const daysUntilSunday = 7 - now.getDay(); // always 1–7 days ahead
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilSunday);
  next.setHours(0, 0, 0, 0);
  return next;
};

const formatNextDate = (dateStr: string | undefined): string => {
  const date = dateStr ? new Date(dateStr) : getNextSunday();
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

const FreeTicketPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { status, activateAsync, isActivating, isLoading } = useFreeTicket();
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [claimedCode, setClaimedCode] = useState('');
  const [claimError, setClaimError] = useState('');

  const handleActivateClick = async () => {
    setClaimError('');
    try {
      const result = await activateAsync(undefined);
      setClaimedCode(result?.code ?? '');
      setSuccessDialogOpen(true);
    } catch (err: any) {
      setClaimError(err?.response?.data?.message ?? 'Something went wrong. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='100dvh'>
        <CircularProgress color='primary' />
      </Box>
    );
  }

  const canActivate = status?.canActivate;
  const noCampaign = !canActivate && (status as any)?.reason === 'no_campaign';

  // Mobile layout (xs/sm)
  if (!isDesktop) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100dvh',
          maxWidth: '480px',
          mx: 'auto',
          pt: 1,
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 2 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ color: 'text.primary', width: 44, height: 44 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant='h6' sx={{ flex: 1, textAlign: 'center', fontWeight: 700, pr: 5 }}>
            Weekly Free Entry
          </Typography>
        </Box>

        {/* Main content — flex:1 pushes footer down naturally */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            px: 3,
            pt: 3,
            textAlign: 'center',
          }}
        >
          {/* Icon */}
          <Box sx={{ position: 'relative', mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                p: 3,
                borderRadius: '50%',
                bgcolor: canActivate ? 'primary.main' : 'action.hover',
                color: canActivate ? 'white' : 'text.disabled',
                transition: 'background 0.3s',
              }}
            >
              <ConfirmationNumberIcon sx={{ fontSize: 60 }} />
            </Box>
            {!canActivate && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -4,
                  right: -4,
                  bgcolor: 'background.paper',
                  p: 0.5,
                  borderRadius: '50%',
                  display: 'flex',
                }}
              >
                <CalendarMonthIcon sx={{ color: AMBER_HOURGLASS }} />
              </Box>
            )}
          </Box>

          {/* Status / Next date */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant='caption'
              sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1.5 }}
            >
              {canActivate ? 'Entry Status' : 'Next Available'}
            </Typography>
            {canActivate ? (
              <Typography
                variant='h2'
                sx={{ fontWeight: 900, color: 'success.main', fontFamily: 'monospace', mt: 1, fontSize: { xs: '2.5rem', sm: '3.75rem' } }}
              >
                READY
              </Typography>
            ) : (
              <Typography
                variant='h5'
                sx={{ fontWeight: 800, color: 'primary.main', mt: 1 }}
              >
                {formatNextDate(status?.nextAvailableDate)}
              </Typography>
            )}
          </Box>

          {/* Description */}
          <Box sx={{ maxWidth: '320px' }}>
            <Typography variant='h5' sx={{ fontWeight: 700, mb: 1.5 }}>
              {canActivate ? 'Your Entry is Waiting!' : noCampaign ? 'No Active Campaign' : 'Entry Request Pending'}
            </Typography>
            <Typography variant='body1' color='text.secondary' sx={{ lineHeight: 1.6 }}>
              Winnbell gives you one free entry every week, from Sunday to Sunday.
              {canActivate
                ? ' Click below to claim your entry and join the campaign!'
                : noCampaign
                  ? ' There is no active campaign right now. Check back soon!'
                  : ' Your next free entry will be available on Sunday.'}
            </Typography>
          </Box>
        </Box>

        {/* Footer — in normal flow, pushed to bottom by flex:1 above */}
        <Box sx={{ p: 3, pb: 4 }}>
          <Button
            fullWidth
            variant='contained'
            size='large'
            disabled={!canActivate || isActivating}
            onClick={handleActivateClick}
            endIcon={canActivate ? <BoltIcon /> : <LockIcon />}
            sx={{
              py: 2,
              borderRadius: 3,
              fontSize: '1.1rem',
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: canActivate ? SHADOW_PRIMARY_MEDIUM : 'none',
            }}
          >
            {isActivating ? 'Claiming...' : 'Get Your Entry'}
          </Button>
          {claimError && (
            <Typography variant='body2' color='error' sx={{ mt: 1.5, textAlign: 'center', fontWeight: 600 }}>
              {claimError}
            </Typography>
          )}
          <Typography
            variant='caption'
            sx={{ display: 'block', textAlign: 'center', mt: 2, color: 'text.secondary', fontWeight: 500 }}
          >
            One free entry per week. Resets every Sunday.
          </Typography>
        </Box>

        {/* ── Success Dialog ───────────────────────────── */}
        <Dialog
          open={successDialogOpen}
          fullScreen
          TransitionComponent={Fade}
          PaperProps={{ sx: { bgcolor: 'transparent' } }}
        >
          <Box sx={{
            height: '100%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: GRADIENT_SUCCESS, px: 4, textAlign: 'center',
          }}>
            <Zoom in={successDialogOpen} timeout={400}>
              <Box sx={{
                width: 100, height: 100, borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mb: 3, border: '2px solid rgba(255,255,255,0.3)',
              }}>
                <EmojiEventsIcon sx={{ fontSize: 52, color: GOLD_TROPHY }} />
              </Box>
            </Zoom>
            <Fade in={successDialogOpen} timeout={600}>
              <Box>
                <Typography variant="h3" fontWeight={800} sx={{ color: 'white', mb: 1 }}>
                  You're In!
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 4, lineHeight: 1.6 }}>
                  Your free entry is in the campaign.<br />Good luck!
                </Typography>
                {claimedCode && (
                  <Box sx={{
                    bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 3, px: 4, py: 2.5, mb: 5, display: 'inline-block',
                  }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 2, display: 'block', mb: 0.5 }}>
                      Entry Code
                    </Typography>
                    <Typography variant="h4" fontWeight={900} sx={{ color: 'white', fontFamily: 'monospace', letterSpacing: 4 }}>
                      {claimedCode}
                    </Typography>
                  </Box>
                )}
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<ConfirmationNumberIcon />}
                    onClick={() => { setSuccessDialogOpen(false); navigate('/tickets'); }}
                    sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 800, borderRadius: 3, py: 1.8, px: 4, '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                  >
                    View My Entries
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => setSuccessDialogOpen(false)}
                    sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}
                  >
                    Close
                  </Button>
                </Stack>
              </Box>
            </Fade>
          </Box>
        </Dialog>
      </Box>
    );
  }

  // Desktop layout (md and up) — two-column premium design
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        minHeight: '100dvh',
      }}
    >
      {/* Left Column — Hero/Brand side */}
      <Box
        sx={{
          background: GRADIENT_HERO,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 4,
        }}
      >
        {/* Decorative background icon */}
        <Box
          sx={{
            position: 'absolute',
            top: -60,
            right: -60,
            fontSize: '400px',
            color: ALPHA_WHITE_10,
            zIndex: 1,
            pointerEvents: 'none',
          }}
        >
          <EmojiEventsIcon sx={{ fontSize: 'inherit' }} />
        </Box>

        {/* Back button */}
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ color: 'white' }}>
            <ArrowBackIcon />
          </IconButton>
        </Box>

        {/* Hero content */}
        <Box sx={{ position: 'relative', zIndex: 2, color: 'white' }}>
          <Typography
            sx={{
              fontSize: '3.5rem',
              fontWeight: 900,
              mb: 2,
              lineHeight: 1.1,
            }}
          >
            One Free Entry.
            <br />
            Every Week.
          </Typography>
          <Typography
            sx={{
              fontSize: '1.1rem',
              lineHeight: 1.7,
              color: ALPHA_WHITE_20,
              mb: 3,
              maxWidth: '90%',
            }}
          >
            Winnbell gives every member one free campaign entry every week. No purchase needed.
          </Typography>

          {/* Info bullets */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CheckCircleIcon sx={{ fontSize: 24, color: ALPHA_WHITE_20 }} />
              <Typography sx={{ color: ALPHA_WHITE_20, fontSize: '0.95rem' }}>
                Resets every Sunday
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CheckCircleIcon sx={{ fontSize: 24, color: ALPHA_WHITE_20 }} />
              <Typography sx={{ color: ALPHA_WHITE_20, fontSize: '0.95rem' }}>
                No purchase required
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CheckCircleIcon sx={{ fontSize: 24, color: ALPHA_WHITE_20 }} />
              <Typography sx={{ color: ALPHA_WHITE_20, fontSize: '0.95rem' }}>
                Stacks with receipt entries
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Right Column — Action side */}
      <Box
        sx={{
          backgroundColor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
        }}
      >
        {/* Status icon */}
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: 'flex',
              p: 4,
              borderRadius: '50%',
              bgcolor: canActivate ? 'primary.main' : 'action.hover',
              color: canActivate ? 'white' : 'text.disabled',
              transition: 'background 0.3s',
            }}
          >
            <ConfirmationNumberIcon sx={{ fontSize: 80 }} />
          </Box>
        </Box>

        {/* Status / Next date */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            variant='caption'
            sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1.5 }}
          >
            {canActivate ? 'Entry Status' : 'Next Available'}
          </Typography>
          {canActivate ? (
            <Typography
              variant='h2'
              sx={{ fontWeight: 900, color: 'success.main', fontFamily: 'monospace', mt: 1, fontSize: '4rem' }}
            >
              READY
            </Typography>
          ) : (
            <Typography
              variant='h4'
              sx={{ fontWeight: 800, color: 'primary.main', mt: 1 }}
            >
              {formatNextDate(status?.nextAvailableDate)}
            </Typography>
          )}
        </Box>

        {/* Description */}
        <Box sx={{ maxWidth: '380px', mb: 4, textAlign: 'center' }}>
          <Typography variant='h5' sx={{ fontWeight: 700, mb: 1.5 }}>
            {canActivate ? 'Your Entry is Waiting!' : noCampaign ? 'No Active Campaign' : 'Entry Request Pending'}
          </Typography>
          <Typography variant='body1' color='text.secondary' sx={{ lineHeight: 1.6 }}>
            Winnbell gives you one free entry every week, from Sunday to Sunday.
            {canActivate
              ? ' Click below to claim your entry and join the campaign!'
              : ' Your next free entry will be available on Sunday.'}
          </Typography>
        </Box>

        {/* Button */}
        <Button
          variant='contained'
          size='large'
          disabled={!canActivate || isActivating}
          onClick={handleActivateClick}
          endIcon={canActivate ? <BoltIcon /> : <LockIcon />}
          sx={{
            py: 2,
            px: 5,
            borderRadius: 3,
            fontSize: '1rem',
            fontWeight: 700,
            textTransform: 'none',
            boxShadow: canActivate ? SHADOW_PRIMARY_MEDIUM : 'none',
            mb: 2,
          }}
        >
          {isActivating ? 'Claiming...' : 'Get Your Entry'}
        </Button>

        {claimError && (
          <Typography variant='body2' color='error' sx={{ mt: 1, textAlign: 'center', fontWeight: 600 }}>
            {claimError}
          </Typography>
        )}

        {/* Caption */}
        <Typography
          variant='caption'
          sx={{ textAlign: 'center', color: 'text.secondary', fontWeight: 500, mt: 1 }}
        >
          One free entry per week. Resets every Sunday.
        </Typography>

      </Box>

      {/* ── Success Dialog ───────────────────────────── */}
      <Dialog
        open={successDialogOpen}
        fullScreen
        TransitionComponent={Fade}
        PaperProps={{ sx: { bgcolor: 'transparent' } }}
      >
        <Box sx={{
          height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: GRADIENT_SUCCESS, px: 4, textAlign: 'center',
        }}>
          <Zoom in={successDialogOpen} timeout={400}>
            <Box sx={{
              width: 100, height: 100, borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mb: 3, border: '2px solid rgba(255,255,255,0.3)',
            }}>
              <EmojiEventsIcon sx={{ fontSize: 52, color: GOLD_TROPHY }} />
            </Box>
          </Zoom>
          <Fade in={successDialogOpen} timeout={600}>
            <Box>
              <Typography variant="h3" fontWeight={800} sx={{ color: 'white', mb: 1 }}>
                You're In!
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 4, lineHeight: 1.6 }}>
                Your free entry is in the campaign.<br />Good luck!
              </Typography>
              {claimedCode && (
                <Box sx={{
                  bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 3, px: 4, py: 2.5, mb: 5, display: 'inline-block',
                }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 2, display: 'block', mb: 0.5 }}>
                    Entry Code
                  </Typography>
                  <Typography variant="h4" fontWeight={900} sx={{ color: 'white', fontFamily: 'monospace', letterSpacing: 4 }}>
                    {claimedCode}
                  </Typography>
                </Box>
              )}
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ConfirmationNumberIcon />}
                  onClick={() => { setSuccessDialogOpen(false); navigate('/tickets'); }}
                  sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 800, borderRadius: 3, py: 1.8, px: 4, '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                >
                  View My Entries
                </Button>
                <Button
                  variant="text"
                  onClick={() => setSuccessDialogOpen(false)}
                  sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}
                >
                  Close
                </Button>
              </Stack>
            </Box>
          </Fade>
        </Box>
      </Dialog>
    </Box>
  );
};

export default FreeTicketPage;
