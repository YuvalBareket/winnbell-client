import { forwardRef } from 'react';
import { Button, type ButtonProps } from '@mui/material';
import { ALPHA_WHITE_30 } from '../colors';

// The app's generic call-to-action button, two-part "light attraction":
//  - a gentle scale up / scale down breathe (works on ANY button color), and
//  - a slow streak of light sweeping across every few seconds (visible on colored
//    and gradient CTAs; harmlessly invisible on white ones).
// The two loops run on different durations so they drift out of phase and read as
// organic rather than mechanical. This is the motion-language "attractor" in its
// lightest form - unlike `breathe`, it is safe on several buttons per page.
//
// Pure CSS on the GPU (transform/opacity only), so it costs nothing per instance.
// Both loops stop on hover (once the pointer is on the button the attraction has
// done its job), while the button is disabled (loading states), and for users with
// prefers-reduced-motion.
const attractSx = {
  position: 'relative',
  overflow: 'hidden',
  '@keyframes attract-breathe': {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.022)' },
    '100%': { transform: 'scale(1)' },
  },
  '@keyframes attract-sweep': {
    '0%': { transform: 'translateX(-160%) skewX(-18deg)' },
    // The streak crosses slowly (~1.7s), then rests off-screen for the remainder.
    '30%': { transform: 'translateX(320%) skewX(-18deg)' },
    '100%': { transform: 'translateX(320%) skewX(-18deg)' },
  },
  animation: 'attract-breathe 3.2s ease-in-out infinite',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '45%',
    background: `linear-gradient(90deg, transparent, ${ALPHA_WHITE_30}, transparent)`,
    animation: 'attract-sweep 5.6s ease-in-out infinite',
    pointerEvents: 'none',
  },
  '&:hover': { animation: 'none' },
  '&:hover::after': { display: 'none' },
  '&.Mui-disabled': { animation: 'none' },
  '&.Mui-disabled::after': { display: 'none' },
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
    '&::after': { display: 'none' },
  },
} as const;

const AttractButton = forwardRef<HTMLButtonElement, ButtonProps>(function AttractButton(
  { sx, ...props },
  ref,
) {
  return <Button ref={ref} {...props} sx={[attractSx, ...(Array.isArray(sx) ? sx : [sx])]} />;
});

export default AttractButton;
