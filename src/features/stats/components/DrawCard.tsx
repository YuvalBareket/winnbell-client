import { Box, Typography, Stack, Chip } from '@mui/material';
import { PRIMARY_MAIN } from '../../../shared/colors';
import TapArea from '../../../shared/components/TapArea';
import { formatCurrency, formatDateShort } from '../../../shared/utils/date'; // formatCurrency used for revenue
import type { DrawDataPoint } from '../api/stats.api';

const DrawCard = ({ draw, selected, onClick }: { draw: DrawDataPoint; selected: boolean; onClick: () => void }) => {
  const isPast = new Date(draw.draw_date) < new Date();
  return (
    <TapArea
      onTap={onClick}
      sx={{
        p: 2.5, borderRadius: 2, cursor: 'pointer',
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
          <Typography variant='body2' color='text.secondary' lineHeight={1.2}>
            {formatDateShort(draw.draw_date)}
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

      <Stack direction='row' spacing={2}>
        <Box>
          <Typography variant='caption' color='text.disabled' fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Entries</Typography>
          <Typography variant='subtitle2' fontWeight={800}>{draw.entries.toLocaleString()}</Typography>
        </Box>
        <Box>
          <Typography variant='caption' color='text.disabled' fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Revenue</Typography>
          <Typography variant='subtitle2' fontWeight={800}>{formatCurrency(draw.revenue)}</Typography>
        </Box>
      </Stack>
    </TapArea>
  );
};

export default DrawCard;
