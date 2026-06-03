import { Box, Typography, Stack, Chip, Skeleton, Avatar, LinearProgress, CircularProgress } from '@mui/material';
import { Circle, Person, Storefront, ConfirmationNumberOutlined, StorefrontOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import EmptyState from '../../../shared/components/EmptyState';
import { useNavigate } from 'react-router-dom';
import {
  STATUS_ACTIVATED_BG, STATUS_ACTIVATED_TEXT,
  STATUS_PENDING_BG, STATUS_PENDING_TEXT,
} from '../../../shared/colors';
import { formatTicketDate } from '../../../shared/utils/date';
import { BUSINESS_SECTORS } from '../../admin/data';
import { useMyTickets } from '../hooks/useMyTickets';
import { selectIsBusiness, selectIsLocationManager } from '../../../store/selectors/authSelectors';
import { useAppSelector } from '../../../store/hook';
import type { BusinessTicket, UserTicket } from '../types/myTicket.types';

// --- Animation variants ---
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.23, 1, 0.32, 1] as [number, number, number, number], delay: (i % 50) * 0.05 },
  }),
};

// --- Shared ticket row wrapper ---
const TicketRowWrapper = ({ children, index }: { children: React.ReactNode; index: number }) => (
  <motion.div
    custom={index}
    variants={itemVariants}
    initial="hidden"
    animate="visible"
  >
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 6,
        p: 2,
        pl: 2.5,
        pr: 2.5,
        bgcolor: 'background.paper',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'box-shadow 160ms ease-out, transform 160ms ease-out',
        '&:hover': {
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
const UserTicketRow = ({ ticket, index }: { ticket: UserTicket; index: number }) => {
  const sectorInfo =
    BUSINESS_SECTORS[ticket.business_sector] || BUSINESS_SECTORS.Free;
  const { date, time } = formatTicketDate(ticket.activated_at ?? '');
  return (
    <TicketRowWrapper index={index}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
        <Avatar
          src={ticket.logo_url ? `${import.meta.env.VITE_R2_PUBLIC_URL}/business-logos/${ticket.logo_url}` : undefined}
          sx={{ ...iconBoxStyle, bgcolor: sectorInfo.bgColor, color: sectorInfo.color, '& svg': { fontSize: 28 } }}
        >
          {!ticket.logo_url && sectorInfo.icon}
        </Avatar>
        <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
          <Typography
            variant='subtitle1'
            noWrap
            sx={{ fontWeight: 700, lineHeight: 1.2 }}
          >
            {ticket.business_name ?? 'Free weekly entry'}
          </Typography>
          {ticket.location_name && (
            <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', lineHeight: 1.4 }}>
              {ticket.location_name}
            </Typography>
          )}
          <Typography
            variant='caption'
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
              mt: 0.25,
              display: 'block',
            }}
          >
            {date} •{' '}
            <Box component='span' sx={{ color: 'text.disabled' }}>
              {time}
            </Box>
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
          {ticket.status === 'Activated' ? (
            <Person color='primary' />
          ) : (
            <Storefront color='disabled' />
          )}
        </Box>
        <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
          <Typography
            variant='subtitle1'
            noWrap
            sx={{ fontWeight: 700, lineHeight: 1.2 }}
          >
            {ticket.activated_by_user ?? 'Not Activated'}
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
      <TicketStatusSection code={ticket.code} status={ticket.status} isUnderReview={ticket.is_quarantined} />
    </TicketRowWrapper>
  );
};

// --- MAIN LIST COMPONENT ---
export const ActiveTicketsList = ({ draw_id, locationId }: { draw_id: number | null; locationId?: number }) => {
  const navigate = useNavigate();
  const isBusinessOwner = useAppSelector(selectIsBusiness);
  const isLocation = useAppSelector(selectIsLocationManager);
  const isBusiness = isBusinessOwner || isLocation;

  const [page, setPage] = useState(1);
  const [allTickets, setAllTickets] = useState<(BusinessTicket | UserTicket)[]>([]);

  // Reset on draw/location change
  useEffect(() => {
    setPage(1);
    setAllTickets([]);
  }, [draw_id, locationId]);

  const { data: tickets, isLoading, isFetching, totalCount, cap, perLocationCap, activeLocationCount } = useMyTickets(draw_id ?? 0, locationId, page);

  // Accumulate pages
  useEffect(() => {
    if (!tickets) return;
    setAllTickets(prev => page === 1 ? tickets : [...prev, ...tickets]);
  }, [tickets]);

  const hasMore = allTickets.length < totalCount;

  // Intersection observer sentinel
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setupObserver = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect();
    if (!sentinelRef.current || !hasMore || isFetching) return;
    observerRef.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setPage(p => p + 1);
    }, { threshold: 0.1, rootMargin: '300px' });
    observerRef.current.observe(sentinelRef.current);
  }, [hasMore, isFetching]);

  useEffect(() => {
    setupObserver();
    return () => observerRef.current?.disconnect();
  }, [setupObserver]);

  const displayCount = totalCount;
  const CAP = 30;
  const progress = Math.min((totalCount / CAP) * 100, 100);
  const isMaxed = totalCount >= CAP;
  const progressColor = isMaxed ? '#2e7d32' : totalCount >= 20 ? '#ed6c02' : '#0292b7';

  if (!draw_id) return (
    <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
      <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'rgba(2,146,183,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
        <ConfirmationNumberOutlined sx={{ fontSize: 32, color: 'primary.main' }} />
      </Box>
      <Typography variant='subtitle1' fontWeight={700} color='text.secondary'>Select a campaign</Typography>
      <Typography variant='body2' color='text.disabled' sx={{ mt: 0.5 }}>Choose a campaign from the list to see entries</Typography>
    </Box>
  );

  return (
    <>
      {/* Entry count + progress */}
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
                  <Typography variant='h3' sx={{ fontWeight: 900, color: progressColor, lineHeight: 1, letterSpacing: '-0.03em', transition: 'color 0.3s' }}>
                    {displayCount}
                  </Typography>
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
                      {displayCount !== 1 ? 'entries' : 'entry'}
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
              {isMaxed ? '🎉 Maxed out!' : `${CAP - totalCount} slots left`}
            </Typography>
          )}
        </Box>

        {/* Progress bar - users only */}
        {!isBusiness && (
          <Box>
            {isLoading ? (
              <Skeleton variant='rounded' height={8} sx={{ borderRadius: 4 }} />
            ) : (
              <LinearProgress
                variant='determinate'
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'rgba(0,0,0,0.06)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    bgcolor: progressColor,
                    transition: 'background-color 0.3s, transform 0.6s ease',
                  },
                }}
              />
            )}
            {!isLoading && (
              <Typography variant='caption' color='text.disabled' sx={{ mt: 0.75, display: 'block', fontWeight: 500 }}>
                {isMaxed
                  ? 'You have the maximum entries for this campaign. Good luck!'
                  : totalCount === 0
                    ? 'Submit receipts, use promo codes, or claim your free weekly entry.'
                    : `You have ${CAP - totalCount} more entries available - don't leave them unclaimed!`}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Ticket list */}
      <Stack spacing={1.5} px={2} pb={3}>
        {isLoading && page === 1 ? (
          [...Array(3)].map((_, index) => <TicketSkeleton key={index} />)
        ) : allTickets.length > 0 ? (
          allTickets.map((ticket: BusinessTicket | UserTicket, index: number) =>
            isBusiness ? (
              <BusinessTicketRow key={ticket.id} ticket={ticket as BusinessTicket} index={index} />
            ) : (
              <UserTicketRow key={ticket.id} ticket={ticket as UserTicket} index={index} />
            ),
          )
        ) : isBusiness ? (
          <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
              <StorefrontOutlined sx={{ fontSize: 32, color: 'text.disabled' }} />
            </Box>
            <Typography variant='subtitle1' fontWeight={700} color='text.secondary'>
              No entries distributed yet
            </Typography>
            <Typography variant='body2' color='text.disabled' sx={{ mt: 0.5 }}>
              Entries will appear here once customers activate them at your location.
            </Typography>
          </Box>
        ) : (
          <EmptyState
            icon={<ConfirmationNumberOutlined />}
            title='No entries yet'
            description='Claim your free weekly entry or submit a receipt at a partner business'
            actionLabel='Scan a receipt'
            onAction={() => navigate('/scan')}
          />
        )}
      </Stack>

      {/* Infinite scroll sentinel */}
      <Box ref={sentinelRef} sx={{ pb: 2, display: 'flex', justifyContent: 'center' }}>
        {isFetching && page > 1 && <CircularProgress size={24} />}
      </Box>
    </>
  );
};

// --- SHARED UI HELPERS ---
const iconBoxStyle = {
  width: 48,
  height: 48,
  borderRadius: '50%',
  bgcolor: 'action.hover',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const TicketStatusSection = ({
  code,
  status,
  isUnderReview,
}: {
  code: string;
  status: string;
  isUnderReview?: boolean;
}) => (
  <Box sx={{ textAlign: 'right', flexShrink: 0, ml: 1.5 }}>
    <Typography
      sx={{
        fontFamily: '"Courier New", "Courier", monospace',
        fontWeight: 700,
        letterSpacing: '0.15em',
        fontSize: '1.05rem',
        color: 'primary.main',
        lineHeight: 1,
        mb: 1,
      }}
    >
      {code}
    </Typography>
    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
