import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { Storefront, EmojiEvents, CardGiftcard } from '@mui/icons-material';
import {
  GRADIENT_HERO, GRADIENT_HERO_WARM, ALPHA_WHITE_15, ALPHA_WHITE_20,
  ALPHA_WHITE_30, ALPHA_WHITE_70,
} from '../../../shared/colors';

export interface BulletItem {
  icon: React.ReactNode;
  text: string;
}

const DEFAULT_BULLETS: BulletItem[] = [
  { icon: <Storefront sx={{ fontSize: 18 }} />, text: 'Earn entries at local businesses' },
  { icon: <EmojiEvents sx={{ fontSize: 18 }} />, text: 'Claim your weekly entry - no purchase needed' },
  { icon: <CardGiftcard sx={{ fontSize: 18 }} />, text: 'Compete for real cash prizes every month' },
];

interface AuthBrandPanelProps {
  headline?: React.ReactNode;
  tagline?: string;
  bullets?: BulletItem[];
  isBusinessVariant?: boolean;
  /** Optional extra content under the tagline/bullets (e.g. the contact page's email chip). */
  footer?: React.ReactNode;
}

const AuthBrandPanel: React.FC<AuthBrandPanelProps> = ({
  headline = (
    <>
      Cash Prizes.<br />Every Month.
    </>
  ),
  tagline = 'Join thousands of members supporting local businesses and competing for real monthly prizes. No purchase necessary.',
  bullets = DEFAULT_BULLETS,
  isBusinessVariant = false,
  footer,
}) => (
  <Box
    sx={{
      width: { md: '42%', lg: '45%', xl: '48%' },
      background: isBusinessVariant ? GRADIENT_HERO_WARM : GRADIENT_HERO,
      display: { xs: 'none', md: 'flex' },
      flexDirection: 'column',
      p: { md: 6, lg: 7, xl: 8 },
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* Decorative orbs */}
    <Box sx={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', bgcolor: ALPHA_WHITE_15, filter: 'blur(60px)' }} />
    <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: '50%', bgcolor: ALPHA_WHITE_15, filter: 'blur(50px)' }} />

    {/* Brand row at top: app name only */}
    <Stack direction='row' alignItems='center' spacing={1.5} mb='auto'>
      <Box component='img' src='/winnbell_app_name_white.svg' alt='Winnbell' sx={{ height: 36, width: 'auto', objectFit: 'contain' }} />
      {isBusinessVariant && (
        <Typography
          component='span'
          sx={{
            fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: ALPHA_WHITE_70, border: `1px solid ${ALPHA_WHITE_30}`, borderRadius: '6px',
            px: 0.9, py: 0.3, ml: 0.5, lineHeight: 1.4,
          }}
        >
          Business
        </Typography>
      )}
    </Stack>

    {/* Headline + Tagline + Bullets pushed to bottom via margin-top: auto */}
    <Box sx={{ mt: 'auto' }}>
      {/* Headline */}
      <Typography variant='h2' sx={{ fontWeight: 800, lineHeight: 1.1, letterSpacing: -0.03, mb: 2, fontSize: { md: 40, lg: 44, xl: 48 } }}>
        {headline}
      </Typography>
      {tagline && (
        <Typography sx={{ fontSize: { md: 15, xl: 16 }, opacity: 0.82, mb: bullets.length > 0 ? 4 : 0, lineHeight: 1.7, maxWidth: { md: 340, xl: 380 } }}>
          {tagline}
        </Typography>
      )}

      {/* Feature bullets */}
      {bullets.length > 0 && (
        <Stack spacing={2}>
          {bullets.map((item, i) => (
            <Stack key={i} direction='row' alignItems='center' spacing={1.75}>
              <Box sx={{ width: 38, height: 38, borderRadius: '11px', bgcolor: ALPHA_WHITE_15, border: `1px solid ${ALPHA_WHITE_20}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {item.icon}
              </Box>
              <Typography sx={{ fontSize: 14, fontWeight: 600, opacity: 0.92 }}>{item.text}</Typography>
            </Stack>
          ))}
        </Stack>
      )}

      {footer && <Box sx={{ mt: 3.5 }}>{footer}</Box>}
    </Box>
  </Box>
);

export default AuthBrandPanel;
