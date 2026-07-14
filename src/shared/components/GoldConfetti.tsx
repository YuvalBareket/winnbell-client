import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { makeConfettiPieces, type ConfettiPiece, type PopPiece } from './confettiPieces';

// Golden confetti for the "you got an entry" celebration screens.
// Pure framer-motion (no canvas / extra deps): ~30 gold flecks fall from above the screen,
// drifting and tumbling, staggered so the shower feels organic. Plays once per mount -
// the success dialogs mount fresh on open, so it fires exactly when the screen appears.
//
// Piece generators live in confettiPieces.ts (they use Math.random and must never run in
// render). For tap-to-celebrate extras, call makePopPieces() in the click handler and
// render one <ConfettiPop> per burst.

const PIECES: ConfettiPiece[] = makeConfettiPieces();

/** One radial confetti explosion anchored at viewport-relative (x, y). Plays once per mount. */
export const ConfettiPop = ({ x, y, pieces }: { x: number; y: number; pieces: PopPiece[] }) => (
  <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
    {pieces.map((p, i) => (
      <motion.div
        key={i}
        initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
        animate={{
          x: p.dx,
          // Rise first, hang at the top, then float down - light like paper, not a stone.
          y: [0, -p.lift, p.fall],
          rotate: p.spin,
          opacity: [1, 1, 1, 0],
          scale: [1, 1, 0.8],
        }}
        transition={{
          duration: p.duration,
          ease: 'easeOut',
          // The vertical arc gets per-segment easing so the fleck decelerates INTO the apex
          // and eases OUT of it - a rounded turn instead of a sharp bounce at the top.
          y: { duration: p.duration, times: [0, 0.21, 1], ease: ['easeOut', 'easeInOut'] },
        }}
        style={{
          position: 'absolute',
          top: y,
          left: x,
          width: p.size,
          height: p.round ? p.size : p.size * 1.7,
          borderRadius: p.round ? '50%' : 2,
          background: p.color,
          // Transform/opacity only - composited on the GPU, no layout or paint per frame.
          willChange: 'transform, opacity',
        }}
      />
    ))}
  </Box>
);

const GoldConfetti = ({ pieces = PIECES }: { pieces?: ConfettiPiece[] }) => (
  <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
    {pieces.map((p, i) => (
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
