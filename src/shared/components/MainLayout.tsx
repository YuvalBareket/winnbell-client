import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, Paper, BottomNavigation, BottomNavigationAction, Button, Typography, Stack } from '@mui/material';
import { ConfirmationNumber, Storefront, Warning, CreditCard } from '@mui/icons-material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import AppMenuDrawer from './AppMenuDrawer';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import { useAppSelector } from '../../store/hook';
import { selectIsBusiness, selectBusinessIsActive, selectIsAdmin } from '../../store/selectors/authSelectors';
import {
  BG_APP_GRADIENT,
  GRADIENT_PRIMARY,
  NEUTRAL_INACTIVE_BG,
  NEUTRAL_INACTIVE_ICON,
  SHADOW_PRIMARY_INTENSE,
  SHADOW_NEUTRAL_SOFT,
} from '../colors';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const isBusinessAdmin = useAppSelector(selectIsBusiness);
  const isAdmin = useAppSelector(selectIsAdmin);
  const businessIsActive = useAppSelector(selectBusinessIsActive);
  const showSubscribeBanner = isBusinessAdmin && !businessIsActive;

  const isNearby = location.pathname === '/nearby';
  const topPadding = { xs: isNearby ? 0 : '68px', md: 0 };

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        bgcolor: 'background.default',
        background: BG_APP_GRADIENT,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Desktop persistent sidebar */}
      <AppSidebar />

      {/* Mobile header — hidden on desktop */}
      {!isNearby && <AppHeader onMenuOpen={() => setMenuOpen(true)} />}

      {/* Mobile drawer */}
      <AppMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      <Box
        component='main'
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          pt: topPadding,
          pb: { xs: '70px', md: isNearby ? 0 : 4 },
          ml: { xs: 0, md: '240px' },
          width: { xs: '100%', md: 'calc(100% - 240px)' },
        }}
      >
        {showSubscribeBanner && (
          <Box
            sx={{
              mx: { xs: 2, md: 3 },
              mt: { xs: 1, md: 2 },
              mb: 1,
              p: 1.5,
              borderRadius: 3,
              bgcolor: 'rgba(237,108,2,0.08)',
              border: '1px solid',
              borderColor: 'warning.light',
              display: { xs: 'flex', md: 'none' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
              flexWrap: 'wrap',
            }}
          >
            <Stack direction='row' alignItems='center' spacing={1} flex={1} minWidth={0}>
              <Warning sx={{ color: 'warning.main', fontSize: 20, flexShrink: 0 }} />
              <Typography variant='body2' fontWeight={600} color='warning.dark' noWrap>
                Your business is not live yet. Subscribe to appear on the map
              </Typography>
            </Stack>
            <Button
              size='small'
              variant='contained'
              startIcon={<CreditCard sx={{ fontSize: '16px !important' }} />}
              onClick={() => navigate('/subscribe')}
              sx={{ bgcolor: 'warning.main', '&:hover': { bgcolor: 'warning.dark' }, borderRadius: 2, fontWeight: 800, flexShrink: 0, fontSize: '0.75rem' }}
            >
              Subscribe
            </Button>
          </Box>
        )}
        <Outlet />
      </Box>

      {/* Mobile bottom nav — hidden on desktop, hidden for admin */}
      {!isAdmin && <Paper
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000, display: { xs: 'block', md: 'none' }, overflow: 'visible' }}
        elevation={8}
      >
        <BottomNavigation
          showLabels
          value={location.pathname}
          onChange={(_, newValue) => navigate(newValue)}
          sx={{ height: 60 }}
        >
          <BottomNavigationAction
            value='/nearby'
            icon={<Storefront />}
            sx={{ '& .MuiBottomNavigationAction-label': { fontWeight: 700, fontSize: '0.7rem' } }}
          />

          <BottomNavigationAction
            value='/scan'
            icon={
              <Box
                sx={{
                  width: 52, height: 52,
                  borderRadius: '50%',
                  background: location.pathname === '/scan' ? GRADIENT_PRIMARY : NEUTRAL_INACTIVE_BG,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  mt: '-22px',
                  boxShadow: location.pathname === '/scan' ? SHADOW_PRIMARY_INTENSE : SHADOW_NEUTRAL_SOFT,
                  border: '3px solid white',
                  transition: 'background 0.2s, box-shadow 0.2s',
                }}
              >
                <QrCodeIcon sx={{ color: location.pathname === '/scan' ? 'white' : NEUTRAL_INACTIVE_ICON, fontSize: 26 }} />
              </Box>
            }
            sx={{ '& .MuiBottomNavigationAction-label': { fontWeight: 700, fontSize: '0.7rem', mt: '4px' } }}
          />

          <BottomNavigationAction
            value='/tickets'
            icon={<ConfirmationNumber />}
            sx={{ '& .MuiBottomNavigationAction-label': { fontWeight: 700, fontSize: '0.7rem' } }}
          />
        </BottomNavigation>
      </Paper>}
    </Box>
  );
};

export default MainLayout;
