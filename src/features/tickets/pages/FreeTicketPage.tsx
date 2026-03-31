import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LockIcon from '@mui/icons-material/Lock';
import BoltIcon from '@mui/icons-material/Bolt';
import { useNavigate } from 'react-router-dom';
import { useFreeTicket } from '../hooks/useFreeTicket';
import { AMBER_HOURGLASS, SHADOW_PRIMARY_MEDIUM } from '../../../shared/colors';

const getNextSunday = (): Date => {
  const now = new Date();
  const daysUntilSunday = 7 - now.getDay(); // always 1–7 days ahead
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilSunday);
  next.setHours(0, 0, 0, 0);
  return next;
};

const formatNextDate = (dateStr: string | undefined): string => {
  const date = dateStr ? new Date(dateStr) : getNextSunday();
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

const FreeTicketPage: React.FC = () => {
  const navigate = useNavigate();
  const { status, activate, isActivating, isLoading } = useFreeTicket();
  const [successOpen, setSuccessOpen] = useState(false);

  const handleCloseSnackbar = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') return;
    setSuccessOpen(false);
  };

  const handleActivateClick = () => {
    activate(undefined, {
      onSuccess: () => setSuccessOpen(true),
    });
  };

  if (isLoading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh'>
        <CircularProgress color='primary' />
      </Box>
    );
  }

  const canActivate = status?.canActivate;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxWidth: '480px',
        mx: 'auto',
        pt: 1,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 2 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: 'text.primary', width: 44, height: 44 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant='h6' sx={{ flex: 1, textAlign: 'center', fontWeight: 700, pr: 5 }}>
          Weekly Free Ticket
        </Typography>
      </Box>

      {/* Main content — flex:1 pushes footer down naturally */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
          pt: 3,
          textAlign: 'center',
        }}
      >
        {/* Icon */}
        <Box sx={{ position: 'relative', mb: 4 }}>
          <Box
            sx={{
              display: 'flex',
              p: 3,
              borderRadius: '50%',
              bgcolor: canActivate ? 'primary.main' : 'action.hover',
              color: canActivate ? 'white' : 'text.disabled',
              transition: 'background 0.3s',
            }}
          >
            <ConfirmationNumberIcon sx={{ fontSize: 60 }} />
          </Box>
          {!canActivate && (
            <Box
              sx={{
                position: 'absolute',
                bottom: -4,
                right: -4,
                bgcolor: 'background.paper',
                p: 0.5,
                borderRadius: '50%',
                display: 'flex',
              }}
            >
              <CalendarMonthIcon sx={{ color: AMBER_HOURGLASS }} />
            </Box>
          )}
        </Box>

        {/* Status / Next date */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant='caption'
            sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 1.5 }}
          >
            {canActivate ? 'Ticket Status' : 'Next Available'}
          </Typography>
          {canActivate ? (
            <Typography
              variant='h2'
              sx={{ fontWeight: 900, color: 'success.main', fontFamily: 'monospace', mt: 1, fontSize: { xs: '2.5rem', sm: '3.75rem' } }}
            >
              READY
            </Typography>
          ) : (
            <Typography
              variant='h5'
              sx={{ fontWeight: 800, color: 'primary.main', mt: 1 }}
            >
              {formatNextDate(status?.nextAvailableDate)}
            </Typography>
          )}
        </Box>

        {/* Description */}
        <Box sx={{ maxWidth: '320px' }}>
          <Typography variant='h5' sx={{ fontWeight: 700, mb: 1.5 }}>
            {canActivate ? 'Your Ticket is Waiting!' : 'Entry Request Pending'}
          </Typography>
          <Typography variant='body1' color='text.secondary' sx={{ lineHeight: 1.6 }}>
            Winnbell gives you one free ticket every week, from Sunday to Sunday.
            {canActivate
              ? ' Click below to claim your ticket and join the draw!'
              : ' Your next free ticket will be available on Sunday.'}
          </Typography>
        </Box>
      </Box>

      {/* Footer — in normal flow, pushed to bottom by flex:1 above */}
      <Box sx={{ p: 3, pb: 4 }}>
        <Button
          fullWidth
          variant='contained'
          size='large'
          disabled={!canActivate || isActivating}
          onClick={handleActivateClick}
          endIcon={canActivate ? <BoltIcon /> : <LockIcon />}
          sx={{
            py: 2,
            borderRadius: 3,
            fontSize: '1.1rem',
            fontWeight: 700,
            textTransform: 'none',
            boxShadow: canActivate ? SHADOW_PRIMARY_MEDIUM : 'none',
          }}
        >
          {isActivating ? 'Claiming...' : 'Get Your Ticket'}
        </Button>
        <Typography
          variant='caption'
          sx={{ display: 'block', textAlign: 'center', mt: 2, color: 'text.secondary', fontWeight: 500 }}
        >
          One free ticket per week. Resets every Sunday.
        </Typography>
      </Box>

      <Snackbar open={successOpen} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity='success' variant='filled' sx={{ width: '100%' }}>
          Ticket activated successfully! Good luck in the draw.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FreeTicketPage;
