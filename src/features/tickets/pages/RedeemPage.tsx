import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import type { NearbyLocation } from '../../nearBy/types/nearBy.types';
import { selectIsAuthenticated } from '../../../store/selectors/authSelectors';
import { useAppSelector } from '../../../store/hook';
import { useRedeemTicket } from '../hooks/useTickets';
import { useActivatePromotional } from '../hooks/useActivatePromotional';
import { useEntryMode } from '../hooks/useEntryMode';
import { useMyRiskLevel } from '../hooks/useMyRiskLevel';
import PhoneVerificationGate from '../components/PhoneVerificationGate';
import AppPageHero from '../../../shared/components/AppPageHero';
import { PRIMARY_MAIN } from '../../../shared/colors';
import { riseIn } from '../../../shared/motion';
import UserActions from '../components/UserActions';
import RedeemFeedback from '../components/RedeemFeedback';
import ReceiptEntryForm, { StepIndicator } from '../components/ReceiptEntryForm';

// The /scan route is guarded by `isUser` in AppRoutes, so this page only ever renders for
// regular users. It is the consumer "Submit a receipt" / "Activate a code" screen.
const RedeemPage = () => {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const preselectedBusinessId = (routeLocation.state as { preselectedBusinessId?: number } | null)?.preselectedBusinessId;
  const preselectedLocation = (routeLocation.state as { preselectedLocation?: NearbyLocation } | null)?.preselectedLocation;
  const [searchParams] = useSearchParams();
  const qrLocationId = searchParams.get('l') ? Number(searchParams.get('l')) : undefined;
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // State
  const [code, setCode] = useState('');
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [, setActivatedCode] = useState<string | null>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [isAutoActivating, setIsAutoActivating] = useState(() => !!localStorage.getItem('pendingTicketCode'));
  const [receiptStep2, setReceiptStep2] = useState(false);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const primaryColor = PRIMARY_MAIN;

  // Phone verification status - fetched fresh from server on every page visit
  const { isPhoneVerified, isPhoneVerifiedLoaded, isError: riskLevelError, refetch: refetchRiskLevel } = useMyRiskLevel();

  // Entry mode (receipt submission vs code activation) - platform setting
  const { data: entryModeData } = useEntryMode();
  const entryMode = entryModeData?.entry_mode ?? 'receipt';

  // Mutations
  const redeemMutation = useRedeemTicket();
  const promoMutation = useActivatePromotional();

  // Auto-activate pending code from QR scan flow (saved by PublicActivatePage before login)
  const didAutoActivate = useRef(false);
  useEffect(() => {
    if (!isAuthenticated || !isPhoneVerifiedLoaded || didAutoActivate.current) return;
    if (!isPhoneVerified) return; // must pass the phone gate first

    const pending = localStorage.getItem('pendingTicketCode');
    if (!pending) { setIsAutoActivating(false); return; }

    didAutoActivate.current = true;
    localStorage.removeItem('pendingTicketCode');

    if (pending.startsWith('PROMO')) {
      promoMutation.mutate(pending, {
        onSuccess: () => { setIsAutoActivating(false); setActivatedCode(pending); setSuccessDialogOpen(true); },
        onError: (err) => { setIsAutoActivating(false); setErrorMessage(err?.response?.data?.message || 'Promotional entry failed.'); setErrorOpen(true); },
      });
    } else {
      redeemMutation.mutate(pending, {
        onSuccess: () => { setIsAutoActivating(false); setActivatedCode(pending); setSuccessDialogOpen(true); },
        onError: (err) => { setIsAutoActivating(false); setErrorMessage(err?.response?.data?.message || 'Activation failed.'); setErrorOpen(true); },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isPhoneVerified, isPhoneVerifiedLoaded]);

  const handleScanSuccess = (scannedCode: string) => {
    setScannerOpen(false);
    redeemMutation.mutate(scannedCode, {
      onSuccess: () => { setActivatedCode(scannedCode); setSuccessDialogOpen(true); },
      onError: (err) => { setErrorMessage(err?.response?.data?.message || 'Invalid or already used entry code.'); setErrorOpen(true); },
    });
  };

  const handleActivate = () => {
    if (!code || code.length < 5) return;
    const submittedCode = code;
    redeemMutation.mutate(submittedCode, {
      onSuccess: () => { setActivatedCode(submittedCode); setSuccessDialogOpen(true); setCode(''); },
      onError: (err) => { setErrorMessage(err?.response?.data?.message || 'Invalid or already used entry code.'); setErrorOpen(true); },
    });
  };

  // ─── Gates ──────────────────────────────────────────────────────────────────
  // The header renders in every gate state too, so it never pops in after the fact.
  if (!isPhoneVerifiedLoaded) {
    return (
      <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        <AppPageHero title='Submit a receipt' subtitle='Pick the store, then submit your receipt' />
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

  if (!isPhoneVerified) {
    const pendingCode = localStorage.getItem('pendingTicketCode');
    return <PhoneVerificationGate onVerified={() => refetchRiskLevel()} pendingCode={pendingCode} />;
  }

  if (isAutoActivating) {
    return (
      <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        <AppPageHero title='Activate an entry' subtitle='Enter your code from the receipt to join the draw' />
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', pb: 12 }}>
          <CircularProgress size={40} sx={{ color: PRIMARY_MAIN }} />
        </Box>
      </Box>
    );
  }

  const isReceiptMode = entryMode === 'receipt';

  return (
    // overflowX clip: entrance springs overshoot; the page must never grow wider than the
    // viewport or mobile browsers rescale it (zoom flash). clip, not hidden - no scroll box.
    <Box sx={{ minHeight: '100dvh', pb: { xs: 12, md: 6 }, overflowX: 'clip' }}>
      <AppPageHero
        title={isReceiptMode ? 'Submit a receipt' : 'Activate an entry'}
        subtitle={isReceiptMode ? 'Pick the store, then submit your receipt' : 'Enter your code from the receipt to join the draw'}
        actions={isReceiptMode && isDesktop ? <StepIndicator step={receiptStep2 ? 2 : 1} /> : undefined}
      />

      <Container maxWidth='lg' sx={{ mt: { xs: 2, md: 2.5 } }}>
        {isReceiptMode ? (
          <ReceiptEntryForm
            primaryColor={primaryColor}
            preselectedBusinessId={preselectedBusinessId}
            preselectedLocation={preselectedLocation}
            preselectedLocationId={qrLocationId}
            onLocationSelect={setReceiptStep2}
          />
        ) : (
          <Box component={motion.div} variants={riseIn} initial='hidden' animate='visible' sx={{ maxWidth: 480, mx: 'auto' }}>
            <UserActions
              code={code}
              setCode={setCode}
              redeemMutation={redeemMutation}
              handleActivate={handleActivate}
              setScannerOpen={setScannerOpen}
              navigate={navigate}
              primaryColor={primaryColor}
              hideScan={isDesktop}
            />
          </Box>
        )}
      </Container>

      <RedeemFeedback
        scannerOpen={scannerOpen}
        setScannerOpen={setScannerOpen}
        handleScanSuccess={handleScanSuccess}
        errorOpen={errorOpen}
        setErrorOpen={setErrorOpen}
        errorMessage={errorMessage}
        successDialogOpen={successDialogOpen}
        setSuccessDialogOpen={setSuccessDialogOpen}
        navigate={navigate}
        primaryColor={primaryColor}
      />
    </Box>
  );
};

export default RedeemPage;
