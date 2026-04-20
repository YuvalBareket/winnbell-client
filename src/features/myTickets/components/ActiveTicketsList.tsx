import { Box, Typography, Stack, Chip, Skeleton, Avatar } from '@mui/material';
import { Circle, Person, Storefront, ConfirmationNumberOutlined, StorefrontOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import EmptyState from '../../../shared/components/EmptyState';
import { useNavigate } from 'react-router-dom';
import {
  STATUS_ACTIVATED_BG, STATUS_ACTIVATED_TEXT,
  STATUS_PENDING_BG, STATUS_PENDING_TEXT,
  PRIMARY_MAIN,
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
    transition: { duration: 0.22, ease: [0.23, 1, 0.32, 1] as [number, number, number, number], delay: i * 0.05 },
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
        borderRadius: 2,
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
            {ticket.business_name ?? 'Free weekly ticket'}
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
      <TicketStatusSection code={ticket.code} status={ticket.status} />
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
      <TicketStatusSection code={ticket.code} status={ticket.status} />
    </TicketRowWrapper>
  );
};

// --- MAIN LIST COMPONENT ---
export const ActiveTicketsList = ({ draw_id }: { draw_id: number | null }) => {
  const navigate = useNavigate();
  const isBusinessOwner = useAppSelector(selectIsBusiness);
  const isLocation = useAppSelector(selectIsLocationManager);
  const isBusiness = isBusinessOwner || isLocation;
  const { data: tickets, isLoading } = useMyTickets(draw_id ?? 0);

  const ticketCount = tickets?.length ?? 0;

  if (!draw_id) return (
    <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
      <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'rgba(25,93,230,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
        <ConfirmationNumberOutlined sx={{ fontSize: 32, color: 'primary.main' }} />
      </Box>
      <Typography variant='subtitle1' fontWeight={700} color='text.secondary'>Select a draw</Typography>
      <Typography variant='body2' color='text.disabled' sx={{ mt: 0.5 }}>Choose a draw from the list to see tickets</Typography>
    </Box>
  );

  return (
    <>
      {/* Ticket count hero stat */}
      <Box
        sx={{
          px: 3,
          pt: 0,
          pb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <Box>
          <Typography
            variant='caption'
            sx={{
              color: 'text.disabled',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.65rem',
            }}
          >
            {isBusiness ? 'Distributed' : 'Your Entries'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            {isLoading ? (
              <Skeleton width={60} height={44} />
            ) : (
              <>
                <Typography
                  variant='h3'
                  sx={{
                    fontWeight: 900,
                    color: PRIMARY_MAIN,
                    lineHeight: 1,
                    letterSpacing: '-0.03em',
                  }}
                >
                  {ticketCount}
                </Typography>
                <Typography
                  variant='body1'
                  sx={{ fontWeight: 700, color: 'text.secondary' }}
                >
                  ticket{ticketCount !== 1 ? 's' : ''}
                </Typography>
              </>
            )}
          </Box>
        </Box>
        <Typography
          variant='caption'
          sx={{
            fontWeight: 600,
            color: 'text.disabled',
            pb: 0.5,
          }}
        >
          {isBusiness ? 'All locations' : ''}
        </Typography>
      </Box>

      {/* Ticket list */}
      <Stack spacing={1.5} px={2} pb={3}>
        {isLoading ? (
          [...Array(3)].map((_, index) => <TicketSkeleton key={index} />)
        ) : tickets && tickets.length > 0 ? (
          tickets.map((ticket: BusinessTicket | UserTicket, index: number) =>
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
              No tickets distributed yet
            </Typography>
            <Typography variant='body2' color='text.disabled' sx={{ mt: 0.5 }}>
              Tickets will appear here once customers activate them at your location.
            </Typography>
          </Box>
        ) : (
          <EmptyState
            icon={<ConfirmationNumberOutlined />}
            title='No tickets yet'
            description='Submit a receipt at a partner business to earn your first entry'
            actionLabel='Scan a receipt'
            onAction={() => navigate('/scan')}
          />
        )}
      </Stack>
    </>
  );
};

// --- SHARED UI HELPERS ---
const iconBoxStyle = {
  width: 48,
  height: 48,
  borderRadius: 3,
  bgcolor: 'action.hover',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const TicketStatusSection = ({
  code,
  status,
}: {
  code: string;
  status: string;
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
        label={status.toUpperCase()}
        size='small'
        sx={{
          height: 24,
          fontSize: '0.65rem',
          fontWeight: 700,
          borderRadius: '12px',
          bgcolor: status === 'Activated' ? STATUS_ACTIVATED_BG : STATUS_PENDING_BG,
          color: status === 'Activated' ? STATUS_ACTIVATED_TEXT : STATUS_PENDING_TEXT,
          border: '1px solid',
          borderColor: status === 'Activated'
            ? 'rgba(46,125,50,0.2)'
            : 'rgba(230,81,0,0.2)',
          '& .MuiChip-icon': {
            color: status === 'Activated' ? STATUS_ACTIVATED_TEXT : STATUS_PENDING_TEXT,
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
      borderRadius: 2,
      bgcolor: 'background.paper',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Skeleton
        variant='rectangular'
        width={48}
        height={48}
        sx={{ borderRadius: 3 }}
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
