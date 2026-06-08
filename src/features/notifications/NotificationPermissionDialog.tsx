import {
  Dialog, Box, Typography, Button, IconButton,
} from '@mui/material';
import { Close, NotificationsActive } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useInstallPromptTrigger } from '../install/InstallPromptContext';
import {
  GRADIENT_PRIMARY, SHADOW_PRIMARY_MEDIUM, PRIMARY_MAIN, PRIMARY_LIGHT,
  ALPHA_WHITE_70,
  ALPHA_PRIMARY_10,
} from '../../shared/colors';

interface NotificationPermissionDialogProps {
  open: boolean;
  onClose: () => void;
  onAllow: () => void;
}

const isStandalone = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(display-mode: standalone)').matches;

const isMobileBrowser = () => {
  if (typeof window === 'undefined') return false;
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    ('ontouchstart' in window && navigator.maxTouchPoints > 0);
};

const getDialogState = (installed: boolean): 'pre-prompt' | 'install-first' | 'denied' => {

  if (typeof window === 'undefined') return 'pre-prompt';

  const perm = Notification.permission;

  if (perm === 'denied') return 'denied';

  if (isMobileBrowser() && !isStandalone() && !installed) return 'install-first';

  return 'pre-prompt';
};

const NotificationPermissionDialog = ({ open, onClose, onAllow }: NotificationPermissionDialogProps) => {
  const { installed, openInstallDialog } = useInstallPromptTrigger();

  const state = getDialogState(installed);

  const handleInstallApp = () => {
    openInstallDialog();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 4,
          maxWidth: 380,
          mx: 2,
          overflow: 'hidden',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: GRADIENT_PRIMARY,
          px: 3,
          pt: 4,
          pb: 3,
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute', top: 8, right: 8,
            color: ALPHA_WHITE_70,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
          }}
        >
          <Close />
        </IconButton>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <NotificationsActive sx={{ fontSize: 32, color: 'white' }} />
          </Box>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Typography variant='h6' fontWeight={800} color='white' sx={{ mb: 1 }}>
            {state === 'pre-prompt' && 'Never miss a draw'}
            {state === 'install-first' && 'Install to get notifications'}
            {state === 'denied' && 'Notifications are blocked'}
          </Typography>
          <Typography variant='body2' sx={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
            {state === 'pre-prompt' && 'Stay updated with everything happening on Winnbell.'}
            {state === 'install-first' && 'Push notifications work best from the app. Add Winnbell to your home screen first.'}
            {state === 'denied' && 'You previously blocked notifications. To turn them on, open your browser settings and allow notifications for this site.'}
          </Typography>
        </motion.div>
      </Box>

      {/* Actions */}
      <Box sx={{ px: 3, pb: 3.5, pt: 3.5 }}>
        {state === 'pre-prompt' && (
          <>
            <Button
              fullWidth
              variant='contained'
              size='large'
              onClick={onAllow}
              sx={{
                py: 1.75,
                fontWeight: 800,
                fontSize: '1rem',
                textTransform: 'none',
                borderRadius: 2.5,
                background: GRADIENT_PRIMARY,
                boxShadow: SHADOW_PRIMARY_MEDIUM,
                '&:hover': { background: `linear-gradient(135deg, ${PRIMARY_LIGHT} 0%, ${PRIMARY_MAIN} 100%)` },
              }}
            >
              Allow Notifications
            </Button>
            <Button
              fullWidth
              onClick={onClose}
              sx={{
                mt: 1.5,
                py: 1,
                fontWeight: 600,
                textTransform: 'none',
                color: 'text.secondary',
                '&:hover': { bgcolor: ALPHA_PRIMARY_10 },
              }}
            >
              Not now
            </Button>
          </>
        )}

        {state === 'install-first' && (
          <>
            <Button
              fullWidth
              variant='contained'
              size='large'
              onClick={handleInstallApp}
              sx={{
                py: 1.75,
                fontWeight: 800,
                fontSize: '1rem',
                textTransform: 'none',
                borderRadius: 2.5,
                background: GRADIENT_PRIMARY,
                boxShadow: SHADOW_PRIMARY_MEDIUM,
                '&:hover': { background: `linear-gradient(135deg, ${PRIMARY_LIGHT} 0%, ${PRIMARY_MAIN} 100%)` },
              }}
            >
              Install App
            </Button>
            <Button
              fullWidth
              onClick={onClose}
              sx={{
                mt: 1.5,
                py: 1,
                fontWeight: 600,
                textTransform: 'none',
                color: 'text.secondary',
                '&:hover': { bgcolor: ALPHA_PRIMARY_10 },
              }}
            >
              Not now
            </Button>
          </>
        )}

        {state === 'denied' && (
          <Button
            fullWidth
            variant='contained'
            size='large'
            onClick={onClose}
            sx={{
              py: 1.75,
              fontWeight: 800,
              fontSize: '1rem',
              textTransform: 'none',
              borderRadius: 2.5,
              background: GRADIENT_PRIMARY,
              boxShadow: SHADOW_PRIMARY_MEDIUM,
              '&:hover': { background: `linear-gradient(135deg, ${PRIMARY_LIGHT} 0%, ${PRIMARY_MAIN} 100%)` },
            }}
          >
            Got it
          </Button>
        )}
      </Box>
    </Dialog>
  );
};

export default NotificationPermissionDialog;
