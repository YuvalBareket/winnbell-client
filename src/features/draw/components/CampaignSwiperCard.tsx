import { Box, Typography, Chip, Stack } from '@mui/material';
import { CalendarToday } from '@mui/icons-material';
import type { IDrawResult } from '../types';
import { calculateDaysLeft, formatCurrency, formatDateShort } from '../../../shared/utils/date';
import {
  GRADIENT_DRAW_CARD,
  BG_SURFACE,
  ALPHA_WHITE_15,
  ALPHA_WHITE_30,
  ALPHA_BLACK_04,
  SHADOW_CARD,
  BORDER_SUBTLE,
  PRIMARY_MAIN,
  PRIMARY_DARK,
  ALPHA_PRIMARY_10,
  SHADOW_FLOAT,
  SHADOW_NEUTRAL_SOFT,
} from '../../../shared/colors';

interface CampaignSwiperCardProps {
  draw: IDrawResult;
}

const CampaignSwiperCard = ({ draw }: CampaignSwiperCardProps) => {
  const isOpen = draw.status?.toLowerCase() === 'open';
  const daysLeft = calculateDaysLeft(draw.draw_date);

  return (
    <Box
      sx={{
        height: '100%',
        borderRadius: 3,
        overflow: 'hidden',
        background: isOpen ? GRADIENT_DRAW_CARD : BG_SURFACE,
        color: isOpen ? 'white' : 'text.primary',
        p: { xs: 2, sm: 3 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: isOpen ? SHADOW_FLOAT : SHADOW_CARD,
        border: !isOpen ? `1px solid ${BORDER_SUBTLE}` : 'none',
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'transform',
        // Closed card: blue left stripe accent
        ...(!isOpen && {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: '4px',
            background: PRIMARY_MAIN,
            pointerEvents: 'none',
          },
        }),
      }}
    >
      {/* Header: Name and Status */}
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
          sx={{ mb: { xs: 1, sm: 2.5 } }}
        >
          <Box flex={1}>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              sx={{
                fontSize: { xs: '0.9rem', sm: '0.95rem' },
                lineHeight: 1.3,
                mb: 1,
                opacity: isOpen ? 0.95 : 1,
              }}
            >
              {draw.name}
            </Typography>
          </Box>
          <Chip
            label={isOpen ? 'LIVE' : 'Closed'}
            size="small"
            icon={
              isOpen ? (
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: 'currentColor',
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.5 },
                    },
                  }}
                />
              ) : undefined
            }
            sx={{
              fontWeight: 700,
              fontSize: '0.65rem',
              letterSpacing: '0.5px',
              flexShrink: 0,
              ...(isOpen
                ? {
                    bgcolor: ALPHA_WHITE_30,
                    color: 'white',
                    border: `1px solid ${ALPHA_WHITE_30}`,
                    '& .MuiChip-icon': {
                      marginLeft: '4px',
                      marginRight: '-4px',
                      color: 'inherit',
                    },
                  }
                : {
                    bgcolor: ALPHA_PRIMARY_10,
                    color: PRIMARY_DARK,
                    border: `1.5px solid ${PRIMARY_MAIN}`,
                    fontWeight: 700,
                  }),
            }}
          />
        </Stack>

        {/* Prize Amount - Hero element with blue gradient for closed cards */}
        <Typography
          variant="h4"
          fontWeight={900}
          sx={{
            fontSize: { xs: '1.5rem', sm: '1.85rem' },
            lineHeight: 1.2,
            mb: { xs: 1, sm: 2.5 },
            letterSpacing: '-0.5px',
            opacity: isOpen ? 1 : 0.9,
            ...(isOpen && {
              textShadow: SHADOW_NEUTRAL_SOFT,
            }),
            ...(!isOpen && {
              background: `linear-gradient(135deg, ${PRIMARY_MAIN} 0%, ${PRIMARY_DARK} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }),
          }}
        >
          {formatCurrency(draw.prize_amount)}
        </Typography>
      </Box>

      {/* Footer: Date and Entries */}
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <Stack spacing={2.5}>
          {/* Date/Days Left */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                borderRadius: '6px',
                bgcolor: isOpen ? ALPHA_WHITE_15 : ALPHA_BLACK_04,
                flexShrink: 0,
              }}
            >
              <CalendarToday
                sx={{
                  fontSize: 14,
                  opacity: isOpen ? 0.85 : 0.7,
                }}
              />
            </Box>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{
                fontSize: '0.875rem',
                opacity: isOpen ? 0.9 : 0.85,
                lineHeight: 1.4,
              }}
            >
              {isOpen
                ? daysLeft <= 0
                  ? 'Campaign ends today'
                  : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`
                : formatDateShort(draw.draw_date)}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default CampaignSwiperCard;
