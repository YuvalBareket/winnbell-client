import { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Paper, Stack, Skeleton, useTheme, useMediaQuery, Link,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import AppPageHero from '../../../shared/components/AppPageHero';
import {
  EmojiEventsOutlined, ConfirmationNumberOutlined, ArticleOutlined, HourglassEmptyOutlined,
} from '@mui/icons-material';
import EmptyState from '../../../shared/components/EmptyState';
import { useGetDrawHistory } from '../hooks/useGetDraws';
import {
  TEXT_SECONDARY, MOBILE_CONTENT_HEIGHT, BG_SURFACE, PRIMARY_MAIN, ACCENT_GOLD, ACCENT_GOLD_DARK, SHADOW_CARD, SHADOW_CARD_HOVER, SHADOW_FLOAT, SHADOW_PRIMARY_GLOW, ALPHA_PRIMARY_10, BORDER_SUBTLE,
  SUCCESS_GREEN, ALPHA_SUCCESS_04, ALPHA_SUCCESS_08, ALPHA_SUCCESS_12, ALPHA_SUCCESS_25,
  ALPHA_AMBER_04, ALPHA_AMBER_08, ALPHA_AMBER_12, ALPHA_AMBER_25,
} from '../../../shared/colors';
import CampaignSwiperCard from '../components/CampaignSwiperCard';
import MapBusinessPopup from '../../nearBy/components/MapBusinessPopup';
import type { IDrawResult } from '../types';

const DrawHistoryPage = () => {
  const [selectedDrawIndex, setSelectedDrawIndex] = useState(0);
  const [profileLocationId, setProfileLocationId] = useState<number | null>(null);
  const { data: history, isLoading, isError } = useGetDrawHistory();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // Measure the deck area so card size and spread scale with the screen instead of fixed px
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

  // Ratios from the approved design: mobile card is ~36% of the deck height, neighbors split the rest;
  // desktop cluster spans ~80% of the deck width around a fixed-width card
  const CARD_WIDTH_MD = 300;
  const cardHeight = Math.max(120, Math.round(deckSize.height * 0.36));
  const peekY = Math.round((deckSize.height - cardHeight) / 2);
  const peekX = Math.max(40, Math.round((deckSize.width * 0.8 - CARD_WIDTH_MD) / 2));
  const stretch = isDesktop ? CARD_WIDTH_MD - peekX : cardHeight - peekY;

  // Separate active and closed campaigns
  const activeCampaigns = history?.filter(d => d.status?.toLowerCase() === 'open') ?? [];
  const closedCampaigns = history?.filter(d => d.status?.toLowerCase() === 'closed') ?? [];

  // Combine: active first, then closed
  const allCampaigns: IDrawResult[] = [...activeCampaigns, ...closedCampaigns];
  const selectedDraw = allCampaigns[selectedDrawIndex] || null;

  // Helper for winner block (reused from DrawHistoryCard)
  const winnerFirstName = selectedDraw?.winner_name ? selectedDraw.winner_name.split(' ')[0] : '';
  const hasWinner = !!selectedDraw?.winner_name;
  const isClosed = selectedDraw?.status?.toLowerCase() === 'closed';

  return (
    // xs: AppPageHero renders inside this box, so only the 76px bottom nav is external; / 0.9 cancels the xs zoom so the fixed page fills the viewport exactly
    // overflow-x: clip (not hidden) contains the coverflow deck's horizontal peek WITHOUT turning
    // this box into a vertical scroll container. 'hidden' forces overflow-y to compute to 'auto'
    // (CSS spec), which created a second, inner scrollbar competing with the document.
    <Box sx={{  overflowX: 'clip', display: 'flex', flexDirection: 'column', zoom: { xs: 0.9, md: 1 } }}>
      <AppPageHero
        title='Campaigns Hub'
        subtitle='Track active campaigns and winner history'
      />

      <Container maxWidth='lg' sx={{ flex: 1, display: 'flex', flexDirection: 'column', pt: { xs: 3.5, md: 4.75 }, pb: 1.5, px: 3, position: 'relative', zIndex: 1 }}>
        {/* Error state */}
        {isError && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
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
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
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
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
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

        {/* Campaigns Deck and Detail Section */}
        {!isLoading && history && history.length > 0 && allCampaigns.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Stack spacing={{ xs: 3, md: 10.75 }}>
              {/* TOP SECTION: Swiper Deck */}
              <Box
                ref={setDeckEl}
                sx={{
                  flexShrink: 0,
                  // xs: 60% of the visual content area, derived from the viewport (not parents) so the
                  // measured card sizing can't feed back into the deck height; 180px ~= hero + page padding
                  height: { xs: `calc((${MOBILE_CONTENT_HEIGHT} / 0.9 - 180px) * 0.6)`, md: '200px' },
                  overflow: 'visible',
                  '& .swiper': {
                    width: '100%',
                    height: '100%',
                    mx: 'auto',
                    overflow: 'visible',
                  },
                  '& .swiper-slide': {
                    width: { xs: '100%', md: `${CARD_WIDTH_MD}px` },
                    height: { xs: `${cardHeight}px`, md: '100%' },
                    opacity: 0,
                    pointerEvents: 'none',
                    // Only transition transform, not opacity: on a fast swipe a fading card would
                    // linger and pile up behind the deck. Snapping opacity keeps max 3 cards visible.
                    transitionProperty: 'transform',
                  },
                  '& .swiper-slide-active, & .swiper-slide-next, & .swiper-slide-prev': {
                    opacity: 1,
                    pointerEvents: 'auto',
                  },
                  '& .swiper-slide-active > div': {
                    boxShadow: `${SHADOW_PRIMARY_GLOW}, ${SHADOW_FLOAT}`,
                    filter: 'brightness(1.04)',
                    transition: 'filter 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                  },
                  '& .swiper-slide-next > div, & .swiper-slide-prev > div': {
                    boxShadow: SHADOW_CARD,
                    transition: 'filter 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                  },
                  // The "flashlight" shade. Applied as an overlay ON the card, which has overflow:hidden,
                  // so it is clipped exactly to the card and ALWAYS covers the whole card (Swiper's own
                  // slide-shadow is sized to the slide, which the taller card overflows, leaving a gap).
                  // Lit on the active card, a light shade on the neighbours; the opacity eases as cards
                  // cross the centre, so it responds to the swipe.
                  '& .swiper-slide > div::after': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    pointerEvents: 'none',
                    zIndex: 3,
                    transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  },
                  // Contact shadow: darkest on the edge where the active card overlaps the neighbour
                  // (the INNER edge), fading out toward the outer edge, like a shadow the raised main
                  // card casts onto the card behind it. Prev sits above the active card so its inner
                  // (covered) edge is its bottom; next sits below so its inner edge is its top.
                  '& .swiper-slide-prev > div::after': {
                    opacity: 1,
                    // Contact edge differs by axis: mobile is vertical (prev = top card, edge = bottom),
                    // desktop is horizontal (prev = left card, edge = right). Fades out by ~52% so the
                    // shadow stays near the contact edge and ends early.
                    background: {
                      xs: 'linear-gradient(to top, rgba(6,20,44,0.32) 0%, rgba(6,20,44,0.18) 26%, rgba(6,20,44,0.07) 50%, rgba(6,20,44,0) 80%)',
                      md: 'linear-gradient(to left, rgba(6,20,44,0.32) 0%, rgba(6,20,44,0.18) 26%, rgba(6,20,44,0.07) 50%, rgba(6,20,44,0) 80%)',
                    },
                  },
                  '& .swiper-slide-next > div::after': {
                    opacity: 1,
                    // Mobile: next = bottom card (edge = top). Desktop: next = right card (edge = left).
                    background: {
                      xs: 'linear-gradient(to bottom, rgba(6,20,44,0.32) 0%, rgba(6,20,44,0.18) 26%, rgba(6,20,44,0.07) 50%, rgba(6,20,44,0) 80%)',
                      md: 'linear-gradient(to right, rgba(6,20,44,0.32) 0%, rgba(6,20,44,0.18) 26%, rgba(6,20,44,0.07) 50%, rgba(6,20,44,0) 80%)',
                    },
                  },
                  '& .swiper-slide-active > div::after': {
                    opacity: 0,
                  },
                }}
              >
                {deckSize.height > 0 && (
                <Swiper
                  key={`${isDesktop ? 'horizontal' : 'vertical'}-${Math.round(stretch / 20)}`}
                  effect="coverflow"
                  coverflowEffect={{
                    rotate: -17,
                    stretch,
                    depth: 120,
                    modifier: 1,
                    // Off: the card-level overlay above handles the shading (full, reliable coverage).
                    slideShadows: false,
                  }}
                  grabCursor
                  modules={[EffectCoverflow]}
                  direction={isDesktop ? 'horizontal' : 'vertical'}
                  centeredSlides
                  slidesPerView="auto"
                  loop={allCampaigns.length >= 3}
                  speed={420}
                  slideToClickedSlide
                  onSlideChange={(swiper) => setSelectedDrawIndex(swiper.realIndex)}
                >
                  {allCampaigns.map((draw) => (
                    <SwiperSlide key={draw.id}>
                      <CampaignSwiperCard draw={draw} />
                    </SwiperSlide>
                  ))}
                </Swiper>
                )}
              </Box>

              {/* BOTTOM SECTION: Detail for Selected Campaign */}
              {selectedDraw && (
                <motion.div
                  key={selectedDraw.id}
                  // animate from above: downward-translated content extends the document's scrollable
                  // height and flashes the scrollbar on every swipe; upward overflow does not
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  exit={{ opacity: 0, y: -16 }}
                >
                  <Stack spacing={1.5} sx={{ pb: 1.5, pt: 0.5, px: { xs: 0, md: 2 }, mx: { xs: -1, md: 0 } }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="stretch">
                    {/* Winner Block */}
                    {isClosed && hasWinner && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.05 }}
                        style={{ flex: 1, minWidth: 0 }}
                      >
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.5,
                            height: '100%',
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${ALPHA_SUCCESS_08} 0%, ${ALPHA_SUCCESS_04} 100%)`,
                            border: `1px solid ${ALPHA_SUCCESS_25}`,
                            boxShadow: SHADOW_CARD,
                            transition: 'all 0.3s ease-in-out',
                          }}
                        >
                          <Stack direction="row" spacing={1.5} alignItems="flex-start">
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 36,
                                height: 36,
                                borderRadius: '10px',
                                bgcolor: ALPHA_SUCCESS_12,
                                flexShrink: 0,
                              }}
                            >
                              <EmojiEventsOutlined
                                sx={{
                                  fontSize: 20,
                                  color: SUCCESS_GREEN,
                                }}
                              />
                            </Box>
                            <Box flex={1}>
                              <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ mb: 0.5, fontSize: '0.85rem' }}>
                                {winnerFirstName} won
                              </Typography>
                              <Typography variant="caption" color={TEXT_SECONDARY} sx={{ lineHeight: 1.5, fontSize: '0.75rem', display: 'block' }}>
                                {selectedDraw.winner_business_name ? (
                                  <>
                                    Selected with{' '}
                                    {selectedDraw.winner_location_id ? (
                                      <Link
                                        component="button"
                                        type="button"
                                        onClick={() => setProfileLocationId(selectedDraw.winner_location_id ?? null)}
                                        underline="hover"
                                        sx={{ fontWeight: 700, color: PRIMARY_MAIN, verticalAlign: 'baseline' }}
                                      >
                                        {selectedDraw.winner_business_name}
                                      </Link>
                                    ) : (
                                      selectedDraw.winner_business_name
                                    )}{' '}
                                    receipt
                                  </>
                                ) : (
                                  'Selected with free weekly entry'
                                )}
                              </Typography>
                            </Box>
                          </Stack>
                        </Paper>
                      </motion.div>
                    )}

                    {/* Verification in Progress */}
                    {isClosed && !hasWinner && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.05 }}
                        style={{ flex: 1, minWidth: 0 }}
                      >
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.5,
                            height: '100%',
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${ALPHA_AMBER_08} 0%, ${ALPHA_AMBER_04} 100%)`,
                            border: `1px solid ${ALPHA_AMBER_25}`,
                            boxShadow: SHADOW_CARD,
                            transition: 'all 0.3s ease-in-out',
                          }}
                        >
                          <Stack direction="row" spacing={1.5} alignItems="flex-start">
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 36,
                                height: 36,
                                borderRadius: '10px',
                                bgcolor: ALPHA_AMBER_12,
                                flexShrink: 0,
                              }}
                            >
                              <HourglassEmptyOutlined
                                sx={{
                                  fontSize: 20,
                                  color: ACCENT_GOLD,
                                }}
                              />
                            </Box>
                            <Box flex={1}>
                              <Typography variant="body2" fontWeight={700} color={ACCENT_GOLD_DARK} sx={{ mb: 0.5, fontSize: '0.85rem' }}>
                                Verification in progress
                              </Typography>
                              <Typography variant="caption" color={TEXT_SECONDARY} sx={{ lineHeight: 1.5, fontSize: '0.75rem', display: 'block' }}>
                                A potential winner has been selected and is undergoing eligibility and fraud verification. We will announce the final winner soon.
                              </Typography>
                            </Box>
                          </Stack>
                        </Paper>
                      </motion.div>
                    )}

                    {/* Current Entries */}
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      style={{ flex: 1, minWidth: 0 }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          height: '100%',
                          borderRadius: 2,
                          bgcolor: BG_SURFACE,
                          border: `1px solid ${BORDER_SUBTLE}`,
                          boxShadow: SHADOW_CARD,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            boxShadow: SHADOW_CARD_HOVER,
                          },
                        }}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 36,
                              height: 36,
                              borderRadius: '10px',
                              bgcolor: ALPHA_PRIMARY_10,
                              flexShrink: 0,
                            }}
                          >
                            <ConfirmationNumberOutlined
                              sx={{
                                fontSize: 18,
                                color: PRIMARY_MAIN,
                              }}
                            />
                          </Box>
                          <Box flex={1}>
                            <Typography variant="caption" color={TEXT_SECONDARY} display="block" sx={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.4px', mb: 0.25 }}>
                              Total Entries
                            </Typography>
                            <Typography variant="body1" fontWeight={700} color="text.primary" sx={{ fontSize: '1.1rem' }}>
                              {selectedDraw.entry_count?.toLocaleString() || '0'}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    </motion.div>
                    </Stack>

                    {/* Terms and Rules */}
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.15 }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: BG_SURFACE,
                          border: `1px solid ${BORDER_SUBTLE}`,
                          boxShadow: SHADOW_CARD,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        <Stack spacing={1}>
                          <Typography
                            variant="caption"
                            color={TEXT_SECONDARY}
                            sx={{
                              lineHeight: 1.6,
                              fontSize: '0.7rem',
                              display: 'block',
                            }}
                          >
                            Campaign operated by Winnbell. No purchase necessary. A purchase will not increase chances of winning. Free entry method available on the platform. 18+. Void where prohibited.
                          </Typography>
                          <Link
                            href={`/rules/${selectedDraw.id}`}
                            underline="none"
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.5,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: PRIMARY_MAIN,
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                gap: 0.75,
                              },
                            }}
                          >
                            <ArticleOutlined sx={{ fontSize: 16 }} />
                            Official Rules
                          </Link>
                        </Stack>
                      </Paper>
                    </motion.div>
                  </Stack>
                </motion.div>
              )}
            </Stack>
          </motion.div>
        )}
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
