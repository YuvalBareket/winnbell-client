import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { ConfirmationNumber, Storefront } from '@mui/icons-material';
import { AnimatePresence, motion } from 'framer-motion';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AppMenuDrawer from './AppMenuDrawer';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import { useAppSelector } from '../../store/hook';
import { selectIsBusiness, selectIsAdmin, selectIsLocationManager } from '../../store/selectors/authSelectors';
import {
  BG_APP_GRADIENT,
  GRADIENT_PRIMARY,
  NEUTRAL_INACTIVE_BG,
  NEUTRAL_INACTIVE_ICON,
  SHADOW_NEUTRAL_SOFT,
  SHADOW_BOTTOM_NAV,
  SHADOW_PRIMARY_GLOW,
} from '../colors';

const SIDEBAR_WIDTH = 260;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const isBusinessAdmin = useAppSelector(selectIsBusiness);
  const isManager = useAppSelector(selectIsLocationManager);
  const isAdmin = useAppSelector(selectIsAdmin);
  const isBusinessOrManager = isBusinessAdmin || isManager;
  // Business/manager users use /activity as their mobile home; regular users use /scan
  const mobileMainPath = isBusinessOrManager ? '/activity' : '/scan';
  const isNearby = location.pathname === '/nearby';
  const isActivity = location.pathname === '/activity';
  const topPadding = { xs: 0, md: 0 };
  const scanActive = location.pathname === mobileMainPath;

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100dvh',
        bgcolor: 'background.default',
        background: BG_APP_GRADIENT,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Desktop persistent sidebar */}
      <AppSidebar />

      {/* Mobile header - hidden on desktop, hidden on pages with their own hero */}
      {!isNearby && !isActivity && <AppHeader onMenuOpen={() => setMenuOpen(true)} />}

      {/* Mobile drawer */}
      <AppMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      <Box
        component='main'
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          pt: topPadding,
          pb: { xs: '76px', md: isNearby ? 0 : 4 },
          ml: { xs: 0, md: `${SIDEBAR_WIDTH}px` },
          width: { xs: '100%', md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
          transition: 'margin 0.3s ease',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Mobile bottom nav - hidden on desktop, hidden for admin */}
      {!isAdmin && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            display: { xs: 'block', md: 'none' },
            overflow: 'visible',
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            boxShadow: SHADOW_BOTTOM_NAV,
          }}
          elevation={0}
        >
          <BottomNavigation
            value={location.pathname}
            onChange={(_, newValue) => navigate(newValue)}
            sx={{
              height: 60,
              bgcolor: 'transparent',
              '& .MuiBottomNavigationAction-root': {
                color: 'text.secondary',
                transition: 'color 180ms ease-out',
                minWidth: 64,
                '&.Mui-selected': {
                  color: 'primary.main',
                },
                '& .MuiBottomNavigationAction-label': {
                  fontWeight: 600,
                  fontSize: '0.68rem',
                  mt: 0.3,
                  '&.Mui-selected': {
                    fontWeight: 800,
                    fontSize: '0.7rem',
                  },
                },
              },
            }}
          >
            <BottomNavigationAction
              value='/nearby'
              icon={<Storefront />}
            />

            <BottomNavigationAction
              value={mobileMainPath}
              icon={
                <Box
                  sx={{
                    width: 56, height: 56,
                    borderRadius: '50%',
                    background: scanActive ? GRADIENT_PRIMARY : NEUTRAL_INACTIVE_BG,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mt: '-24px',
                    boxShadow: scanActive ? SHADOW_PRIMARY_GLOW : SHADOW_NEUTRAL_SOFT,
                    border: '4px solid white',
                    transition: 'background 220ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 220ms cubic-bezier(0.4, 0, 0.2, 1), transform 220ms cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: scanActive ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  <ReceiptLongIcon sx={{
                    color: scanActive ? 'white' : NEUTRAL_INACTIVE_ICON,
                    fontSize: 26,
                    transition: 'color 0.2s ease',
                  }} />
                </Box>
              }
            />

            <BottomNavigationAction
              value='/tickets'
              icon={<ConfirmationNumber />}
            />
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
};

export default MainLayout;
