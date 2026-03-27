import { AppBar, Toolbar, Typography, IconButton, Box, Avatar, Chip } from '@mui/material';
import { NotificationsNoneOutlined, MenuRounded } from '@mui/icons-material';
import { useAppSelector } from '../../store/hook';
import { selectCurrentUser, selectIsBusiness, selectIsLocationManager } from '../../store/selectors/authSelectors';
import { PRIMARY_MAIN, GRADIENT_PRIMARY } from '../colors';

interface Props {
  onMenuOpen: () => void;
}

const AppHeader = ({ onMenuOpen }: Props) => {
  const user = useAppSelector(selectCurrentUser);
  const isBusiness = useAppSelector(selectIsBusiness);
  const isManager = useAppSelector(selectIsLocationManager);

  const roleLabel = isBusiness ? 'Partner' : isManager ? 'Manager' : null;
  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <AppBar
      position='fixed'
      elevation={0}
      sx={{
        bgcolor: 'transparent',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: 'none',
        zIndex: 1200,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 2, minHeight: '56px !important' }}>

        {/* Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '10px',
              background: GRADIENT_PRIMARY,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Typography sx={{ color: 'white', fontSize: 16, lineHeight: 1 }}>🔔</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0}}>
            <Typography
              fontWeight={800}
              sx={{ fontSize: '1.1rem', color: '#0e121b', letterSpacing: '-0.02em' }}
            >
              Winn
            </Typography>
            <Typography
              fontWeight={800}
              sx={{ fontSize: '1.1rem', color: PRIMARY_MAIN, letterSpacing: '-0.02em' }}
            >
              bell
            </Typography>
          </Box>
          {roleLabel && (
            <Chip
              label={roleLabel}
              size='small'
              sx={{
                height: 20,
                fontSize: '0.6rem',
                fontWeight: 800,
                bgcolor: 'rgba(25,93,230,0.08)',
                color: PRIMARY_MAIN,
                border: 'none',
                letterSpacing: 0.3,
              }}
            />
          )}
        </Box>

        {/* Right actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton
            size='small'
            sx={{
              color: 'text.secondary',
              bgcolor: 'rgba(0,0,0,0.04)',
              borderRadius: '10px',
              width: 36,
              height: 36,
              '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' },
            }}
          >
            <NotificationsNoneOutlined sx={{ fontSize: 20 }} />
          </IconButton>

          <IconButton
            onClick={onMenuOpen}
            size='small'
            sx={{
              p: 0,
              ml: 0.5,
              '&:hover': { bgcolor: 'transparent' },
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                background: GRADIENT_PRIMARY,
                color: 'white',
                fontWeight: 800,
                fontSize: 13,
                borderRadius: '10px',
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
