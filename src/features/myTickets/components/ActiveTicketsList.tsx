import { Box, Typography, Stack, Paper, Chip, Skeleton, Button } from '@mui/material';
import { Circle, Person, Storefront, ConfirmationNumberOutlined, StorefrontOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  STATUS_ACTIVATED_BG, STATUS_ACTIVATED_TEXT,
  STATUS_PENDING_BG, STATUS_PENDING_TEXT,
  ALPHA_PRIMARY_10,
} from '../../../shared/colors';
import { formatTicketDate } from '../../../shared/utils/date';
import { BUSINESS_SECTORS } from '../../admin/data';
import { useMyTickets } from '../hooks/useMyTickets';
import { selectIsBusiness, selectIsLocationManager } from '../../../store/selectors/authSelectors';
import { useAppSelector } from '../../../store/hook';
import type { BusinessTicket, UserTicket } from '../types/myTicket.types';

// --- 1. USER TICKET COMPONENT ---
const UserTicketRow = ({ ticket }: { ticket: UserTicket }) => {
  const sectorInfo =
    BUSINESS_SECTORS[ticket.business_sector] || BUSINESS_SECTORS.Free;
  const { date, time } = formatTicketDate(ticket.activated_at);

  return (
    <Paper elevation={0} sx={rowStyle}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={iconBoxStyle}>{sectorInfo.icon}</Box>
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
    </Paper>
  );
};

// --- 2. BUSINESS TICKET COMPONENT ---
const BusinessTicketRow = ({ ticket }: { ticket: BusinessTicket }) => {
  const { date, time } = formatTicketDate(ticket.activated_at);

  return (
    <Paper elevation={0} sx={rowStyle}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
    </Paper>
  );
};

// --- MAIN LIST COMPONENT ---
export const ActiveTicketsList = ({ draw_id }: { draw_id: number | null }) => {
  const navigate = useNavigate();
  const isBusinessOwner = useAppSelector(selectIsBusiness);
  const isLocation = useAppSelector(selectIsLocationManager);
  const isBusiness = isBusinessOwner || isLocation;
  const { data: tickets, isLoading } = useMyTickets(draw_id);

  if (!draw_id) return (
    <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
      <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: ALPHA_PRIMARY_10, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
        <ConfirmationNumberOutlined sx={{ fontSize: 32, color: 'primary.main' }} />
      </Box>
      <Typography variant='subtitle1' fontWeight={700} color='text.secondary'>Select a draw</Typography>
      <Typography variant='body2' color='text.disabled' sx={{ mt: 0.5 }}>Choose a draw from the list to see tickets</Typography>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          px: 3,
          pt: 1,
        }}
      >
        <Typography variant='h6' sx={{ fontWeight: 700 }}>
          {isBusiness ? 'Distributed Tickets' : 'My Active Tickets'}
        </Typography>
        <Typography
          variant='body2'
          sx={{ fontWeight: 600, color: 'primary.main' }}
        >
          {isLoading ? (
            <Skeleton width={40} />
          ) : (
            `${tickets?.length || 0} Total`
          )}
        </Typography>
      </Box>

      <Stack spacing={2} px={2}>
        {isLoading ? (
          [...Array(3)].map((_, index) => <TicketSkeleton key={index} />)
        ) : tickets && tickets.length > 0 ? (
          tickets.map((ticket: BusinessTicket | UserTicket) =>
            isBusiness ? (
              <BusinessTicketRow key={ticket.id} ticket={ticket as BusinessTicket} />
            ) : (
              <UserTicketRow key={ticket.id} ticket={ticket as UserTicket} />
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
          <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: ALPHA_PRIMARY_10, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
              <ConfirmationNumberOutlined sx={{ fontSize: 32, color: 'primary.main' }} />
            </Box>
            <Typography variant='subtitle1' fontWeight={700} color='text.secondary'>
              No tickets for this draw
            </Typography>
            <Typography variant='body2' color='text.disabled' sx={{ mt: 0.5, mb: 2.5 }}>
              Visit a partner location and scan your QR code to enter this draw.
            </Typography>
            <Button
              variant='contained'
              size='small'
              disableElevation
              onClick={() => navigate('/nearby')}
              sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', px: 3 }}
            >
              Find Partners Nearby
            </Button>
          </Box>
        )}
      </Stack>
    </>
  );
};

// --- SHARED UI HELPERS ---
const rowStyle = {
  p: 2,
  borderRadius: 3,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  border: '1px solid',
  borderColor: 'divider',
};

const iconBoxStyle = {
  width: 48,
  height: 48,
  borderRadius: 3,
  bgcolor: 'action.hover',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const TicketStatusSection = ({
  code,
  status,
}: {
  code: string;
  status: string;
}) => (
  <Box sx={{ textAlign: 'right' }}>
    <Typography
      variant='body2'
      sx={{
        fontFamily: 'monospace',
        fontWeight: 700,
        bgcolor: 'background.default',
        px: 1,
        py: 0.5,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        mb: 1,
        display: 'inline-block',
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
          height: 20,
          fontSize: '0.65rem',
          fontWeight: 700,
          bgcolor: status === 'Activated' ? STATUS_ACTIVATED_BG : STATUS_PENDING_BG,
          color: status === 'Activated' ? STATUS_ACTIVATED_TEXT : STATUS_PENDING_TEXT,
          border: '1px solid',
          borderColor: 'divider',
        }}
      />
    </Box>
  </Box>
);

const TicketSkeleton = () => (
  <Paper elevation={0} sx={rowStyle}>
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
      <Skeleton width={60} height={24} sx={{ mb: 1 }} />
      <Skeleton width={80} height={20} />
    </Box>
  </Paper>
);
