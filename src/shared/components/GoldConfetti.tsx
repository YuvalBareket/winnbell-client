import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { GOLD_TROPHY, ACCENT_GOLD, ACCENT_GOLD_LIGHT } from '../colors';

// Golden confetti for the "you got an entry" celebration screens.
// Pure framer-motion (no canvas / extra deps): ~30 gold flecks fall from above the screen,
// drifting and tumbling, staggered so the shower feels organic. Plays once per mount -
// the success dialogs mount fresh on open, so it fires exactly when the screen appears.
//
// Pieces are generated at module scope (not in render) so Math.random never runs during
// a render pass and every mount replays the same, tuned shower.

const COLORS = [GOLD_TROPHY, ACCENT_GOLD, ACCENT_GOLD_LIGHT, '#ffffff'];

interface Piece {
  left: number;      // % across the screen
  delay: number;     // s before this fleck starts falling
  duration: number;  // s to cross the screen
  size: number;      // px
  color: string;
  drift: number;     // px of horizontal sway while falling
  spin: number;      // total rotation in deg
  round: boolean;    // circle vs rectangle fleck
}

const PIECES: Piece[] = Array.from({ length: 30 }, (_, i) => ({
  left: (i * 37) % 100,                      // spread deterministically across the width
  delay: Math.random() * 1.4,
  duration: 3 + Math.random() * 2,
  size: 5 + Math.random() * 5,
  color: COLORS[i % COLORS.length],
  drift: -50 + Math.random() * 100,
  spin: 360 + Math.random() * 540,
  round: i % 3 === 0,
}));

const GoldConfetti = () => (
  <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
    {PIECES.map((p, i) => (
      <motion.div
        key={i}
        initial={{ y: '-6vh', x: 0, rotate: 0, opacity: 0 }}
        animate={{ y: '106vh', x: p.drift, rotate: p.spin, opacity: [0, 1, 1, 0.9, 0.6] }}
        transition={{ delay: p.delay, duration: p.duration, ease: 'linear' }}
        style={{
          position: 'absolute',
          top: 0,
          left: `${p.left}%`,
          width: p.size,
          height: p.round ? p.size : p.size * 1.7,
          borderRadius: p.round ? '50%' : 2,
          background: p.color,
          opacity: 0,
        }}
      />
    ))}
  </Box>
);

export default GoldConfetti;
