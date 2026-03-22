import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
} from '@mui/material';
import { ConfirmationNumber, Storefront } from '@mui/icons-material';
import QrCodeIcon from '@mui/icons-material/QrCode';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
      {/* This is where the child page (Redeem, Nearby, Tickets) renders */}
      <Box
        component='main'
        sx={{
          flex: 1, // Take all available height
          display: 'flex', // MAKE THIS A FLEXBOX
          flexDirection: 'column',
          pb: 7, // Space for the bottom nav
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
