import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
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
import { useBusinessData } from '../../partner/hooks/useBusinessData';
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

  // Mutations
  const redeemMutation = useRedeemTicket();
  const generateMutation = useGenerateTicket();

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

    // 4. Trigger mutation
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
                  {isBusiness ? 'Generate Ticket' : 'Activate Ticket'}
                </Typography>
                <Typography variant='body2' sx={{ opacity: 0.75, mt: 0.25 }}>
                  {isBusiness
                    ? 'Create a unique code for your customer to enter the draw'
                    : 'Enter your code from the receipt to join the draw'}
                </Typography>
              </Box>
            </Box>
          </Container>
        </Box>

        <Container maxWidth='lg' sx={{ mt: -5 }}>
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
                  {isBusiness ? 'Create New Ticket' : 'Got a code?'}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {isBusiness
                    ? 'Generate a unique code for your customer to join the Winnbell draw.'
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
            </Paper>
          </Box>
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

  // ─── Mobile layout (original) ────────────────────────────────────────────────

  return (
    <Box p={2} pt={0} sx={{ display: 'flex', flexDirection: 'column' }}>
      <Container
        maxWidth='sm'
        sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: isBusiness ? 'stretch' : 'center', pb: 4 }}
      >
        {/* Visual section */}
        {isBusiness ? (
          <Box sx={{ mb: 4 }}>
            <BusinessVisual generatedCode={generatedCode} primaryColor={primaryColor} isDesktop={isDesktop} />
          </Box>
        ) : (
          <Box sx={{ mb: 4 }}>
            <UserVisual primaryColor={primaryColor} />
          </Box>
        )}

        {/* Header text */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant='h5' sx={{ fontWeight: 700, mb: 1 }}>
            {isBusiness ? 'Create New Ticket' : 'Got a code?'}
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            {isBusiness
              ? 'Generate a unique code for your customer to join the Winnbell draw.'
              : 'Enter the code from your receipt to activate your ticket and join the draw.'}
          </Typography>
        </Box>

        {/* Actions */}
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
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
