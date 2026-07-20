// Small campaign card for the desktop "Active campaigns" column (My Entries).
// live (open) -> blue gradient with a gold LIVE NOW badge + shimmering gold prize
// ended (closed) -> white card with an ENDED tag
import { Box, Typography } from '@mui/material';
import type { IDrawSummary } from '../types';
import { calculateDaysLeft, formatCurrency } from '../../../shared/utils/date';
import { goldShineSx } from './goldShine';
import {
  PRIMARY_MAIN, PRIMARY_DEEP, GOLD_TROPHY, ACCENT_GOLD_LIGHT,
  ALPHA_WHITE_70, ALPHA_WHITE_80, BG_SURFACE, BORDER_SUBTLE,
  TEXT_HEADING, TEXT_SECONDARY, TEXT_TERTIARY, SHADOW_PRIMARY_GLOW, SHADOW_CARD,
} from '../../../shared/colors';

export const CampaignMiniCard = ({ draw, selected }: { draw: IDrawSummary; selected: boolean }) => {
  const isClosed = draw.status?.toLowerCase() === 'closed';
  const daysLeft = calculateDaysLeft(draw.draw_date);
  const prize = draw.prize_amount != null ? formatCurrency(draw.prize_amount) : '$ Revealing soon';

  if (isClosed) {
    return (
      <Box
        sx={{
          width: '100%', borderRadius: '16px', p: '15px 16px',
          bgcolor: BG_SURFACE,
          border: `1px solid ${selected ? PRIMARY_MAIN : BORDER_SUBTLE}`,
          boxShadow: selected ? `0 0 0 1px ${PRIMARY_MAIN}` : 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.75 }}>
          <Typography noWrap sx={{ color: TEXT_HEADING, fontSize: '0.88rem', fontWeight: 800 }}>{draw.name}</Typography>
          <Typography sx={{ color: TEXT_TERTIARY, fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>Ended</Typography>
        </Box>
        <Typography sx={{ color: TEXT_SECONDARY, fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>{prize}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative', overflow: 'hidden',
        width: '100%', borderRadius: '16px', p: 2,
        background: `linear-gradient(150deg, ${PRIMARY_MAIN} 0%, ${PRIMARY_DEEP} 100%)`,
        color: '#fff', boxShadow: selected ? SHADOW_PRIMARY_GLOW : SHADOW_CARD,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: GOLD_TROPHY }} />
        <Typography sx={{ color: ACCENT_GOLD_LIGHT, fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Live now</Typography>
      </Box>
      <Typography noWrap sx={{ color: ALPHA_WHITE_80, fontSize: '0.9rem', fontWeight: 800, mb: 0.5 }}>{draw.name}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 1 }}>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, ...goldShineSx }}>{prize}</Typography>
        <Typography sx={{ color: ALPHA_WHITE_70, fontSize: '0.72rem', fontWeight: 700, flexShrink: 0, pb: 0.25 }}>
          {daysLeft <= 0 ? 'Ends today' : `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`}
        </Typography>
      </Box>
    </Box>
  );
};
