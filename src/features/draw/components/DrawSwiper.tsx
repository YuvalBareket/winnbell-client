import { UpcomingDrawCard } from './UpcomingDrawCard';
import { Box, Skeleton, Stack, Typography, useTheme, useMediaQuery } from '@mui/material';
import { EmojiEventsOutlined, Schedule } from '@mui/icons-material';
import { useGetDraws, useGetDrawHistory } from '../hooks/useGetDraws';
import { useEffect, useMemo, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import {
  ALPHA_PRIMARY_10, PRIMARY_MAIN,
  SHADOW_PRIMARY_GLOW, SHADOW_FLOAT, SHADOW_CARD,
} from '../../../shared/colors';
import { calculateDaysLeft, formatCurrency } from '../../../shared/utils/date';
import type { IDrawResult } from '../types';

interface DrawSwiperProps {
  draw_id: number | null;
  onDrawChange: (drawId: number) => void;
  compact?: boolean;
}

export const DrawSwiper = ({ onDrawChange, draw_id, compact = false }: DrawSwiperProps) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { data: draws, isLoading } = useGetDraws();
  const { data: history } = useGetDrawHistory();

  // Mobile coverflow deck sizing
  const [deckEl, setDeckEl] = useState<HTMLDivElement | null>(null);
  const [deckSize, setDeckSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!deckEl) return;
    const ro = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width);
      const height = Math.round(entry.contentRect.height);
      setDeckSize(prev => (prev.width === width && prev.height === height ? prev : { width, height }));
    });
    ro.observe(deckEl);
    return () => ro.disconnect();
  }, [deckEl]);

  // Mobile deck order = current (open) first, then closed newest-first. history itself is
  // draw_date DESC, so history[0] can be a closed draw with a far-future date (e.g. a seed/test
  // draw). Ordering here so the initial selection and the centered slide always agree.
  const mobileCampaigns = useMemo<IDrawResult[]>(() => {
    const h = history ?? [];
    const open = h.filter(d => d.status?.toLowerCase() === 'open');
    const closed = h.filter(d => d.status?.toLowerCase() === 'closed');
    return [...open, ...closed];
  }, [history]);

  useEffect(() => {
    // Seed from the SAME ordered list the deck renders, so draw_id matches slide 0 (the current
    // draw). Using raw history[0] here selected the wrong draw and loaded another draw's entries.
    const initList = compact ? draws : (isDesktop ? draws : mobileCampaigns);
    if (!draw_id && initList && initList.length > 0) {
      onDrawChange(initList[0].id);
    }
  }, [draws, mobileCampaigns, draw_id, onDrawChange, compact, isDesktop]);

  if (isLoading) {
    return (
      <Box sx={{ p: 2, pt: '0px', pb: 7 }}>
        <Skeleton
          variant='rectangular'
          width='100%'
          height={220}
          sx={{
            margin: '0 auto',
            transform: 'none',
            borderRadius: 4,
            boxShadow: '0px 10px 20px rgba(0,0,0,0.1)',
          }}
        />
      </Box>
    );
  }

  // Determine which data source to use
  const data = compact ? draws : (isDesktop ? draws : history);

  if (!data || data.length === 0) {
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
        {data.map((draw, index) => {
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
                borderBottom: index < data.length - 1 ? '1px solid' : 'none',
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

  // Mobile: horizontal coverflow deck
  if (!isDesktop && mobileCampaigns.length > 0) {
    // Single ordered source (current first, then closed) shared with the init effect above.
    const allCampaigns = mobileCampaigns;

    // Wide banner card sits near full-width; the side cards tuck behind its left/right edges.
    // On a narrow screen a positive stretch would fling the neighbours off-screen, so we pull
    // them slightly inward (negative stretch) to leave a visible peek behind the active card.
    const cardWidth = Math.max(200, Math.round(deckSize.width * 0.86));
    const stretch = -Math.round(cardWidth * 0.4);

    return (
      <Box
        ref={setDeckEl}
        sx={{
          flexShrink: 0,
          height: 210,
          // Clip the horizontal axis only (the off-screen slides of the wide coverflow wrapper
          // would otherwise widen the whole document and make the mobile browser zoom the page
          // out to fit). 'clip' (not 'hidden') keeps overflow-y visible so the card glow / peek
          // above and below is not turned into a scroll container.
          overflowX: 'clip',
          '& .swiper': {
            width: '100%',
            height: '100%',
            mx: 'auto',
            overflow: 'visible',
          },
          '& .swiper-slide': {
            width: `${cardWidth}px`,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            pointerEvents: 'none',
            transitionProperty: 'transform',
          },
          '& .swiper-slide-active, & .swiper-slide-next, & .swiper-slide-prev': {
            opacity: 1,
            pointerEvents: 'auto',
          },
          // No CSS filter here: a filter rasterizes the card into its own buffer, and the 3D
          // coverflow transform then resamples that buffer, which softens the text. The glow
          // shadow alone marks the active card. Crispness is handled by the Swiper roundLengths
          // prop (whole-pixel positions); backface-visibility is intentionally NOT set - on mobile
          // it made the card text flicker/vanish mid-swipe inside Swiper's preserve-3d context.
          '& .swiper-slide-active > div': {
            boxShadow: `${SHADOW_PRIMARY_GLOW}, ${SHADOW_FLOAT}`,
            transition: 'box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          '& .swiper-slide-next > div, & .swiper-slide-prev > div': {
            boxShadow: SHADOW_CARD,
            transition: 'box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          '& .swiper-slide > div::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            opacity: 0,
            pointerEvents: 'none',
            zIndex: 3,
            transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          // Horizontal deck: prev = left card (inner/contact edge = its right),
          // next = right card (inner edge = its left).
          '& .swiper-slide-prev > div::after': {
            opacity: 1,
            background: 'linear-gradient(to left, rgba(6,20,44,0.32) 0%, rgba(6,20,44,0.18) 26%, rgba(6,20,44,0.07) 50%, rgba(6,20,44,0) 80%)',
          },
          '& .swiper-slide-next > div::after': {
            opacity: 1,
            background: 'linear-gradient(to right, rgba(6,20,44,0.32) 0%, rgba(6,20,44,0.18) 26%, rgba(6,20,44,0.07) 50%, rgba(6,20,44,0) 80%)',
          },
          '& .swiper-slide-active > div::after': {
            opacity: 0,
          },
        }}
      >
        {deckSize.width > 0 && (
          <Swiper
            key={`mobile-horizontal-${Math.round(stretch / 20)}`}
            effect="coverflow"
            spaceBetween={-120}
            coverflowEffect={{
              rotate: -27,
              stretch,
              depth: 400,
              modifier: 1,
              slideShadows: false,
            }}
            grabCursor
            modules={[EffectCoverflow]}
            direction="horizontal"
            centeredSlides
            slidesPerView="auto"
            // Round slide sizes/positions to whole pixels. centeredSlides was leaving the wrapper
            // on a fractional (half) pixel, which renders the active card's text on a subpixel
            // boundary and makes it look blurry.
            roundLengths
            loop={false}
            speed={420}
            slideToClickedSlide
            onSlideChange={(swiper) => {
              const realIndex = swiper.realIndex;
              if (allCampaigns[realIndex]) {
                onDrawChange(allCampaigns[realIndex].id);
              }
            }}
          >
            {allCampaigns.map((draw) => (
              <SwiperSlide key={draw.id}>
                <UpcomingDrawCard draw={draw} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </Box>
    );
  }

  // Desktop or fallback: single card
  const activeDraw = data.find((d) => d.id === draw_id) ?? data[0];

  return (
    <Box sx={{ px: 4, pt: 1 }}>
      <UpcomingDrawCard draw={activeDraw} />
    </Box>
  );
};
