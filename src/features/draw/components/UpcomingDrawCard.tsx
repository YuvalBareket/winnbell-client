// components/tickets/UpcomingDrawCard.tsx
import { Box, Typography, Paper } from '@mui/material';
import { Schedule, ConfirmationNumber } from '@mui/icons-material';
import type { IDrawSummary } from '../../myTickets/types/myTicket.types';
import { calculateDaysLeft, formatCurrency } from '../../../shared/utils/date';

// Use destructuring here to get the 'draw' property from props
export const UpcomingDrawCard = ({ draw }: { draw: IDrawSummary | null }) => {
  // Now draw refers to the actual IDrawSummary object
  const daysLeft = calculateDaysLeft(draw?.draw_date);
  const formattedAmount = formatCurrency(draw?.total_pool_amount ?? 0);

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
        background: 'linear-gradient(135deg, #0052CC 0%, #0747A6 100%)',
        color: 'white',
        boxShadow: '0px 20px 25px -5px rgba(0, 82, 204, 0.3)',
      }}
    >
      {/* Decorative Blur Orbs */}
      <Box
        sx={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: 192,
          height: 192,
          bgcolor: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          filter: 'blur(48px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: 128,
          height: 128,
          bgcolor: 'rgba(66, 165, 245, 0.2)',
          borderRadius: '50%',
          filter: 'blur(32px)',
        }}
      />

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
          {draw?.name || 'Upcoming Draw Prize'}
        </Typography>

        <Typography
          variant='h2'
          sx={{ fontWeight: 900, mb: 3, fontSize: '3.5rem' }}
        >
          {formattedAmount}
        </Typography>

        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: 'rgba(255,255,255,0.15)',
            px: 2,
            py: 1,
            borderRadius: 50,
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <Schedule sx={{ fontSize: 18 }} />
          <Typography variant='body2' sx={{ fontWeight: 600 }}>
            {daysLeft <= 0 ? 'Drawing Today' : `Draw in: ${daysLeft} days`}
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
