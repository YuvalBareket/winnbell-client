import { ACCENT_GOLD, GOLD_TROPHY, ACCENT_GOLD_LIGHT } from '../../../shared/colors';

// Sweeping gold gradient for a prize amount - background-position animates across it so the
// text shimmers. Applied to the CURRENT (live) draw's prize on the campaign cards.
const GOLD_SHIMMER = `linear-gradient(90deg, ${ACCENT_GOLD} 0%, ${GOLD_TROPHY} 25%, ${ACCENT_GOLD_LIGHT} 50%, ${GOLD_TROPHY} 75%, ${ACCENT_GOLD} 100%)`;

export const goldShineSx = {
  background: GOLD_SHIMMER,
  backgroundSize: '200% auto',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
  filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))',
  animation: 'goldShimmer 3s linear infinite',
  '@keyframes goldShimmer': {
    '0%': { backgroundPosition: '0% center' },
    '100%': { backgroundPosition: '200% center' },
  },
} as const;
