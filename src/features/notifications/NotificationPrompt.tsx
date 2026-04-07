import { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, IconButton } from '@mui/material';
import { NotificationsActive, Close } from '@mui/icons-material';
import { useNotifications } from './useNotifications';
import { useAppSelector } from '../../store/hook';
import { selectIsAuthenticated } from '../../store/selectors/authSelectors';

const DISMISSED_KEY = 'notif_prompt_dismissed';

const NotificationPrompt = () => {
  const { subscribe, isPending: isSubscribing, isSupported, permission } = useNotifications();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [dismissed, setDismissed] = useState(() => !!localStorage.getItem(DISMISSED_KEY));

  useEffect(() => {
    if (permission === 'granted') {
      localStorage.setItem(DISMISSED_KEY, '1');
      setDismissed(true);
    }
  }, [permission]);

  if (!isSupported || !isAuthenticated || dismissed || permission === 'granted' || permission === 'denied') {
    return null;
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  };

  const handleEnable = async () => {
    try {
      await subscribe();
    } catch {
      // permission denied — dismissed via useEffect
      handleDismiss();
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'fixed',
        bottom: 80,
        left: 12,
        right: 12,
        zIndex: 1300,
        borderRadius: 3,
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        border: '1px solid',
        borderColor: 'primary.main',
        bgcolor: 'background.paper',
        boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
        maxWidth: 480,
        mx: 'auto',
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          bgcolor: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <NotificationsActive sx={{ color: 'white', fontSize: 22 }} />
      </Box>

      <Box flex={1} minWidth={0}>
        <Typography variant='body2' fontWeight={700} sx={{ lineHeight: 1.2 }}>
          Stay in the loop
        </Typography>
        <Typography variant='caption' color='text.secondary'>
          Get notified when draws open and results are announced.
        </Typography>
      </Box>

      <Button
        size='small'
        variant='contained'
        onClick={handleEnable}
        disabled={isSubscribing}
        sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none', flexShrink: 0 }}
      >
        Enable
      </Button>

      <IconButton size='small' onClick={handleDismiss} sx={{ flexShrink: 0 }}>
        <Close fontSize='small' />
      </IconButton>
    </Paper>
  );
};

export default NotificationPrompt;
