import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  AddCircleOutline,
  CardGiftcard,
  ConfirmationNumber,
} from '@mui/icons-material';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import type { NearbyLocation } from '../../nearBy/types/nearBy.types';

import {
  selectIsAuthenticated,
  selectIsBusiness,
  selectIsLocationManager,
} from '../../../store/selectors/authSelectors';
import { useAppSelector } from '../../../store/hook';
import { useRedeemTicket } from '../hooks/useTickets';
import { useGenerateTicket } from '../hooks/useGenerateTicket';
import { useActivatePromotional } from '../hooks/useActivatePromotional';
import { useBusinessData } from '../../partner/hooks/useBusinessData';
import { useSubscription } from '../../subscription/hooks/useSubscription';
import { useEntryMode } from '../hooks/useEntryMode';
import {
  PRIMARY_MAIN,
  GRADIENT_HERO,
  ALPHA_WHITE_15,
  ALPHA_WHITE_30,
  BG_PAGE,
} from '../../../shared/colors';
import BusinessVisual from '../components/BusinessVisual';
import UserVisual from '../components/UserVisual';
import BusinessActions from '../components/BusinessActions';
import UserActions from '../components/UserActions';
import RedeemFeedback from '../components/RedeemFeedback';
import DrawPreparationView from '../components/DrawPreparationView';
import ReceiptEntryForm from '../components/ReceiptEntryForm';
import type { EntryMode } from '../../partner/types/business.types';

const RedeemPage = () => {
  const isBusinessAdmin = useAppSelector(selectIsBusiness);
  const isLocationManager = useAppSelector(selectIsLocationManager);
  const isBusiness = isBusinessAdmin || isLocationManager;
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const preselectedBusinessId = (routeLocation.state as any)?.preselectedBusinessId as number | undefined;
  const preselectedLocation = (routeLocation.state as any)?.preselectedLocation as NearbyLocation | undefined;
  const [searchParams] = useSearchParams();
  const qrLocationId = searchParams.get('l') ? Number(searchParams.get('l')) : undefined;
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // State
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [activatedCode, setActivatedCode] = useState<string | null>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<number | ''>('');
  const [receiptLocationSelected, setReceiptLocationSelected] = useState(false);
  const [receiptFormBlocked, setReceiptFormBlocked] = useState(false);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const primaryColor = PRIMARY_MAIN;

  // Business owner locations
  const { data: businessData } = useBusinessData(isBusinessAdmin);
  const locations = isBusinessAdmin ? (businessData?.locations ?? []) : [];

  // Subscription and draw state
  const { data: subscription } = useSubscription(isBusinessAdmin);

  // Entry mode - lightweight single-field fetch for user side,
  // business users always stay in 'code' mode (they generate, not submit receipts).
  const { data: entryModeData } = useEntryMode();
  const entryMode: EntryMode = isBusiness
    ? 'code'
    : (entryModeData?.entry_mode ?? 'receipt');
  const drawIsUpcoming = isBusinessAdmin && subscription?.draw_status === 'Upcoming';

  const hasNoActiveDraw = isBusinessAdmin && !subscription?.draw_id;

  // Preparation completeness
  const hasDescription = !!(businessData?.description?.trim());
  const hasLocations = (businessData?.locations?.length ?? 0) > 0;

  // Mutations
  const redeemMutation = useRedeemTicket();
  const generateMutation = useGenerateTicket();
  const promoMutation = useActivatePromotional();

  // Auto-activate pending code from QR scan flow (saved by PublicActivatePage before login)
const didAutoActivate = useRef(false);

  useEffect(() => {
    // 1. Wait until we are sure the user is logged in
    if (!isAuthenticated || didAutoActivate.current) return;

    // 2. Business users should not auto-redeem codes
    if (isBusiness) {
      localStorage.removeItem('pendingTicketCode');
      return;
    }

    const pending = localStorage.getItem('pendingTicketCode');
    if (!pending) return;

    // 3. Mark as attempted immediately
    didAutoActivate.current = true;
    localStorage.removeItem('pendingTicketCode');

    // 4. Trigger mutation - promo codes use a separate endpoint
    if (pending.startsWith('PROMO')) {
      promoMutation.mutate(pending, {
        onSuccess: () => {
          setActivatedCode(pending);
          setSuccessDialogOpen(true);
        },
        onError: (err: any) => {
          setErrorMessage(err?.response?.data?.message || 'Promotional entry failed.');
          setErrorOpen(true);
        },
      });
    } else {
      redeemMutation.mutate(pending, {
        onSuccess: () => {
          setActivatedCode(pending);
          setSuccessDialogOpen(true);
        },
        onError: (err: any) => {
          setErrorMessage(err?.response?.data?.message || 'Activation failed.');
          setErrorOpen(true);
        },
      });
    }
    // We removed 'redeemMutation.isIdle' from deps to keep it simple
  }, [isAuthenticated, isBusiness]);
  const handleScanSuccess = (scannedCode: string) => {
    setScannerOpen(false);
    redeemMutation.mutate(scannedCode, {
      onSuccess: () => {
        setActivatedCode(scannedCode);
        setSuccessDialogOpen(true);
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message || 'Invalid or already used entry code.';
        setErrorMessage(msg);
        setErrorOpen(true);
      },
    });
  };

  const handleActivate = () => {
    if (!code || code.length < 5) return;
    const submittedCode = code;
    redeemMutation.mutate(submittedCode, {
      onSuccess: () => {
        setActivatedCode(submittedCode);
        setSuccessDialogOpen(true);
        setCode('');
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message || 'Invalid or already used entry code.';
        setErrorMessage(msg);
        setErrorOpen(true);
      },
    });
  };


  const handleGenerate = () => {
    if (isBusinessAdmin && !selectedLocationId) return;
    generateMutation.mutate(selectedLocationId as number, {
      onSuccess: (data) => {
        setGeneratedCode(data.code);
        setSuccessOpen(true);
      },
    });
  };


  // ─── Desktop layout ─────────────────────────────────────────────────────────

  if (isDesktop) {
    if (isBusiness && (drawIsUpcoming || hasNoActiveDraw)) {
      return <DrawPreparationView subscription={subscription} hasDescription={hasDescription} hasLocations={hasLocations} isDesktop={true} />;
    }

    return (
      <Box sx={{ bgcolor: BG_PAGE, minHeight: '100dvh', pb: 6 }}>
        {/* Hero */}
        <Box
          sx={{
            background: GRADIENT_HERO,
            pt: 3,
            pb: 9,
            px: 3,
            color: 'white',
            borderRadius: '0 0 32px 32px',
          }}
        >
          <Container maxWidth='lg'>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 52, height: 52, borderRadius: 2,
                  bgcolor: ALPHA_WHITE_15, border: `1px solid ${ALPHA_WHITE_30}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {isBusiness
                  ? <AddCircleOutline sx={{ color: 'white', fontSize: 26 }} />
                  : <ConfirmationNumber sx={{ color: 'white', fontSize: 26 }} />}
              </Box>
              <Box >
                <Typography variant='h5' fontWeight={800}>
                  {isBusiness ? 'Generate Entry' : entryMode === 'receipt' ? 'Submit Receipt' : 'Activate Entry'}
                </Typography>
                <Typography variant='body2' sx={{ opacity: 0.75, mt: 0.25 }}>
                  {isBusiness
                    ? 'Create a unique code for your customer to enter the campaign'
                    : entryMode === 'receipt'
                      ? 'Submit your receipt details to enter the campaign'
                      : 'Enter your code from the receipt to join the campaign'}
                </Typography>
              </Box>
            </Box>
          </Container>
        </Box>

        <Container maxWidth='lg' sx={{ mt: -5 }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
          >
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, alignItems: 'flex-start' }}>
              {/* Left panel */}
              <Paper
              elevation={0}
              sx={{
                borderRadius: 3, overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
                minHeight: 360,
              }}
            >
              {isBusiness ? (
              <Box sx={{ p: 4, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BusinessVisual generatedCode={generatedCode} primaryColor={primaryColor} isDesktop={isDesktop} />
              </Box>
            ) : entryMode === 'receipt' ? (
              /* AMOE Panel - white background */
              <Box
                sx={{
                  bgcolor: 'white',
                  border: '1px solid',
                  borderColor: 'divider',
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 2.5,
                  textAlign: 'center',
                  minHeight: 360,
                }}
              >
                <Box sx={{ bgcolor: `${PRIMARY_MAIN}12`, borderRadius: 3, p: 2, display: 'flex' }}>
                  <CardGiftcard sx={{ fontSize: 56, color: PRIMARY_MAIN }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={900} color="text.primary" sx={{ mb: 0.75 }}>
                    Free Weekly Entry
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    Every member gets 1 free entry per week - no purchase needed. Resets every Sunday.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  onClick={() => navigate('/freeTicket')}
                  sx={{
                    mt: 1,
                    bgcolor: PRIMARY_MAIN,
                    color: 'white',
                    fontWeight: 700,
                    px: 3,
                    py: 1.25,
                    borderRadius: 2,
                    '&:hover': { filter: 'brightness(0.92)' },
                  }}
                >
                  Claim Free Entry
                </Button>
                <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5 }}>
                  Completely free. No credit card required.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ p: 4, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserVisual primaryColor={primaryColor} />
              </Box>
            )}
            </Paper>

            {/* Right panel: actions */}
            <Paper
              elevation={0}
              sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden', p: 4 }}
            >
              <Box sx={{ mb: 3 }}>
                <Typography variant='h6' fontWeight={800} sx={{ mb: 0.5 }}>
                  {isBusiness ? 'Create New Entry' : entryMode === 'receipt' ? 'Submit your receipt' : 'Got a code?'}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {isBusiness
                    ? 'Generate a unique code for your customer to join the Winnbell campaign.'
                    : entryMode === 'receipt'
                      ? 'Enter your receipt details below to submit your entry for the campaign.'
                      : 'Enter the code from your receipt to activate your entry and join the campaign.'}
                </Typography>
              </Box>
              {isBusiness ? (
                <BusinessActions
                  handleGenerate={handleGenerate}
                  generateMutation={generateMutation}
                  isBusinessAdmin={isBusinessAdmin}
                  selectedLocationId={selectedLocationId}
                  setSelectedLocationId={setSelectedLocationId}
                  locations={locations}
                  generatedCode={generatedCode}
                  setGeneratedCode={setGeneratedCode}
                  primaryColor={primaryColor}
                />
              ) : entryMode === 'receipt' ? (
                <ReceiptEntryForm primaryColor={primaryColor} preselectedBusinessId={preselectedBusinessId} preselectedLocation={preselectedLocation} preselectedLocationId={qrLocationId} />
              ) : (
                <UserActions
                  code={code}
                  setCode={setCode}
                  redeemMutation={redeemMutation}
                  handleActivate={handleActivate}
                  setScannerOpen={setScannerOpen}
                  navigate={navigate}
                  primaryColor={primaryColor}
                  hideScan
                />
              )}
              </Paper>
            </Box>
          </motion.div>
        </Container>

        <RedeemFeedback
          scannerOpen={scannerOpen}
          setScannerOpen={setScannerOpen}
          handleScanSuccess={handleScanSuccess}
          successOpen={successOpen}
          setSuccessOpen={setSuccessOpen}
          errorOpen={errorOpen}
          setErrorOpen={setErrorOpen}
          errorMessage={errorMessage}
          successDialogOpen={successDialogOpen}
          setSuccessDialogOpen={setSuccessDialogOpen}
          activatedCode={activatedCode}
          navigate={navigate}
          primaryColor={primaryColor}
        />
      </Box>
    );
  }

  // ─── Mobile layout ──────────────────────────────────────────────────────────

  if (isBusiness && (drawIsUpcoming || hasNoActiveDraw)) {
    return <DrawPreparationView subscription={subscription} hasDescription={hasDescription} hasLocations={hasLocations} isDesktop={false} />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', px: 1, pb: 2 }}>
      <Container maxWidth='sm' sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {isBusiness ? (
          // Business mobile layout: keep original full layout
          <>
            {/* Visual section */}
            <Box sx={{ mb: 4 }}>
              <BusinessVisual generatedCode={generatedCode} primaryColor={primaryColor} isDesktop={isDesktop} />
            </Box>

            {/* Header text */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant='h5' sx={{ fontWeight: 700, mb: 1 }}>
                Create New Entry
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                Generate a unique code for your customer to join the Winnbell campaign.
              </Typography>
            </Box>

            {/* Actions */}
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
              <BusinessActions
                handleGenerate={handleGenerate}
                generateMutation={generateMutation}
                isBusinessAdmin={isBusinessAdmin}
                selectedLocationId={selectedLocationId}
                setSelectedLocationId={setSelectedLocationId}
                locations={locations}
                generatedCode={generatedCode}
                setGeneratedCode={setGeneratedCode}
                primaryColor={primaryColor}
              />
            </Box>
          </>
        ) : (
          // User mobile layout
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 9 }}>
            <Box sx={{ height: 180, overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '10px' }}>
              <UserVisual primaryColor={primaryColor} />
            </Box>
            {entryMode === 'receipt' ? (
              <>
                {/* AMOE - compact row on mobile, hidden when a location is selected (unless form is blocked) */}
                {(!receiptLocationSelected || receiptFormBlocked) && <Paper
                  elevation={0}
                  onClick={() => navigate('/freeTicket')}
                  sx={{
                    p: 1.5, px: 2, borderRadius: 3,
                    bgcolor: `${primaryColor || PRIMARY_MAIN}0A`,
                    border: `1px solid ${primaryColor || PRIMARY_MAIN}`,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    transition: 'background-color 150ms ease-out, box-shadow 150ms ease-out, transform 150ms ease-out',
                    '&:hover': { bgcolor: `${primaryColor || PRIMARY_MAIN}14`, transform: 'translateY(-2px)' },
                    '&:active': { transform: 'scale(0.97)' },
                  }}
                >
                  <Box sx={{ bgcolor: primaryColor || PRIMARY_MAIN, borderRadius: 1.5, p: 0.75, display: 'flex', color: 'white' }}>
                    <CardGiftcard fontSize='small' />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='body2' fontWeight={700} sx={{ lineHeight: 1.2 }}>Free Weekly Entry</Typography>
                    <Typography variant='caption' color='text.secondary' sx={{ lineHeight: 1.2 }}>Claim 1 free entry · No purchase needed</Typography>
                  </Box>
                  <Box component='span' sx={{ color: primaryColor || PRIMARY_MAIN, fontSize: 20, display: 'flex' }}>›</Box>
                </Paper>}
                <ReceiptEntryForm primaryColor={primaryColor} preselectedBusinessId={preselectedBusinessId} preselectedLocation={preselectedLocation} preselectedLocationId={qrLocationId} onLocationSelect={setReceiptLocationSelected} onBlockedChange={setReceiptFormBlocked} />
              </>
            ) : (
              <UserActions
                code={code}
                setCode={setCode}
                redeemMutation={redeemMutation}
                handleActivate={handleActivate}
                setScannerOpen={setScannerOpen}
                navigate={navigate}
                primaryColor={primaryColor}
              />
            )}
          </Box>
          </motion.div>
        )}
      </Container>

      <RedeemFeedback
        scannerOpen={scannerOpen}
        setScannerOpen={setScannerOpen}
        handleScanSuccess={handleScanSuccess}
        successOpen={successOpen}
        setSuccessOpen={setSuccessOpen}
        errorOpen={errorOpen}
        setErrorOpen={setErrorOpen}
        errorMessage={errorMessage}
        successDialogOpen={successDialogOpen}
        setSuccessDialogOpen={setSuccessDialogOpen}
        activatedCode={activatedCode}
        navigate={navigate}
        primaryColor={primaryColor}
      />
    </Box>
  );
};

export default RedeemPage;
