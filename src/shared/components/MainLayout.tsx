import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { ConfirmationNumber, Storefront } from '@mui/icons-material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import AppMenuDrawer from './AppMenuDrawer';
import AppHeader from './AppHeader';
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

  return (
    <Box
      sx={{
        width: '100dvw',
        minHeight: '100vh',
        bgcolor: 'background.default',
        background: BG_APP_GRADIENT,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {location.pathname !== '/nearby' && (
        <AppHeader onMenuOpen={() => setMenuOpen(true)} />
      )}

      <AppMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      <Box
        component='main'
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          // Proper top offset instead of negative margin hack
          pt: location.pathname !== '/nearby' ? '68px' : 0,
          pb: '20px', // room for fixed bottom nav
          width: '100%',
        }}
      >
        <Outlet />
      </Box>

      {/* Bottom Nav */}
      <Paper
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}
        elevation={8}
      >
        <BottomNavigation
          showLabels
          value={location.pathname}
          onChange={(_, newValue) => navigate(newValue)}
          sx={{ height: 45 }}
        >
          <BottomNavigationAction
            value='/nearby'
            icon={<Storefront />}
            sx={{ '& .MuiBottomNavigationAction-label': { fontWeight: 700, fontSize: '0.7rem' } }}
          />

          {/* Elevated center QR tab */}
          <BottomNavigationAction
            value='/'
            icon={
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: location.pathname === '/' ? GRADIENT_PRIMARY : NEUTRAL_INACTIVE_BG,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mt: '-22px',
                  boxShadow: location.pathname === '/' ? SHADOW_PRIMARY_INTENSE : SHADOW_NEUTRAL_SOFT,
                  border: '3px solid white',
                  transition: 'background 0.2s, box-shadow 0.2s',
                }}
              >
                <QrCodeIcon sx={{ color: location.pathname === '/' ? 'white' : NEUTRAL_INACTIVE_ICON, fontSize: 26 }} />
              </Box>
            }
            sx={{
              '& .MuiBottomNavigationAction-label': { fontWeight: 700, fontSize: '0.7rem', mt: '4px' },
            }}
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
