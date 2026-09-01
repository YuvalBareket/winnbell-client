import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { HourglassTopRounded } from '@mui/icons-material';
import type { NearbyLocation } from '../../nearBy/types/nearBy.types';
import { getCurrentDraw } from '../../draw/api/draw.api';
import { queryKeys } from '../../../shared/constants/queryKeys';
import CampaignCountdown from '../../../shared/components/CampaignCountdown';
import { selectIsAuthenticated } from '../../../store/selectors/authSelectors';
import { useAppSelector } from '../../../store/hook';
import { useActivatePromotional } from '../hooks/useActivatePromotional';
import { trackFunnel } from '../../../shared/analytics/funnel';
import { useMyRiskLevel } from '../hooks/useMyRiskLevel';
import { usePhoneVerifySheet } from '../hooks/usePhoneVerifySheet';
import AppPageHero from '../../../shared/components/AppPageHero';
import PhoneVerifySheet from '../components/PhoneVerifySheet';
import ReferralBonusSuccessDialog from '../components/ReferralBonusSuccessDialog';
import { PRIMARY_MAIN, ACCENT_GOLD_LIGHT, ACCENT_GOLD_TEXT_AA, BORDER_LIGHT, TEXT_HEADING, TEXT_SECONDARY } from '../../../shared/colors';
import { apiErrorMessage } from '../../../shared/utils/apiError';
import { formatCurrency } from '../../../shared/utils/date';
import RedeemFeedback from '../components/RedeemFeedback';
import ReceiptEntryForm, { StepIndicator } from '../components/ReceiptEntryForm';
import SpotlightTour, { type TourStep } from '../../onboarding/components/SpotlightTour';
import { isScanTourPending, clearScanTourPending } from '../../onboarding/tourState';

// The /scan route is guarded by `isUser` in AppRoutes, so this page only ever renders for
// regular users. It is the consumer "Submit a receipt" screen (receipt is the only entry
// mode; promo QR codes still auto-activate here after login).
const RedeemPage = () => {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const preselectedBusinessId = (routeLocation.state as { preselectedBusinessId?: number } | null)?.preselectedBusinessId;
  const preselectedLocation = (routeLocation.state as { preselectedLocation?: NearbyLocation } | null)?.preselectedLocation;
  const [searchParams] = useSearchParams();
  // QR flyer location: from the URL when scanned while signed in, else from the
  // pendingLocationId saved before login (same consume-on-mount pattern as pendingTicketCode).
  const [storedLocationId] = useState(() => {
    const stored = localStorage.getItem('pendingLocationId');
    return stored ? Number(stored) : undefined;
  });
  useEffect(() => {
    localStorage.removeItem('pendingLocationId');
    trackFunnel('submit_page_viewed');
  }, []);
  const qrLocationId = searchParams.get('l') ? Number(searchParams.get('l')) : storedLocationId;
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // State
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [isAutoActivating, setIsAutoActivating] = useState(() => !!localStorage.getItem('pendingTicketCode'));
  const [receiptStep2, setReceiptStep2] = useState(false);
  const [showReferralBonusDialog, setShowReferralBonusDialog] = useState(false);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const primaryColor = PRIMARY_MAIN;

  // Phone verification status - fetched fresh from server on every page visit
  const { isPhoneVerified, isPhoneVerifiedLoaded, welcomeBonusPending, isError: riskLevelError, refetch: refetchRiskLevel } = useMyRiskLevel();

  // Between campaigns the form is replaced by a countdown to the next opening (same
  // ticking countdown as /join and /start). Fail OPEN on a query error: the server
  // rejects entries without an open campaign anyway, so an API hiccup here must not
  // lock a healthy page behind a false "closed" state.
  const { data: currentDraw, isLoading: drawLoading, isSuccess: drawLoaded } = useQuery({
    queryKey: queryKeys.draws.current,
    queryFn: getCurrentDraw,
    staleTime: 2 * 60_000,
    retry: 1,
  });
  const noOpenDraw = drawLoaded && currentDraw?.status !== 'Open';
  const opensAt = noOpenDraw && currentDraw?.status === 'Upcoming' ? currentDraw.start_date : undefined;

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

  // Mutations
  const promoMutation = useActivatePromotional();

  // Auto-activate a pending promo code from the QR flow (saved by PublicActivatePage
  // before login). Promo QRs are the only scannable entry codes - the business-generated
  // code entry mode was removed; any stale non-promo pending code is simply discarded.
  const didAutoActivate = useRef(false);
  useEffect(() => {
    if (!isAuthenticated || !isPhoneVerifiedLoaded || didAutoActivate.current) return;

    const pending = localStorage.getItem('pendingTicketCode');
    if (!pending) { setIsAutoActivating(false); return; }

    didAutoActivate.current = true;

    if (!pending.startsWith('PROMO')) {
      localStorage.removeItem('pendingTicketCode');
      setIsAutoActivating(false);
      return;
    }

    // The saved code is only CONSUMED when activation actually runs - dismissing the verify
    // sheet must not lose a scanned code (a reload re-prompts with it instead).
    const activatePending = () => {
      localStorage.removeItem('pendingTicketCode');
      promoMutation.mutate(pending, {
        onSuccess: () => { setIsAutoActivating(false); setSuccessDialogOpen(true); },
        onError: (err) => { setIsAutoActivating(false); setErrorMessage(apiErrorMessage(err, 'Promotional entry failed.')); setErrorOpen(true); },
      });
    };

    if (!isPhoneVerified) {
      // Unverified: the page renders normally behind the sheet; activation resumes on verify.
      setIsAutoActivating(false);
      requirePhone('promo', activatePending, pending);
      return;
    }

    activatePending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isPhoneVerified, isPhoneVerifiedLoaded]);

  // Referred signup with an unclaimed welcome entry: the bonus is only granted at phone-verify
  // time, and since the old full-page verify gate is gone, nothing else would prompt a fresh
  // invitee. Open the sheet proactively so they claim it. (Location-flyer/QR signups no longer
  // earn a welcome entry, so welcomeBonusPending is false for them and this never fires.)
  // A pending scanned code takes priority - the effect above already prompts, and verifying
  // through ANY context grants the welcome bonus in the same transaction.
  const didPromptWelcome = useRef(false);
  useEffect(() => {
    if (!isAuthenticated || !isPhoneVerifiedLoaded || didPromptWelcome.current) return;
    if (isPhoneVerified || !welcomeBonusPending) return;
    if (localStorage.getItem('pendingTicketCode')) return;

    didPromptWelcome.current = true;
    requirePhone('referral');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isPhoneVerified, isPhoneVerifiedLoaded, welcomeBonusPending]);

  // One-time on-screen tour for fresh signups (flag armed at profile-setup completion).
  // Coach marks over the LIVE screen: receipt area, weekly entry card, map tab. Waits for a
  // quiet screen: no loading gate, no phone sheet, no promo auto-activation, no dialogs.
  // The short delay lets the form's entrance stagger settle so the measured targets sit still.
  const [tourOn, setTourOn] = useState(false);
  const didTour = useRef(false);
  const quietForTour =
    isPhoneVerifiedLoaded && !drawLoading && !noOpenDraw && !isAutoActivating &&
    !sheetProps.open && !successDialogOpen && !showReferralBonusDialog;
  useEffect(() => {
    if (didTour.current || !quietForTour || !isScanTourPending()) return;
    didTour.current = true;
    const timer = window.setTimeout(() => {
      setTourOn(true);
      trackFunnel('tour_viewed');
    }, 700);
    return () => window.clearTimeout(timer);
  }, [quietForTour]);

  const endTour = (completed: boolean) => {
    clearScanTourPending();
    setTourOn(false);
    trackFunnel(completed ? 'tour_completed' : 'tour_skipped', { flushNow: true });
  };

  // Live prize in the opening line sells the loop harder than any generic wording; while
  // the prize is still unrevealed we fall back to "current campaign".
  const tourPrize = currentDraw?.prize_amount != null ? formatCurrency(currentDraw.prize_amount) : null;
  const tourCampaign = tourPrize ? `the ${tourPrize} campaign` : 'the current campaign';
  // With a QR-preselected business, step 1 highlights the photo upload ("snap it here");
  // organic signups see the business picker first, so the copy walks them through that.
  const hasPreselectedSpot = !!(preselectedBusinessId || preselectedLocation || qrLocationId);
  const tourSteps: TourStep[] = [
    {
      selector: '[data-tour="receipt-form"]',
      title: 'Turn receipts into entries',
      body: hasPreselectedSpot
        ? `Shopped at a participating spot? Snap your receipt here and enter ${tourCampaign}.`
        : `Shopped at a participating spot? Pick it here, snap your receipt, and enter ${tourCampaign}.`,
    },
    {
      selector: '[data-tour="weekly-entry"]',
      title: 'A weekly entry, on us',
      body: 'No receipt? No problem. This card gives you one entry every week. No purchase needed, and it refreshes every Sunday.',
    },
    {
      selector: '[data-tour="nav-map"]',
      title: 'Your next entry is nearby',
      body: 'The map shows every participating spot around you, so you always know where to play next.',
    },
  ];

  // ─── Loading gate ───────────────────────────────────────────────────────────
  // The header renders in every gate state too, so it never pops in after the fact.
  if (!isPhoneVerifiedLoaded || drawLoading) {
    return (
      <Box sx={{ minHeight: 'var(--dvh100, 100dvh)', display: 'flex', flexDirection: 'column' }}>
        <AppPageHero title='Entry submission' subtitle='Two quick steps to earn your entries' />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, pb: 12 }}>
          {riskLevelError ? (
            <>
              <Box component='p' sx={{ color: 'text.secondary' }}>Something went wrong. Please try again.</Box>
              <Button variant='contained' onClick={() => refetchRiskLevel()} sx={{ fontWeight: 700, textTransform: 'none' }}>
                Retry
              </Button>
            </>
          ) : (
            <CircularProgress size={40} sx={{ color: PRIMARY_MAIN }} />
          )}
        </Box>
      </Box>
    );
  }

  if (isAutoActivating) {
    return (
      <Box sx={{ minHeight: 'var(--dvh100, 100dvh)', display: 'flex', flexDirection: 'column' }}>
        <AppPageHero title='Activating your entry' subtitle='One moment, your promotional entry is going in' />
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', pb: 12 }}>
          <CircularProgress size={40} sx={{ color: PRIMARY_MAIN }} />
        </Box>
      </Box>
    );
  }

  return (
    // overflowX clip: entrance springs overshoot; the page must never grow wider than the
    // viewport or mobile browsers rescale it (zoom flash). clip, not hidden - no scroll box.
    <Box sx={{ minHeight: 'var(--dvh100, 100dvh)', pb: { xs: 12, md: 6 }, overflowX: 'clip' }}>
      <AppPageHero
        title='Entry submission'
        subtitle={noOpenDraw ? 'Opens again with the next campaign' : 'Two quick steps to earn your entries'}
        actions={isDesktop && !noOpenDraw ? <StepIndicator step={receiptStep2 ? 2 : 1} /> : undefined}
      />

      <Container maxWidth='lg' sx={{ mt: { xs: 2, md: 2.5 } }}>
        {noOpenDraw ? (
          // Between-campaigns state: the same ticking countdown as /join and /start,
          // framed as anticipation rather than a dead end.
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            sx={{
              maxWidth: 560,
              mx: 'auto',
              mt: { xs: 1, md: 3 },
              px: { xs: 2.5, md: 4 },
              py: { xs: 3.5, md: 4.5 },
              bgcolor: 'background.paper',
              border: `1px solid ${BORDER_LIGHT}`,
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: ACCENT_GOLD_LIGHT,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <HourglassTopRounded sx={{ fontSize: 28, color: ACCENT_GOLD_TEXT_AA }} />
            </Box>
            <Typography component='h2' sx={{ fontSize: { xs: '19px', md: '22px' }, fontWeight: 800, letterSpacing: '-0.01em', color: TEXT_HEADING }}>
              The next campaign is on its way
            </Typography>
            <Typography sx={{ mt: 1, maxWidth: 420, fontSize: '14.5px', fontWeight: 500, lineHeight: 1.55, color: TEXT_SECONDARY }}>
              {opensAt
                ? 'Entry submission is closed between campaigns. Come back when the new campaign opens to submit your receipts.'
                : 'Entry submission is closed between campaigns. Check back soon for the next one.'}
            </Typography>
            {opensAt && <CampaignCountdown opensAt={opensAt} onGradient={false} />}
          </Box>
        ) : (
          <>
            <ReceiptEntryForm
              primaryColor={primaryColor}
              preselectedBusinessId={preselectedBusinessId}
              preselectedLocation={preselectedLocation}
              preselectedLocationId={qrLocationId}
              onLocationSelect={setReceiptStep2}
              guardEntryAction={(proceed) => requirePhone('receipt', proceed)}
            />

            {/* Sweepstakes disclosure at the point of entry, linking the governing Official Rules. */}
            <Typography
              variant='caption'
              sx={{ display: 'block', textAlign: 'center', color: 'text.secondary', lineHeight: 1.5, mt: 3 }}
            >
              No purchase necessary. A purchase will not increase chances of winning. Alternative method of entry available on the platform. 18+. Void where prohibited. See the{' '}
              <Box component={Link} to='/rules' sx={{ color: PRIMARY_MAIN, fontWeight: 700 }}>
                Official Rules
              </Box>.
            </Typography>
          </>
        )}
      </Container>

      <RedeemFeedback
        errorOpen={errorOpen}
        setErrorOpen={setErrorOpen}
        errorMessage={errorMessage}
        successDialogOpen={successDialogOpen}
        setSuccessDialogOpen={setSuccessDialogOpen}
        navigate={navigate}
        primaryColor={primaryColor}
      />

      <PhoneVerifySheet {...sheetProps} />

      <ReferralBonusSuccessDialog
        open={showReferralBonusDialog}
        onViewEntries={() => {
          setShowReferralBonusDialog(false);
          referralDialogCallbackRef.current?.();
          referralDialogCallbackRef.current = null;
        }}
      />

      <SpotlightTour
        active={tourOn}
        steps={tourSteps}
        onFinish={endTour}
        onStepShown={(i) => { if (i === 1) trackFunnel('spotlight_weekly_shown'); }}
      />
    </Box>
  );
};

export default RedeemPage;
