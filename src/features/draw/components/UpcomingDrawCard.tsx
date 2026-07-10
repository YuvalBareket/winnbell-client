// components/tickets/UpcomingDrawCard.tsx
import { Box, Typography, Paper } from '@mui/material';
import { Schedule, ConfirmationNumber } from '@mui/icons-material';
import type { IDrawSummary } from '../types';
import { calculateDaysLeft, formatCurrency } from '../../../shared/utils/date';
import {
  GRADIENT_HERO, ALPHA_WHITE_10, ALPHA_WHITE_15, ALPHA_WHITE_20, ALPHA_WHITE_70, SHADOW_CARD,
  GOLD_TROPHY, ACCENT_GOLD_LIGHT,
} from '../../../shared/colors';
import { goldShineSx } from './goldShine';

// Use destructuring here to get the 'draw' property from props
export const UpcomingDrawCard = ({ draw }: { draw: IDrawSummary | null }) => {
  // Now draw refers to the actual IDrawSummary object
  const daysLeft = calculateDaysLeft(draw?.draw_date);
  const formattedAmount = formatCurrency(draw?.prize_amount ?? 0);
  // A closed campaign is in the past, so a days-left countdown would wrongly read
  // "Campaign Ends Today". Show that it has ended instead.
  const isClosed = draw?.status?.toLowerCase() === 'closed';

  return (
    <Paper
      elevation={10}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 4,
        width: '100%',
        p: 4,
        mb: 4,
        background: GRADIENT_HERO,
        color: 'white',
        boxShadow: SHADOW_CARD,
      }}
    >
      {/* Decorative glow orbs. Radial gradients, NOT filter:blur - blurred children break
          the card's rounded clipping and box-shadow on Android. */}
      <Box
        sx={{
          position: 'absolute',
          top: '-25%',
          right: '-12%',
          width: 280,
          height: 280,
          background: `radial-gradient(circle, ${ALPHA_WHITE_10} 0%, transparent 68%)`,
          borderRadius: '50%',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-14%',
          left: '-7%',
          width: 190,
          height: 190,
          background: 'radial-gradient(circle, rgba(66, 165, 245, 0.2) 0%, transparent 68%)',
          borderRadius: '50%',
        }}
      />

      {/* LIVE NOW / ENDED badge - top-right corner */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 11,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          px: 1.25,
          py: 0.5,
          borderRadius: 50,
          bgcolor: ALPHA_WHITE_15,
          border: `1px solid ${ALPHA_WHITE_20}`,
        }}
      >
        {!isClosed && <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: GOLD_TROPHY }} />}
        <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: isClosed ? ALPHA_WHITE_70 : ACCENT_GOLD_LIGHT }}>
          {isClosed ? 'Ended' : 'Live now'}
        </Typography>
      </Box>

      <Box sx={{ position: 'relative', zIndex: 10 }}>
        <Typography
          variant='subtitle2'
          sx={{
            fontWeight: 600,
            letterSpacing: 1,
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.8)',
            mb: 0.5,
          }}
        >
          {draw?.name || 'Upcoming Campaign Prize'}
        </Typography>

        {/* Prize - shimmering gold for the live campaign, plain white once it has ended. */}
        <Typography
          variant='h2'
          sx={{
            fontWeight: 900,
            mb: 3,
            lineHeight: 1,
            fontSize: { xs: '2.2rem', sm: '3rem', md: '3.5rem' },
            ...(isClosed ? { color: 'white' } : goldShineSx),
          }}
        >
          {formattedAmount}
        </Typography>

        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: ALPHA_WHITE_15,
            px: 2,
            py: 1,
            borderRadius: 50,
            border: `1px solid ${ALPHA_WHITE_20}`,
          }}
        >
          <Schedule sx={{ fontSize: 18 }} />
          <Typography variant='body2' sx={{ fontWeight: 600 }}>
            {isClosed
              ? 'Campaign ended'
              : daysLeft <= 0
                ? 'Campaign Ends Today'
                : `Campaign ends in: ${daysLeft} days`}
          </Typography>
        </Box>
      </Box>

      <ConfirmationNumber
        sx={{
          position: 'absolute',
          right: 24,
          bottom: 24,
          fontSize: 80,
          opacity: 0.2,
          transform: 'rotate(12deg)',
        }}
      />
    </Paper>
  );
};
