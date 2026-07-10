import { useEffect } from 'react';
import { Box, Button, Dialog, Fade, Stack, Typography, Zoom } from '@mui/material';
import { ConfirmationNumber, EmojiEvents, AddCircleOutline } from '@mui/icons-material';
import { GRADIENT_SUCCESS, GOLD_TROPHY } from '../../../shared/colors';
import { useInstallPromptTrigger } from '../../install/InstallPromptContext';
import GoldConfetti from '../../../shared/components/GoldConfetti';

interface Props {
  open: boolean;
  submittedCode: string | null;
  submittedEntryCount: number;
  primaryColor: string;
  onViewEntries: () => void;
  onSubmitAnother: () => void;
}

const EntrySuccessDialog: React.FC<Props> = ({
  open,
  submittedCode,
  submittedEntryCount,
  primaryColor,
  onViewEntries,
  onSubmitAnother,
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
      position: 'relative', overflow: 'hidden',
    }}>
      <GoldConfetti />
      <Zoom in={open} timeout={400}>
        <Box sx={{
          width: 100, height: 100, borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mb: 3, border: '2px solid rgba(255,255,255,0.3)',
        }}>
          <EmojiEvents sx={{ fontSize: 52, color: GOLD_TROPHY }} />
        </Box>
      </Zoom>
      <Fade in={open} timeout={600}>
        <Box>
          <Typography variant="h3" fontWeight={800} sx={{ color: 'white', mb: 1 }}>
            You're In!
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 4, lineHeight: 1.6 }}>
            {submittedEntryCount > 1
              ? `You earned ${submittedEntryCount} entries in the campaign!`
              : 'Your entry is in the campaign.'}<br />Good luck!
          </Typography>
          {submittedCode && (
            <Box sx={{
              bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 2, px: 4, py: 2.5, mb: submittedEntryCount > 1 ? 1 : 5, display: 'inline-block',
            }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 2, display: 'block', mb: 0.5 }}>
                Entry Code
              </Typography>
              <Typography variant="h4" fontWeight={900} sx={{ color: 'white', fontFamily: 'monospace', letterSpacing: 4 }}>
                {submittedCode}
              </Typography>
            </Box>
          )}
          {submittedEntryCount > 1 && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', mb: 4, display: 'block' }}>
              + {submittedEntryCount - 1} more {submittedEntryCount - 1 === 1 ? 'entry' : 'entries'} added
            </Typography>
          )}
          <Stack spacing={2}>
            <Button
              variant="contained"
              size="large"
              startIcon={<ConfirmationNumber />}
              onClick={onViewEntries}
              sx={{ bgcolor: 'white', color: primaryColor, fontWeight: 800, py: 1.8, px: 4, '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
            >
              View My Entries
            </Button>
            <Button
              variant="text"
              startIcon={<AddCircleOutline />}
              onClick={onSubmitAnother}
              sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}
            >
              Submit Another Receipt
            </Button>
          </Stack>
        </Box>
      </Fade>
    </Box>
  </Dialog>
  );
};

export default EntrySuccessDialog;
