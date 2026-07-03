import { useEffect } from 'react';
import { Box, Button, Dialog, Fade, Stack, Typography, Zoom } from '@mui/material';
import CheckRounded from '@mui/icons-material/CheckRounded';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import ReceiptLongOutlined from '@mui/icons-material/ReceiptLongOutlined';
import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded';
import { GRADIENT_SUCCESS, ALPHA_WHITE_10, ALPHA_WHITE_15, ALPHA_WHITE_20, ALPHA_WHITE_70 } from '../../../shared/colors';
import { useInstallPromptTrigger } from '../../install/InstallPromptContext';

interface Props {
  open: boolean;
  claimedCode: string;
  /** e.g. "July Grand Draw . $2,500" */
  drawLabel?: string;
  /** e.g. "Sunday, July 6" */
  nextDateLabel?: string;
  onViewEntries: () => void;
  onSubmitReceipt?: () => void;
  onClose: () => void;
}

const FreeEntrySuccessDialog: React.FC<Props> = ({ open, claimedCode, drawLabel, nextDateLabel, onViewEntries, onSubmitReceipt, onClose }) => {
  const { triggerInstallPrompt } = useInstallPromptTrigger();
  useEffect(() => { if (open) triggerInstallPrompt(); }, [open, triggerInstallPrompt]);
  return (
  <Dialog
    open={open}
    fullScreen
    TransitionComponent={Fade}
    PaperProps={{ sx: { bgcolor: 'transparent' } }}
  >
    <Box sx={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: GRADIENT_SUCCESS, px: 4, textAlign: 'center',
    }}>
      <Zoom in={open} timeout={400}>
        <Box sx={{
          width: 96, height: 96, borderRadius: '50%',
          bgcolor: ALPHA_WHITE_15,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mb: 3, border: `2px solid ${ALPHA_WHITE_20}`,
        }}>
          <CheckRounded sx={{ fontSize: 52, color: '#fff' }} />
        </Box>
      </Zoom>
      <Fade in={open} timeout={600}>
        <Box sx={{ width: '100%', maxWidth: 380 }}>
          <Typography variant="h3" fontWeight={800} sx={{ color: 'white', mb: 1 }}>
            You're in!
          </Typography>
          <Typography variant="body1" sx={{ color: ALPHA_WHITE_70, mb: 4, lineHeight: 1.6 }}>
            {drawLabel
              ? <>Your free entry is locked into the <b style={{ color: '#fff' }}>{drawLabel}</b>. Good luck!</>
              : <>Your free entry is in the campaign. Good luck!</>}
          </Typography>
          {claimedCode && (
            <Box sx={{
              bgcolor: ALPHA_WHITE_10, border: `1px solid ${ALPHA_WHITE_20}`,
              borderRadius: 3, px: 4, py: 2.5, mb: 3, display: 'inline-block',
            }}>
              <Typography variant="caption" sx={{ color: ALPHA_WHITE_70, textTransform: 'uppercase', letterSpacing: 2, display: 'block', mb: 0.5 }}>
                Entry Code
              </Typography>
              <Typography variant="h4" fontWeight={900} sx={{ color: 'white', fontFamily: 'monospace', letterSpacing: 4 }}>
                {claimedCode}
              </Typography>
            </Box>
          )}
          {nextDateLabel && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 4 }}>
              <AccessTimeRounded sx={{ fontSize: 17, color: ALPHA_WHITE_70 }} />
              <Typography variant="body2" sx={{ color: ALPHA_WHITE_70 }}>
                Next free entry {nextDateLabel}
              </Typography>
            </Box>
          )}
          <Stack spacing={1.5}>
            <Button
              variant="contained"
              size="large"
              startIcon={<ConfirmationNumberIcon />}
              onClick={onViewEntries}
              sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 800, py: 1.6, borderRadius: 2.5, textTransform: 'none', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
            >
              View my entries
            </Button>
            <Button
              variant="text"
              startIcon={onSubmitReceipt ? <ReceiptLongOutlined sx={{ fontSize: 18 }} /> : undefined}
              onClick={onSubmitReceipt ?? onClose}
              sx={{ color: ALPHA_WHITE_70, fontWeight: 700, textTransform: 'none' }}
            >
              {onSubmitReceipt ? 'Submit a receipt for more' : 'Close'}
            </Button>
          </Stack>
        </Box>
      </Fade>
    </Box>
  </Dialog>
  );
};

export default FreeEntrySuccessDialog;
