import { useState, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { ConfirmationNumber, Storefront } from '@mui/icons-material';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AppMenuDrawer from './AppMenuDrawer';
import AppSidebar from './AppSidebar';
import { InstallPromptProvider } from '../../features/install/InstallPrompt';
import { MenuDrawerContext, useMenuDrawer } from '../context/MenuDrawerContext';
import { useTap } from '../hooks/useTap';
import { useAppSelector } from '../../store/hook';
import { selectIsBusiness, selectIsAdmin, selectIsLocationManager } from '../../store/selectors/authSelectors';
import {
  BG_SUBTLE,
  GLASS_BACKDROP,
  GLASS_BG,
  GRADIENT_PRIMARY,
  NEUTRAL_INACTIVE_BG,
  NEUTRAL_INACTIVE_ICON,
  SHADOW_NEUTRAL_SOFT,
  SHADOW_BOTTOM_NAV,
  SHADOW_PRIMARY_GLOW,
} from '../colors';

const SIDEBAR_WIDTH = 260;

// Inner shell: consumes the menu-drawer context so a single AppMenuDrawer is mounted for the
// whole app. Every AppPageHero opens it via useMenuDrawer().openMenu().
const LayoutShell = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, closeMenu } = useMenuDrawer();
  const isBusinessAdmin = useAppSelector(selectIsBusiness);
  const isManager = useAppSelector(selectIsLocationManager);
  const isAdmin = useAppSelector(selectIsAdmin);
  const isBusinessOrManager = isBusinessAdmin || isManager;
  // Business/manager users use /campaign as their mobile home; regular users use /scan.
  const mobileMainPath = isBusinessOrManager ? '/campaign' : '/scan';
  const isNearby = location.pathname === '/nearby';
  const scanActive = location.pathname === mobileMainPath;

  // First tab: consumer map / owner Business Hub live on /nearby; managers have no
  // Business Hub, so their first tab is the Marketing page instead.
  const firstTabPath = isManager ? '/marketing' : '/nearby';

  // Reliable bottom-nav taps: the native click is cancelled by tiny finger movement on
  // mobile, so we navigate on pointer-up instead (see useTap).
  const tapNearby = useTap(() => navigate(firstTabPath));
  const tapMain = useTap(() => navigate(mobileMainPath));
  const thirdNavPath = isBusinessOrManager ? '/stats' : '/tickets';
  const tapThird = useTap(() => navigate(thirdNavPath));

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: 'var(--dvh100, 100dvh)',
        // Single flat app background (matches the design handoff) instead of the blue gradient.
        bgcolor: BG_SUBTLE,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Desktop persistent sidebar (gradient) */}
      <AppSidebar />

      {/* Single app menu drawer, opened by any AppPageHero via context */}
      <AppMenuDrawer open={isOpen} onClose={closeMenu} />

      <Box
        component='main'
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          pb: { xs: isNearby ? 0 : '76px', md: isNearby ? 0 : 4 },
          ml: { xs: 0, md: `${SIDEBAR_WIDTH}px` },
          width: { xs: '100%', md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
        }}
      >
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Outlet />
        </Box>
      </Box>

      {/* Mobile bottom nav - hidden on desktop and for admin */}
      {!isAdmin && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0, left: 0, right: 0,
            zIndex: 1000,
            display: { xs: 'block', md: 'none' },
            overflow: 'visible',
            // Floating chrome is a translucent material: page content scrolls
            // underneath the blur instead of dying at an opaque strip.
            bgcolor: 'background.paper',
            '@supports (backdrop-filter: blur(1px))': {
              bgcolor: GLASS_BG,
              backdropFilter: GLASS_BACKDROP,
            },
            '@media (prefers-reduced-transparency: reduce)': {
              bgcolor: 'background.paper',
              backdropFilter: 'none',
            },
            borderTop: '1px solid',
            borderColor: 'divider',
            boxShadow: SHADOW_BOTTOM_NAV,
          }}
          elevation={0}
        >
          <BottomNavigation
            value={location.pathname}
            sx={{
              height: 60,
              bgcolor: 'transparent',
              '& .MuiBottomNavigationAction-root': {
                color: 'text.secondary',
                transition: 'color 180ms ease-out',
                minWidth: 64,
                '&.Mui-selected': { color: 'primary.main' },
              },
            }}
          >
            {/* Icon-only nav actions need aria-labels: WCAG button-name (screen readers) */}
            {/* data-tour: consumer map tab is a first-run tour target on /scan */}
            <BottomNavigationAction {...tapNearby} value={firstTabPath} showLabel={false} aria-label='Nearby businesses' data-tour={!isBusinessOrManager ? 'nav-map' : undefined} icon={<Storefront />} />

            <BottomNavigationAction
              {...tapMain}
              value={mobileMainPath}
              showLabel={false}
              aria-label='Submit a receipt'
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
                  <ReceiptLongIcon sx={{ color: scanActive ? 'white' : NEUTRAL_INACTIVE_ICON, fontSize: 26, transition: 'color 0.2s ease' }} />
                </Box>
              }
            />

            <BottomNavigationAction {...tapThird} value={thirdNavPath} showLabel={false} aria-label={isBusinessOrManager ? 'Analytics' : 'My tickets'} icon={isBusinessOrManager ? <EqualizerIcon /> : <ConfirmationNumber />} />
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
};

const MainLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuCtx = useMemo(
    () => ({ isOpen: menuOpen, openMenu: () => setMenuOpen(true), closeMenu: () => setMenuOpen(false) }),
    [menuOpen],
  );
  return (
    <InstallPromptProvider>
      <MenuDrawerContext.Provider value={menuCtx}>
        <LayoutShell />
      </MenuDrawerContext.Provider>
    </InstallPromptProvider>
  );
};

export default MainLayout;
