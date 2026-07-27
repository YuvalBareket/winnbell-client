import {
  Box, Typography, Avatar, List, ListItemButton,
  ListItemIcon, ListItemText, Stack, Divider, Menu,
} from '@mui/material';
import { Logout, UnfoldMore } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAppSelector } from '../../store/hook';
import { selectCurrentUser, selectIsBusiness, selectIsLocationManager, selectIsAdmin, selectBusinessIsActive, selectBusinessLogoUrl, selectAccounts, selectCanAddAccount } from '../../store/selectors/authSelectors';
import { useLogout } from '../hooks/useLogout';
import {
  managerNavItems, adminNavItems, legalNavItems, businessLegalNavItems, userNavItems, type NavItem,
} from '../constants/navItems';
import {
  BusinessOutlined, BarChartOutlined, ReceiptLongOutlined,
  SettingsOutlined, CampaignOutlined, EmojiEventsOutlined,
} from '@mui/icons-material';
import {
  GRADIENT_SIDEBAR,
  ALPHA_WHITE_10, ALPHA_WHITE_15, ALPHA_WHITE_20, ALPHA_WHITE_30, ALPHA_WHITE_70, ALPHA_WHITE_80,
  BORDER_LIGHT,
} from '../colors';
import { getUserInitials, getRoleLabel } from '../utils/string';
import AccountSwitcher from './AccountSwitcher';

const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = useLogout();
  const user = useAppSelector(selectCurrentUser);
  const isBusiness = useAppSelector(selectIsBusiness);
  const isManager = useAppSelector(selectIsLocationManager);
  const isAdmin = useAppSelector(selectIsAdmin);
  const businessIsActive = useAppSelector(selectBusinessIsActive);
  const businessLogoUrl = useAppSelector(selectBusinessLogoUrl);
  const accounts = useAppSelector(selectAccounts);
  const canAddAccount = useAppSelector(selectCanAddAccount);
  const initials = getUserInitials(user?.fullName);
  const roleLabel = getRoleLabel(isAdmin, isBusiness, isManager);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const canSwitch = accounts.length > 1 || canAddAccount;

  const businessNavItems: NavItem[] = [
    { label: 'Business Hub', Icon: BusinessOutlined, path: '/nearby' },
    { label: 'Campaign Dashboard', Icon: CampaignOutlined, path: '/campaign' },
    { label: 'Analytics', Icon: BarChartOutlined, path: '/stats' },
    { label: 'Campaigns Hub', Icon: EmojiEventsOutlined, path: '/draws/history' },
    { label: 'My Plan', Icon: ReceiptLongOutlined, path: businessIsActive ? '/subscription/manage' : '/subscribe' },
    { label: 'Marketing', Icon: CampaignOutlined, path: '/marketing' },
    { label: 'Profile Settings', Icon: SettingsOutlined, path: '/settings' },
  ];

  const mainNavItems = isAdmin ? adminNavItems : isBusiness ? businessNavItems : isManager ? managerNavItems : userNavItems;

  return (
    <Box
      component='nav'
      aria-label='Main navigation'
      sx={{
        width: 260,
        height: 'var(--dvh100, 100dvh)',
        position: 'fixed',
        left: 0, top: 0,
        pb:1,
        zIndex: 1100,
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        background: GRADIENT_SIDEBAR,
        color: 'white',
        overflow: 'hidden',
      }}
    >
      {/* Soft glow orb */}
      <Box sx={{ position: 'absolute', top: -90, right: -70, width: 280, height: 280, borderRadius: '50%', bgcolor: ALPHA_WHITE_10, filter: 'blur(55px)', pointerEvents: 'none' }} />

      {/* Brand (white) */}
      <Stack sx={{ px: 2, pt: 2, pb: 1.5, position: 'relative', '@media (max-height: 700px)': { pt: 1.2, pb: 1 } }} direction='row' alignItems='center'>
        <Box component='img' src='/winnbell_app_name_white.svg' alt='Winnbell' sx={{ height: 40, width: 'auto', objectFit: 'contain' }} />
      </Stack>

      {/* Scrollable nav + support */}
      <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
        <Box sx={{ px: 1.5, pt: 1 }}>
          <Typography variant='caption' fontWeight={700} sx={{ color: ALPHA_WHITE_70, textTransform: 'uppercase', letterSpacing: 1, px: 1.5, display: 'block', mb: 0.5, fontSize: '0.62rem' }}>
            Navigation
          </Typography>
          <List dense disablePadding>
            {mainNavItems.map(({ label, Icon, path }) => {
              const active = path === '/admin'
                ? location.pathname === '/admin'
                : location.pathname === path || location.pathname.startsWith(path + '/');
              return (
                <ListItemButton
                  key={path}
                  onClick={() => navigate(path)}
                  sx={{
                    borderRadius: 2.5, mb: 0.3, px: 1.5, py: 0.65, '@media (max-height: 700px)': { py: 0.5, mb: 0.15 },
                    bgcolor: active ? ALPHA_WHITE_20 : 'transparent',
                    boxShadow: active ? `inset 0 0 0 1px ${ALPHA_WHITE_15}` : 'none',
                    '&:hover': { bgcolor: active ? ALPHA_WHITE_20 : ALPHA_WHITE_10, transform: active ? 'none' : 'translateX(2px)' },
                    transition: 'all 0.15s ease',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 34 }}>
                    <Icon sx={{ fontSize: 20, color: active ? 'white' : ALPHA_WHITE_80 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={label}
                    primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: active ? 700 : 600, color: active ? 'white' : ALPHA_WHITE_80, letterSpacing: '-0.01em' }}
                  />
                  {active && <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: 'white', opacity: 0.9, mr: 0.5 }} />}
                </ListItemButton>
              );
            })}
          </List>
        </Box>

        <Divider sx={{ mx: 2.5, my: 1, borderColor: ALPHA_WHITE_15 }} />

        <Box sx={{ px: 1.5 }}>
          <Typography variant='caption' fontWeight={700} sx={{ color: ALPHA_WHITE_70, textTransform: 'uppercase', letterSpacing: 1, px: 1.5, display: 'block', mb: 0.5, fontSize: '0.62rem' }}>
            Support
          </Typography>
          <List dense disablePadding>
            {(isBusiness || isManager ? businessLegalNavItems : legalNavItems).map(({ label, Icon, path }) => (
              <ListItemButton
                key={path}
                onClick={() => navigate(path)}
                sx={{
                  borderRadius: 2.5, mb: 0.2, px: 1.5, '@media (max-height: 700px)': { py: 0.2, mb: 0.1 },
                  '&:hover': { bgcolor: ALPHA_WHITE_10, transform: 'translateX(2px)' },
                  transition: 'all 0.15s ease',
                }}
              >
                <ListItemIcon sx={{ minWidth: 34 }}>
                  <Icon sx={{ fontSize: 16, color: ALPHA_WHITE_70 }} />
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{ fontSize: '0.78rem', fontWeight: 500, color: ALPHA_WHITE_70 }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Box>

      {/* Bottom user card - opens Switch / Add account + Log out */}
      <Box sx={{ p: 1.5, position: 'relative' }}>
        <Box
          onClick={(e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)}
          sx={{
            px: 1.5, py: 1,
            bgcolor: ALPHA_WHITE_15,
            borderRadius: 2.5,
            border: `1px solid ${ALPHA_WHITE_20}`,
            display: 'flex', alignItems: 'center', gap: 1.25,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': { bgcolor: ALPHA_WHITE_20 },
          }}
        >
          <Avatar
            src={businessLogoUrl ? `${import.meta.env.VITE_R2_PUBLIC_URL}/business-logos/${businessLogoUrl}` : undefined}
            sx={{ width: 38, height: 38, background: businessLogoUrl ? undefined : '#fff', color: 'primary.main', fontWeight: 800, fontSize: 14, borderRadius: '11px', flexShrink: 0 }}
          >
            {initials}
          </Avatar>
          <Box flex={1} minWidth={0}>
            <Typography variant='body2' fontWeight={800} noWrap sx={{ color: 'white', lineHeight: 1.3 }}>
              {user?.fullName || 'User'}
            </Typography>
            <Typography variant='caption' noWrap sx={{ color: ALPHA_WHITE_70, display: 'block', lineHeight: 1.3 }}>
              {roleLabel}{user?.email ? ` · ${user.email}` : ''}
            </Typography>
          </Box>
          <UnfoldMore sx={{ fontSize: 18, color: ALPHA_WHITE_70, flexShrink: 0, transition: 'transform 0.2s ease', transform: menuOpen ? 'scaleY(-1)' : 'scaleY(1)' }} />
        </Box>
      </Box>

      {/* Account + logout menu (sidebar is not a modal, so a Menu + inline switcher works here) */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { minWidth: 264, borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.16)', border: `1px solid ${BORDER_LIGHT}`, overflow: 'hidden', mb: 1 } }}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        {canSwitch && <AccountSwitcher variant='inline' onClose={() => setAnchorEl(null)} />}
        {canSwitch && <Divider sx={{ mx: 1 }} />}
        <Box sx={{ p: 1 }}>
          <ListItemButton
            onClick={() => { setAnchorEl(null); handleLogout(); }}
            sx={{ borderRadius: 1.5, px: 1.5, '&:hover': { bgcolor: 'rgba(211,47,47,0.06)' } }}
          >
            <ListItemIcon sx={{ minWidth: 34 }}>
              <Logout sx={{ fontSize: 18, color: 'error.main' }} />
            </ListItemIcon>
            <ListItemText primary='Log out' primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 700, color: 'error.main' }} />
          </ListItemButton>
        </Box>
      </Menu>

      <Typography variant='caption' sx={{ color: ALPHA_WHITE_30, px: 3, pb: 1.25, display: 'block', fontSize: '0.68rem', position: 'relative', '@media (max-height: 700px)': { pb: 0.6 } }}>
        Winnbell v1.0 · {new Date().getFullYear()}
      </Typography>
    </Box>
  );
};

export default AppSidebar;
