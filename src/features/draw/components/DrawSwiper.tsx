import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, EffectCoverflow } from 'swiper/modules';
import type { Swiper as SwiperClass } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

import { UpcomingDrawCard } from './UpcomingDrawCard';
import { Box, Skeleton, Stack, Typography } from '@mui/material';
import { EmojiEventsOutlined } from '@mui/icons-material';
import { useGetDraws } from '../hooks/useGetDraws';
import { useEffect, useState } from 'react';
import { ALPHA_PRIMARY_10 } from '../../../shared/colors';

interface DrawSwiperProps {
  draw_id: number | null;
  onDrawChange: (drawId: number) => void;
}

export const DrawSwiper = ({ onDrawChange, draw_id }: DrawSwiperProps) => {
  const { data: draws, isLoading } = useGetDraws();
  const [swiperInstance, setSwiperInstance] = useState<SwiperClass | null>(null);
  useEffect(() => {
    if (!draw_id)
      if (draws && draws.length > 0) {
        onDrawChange(draws[0].id);
      }
  }, [draws, onDrawChange]);
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
        <Typography variant='subtitle1' fontWeight={700} color='text.secondary'>No active draws right now</Typography>
        <Typography variant='body2' color='text.disabled' sx={{ mt: 0.5 }}>Check back soon — new draws are added regularly.</Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ width: '100%', mb: 0 ,mt:'-10px'}}>
      <Swiper
        slideToClickedSlide={true} // Swiper built-in: moves slide to center on click
        onSwiper={setSwiperInstance} // Capture the instance
        effect={'coverflow'}
        grabCursor={true}
        centeredSlides={true}
        coverflowEffect={{
          rotate: 15,
          stretch: 25,
          depth: 100,
          modifier: 3,

          slideShadows: false,
        }}
        onSlideChange={(swiper) => onDrawChange(draws[swiper.activeIndex].id)}
        modules={[EffectCoverflow, Pagination]}
        style={{ padding: '10px 40px 0px 40px' }}
      >
        {draws?.map((draw, index) => (
          <SwiperSlide
            key={draw.id}
            onClick={() => {
              if (swiperInstance) swiperInstance.slideTo(index);
            }}
            style={{
              height: 'fit-content',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <UpcomingDrawCard draw={draw} />
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};
