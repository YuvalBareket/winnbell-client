import { AppBar, Toolbar, Typography, IconButton, Box, Avatar, Chip, Stack } from '@mui/material';
import { NotificationsNoneOutlined, MenuRounded } from '@mui/icons-material';
import { useAppSelector } from '../../store/hook';
import { selectCurrentUser, selectIsBusiness, selectIsLocationManager } from '../../store/selectors/authSelectors';
import { PRIMARY_MAIN, GRADIENT_PRIMARY, TEXT_PRIMARY } from '../colors';
import { getUserInitials } from '../utils/string';

interface Props {
  onMenuOpen: () => void;
}

const AppHeader = ({ onMenuOpen }: Props) => {
  const user = useAppSelector(selectCurrentUser);
  const isBusiness = useAppSelector(selectIsBusiness);
  const isManager = useAppSelector(selectIsLocationManager);

  const initials = getUserInitials(user?.fullName);

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
        display: { xs: 'flex', md: 'none' },
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 2, minHeight: '56px !important' }}>

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
          <IconButton
            size='small'
            sx={{
              color: 'text.secondary',
              bgcolor: 'rgba(0,0,0,0.04)',
              borderRadius: '10px',
              width: { xs: 40, md: 36 },
              height: { xs: 40, md: 36 },
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
                width: { xs: 40, md: 36 },
                height: { xs: 40, md: 36 },
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
