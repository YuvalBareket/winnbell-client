import { useEffect, useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Stack, 
  Paper, 
  CircularProgress 
} from '@mui/material';
import { 
  Login, 
  PersonAdd, 
  CheckCircle, 
  ConfirmationNumber, 
  ErrorOutline 
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector } from '../../../store/hook';
import { selectIsAuthenticated } from '../../../store/selectors/authSelectors';
import { useSyncStatus } from '../../../shared/context/SyncStatusContext';
import { 
  GRADIENT_HERO, 
  ALPHA_WHITE_15, 
  ALPHA_WHITE_30, 
  PRIMARY_MAIN 
} from '../../../shared/colors';

const PENDING_CODE_KEY = 'pendingTicketCode';

const PublicActivatePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { isLoaded } = useSyncStatus();

  // Local loading state to prevent the "Login UI Flash" while Redux initializes
  const [isChecking, setIsChecking] = useState(true);

  const code = searchParams.get('code')?.trim().toUpperCase() ?? null;
  const isPromo = code?.startsWith('PROMO') ?? false;
  useEffect(() => {
    // 1. If we have a code, save it immediately
    if (code) {
      localStorage.setItem(PENDING_CODE_KEY, code);
    }

    // 2. Wait for Redux/Supabase sync to settle before checking auth state
    if (!isLoaded) return;

    if (code && isAuthenticated) {
      navigate('/scan', { replace: true });
    } else {
      setIsChecking(false);
    }
  }, [code, isAuthenticated, isLoaded, navigate]);

  // ─── 1. Loading State (Prevents Jumping) ──────────────────────────────────
  if (isChecking && code) {
    return (
      <Box sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f8fafc'
      }}>
        <CircularProgress size={40} sx={{ mb: 2, color: PRIMARY_MAIN }} />
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          Securing your entry...
        </Typography>
      </Box>
    );
  }

  // ─── 2. No code in URL ───────────────────────────────────────────────────────
  if (!code) {
    return (
      <Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', px: 3 }}>
        <Paper elevation={0} sx={{ maxWidth: 400, width: '100%', borderRadius: 2, border: '1px solid', borderColor: 'divider', p: 4, textAlign: 'center' }}>
          <ErrorOutline sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant='h6' fontWeight={800} mb={1}>Invalid Link</Typography>
          <Typography variant='body2' color='text.secondary'>
            This link doesn't contain a valid entry code. Please scan the QR code on your receipt again.
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 3 }}
            onClick={() => navigate('/')}
          >
            Go Home
          </Button>
        </Paper>
      </Box>
    );
  }

  // ─── 3. Unauthenticated View (User is NOT logged in) ───────────────────────
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', px: 3 }}>
      <Box
        component="img"
        src="/winnbell_app_name.png"
        alt="Winnbell"
        sx={{ height: 36, mb: 3, objectFit: 'contain' }}
      />
      <Paper elevation={0} sx={{ maxWidth: 400, width: '100%', borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>

        <Box sx={{ background: GRADIENT_HERO, p: 3.5, textAlign: 'center', color: 'white' }}>
          <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: ALPHA_WHITE_15, border: `2px solid ${ALPHA_WHITE_30}`, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <CheckCircle sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant='h6' fontWeight={800}>{isPromo ? 'Promotional Entry!' : 'Entry Scanned!'}</Typography>
          <Typography variant='body2' sx={{ opacity: 0.8, mt: 0.5 }}>{isPromo ? 'Sign in to claim your free campaign entry' : 'Sign in to activate your entry'}</Typography>
        </Box>

        <Box sx={{ px: 3, pt: 3, pb: 3, textAlign: 'center' }}>
          <Typography variant='caption' fontWeight={700} color='text.secondary' sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
            {isPromo ? 'Promo Code' : 'Your entry code'}
          </Typography>

          <Box sx={{ mt: 1, mb: 2.5,ml:0.5, display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: `${PRIMARY_MAIN}10`, border: `1px solid ${PRIMARY_MAIN}30`, borderRadius: 2, px: 2.5, py: 1 }}>
            <ConfirmationNumber sx={{ fontSize: 16, color: PRIMARY_MAIN }} />
            <Typography variant='h6' fontWeight={900} sx={{ fontFamily: 'monospace', color: PRIMARY_MAIN, letterSpacing: 3 }}>
              {code}
            </Typography>
          </Box>

          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 2.5, textAlign: 'center', lineHeight: 1.5 }}>
            Winnbell is a local campaign where every purchase earns you entries and one lucky winner takes the prize.
          </Typography>

          <Typography variant='body2' color='text.secondary' sx={{ mb: 3, lineHeight: 1.6 }}>
            {isPromo
              ? "Create a free account or sign in. We'll enter you into the current campaign automatically."
              : "Create a free account or sign in. We'll activate your entry automatically as soon as you're in."}
          </Typography>

          <Stack spacing={1.5}>
            <Box>
              <Button
                variant='contained'
                size='large'
                fullWidth
                startIcon={<PersonAdd />}
                onClick={() => navigate('/register/user')}
                sx={{ fontWeight: 800, py: 1.5 }}
              >
                Create Free Account
              </Button>
              <Typography variant='caption' color='text.disabled' sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                100% free. No credit card needed.
              </Typography>
            </Box>
            <Button
              variant='outlined'
              size='large'
              fullWidth
              startIcon={<Login />}
              onClick={() => navigate('/login')}
              sx={{ fontWeight: 700, py: 1.5 }}
            >
              Sign In
            </Button>
          </Stack>

          <Typography variant='caption' color='text.disabled' sx={{ display: 'block', mt: 2 }}>
            {isPromo
              ? 'Your promo code is saved. We\'ll enter you into the campaign the moment you sign in.'
              : 'Your entry code is saved. It will activate the moment you sign in.'}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default PublicActivatePage;