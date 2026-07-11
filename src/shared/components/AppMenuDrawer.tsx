import {
  Drawer,
  Box,
  Typography,
  Avatar,
  List,
  ListItemIcon,
  ListItemText,
  Stack,
  Divider,
  Chip,
  Collapse,
  useMediaQuery,
} from '@mui/material';
import TapListItemButton from './TapListItemButton';
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
  SettingsOutlined,
  CampaignOutlined,
  HelpOutlineOutlined,
  DashboardOutlined,
  PeopleOutlined,
  NotificationsOutlined,
  CardGiftcardOutlined,
  UnfoldMore,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, Fragment } from 'react';
import { useAppSelector } from '../../store/hook';
import { selectCurrentUser, selectIsBusiness, selectIsLocationManager, selectIsAdmin, selectBusinessIsActive, selectBusinessLogoUrl, selectAccounts, selectCanAddAccount } from '../../store/selectors/authSelectors';
import { useLogout } from '../hooks/useLogout';
import {
  ALPHA_WHITE_15,
  ALPHA_WHITE_20,
  ALPHA_WHITE_30,
  ALPHA_WHITE_70,
  PRIMARY_MAIN,
  GRADIENT_HERO,
  TEXT_TERTIARY,
  ALPHA_PRIMARY_06,
} from '../colors';
import { getUserInitials, getRoleLabel } from '../utils/string';
import HowItWorksModal from '../../features/help/components/HowItWorksModal';
import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
import { useInstallPromptTrigger } from '../../features/install/InstallPromptContext';
import AccountSwitcher from './AccountSwitcher';

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
  // Available whenever the user can switch (2 accounts) OR add one (under the cap), so a
  // single-account user can still reach "Add account".
  const showSwitcher = accounts.length > 1 || canAddAccount;
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  // Mobile uses an inline expansion (not a nested Menu, which the Drawer's focus trap blocks).
  const [switcherExpanded, setSwitcherExpanded] = useState(false);
  const { canInstall, openInstallDialog } = useInstallPromptTrigger();
  const showInstallOption = canInstall;

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
        { label: 'Notifications', icon: <NotificationsOutlined />, path: '/admin/notifications' },
        { label: 'Settings', icon: <SettingsOutlined />, path: '/admin/settings' },
      ]
    : isBusiness
    ? [
        { label: 'Business Hub', icon: <BusinessOutlined />, path: '/nearby' },
        { label: 'Campaign Dashboard', icon: <CampaignOutlined />, path: '/campaign' },
        { label: 'Analytics', icon: <BarChartOutlined />, path: '/stats' },
        { label: 'Campaigns Hub', icon: <EmojiEventsOutlined />, path: '/draws/history' },
        { label: 'My Plan', icon: <ReceiptLongOutlined />, path: businessIsActive ? '/subscription/manage' : '/subscribe' },
        { label: 'Marketing', icon: <CampaignOutlined />, path: '/marketing' },
        { label: 'Settings', icon: <SettingsOutlined />, path: '/settings' },
      ]
    : isManager
    ? [
        { label: 'Business Hub', icon: <BusinessOutlined />, path: '/nearby' },
        { label: 'Campaign Dashboard', icon: <CampaignOutlined />, path: '/campaign' },
        { label: 'Analytics', icon: <BarChartOutlined />, path: '/stats' },
        { label: 'Settings', icon: <SettingsOutlined />, path: '/settings' },
      ]
    : [
        { label: 'Nearby Partners', icon: <StorefrontOutlined />, path: '/nearby' },
        { label: 'Entry submission', icon: <ReceiptLongOutlined />, path: '/scan' },
        { label: 'My Entries', icon: <ConfirmationNumberOutlined />, path: '/tickets' },
        { label: 'Campaigns Hub', icon: <EmojiEventsOutlined />, path: '/draws/history' },
        { label: 'Invite Friends', icon: <CardGiftcardOutlined />, path: '/invite' },
        { label: 'Settings', icon: <SettingsOutlined />, path: '/settings' },
      ];

  const legalItems: NavItem[] = [
    { label: 'Terms of Service', icon: <GavelOutlined />, path: '/terms' },
    { label: 'Privacy Policy', icon: <PrivacyTipOutlined />, path: '/privacy' },
    ...((isBusiness || isManager) ? [{ label: 'Business Agreement', icon: <ArticleOutlined />, path: '/business-agreement' }] : []),
  ];

  // Short viewports (small phones, or a phone with the browser chrome visible) get tighter spacing
  // so the whole menu fits. The nav area also scrolls as a fallback so nothing is ever clipped.
  const isShort = useMediaQuery('(max-height:720px)');
  const itemPy = { xs: isShort ? 0.35 : 0.65, sm: 1.1 };
  const sectionMy = { xs: isShort ? 0.4 : 0.75, sm: 1.5 };
  const labelMb = { xs: isShort ? 0.25 : 0.4, sm: 0.75 };

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
          background: GRADIENT_HERO,
          flexShrink: 0,
          px: 3,
          pt: { xs: isShort ? 1.5 : 2.5, sm: 5.5 },
          pb: { xs: isShort ? 1.25 : 2, sm: 4 },
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

          <Stack
            direction='row'
            spacing={2}
            alignItems='center'
            sx={{
              position: 'relative',
              zIndex: 1,
              cursor: showSwitcher ? 'pointer' : 'default',
              transition: 'all 0.15s ease',
              borderRadius: 1.5,
              px: 0.5,
              py: 0.5,
              mx: -0.5,
              '&:hover': {
                bgcolor: showSwitcher ? ALPHA_WHITE_15 : 'transparent',
              },
            }}
            onClick={() => showSwitcher && setSwitcherExpanded((v) => !v)}
          >
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
                  borderRadius: '6px',
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            </Box>
            {showSwitcher && (
              <UnfoldMore
                sx={{
                  fontSize: 18,
                  color: 'white',
                  flexShrink: 0,
                  transition: 'transform 0.2s ease',
                  transform: switcherExpanded ? 'scaleY(-1)' : 'scaleY(1)',
                }}
              />
            )}
          </Stack>
        </Box>

        {/* Scrollable middle: guarantees the nav + support are always reachable on short phones
            instead of being clipped by the drawer's fixed-height column. */}
        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain' }}>

        {/* Inline account switcher (expands under the hero). Its onClose fires on an actual
            action (switch / remove / add) - close the WHOLE drawer then, not just the section,
            so the user lands on the new account's page unobstructed. */}
        <Collapse in={switcherExpanded} timeout={220} unmountOnExit>
          <Box sx={{ px: 1, pt: 1 }}>
            <AccountSwitcher variant='inline' onClose={() => { setSwitcherExpanded(false); onClose(); }} />
          </Box>
        </Collapse>

        {/* Main nav */}
        <Box sx={{ px: 2, pt: { xs: 1.5, sm: 2.5 } }}>
          <Typography variant='caption' fontWeight={700} color={TEXT_TERTIARY}
            sx={{ px: 1, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', mb: labelMb, fontSize: '0.63rem' }}>
            Navigation
          </Typography>
          <List disablePadding>
            {mainNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
              <TapListItemButton
                key={item.path}
                onTap={() => handleNav(item.path)}
                sx={{
                  borderRadius: 2.5,
                  mb: 0.2,
                  py: itemPy,
                  px: 1.5,
                  transition: 'all 0.15s ease',
                  bgcolor: isActive ? PRIMARY_MAIN : 'transparent',
                  '&:hover': {
                    bgcolor: isActive ? PRIMARY_MAIN : ALPHA_PRIMARY_06,
                    transform: isActive ? 'none' : 'translateX(3px)',
                  },
                  '&:hover .nav-icon': { color: isActive ? 'white' : PRIMARY_MAIN },
                  '&:hover .nav-chevron': { opacity: 1, transform: 'translateX(2px)' },
                }}
              >
                <ListItemIcon
                  className='nav-icon'
                  sx={{ minWidth: 34, color: isActive ? 'white' : 'text.secondary', transition: 'color 0.15s ease', '& svg': { fontSize: { xs: 20, sm: 24 } } }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: isActive ? 700 : 600, fontSize: { xs: '0.82rem', sm: '0.88rem' }, letterSpacing: '-0.01em', color: isActive ? 'white' : 'inherit' }}
                />
                <ChevronRight
                  className='nav-chevron'
                  sx={{
                    fontSize: 16, color: isActive ? 'white' : 'text.disabled',
                    opacity: isActive ? 0.9 : 0.4, transition: 'all 0.15s ease',
                  }}
                />
              </TapListItemButton>
            );
            })}
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
            {showInstallOption && (
              <TapListItemButton
                onTap={() => { openInstallDialog(); onClose(); }}
                sx={{
                  borderRadius: 2.5, mb: 0.2, py: itemPy, px: 1.5,
                  transition: 'all 0.15s ease',
                  '&:hover': { bgcolor: ALPHA_PRIMARY_06, transform: 'translateX(3px)' },
                  '&:hover .nav-icon': { color: PRIMARY_MAIN },
                }}
              >
                <ListItemIcon className='nav-icon' sx={{ minWidth: 34, color: PRIMARY_MAIN, '& svg': { fontSize: { xs: 20, sm: 24 } } }}>
                  <GetAppOutlinedIcon />
                </ListItemIcon>
                <ListItemText
                  primary='Install App'
                  primaryTypographyProps={{ fontWeight: 600, fontSize: { xs: '0.82rem', sm: '0.84rem' }, color: PRIMARY_MAIN }}
                />
              </TapListItemButton>
            )}
            <TapListItemButton
              onTap={handleHowItWorks}
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
            </TapListItemButton>
            {legalItems.map((item) => (
              <TapListItemButton
                key={item.path}
                onTap={() => handleNav(item.path)}
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
              </TapListItemButton>
            ))}
          </List>
        </Box>

        </Box>

        {/* App version + logout (pinned below the scroll area) */}
        <Box sx={{ px: 2, pb: { xs: isShort ? 1 : 2, sm: 3.5 }, flexShrink: 0 }}>
          <Divider sx={{ mb: { xs: 1, sm: 2 } }} />
          <TapListItemButton
            onTap={handleLogout}
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
          </TapListItemButton>
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
