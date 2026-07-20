import { Box, Typography } from '@mui/material';
import type { IDrawResult } from '../types';
import { calculateDaysLeft, formatCurrency } from '../../../shared/utils/date';
import {
  PRIMARY_MAIN, PRIMARY_DEEP, BG_SURFACE, BORDER_SUBTLE,
  TEXT_HEADING, TEXT_TERTIARY, ACCENT_GOLD, ACCENT_GOLD_LIGHT, ACCENT_GOLD_DARK,
   ALPHA_WHITE_20, ALPHA_WHITE_80, ALPHA_PRIMARY_10,
} from '../../../shared/colors';

interface CampaignSwiperCardProps {
  draw: IDrawResult;
}

const CampaignSwiperCard = ({ draw }: CampaignSwiperCardProps) => {
  const isOpen = draw.status?.toLowerCase() === 'open';
  const isUpcoming = draw.status?.toLowerCase() === 'upcoming';
  const hasWinner = !!draw.winner_name;
  const daysLeft = calculateDaysLeft(draw.draw_date);
  // A hidden upcoming prize arrives as NULL - tease it instead of showing a number.
  const prizeHidden = draw.prize_amount == null;
  const prize = !prizeHidden ? formatCurrency(draw.prize_amount!) : '$ Revealing soon';
  const drawnDate = new Date(draw.closed_at ?? draw.draw_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const startsDate = draw.start_date
    ? new Date(draw.start_date).toLocaleDateString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric' })
    : null;

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        width: '100%',
        
        borderRadius: '20px',
        overflow: 'hidden',
        p: { xs: 1.75, md: 2 },
        background: isOpen ? `linear-gradient(150deg, ${PRIMARY_MAIN} 0%, ${PRIMARY_DEEP} 100%)` : BG_SURFACE,
        color: isOpen ? '#fff' : TEXT_HEADING,
        border: isOpen ? 'none' : `1px solid ${BORDER_SUBTLE}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: { xs: 0.6, md: 0.75 },
      }}
    >
      {/* Closed: blue left stripe accent */}
      {!isOpen && <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, bgcolor: PRIMARY_MAIN }} />}
      {/* Decorative orb (radial fade - no hard edge) */}
      <Box sx={{ position: 'absolute', top: '-22%', right: '-10%', width: 130, height: 130, borderRadius: '50%', background: isOpen ? 'radial-gradient(circle, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 45%, transparent 70%)' : `radial-gradient(circle, ${ACCENT_GOLD}24 0%, ${ACCENT_GOLD}0d 45%, transparent 70%)`, pointerEvents: 'none' }} />

      {/* Header: name + status pill */}
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <Typography noWrap sx={{ fontSize: { xs: '0.95rem', md: '1rem' }, fontWeight: 800, color: isOpen ? ALPHA_WHITE_80 : TEXT_HEADING, minWidth: 0 }}>
          {draw.name}
        </Typography>
        {isOpen ? (
          <Box sx={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 0.6, bgcolor: ALPHA_WHITE_20, borderRadius: '999px', px: 1.1, py: 0.4 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#fff', animation: 'livePulse 2s ease-in-out infinite', '@keyframes livePulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } } }} />
            <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.06em' }}>LIVE</Typography>
          </Box>
        ) : isUpcoming ? (
          <Typography sx={{ flexShrink: 0, bgcolor: ACCENT_GOLD_LIGHT, border: `1.5px solid ${ACCENT_GOLD}`, borderRadius: '999px', px: 1.1, py: 0.35, color: ACCENT_GOLD_DARK, fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.06em' }}>
            UPCOMING
          </Typography>
        ) : (
          <Typography sx={{ flexShrink: 0, bgcolor: ALPHA_PRIMARY_10, border: `1.5px solid ${PRIMARY_MAIN}`, borderRadius: '999px', px: 1.1, py: 0.35, color: PRIMARY_MAIN, fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.06em' }}>
            CLOSED
          </Typography>
        )}
      </Box>

      {/* Prize - hero element */}
      <Typography
        sx={{
          position: 'relative',
          // The "Coming soon" tease is longer than a dollar figure - step it down so it fits.
          fontSize: prizeHidden ? { xs: '1.3rem', md: '1.5rem' } : { xs: '1.75rem', md: '2rem' },
          fontWeight: 900,
          letterSpacing: '-0.03em',
          lineHeight: 1,
          ...(isOpen ? {} : {
            background: `linear-gradient(135deg, ${PRIMARY_MAIN} 0%, ${PRIMARY_DEEP} 100%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }),
        }}
      >
        {prize}
      </Typography>

      {/* Footer: days left (open) or winner pill + drawn date (closed) */}
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        {isOpen ? (
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.85 }}>
            {daysLeft <= 0 ? 'Ends today' : `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`}
          </Typography>
        ) : isUpcoming ? (
          <Typography sx={{ color: TEXT_TERTIARY, fontSize: '0.8rem', fontWeight: 600 }}>
            {startsDate ? `Starts ${startsDate}` : 'Starting soon'}
          </Typography>
        ) : (
          <>
            {hasWinner && (
              <Typography sx={{ bgcolor: ACCENT_GOLD_LIGHT, border: `1px solid ${ACCENT_GOLD}55`, borderRadius: '999px', px: 1.1, py: 0.35, color: ACCENT_GOLD_DARK, fontSize: '0.7rem', fontWeight: 800 }}>
                Winner announced
              </Typography>
            )}
            <Typography sx={{ color: TEXT_TERTIARY, fontSize: '0.8rem', fontWeight: 600 }}>
              Drawn {drawnDate}
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
};

export default CampaignSwiperCard;
