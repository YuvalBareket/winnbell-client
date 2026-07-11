import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CardGiftcardOutlined from '@mui/icons-material/CardGiftcardOutlined';
import StarRounded from '@mui/icons-material/StarRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import EventAvailableRounded from '@mui/icons-material/EventAvailableRounded';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AppPageHero from '../../../shared/components/AppPageHero';
import { useFreeTicket } from '../hooks/useFreeTicket';
import { useMyRiskLevel } from '../hooks/useMyRiskLevel';
import PhoneVerificationGate from '../components/PhoneVerificationGate';
import {
  PRIMARY_MAIN, PRIMARY_DEEP, SUCCESS_GREEN, BG_SURFACE,
  ALPHA_WHITE_15, ALPHA_WHITE_80,
  TEXT_HEADING, TEXT_SECONDARY, BORDER_LIGHT, MOBILE_CONTENT_HEIGHT, SHADOW_PRIMARY_MEDIUM,
} from '../../../shared/colors';
import FreeEntrySuccessDialog from '../components/FreeEntrySuccessDialog';
import { breathe, pressable } from '../../../shared/motion';

const GRADIENT_FREE = `linear-gradient(155deg, ${PRIMARY_MAIN} 0%, ${PRIMARY_DEEP} 100%)`;

const FREE_ENTRY_INFO =
  'Winnbell gives every member one free entry each week. It resets every Sunday, so claim yours before the week is up.';

const getNextSunday = (): Date => {
  const now = new Date();
  const daysUntilSunday = 7 - now.getDay(); // always 1-7 days ahead
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
  const { isPhoneVerified, isPhoneVerifiedLoaded, refetch: refetchRiskLevel } = useMyRiskLevel();
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [claimedCode, setClaimedCode] = useState('');
  const [claimError, setClaimError] = useState('');

  const handleActivateClick = async () => {
    setClaimError('');
    try {
      const result = await activateAsync(undefined);
      setClaimedCode(result?.code ?? '');
      setSuccessDialogOpen(true);
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setClaimError(message ?? 'Something went wrong. Please try again.');
    }
  };

  if (isLoading || !isPhoneVerifiedLoaded) {
    return (
      // Header renders during loading too, so it never pops in after the spinner.
      <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: 'var(--dvh100, 100dvh)' }, display: 'flex', flexDirection: 'column' }}>
        <AppPageHero title='Free weekly entry' subtitle='One free entry, every week. On us.' />
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', pb: 12 }}>
          <CircularProgress color='primary' />
        </Box>
      </Box>
    );
  }

  if (!isPhoneVerified) {
    const pendingCode = localStorage.getItem('pendingTicketCode');
    return <PhoneVerificationGate onVerified={() => refetchRiskLevel()} pendingCode={pendingCode} />;
  }

  const canActivate = !!status?.canActivate;
  const noCampaign = !canActivate && status?.reason === 'no_campaign';
  const usedCount = canActivate || noCampaign ? 0 : 1;
  const resetDate = formatNextDate(status?.nextAvailableDate);

  const claimLabel = isActivating ? 'Claiming...' : canActivate ? 'Claim my free entry' : noCampaign ? 'No active campaign' : 'Claimed this week';

  // The page's one attractor: while claimable the CTA breathes (same pull as the
  // Submit-a-receipt button on the location profile card), plus press gestures.
  const claimButton = (
    <motion.div {...(canActivate && !isActivating ? { ...breathe, ...pressable } : {})}>
      <Button
        fullWidth
        variant='contained'
        size='large'
        disabled={!canActivate || isActivating}
        onClick={handleActivateClick}
        startIcon={canActivate && !isActivating ? <StarRounded /> : undefined}
        sx={{
          py: 1.6, borderRadius: 2.5, fontWeight: 800, fontSize: '1rem', textTransform: 'none',
          boxShadow: canActivate ? SHADOW_PRIMARY_MEDIUM : 'none',
        }}
      >
        {claimLabel}
      </Button>
    </motion.div>
  );

  const footerNote = (
    <Typography sx={{ display: 'block', textAlign: 'center', mt: 1.25, color: TEXT_SECONDARY, fontSize: '0.72rem' }}>
      No purchase necessary. One per member per week.
    </Typography>
  );

  const claimError_ = claimError && (
    <Typography variant='body2' color='error' sx={{ mt: 1.25, textAlign: 'center', fontWeight: 600 }}>
      {claimError}
    </Typography>
  );


  const successDialog = (
    <FreeEntrySuccessDialog
      open={successDialogOpen}
      claimedCode={claimedCode}
      nextDateLabel={resetDate}
      onViewEntries={() => { setSuccessDialogOpen(false); navigate('/tickets'); }}
      onSubmitReceipt={() => { setSuccessDialogOpen(false); navigate('/scan'); }}
      onClose={() => setSuccessDialogOpen(false)}
    />
  );

  // ── Desktop: two columns (gradient story card + white claim card) ──────────
  if (isDesktop) {
    const availabilityChip = (
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 0.6, borderRadius: 5, bgcolor: canActivate ? `${SUCCESS_GREEN}1f` : 'action.hover' }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: canActivate ? SUCCESS_GREEN : TEXT_SECONDARY }} />
        <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', color: canActivate ? SUCCESS_GREEN : TEXT_SECONDARY }}>
          {canActivate ? 'Available now' : noCampaign ? 'No campaign' : 'Claimed this week'}
        </Typography>
      </Box>
    );

    return (
      <Box sx={{ minHeight: 'var(--dvh100, 100dvh)', pb: 5 }}>
        <AppPageHero title='Free weekly entry' subtitle='One free entry, every week. On us.' actions={availabilityChip} />

        <Container maxWidth='lg' sx={{ mt: 1 }}>
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'stretch' }}>
            {/* LEFT: gradient story card */}
            <Box sx={{ flex: 1.4, borderRadius: 4, p: 4, background: GRADIENT_FREE, color: '#fff', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: ALPHA_WHITE_15, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, zIndex: 1 }}>
                <CardGiftcardOutlined sx={{ fontSize: 30 }} />
              </Box>
              <Box sx={{ alignSelf: 'flex-start', px: 1.5, py: 0.5, borderRadius: 5, bgcolor: ALPHA_WHITE_15, mb: 2, zIndex: 1 }}>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase' }}>Free . no purchase</Typography>
              </Box>
              <Typography sx={{ fontWeight: 900, fontSize: '2.4rem', lineHeight: 1.1, mb: 2, maxWidth: 420, zIndex: 1 }}>
                {canActivate ? 'Your free entry is ready to claim' : noCampaign ? 'No active campaign right now' : "This week's free entry is claimed"}
              </Typography>
              <Typography sx={{ color: ALPHA_WHITE_80, fontSize: '0.95rem', lineHeight: 1.6, maxWidth: 440, zIndex: 1 }}>
                {FREE_ENTRY_INFO}
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 28 }} />
            </Box>

            {/* RIGHT: claim card */}
            <Box sx={{ flex: 1, borderRadius: 4, p: 3.5, bgcolor: BG_SURFACE, border: `1px solid ${BORDER_LIGHT}`, display: 'flex', flexDirection: 'column' }}>
              <Typography sx={{ fontWeight: 800, color: TEXT_HEADING, fontSize: '1.05rem', mb: 2 }}>This week's free entry</Typography>

              {/* Availability by date (no countdown clock) */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: `${PRIMARY_MAIN}0f`, color: PRIMARY_MAIN, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <EventAvailableRounded />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: TEXT_SECONDARY }}>
                    {canActivate ? 'Availability' : 'Next free entry'}
                  </Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: canActivate ? SUCCESS_GREEN : TEXT_HEADING }}>
                    {canActivate ? 'Available now' : noCampaign ? 'Check back soon' : resetDate}
                  </Typography>
                  {canActivate && (
                    <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.78rem' }}>Resets {resetDate}</Typography>
                  )}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.75, borderTop: `1px solid ${BORDER_LIGHT}`, borderBottom: `1px solid ${BORDER_LIGHT}` }}>
                <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.85rem', fontWeight: 600 }}>Free entries used this week</Typography>
                <Typography sx={{ fontWeight: 800, color: TEXT_HEADING }}>{usedCount} / 1</Typography>
              </Box>


              <Box sx={{ flexGrow: 1, minHeight: 8 }} />
              {claimButton}
              {claimError_}
              {footerNote}
            </Box>
          </Box>
        </Container>

        {successDialog}
      </Box>
    );
  }

  // ── Mobile: gradient hero + stacked info cards ─────────────────────────────
  const cardSx = { bgcolor: BG_SURFACE, border: `1px solid ${BORDER_LIGHT}`, borderRadius: 3, p: 2 } as const;

  return (
    <Box sx={{ minHeight: MOBILE_CONTENT_HEIGHT, pb: 12 }}>
      <AppPageHero title='Free weekly entry' subtitle='One free entry, every week. On us.' />

      <Container maxWidth='sm' sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* Intro card: info text */}
        <Box sx={{ ...cardSx, py: 2.5, textAlign: 'center' }}>
          <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.85rem', lineHeight: 1.6 }}>
            {FREE_ENTRY_INFO}
          </Typography>
        </Box>

        {/* Availability by date */}
        <Box sx={{ ...cardSx, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: `${PRIMARY_MAIN}0f`, color: PRIMARY_MAIN, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <EventAvailableRounded />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.66rem', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: TEXT_SECONDARY }}>
              {canActivate ? 'Availability' : 'Next free entry'}
            </Typography>
            <Typography sx={{ fontWeight: 800, color: canActivate ? SUCCESS_GREEN : TEXT_HEADING }}>
              {canActivate ? 'Available now' : noCampaign ? 'Check back soon' : resetDate}
            </Typography>
          </Box>
        </Box>

        {/* Used this week */}
        <Box sx={{ ...cardSx, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.85rem', fontWeight: 600 }}>Free entries this week</Typography>
          <Typography sx={{ fontWeight: 800, color: TEXT_HEADING }}>{usedCount} / 1</Typography>
        </Box>


        <Box>
          {claimButton}
          {claimError_}
          {footerNote}
        </Box>
      </Container>

      {successDialog}
    </Box>
  );
};

export default FreeTicketPage;
