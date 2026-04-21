import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Paper,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  AddCircleOutline,
  ConfirmationNumber,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

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
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const primaryColor = PRIMARY_MAIN;

  // Business owner locations
  const { data: businessData } = useBusinessData(isBusinessAdmin);
  const locations = isBusinessAdmin ? (businessData?.locations ?? []) : [];

  // Subscription and draw state
  const { data: subscription } = useSubscription(isBusinessAdmin);

  // Entry mode — lightweight single-field fetch for user side,
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

    // 4. Trigger mutation — promo codes use a separate endpoint
    if (pending.startsWith('PROMO_')) {
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
        const msg = err?.response?.data?.message || 'Invalid or already used ticket code.';
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
      <Box sx={{ bgcolor: BG_PAGE, minHeight: '100vh', pb: 6 }}>
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
                  {isBusiness ? 'Generate Ticket' : entryMode === 'receipt' ? 'Submit Receipt' : 'Activate Ticket'}
                </Typography>
                <Typography variant='body2' sx={{ opacity: 0.75, mt: 0.25 }}>
                  {isBusiness
                    ? 'Create a unique code for your customer to enter the draw'
                    : entryMode === 'receipt'
                      ? 'Submit your receipt details to enter the draw'
                      : 'Enter your code from the receipt to join the draw'}
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
              {/* Left panel: visual */}
              <Paper
              elevation={0}
              sx={{
                borderRadius: 3, border: '1px solid', borderColor: 'divider',
                overflow: 'hidden', p: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minHeight: 360,
              }}
            >
              {isBusiness ? (
              <BusinessVisual generatedCode={generatedCode} primaryColor={primaryColor} isDesktop={isDesktop} />
            ) : (
              <UserVisual primaryColor={primaryColor} />
            )}
            </Paper>

            {/* Right panel: actions */}
            <Paper
              elevation={0}
              sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden', p: 4 }}
            >
              <Box sx={{ mb: 3 }}>
                <Typography variant='h6' fontWeight={800} sx={{ mb: 0.5 }}>
                  {isBusiness ? 'Create New Ticket' : entryMode === 'receipt' ? 'Submit your receipt' : 'Got a code?'}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {isBusiness
                    ? 'Generate a unique code for your customer to join the Winnbell draw.'
                    : entryMode === 'receipt'
                      ? 'Enter your receipt details below to submit your entry for the draw.'
                      : 'Enter the code from your receipt to activate your ticket and join the draw.'}
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
                <ReceiptEntryForm primaryColor={primaryColor} />
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
                Create New Ticket
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                Generate a unique code for your customer to join the Winnbell draw.
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
              <ReceiptEntryForm primaryColor={primaryColor} />
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
