import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Alert, CircularProgress,
  InputAdornment, IconButton, Container,
} from '@mui/material';
import LoadingScreen from '../../../shared/components/LoadingScreen';
import { Lock, Visibility, VisibilityOff, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../shared/lib/supabase';
import { BG_PAGE } from '../../../shared/colors';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY event when the user lands here from the reset link.
    // We just need to confirm a session exists before showing the form.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setReady(true);
      }
    });

    // Also check if session already exists (user may have landed with token already processed)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    // If nothing happens within 10s, redirect to login
    const timeout = setTimeout(() => {
      if (!ready) navigate('/login?error=session', { replace: true });
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate, ready]);

  const handleSubmit = async () => {
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message || 'Failed to update password.');
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    }
  };

  if (!ready) {
    return <LoadingScreen />;
  }

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: BG_PAGE, p: 2 }}>
      <Container maxWidth='xs'>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          {success ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <CheckCircle color='success' sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant='h6' fontWeight={700} gutterBottom>Password Updated</Typography>
              <Typography variant='body2' color='text.secondary'>
                Redirecting you to the login page...
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant='h5' fontWeight={800} sx={{ mb: 0.5 }}>Set New Password</Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                Enter your new password below.
              </Typography>

              {error && <Alert severity='error' sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

              <TextField
                fullWidth
                label='New Password'
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: <InputAdornment position='start'><Lock sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton size='small' onClick={() => setShow(!show)}>
                        {show ? <VisibilityOff fontSize='small' /> : <Visibility fontSize='small' />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label='Confirm Password'
                type={show ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: <InputAdornment position='start'><Lock sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment>,
                }}
              />

              <Button
                fullWidth
                variant='contained'
                size='large'
                onClick={handleSubmit}
                disabled={loading}
                sx={{ fontWeight: 700, py: 1.5 }}
              >
                {loading ? <CircularProgress size={22} color='inherit' /> : 'Update Password'}
              </Button>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default ResetPasswordPage;
