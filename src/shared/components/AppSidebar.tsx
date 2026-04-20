import {
  Box, Typography, Avatar, List, ListItemButton,
  ListItemIcon, ListItemText, Stack, Divider, Chip,
} from '@mui/material';
import { Logout } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hook';
import { logout } from '../../store/slices/authSlice';
import { selectCurrentUser, selectIsBusiness, selectIsLocationManager, selectIsAdmin, selectBusinessIsActive, selectBusinessLogoUrl } from '../../store/selectors/authSelectors';
import { useClerk } from '@clerk/clerk-react';
import {
  userNavItems, managerNavItems, adminNavItems, legalNavItems, type NavItem,
} from '../constants/navItems';
import {
  BusinessOutlined, QrCodeScannerOutlined, ConfirmationNumberOutlined,
  BarChartOutlined, ReceiptLongOutlined,
} from '@mui/icons-material';
import {
  GRADIENT_PRIMARY, PRIMARY_MAIN, BORDER_LIGHT, TEXT_SECONDARY, TEXT_HEADING,
  TEXT_PRIMARY, ALPHA_PRIMARY_04, ALPHA_PRIMARY_06, GRADIENT_SIDEBAR,
  TEXT_TERTIARY,
} from '../colors';
import { getUserInitials, getRoleLabel, getRoleColor } from '../utils/string';

const AppSidebar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector(selectCurrentUser);
  const isBusiness = useAppSelector(selectIsBusiness);
  const isManager = useAppSelector(selectIsLocationManager);
  const isAdmin = useAppSelector(selectIsAdmin);
  const businessIsActive = useAppSelector(selectBusinessIsActive);
  const businessLogoUrl = useAppSelector(selectBusinessLogoUrl);
  const { signOut } = useClerk();

  const initials = getUserInitials(user?.fullName);
  const roleLabel = getRoleLabel(isAdmin, isBusiness, isManager);
  const roleColor = getRoleColor(isAdmin, isBusiness, isManager);

  const businessNavItems: NavItem[] = [
    { label: 'Business Hub', Icon: BusinessOutlined, path: '/nearby' },
    { label: 'Generate Ticket', Icon: QrCodeScannerOutlined, path: '/scan' },
    { label: 'Tickets', Icon: ConfirmationNumberOutlined, path: '/tickets' },
    { label: 'Statistics', Icon: BarChartOutlined, path: '/stats' },
    { label: 'Subscription', Icon: ReceiptLongOutlined, path: businessIsActive ? '/subscription/manage' : '/subscribe' },
  ];

  const mainNavItems = isAdmin ? adminNavItems : isBusiness ? businessNavItems : isManager ? managerNavItems : userNavItems;

  const handleLogout = () => {
    dispatch(logout());
    signOut();
  };

  return (
    <Box
      sx={{
        width: 260,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1100,
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        background: GRADIENT_SIDEBAR,
        borderRight: `1px solid ${BORDER_LIGHT}`,
        overflow: 'hidden',
      }}
    >
      {/* Brand */}
      <Stack sx={{ px: 3, pt: 3.5, pb: 2.5 }} direction='row' alignItems='center' spacing={-1.2}>
        <Box component='img' src='/winnbell_logo.png' alt='W' sx={{ height: 34, width: 'auto', objectFit: 'contain' }} />
        <Typography sx={{ fontFamily: "'Damion', cursive", fontSize: '1.9rem', color: TEXT_PRIMARY, lineHeight: 1, mt: '4px' }}>
          innbell
        </Typography>
      </Stack>

      {/* User identity card */}
      <Box
        sx={{
          mx: 2, mb: 1.5, px: 2, py: 1.5,
          bgcolor: ALPHA_PRIMARY_04,
          borderRadius: 3,
          border: `1px solid ${ALPHA_PRIMARY_06}`,
          display: 'flex', alignItems: 'center', gap: 1.5,
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: ALPHA_PRIMARY_06,
          },
        }}
      >
        <Avatar
          src={businessLogoUrl ? `${import.meta.env.VITE_R2_PUBLIC_URL}/business-logos/${businessLogoUrl}` : undefined}
          sx={{
            width: 40, height: 40,
            background: GRADIENT_PRIMARY,
            color: 'white',
            fontWeight: 800,
            fontSize: 14,
            borderRadius: '12px',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(25,93,230,0.25)',
          }}
        >
          {initials}
        </Avatar>
        <Box flex={1} minWidth={0}>
          <Typography variant='body2' fontWeight={700} noWrap color={TEXT_HEADING} sx={{ lineHeight: 1.3 }}>
            {user?.fullName || 'User'}
          </Typography>
          <Typography variant='caption' color={TEXT_SECONDARY} noWrap sx={{ display: 'block', lineHeight: 1.3 }}>
            {user?.email || ''}
          </Typography>
        </Box>
        <Chip
          label={roleLabel}
          size='small'
          sx={{
            height: 20, fontSize: '0.6rem', fontWeight: 800,
            bgcolor: `${roleColor}12`, color: roleColor,
            border: `1px solid ${roleColor}20`,
            flexShrink: 0,
            borderRadius: '6px',
          }}
        />
      </Box>

      <Divider sx={{ mx: 2.5, mb: 1 }} />

      {/* Nav section */}
      <Box sx={{ px: 1.5, pt: 0.5 }}>
        <Typography variant='caption' fontWeight={700} color={TEXT_TERTIARY}
          sx={{ textTransform: 'uppercase', letterSpacing: 1, px: 1.5, display: 'block', mb: 0.5, fontSize: '0.65rem' }}>
          Navigation
        </Typography>
        <List dense disablePadding>
          {mainNavItems.map(({ label, Icon, path }) => {
            const active = location.pathname === path;
            return (
              <ListItemButton
                key={path}
                onClick={() => navigate(path)}
                sx={{
                  borderRadius: 2.5, mb: 0.3, px: 1.5, py: 0.8,
                  bgcolor: active ? PRIMARY_MAIN : 'transparent',
                  boxShadow: active ? '0 2px 8px rgba(25,93,230,0.3)' : 'none',
                  '&:hover': {
                    bgcolor: active ? PRIMARY_MAIN : ALPHA_PRIMARY_06,
                    transform: active ? 'none' : 'translateX(2px)',
                  },
                  transition: 'all 0.15s ease',
                }}
              >
                <ListItemIcon sx={{ minWidth: 34 }}>
                  <Icon sx={{
                    fontSize: 20,
                    color: active ? 'white' : TEXT_SECONDARY,
                    transition: 'color 0.15s ease',
                  }} />
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{
                    fontSize: '0.85rem', fontWeight: active ? 700 : 600,
                    color: active ? 'white' : TEXT_HEADING,
                    letterSpacing: '-0.01em',
                  }}
                />
                {active && (
                  <Box sx={{
                    width: 4, height: 4,
                    borderRadius: '50%',
                    bgcolor: 'white',
                    opacity: 0.7,
                    mr: 0.5,
                  }} />
                )}
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      <Divider sx={{ mx: 2.5, my: 1 }} />

      {/* Support section */}
      <Box sx={{ px: 1.5 }}>
        <Typography variant='caption' fontWeight={700} color={TEXT_TERTIARY}
          sx={{ textTransform: 'uppercase', letterSpacing: 1, px: 1.5, display: 'block', mb: 0.5, fontSize: '0.65rem' }}>
          Support
        </Typography>
        <List dense disablePadding>
          {legalNavItems.map(({ label, Icon, path }) => (
            <ListItemButton
              key={path}
              onClick={() => navigate(path)}
              sx={{
                borderRadius: 2.5, mb: 0.3, px: 1.5,
                '&:hover': {
                  bgcolor: ALPHA_PRIMARY_06,
                  transform: 'translateX(2px)',
                },
                transition: 'all 0.15s ease',
              }}
            >
              <ListItemIcon sx={{ minWidth: 34 }}>
                <Icon sx={{ fontSize: 18, color: TEXT_TERTIARY }} />
              </ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{ fontSize: '0.82rem', fontWeight: 500, color: TEXT_SECONDARY }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* Spacer */}
      <Box sx={{ flex: 1 }} />

      <Divider sx={{ mx: 2.5 }} />

      {/* Logout */}
      <List dense disablePadding sx={{ px: 1.5, py: 1.5 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2.5, px: 1.5,
            '&:hover': { bgcolor: 'rgba(211,47,47,0.06)' },
            transition: 'all 0.15s ease',
          }}
        >
          <ListItemIcon sx={{ minWidth: 34 }}>
            <Logout sx={{ fontSize: 18, color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText
            primary='Log out'
            primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600, color: 'error.main' }}
          />
        </ListItemButton>
      </List>

      <Typography variant='caption' color={TEXT_TERTIARY} sx={{ px: 3, pb: 2.5, display: 'block', fontSize: '0.68rem' }}>
        Winnbell v1.0 · {new Date().getFullYear()}
      </Typography>
    </Box>
  );
};

export default AppSidebar;
