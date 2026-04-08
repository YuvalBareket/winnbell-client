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
  TEXT_PRIMARY,
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
        width: 240,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1100,
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRight: `1px solid ${BORDER_LIGHT}`,
        overflow: 'hidden',
      }}
    >
      {/* Brand */}
      <Stack sx={{ px: 3, pt: 3, pb: 2 }} direction='row' alignItems='center' spacing={-1.2}>
        <Box component='img' src='/winnbell_logo.png' alt='W' sx={{ height: 32, width: 'auto', objectFit: 'contain' }} />
        <Typography sx={{ fontFamily: "'Damion', cursive", fontSize: '1.8rem', color: TEXT_PRIMARY, lineHeight: 1, mt: '4px' }}>
          innbell
        </Typography>
      </Stack>

      {/* User identity */}
      <Box
        sx={{
          mx: 1.5, mb: 1, px: 1.5, py: 1.5,
          bgcolor: 'rgba(25,93,230,0.04)',
          borderRadius: 3,
          display: 'flex', alignItems: 'center', gap: 1.5,
        }}
      >
        <Avatar
          src={businessLogoUrl ? `${import.meta.env.VITE_R2_PUBLIC_URL}/business-logos/${businessLogoUrl}` : undefined}
          sx={{
            width: 36, height: 36,
            background: GRADIENT_PRIMARY,
            color: 'white',
            fontWeight: 800,
            fontSize: 13,
            borderRadius: '10px',
            flexShrink: 0,
          }}
        >
          {initials}
        </Avatar>
        <Box flex={1} minWidth={0}>
          <Typography variant='body2' fontWeight={700} noWrap color={TEXT_HEADING}>
            {user?.fullName || 'User'}
          </Typography>
          <Typography variant='caption' color={TEXT_SECONDARY} noWrap sx={{ display: 'block' }}>
            {user?.email || ''}
          </Typography>
        </Box>
        <Chip
          label={roleLabel}
          size='small'
          sx={{
            height: 18, fontSize: '0.6rem', fontWeight: 800,
            bgcolor: `${roleColor}15`, color: roleColor,
            flexShrink: 0,
          }}
        />
      </Box>

      <Divider sx={{ mx: 2, mb: 0.5 }} />

      {/* Nav section */}
      <Box sx={{ px: 1.5, pt: 1 }}>
        <Typography variant='caption' fontWeight={700} color={TEXT_SECONDARY}
          sx={{ textTransform: 'uppercase', letterSpacing: 0.8, px: 1, display: 'block', mb: 0.5 }}>
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
                  borderRadius: 2, mb: 0.5, px: 1.5,
                  bgcolor: active ? PRIMARY_MAIN : 'transparent',
                  '&:hover': { bgcolor: active ? PRIMARY_MAIN : 'rgba(25,93,230,0.06)' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 34 }}>
                  <Icon sx={{ fontSize: 20, color: active ? 'white' : TEXT_SECONDARY }} />
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{
                    fontSize: '0.875rem', fontWeight: 600,
                    color: active ? 'white' : TEXT_HEADING,
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      <Divider sx={{ mx: 2, my: 1 }} />

      {/* Support section */}
      <Box sx={{ px: 1.5 }}>
        <Typography variant='caption' fontWeight={700} color={TEXT_SECONDARY}
          sx={{ textTransform: 'uppercase', letterSpacing: 0.8, px: 1, display: 'block', mb: 0.5 }}>
          Support
        </Typography>
        <List dense disablePadding>
          {legalNavItems.map(({ label, Icon, path }) => (
            <ListItemButton
              key={path}
              onClick={() => navigate(path)}
              sx={{ borderRadius: 2, mb: 0.5, px: 1.5, '&:hover': { bgcolor: 'rgba(25,93,230,0.06)' } }}
            >
              <ListItemIcon sx={{ minWidth: 34 }}>
                <Icon sx={{ fontSize: 18, color: TEXT_SECONDARY }} />
              </ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500, color: TEXT_HEADING }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* Spacer */}
      <Box sx={{ flex: 1 }} />

      <Divider sx={{ mx: 2 }} />

      {/* Logout */}
      <List dense disablePadding sx={{ px: 1.5, py: 1 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{ borderRadius: 2, px: 1.5, '&:hover': { bgcolor: 'rgba(211,47,47,0.06)' } }}
        >
          <ListItemIcon sx={{ minWidth: 34 }}>
            <Logout sx={{ fontSize: 18, color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText
            primary='Log out'
            primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600, color: 'error.main' }}
          />
        </ListItemButton>
      </List>

      <Typography variant='caption' color={TEXT_SECONDARY} sx={{ px: 3, pb: 2, display: 'block' }}>
        Winnbell v1.0 · © {new Date().getFullYear()}
      </Typography>
    </Box>
  );
};

export default AppSidebar;
