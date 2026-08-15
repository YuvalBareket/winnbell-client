import { useState } from 'react';
import {
  Box, Container, Typography, Paper, Stack, Skeleton,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import AppPageHero from '../../../shared/components/AppPageHero';
import { EmojiEventsOutlined } from '@mui/icons-material';
import EmptyState from '../../../shared/components/EmptyState';
import { useGetDrawHistory } from '../hooks/useGetDraws';
import {
  PRIMARY_MAIN, BORDER_LIGHT, SHADOW_CARD, SHADOW_FLOAT, SHADOW_PRIMARY_GLOW,
} from '../../../shared/colors';
import CampaignSwiperCard from '../components/CampaignSwiperCard';
import { DrawResultDetail } from '../components/DrawResultDetail';
import MapBusinessPopup from '../../nearBy/components/MapBusinessPopup';
import type { IDrawResult } from '../types';
import { staggerContainer, popIn, riseIn, SPRING_POP } from '../../../shared/motion';

const DrawHistoryPage = () => {
  // null until the user swipes - the effective selection then falls back to the start
  // slide (the current campaign), so the detail below always matches the centered card.
  const [selectedDrawIndex, setSelectedDrawIndex] = useState<number | null>(null);
  const [profileLocationId, setProfileLocationId] = useState<number | null>(null);
  const { data: history, isLoading, isError } = useGetDrawHistory();
  const [swiperInst, setSwiperInst] = useState<SwiperType | null>(null);

  const activeCampaigns = history?.filter(d => d.status?.toLowerCase() === 'open') ?? [];
  const closedCampaigns = history?.filter(d => d.status?.toLowerCase() === 'closed') ?? [];
  // The soonest upcoming campaign sits as the LEFT neighbour of the current one.
  const nextUpcoming = (history?.filter(d => d.status?.toLowerCase() === 'upcoming') ?? [])
    .sort((a, b) => new Date(a.draw_date).getTime() - new Date(b.draw_date).getTime())[0];

  // Deck order: [next upcoming] [CURRENT - starts centered] [prev] [prev-1] ... No loop:
  // the deck ends at the upcoming campaign on the left and the oldest one on the right.
  const allCampaigns: IDrawResult[] = [
    ...(nextUpcoming ? [nextUpcoming] : []),
    ...activeCampaigns,
    ...closedCampaigns,
  ];
  const startIndex = nextUpcoming && (activeCampaigns.length + closedCampaigns.length) > 0 ? 1 : 0;
  const effectiveIndex = selectedDrawIndex ?? startIndex;
  const selectedDraw = allCampaigns[effectiveIndex] || null;

  return (
    // xs: AppPageHero renders inside this box, so only the 76px bottom nav is external; / 0.9 cancels the xs zoom so the fixed page fills the viewport exactly
    // overflow-x: clip (not hidden) contains the coverflow deck's horizontal peek WITHOUT turning
    // this box into a vertical scroll container. 'hidden' forces overflow-y to compute to 'auto'
    // (CSS spec), which created a second, inner scrollbar competing with the document.
    <Box sx={{ overflowX: 'clip', display: 'flex', flexDirection: 'column' }}>
      <AppPageHero
        title='Campaigns Hub'
        subtitle='Track active campaigns and winner history'
      />

      <Container maxWidth='lg' sx={{ flex: 1, display: 'flex', flexDirection: 'column', pt: { xs: 2.5, md: 3 }, pb: 1.5, px: 3, position: 'relative', zIndex: 1 }}>
        {/* Campaign deck. Lives INSIDE the Container so it centres exactly like every other
            block on the page; the negative mx on mobile cancels the Container padding so the
            slides run edge to edge there. Fixed slide widths + centeredSlides = the design's
            "big centre card, dimmed peeks on both sides". */}
        {!isLoading && history && history.length > 0 && allCampaigns.length > 0 && (
          <Box
            component={motion.div}
            variants={riseIn}
            initial='hidden'
            animate='visible'
            sx={{
              pt: { xs: 0.75, md: 1.5 },
              // Optical centering: the left margin is pulled 20px further than the right, which
              // moves the deck's centre 10px left - countering the right lean from the scrollbar.
              mr: { xs: -3, md: 0 },
              ml: { xs: '-44px', md: '-20px' },
              '& .swiper': { overflow: 'visible' },
              '& .swiper-slide': {
                width: { xs: '76%', sm: 360, md: 380 },
                height: { xs: 122, md: 140 },
                transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s cubic-bezier(0.4,0,0.2,1)',
                transform: 'scale(0.84)',
                opacity: 0.5,
              },
              '& .swiper-slide > div': { boxShadow: SHADOW_CARD },
              '& .swiper-slide-active': { transform: 'scale(1)', opacity: 1, zIndex: 2 },
              '& .swiper-slide-active > div': { boxShadow: `${SHADOW_PRIMARY_GLOW}, ${SHADOW_FLOAT}` },
            }}
          >
            <Swiper
              onSwiper={setSwiperInst}
              centeredSlides
              slidesPerView='auto'
              spaceBetween={12}
              breakpoints={{ 900: { spaceBetween: 26 } }}
              grabCursor
              loop={false}
              initialSlide={startIndex}
              speed={420}
              slideToClickedSlide
              onSlideChange={(swiper) => setSelectedDrawIndex(swiper.activeIndex)}
            >
              {allCampaigns.map((draw) => (
                <SwiperSlide key={draw.id}>
                  {/* Dimmed side cards are inactive previews (swipe/click brings them to
                      focus at full contrast). aria-disabled marks them as inactive UI so
                      the WCAG contrast exemption for inactive components applies. */}
                  {({ isActive }) => (
                    // borderRadius must match CampaignSwiperCard's 20px: the deck's shadow
                    // rules target the slide's direct child, which is now this wrapper -
                    // without the radius the shadow renders square corners behind the card.
                    <Box aria-disabled={!isActive || undefined} sx={{ height: '100%', borderRadius: '20px' }}>
                      <CampaignSwiperCard draw={draw} />
                    </Box>
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
            {/* Dots below the deck (mt clears the active card's glow shadow) */}
            <Box
              component={motion.div}
              variants={staggerContainer}
              initial='hidden'
              animate='visible'
              sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', mt: 6 }}
            >
              {allCampaigns.map((_, i) => (
                <Box
                  key={i}
                  component={motion.div}
                  variants={popIn}
                  role='button'
                  tabIndex={0}
                  aria-label={`Go to campaign ${i + 1}`}
                  onClick={() => swiperInst?.slideTo(i)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); swiperInst?.slideTo(i); } }}
                  sx={{ height: 6, borderRadius: '3px', cursor: 'pointer', transition: 'width 0.3s ease, background-color 0.3s ease', width: i === effectiveIndex ? 20 : 6, bgcolor: i === effectiveIndex ? PRIMARY_MAIN : BORDER_LIGHT }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Error state */}
        {isError && (
          <motion.div
            variants={riseIn}
            initial='hidden'
            animate='visible'
          >
            <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'error.light',
              bgcolor: 'error.50',
              mb: 3,
            }}
          >
            <Typography color='error'>
              Failed to load campaign history. Please try again.
            </Typography>
            </Paper>
          </motion.div>
        )}

        {/* Loading state */}
        {isLoading && (
          <motion.div
            variants={riseIn}
            initial='hidden'
            animate='visible'
          >
            <Stack spacing={{ xs: 3, md: 10.75 }}>
              {/* Deck skeleton: the centered featured card */}
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Skeleton
                  variant='rounded'
                  sx={{
                    width: { xs: '100%', md: 300 },
                    maxWidth: 340,
                    height: { xs: 150, md: 200 },
                    borderRadius: 3,
                  }}
                />
              </Box>
              {/* Detail skeleton: two stat cards, then the terms block */}
              <Stack spacing={1.5} sx={{ px: 2 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                  <Skeleton variant='rounded' sx={{ flex: 1, height: 72, borderRadius: 2 }} />
                  <Skeleton variant='rounded' sx={{ flex: 1, height: 72, borderRadius: 2 }} />
                </Stack>
                <Skeleton variant='rounded' sx={{ height: 88, borderRadius: 2 }} />
              </Stack>
            </Stack>
          </motion.div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && (!history || history.length === 0) && (
          <motion.div
            variants={riseIn}
            initial='hidden'
            animate='visible'
          >
            <Paper
            elevation={0}
            sx={{
              p: 0,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <EmptyState
              icon={<EmojiEventsOutlined />}
              title='No campaigns yet'
              description='Campaigns appear here once they have closed and a winner has been selected'
            />
            </Paper>
          </motion.div>
        )}

        {/* Detail for the selected campaign. AnimatePresence makes the exit actually run
            when switching draws (an exit prop is inert without it). */}
        <AnimatePresence mode='wait'>
          {!isLoading && history && history.length > 0 && allCampaigns.length > 0 && selectedDraw && (
            <motion.div
              key={selectedDraw.id}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0, transition: SPRING_POP }}
              exit={{ opacity: 0, y: -16, transition: { duration: 0.18 } }}
            >
              <Box sx={{ pb: 1.5, pt: 3 }}>
                <DrawResultDetail draw={selectedDraw} onLocationClick={(id) => setProfileLocationId(id)} />
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>

      {/* Business Location Popup */}
      {profileLocationId != null && (
        <MapBusinessPopup
          locationId={profileLocationId}
          basicInfo={null}
          onClose={() => setProfileLocationId(null)}
        />
      )}
    </Box>
  );
};

export default DrawHistoryPage;
