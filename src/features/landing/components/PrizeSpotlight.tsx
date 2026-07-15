import { useState } from 'react';
import { Box, Typography, Stack, Container } from '@mui/material';
import AttractButton from '../../../shared/components/AttractButton';
import { CalendarMonthRounded, EmojiEventsRounded } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useGetDraws } from '../../draw/hooks/useGetDraws';
import { formatCurrency } from '../../../shared/utils/date';
import {
  GRADIENT_DRAW_CARD, GOLD_TROPHY, ACCENT_GOLD_LIGHT, ALPHA_WHITE_15, ALPHA_WHITE_80, PRIMARY_MAIN,
} from '../../../shared/colors';

interface PrizeSpotlightProps {
  onNavigate: (path: string) => void;
}

/**
 * "This month's prize" card - pulled live from the open draw so it updates
 * itself every campaign. Renders nothing when no draw is open.
 */
const PrizeSpotlight = ({ onNavigate }: PrizeSpotlightProps) => {
  const { data: draws } = useGetDraws();
  // Captured once on mount - day-level precision, so it never needs to tick.
  const [now] = useState(() => Date.now());
  const openDraw = draws?.find((d) => d.status?.toLowerCase() === 'open');
  if (!openDraw?.prize_amount || !openDraw.draw_date) return null;

  const daysLeft = Math.max(0, Math.ceil((new Date(openDraw.draw_date).getTime() - now) / 86_400_000));
  const prize = formatCurrency(Number(openDraw.prize_amount));

  return (
    // No top padding: the HowItWorks section above already carries a large bottom padding.
    <Box sx={{ pt: 0, pb: { xs: 4, md: 6 }, px: { xs: 2.5, md: 0 }, bgcolor: 'background.default' }}>
      <Container maxWidth='sm'>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 4,
              background: GRADIENT_DRAW_CARD,
              color: '#fff',
              p: { xs: 3, md: 4.5 },
              textAlign: 'center',
              boxShadow: '0 24px 48px -20px rgba(15,39,71,0.5)',
            }}
          >
            {/* Gold glow orb (radial gradient, no filter:blur) */}
            <Box sx={{ position: 'absolute', top: -110, right: -80, width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${GOLD_TROPHY}2e 0%, ${GOLD_TROPHY}10 45%, transparent 70%)`, pointerEvents: 'none' }} />

            <Stack spacing={{ xs: 2, md: 2.5 }} alignItems='center' sx={{ position: 'relative', zIndex: 1 }}>
              <Typography sx={{ color: ACCENT_GOLD_LIGHT, fontWeight: 800, fontSize: { xs: '0.7rem', md: '0.75rem' }, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                This month's prize
              </Typography>

              <Typography sx={{ color: GOLD_TROPHY, fontWeight: 900, fontSize: { xs: '3.4rem', md: '4.5rem' }, lineHeight: 1, letterSpacing: '-0.02em', textShadow: '0 4px 24px rgba(251,191,36,0.35)' }}>
                {prize}
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2.5 }} alignItems='center' justifyContent='center'>
                <Stack direction='row' spacing={0.75} alignItems='center' sx={{ whiteSpace: 'nowrap' }}>
                  <CalendarMonthRounded sx={{ fontSize: 17, color: ACCENT_GOLD_LIGHT, flexShrink: 0 }} />
                  <Typography sx={{ color: ALPHA_WHITE_80, fontWeight: 600, fontSize: { xs: '0.85rem', md: '0.9rem' }, lineHeight: 1 }}>
                    {daysLeft === 0 ? 'Campaign ends today' : daysLeft === 1 ? 'Campaign ends tomorrow' : `Campaign ends in ${daysLeft} days`}
                  </Typography>
                </Stack>
                <Stack direction='row' spacing={0.75} alignItems='center' sx={{ whiteSpace: 'nowrap' }}>
                  <EmojiEventsRounded sx={{ fontSize: 17, color: ACCENT_GOLD_LIGHT, flexShrink: 0 }} />
                  <Typography sx={{ color: ALPHA_WHITE_80, fontWeight: 600, fontSize: { xs: '0.85rem', md: '0.9rem' }, lineHeight: 1 }}>
                    One winner selected every month
                  </Typography>
                </Stack>
              </Stack>

              <AttractButton
                variant='contained'
                size='large'
                onClick={() => onNavigate('/register')}
                sx={{
                  bgcolor: '#fff',
                  color: PRIMARY_MAIN,
                  fontWeight: 800,
                  fontSize: { xs: '0.95rem', md: '1rem' },
                  px: { xs: 3, md: 5 },
                  py: { xs: 1.3, md: 1.5 },
                  mt: 0.5,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.92)', boxShadow: '0 12px 32px rgba(0,0,0,0.3)' },
                }}
              >
                Join this month's campaign
              </AttractButton>

              <Typography sx={{ color: ALPHA_WHITE_80, fontSize: '0.72rem', bgcolor: ALPHA_WHITE_15, borderRadius: 99, px: 1.5, py: 0.4 }}>
                Free to join. No purchase necessary.
              </Typography>
            </Stack>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default PrizeSpotlight;
