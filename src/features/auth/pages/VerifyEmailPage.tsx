import React, { useState } from 'react';
import {
  Box, Button, Typography, TextField, Container, Stack, Alert, CircularProgress, Paper,
} from '@mui/material';
import { ConfirmationNumber, MarkEmailRead } from '@mui/icons-material';
import { BG_PAGE } from '../../../shared/colors';
import { useSignUp } from '@clerk/clerk-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const VerifyEmailPage = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const inviteToken = searchParams.get('token');
  const role = searchParams.get('role');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!isLoaded || !code) return;
    setLoading(true);
    setError('');

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === 'complete') {
        if (role) sessionStorage.setItem('pendingRole', role);
        if (inviteToken) sessionStorage.setItem('pendingInviteToken', inviteToken);
        await setActive({ session: result.createdSessionId });
        navigate('/scan');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Verification failed. Check your code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', bgcolor: BG_PAGE }}>
      <Container maxWidth='xs'>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Paper elevation={4} sx={{
              width: 80, height: 80, bgcolor: 'primary.main', borderRadius: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3,
            }}>
            <MarkEmailRead sx={{ color: 'white', fontSize: 40 }} />
          </Paper>
          <Typography variant='h4' sx={{ fontWeight: 700, mb: 1 }}>Check your email</Typography>
          <Typography variant='body1' color='text.secondary' textAlign='center'>
            We sent a verification code to your email address.
          </Typography>
        </Box>

        {error && <Alert severity='error' sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

        <Stack spacing={3}>
          <TextField
            fullWidth
            label='Verification code'
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputProps={{ maxLength: 6, style: { letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.5rem' } }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'background.paper' } }}
          />
          <Button variant='contained' size='large' onClick={handleVerify} disabled={loading || code.length < 6}
            sx={{ py: 2, borderRadius: 3, fontWeight: 700 }}>
            {loading ? <CircularProgress size={24} color='inherit' /> : 'Verify Email'}
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default VerifyEmailPage;
