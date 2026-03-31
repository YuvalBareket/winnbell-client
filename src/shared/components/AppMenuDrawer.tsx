import {
  Drawer,
  Box,
  Typography,
  Avatar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Divider,
  Chip,
} from '@mui/material';
import {
  Logout,
  ConfirmationNumberOutlined,
  StorefrontOutlined,
  QrCodeScannerOutlined,
  BusinessOutlined,
  BarChartOutlined,
  ReceiptLongOutlined,
  PrivacyTipOutlined,
  GavelOutlined,
  ChevronRight,
  EmojiEventsOutlined,
  AdminPanelSettingsOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hook';
import { logout } from '../../store/slices/authSlice';
import { selectCurrentUser, selectIsBusiness, selectIsLocationManager, selectIsAdmin } from '../../store/selectors/authSelectors';
import { useClerk } from '@clerk/clerk-react';
import {
  GRADIENT_HERO,
  GRADIENT_PRIMARY,
  ALPHA_WHITE_15,
  ALPHA_WHITE_20,
  ALPHA_WHITE_30,
  ALPHA_WHITE_70,
  PRIMARY_MAIN,
} from '../colors';
import { getUserInitials, getRoleLabel, getRoleColor } from '../utils/string';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const AppMenuDrawer = ({ open, onClose }: Props) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  const isBusiness = useAppSelector(selectIsBusiness);
  const isManager = useAppSelector(selectIsLocationManager);
  const isAdmin = useAppSelector(selectIsAdmin);
  const { signOut } = useClerk();

  const handleLogout = () => {
    dispatch(logout());
    signOut();
  };

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  const initials = getUserInitials(user?.fullName);
  const roleLabel = getRoleLabel(isAdmin, isBusiness, isManager);
  const roleColor = getRoleColor(isAdmin, isBusiness, isManager);

  const mainNavItems: NavItem[] = isAdmin
    ? [
        { label: 'Admin Dashboard', icon: <AdminPanelSettingsOutlined />, path: '/admin' },
      ]
    : isBusiness
    ? [
        { label: 'Business Hub', icon: <BusinessOutlined />, path: '/nearby' },
        { label: 'Scan Ticket', icon: <QrCodeScannerOutlined />, path: '/scan' },
        { label: 'Tickets', icon: <ConfirmationNumberOutlined />, path: '/tickets' },
        { label: 'Statistics', icon: <BarChartOutlined />, path: '/stats' },
        { label: 'Subscription', icon: <ReceiptLongOutlined />, path: '/subscription/manage' },
      ]
    : isManager
    ? [
        { label: 'Business Hub', icon: <BusinessOutlined />, path: '/nearby' },
        { label: 'Scan Ticket', icon: <QrCodeScannerOutlined />, path: '/scan' },
        { label: 'Tickets', icon: <ConfirmationNumberOutlined />, path: '/tickets' },
        { label: 'Statistics', icon: <BarChartOutlined />, path: '/stats' },
      ]
    : [
        { label: 'Nearby Partners', icon: <StorefrontOutlined />, path: '/nearby' },
        { label: 'Scan QR Code', icon: <QrCodeScannerOutlined />, path: '/scan' },
        { label: 'My Tickets', icon: <ConfirmationNumberOutlined />, path: '/tickets' },
        { label: 'Draw History', icon: <EmojiEventsOutlined />, path: '/draws/history' },
      ];

  const legalItems: NavItem[] = [
    { label: 'Terms of Service', icon: <GavelOutlined />, path: '/terms' },
    { label: 'Privacy Policy', icon: <PrivacyTipOutlined />, path: '/privacy' },
  ];

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '85vw', sm: 300 }, maxWidth: 300, borderTopLeftRadius: 20, borderBottomLeftRadius: 20, overflow: 'hidden' },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* Hero header */}
        <Box sx={{ background: GRADIENT_HERO, px: 3, pt: 5, pb: 3.5, position: 'relative', overflow: 'hidden' }}>
          {/* Decorative orb */}
          <Box sx={{
            position: 'absolute', top: -40, right: -40,
            width: 140, height: 140,
            bgcolor: ALPHA_WHITE_10_CIRCLE,
            borderRadius: '50%',
          }} />

          <Stack direction='row' spacing={2} alignItems='center'>
            <Avatar
              sx={{
                width: 54,
                height: 54,
                background: ALPHA_WHITE_20,
                color: 'white',
                fontWeight: 800,
                fontSize: 18,
                border: `2px solid ${ALPHA_WHITE_30}`,
                backdropFilter: 'blur(8px)',
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ overflow: 'hidden', flex: 1 }}>
              <Typography fontWeight={800} fontSize='0.95rem' color='white' noWrap>
                {user?.fullName || 'Welcome'}
              </Typography>
              <Typography variant='caption' sx={{ color: ALPHA_WHITE_70, display: 'block' }} noWrap>
                {user?.email}
              </Typography>
              <Chip
                label={roleLabel}
                size='small'
                sx={{
                  mt: 0.5,
                  height: 18,
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  bgcolor: ALPHA_WHITE_15,
                  color: 'white',
                  border: `1px solid ${ALPHA_WHITE_20}`,
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            </Box>
          </Stack>
        </Box>

        {/* Main nav */}
        <Box sx={{ px: 1.5, pt: 2 }}>
          <Typography variant='caption' fontWeight={700} color='text.disabled'
            sx={{ px: 1, textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 0.5 }}>
            Navigation
          </Typography>
          <List disablePadding>
            {mainNavItems.map((item) => (
              <ListItemButton
                key={item.path}
                onClick={() => handleNav(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  py: 1,
                  '&:hover': { bgcolor: 'rgba(25,93,230,0.06)' },
                  '&:hover .nav-icon': { color: PRIMARY_MAIN },
                }}
              >
                <ListItemIcon
                  className='nav-icon'
                  sx={{ minWidth: 36, color: 'text.secondary', transition: 'color 0.15s' }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }}
                />
                <ChevronRight sx={{ fontSize: 16, color: 'text.disabled' }} />
              </ListItemButton>
            ))}
          </List>
        </Box>

        <Divider sx={{ mx: 2, my: 1.5 }} />

        {/* Legal / support */}
        <Box sx={{ px: 1.5 }}>
          <Typography variant='caption' fontWeight={700} color='text.disabled'
            sx={{ px: 1, textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 0.5 }}>
            Support
          </Typography>
          <List disablePadding>
            {legalItems.map((item) => (
              <ListItemButton
                key={item.path}
                onClick={() => handleNav(item.path)}
                sx={{ borderRadius: 2, mb: 0.5, py: 1.25, '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' } }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'text.disabled' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: 500, fontSize: 13, color: 'text.secondary' }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* App version + logout */}
        <Box sx={{ px: 1.5, pb: 3 }}>
          <Divider sx={{ mb: 1.5 }} />
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              color: 'error.main',
              py: 1,
              '&:hover': { bgcolor: 'rgba(211,47,47,0.06)' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
              <Logout fontSize='small' />
            </ListItemIcon>
            <ListItemText
              primary='Log out'
              primaryTypographyProps={{ fontWeight: 700, fontSize: 14 }}
            />
          </ListItemButton>
          <Typography variant='caption' color='text.disabled' sx={{ px: 1, mt: 1, display: 'block' }}>
            Winnbell v1.0 · © 2026
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

// local constant to avoid TS issues with inline rgba in sx
const ALPHA_WHITE_10_CIRCLE = 'rgba(255,255,255,0.08)';

export default AppMenuDrawer;
