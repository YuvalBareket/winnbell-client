import React from 'react';
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
import { GRADIENT_SUCCESS, GOLD_TROPHY } from '../../../shared/colors';

interface RedeemFeedbackProps {
  scannerOpen: boolean;
  setScannerOpen: (open: boolean) => void;
  handleScanSuccess: (code: string) => void;
  successOpen: boolean;
  setSuccessOpen: (open: boolean) => void;
  errorOpen: boolean;
  setErrorOpen: (open: boolean) => void;
  errorMessage: string;
  successDialogOpen: boolean;
  setSuccessDialogOpen: (open: boolean) => void;
  activatedCode: string | null;
  navigate: (path: string) => void;
  primaryColor: string;
}

const RedeemFeedback: React.FC<RedeemFeedbackProps> = ({
  scannerOpen,
  setScannerOpen,
  handleScanSuccess,
  successOpen,
  setSuccessOpen,
  errorOpen,
  setErrorOpen,
  errorMessage,
  successDialogOpen,
  setSuccessDialogOpen,
  activatedCode,
  navigate,
  primaryColor,
}) => (
  <>
    <QRScannerModal open={scannerOpen} onScan={handleScanSuccess} onClose={() => setScannerOpen(false)} />
    <Snackbar open={successOpen} autoHideDuration={4000} onClose={() => setSuccessOpen(false)}>
      <Alert severity='success' variant='filled'>Ticket Generated Successfully!</Alert>
    </Snackbar>
    <Snackbar open={errorOpen} autoHideDuration={5000} onClose={() => setErrorOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <Alert severity='error' variant='filled' onClose={() => setErrorOpen(false)}>{errorMessage}</Alert>
    </Snackbar>

    <Dialog
      open={successDialogOpen}
      fullScreen
      TransitionComponent={Fade}
      PaperProps={{ sx: { bgcolor: 'transparent' } }}
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: GRADIENT_SUCCESS,
          px: 4,
          textAlign: 'center',
        }}
      >
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
              Your ticket has been activated.<br />Good luck in the draw!
            </Typography>
          
            <Stack spacing={2}>
              <Button
                variant='contained'
                size='large'
                startIcon={<ConfirmationNumber />}
                onClick={() => { setSuccessDialogOpen(false); navigate('/tickets'); }}
                sx={{ bgcolor: 'white', color: primaryColor, fontWeight: 800, borderRadius: 3, py: 1.8, px: 4, '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
              >
                View My Tickets
              </Button>
              <Button variant='text' onClick={() => setSuccessDialogOpen(false)} sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>
                Done
              </Button>
            </Stack>
          </Box>
        </Fade>
      </Box>
    </Dialog>
  </>
);

export default RedeemFeedback;
