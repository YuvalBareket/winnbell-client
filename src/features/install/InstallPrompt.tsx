import { useState, useMemo } from 'react';
import {
  Dialog, Box, Typography, Button, IconButton, Stack,
} from '@mui/material';
import { Close, GetApp, Speed, NotificationsActive, WifiOff, IosShare, AddBoxOutlined, MoreVert } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useInstallPrompt } from './useInstallPrompt';
import { InstallPromptContext } from './InstallPromptContext';
import { useAppSelector } from '../../store/hook';
import { selectIsAuthenticated } from '../../store/selectors/authSelectors';
import {
  PRIMARY_MAIN, PRIMARY_LIGHT, GRADIENT_PRIMARY, SHADOW_PRIMARY_MEDIUM, ALPHA_WHITE_70, ALPHA_PRIMARY_10,
} from '../../shared/colors';

const FEATURES = [
  { icon: <Speed sx={{ fontSize: 22 }} />, title: 'Instant access', desc: 'Opens from your home screen in a blink' },
  { icon: <NotificationsActive sx={{ fontSize: 22 }} />, title: 'Stay in the loop', desc: 'Know the moment a draw opens or a winner is picked' },
  { icon: <WifiOff sx={{ fontSize: 22 }} />, title: 'Always available', desc: 'Check your tickets anytime, even offline' },
];

const IOS_STEPS = [
  { text: 'Tap the Share button', icon: <IosShare sx={{ fontSize: 20 }} /> },
  { text: 'Tap "Add to Home Screen"', icon: <AddBoxOutlined sx={{ fontSize: 20 }} /> },
  { text: 'Tap "Add" to confirm', icon: null },
];

const ANDROID_STEPS = [
  { text: 'Tap the menu button', icon: <MoreVert sx={{ fontSize: 20 }} /> },
  { text: 'Tap "Add to Home Screen"', icon: <AddBoxOutlined sx={{ fontSize: 20 }} /> },
  { text: 'Tap "Add" to confirm', icon: null },
];

/* ─── Provider ─── */
export const InstallPromptProvider = ({ children }: { children: React.ReactNode }) => {
  const hookState = useInstallPrompt();
  const [dialogOpen, setDialogOpen] = useState(false);

  const ctx = useMemo(() => ({
    canInstall: hookState.canInstall,
    installed: hookState.installed,
    isIos: hookState.isIos,
    triggerInstallPrompt: hookState.trigger,
    openInstallDialog: () => { hookState.trigger(); setDialogOpen(true); },
  }), [hookState.canInstall, hookState.installed, hookState.isIos, hookState.trigger]);

  return (
    <InstallPromptContext.Provider value={ctx}>
      {children}
      <InstallBanner
        hookState={hookState}
        dialogOpen={dialogOpen}
        onOpenDialog={() => setDialogOpen(true)}
      />
      <InstallDialog
        hookState={hookState}
        dialogOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </InstallPromptContext.Provider>
  );
};

/* ─── Types ─── */
type HookState = ReturnType<typeof useInstallPrompt>;

/* ─── Banner ─── */
const InstallBanner = ({
  hookState, dialogOpen, onOpenDialog,
}: {
  hookState: HookState; dialogOpen: boolean; onOpenDialog: () => void;
}) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { canInstall, dismissed, triggered, isIos, dismiss } = hookState;

  const show = canInstall && !dismissed && isAuthenticated && triggered && !dialogOpen;
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            position: 'fixed',
            bottom: 80,
            left: 12,
            right: 12,
            zIndex: 10,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              maxWidth: 480,
              width: '100%',
              borderRadius: 2.5,
              p: 2.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              bgcolor: 'background.paper',
              border: `1px solid ${PRIMARY_MAIN}20`,
              boxShadow: '0 12px 32px rgba(2,146,183,0.16)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box
                sx={{
                  width: 48, height: 48, borderRadius: 2.5,
                  background: GRADIENT_PRIMARY,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <GetApp sx={{ color: 'white', fontSize: 24 }} />
              </Box>

              <Box flex={1} minWidth={0}>
                <Typography variant='subtitle2' fontWeight={800} sx={{ lineHeight: 1.2, mb: 0.5 }}>
                  Don't miss out
                </Typography>
                <Typography variant='caption' color='text.secondary' sx={{ lineHeight: 1.4, display: 'block' }}>
                  Add Winnbell to your home screen. It's free and takes 2 seconds.
                </Typography>
              </Box>

              <IconButton
                size='small'
                onClick={dismiss}
                sx={{
                  flexShrink: 0,
                  color: 'text.secondary',
                  '&:hover': { bgcolor: ALPHA_PRIMARY_10 },
                }}
              >
                <Close fontSize='small' />
              </IconButton>
            </Box>

            <Button
              fullWidth
              variant='contained'
              onClick={onOpenDialog}
              size='medium'
              sx={{
                py: 1.25,
                fontWeight: 800,
                fontSize: '0.95rem',
                textTransform: 'none',
                borderRadius: 2,
                background: GRADIENT_PRIMARY,
                boxShadow: SHADOW_PRIMARY_MEDIUM,
                '&:hover': {
                  background: `linear-gradient(135deg, ${PRIMARY_LIGHT} 0%, ${PRIMARY_MAIN} 100%)`,
                },
              }}
            >
              {isIos ? 'See Instructions' : 'Install Now'}
            </Button>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ─── Dialog ─── */
const InstallDialog = ({
  hookState, dialogOpen, onClose,
}: {
  hookState: HookState; dialogOpen: boolean; onClose: () => void;
}) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { canInstall, isIos, hasNativePrompt, install, dismiss } = hookState;
  const [installing, setInstalling] = useState(false);

  const open = dialogOpen && canInstall && isAuthenticated;

  // Show manual steps when no native one-click prompt is available
  const showManualSteps = !hasNativePrompt;
  const steps = isIos ? IOS_STEPS : ANDROID_STEPS;

  const handleInstall = async () => {
    if (showManualSteps) return;
    setInstalling(true);
    const accepted = await install();
    setInstalling(false);
    if (accepted) onClose();
  };

  const handleDismiss = () => {
    onClose();
    dismiss();
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
            component='img'
            src='/winnbell_app_name_white.svg'
            alt='Winnbell'
            sx={{ height: 60, width: 'auto', mb: 0 }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Typography variant='h6' fontWeight={800} color='white' gutterBottom sx={{ mb: 1 }}>
            Get the App
          </Typography>
<Typography variant='body2' sx={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
            {showManualSteps
              ? 'Three quick taps and you are all set.'
              : 'One tap and you are all set. Never miss a draw again.'}
          </Typography>
        </motion.div>
      </Box>

      {/* Content */}
      <Box sx={{ px: 3, py: 3.5 }}>
        {showManualSteps ? (
          <Stack spacing={2.75}>
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 36, height: 36, borderRadius: '50%',
                      bgcolor: ALPHA_PRIMARY_10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, color: PRIMARY_MAIN, fontWeight: 800, fontSize: 15,
                    }}
                  >
                    {i + 1}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='body2' fontWeight={600} sx={{ lineHeight: 1.4 }}>
                      {s.text}
                    </Typography>
                  </Box>
                  {s.icon && (
                    <Box sx={{ color: PRIMARY_MAIN, flexShrink: 0, display: 'flex' }}>{s.icon}</Box>
                  )}
                </Box>
              </motion.div>
            ))}

            <Box sx={{ bgcolor: ALPHA_PRIMARY_10, borderRadius: 2.5, p: 2.5, mt: 1 }}>
              <Typography variant='caption' color='text.secondary' sx={{ lineHeight: 1.6, display: 'block' }}>
                That's it! Winnbell will show up on your home screen just like any app.
              </Typography>
            </Box>
          </Stack>
        ) : (
          <Stack spacing={2.5}>
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box
                    sx={{
                      width: 44, height: 44, borderRadius: 2.5,
                      bgcolor: ALPHA_PRIMARY_10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, color: PRIMARY_MAIN,
                    }}
                  >
                    {f.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='body2' fontWeight={700} sx={{ mb: 0.25 }}>{f.title}</Typography>
                    <Typography variant='caption' color='text.secondary' sx={{ lineHeight: 1.4, display: 'block' }}>{f.desc}</Typography>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Stack>
        )}
      </Box>

      {/* Actions */}
      <Box sx={{ px: 3, pb: 3.5 }}>
        {showManualSteps ? (
          <Button
            fullWidth
            variant='contained'
            size='large'
            onClick={handleDismiss}
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
        ) : (
          <>
            <Button
              fullWidth
              variant='contained'
              size='large'
              startIcon={<GetApp />}
              onClick={handleInstall}
              disabled={installing}
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
              onClick={handleDismiss}
              sx={{
                mt: 1.5,
                py: 1,
                fontWeight: 600,
                textTransform: 'none',
                color: 'text.secondary',
                '&:hover': { bgcolor: ALPHA_PRIMARY_10 },
              }}
            >
              Maybe later
            </Button>
          </>
        )}
      </Box>
    </Dialog>
  );
};

export default InstallPromptProvider;
