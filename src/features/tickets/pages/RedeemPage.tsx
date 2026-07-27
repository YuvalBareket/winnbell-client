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
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import type { NearbyLocation } from '../../nearBy/types/nearBy.types';
import { selectIsAuthenticated } from '../../../store/selectors/authSelectors';
import { useAppSelector } from '../../../store/hook';
import { useActivatePromotional } from '../hooks/useActivatePromotional';
import { useMyRiskLevel } from '../hooks/useMyRiskLevel';
import { usePhoneVerifySheet } from '../hooks/usePhoneVerifySheet';
import AppPageHero from '../../../shared/components/AppPageHero';
import PhoneVerifySheet from '../components/PhoneVerifySheet';
import ReferralBonusSuccessDialog from '../components/ReferralBonusSuccessDialog';
import { PRIMARY_MAIN } from '../../../shared/colors';
import { apiErrorMessage } from '../../../shared/utils/apiError';
import RedeemFeedback from '../components/RedeemFeedback';
import ReceiptEntryForm, { StepIndicator } from '../components/ReceiptEntryForm';

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

  // Invited signup (referral link / location flyer) with an unclaimed welcome entry: the bonus
  // is only granted at phone-verify time, and since the old full-page verify gate is gone,
  // nothing else would prompt a fresh invitee. Open the sheet proactively so they claim it.
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

  // ─── Loading gate ───────────────────────────────────────────────────────────
  // The header renders in every gate state too, so it never pops in after the fact.
  if (!isPhoneVerifiedLoaded) {
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
        subtitle='Two quick steps to earn your entries'
        actions={isDesktop ? <StepIndicator step={receiptStep2 ? 2 : 1} /> : undefined}
      />

      <Container maxWidth='lg' sx={{ mt: { xs: 2, md: 2.5 } }}>
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
          <Box component='a' href='/rules' target='_blank' rel='noopener' sx={{ color: PRIMARY_MAIN, fontWeight: 700 }}>
            Official Rules
          </Box>.
        </Typography>
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
    </Box>
  );
};

export default RedeemPage;
