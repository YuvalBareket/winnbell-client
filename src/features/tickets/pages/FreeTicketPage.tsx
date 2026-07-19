import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AttractButton from '../../../shared/components/AttractButton';
import CardGiftcardOutlined from '@mui/icons-material/CardGiftcardOutlined';
import StarRounded from '@mui/icons-material/StarRounded';
import EventAvailableRounded from '@mui/icons-material/EventAvailableRounded';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AppPageHero from '../../../shared/components/AppPageHero';
import { useFreeTicket } from '../hooks/useFreeTicket';
import { useMyRiskLevel } from '../hooks/useMyRiskLevel';
import { usePhoneVerifySheet } from '../hooks/usePhoneVerifySheet';
import PhoneVerifySheet from '../components/PhoneVerifySheet';
import ReferralBonusSuccessDialog from '../components/ReferralBonusSuccessDialog';
import {
  PRIMARY_MAIN, PRIMARY_DEEP, SUCCESS_GREEN, BG_SURFACE,
  ALPHA_WHITE_15, ALPHA_WHITE_80,
  TEXT_HEADING, TEXT_SECONDARY, BORDER_LIGHT, MOBILE_CONTENT_HEIGHT, SHADOW_PRIMARY_MEDIUM,
} from '../../../shared/colors';
import { apiErrorMessage } from '../../../shared/utils/apiError';
import FreeEntrySuccessDialog from '../components/FreeEntrySuccessDialog';
import { pressable } from '../../../shared/motion';

const GRADIENT_FREE = `linear-gradient(155deg, ${PRIMARY_MAIN} 0%, ${PRIMARY_DEEP} 100%)`;

const FREE_ENTRY_INFO =
  'Winnbell gives every member one entry each week. It resets every Sunday, so claim yours before the week is up.';

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
  const [showReferralBonusDialog, setShowReferralBonusDialog] = useState(false);

  // Phone verification sheet for soft prompt. The referral-congrats dialog resumes the
  // pending entry action when dismissed; the callback lives in a ref, not global state.
  const referralDialogCallbackRef = useRef<(() => void) | null>(null);
  const { sheetProps, requirePhone } = usePhoneVerifySheet({
    isPhoneVerified,
    onPhoneVerifiedChange: () => refetchRiskLevel(),
    showReferralBonusDialog: (onComplete) => {
      referralDialogCallbackRef.current = onComplete;
      setShowReferralBonusDialog(true);
    },
  });

  const handleActivateClick = async () => {
    setClaimError('');
    requirePhone('free', async () => {
      try {
        const result = await activateAsync(undefined);
        setClaimedCode(result?.code ?? '');
        setSuccessDialogOpen(true);
      } catch (err) {
        setClaimError(apiErrorMessage(err, 'Something went wrong. Please try again.'));
      }
    });
  };

  if (isLoading || !isPhoneVerifiedLoaded) {
    return (
      // Header renders during loading too, so it never pops in after the spinner.
      <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: 'var(--dvh100, 100dvh)' }, display: 'flex', flexDirection: 'column' }}>
        <AppPageHero title='Weekly entry' subtitle='One entry, every week. On us.' />
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', pb: 12 }}>
          <CircularProgress color='primary' />
        </Box>
      </Box>
    );
  }

  const canActivate = !!status?.canActivate;
  const noCampaign = !canActivate && status?.reason === 'no_campaign';
  const usedCount = canActivate || noCampaign ? 0 : 1;
  const resetDate = formatNextDate(status?.nextAvailableDate);

  const claimLabel = isActivating ? 'Claiming...' : canActivate ? 'Claim my weekly entry' : noCampaign ? 'No active campaign' : 'Claimed this week';

  // Press gestures only - the looping attraction (scale breathe + light sweep) now lives
  // inside AttractButton itself, so a second framer breathe here would fight it.
  const claimButton = (
    <motion.div {...(canActivate && !isActivating ? { ...pressable } : {})}>
      <AttractButton
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
      </AttractButton>
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

  // Rendered by BOTH layout branches - the desktop return is a separate tree, and a sheet
  // rendered only in the mobile branch simply never appears on desktop.
  const verifySheet = (
    <>
      <PhoneVerifySheet {...sheetProps} />
      <ReferralBonusSuccessDialog
        open={showReferralBonusDialog}
        onViewEntries={() => {
          setShowReferralBonusDialog(false);
          referralDialogCallbackRef.current?.();
          referralDialogCallbackRef.current = null;
        }}
      />
    </>
  );

  // ── Desktop: two columns (gradient story card + white claim card) ──────────
  if (isDesktop) {
    return (
      <Box sx={{ minHeight: 'var(--dvh100, 100dvh)', pb: 5 }}>
        <AppPageHero title='Weekly entry' subtitle='One entry, every week. On us.' />

        <Container maxWidth='lg' sx={{ mt: 1 }}>
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'stretch' }}>
            {/* LEFT: gradient story card */}
            <Box sx={{ flex: 1.4, borderRadius: 4, p: 4, background: GRADIENT_FREE, color: '#fff', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: ALPHA_WHITE_15, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, zIndex: 1 }}>
                <CardGiftcardOutlined sx={{ fontSize: 30 }} />
              </Box>
              <Box sx={{ alignSelf: 'flex-start', px: 1.5, py: 0.5, borderRadius: 5, bgcolor: ALPHA_WHITE_15, mb: 2, zIndex: 1 }}>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase' }}>No purchase needed</Typography>
              </Box>
              <Typography sx={{ fontWeight: 900, fontSize: '2.4rem', lineHeight: 1.1, mb: 2, maxWidth: 420, zIndex: 1 }}>
                {canActivate ? 'Your weekly entry is ready to claim' : noCampaign ? 'No active campaign right now' : "This week's entry is claimed"}
              </Typography>
              <Typography sx={{ color: ALPHA_WHITE_80, fontSize: '0.95rem', lineHeight: 1.6, maxWidth: 440, zIndex: 1 }}>
                {FREE_ENTRY_INFO}
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 28 }} />
            </Box>

            {/* RIGHT: claim card */}
            <Box sx={{ flex: 1, borderRadius: 4, p: 3.5, bgcolor: BG_SURFACE, border: `1px solid ${BORDER_LIGHT}`, display: 'flex', flexDirection: 'column' }}>
              <Typography sx={{ fontWeight: 800, color: TEXT_HEADING, fontSize: '1.05rem', mb: 2 }}>This week's entry</Typography>

              {/* Availability by date (no countdown clock) */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: `${PRIMARY_MAIN}0f`, color: PRIMARY_MAIN, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <EventAvailableRounded />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: TEXT_SECONDARY }}>
                    {canActivate ? 'Availability' : 'Next weekly entry'}
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
                <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.85rem', fontWeight: 600 }}>Weekly entries used</Typography>
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
        {verifySheet}
      </Box>
    );
  }

  // ── Mobile: gradient hero + stacked info cards ─────────────────────────────
  const cardSx = { bgcolor: BG_SURFACE, border: `1px solid ${BORDER_LIGHT}`, borderRadius: 3, p: 2 } as const;

  return (
    <Box sx={{ minHeight: MOBILE_CONTENT_HEIGHT, pb: 12 }}>
      <AppPageHero title='Weekly entry' subtitle='One entry, every week. On us.' />

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
              {canActivate ? 'Availability' : 'Next weekly entry'}
            </Typography>
            <Typography sx={{ fontWeight: 800, color: canActivate ? SUCCESS_GREEN : TEXT_HEADING }}>
              {canActivate ? 'Available now' : noCampaign ? 'Check back soon' : resetDate}
            </Typography>
          </Box>
        </Box>

        {/* Used this week */}
        <Box sx={{ ...cardSx, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.85rem', fontWeight: 600 }}>Weekly entries used</Typography>
          <Typography sx={{ fontWeight: 800, color: TEXT_HEADING }}>{usedCount} / 1</Typography>
        </Box>


        <Box>
          {claimButton}
          {claimError_}
          {footerNote}
        </Box>
      </Container>

      {successDialog}

      {verifySheet}
    </Box>
  );
};

export default FreeTicketPage;
