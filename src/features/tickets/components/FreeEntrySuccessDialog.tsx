import { Box, Button, Dialog, Fade, Stack, Typography, Zoom } from '@mui/material';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { GRADIENT_SUCCESS, GOLD_TROPHY } from '../../../shared/colors';

interface Props {
  open: boolean;
  claimedCode: string;
  onViewEntries: () => void;
  onClose: () => void;
}

const FreeEntrySuccessDialog: React.FC<Props> = ({ open, claimedCode, onViewEntries, onClose }) => (
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
          width: 100, height: 100, borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mb: 3, border: '2px solid rgba(255,255,255,0.3)',
        }}>
          <EmojiEventsIcon sx={{ fontSize: 52, color: GOLD_TROPHY }} />
        </Box>
      </Zoom>
      <Fade in={open} timeout={600}>
        <Box>
          <Typography variant="h3" fontWeight={800} sx={{ color: 'white', mb: 1 }}>
            You're In!
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 4, lineHeight: 1.6 }}>
            Your free entry is in the campaign.<br />Good luck!
          </Typography>
          {claimedCode && (
            <Box sx={{
              bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 2, px: 4, py: 2.5, mb: 5, display: 'inline-block',
            }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 2, display: 'block', mb: 0.5 }}>
                Entry Code
              </Typography>
              <Typography variant="h4" fontWeight={900} sx={{ color: 'white', fontFamily: 'monospace', letterSpacing: 4 }}>
                {claimedCode}
              </Typography>
            </Box>
          )}
          <Stack spacing={2}>
            <Button
              variant="contained"
              size="large"
              startIcon={<ConfirmationNumberIcon />}
              onClick={onViewEntries}
              sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 800, py: 1.8, px: 4, '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
            >
              View My Entries
            </Button>
            <Button
              variant="text"
              onClick={onClose}
              sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}
            >
              Close
            </Button>
          </Stack>
        </Box>
      </Fade>
    </Box>
  </Dialog>
);

export default FreeEntrySuccessDialog;
