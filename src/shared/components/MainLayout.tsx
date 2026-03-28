import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { ConfirmationNumber, Storefront } from '@mui/icons-material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import AppMenuDrawer from './AppMenuDrawer';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
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
          pb: { xs: '70px', md: 4 },
          ml: { xs: 0, md: '268px' },
          width: { xs: '100%', md: 'calc(100% - 268px)' },
          zoom: { xs: 1, md: 0.9 },
        }}
      >
        <Outlet />
      </Box>

      {/* Mobile bottom nav — hidden on desktop */}
      <Paper
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
      </Paper>
    </Box>
  );
};

export default MainLayout;
