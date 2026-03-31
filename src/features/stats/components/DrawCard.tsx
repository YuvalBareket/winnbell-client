import { Paper, Box, Typography, Stack, Chip } from '@mui/material';
import { CalendarToday } from '@mui/icons-material';
import { PRIMARY_MAIN } from '../../../shared/colors';
import { formatCurrencyILS, formatDateShort } from '../../../shared/utils/date';
import type { DrawDataPoint } from '../api/stats.api';

const activationRate = (issued: number, activated: number) =>
  issued > 0 ? Math.round((activated / issued) * 100) : 0;

const DrawCard = ({ draw, selected, onClick }: { draw: DrawDataPoint; selected: boolean; onClick: () => void }) => {
  const rate = activationRate(draw.issued, draw.activated);
  const isPast = new Date(draw.draw_date) < new Date();
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2.5, borderRadius: 3, cursor: 'pointer',
        border: '2px solid', borderColor: selected ? PRIMARY_MAIN : 'divider',
        bgcolor: selected ? `${PRIMARY_MAIN}08` : 'background.paper',
        transition: 'all 0.15s ease',
        '&:hover': { borderColor: PRIMARY_MAIN, bgcolor: `${PRIMARY_MAIN}05` },
      }}
    >
      <Stack direction='row' justifyContent='space-between' alignItems='flex-start' mb={1.5}>
        <Box flex={1} minWidth={0} pr={1}>
          <Typography variant='body2' fontWeight={700} noWrap color={selected ? 'primary.main' : 'text.primary'}>
            {draw.draw_name}
          </Typography>
          <Typography variant='h6' fontWeight={900} color={selected ? 'primary.main' : 'text.primary'} lineHeight={1.2}>
            {formatCurrencyILS(draw.prize_amount)}
          </Typography>
        </Box>
        <Chip
          label={isPast ? 'Completed' : 'Active'}
          size='small'
          sx={{
            fontWeight: 700, fontSize: '0.65rem',
            bgcolor: isPast ? 'action.hover' : '#dcfce7',
            color: isPast ? 'text.secondary' : '#16a34a',
          }}
        />
      </Stack>
      <Stack direction='row' alignItems='center' spacing={0.5} mb={1.5}>
        <CalendarToday sx={{ fontSize: 13, color: 'text.disabled' }} />
        <Typography variant='caption' color='text.secondary' fontWeight={600}>
          {formatDateShort(draw.draw_date)}
        </Typography>
      </Stack>
      <Stack direction='row' spacing={2}>
        <Box>
          <Typography variant='caption' color='text.disabled' fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Issued</Typography>
          <Typography variant='subtitle2' fontWeight={800}>{draw.issued.toLocaleString()}</Typography>
        </Box>
        <Box>
          <Typography variant='caption' color='text.disabled' fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Activated</Typography>
          <Typography variant='subtitle2' fontWeight={800}>{draw.activated.toLocaleString()}</Typography>
        </Box>
        <Box>
          <Typography variant='caption' color='text.disabled' fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Rate</Typography>
          <Typography variant='subtitle2' fontWeight={800} color={rate >= 50 ? '#16a34a' : rate >= 25 ? '#d97706' : 'text.primary'}>
            {rate}%
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default DrawCard;
