import { UpcomingDrawCard } from './UpcomingDrawCard';
import { Box, Skeleton, Stack, Typography } from '@mui/material';
import { EmojiEventsOutlined, Schedule } from '@mui/icons-material';
import { useGetDraws } from '../hooks/useGetDraws';
import { useEffect, useRef } from 'react';
import { ALPHA_PRIMARY_10, PRIMARY_MAIN } from '../../../shared/colors';
import { calculateDaysLeft, formatCurrency } from '../../../shared/utils/date';

interface DrawSwiperProps {
  draw_id: number | null;
  onDrawChange: (drawId: number) => void;
  compact?: boolean;
}

export const DrawSwiper = ({ onDrawChange, draw_id, compact = false }: DrawSwiperProps) => {
  const { data: draws, isLoading } = useGetDraws();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!draw_id && draws && draws.length > 0) {
      onDrawChange(draws[0].id);
    }
  }, [draws, onDrawChange]);

  // Sync scroll position when draw_id changes externally
  useEffect(() => {
    if (!scrollRef.current || !draws || !draw_id) return;
    const index = draws.findIndex((d) => d.id === draw_id);
    if (index < 0) return;
    const el = scrollRef.current;
    el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' });
  }, [draw_id, draws]);

  const handleScroll = () => {
    if (!scrollRef.current || !draws) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const index = Math.round(scrollLeft / clientWidth);
    if (draws[index] && draws[index].id !== draw_id) {
      onDrawChange(draws[index].id);
    }
  };
  if (isLoading) {
    return (
      <Box sx={{ p: 2, pt: '0px', pb: 7 }}>
        <Skeleton
          variant='rectangular'
          width='100%' // Match the SwiperSlide width
          height={220} // Match your card height
          sx={{
            margin: '0 auto', // Center it like the centered slide
            transform: 'none',
            borderRadius: 4, // IMPORTANT: Match your UpcomingDrawCard borderRadius
            boxShadow: '0px 10px 20px rgba(0,0,0,0.1)', // Subtle shadow to mimic the card
          }}
        />
      </Box>
    );
  }
  if (!draws || draws?.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6, px: 3 }}>
        <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: ALPHA_PRIMARY_10, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
          <EmojiEventsOutlined sx={{ fontSize: 32, color: 'primary.main' }} />
        </Box>
        <Typography variant='subtitle1' fontWeight={700} color='text.secondary'>No active campaigns right now</Typography>
        <Typography variant='body2' color='text.disabled' sx={{ mt: 0.5 }}>Check back soon. New campaigns are added regularly.</Typography>
      </Box>
    );
  }
  // Desktop compact mode: clean selectable list of draw items
  if (compact) {
    return (
      <Box sx={{ maxHeight: 'calc(100dvh - 220px)', overflowY: 'auto', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
        {draws.map((draw, index) => {
          const isActive = draw_id === draw.id;
          const daysLeft = calculateDaysLeft(draw.draw_date);
          const drawName = draw.name;
          return (
            <Box
              key={draw.id}
              onClick={() => onDrawChange(draw.id)}
              sx={{
                px: 2.5,
                py: 2,
                cursor: 'pointer',
                borderLeft: '3px solid',
                borderLeftColor: isActive ? PRIMARY_MAIN : 'transparent',
                bgcolor: isActive ? 'rgba(2,146,183,0.05)' : 'transparent',
                borderBottom: index < draws.length - 1 ? '1px solid' : 'none',
                borderBottomColor: 'divider',
                transition: 'background 0.15s, border-color 0.15s',
                '&:hover': {
                  bgcolor: isActive ? 'rgba(2,146,183,0.05)' : 'action.hover',
                },
              }}
            >
              <Typography
                variant='body2'
                fontWeight={700}
                noWrap
                color={isActive ? 'primary.main' : 'text.secondary'}
                sx={{ mb: 0.25 }}
              >
                {drawName}
              </Typography>
              <Typography
                variant='h6'
                fontWeight={900}
                color={isActive ? 'primary.main' : 'text.primary'}
                sx={{ lineHeight: 1.1, mb: 0.75 }}
              >
                {formatCurrency(draw.prize_amount)}
              </Typography>
              <Stack direction='row' alignItems='center' spacing={0.5}>
                <Schedule sx={{ fontSize: 12, color: 'text.disabled' }} />
                <Typography variant='caption' color='text.disabled' fontWeight={600}>
                  {daysLeft <= 0 ? 'Campaign ends today' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`}
                </Typography>
              </Stack>
            </Box>
          );
        })}
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        ref={scrollRef}
        onScroll={handleScroll}
        sx={{
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
          px: 2,
          pt: 1,
          pb: 0,
          gap: 2,
        }}
      >
        {draws.map((draw) => (
          <Box
            key={draw.id}
            sx={{ flex: '0 0 calc(100% - 32px)', scrollSnapAlign: 'center' }}
          >
            <UpcomingDrawCard draw={draw} />
          </Box>
        ))}
      </Box>

      {/* Dot indicators - only when multiple draws */}
      {draws.length > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.75, mt: -2, mb: 1 }}>
          {draws.map((draw) => (
            <Box
              key={draw.id}
              onClick={() => onDrawChange(draw.id)}
              sx={{
                width: draw.id === draw_id ? 16 : 6,
                height: 6,
                borderRadius: 3,
                bgcolor: draw.id === draw_id ? 'primary.main' : 'divider',
                transition: 'width 0.25s ease, background-color 0.25s ease',
                cursor: 'pointer',
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};
