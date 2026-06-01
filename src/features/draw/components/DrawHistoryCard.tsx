import {
  Box, Typography, Paper, Stack, Chip, Divider, Link,
} from '@mui/material';
import {
  CalendarToday, ConfirmationNumberOutlined, EmojiEventsOutlined, HourglassEmptyOutlined, ArticleOutlined,
} from '@mui/icons-material';
import { formatCurrency, formatDateShort } from '../../../shared/utils/date';
import {
  PRIMARY_MAIN,
  TEXT_SECONDARY,
  ACCENT_GOLD,
  ACCENT_GOLD_DARK,
  SHADOW_CARD,
  SHADOW_CARD_HOVER,
} from '../../../shared/colors';
import type { IDrawResult } from '../types';

const DrawHistoryCard = ({ draw }: { draw: IDrawResult }) => {
  const hasWinner = !!draw.winner_name;
  const isClosed = draw.status?.toLowerCase() === 'closed';
  const isOpen = draw.status?.toLowerCase() === 'open';

  const winnerFirstName = draw.winner_name ? draw.winner_name.split(' ')[0] : '';

  // Determine accent color based on state
  let accentColor = '#10b981'; // Default green for winner
  let showLiveChip = false;

  if (isOpen) {
    accentColor = PRIMARY_MAIN;
    showLiveChip = true;
  } else if (isClosed && !hasWinner) {
    accentColor = ACCENT_GOLD;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: SHADOW_CARD,
        transition: 'box-shadow 0.2s ease-in-out',
        '&:hover': {
          boxShadow: SHADOW_CARD_HOVER,
        },
      }}
    >
      {/* Grid: left stripe + content */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '4px 1fr',
        }}
      >
        {/* Left accent stripe */}
        <Box sx={{ bgcolor: accentColor }} />

        <Box>
          {/* Header section */}
          <Box sx={{ p: 3 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent='space-between'
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={2}
              sx={{ mb: 2 }}
            >
              <Box flex={1}>
                <Typography
                  variant='body2'
                  fontWeight={700}
                  color={TEXT_SECONDARY}
                  sx={{ mb: 0.75, fontSize: '0.875rem' }}
                >
                  {draw.name}
                </Typography>
                <Stack direction='row' spacing={1.5} alignItems='center'>
                  <CalendarToday sx={{ fontSize: 16, color: TEXT_SECONDARY }} />
                  <Typography variant='body2' color={TEXT_SECONDARY} fontWeight={600}>
                    {formatDateShort(draw.draw_date)}
                  </Typography>
                </Stack>
              </Box>
              <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                <Typography
                  variant='h6'
                  fontWeight={900}
                  color='text.primary'
                  sx={{ mb: 0.25, fontSize: '1.25rem' }}
                >
                  {formatCurrency(draw.prize_amount)}
                </Typography>
                <Typography variant='caption' color={TEXT_SECONDARY} fontWeight={600}>
                  {isOpen ? 'Prize Pool' : hasWinner ? 'Prize Awarded' : 'Prize Pool'}
                </Typography>
              </Box>
            </Stack>

            {/* Status chips and live indicator */}
            <Stack direction='row' spacing={1} alignItems='center'>
              <Chip
                label='Closed'
                size='small'
                sx={{
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  bgcolor: isClosed && hasWinner ? 'rgba(16,185,129,0.12)' : isClosed && !hasWinner ? 'rgba(245, 158, 11, 0.12)' : undefined,
                  color: isClosed && hasWinner ? '#10b981' : isClosed && !hasWinner ? ACCENT_GOLD_DARK : undefined,
                  display: isClosed ? 'inline-flex' : 'none',
                }}
              />
              {showLiveChip && (
                <Chip
                  label='LIVE'
                  size='small'
                  icon={
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: PRIMARY_MAIN,
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                        '@keyframes pulse': {
                          '0%, 100%': { opacity: 1 },
                          '50%': { opacity: 0.5 },
                        },
                      }}
                    />
                  }
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    bgcolor: `${PRIMARY_MAIN}20`,
                    color: PRIMARY_MAIN,
                    '& .MuiChip-icon': {
                      marginLeft: '4px',
                    },
                  }}
                />
              )}
            </Stack>
          </Box>

          <Divider />

          {/* Bottom section: varies by state */}
          <Box sx={{ p: 3 }}>
            {isOpen && draw.entry_count !== undefined && (
              <Stack direction='row' justifyContent='space-between' alignItems='center'>
                <Stack direction='row' spacing={1.5} alignItems='center'>
                  <ConfirmationNumberOutlined sx={{ fontSize: 20, color: TEXT_SECONDARY }} />
                  <Box>
                    <Typography variant='caption' color={TEXT_SECONDARY} display='block' sx={{ mb: 0.25 }}>
                      Total Entries
                    </Typography>
                    <Typography variant='body2' fontWeight={700}>
                      {draw.entry_count.toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>
                <Link
                  href='/rules'
                  underline='hover'
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.78rem', fontWeight: 600, color: TEXT_SECONDARY }}
                >
                  <ArticleOutlined sx={{ fontSize: 14 }} />
                  Official Rules
                </Link>
              </Stack>
            )}

            {isClosed && hasWinner && (
              <Stack direction='row' spacing={2} alignItems='flex-start'>
                <EmojiEventsOutlined
                  sx={{
                    fontSize: 28,
                    color: '#10b981',
                    flexShrink: 0,
                  }}
                />
                <Box flex={1}>
                  <Typography variant='body2' fontWeight={700} color='text.primary' sx={{ mb: 0.5 }}>
                    {winnerFirstName} won
                  </Typography>
                  <Typography variant='body2' color={TEXT_SECONDARY} sx={{ lineHeight: 1.5 }}>
                    {draw.winner_business_name
                      ? `Selected with ${draw.winner_business_name} receipt`
                      : 'Selected with free weekly entry'}
                  </Typography>
                </Box>
              </Stack>
            )}

            {isClosed && !hasWinner && (
              <Stack direction='row' spacing={2} alignItems='flex-start'>
                <HourglassEmptyOutlined
                  sx={{
                    fontSize: 28,
                    color: ACCENT_GOLD,
                    flexShrink: 0,
                  }}
                />
                <Box flex={1}>
                  <Typography variant='body2' fontWeight={700} color={ACCENT_GOLD_DARK} sx={{ mb: 0.5 }}>
                    Verification in progress
                  </Typography>
                  <Typography variant='body2' color={TEXT_SECONDARY} sx={{ lineHeight: 1.5 }}>
                    A potential winner has been selected and is undergoing eligibility and fraud verification. We'll announce the final winner soon.
                  </Typography>
                </Box>
              </Stack>
            )}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default DrawHistoryCard;
