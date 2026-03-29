import { Box, Typography, Stack, Paper, Chip, Skeleton } from '@mui/material';
import { Circle, Storefront, Person } from '@mui/icons-material';
import { formatTicketDate } from '../../../shared/utils/date';
import { BUSINESS_SECTORS } from '../../admin/data';
import { useMyTickets } from '../hooks/useMyTickets';
import { useAppSelector } from '../../../store/hook';
import { selectIsBusiness } from '../../../store/selectors/authSelectors';
import type { UserTicket, BusinessTicket } from '../types/myTicket.types';

// --- Sub-Component: USER ROW ---
const UserTicketRow = ({ ticket }: { ticket: UserTicket }) => {
  const sectorInfo =
    BUSINESS_SECTORS[ticket.business_sector] || BUSINESS_SECTORS.Free;
  const { date, time } = formatTicketDate(ticket.activated_at);

  return (
    <Paper elevation={0} sx={rowStyle}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={iconBoxStyle}>{sectorInfo.icon}</Box>
        <Box>
          <Typography
            variant='subtitle1'
            sx={{ fontWeight: 700, lineHeight: 1.2 }}
          >
            {ticket.business_name ?? 'Free weekly ticket'}
          </Typography>
          <Typography
            variant='caption'
            sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}
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

// --- Sub-Component: BUSINESS ROW ---
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
        <Box>
          <Typography
            variant='subtitle1'
            sx={{ fontWeight: 700, lineHeight: 1.2 }}
          >
            {ticket.activated_by_user ?? 'Not Activated'}
          </Typography>
          <Typography
            variant='caption'
            sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}
          >
            Branch: {ticket.location_name}{' '}
            {ticket.status === 'Activated' && `• ${date}`}
          </Typography>
        </Box>
      </Box>
      <TicketStatusSection code={ticket.code} status={ticket.status} />
    </Paper>
  );
};

// --- Main Component ---
export const ActiveTicketsList = ({ draw_id }: { draw_id: number | null }) => {
  const { data: tickets, isLoading } = useMyTickets(draw_id);
  const isBusiness = useAppSelector(selectIsBusiness);

  if (!draw_id) return null;

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: 2,
          px: 3,
          pt: 1,
        }}
      >
        <Typography variant='h6' sx={{ fontWeight: 700 }}>
          {'My Active Tickets'}
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
          tickets.map((ticket: any) =>
            isBusiness ? (
              <BusinessTicketRow key={ticket.id} ticket={ticket} />
            ) : (
              <UserTicketRow key={ticket.id} ticket={ticket} />
            ),
          )
        ) : (
          <Box sx={{ py: 4, textAlign: 'center', opacity: 0.6 }}>
            <Typography variant='body2'>
              No tickets found for this draw.
            </Typography>
          </Box>
        )}
      </Stack>
    </>
  );
};

// --- Shared Helper Styles & Components ---
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
          bgcolor: status === 'Activated' ? '#e8f5e9' : '#fff3e0',
          color: status === 'Activated' ? '#2e7d32' : '#e65100',
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
        <Skeleton width={120} />
        <Skeleton width={80} />
      </Box>
    </Box>
    <Box>
      <Skeleton width={60} height={24} />
      <Skeleton width={80} />
    </Box>
  </Paper>
);
