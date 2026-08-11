// Shared admin UI primitives - the single card/tile recipe for every admin tab,
// matching the app-wide design language (colors.ts tokens + motion.ts entrances).
import React from 'react';
import { Box, Paper, Skeleton, Stack, Typography } from '@mui/material';
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

/** Skeleton twin of StatCard - same card, tile, label and value geometry, so the
 *  loaded card lands exactly where its placeholder was. */
export const StatCardSkeleton = () => (
  <AdminCard sx={{ height: '100%', p: 2.25 }}>
    <Stack spacing={1} alignItems='flex-start'>
      <Skeleton variant='rounded' width={40} height={40} sx={{ borderRadius: '12px' }} />
      <Skeleton variant='text' width='55%' />
      <Skeleton variant='text' width='40%' sx={{ fontSize: '1.5rem' }} />
      <Skeleton variant='text' width='70%' sx={{ fontSize: '0.75rem' }} />
    </Stack>
  </AdminCard>
);

/** Rounded block skeleton matching the AdminCard radius - for hero cards, tables, forms. */
export const AdminCardSkeleton = ({ height, sx }: { height: number; sx?: SxProps<Theme> }) => (
  <Skeleton variant='rounded' height={height} sx={{ borderRadius: '15px', ...sx }} />
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
