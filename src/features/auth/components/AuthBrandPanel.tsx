import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { ConfirmationNumber, Storefront, EmojiEvents, CardGiftcard } from '@mui/icons-material';
import {
  GRADIENT_HERO, ALPHA_WHITE_15, ALPHA_WHITE_20, ALPHA_WHITE_30,
} from '../../../shared/colors';

export interface BulletItem {
  icon: React.ReactNode;
  text: string;
}

const DEFAULT_BULLETS: BulletItem[] = [
  { icon: <Storefront sx={{ fontSize: 18 }} />, text: 'Earn entries at local businesses' },
  { icon: <EmojiEvents sx={{ fontSize: 18 }} />, text: 'Claim your free weekly entry - no purchase needed' },
  { icon: <CardGiftcard sx={{ fontSize: 18 }} />, text: 'Compete for real cash prizes every month' },
];

interface AuthBrandPanelProps {
  headline?: React.ReactNode;
  tagline?: string;
  bullets?: BulletItem[];
}

const AuthBrandPanel: React.FC<AuthBrandPanelProps> = ({
  headline = (
    <>
      Real Prizes.<br />Every Month.
    </>
  ),
  tagline = 'Join thousands of members supporting local businesses and competing for real monthly prizes. No purchase necessary.',
  bullets = DEFAULT_BULLETS,
}) => (
  <Box
    sx={{
      width: '50%',
      background: GRADIENT_HERO,
      display: { xs: 'none', md: 'flex' },
      flexDirection: 'column',
      justifyContent: 'center',
      p: 6,
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* Decorative orbs */}
    <Box sx={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', bgcolor: ALPHA_WHITE_15, filter: 'blur(60px)' }} />
    <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: '50%', bgcolor: 'rgba(66,165,245,0.2)', filter: 'blur(50px)' }} />

    {/* Logo */}
    <Stack direction='row' alignItems='center' spacing={1.5} mb={5}>
      <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: ALPHA_WHITE_20, border: `1px solid ${ALPHA_WHITE_30}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ConfirmationNumber sx={{ fontSize: 24 }} />
      </Box>
      <Typography variant='h5' fontWeight={900} letterSpacing={-0.5}>Winnbell</Typography>
    </Stack>

    {/* Headline */}
    <Typography variant='h3' fontWeight={900} lineHeight={1.15} mb={2}>
      {headline}
    </Typography>
    {tagline && (
      <Typography variant='body1' sx={{ opacity: 0.8, mb: bullets.length > 0 ? 5 : 0, lineHeight: 1.7, maxWidth: 340 }}>
        {tagline}
      </Typography>
    )}

    {/* Feature bullets */}
    {bullets.length > 0 && (
      <Stack spacing={2.5}>
        {bullets.map((item, i) => (
          <Stack key={i} direction='row' alignItems='center' spacing={1.5}>
            <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: ALPHA_WHITE_15, border: `1px solid ${ALPHA_WHITE_20}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {item.icon}
            </Box>
            <Typography variant='body2' fontWeight={600} sx={{ opacity: 0.9 }}>{item.text}</Typography>
          </Stack>
        ))}
      </Stack>
    )}
  </Box>
);

export default AuthBrandPanel;
