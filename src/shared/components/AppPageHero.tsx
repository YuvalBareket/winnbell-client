import { useState, type ReactNode } from 'react';
import { Box, Stack, Typography, IconButton, Avatar, Tooltip, CircularProgress, Paper } from '@mui/material';
import { NotificationsNoneOutlined, NotificationsActiveOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAppSelector } from '../../store/hook';
import { selectCurrentUser } from '../../store/selectors/authSelectors';
import { getUserInitials } from '../utils/string';
import { useNotifications } from '../../features/notifications/useNotifications';
import NotificationPermissionDialog from '../../features/notifications/NotificationPermissionDialog';
import { useInstallPromptTrigger } from '../../features/install/InstallPromptContext';
import { useMenuDrawer } from '../context/MenuDrawerContext';
import {
  GRADIENT_HERO, GRADIENT_PRIMARY, ALPHA_WHITE_15, ALPHA_WHITE_20, ALPHA_WHITE_30,
  TEXT_HEADING, TEXT_SECONDARY, BG_SURFACE, BORDER_LIGHT, SHADOW_CARD,
} from '../colors';

interface AppPageHeroProps {
  /** Optional. When omitted (and no subtitle), the mobile hero shows only the brand row
   *  (app name + notification + menu) and the desktop topbar is not rendered at all. */
  title?: string;
  subtitle?: string;
  /** Optional right-aligned status chip beside the title. */
  chip?: ReactNode;
  /** Optional controls rendered below the title (rare - most controls stay in body cards). */
  actions?: ReactNode;
  /**
   * 'hero' (default): full gradient band on mobile, slim topbar on desktop.
   * 'floating': transparent notification + menu buttons only, for full-bleed pages (map).
   */
  variant?: 'hero' | 'floating';
}

// Notification + menu (avatar) buttons - shared by hero and floating variants. On the gradient
// they render white; the avatar opens the single app menu drawer via context. Exported so
// pages with a bespoke header (e.g. Settings) keep the SAME notification + menu actions.
export const HeroActions = ({ onGradient = true }: { onGradient?: boolean }) => {
  const user = useAppSelector(selectCurrentUser);
  const initials = getUserInitials(user?.fullName);
  const { subscribe, unsubscribe, isPending, isSupported, isSubscribed } = useNotifications();
  const { openInstallDialog } = useInstallPromptTrigger();
  const { openMenu } = useMenuDrawer();
  const [notifDialogOpen, setNotifDialogOpen] = useState(false);

  return (
    <>
      <Stack direction='row' alignItems='center' spacing={1}>
        <Tooltip title={!isSupported ? 'Install the app to enable notifications' : isSubscribed ? 'Turn off notifications' : 'Enable notifications'}>
          <IconButton
            size='small'
            onClick={() => {
              if (!isSupported) { openInstallDialog(); return; }
              if (isSubscribed) { unsubscribe(); } else { setNotifDialogOpen(true); }
            }}
            disabled={isPending}
            sx={{
              color: onGradient ? 'white' : 'text.secondary',
              bgcolor: onGradient ? (isSubscribed ? ALPHA_WHITE_30 : ALPHA_WHITE_15) : 'rgba(0,0,0,0.04)',
              border: onGradient ? `1px solid ${ALPHA_WHITE_20}` : 'none',
              borderRadius: '10px',
              width: 40, height: 40,
              '&:hover': { bgcolor: onGradient ? ALPHA_WHITE_30 : 'rgba(0,0,0,0.08)' },
              '&:active': { transform: 'scale(0.9)', transition: 'transform 150ms ease-out' },
            }}
          >
            {isPending
              ? <CircularProgress size={18} color='inherit' />
              : isSubscribed
                ? <NotificationsActiveOutlined sx={{ fontSize: 20 }} />
                : <NotificationsNoneOutlined sx={{ fontSize: 20 }} />}
          </IconButton>
        </Tooltip>

        <IconButton
          onClick={openMenu}
          size='small'
          aria-label='Open menu'
          sx={{ p: 0, '&:hover': { bgcolor: 'transparent' }, '&:active': { transform: 'scale(0.9)', transition: 'transform 150ms ease-out' } }}
        >
          <Avatar
            sx={{
              width: 40, height: 40,
              background: onGradient ? '#fff' : GRADIENT_PRIMARY,
              color: onGradient ? 'primary.main' : 'white',
              fontWeight: 800, fontSize: 13, borderRadius: '12px',
            }}
          >
            {initials}
          </Avatar>
        </IconButton>
      </Stack>

      <NotificationPermissionDialog
        open={notifDialogOpen}
        onClose={() => setNotifDialogOpen(false)}
        onAllow={() => { subscribe(); setNotifDialogOpen(false); }}
      />
    </>
  );
};

const AppPageHero = ({ title, subtitle, chip, actions, variant = 'hero' }: AppPageHeroProps) => {
  // Floating: just the buttons, absolutely positioned over full-bleed content (map).
  if (variant === 'floating') {
    return (
      <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1200, display: { xs: 'flex', md: 'none' } }}>
        <HeroActions onGradient={false} />
      </Box>
    );
  }

  return (
    <>
      {/* MOBILE - gradient hero band with brand row + title inside. zIndex keeps the notif/menu
          buttons clickable above overflow-visible page content (coverflow deck, camera view). */}
      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
          background: GRADIENT_HERO,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 5,
          borderRadius: '0 0 28px 28px',
          // Brand row spacing/sizes match the original AppHeader: 12px sides, 38px name, and the
          // row sits near the top (plus a safe-area inset so it clears the status bar / notch).
          px: 1.5,
          pt: 'calc(env(safe-area-inset-top, 0px) + 10px)',
          pb: (title || subtitle) ? 2.5 : 1.75,
        }}
      >
        {/* Glow orb: radial gradient, not filter:blur - blurred children break the band's
            rounded-bottom clipping on Android. */}
        <Box sx={{ position: 'absolute', top: -110, right: -90, width: 320, height: 320, borderRadius: '50%', background: `radial-gradient(circle, ${ALPHA_WHITE_15} 0%, transparent 68%)`, pointerEvents: 'none' }} />

        <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ position: 'relative' }}>
          <Box component='img' src='/winnbell_app_name_white.svg' alt='Winnbell' sx={{ height: 36, width: 'auto', objectFit: 'contain' }} />
          <HeroActions />
        </Stack>

        {/* Title block - optional. Omitted when the page passes no title/subtitle (e.g. Submit /
            My Entries), leaving just the brand row. Plain fade (no spring/translate): the header
            re-mounts on every navigation, and a bouncy y-spring made the text jump and ghost
            against the gradient as titles swapped. */}
        {(title || subtitle) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
            <Stack direction='row' alignItems='flex-end' justifyContent='space-between' spacing={1.5} sx={{ position: 'relative', mt: 1.5, px: 1 }}>
              <Box sx={{ minWidth: 0 }}>
                {title && <Typography variant='h5' fontWeight={700} noWrap sx={{ letterSpacing: '-0.02em' }}>{title}</Typography>}
                {subtitle && (
                  <Typography variant='body2' sx={{ opacity: 0.8, mt: 0.25 }}>{subtitle}</Typography>
                )}
              </Box>
              {chip && <Box sx={{ flexShrink: 0 }}>{chip}</Box>}
            </Stack>
            {actions && <Box sx={{ mt: 2, position: 'relative' }}>{actions}</Box>}
          </motion.div>
        )}
      </Box>

      {/* DESKTOP - the title/subtitle/actions sit in a white card (the sidebar owns brand + notif
          + menu). Fully optional: not rendered when the page provides none of them. */}
      {(title || subtitle || chip || actions) && (
        <Box sx={{ display: { xs: 'none', md: 'block' }, px: 3.25, pt: 1.75, pb: 0.5 }}>
          <Paper
            elevation={0}
            sx={{
              bgcolor: BG_SURFACE,
              border: `1px solid ${BORDER_LIGHT}`,
              boxShadow: SHADOW_CARD,
              borderRadius: '15px',
              px: 3, py: 2,
              display: 'flex',
              // On narrow desktops the title + wide controls collide, so the actions drop below
              // the text (column) and only sit beside it on wide screens (lg+).
              flexDirection: { md: 'column', lg: 'row' },
              alignItems: { md: 'flex-start', lg: 'center' },
              justifyContent: 'space-between',
              gap: { md: 1.5, lg: 2 },
            }}
          >
            {/* Desktop card: text only (no icon), plus optional action buttons on the right. */}
            <Box sx={{ minWidth: 0 }}>
              {title && <Typography variant='h6' fontWeight={800} sx={{ color: TEXT_HEADING, letterSpacing: '-0.02em', lineHeight: 1.2 }} noWrap>{title}</Typography>}
              {subtitle && <Typography variant='body2' sx={{ color: TEXT_SECONDARY }}>{subtitle}</Typography>}
            </Box>
            {(chip || actions) && (
              <Stack direction='row' alignItems='center' spacing={1.5} sx={{ flexShrink: 0, maxWidth: '100%' }}>
                {chip}
                {actions}
              </Stack>
            )}
          </Paper>
        </Box>
      )}
    </>
  );
};

export default AppPageHero;
