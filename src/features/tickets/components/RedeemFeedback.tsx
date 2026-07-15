import React, { useEffect } from 'react';
import {
  Snackbar,
  Alert,
  Dialog,
  Box,
  Typography,
  Button,
  Stack,
  Zoom,
  Fade,
} from '@mui/material';
import {
  EmojiEvents,
  ConfirmationNumber,
} from '@mui/icons-material';
import QRScannerModal from './QRScannerModal';
import { GRADIENT_SUCCESS, GOLD_TROPHY, ALPHA_WHITE_90 } from '../../../shared/colors';
import { useInstallPromptTrigger } from '../../install/InstallPromptContext';
import GoldConfetti from '../../../shared/components/GoldConfetti';
import { useConfettiTaps } from '../../../shared/hooks/useConfettiTaps';

interface RedeemFeedbackProps {
  scannerOpen: boolean;
  setScannerOpen: (open: boolean) => void;
  handleScanSuccess: (code: string) => void;
  errorOpen: boolean;
  setErrorOpen: (open: boolean) => void;
  errorMessage: string;
  successDialogOpen: boolean;
  setSuccessDialogOpen: (open: boolean) => void;
  navigate: (path: string) => void;
  primaryColor: string;
}

const RedeemFeedback: React.FC<RedeemFeedbackProps> = ({
  scannerOpen,
  setScannerOpen,
  handleScanSuccess,
  errorOpen,
  setErrorOpen,
  errorMessage,
  successDialogOpen,
  setSuccessDialogOpen,
  navigate,
  primaryColor,
}) => {
  const { triggerInstallPrompt } = useInstallPromptTrigger();
  useEffect(() => { if (successDialogOpen) triggerInstallPrompt(); }, [successDialogOpen, triggerInstallPrompt]);
  // Tap-to-celebrate: taps pop confetti from the tap point (shared across congrats screens).
  const { fireBurst, confettiBursts } = useConfettiTaps();
  return (
  <>
    <QRScannerModal open={scannerOpen} onScan={handleScanSuccess} onClose={() => setScannerOpen(false)} />
    <Snackbar open={errorOpen} autoHideDuration={5000} onClose={() => setErrorOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <Alert severity='error' variant='filled' onClose={() => setErrorOpen(false)}>{errorMessage}</Alert>
    </Snackbar>

    <Dialog
      open={successDialogOpen}
      fullScreen
      TransitionComponent={Fade}
      PaperProps={{ sx: { bgcolor: 'transparent', boxShadow: 'none' } }}
    >
      <Box
        onClick={fireBurst}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: GRADIENT_SUCCESS,
          px: 4,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <GoldConfetti />
        {confettiBursts}
        <Zoom in={successDialogOpen} timeout={400}>
          <Box
            sx={{
              width: 100, height: 100, borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mb: 3, border: '2px solid rgba(255,255,255,0.3)',
            }}
          >
            <EmojiEvents sx={{ fontSize: 52, color: GOLD_TROPHY }} />
          </Box>
        </Zoom>
        <Fade in={successDialogOpen} timeout={600}>
          <Box>
            <Typography variant='h3' fontWeight={800} sx={{ color: 'white', mb: 1 }}>You're In!</Typography>
            <Typography variant='body1' sx={{ color: 'rgba(255,255,255,0.8)', mb: 4, lineHeight: 1.6 }}>
              Your entry has been activated.<br />Good luck in the campaign!
            </Typography>
          
            <Stack spacing={2}>
              <Button
                variant='contained'
                size='large'
                startIcon={<ConfirmationNumber />}
                onClick={(e) => { e.stopPropagation(); setSuccessDialogOpen(false); navigate('/tickets'); }}
                sx={{ bgcolor: 'white', color: primaryColor, fontWeight: 800, py: 1.8, px: 4, '&:hover': { bgcolor: ALPHA_WHITE_90 } }}
              >
                View My Entries
              </Button>
              <Button variant='text' onClick={(e) => { e.stopPropagation(); setSuccessDialogOpen(false); }} sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>
                Done
              </Button>
            </Stack>
          </Box>
        </Fade>
      </Box>
    </Dialog>
  </>
  );
};

export default RedeemFeedback;
