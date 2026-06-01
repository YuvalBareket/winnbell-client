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
  BusinessOutlined,
  BarChartOutlined,
  ReceiptLongOutlined,
  PrivacyTipOutlined,
  GavelOutlined,
  ArticleOutlined,
  ChevronRight,
  EmojiEventsOutlined,
  AdminPanelSettingsOutlined,
  FeedOutlined,
  SettingsOutlined,
  CampaignOutlined,
  HelpOutlineOutlined,
  DashboardOutlined,
  PeopleOutlined,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, Fragment } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hook';
import { logout } from '../../store/slices/authSlice';
import { selectCurrentUser, selectIsBusiness, selectIsLocationManager, selectIsAdmin, selectBusinessIsActive, selectBusinessLogoUrl } from '../../store/selectors/authSelectors';
import { supabase } from '../lib/supabase';
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
import HowItWorksModal from '../../features/help/components/HowItWorksModal';

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
  const location = useLocation();
  const user = useAppSelector(selectCurrentUser);
  const isBusiness = useAppSelector(selectIsBusiness);
  const isManager = useAppSelector(selectIsLocationManager);
  const isAdmin = useAppSelector(selectIsAdmin);
  const businessIsActive = useAppSelector(selectBusinessIsActive);
  const businessLogoUrl = useAppSelector(selectBusinessLogoUrl);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  const handleLogout = async () => {
    navigate('/');
    dispatch(logout());
    localStorage.removeItem('wasLoggedIn');
    try {
      await supabase.auth.signOut();
    } catch {
      // signOut failure doesn't affect local logout — Redux and localStorage are already cleared
    }
  };

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleHowItWorks = () => {
    setHowItWorksOpen(true);
    onClose();
  };

  const initials = getUserInitials(user?.fullName);
  const roleLabel = getRoleLabel(isAdmin, isBusiness, isManager);

  const mainNavItems: NavItem[] = isAdmin
    ? [
        { label: 'Overview', icon: <DashboardOutlined />, path: '/admin' },
        { label: 'Campaigns', icon: <AdminPanelSettingsOutlined />, path: '/admin/campaigns' },
        { label: 'Users', icon: <PeopleOutlined />, path: '/admin/users' },
        { label: 'Businesses', icon: <BusinessOutlined />, path: '/admin/businesses' },
        { label: 'Analytics', icon: <BarChartOutlined />, path: '/admin/analytics' },
        { label: 'Settings', icon: <SettingsOutlined />, path: '/admin/settings' },
      ]
    : isBusiness
    ? [
        { label: 'Business Hub', icon: <BusinessOutlined />, path: '/nearby' },
        { label: 'Receipt Activity', icon: <FeedOutlined />, path: '/activity' },
        { label: 'Entries', icon: <ConfirmationNumberOutlined />, path: '/tickets' },
        { label: 'Statistics', icon: <BarChartOutlined />, path: '/stats' },
        { label: 'Campaigns Hub', icon: <EmojiEventsOutlined />, path: '/draws/history' },
        { label: 'My Plan', icon: <ReceiptLongOutlined />, path: businessIsActive ? '/subscription/manage' : '/subscribe' },
        { label: 'Marketing', icon: <CampaignOutlined />, path: '/marketing' },
        { label: 'Settings', icon: <SettingsOutlined />, path: '/settings' },
      ]
    : isManager
    ? [
        { label: 'Business Hub', icon: <BusinessOutlined />, path: '/nearby' },
        { label: 'Receipt Activity', icon: <FeedOutlined />, path: '/activity' },
        { label: 'Entries', icon: <ConfirmationNumberOutlined />, path: '/tickets' },
        { label: 'Statistics', icon: <BarChartOutlined />, path: '/stats' },
        { label: 'Settings', icon: <SettingsOutlined />, path: '/settings' },
      ]
    : [
        { label: 'Nearby Partners', icon: <StorefrontOutlined />, path: '/nearby' },
        { label: 'Submit Receipt', icon: <ReceiptLongOutlined />, path: '/scan' },
        { label: 'My Entries', icon: <ConfirmationNumberOutlined />, path: '/tickets' },
        { label: 'Campaigns Hub', icon: <EmojiEventsOutlined />, path: '/draws/history' },
        { label: 'Settings', icon: <SettingsOutlined />, path: '/settings' },
      ];

  const legalItems: NavItem[] = [
    { label: 'Terms of Service', icon: <GavelOutlined />, path: '/terms' },
    { label: 'Privacy Policy', icon: <PrivacyTipOutlined />, path: '/privacy' },
    ...((isBusiness || isManager) ? [{ label: 'Business Agreement', icon: <ArticleOutlined />, path: '/business-agreement' }] : []),
  ];

  // Responsive item padding - compact on mobile so everything fits without scrolling
  const itemPy = { xs: 0.65, sm: 1.1 };
  const sectionMy = { xs: 0.75, sm: 1.5 };
  const labelMb = { xs: 0.4, sm: 0.75 };

  return (
    <Fragment>
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
          px: 3,
          pt: { xs: 2.5, sm: 5.5 },
          pb: { xs: 2, sm: 4 },
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
                width: { xs: 44, sm: 56 },
                height: { xs: 44, sm: 56 },
                background: ALPHA_WHITE_20,
                color: 'white',
                fontWeight: 800,
                fontSize: { xs: 15, sm: 19 },
                border: `2px solid ${ALPHA_WHITE_30}`,
                backdropFilter: 'blur(12px)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                flexShrink: 0,
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ overflow: 'hidden', flex: 1 }}>
              <Typography fontWeight={800} fontSize={{ xs: '0.9rem', sm: '1rem' }} color='white' noWrap sx={{ letterSpacing: '-0.01em' }}>
                {user?.fullName || 'Welcome'}
              </Typography>
              <Typography variant='caption' sx={{ color: ALPHA_WHITE_70, display: 'block', mt: 0.2, fontSize: { xs: '0.7rem', sm: '0.75rem' } }} noWrap>
                {user?.email}
              </Typography>
              <Chip
                label={roleLabel}
                size='small'
                sx={{
                  mt: 0.5,
                  height: 18,
                  fontSize: '0.58rem',
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
        <Box sx={{ px: 2, pt: { xs: 1.5, sm: 2.5 } }}>
          <Typography variant='caption' fontWeight={700} color={TEXT_TERTIARY}
            sx={{ px: 1, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', mb: labelMb, fontSize: '0.63rem' }}>
            Navigation
          </Typography>
          <List disablePadding>
            {mainNavItems.map((item) => (
              <ListItemButton
                key={item.path}
                onClick={() => handleNav(item.path)}
                sx={{
                  borderRadius: 2.5,
                  mb: 0.2,
                  py: itemPy,
                  px: 1.5,
                  transition: 'all 0.15s ease',
                  ...(location.pathname === item.path && {
                    bgcolor: ALPHA_PRIMARY_06,
                  }),
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
                  sx={{ minWidth: 34, color: location.pathname === item.path ? PRIMARY_MAIN : 'text.secondary', transition: 'color 0.15s ease', '& svg': { fontSize: { xs: 20, sm: 24 } } }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: 600, fontSize: { xs: '0.82rem', sm: '0.88rem' }, letterSpacing: '-0.01em' }}
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

        <Divider sx={{ mx: 3, my: sectionMy }} />

        {/* Help + Support merged */}
        <Box sx={{ px: 2 }}>
          <Typography variant='caption' fontWeight={700} color={TEXT_TERTIARY}
            sx={{ px: 1, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', mb: labelMb, fontSize: '0.63rem' }}>
            Support
          </Typography>
          <List disablePadding>
            <ListItemButton
              onClick={handleHowItWorks}
              sx={{
                borderRadius: 2.5, mb: 0.2, py: itemPy, px: 1.5,
                transition: 'all 0.15s ease',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.03)', transform: 'translateX(3px)' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 34, color: TEXT_TERTIARY, '& svg': { fontSize: { xs: 20, sm: 24 } } }}>
                <HelpOutlineOutlined />
              </ListItemIcon>
              <ListItemText
                primary='How It Works'
                primaryTypographyProps={{ fontWeight: 500, fontSize: { xs: '0.82rem', sm: '0.84rem' }, color: 'text.secondary' }}
              />
            </ListItemButton>
            {legalItems.map((item) => (
              <ListItemButton
                key={item.path}
                onClick={() => handleNav(item.path)}
                sx={{
                  borderRadius: 2.5, mb: 0.2, py: itemPy, px: 1.5,
                  transition: 'all 0.15s ease',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.03)', transform: 'translateX(3px)' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 34, color: TEXT_TERTIARY, '& svg': { fontSize: { xs: 20, sm: 24 } } }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: 500, fontSize: { xs: '0.82rem', sm: '0.84rem' }, color: 'text.secondary' }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* App version + logout */}
        <Box sx={{ px: 2, pb: { xs: 2, sm: 3.5 } }}>
          <Divider sx={{ mb: { xs: 1, sm: 2 } }} />
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2.5,
              color: 'error.main',
              py: itemPy,
              px: 1.5,
              transition: 'all 0.15s ease',
              '&:hover': { bgcolor: 'rgba(211,47,47,0.06)' },
            }}
          >
            <ListItemIcon sx={{ minWidth: 34, color: 'inherit' }}>
              <Logout fontSize='small' />
            </ListItemIcon>
            <ListItemText
              primary='Log out'
              primaryTypographyProps={{ fontWeight: 700, fontSize: { xs: '0.82rem', sm: '0.88rem' } }}
            />
          </ListItemButton>
          <Typography variant='caption' color={TEXT_TERTIARY} sx={{ px: 1.5, mt: 1, display: 'block', fontSize: '0.68rem' }}>
            Winnbell v1.0 · {new Date().getFullYear()}
          </Typography>
        </Box>
      </Box>
    </Drawer>

    {/* How It Works Modal */}
    <HowItWorksModal open={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} />
    </Fragment>
  );
};

export default AppMenuDrawer;
