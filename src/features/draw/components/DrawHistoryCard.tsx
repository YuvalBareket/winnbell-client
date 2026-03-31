import {
  Box, Typography, Paper, Stack, Chip,
} from '@mui/material';
import { EmojiEventsOutlined, StorefrontOutlined, CardGiftcard, CalendarToday } from '@mui/icons-material';
import { formatCurrency, formatDateShort } from '../../../shared/utils/date';
import {
  PRIMARY_MAIN,
} from '../../../shared/colors';
import type { IDrawResult } from '../types';

const DrawHistoryCard = ({ draw }: { draw: IDrawResult }) => {
  const hasWinner = !!draw.winner_name;
  const isBusinessWinner = hasWinner && !!draw.winner_business_name;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2.5, pb: 2 }}>
        <Stack direction='row' justifyContent='space-between' alignItems='flex-start'>
          <Box flex={1} minWidth={0} pr={1}>
            <Typography variant='body2' fontWeight={700} color='text.secondary' noWrap sx={{ mb: 0.25 }}>
              {draw.name}
            </Typography>
            <Typography variant='h5' fontWeight={900} color='text.primary' lineHeight={1.1}>
              {formatCurrency(draw.prize_amount)}
            </Typography>
          </Box>
          <Chip
            label='Closed'
            size='small'
            sx={{ fontWeight: 700, fontSize: '0.65rem', bgcolor: 'action.hover', color: 'text.secondary' }}
          />
        </Stack>

        <Stack direction='row' alignItems='center' spacing={0.5} mt={1.5}>
          <CalendarToday sx={{ fontSize: 13, color: 'text.disabled' }} />
          <Typography variant='caption' color='text.secondary' fontWeight={600}>
            {formatDateShort(draw.draw_date)}
          </Typography>
        </Stack>
      </Box>

      {/* Winner Story Block */}
      <Box sx={{ px: 2.5, pb: 2.5 }}>
        {hasWinner ? (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderLeft: '4px solid',
              borderLeftColor: isBusinessWinner ? PRIMARY_MAIN : '#10b981',
            }}
          >
            {isBusinessWinner ? (
              <Stack spacing={0.75}>
                <Stack direction='row' alignItems='flex-start' spacing={1}>
                  <StorefrontOutlined
                    sx={{
                      fontSize: 24,
                      color: PRIMARY_MAIN,
                      flexShrink: 0,
                      mt: 0.25,
                    }}
                  />
                  <Box flex={1} minWidth={0}>
                    <Typography
                      variant='h6'
                      fontWeight={900}
                      color='text.primary'
                      sx={{ lineHeight: 1.2 }}
                    >
                      {draw.winner_business_name}
                    </Typography>
                    {draw.winner_location_name && (
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        fontWeight={600}
                        sx={{ mt: 0.25 }}
                      >
                        {draw.winner_location_name}
                      </Typography>
                    )}
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      fontStyle='italic'
                      sx={{ mt: 0.75 }}
                    >
                      A regular purchase turned into a big win
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            ) : (
              <Stack spacing={0.75}>
                <Stack direction='row' alignItems='flex-start' spacing={1}>
                  <CardGiftcard
                    sx={{
                      fontSize: 24,
                      color: '#10b981',
                      flexShrink: 0,
                      mt: 0.25,
                    }}
                  />
                  <Box flex={1} minWidth={0}>
                    <Typography
                      variant='h6'
                      fontWeight={900}
                      color='text.primary'
                      sx={{ lineHeight: 1.2 }}
                    >
                      Won with a free weekly ticket!
                    </Typography>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      fontStyle='italic'
                      sx={{ mt: 0.75 }}
                    >
                      No purchase needed — anyone can win
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <EmojiEventsOutlined sx={{ fontSize: 20, color: 'text.disabled', flexShrink: 0 }} />
            <Typography variant='body2' color='text.disabled' fontWeight={600}>
              No winner recorded
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default DrawHistoryCard;
