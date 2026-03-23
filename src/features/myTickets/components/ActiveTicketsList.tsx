import { Box, Typography, Stack, Paper, Chip, Skeleton } from '@mui/material';
import { Circle, Person, Storefront } from '@mui/icons-material';
import { formatTicketDate } from '../../../shared/utils/date';
import { BUSINESS_SECTORS } from '../../admin/data';
import { useMyTickets } from '../hooks/useMyTickets';
import { selectIsBusiness, selectIsLocationManager } from '../../../store/selectors/authSelectors';
import { useAppSelector } from '../../../store/hook';

// --- 1. USER TICKET COMPONENT ---
const UserTicketRow = ({ ticket }: { ticket: any }) => {
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
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
              mt: 0.5,
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
const BusinessTicketRow = ({ ticket,isLocation }: { ticket: any,isLocation:boolean }) => {
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
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
              mt: 0.5,
              display: 'block',
            }}
          >
            {isLocation&&ticket.location_name}{' '}
            {ticket.status === 'Activated' && `• ${date} ${time}`}
          </Typography>
        </Box>
      </Box>
      <TicketStatusSection code={ticket.code} status={ticket.status} />
    </Paper>
  );
};

// --- MAIN LIST COMPONENT ---
export const ActiveTicketsList = ({ draw_id }: { draw_id: number | null }) => {
  const isBusinessOwner = useAppSelector(selectIsBusiness);
    const isLocation = useAppSelector(selectIsLocationManager);
const isBusiness=isBusinessOwner||isLocation
  const { data: tickets, isLoading } = useMyTickets(draw_id);

  if (!draw_id) return null;

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
          tickets.map((ticket: any) =>
            isBusiness ? (
              <BusinessTicketRow key={ticket.id} ticket={ticket}  isLocation={isLoading}/>
            ) : (
              <UserTicketRow key={ticket.id} ticket={ticket} />
            ),
          )
        ) : (
          <Box sx={{ py: 4, textAlign: 'center', opacity: 0.6 }}>
            <Typography variant='body2'>
              {isBusiness
                ? 'No tickets handed out for this draw.'
                : 'No tickets entered for this draw.'}
            </Typography>
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
          bgcolor: status === 'Activated' ? '#e8f5e9' : '#fff3e0',
          color: status === 'Activated' ? '#2e7d32' : '#e65100',
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
