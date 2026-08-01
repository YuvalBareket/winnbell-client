import {
  Box, Avatar, Typography, Stack, Chip, IconButton, Menu, List, ListItem,
} from '@mui/material';
import {
  Check, PersonAdd, Logout,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '../../store/hook';
import { selectCanAddAccount } from '../../store/selectors/authSelectors';
import { useAccountSwitcher } from '../hooks/useAccountSwitcher';
import { getUserInitials, getRoleLabel, getRoleColor } from '../utils/string';
import {
  TEXT_HEADING, TEXT_SECONDARY, ALPHA_PRIMARY_04,
  ALPHA_PRIMARY_06, BORDER_LIGHT, PRIMARY_MAIN, ERROR_MAIN, ERROR_HOVER_BG,
} from '../colors';

interface AccountSwitcherProps {
  // 'menu' (default): anchored popover for the desktop sidebar (not a modal, no focus trap).
  // 'inline': renders the list directly, for embedding in the mobile drawer (a Menu nested in a
  // Drawer hits the Drawer's focus trap and will not open, so mobile uses inline expansion).
  variant?: 'menu' | 'inline';
  anchorEl?: HTMLElement | null;
  open?: boolean;
  onClose: () => void;
}

const AccountSwitcher = ({ variant = 'menu', anchorEl = null, open = false, onClose }: AccountSwitcherProps) => {
  const navigate = useNavigate();
  const { accounts, activeAccountId, switchTo, remove } = useAccountSwitcher();
  const canAddAccount = useAppSelector(selectCanAddAccount);
  const [removingId, setRemovingId] = useState<number | null>(null);
  // With a single saved account, removing it is just "Log out" (a button that already exists
  // right below the switcher) - hide the per-row remove control to avoid a confusing duplicate.
  const showRemove = accounts.length > 1;

  const handleSwitchTo = async (id: number) => {
    if (id !== activeAccountId) {
      onClose();
      await switchTo(id);
    }
  };

  const handleRemove = async (id: number) => {
    setRemovingId(id);
    await remove(id);
    setRemovingId(null);
    onClose();
  };

  const handleAddAccount = () => {
    onClose();
    navigate('/login?add=1');
  };

  const body = (
    <Box sx={{ p: 1 }}>
      <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <AnimatePresence>
          {accounts.map((account, index) => {
            const { user } = account;
            const isActive = user.id === activeAccountId;
            const initials = getUserInitials(user.fullName);
            const isAdmin = user.role === 'Admin';
            const isBusiness = user.role === 'Business' && !user.location_id;
            const isManager = user.role === 'Business' && !!user.location_id;
            const roleLabel = getRoleLabel(isAdmin, isBusiness, isManager);
            const roleColor = getRoleColor(isAdmin, isBusiness, isManager);

            return (
              <motion.div
                key={`account-${user.id}`}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: index * 0.05, duration: 0.2, ease: 'easeOut' }}
                layout
              >
                <ListItem
                  disablePadding
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1,
                    borderRadius: 1.5,
                    bgcolor: isActive ? ALPHA_PRIMARY_06 : 'transparent',
                    cursor: isActive ? 'default' : 'pointer',
                    transition: 'all 0.15s ease',
                    border: isActive ? `1px solid ${PRIMARY_MAIN}20` : '1px solid transparent',
                    '&:hover': { bgcolor: isActive ? ALPHA_PRIMARY_06 : ALPHA_PRIMARY_04 },
                  }}
                  onClick={() => !isActive && handleSwitchTo(user.id)}
                >
                  <Avatar
                    alt=''
                    src={user.businessLogoUrl ? `${import.meta.env.VITE_R2_PUBLIC_URL}/business-logos/${user.businessLogoUrl}` : undefined}
                    sx={{
                      width: 36, height: 36,
                      bgcolor: !user.businessLogoUrl ? `${roleColor}20` : undefined,
                      color: roleColor, fontWeight: 700, fontSize: 12, borderRadius: '10px', flexShrink: 0,
                      border: isActive ? `2px solid ${PRIMARY_MAIN}` : `1px solid ${roleColor}30`,
                    }}
                  >
                    {initials}
                  </Avatar>

                  <Box flex={1} minWidth={0}>
                    <Typography variant="body2" fontWeight={700} noWrap color={TEXT_HEADING} sx={{ lineHeight: 1.2 }}>
                      {user.fullName}
                    </Typography>
                    <Typography variant="caption" color={TEXT_SECONDARY} noWrap sx={{ display: 'block', lineHeight: 1.2 }}>
                      {user.email}
                    </Typography>
                  </Box>

                  <Chip
                    label={roleLabel}
                    size="small"
                    sx={{
                      height: 18, fontSize: '0.6rem', fontWeight: 800,
                      bgcolor: `${roleColor}12`, color: roleColor, border: `1px solid ${roleColor}20`,
                      flexShrink: 0, borderRadius: '6px',
                    }}
                  />

                  <Stack direction="row" alignItems="center" spacing={0.25} sx={{ flexShrink: 0 }}>
                    {isActive && (
                      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.15 }}>
                        <Check sx={{ fontSize: 16, color: PRIMARY_MAIN }} />
                      </motion.div>
                    )}
                    {showRemove && (
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); handleRemove(user.id); }}
                        disabled={removingId === user.id}
                        aria-label={isActive ? 'Log out of this account' : 'Remove this account'}
                        sx={{
                          width: 28, height: 28, color: ERROR_MAIN,
                          transition: 'all 0.15s ease',
                          '&:hover': { color: ERROR_MAIN, bgcolor: ERROR_HOVER_BG },
                          '&:disabled': { opacity: 0.4 },
                        }}
                      >
                        <Logout sx={{ fontSize: 16 }} />
                      </IconButton>
                    )}
                  </Stack>
                </ListItem>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {canAddAccount && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: accounts.length * 0.05, duration: 0.2, ease: 'easeOut' }}
          >
            <Box
              role="button"
              tabIndex={0}
              onClick={handleAddAccount}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleAddAccount(); } }}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1,
                borderRadius: 1.5, cursor: 'pointer', transition: 'all 0.15s ease',
                border: `1px dashed ${BORDER_LIGHT}`,
                '&:hover': { bgcolor: ALPHA_PRIMARY_04, borderColor: PRIMARY_MAIN },
              }}
            >
              <Avatar sx={{ width: 36, height: 36, bgcolor: ALPHA_PRIMARY_06, color: PRIMARY_MAIN, fontWeight: 700, borderRadius: '10px', flexShrink: 0 }}>
                <PersonAdd sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography variant="body2" fontWeight={600} color={PRIMARY_MAIN}>
                Add account
              </Typography>
            </Box>
          </motion.div>
        )}
      </List>
    </Box>
  );

  // Inline variant for the mobile drawer: caller controls mounting (a Collapse), so just render
  // the list. No Menu wrapper -> no nested-modal focus trap.
  if (variant === 'inline') {
    return body;
  }

  // Menu variant for the desktop sidebar (sidebar is not a modal, so the anchored Menu works).
  return (
    <Menu
      anchorEl={anchorEl}
      open={open && !!anchorEl}
      onClose={onClose}
      PaperProps={{
        sx: {
          minWidth: 280, borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: `1px solid ${BORDER_LIGHT}`, overflow: 'hidden',
        },
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
    >
      {body}
    </Menu>
  );
};

export default AccountSwitcher;
