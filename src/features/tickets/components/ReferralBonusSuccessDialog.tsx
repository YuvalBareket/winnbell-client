import { useEffect } from 'react';
import { Box, Button, Dialog, Fade, Typography, Zoom } from '@mui/material';
import { ConfirmationNumber, CardGiftcard } from '@mui/icons-material';
import { GRADIENT_SUCCESS, GOLD_TROPHY } from '../../../shared/colors';
import { useInstallPromptTrigger } from '../../install/InstallPromptContext';

interface Props {
  open: boolean;
  onViewEntries: () => void;
}

const ReferralBonusSuccessDialog: React.FC<Props> = ({
  open,
  onViewEntries,
}) => {
  const { triggerInstallPrompt } = useInstallPromptTrigger();
  useEffect(() => { if (open) triggerInstallPrompt(); }, [open, triggerInstallPrompt]);
  return (
  <Dialog
    open={open}
    fullScreen
    TransitionComponent={Fade}
    PaperProps={{ sx: { bgcolor: 'transparent', boxShadow: 'none' } }}
  >
    <Box sx={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: GRADIENT_SUCCESS, px: 4, textAlign: 'center',
    }}>
      <Zoom in={open} timeout={400}>
        <Box sx={{
          width: 100, height: 100, borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mb: 3, border: '2px solid rgba(255,255,255,0.3)',
        }}>
          <CardGiftcard sx={{ fontSize: 52, color: GOLD_TROPHY }} />
        </Box>
      </Zoom>
      <Fade in={open} timeout={600}>
        <Box>
          <Typography variant="h3" fontWeight={800} sx={{ color: 'white', mb: 1 }}>
            You're In!
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 4, lineHeight: 1.6 }}>
            Your free bonus entry is locked in for this month's draw. Good luck!
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<ConfirmationNumber />}
            onClick={onViewEntries}
            sx={{ bgcolor: 'white', color: '#1565c0', fontWeight: 800, py: 1.8, px: 4, '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
          >
            View My Entries
          </Button>
        </Box>
      </Fade>
    </Box>
  </Dialog>
  );
};

export default ReferralBonusSuccessDialog;
