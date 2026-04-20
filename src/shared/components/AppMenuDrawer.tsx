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
import { selectCurrentUser, selectIsBusiness, selectIsLocationManager, selectIsAdmin, selectBusinessIsActive, selectBusinessLogoUrl } from '../../store/selectors/authSelectors';
import { useClerk } from '@clerk/clerk-react';
import {
  ALPHA_WHITE_15,
  ALPHA_WHITE_20,
  ALPHA_WHITE_30,
  ALPHA_WHITE_70,
  PRIMARY_MAIN,
  GRADIENT_HERO_WARM,
  TEXT_TERTIARY,
  ALPHA_PRIMARY_06,
} from '../colors';
import { getUserInitials, getRoleLabel } from '../utils/string';

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
  const businessIsActive = useAppSelector(selectBusinessIsActive);
  const businessLogoUrl = useAppSelector(selectBusinessLogoUrl);
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
        { label: 'Subscription', icon: <ReceiptLongOutlined />, path: businessIsActive ? '/subscription/manage' : '/subscribe' },
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
        { label: 'Submit Receipt', icon: <ReceiptLongOutlined />, path: '/scan' },
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
        sx: {
          width: { xs: '85vw', sm: 320 },
          maxWidth: 320,
          borderTopLeftRadius: 24,
          borderBottomLeftRadius: 24,
          overflow: 'hidden',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* Hero header */}
        <Box sx={{
          background: GRADIENT_HERO_WARM,
          px: 3, pt: 5.5, pb: 4,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative orbs */}
          <Box sx={{
            position: 'absolute', top: -50, right: -50,
            width: 160, height: 160,
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
            borderRadius: '50%',
          }} />
          <Box sx={{
            position: 'absolute', bottom: -30, left: -20,
            width: 100, height: 100,
            background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
            borderRadius: '50%',
          }} />

          <Stack direction='row' spacing={2} alignItems='center' sx={{ position: 'relative', zIndex: 1 }}>
            <Avatar
              src={businessLogoUrl ? `${import.meta.env.VITE_R2_PUBLIC_URL}/business-logos/${businessLogoUrl}` : undefined}
              sx={{
                width: 56,
                height: 56,
                background: ALPHA_WHITE_20,
                color: 'white',
                fontWeight: 800,
                fontSize: 19,
                border: `2px solid ${ALPHA_WHITE_30}`,
                backdropFilter: 'blur(12px)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ overflow: 'hidden', flex: 1 }}>
              <Typography fontWeight={800} fontSize='1rem' color='white' noWrap sx={{ letterSpacing: '-0.01em' }}>
                {user?.fullName || 'Welcome'}
              </Typography>
              <Typography variant='caption' sx={{ color: ALPHA_WHITE_70, display: 'block', mt: 0.2 }} noWrap>
                {user?.email}
              </Typography>
              <Chip
                label={roleLabel}
                size='small'
                sx={{
                  mt: 0.75,
                  height: 20,
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  bgcolor: ALPHA_WHITE_15,
                  color: 'white',
                  border: `1px solid ${ALPHA_WHITE_20}`,
                  backdropFilter: 'blur(8px)',
                  borderRadius: '6px',
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            </Box>
          </Stack>
        </Box>

        {/* Main nav */}
        <Box sx={{ px: 2, pt: 2.5 }}>
          <Typography variant='caption' fontWeight={700} color={TEXT_TERTIARY}
            sx={{ px: 1, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', mb: 0.75, fontSize: '0.63rem' }}>
            Navigation
          </Typography>
          <List disablePadding>
            {mainNavItems.map((item) => (
              <ListItemButton
                key={item.path}
                onClick={() => handleNav(item.path)}
                sx={{
                  borderRadius: 2.5,
                  mb: 0.3,
                  py: 1.1,
                  px: 1.5,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: ALPHA_PRIMARY_06,
                    transform: 'translateX(3px)',
                  },
                  '&:hover .nav-icon': { color: PRIMARY_MAIN },
                  '&:hover .nav-chevron': { opacity: 1, transform: 'translateX(2px)' },
                }}
              >
                <ListItemIcon
                  className='nav-icon'
                  sx={{ minWidth: 36, color: 'text.secondary', transition: 'color 0.15s ease' }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: 600, fontSize: '0.88rem', letterSpacing: '-0.01em' }}
                />
                <ChevronRight
                  className='nav-chevron'
                  sx={{
                    fontSize: 16, color: 'text.disabled',
                    opacity: 0.4, transition: 'all 0.15s ease',
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>

        <Divider sx={{ mx: 3, my: 1.5 }} />

        {/* Legal / support */}
        <Box sx={{ px: 2 }}>
          <Typography variant='caption' fontWeight={700} color={TEXT_TERTIARY}
            sx={{ px: 1, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', mb: 0.75, fontSize: '0.63rem' }}>
            Support
          </Typography>
          <List disablePadding>
            {legalItems.map((item) => (
              <ListItemButton
                key={item.path}
                onClick={() => handleNav(item.path)}
                sx={{
                  borderRadius: 2.5, mb: 0.3, py: 1.1, px: 1.5,
                  transition: 'all 0.15s ease',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.03)', transform: 'translateX(3px)' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: TEXT_TERTIARY }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: 500, fontSize: '0.84rem', color: 'text.secondary' }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* App version + logout */}
        <Box sx={{ px: 2, pb: 3.5 }}>
          <Divider sx={{ mb: 2 }} />
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2.5,
              color: 'error.main',
              py: 1.1,
              px: 1.5,
              transition: 'all 0.15s ease',
              '&:hover': { bgcolor: 'rgba(211,47,47,0.06)' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
              <Logout fontSize='small' />
            </ListItemIcon>
            <ListItemText
              primary='Log out'
              primaryTypographyProps={{ fontWeight: 700, fontSize: '0.88rem' }}
            />
          </ListItemButton>
          <Typography variant='caption' color={TEXT_TERTIARY} sx={{ px: 1.5, mt: 1.5, display: 'block', fontSize: '0.68rem' }}>
            Winnbell v1.0 · {new Date().getFullYear()}
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default AppMenuDrawer;
