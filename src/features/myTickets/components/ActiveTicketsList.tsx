import { Box, Typography, Stack, Chip, Skeleton, Avatar, CircularProgress, Button } from '@mui/material';
import { Circle, ConfirmationNumberOutlined, StorefrontOutlined, ReceiptLong } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  STATUS_ACTIVATED_BG, STATUS_ACTIVATED_TEXT,
  STATUS_PENDING_BG, STATUS_PENDING_TEXT, PRIMARY_MAIN,
  GRADIENT_PRIMARY, GRADIENT_SUCCESS_GREEN, ALPHA_PRIMARY_06,
  TEXT_HEADING, TEXT_SECONDARY, CHART_GRID, BORDER_SUBTLE, SHADOW_CARD,
} from '../../../shared/colors';
import { formatTicketDate } from '../../../shared/utils/date';
import { BUSINESS_SECTORS } from '../../admin/data';
import { useMyTickets } from '../hooks/useMyTickets';
import { useGetDrawHistory } from '../../draw/hooks/useGetDraws';
import { MAX_ENTRIES_PER_DRAW } from '../../../shared/constants/entries';
import { selectIsBusiness, selectIsLocationManager } from '../../../store/selectors/authSelectors';
import { useAppSelector } from '../../../store/hook';
import type { BusinessTicket, UserTicket } from '../types/myTicket.types';
import MapBusinessPopup from '../../nearBy/components/MapBusinessPopup';
import { popIn, riseIn, staggerContainer, heroPop, breathe, SPRING_JUMP } from '../../../shared/motion';


// No count-up: the number shows its real value immediately and announces itself with a
// physical jump-and-settle (y spring). The digits never tick - counting looked
// robotic no matter the easing.

// Motion props for clickable cards
const pressureCardMotion = {
  whileTap: { scale: 0.97 },
  transition: { type: 'spring', stiffness: 500, damping: 30, mass: 0.8 },
} as const;

// --- Shared ticket row wrapper ---
const TicketRowWrapper = ({ children, index, isClickable = false, onClick }: { children: React.ReactNode; index: number; isClickable?: boolean; onClick?: () => void }) => (
  <motion.div
    custom={index}
    variants={popIn}
    initial="hidden"
    animate="visible"
    {...(isClickable ? pressureCardMotion : {})}
  >
    <Box
      onClick={isClickable ? onClick : undefined}
      {...(isClickable ? {
        role: 'button' as const,
        tabIndex: 0,
        onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } },
      } : {})}
      sx={{
        border: '1px solid',
        borderColor: BORDER_SUBTLE,
        // Rounded on mobile (the look before the desktop redesign); tighter 16px on desktop.
        borderRadius: { xs: 6, md: '16px' },
        py: 1.75,
        px: 2.25,
        bgcolor: 'background.paper',
        boxShadow: SHADOW_CARD,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'box-shadow 160ms ease-out, transform 160ms ease-out',
        cursor: isClickable ? 'pointer' : 'default',
        '&:hover': isClickable ? {
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          transform: 'translateY(-2px)',
        } : {
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          transform: 'translateY(-1px)',
        },
      }}
    >
      {children}
    </Box>
  </motion.div>
);

// --- 1. USER TICKET COMPONENT ---
const UserTicketRow = ({ ticket, index, onLocationClick }: { ticket: UserTicket; index: number; onLocationClick?: (locationId: number) => void }) => {
  const sectorInfo =
    BUSINESS_SECTORS[ticket.business_sector] || BUSINESS_SECTORS.Free;
  const { date, time } = formatTicketDate(ticket.activated_at ?? '');
  const isClickable = !!ticket.location_id;

  return (
    <TicketRowWrapper
      index={index}
      isClickable={isClickable}
      onClick={isClickable && onLocationClick ? () => onLocationClick(ticket.location_id!) : undefined}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
        <Avatar
          alt=''
          src={ticket.logo_url ? `${import.meta.env.VITE_R2_PUBLIC_URL}/business-logos/${ticket.logo_url}` : undefined}
          sx={{ ...iconBoxStyle, bgcolor: sectorInfo.bgColor, color: sectorInfo.color, '& svg': { fontSize: 28 } }}
        >
          {!ticket.logo_url && sectorInfo.icon}
        </Avatar>
        <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
          <Typography
            noWrap
            sx={{ fontWeight: 700, lineHeight: 1.25, fontSize: '0.95rem', color: TEXT_HEADING }}
          >
            {ticket.business_name || 'Weekly entry'}
          </Typography>
          {/* One muted line: location . date . time (location omitted for free entries). */}
          <Typography
            variant='caption'
            noWrap
            sx={{ color: 'text.secondary', fontWeight: 500, mt: 0.25, display: 'block', fontSize: '0.78rem' }}
          >
            {ticket.location_name ? `${ticket.location_name} · ` : ''}{date} · {time}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ textAlign: 'right', flexShrink: 0, ml: 1.5 }}>
        <Typography
          sx={{
            fontFamily: '"Courier New", "Courier", monospace',
            fontWeight: 700,
            letterSpacing: '0.15em',
            fontSize: '1.05rem',
            color: 'primary.main',
            lineHeight: 1,
          }}
        >
          {ticket.code}
        </Typography>
      </Box>
    </TicketRowWrapper>
  );
};

// --- 2. BUSINESS TICKET COMPONENT ---
const BusinessTicketRow = ({ ticket, index }: { ticket: BusinessTicket; index: number }) => {
  const { date, time } = formatTicketDate(ticket.activated_at ?? '');

  return (
    <TicketRowWrapper index={index}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
        <Box sx={iconBoxStyle}>
          <ConfirmationNumberOutlined color={ticket.status === 'Activated' ? 'primary' : 'disabled'} />
        </Box>
        <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
          <Typography
            sx={{
              fontFamily: '"Courier New", "Courier", monospace',
              fontWeight: 700,
              letterSpacing: '0.15em',
              fontSize: '1.05rem',
              color: 'primary.main',
              lineHeight: 1.2,
            }}
          >
            {ticket.code}
          </Typography>
          <Typography
            variant='caption'
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
              mt: 0.5,
              display: 'block',
            }}
          >
            {ticket.location_name}
            {ticket.status === 'Activated' && ` • ${date} ${time}`}
          </Typography>
        </Box>
      </Box>
      <TicketStatusSection status={ticket.status} isUnderReview={ticket.is_quarantined} />
    </TicketRowWrapper>
  );
};

// --- Circular entry ring (desktop hero) -------------------------------------
const RING_R = 44;
const RING_C = 2 * Math.PI * RING_R; // circumference ≈ 276.46
const EntryRing = ({ count, cap, color }: { count: number; cap: number; color: string }) => {
  const pct = Math.min(count / cap, 1);
  return (
    <Box sx={{ position: 'relative', width: 104, height: 104, flexShrink: 0 }}>
      <svg width={104} height={104} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={52} cy={52} r={RING_R} fill='none' stroke={CHART_GRID} strokeWidth={10} />
        {/* Arc fills to the current fraction with the signature jump-and-settle. */}
        <motion.circle
          cx={52} cy={52} r={RING_R} fill='none' stroke={color} strokeWidth={10} strokeLinecap='round'
          strokeDasharray={RING_C}
          initial={{ strokeDashoffset: RING_C }}
          animate={{ strokeDashoffset: RING_C * (1 - pct) }}
          transition={{ ...SPRING_JUMP, delay: 0.1 }}
        />
      </svg>
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <motion.span key={count} style={{ display: 'inline-block' }} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={SPRING_JUMP}>
          <Typography sx={{ fontWeight: 900, fontSize: '1.9rem', lineHeight: 1, color }}>{count}</Typography>
        </motion.span>
        <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled', fontWeight: 700, mt: 0.25 }}>of {cap}</Typography>
      </Box>
    </Box>
  );
};

// Desktop hero: ring + "You're in with N entries" + a compliant one-liner (never implies
// that spending or extra entries improves the odds - just states slots remaining).
const RingHero = ({ count, cap, color, isClosed, isMaxed, isLoading }: {
  count: number; cap: number; color: string; isClosed: boolean; isMaxed: boolean; isLoading: boolean;
}) => {
  const remaining = cap - count;
  const headline = isClosed
    ? `You had ${count} ${count === 1 ? 'entry' : 'entries'}`
    : count === 0 ? "You're not in yet" : `You're in with ${count} ${count === 1 ? 'entry' : 'entries'}`;
  const sub = isClosed
    ? 'This campaign has ended. Thanks for playing!'
    : isMaxed ? 'You have the maximum entries for this campaign. Good luck!'
    : count === 0 ? 'Submit a receipt or claim your weekly entry to get in.'
    : `You have ${remaining} more ${remaining === 1 ? 'entry' : 'entries'} available - don't leave them unclaimed!`;
  return (
    <motion.div variants={riseIn} initial='hidden' animate='visible'>
      <Box sx={{ px: 3, pt: 1, pb: 2.5, display: 'flex', alignItems: 'center', gap: 3 }}>
        {isLoading ? <Skeleton variant='circular' width={104} height={104} sx={{ flexShrink: 0 }} /> : <EntryRing count={count} cap={cap} color={color} />}
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: TEXT_HEADING, lineHeight: 1.25 }}>{headline}</Typography>
          <Typography variant='body2' sx={{ color: TEXT_SECONDARY, mt: 0.5, lineHeight: 1.5 }}>{sub}</Typography>
        </Box>
      </Box>
    </motion.div>
  );
};

// --- MAIN LIST COMPONENT ---
export const ActiveTicketsList = ({ draw_id, locationId, desktop = false }: { draw_id: number | null; locationId?: number; desktop?: boolean }) => {
  const navigate = useNavigate();
  const isBusinessOwner = useAppSelector(selectIsBusiness);
  const isLocation = useAppSelector(selectIsLocationManager);
  const isBusiness = isBusinessOwner || isLocation;
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);

  const { tickets: allTickets, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, totalCount, cap, perLocationCap, activeLocationCount } = useMyTickets(draw_id ?? 0, locationId);

  // Is the selected draw a past (closed) campaign? Reuses the cached draw-history query the
  // deck already loaded, so no extra request. A closed draw can't be entered anymore, so the
  // empty state must not tell the user to "claim an entry" for it.
  const { data: drawHistory } = useGetDrawHistory();
  const isClosedDraw = (drawHistory ?? []).find((d) => d.id === draw_id)?.status?.toLowerCase() === 'closed';


  // Intersection observer sentinel
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setupObserver = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect();
    if (!sentinelRef.current || !hasNextPage || isFetchingNextPage) return;
    observerRef.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) fetchNextPage();
    }, { threshold: 0.1, rootMargin: '300px' });
    observerRef.current.observe(sentinelRef.current);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    setupObserver();
    return () => observerRef.current?.disconnect();
  }, [setupObserver]);

  const CAP = MAX_ENTRIES_PER_DRAW;
  const progress = Math.min((totalCount / CAP) * 100, 100);
  const isMaxed = totalCount >= CAP;
  // Filling up is a WIN, not a warning: once you get close to the max the accent turns green
  // (positive) rather than the old amber, and the bar fills with a celebratory green gradient.
  const isNearMax = totalCount >= Math.ceil(CAP * 0.8); // 80%+ of the draw cap (includes maxed)
  const progressColor = isNearMax ? STATUS_ACTIVATED_TEXT : PRIMARY_MAIN;
  const progressFill = isNearMax ? GRADIENT_SUCCESS_GREEN : PRIMARY_MAIN;

  if (!draw_id) return (
    <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
      <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: ALPHA_PRIMARY_06, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
        <ConfirmationNumberOutlined sx={{ fontSize: 32, color: 'primary.main' }} />
      </Box>
      <Typography variant='subtitle1' fontWeight={700} color='text.secondary'>Select a campaign</Typography>
      <Typography variant='body2' color='text.disabled' sx={{ mt: 0.5 }}>Choose a campaign from the list to see entries</Typography>
    </Box>
  );

  return (
    <>
      {/* Desktop (user): circular ring hero. Everything else keeps the number + linear bar. */}
      {desktop && !isBusiness ? (
        <RingHero count={totalCount} cap={CAP} color={progressColor} isClosed={isClosedDraw} isMaxed={isMaxed} isLoading={isLoading} />
      ) : (
      /* Entry count + progress. riseIn (no scale): a scale overshoot on this full-width
         block briefly widens the page and the mobile browser rescales it (zoom flash). */
      <motion.div variants={riseIn} initial="hidden" animate="visible">
        <Box sx={{ px: 3, pt: 0, pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: isBusiness ? 0 : 1.5 }}>
          <Box>
            <Typography
              variant='caption'
              sx={{ color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.65rem' }}
            >
              {isBusiness
                ? locationId ? 'Entries at this location' : isLocation ? 'Your location' : 'All locations'
                : 'Your Entries'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              {isLoading ? (
                <Skeleton width={60} height={44} />
              ) : (
                <>
                  {/* The jump: springs up past its resting spot and settles back down, with the
                      SAME physics as the bar below so they land as one event.
                      Keyed by the value so switching draws re-triggers the jump.
                      y-only (no scale): this sits inside the mobile zoom:0.9 box, and text at
                      fractional scale shimmers in WebKit; vertical translation is zoom-safe. */}
                  <motion.span
                    key={totalCount}
                    style={{ display: 'inline-block' }}
                    initial={{ y: 18, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={SPRING_JUMP}
                  >
                    <Typography variant='h3' sx={{ fontWeight: 900, color: progressColor, lineHeight: 1, letterSpacing: '-0.03em', transition: 'color 0.3s' }}>
                      {totalCount}
                    </Typography>
                  </motion.span>
                  {!isBusiness && (
                    <Typography variant='body1' sx={{ fontWeight: 700, color: 'text.secondary' }}>
                      / {CAP}
                    </Typography>
                  )}
                  {isBusiness && cap !== null && (
                    <Typography variant='body1' sx={{ fontWeight: 700, color: 'text.secondary' }}>
                      / {cap.toLocaleString()}
                    </Typography>
                  )}
                  {isBusiness && cap === null && (
                    <Typography variant='body1' sx={{ fontWeight: 700, color: 'text.secondary' }}>
                      {totalCount !== 1 ? 'entries' : 'entry'}
                    </Typography>
                  )}
                </>
              )}
            </Box>

            {/* Cap breakdown - shown below the number */}
            {isBusiness && !isLoading && cap !== null && perLocationCap !== null && (
              <Typography variant='caption' color='text.disabled' sx={{ display: 'block', mt: 0.5, fontSize: '0.68rem' }}>
                {locationId || isLocation
                  ? `${perLocationCap.toLocaleString()} entries / location`
                  : `${perLocationCap.toLocaleString()} / location × ${activeLocationCount} locations`}
              </Typography>
            )}
          </Box>

          {!isBusiness && !isLoading && (
            <Typography variant='caption' sx={{ fontWeight: 700, color: progressColor, pb: 0.5, transition: 'color 0.3s' }}>
              {isClosedDraw ? 'Campaign ended' : isMaxed ? ' Maxed out!' : `${CAP - totalCount} slots left`}
            </Typography>
          )}
        </Box>

        {/* Progress bar - users only */}
        {!isBusiness && (
          <Box>
            {isLoading ? (
              <Skeleton variant='rounded' height={8} sx={{ borderRadius: 4 }} />
            ) : (
              // Same look as LinearProgress, but the fill is a motion.div so it can grow
              // from 0 to the target on mount - slowly, with an ease-out glide.
              <Box
                role='progressbar'
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}
              >
                {/* Underdamped spring: the fill overshoots past its target (~120% of the
                    distance), dips back under, and settles - same jumpy landing as the number.
                    Starts a beat after the number so it reads as cause and effect.
                    scaleX (not width) so the spring runs on the compositor, no layout per frame;
                    the parent's overflow:hidden + radius clips the fill. */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: progress / 100 }}
                  transition={{ ...SPRING_JUMP, delay: 0.12 }}
                  style={{ height: '100%', width: '100%', transformOrigin: 'left', background: progressFill }}
                />
              </Box>
            )}
            {!isLoading && (isClosedDraw ? totalCount > 0 : true) && (
              <Typography variant='caption' color='text.disabled' sx={{ mt: 0.75, display: 'block', fontWeight: 500 }}>
                {isClosedDraw
                  ? totalCount === 1
                    ? 'Your final entry in this campaign. Thanks for playing!'
                    : 'Your final entries in this campaign. Thanks for playing!'
                  : isMaxed
                    ? 'You have claimed the maximum entries for this campaign. Good luck!'
                    : totalCount === 0
                      ? 'Submit receipts, use promo codes, or claim your weekly entry.'
                      : `You have ${CAP - totalCount} more entries available - don't leave them unclaimed!`}
              </Typography>
            )}
          </Box>
        )}
        </Box>
      </motion.div>
      )}

      {/* Ticket list */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <Stack spacing={1.5} px={2} pb={3}>
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="loading" variants={popIn}>
                <Stack spacing={1.5}>
                  {[...Array(3)].map((_, index) => <TicketSkeleton key={index} />)}
                </Stack>
              </motion.div>
            ) : allTickets.length > 0 ? (
              <motion.div key="list" variants={staggerContainer}>
                <Stack spacing={1.5}>
                  {allTickets.map((ticket: BusinessTicket | UserTicket, index: number) =>
                    isBusiness ? (
                      <BusinessTicketRow key={ticket.id} ticket={ticket as BusinessTicket} index={index} />
                    ) : (
                      <UserTicketRow
                        key={ticket.id}
                        ticket={ticket as UserTicket}
                        index={index}
                        onLocationClick={(locId) => setSelectedLocationId(locId)}
                      />
                    ),
                  )}
                </Stack>
              </motion.div>
            ) : isBusiness ? (
              <motion.div key="empty-business" variants={popIn}>
                <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
                  <motion.div variants={heroPop} initial="hidden" animate="visible">
                    <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                      <StorefrontOutlined sx={{ fontSize: 32, color: 'text.disabled' }} />
                    </Box>
                  </motion.div>
                  <Typography variant='subtitle1' fontWeight={700} color='text.secondary'>
                    {isClosedDraw ? 'No entries this campaign' : 'No entries distributed yet'}
                  </Typography>
                  <Typography variant='body2' color='text.disabled' sx={{ mt: 0.5 }}>
                    {isClosedDraw
                      ? 'This campaign has ended. No entries were distributed at your location during it.'
                      : 'Entries will appear here once customers activate them at your location.'}
                  </Typography>
                </Box>
              </motion.div>
            ) : (
              <motion.div key="empty-user" variants={popIn}>
                <EmptyStateAnimated isClosed={isClosedDraw} onAction={() => navigate('/scan')} />
              </motion.div>
            )}
          </AnimatePresence>
        </Stack>
      </motion.div>

      {/* Infinite scroll sentinel */}
      <Box ref={sentinelRef} sx={{ pb: 2, display: 'flex', justifyContent: 'center' }}>
        {isFetchingNextPage && <CircularProgress size={24} />}
      </Box>

      {/* Location detail drawer (reused from map) */}
      {!isBusiness && (
        <MapBusinessPopup
          locationId={selectedLocationId}
          basicInfo={null}
          onClose={() => setSelectedLocationId(null)}
          userLocation={null}
        />
      )}
    </>
  );
};

// --- SHARED UI HELPERS ---
const iconBoxStyle = {
  width: 46,
  height: 46,
  borderRadius: '50%',
  bgcolor: 'action.hover',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const TicketStatusSection = ({
  status,
  isUnderReview,
}: {
  status: string;
  isUnderReview?: boolean;
}) => (
  <Box sx={{ textAlign: 'right', flexShrink: 0, ml: 1.5 }}>
    <Chip
      icon={<Circle sx={{ fontSize: '6px !important' }} />}
      label={isUnderReview ? 'UNDER REVIEW' : status.toUpperCase()}
      size='small'
      sx={{
        height: 24,
        fontSize: '0.65rem',
        fontWeight: 700,
        borderRadius: '12px',
        bgcolor: isUnderReview ? '#fffbeb' : status === 'Activated' ? STATUS_ACTIVATED_BG : STATUS_PENDING_BG,
        color: isUnderReview ? '#92400e' : status === 'Activated' ? STATUS_ACTIVATED_TEXT : STATUS_PENDING_TEXT,
        border: '1px solid',
        borderColor: isUnderReview ? 'rgba(245,158,11,0.3)' : status === 'Activated'
          ? 'rgba(46,125,50,0.2)'
          : 'rgba(230,81,0,0.2)',
        '& .MuiChip-icon': {
          color: isUnderReview ? '#f59e0b' : status === 'Activated' ? STATUS_ACTIVATED_TEXT : STATUS_PENDING_TEXT,
        },
      }}
    />
  </Box>
);

const TicketSkeleton = () => (
  <Box
    sx={{
      p: 2,
      pl: 2.5,
      pr: 2.5,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      border: '1px solid rgba(0,0,0,0.06)',
      borderRadius: 6,
      bgcolor: 'background.paper',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Skeleton
        variant='rectangular'
        width={48}
        height={48}
        sx={{ borderRadius: 2 }}
      />
      <Box>
        <Skeleton width={120} height={20} />
        <Skeleton width={80} height={14} />
      </Box>
    </Box>
    <Box
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}
    >
      <Skeleton width={80} height={22} sx={{ mb: 1 }} />
      <Skeleton width={70} height={24} sx={{ borderRadius: '12px' }} />
    </Box>
  </Box>
);

// Empty state with animated icon and breathing button
const EmptyStateAnimated = ({ isClosed, onAction }: { isClosed: boolean; onAction: () => void }) => (
  <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
    <motion.div variants={heroPop} initial="hidden" animate="visible">
      <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: ALPHA_PRIMARY_06, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
        <ConfirmationNumberOutlined sx={{ fontSize: 32, color: 'primary.main' }} />
      </Box>
    </motion.div>
    <Typography variant='subtitle1' fontWeight={700} color='text.secondary'>
      {isClosed ? 'No entries this campaign' : 'No entries yet'}
    </Typography>
    <Typography variant='body2' color='text.disabled' sx={{ mt: 0.5 }}>
      {isClosed
        ? 'This campaign has ended and you were not entered in it.'
        : 'Claim your weekly entry or submit a receipt at a local business'}
    </Typography>
    {/* CTA only makes sense for the CURRENT campaign - a closed draw can't be entered. */}
    {!isClosed && (
      <motion.div {...breathe} style={{ display: 'inline-block', marginTop: 24 }}>
        <Button
          variant='contained'
          onClick={onAction}
          startIcon={<ReceiptLong />}
          sx={{
            background: GRADIENT_PRIMARY,
            borderRadius: 2,
            height: 48,
            px: 3,
            fontWeight: 700,
            textTransform: 'none',
          }}
        >
          Submit a receipt
        </Button>
      </motion.div>
    )}
  </Box>
);
