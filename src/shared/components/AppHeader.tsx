import { AppBar, Toolbar, Typography, IconButton, Box, Avatar, Stack, Tooltip, CircularProgress } from '@mui/material';
import { NotificationsNoneOutlined, NotificationsActiveOutlined } from '@mui/icons-material';
import { useAppSelector } from '../../store/hook';
import { selectCurrentUser } from '../../store/selectors/authSelectors';
import { GRADIENT_PRIMARY, TEXT_PRIMARY } from '../colors';
import { getUserInitials } from '../utils/string';
import { useNotifications } from '../../features/notifications/useNotifications';

interface Props {
  onMenuOpen: () => void;
}

const AppHeader = ({ onMenuOpen }: Props) => {
  const user = useAppSelector(selectCurrentUser);
  const initials = getUserInitials(user?.fullName);
  const { subscribe, unsubscribe, isPending, isSupported, isSubscribed, permission } = useNotifications();

  return (
    <AppBar
      position='static'
      elevation={0}
      sx={{
        bgcolor: 'transparent',
        boxShadow: 'none',
        display: { xs: 'flex', md: 'none' },
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 2.5, minHeight: '60px !important' }}>

        {/* Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Stack direction='row' alignItems='center' spacing={-1}>
            <Box component='img' src='/winnbell_logo.png' alt='W' sx={{ height: 28, width: 'auto', objectFit: 'contain' }} />
            <Typography sx={{ fontFamily: "'Damion', cursive", fontSize: '1.6rem', color: TEXT_PRIMARY, lineHeight: 1, mt: '4px' }}>
              innbell
            </Typography>
          </Stack>
        
        </Box>

        {/* Right actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {isSupported && (
            <Tooltip title={isSubscribed ? 'Turn off notifications' : 'Enable notifications'}>
              <IconButton
                size='small'
                onClick={() => isSubscribed ? unsubscribe() : subscribe()}
                disabled={isPending || permission === 'denied'}
                sx={{
                  color: isSubscribed ? 'primary.main' : 'text.secondary',
                  bgcolor: isSubscribed ? 'primary.main' + '18' : 'rgba(0,0,0,0.04)',
                  borderRadius: '10px',
                  width: { xs: 40, md: 36 },
                  height: { xs: 40, md: 36 },
                  '&:hover': { bgcolor: isSubscribed ? 'primary.main' + '28' : 'rgba(0,0,0,0.08)' },
                  '&:active': { transform: 'scale(0.93)', transition: 'transform 150ms ease-out' },
                }}
              >
                {isPending
                  ? <CircularProgress size={18} color='inherit' />
                  : isSubscribed
                    ? <NotificationsActiveOutlined sx={{ fontSize: 20 }} />
                    : <NotificationsNoneOutlined sx={{ fontSize: 20 }} />}
              </IconButton>
            </Tooltip>
          )}

          <IconButton
            onClick={onMenuOpen}
            size='small'
            sx={{
              p: 0,
              ml: 0.5,
              '&:hover': { bgcolor: 'transparent' },
              '&:active': { transform: 'scale(0.93)', transition: 'transform 150ms ease-out' },
            }}
          >
            <Avatar
              sx={{
                width: { xs: 40, md: 36 },
                height: { xs: 40, md: 36 },
                background: GRADIENT_PRIMARY,
                color: 'white',
                fontWeight: 800,
                fontSize: 13,
                borderRadius: '12px',
              }}
            >
              {initials}
            </Avatar>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
