import { useEffect } from 'react';
import { Box, Button, Dialog, Fade, Typography, Zoom } from '@mui/material';
import { ConfirmationNumber, CardGiftcard } from '@mui/icons-material';
import {
  GRADIENT_SUCCESS, GOLD_TROPHY, ALPHA_WHITE_15, ALPHA_WHITE_20, ALPHA_WHITE_70, ALPHA_WHITE_90,
} from '../../../shared/colors';
import { useInstallPromptTrigger } from '../../install/InstallPromptContext';
import GoldConfetti from '../../../shared/components/GoldConfetti';
import { useConfettiTaps } from '../../../shared/hooks/useConfettiTaps';

interface Props {
  open: boolean;
  onViewEntries: () => void;
  /** CTA label override - profile setup uses "Continue setup" (entries are not reachable
      until the gate completes; the default suits the entry pages). */
  ctaLabel?: string;
}

const ReferralBonusSuccessDialog: React.FC<Props> = ({
  open,
  onViewEntries,
  ctaLabel = 'View My Entries',
}) => {
  const { triggerInstallPrompt } = useInstallPromptTrigger();
  useEffect(() => { if (open) triggerInstallPrompt(); }, [open, triggerInstallPrompt]);
  // Tap-to-celebrate: taps pop confetti from the tap point (shared across congrats screens).
  const { fireBurst, confettiBursts } = useConfettiTaps();
  return (
  <Dialog
    open={open}
    fullScreen
    TransitionComponent={Fade}
    PaperProps={{ sx: { bgcolor: 'transparent', boxShadow: 'none' } }}
  >
    <Box
      onClick={fireBurst}
      sx={{
        height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: GRADIENT_SUCCESS, px: 4, textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <GoldConfetti />
      {confettiBursts}
      <Zoom in={open} timeout={400}>
        <Box sx={{
          width: 100, height: 100, borderRadius: '50%',
          bgcolor: ALPHA_WHITE_15,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mb: 3, border: `2px solid ${ALPHA_WHITE_20}`,
        }}>
          <CardGiftcard sx={{ fontSize: 52, color: GOLD_TROPHY }} />
        </Box>
      </Zoom>
      <Fade in={open} timeout={600}>
        <Box>
          <Typography variant="h3" fontWeight={800} sx={{ color: 'white', mb: 1 }}>
            You're In!
          </Typography>
          <Typography variant="body1" sx={{ color: ALPHA_WHITE_70, mb: 4, lineHeight: 1.6 }}>
            Your bonus entry is locked in for the current draw. Good luck!
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<ConfirmationNumber />}
            onClick={(e) => { e.stopPropagation(); onViewEntries(); }}
            sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 800, py: 1.8, px: 4, '&:hover': { bgcolor: ALPHA_WHITE_90 } }}
          >
            {ctaLabel}
          </Button>
        </Box>
      </Fade>
    </Box>
  </Dialog>
  );
};

export default ReferralBonusSuccessDialog;
