import { Box, Typography, Paper, Chip } from '@mui/material';
import { Circle, Person, Storefront } from '@mui/icons-material';
import { formatTicketDate } from '../../../shared/utils/date';
import type { BusinessTicket } from '../types/myTicket.types';

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

export const BusinessTicketRow = ({ ticket }: { ticket: BusinessTicket }) => {
  const { date, time } = formatTicketDate(ticket.activated_at ?? '');

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
            Branch: <strong>{ticket.location_name}</strong>{' '}
            {ticket.status === 'Activated' && `• ${date} ${time}`}
          </Typography>
        </Box>
      </Box>

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
          {ticket.code}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Chip
            icon={<Circle sx={{ fontSize: '6px !important' }} />}
            label={ticket.status.toUpperCase()}
            size='small'
            sx={{
              height: 20,
              fontSize: '0.65rem',
              fontWeight: 700,
              bgcolor: ticket.status === 'Activated' ? '#e8f5e9' : '#fff3e0',
              color: ticket.status === 'Activated' ? '#2e7d32' : '#e65100',
            }}
          />
        </Box>
      </Box>
    </Paper>
  );
};
