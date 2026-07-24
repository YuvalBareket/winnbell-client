// Shared admin UI primitives - the single card/tile recipe for every admin tab,
// matching the app-wide design language (colors.ts tokens + motion.ts entrances).
import React from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { motion } from 'framer-motion';
import { popIn } from '../../../../shared/motion';
import {
  BG_SURFACE, BORDER_LIGHT, SHADOW_CARD, SHADOW_CARD_HOVER,
  TEXT_HEADING, TEXT_SECONDARY, TEXT_TERTIARY,
} from '../../../../shared/colors';

/** White surface card - the one card style used across the admin area. */
export const AdminCard = ({ children, sx, hover = false }: {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  /** Lifts on hover - use for clickable cards only. */
  hover?: boolean;
}) => (
  <Paper
    elevation={0}
    sx={{
      bgcolor: BG_SURFACE,
      border: `1px solid ${BORDER_LIGHT}`,
      borderRadius: '15px',
      boxShadow: SHADOW_CARD,
      overflow: 'hidden',
      ...(hover && {
        transition: 'box-shadow 200ms ease, transform 200ms ease',
        '&:hover': { boxShadow: SHADOW_CARD_HOVER, transform: 'translateY(-2px)' },
      }),
      ...sx,
    }}
  >
    {children}
  </Paper>
);

/** Tinted 40px icon tile used at the top of KPI cards and section headers. */
export const IconTile = ({ icon, tint, color, size = 40 }: {
  icon: React.ReactNode;
  /** Background tint, e.g. PRIMARY_TINT or an ALPHA_* token. */
  tint: string;
  /** Icon color token. */
  color: string;
  size?: number;
}) => (
  <Box
    sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, borderRadius: '12px',
      bgcolor: tint, color, flexShrink: 0,
      '& svg': { fontSize: size * 0.55 },
    }}
  >
    {icon}
  </Box>
);

/** KPI stat card: icon tile + label + big value + caption. Pops in via motion. */
export const StatCard = ({ icon, tint, color, label, value, caption }: {
  icon: React.ReactNode;
  tint: string;
  color: string;
  label: string;
  value: React.ReactNode;
  caption?: React.ReactNode;
}) => (
  <motion.div variants={popIn} style={{ height: '100%' }}>
    <AdminCard sx={{ height: '100%', p: 2.25 }}>
      <Stack spacing={1} alignItems='flex-start'>
        <IconTile icon={icon} tint={tint} color={color} />
        <Typography variant='body2' sx={{ color: TEXT_SECONDARY }}>{label}</Typography>
        <Typography variant='h5' sx={{ fontWeight: 800, color: TEXT_HEADING, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          {value}
        </Typography>
        {caption && (
          <Typography variant='caption' sx={{ color: TEXT_TERTIARY }}>{caption}</Typography>
        )}
      </Stack>
    </AdminCard>
  </motion.div>
);

/** Section heading row: small icon tile + bold title + optional right-side action. */
export const SectionHeader = ({ icon, tint, color, title, action }: {
  icon?: React.ReactNode;
  tint?: string;
  color?: string;
  title: string;
  action?: React.ReactNode;
}) => (
  <Stack direction='row' alignItems='center' justifyContent='space-between' spacing={1.5} sx={{ mb: 2 }}>
    <Stack direction='row' alignItems='center' spacing={1.25} sx={{ minWidth: 0 }}>
      {icon && tint && color && <IconTile icon={icon} tint={tint} color={color} size={34} />}
      <Typography variant='subtitle1' noWrap sx={{ fontWeight: 800, color: TEXT_HEADING, letterSpacing: '-0.01em' }}>
        {title}
      </Typography>
    </Stack>
    {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
  </Stack>
);
