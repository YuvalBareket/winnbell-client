import { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Stack, CircularProgress } from '@mui/material';
import { CheckCircle, Storefront } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../../../store/hook';
import { setBusinessActive } from '../../../store/slices/authSlice';
import { api } from '../../../shared/api/client';

const SubscriptionSuccessPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setVerifying(false);
      return;
    }

    api.post('/business/subscription/verify-session', { sessionId })
      .then(() => {
        dispatch(setBusinessActive());
      })
      .catch((err) => {
        console.error('Verify session error:', err);
        setError('Could not confirm your subscription. Please contact support if the issue persists.');
      })
      .finally(() => setVerifying(false));
  }, []);

  if (verifying) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack alignItems='center' spacing={2}>
          <CircularProgress />
          <Typography color='text.secondary' fontWeight={600}>Activating your business...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 3 }}>
      <Paper elevation={0} sx={{ p: 5, borderRadius: 4, border: '1px solid', borderColor: 'divider', textAlign: 'center', maxWidth: 420, width: '100%' }}>
        <Stack spacing={3} alignItems='center'>
          <CheckCircle sx={{ fontSize: 72, color: 'success.main' }} />

          <Box>
            <Typography variant='h4' fontWeight={900} mb={1}>You're live!</Typography>
            <Typography variant='body1' color='text.secondary' lineHeight={1.7}>
              Your subscription is active and your business is now visible on the Winnbell map.
            </Typography>
            {error && (
              <Typography variant='body2' color='error' sx={{ mt: 1 }}>{error}</Typography>
            )}
          </Box>

          <Button
            variant='contained'
            size='large'
            startIcon={<Storefront />}
            onClick={() => navigate('/scan')}
            sx={{ py: 1.75, px: 4, borderRadius: 3, fontWeight: 800 }}
          >
            Go to Dashboard
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default SubscriptionSuccessPage;
