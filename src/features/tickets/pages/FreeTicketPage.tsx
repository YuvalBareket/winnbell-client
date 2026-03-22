import React, { useState, useEffect } from 'react';
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
import ScheduleIcon from '@mui/icons-material/Schedule';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import LockIcon from '@mui/icons-material/Lock';
import BoltIcon from '@mui/icons-material/Bolt';
import { useNavigate } from 'react-router-dom';
import { useFreeTicket } from '../hooks/useFreeTicket';

const FreeTicketPage: React.FC = () => {
  const navigate = useNavigate();
  const primaryColor = '#137fec';
  const { status, activate, isActivating, isLoading } = useFreeTicket();
  const [timeLeft, setTimeLeft] = useState<string>('00:00:00');
  const [successOpen, setSuccessOpen] = useState(false);
  const handleCloseSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') return;
    setSuccessOpen(false);
  };

  const handleActivateClick = () => {
    activate(undefined, {
      onSuccess: () => {
        setSuccessOpen(true);
      },
    });
  };
  // Timer logic for the countdown
  useEffect(() => {
    if (status?.canActivate || !status?.nextAvailableDate) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(status.nextAvailableDate!).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft('00:00:00');
        clearInterval(timer);
        // Optional: Trigger a refetch of the status
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours =
          Math.floor((difference / (1000 * 60 * 60)) % 24) + days * 24;
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        const pad = (n: number) => n.toString().padStart(2, '0');
        setTimeLeft(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  if (isLoading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='100vh'
      >
        <CircularProgress sx={{ color: primaryColor }} />
      </Box>
    );
  }

  const canActivate = status?.canActivate;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%', // Fills the flex:1 container in MainLayout
        maxWidth: '480px',
        pt: 1,
      }}
    >
      {/* 1. Header (Fixed Height) */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 2 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: 'text.primary' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant='h6'
          sx={{ flex: 1, textAlign: 'center', fontWeight: 700, pr: 5 }}
        >
          Weekly Free Ticket
        </Typography>
      </Box>

      {/* 2. Main Content (This "Flex: 1" is the secret - it pushes the footer down) */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center', // Centers content vertically in the available space
          px: 3,
          pt: 3,
          textAlign: 'center',
        }}
      >
        {/* Visual Icon Section */}
        <Box sx={{ position: 'relative', mb: 4 }}>
          <Box
            sx={{
              display: 'flex',
              p: 3,
              borderRadius: '50%',
              bgcolor: 'action.hover',
              color: canActivate ? primaryColor : 'text.disabled',
            }}
          >
            <ScheduleIcon sx={{ fontSize: 60 }} />
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
              <HourglassTopIcon sx={{ color: '#f59e0b' }} />
            </Box>
          )}
        </Box>

        {/* Timer Section */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant='caption'
            sx={{
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'text.secondary',
              letterSpacing: 1.5,
            }}
          >
            {canActivate ? 'Ticket Status' : 'Available In'}
          </Typography>
          <Typography
            variant='h2'
            sx={{
              fontWeight: 900,
              color: canActivate ? '#10b981' : primaryColor,
              fontFamily: 'monospace',
              mt: 1,
            }}
          >
            {canActivate ? 'READY' : timeLeft}
          </Typography>
        </Box>

        {/* Text Section */}
        <Box sx={{ maxWidth: '320px' }}>
          <Typography variant='h5' sx={{ fontWeight: 700, mb: 1.5 }}>
            {canActivate ? 'Your Ticket is Waiting!' : 'Entry Request Pending'}
          </Typography>
          <Typography
            variant='body1'
            color='text.secondary'
            sx={{ lineHeight: 1.6 }}
          >
            Winnbell rewards you with one free ticket every week.
            {canActivate
              ? ' Click below to claim your ticket and join the draw!'
              : ' Come back when the timer hits zero to claim your ticket!'}
          </Typography>
        </Box>
      </Box>

      {/* 3. Footer Action (Sits at the bottom because content above is flex:1) */}
      <Box
        sx={{
          p: 3,
          position: 'absolute',
          bottom: '60px',
          left: '0px',
          width: '100%',
        }}
      >
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
            bgcolor: canActivate ? primaryColor : 'action.disabledBackground',
            boxShadow: canActivate
              ? `${primaryColor}4D 0px 10px 15px -3px`
              : 'none',
          }}
        >
          {isActivating ? 'Claiming...' : 'Get Your Ticket'}
        </Button>

        <Box
          sx={{
            mt: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography
            variant='caption'
            sx={{ color: 'text.secondary', fontWeight: 500 }}
          >
            You can claim a new free ticket every 7 days.
          </Typography>
        </Box>
      </Box>
      {/* Success Notification */}
      <Snackbar
        open={successOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity='success'
          variant='filled'
          sx={{ width: '100%' }}
        >
          Ticket activated successfully! Good luck in the draw.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FreeTicketPage;
