import {
  Box, Dialog, Drawer, IconButton, Stack, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import { Close, ConfirmationNumber, VerifiedUserOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import PhoneVerifyForm from './PhoneVerifyForm';
import {
  GRADIENT_HERO, BORDER_LIGHT, BG_DEFAULT,
  ALPHA_WHITE_15, ALPHA_WHITE_30,
} from '../../../shared/colors';

type Context = 'free' | 'receipt' | 'promo' | 'referral' | 'generic' | 'setup';

interface Props {
  open: boolean;
  onClose: () => void;
  onVerified: (referralBonusGranted: boolean) => void;
  context: Context;
  pendingCode?: string;
}

const contextConfig = {
  free: {
    title: 'Your weekly entry is waiting',
    message: 'Confirm your phone once, you\'ll never be asked again.',
  },
  receipt: {
    title: 'Almost there',
    message: 'One quick confirmation and your receipt entry goes right in. You only ever do this once.',
  },
  promo: {
    title: 'We saved your promo entry',
    message: 'Your code is safe with us. Confirm your phone once and your entry activates automatically.',
  },
  referral: {
    title: 'Your welcome entry is waiting',
    message: 'We saved a bonus entry for you. Confirm your phone once and it goes right into the draw.',
  },
  generic: {
    title: 'Confirm your phone',
    message: 'A quick, one-time confirmation before your first entry. You\'ll never be asked again.',
  },
  // Profile setup: the optional add-phone button. Purpose copy matches the setup page
  // (account confirmation), and "one time" reassures exactly like the entry contexts.
  setup: {
    title: 'Add your phone',
    message: 'A quick one-time check to confirm your account. You\'ll never be asked again.',
  },
};

// The "why" behind the ask, shown in every context.
const TRUST_LINE = 'This one-time check protects our members and keeps every draw fair.';

const PhoneVerifySheet = ({
  open,
  onClose,
  onVerified,
  context,
  pendingCode,
}: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const config = contextConfig[context];

  const handleVerified = (referralBonusGranted: boolean) => {
    onVerified(referralBonusGranted);
    onClose();
  };

  // Only the explicit X closes the sheet - a stray tap on the backdrop (or Escape) must not
  // dismiss a half-typed phone number or a pending entry.
  const handleShellClose = (_event: object, reason: string) => {
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
    onClose();
  };

  const formContent = (
    <PhoneVerifyForm onVerified={handleVerified} />
  );

  if (isMobile) {
    return (
      <Drawer
        anchor='bottom'
        open={open}
        onClose={handleShellClose}
        PaperProps={{
          sx: {
            borderRadius: '24px 24px 0 0',
            maxHeight: '97dvh',
            overflow: 'hidden', // the gradient header must clip to the rounded corners
            display: 'flex',
            flexDirection: 'column',
          },
        }}
        SlideProps={{
          unmountOnExit: true,
        }}
      >
        {/* Gradient header band - same hero language as the rest of the app */}
        <Box
          sx={{
            background: GRADIENT_HERO,
            color: 'white',
            px: 3,
            pt: 3,
            pb: 2.5,
            position: 'relative',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {/* Glow orb (radial gradient, not filter:blur) */}
          <Box sx={{ position: 'absolute', top: -90, right: -70, width: 260, height: 260, borderRadius: '50%', background: `radial-gradient(circle, ${ALPHA_WHITE_15} 0%, transparent 68%)`, pointerEvents: 'none' }} />

          {/* Close button */}
          <IconButton
            size='small'
            aria-label='Close'
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 2,
              color: 'white',
              bgcolor: ALPHA_WHITE_15,
              border: `1px solid ${ALPHA_WHITE_30}`,
              '&:hover': { bgcolor: ALPHA_WHITE_30 },
            }}
          >
            <Close sx={{ fontSize: 18 }} />
          </IconButton>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Stack spacing={1} sx={{ position: 'relative', pr: 5 }}>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.25 }}>
                {config.title}
              </Typography>
              <Typography variant='body2' sx={{ opacity: 0.85, lineHeight: 1.6 }}>
                {config.message}
              </Typography>
              {/* Trust card - the "why" behind the ask, highlighted */}
              <Stack
                direction='row'
                spacing={1.25}
                sx={{
                  alignItems: 'flex-start',
                  bgcolor: ALPHA_WHITE_15,
                  border: `1px solid ${ALPHA_WHITE_30}`,
                  borderRadius: '14px',
                  px: 2,
                  py: 1.5,
                  mt: 0.5,
                }}
              >
                <VerifiedUserOutlined sx={{ fontSize: 19, flexShrink: 0, mt: '1px' }} />
                <Typography variant='caption' sx={{ lineHeight: 1.6, fontWeight: 700, fontSize: '0.76rem' }}>
                  {TRUST_LINE}
                </Typography>
              </Stack>
            </Stack>
          </motion.div>
        </Box>

        {/* Form body */}
        <Box
          sx={{
            p: 3,
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch', // smooth iOS scroll
          }}
        >
          {formContent}
        </Box>
      </Drawer>
    );
  }

  // Desktop: two-section Dialog - gradient info panel left, form right - so the header,
  // promo chip, and SMS consent text never stack into one overflowing column.
  return (
    <Dialog
      open={open}
      onClose={handleShellClose}
      PaperProps={{
        sx: {
          borderRadius: '20px',
          maxWidth: 760,
          width: '100%',
          border: `1px solid ${BORDER_LIGHT}`,
          bgcolor: BG_DEFAULT,
          overflow: 'hidden',
        },
      }}
      TransitionProps={{
        timeout: 300,
      }}
    >
      <Box sx={{ display: 'flex', position: 'relative' }}>
        {/* Close button */}
        <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
          <IconButton
            size='small'
            aria-label='Close'
            onClick={onClose}
            sx={{ color: 'text.secondary' }}
          >
            <Close />
          </IconButton>
        </Box>

        {/* Left: gradient info panel */}
        <Box
          sx={{
            width: '42%',
            flexShrink: 0,
            background: GRADIENT_HERO,
            color: 'white',
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Glow orb (radial gradient, not filter:blur) */}
          <Box sx={{ position: 'absolute', top: -90, right: -90, width: 280, height: 280, borderRadius: '50%', background: `radial-gradient(circle, ${ALPHA_WHITE_15} 0%, transparent 68%)`, pointerEvents: 'none' }} />

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Stack spacing={2} sx={{ position: 'relative' }}>
              <Typography variant='h6' sx={{ fontWeight: 800, lineHeight: 1.25 }}>
                {config.title}
              </Typography>
              <Typography variant='body2' sx={{ opacity: 0.85, lineHeight: 1.7 }}>
                {config.message}
              </Typography>
              {/* Trust card - the "why" behind the ask, highlighted */}
              <Stack
                direction='row'
                spacing={1.25}
                sx={{
                  alignItems: 'flex-start',
                  bgcolor: ALPHA_WHITE_15,
                  border: `1px solid ${ALPHA_WHITE_30}`,
                  borderRadius: '14px',
                  px: 2,
                  py: 1.5,
                }}
              >
                <VerifiedUserOutlined sx={{ fontSize: 20, flexShrink: 0, mt: '1px' }} />
                <Typography variant='caption' sx={{ lineHeight: 1.6, fontWeight: 700, fontSize: '0.76rem' }}>
                  {TRUST_LINE}
                </Typography>
              </Stack>
              {context === 'promo' && pendingCode && (
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    alignSelf: 'flex-start',
                    gap: 1,
                    px: 2,
                    py: 0.75,
                    borderRadius: 2,
                    bgcolor: ALPHA_WHITE_15,
                    border: `1px solid ${ALPHA_WHITE_30}`,
                  }}
                >
                  <ConfirmationNumber sx={{ fontSize: 16, color: 'white' }} />
                  <Typography sx={{ fontFamily: 'monospace', fontWeight: 900, letterSpacing: 2, fontSize: '0.9rem' }}>
                    {pendingCode}
                  </Typography>
                </Box>
              )}
            </Stack>
          </motion.div>
        </Box>

        {/* Right: form */}
        <Box sx={{ flex: 1, p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {formContent}
        </Box>
      </Box>
    </Dialog>
  );
};

export default PhoneVerifySheet;
