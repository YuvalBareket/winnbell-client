import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
} from '@mui/material';
import { ConfirmationNumber, Storefront } from '@mui/icons-material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import AppMenuDrawer from './AppMenuDrawer';
import AppHeader from './AppHeader';

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
        background: `linear-gradient(to bottom right, #e0f0ff, #ffffff, #f0f7ff)`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >

      {location.pathname !== '/nearby' && (
        <AppHeader onMenuOpen={() => setMenuOpen(true)} />
      )}

      <AppMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* This is where the child page (Redeem, Nearby, Tickets) renders */}
      <Box
        component='main'
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          mt: '-10px', // offset for fixed AppBar height
          pb: 4,
          width: '100%',
        }}
      >
        <Outlet />
      </Box>

      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={location.pathname}
          onChange={(_, newValue) => navigate(newValue)}
        >
          <BottomNavigationAction value='/nearby' icon={<Storefront />} />
          <BottomNavigationAction value='/' icon={<QrCodeIcon />} />
          <BottomNavigationAction
            value='/tickets'
            icon={<ConfirmationNumber />}
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default MainLayout;
