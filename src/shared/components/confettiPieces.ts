import { GOLD_TROPHY, ACCENT_GOLD, ACCENT_GOLD_LIGHT } from '../colors';

// Piece generators for the confetti components (GoldConfetti / ConfettiPop). They use
// Math.random, so they are IMPURE: call them at module scope or from event handlers only,
// never during a render pass.

const COLORS = [GOLD_TROPHY, ACCENT_GOLD, ACCENT_GOLD_LIGHT, '#ffffff'];

export interface ConfettiPiece {
  left: number;      // % across the screen
  delay: number;     // s before this fleck starts falling
  duration: number;  // s to cross the screen
  size: number;      // px
  color: string;
  drift: number;     // px of horizontal sway while falling
  spin: number;      // total rotation in deg
  round: boolean;    // circle vs rectangle fleck
}

export const makeConfettiPieces = (): ConfettiPiece[] =>
  Array.from({ length: 30 }, (_, i) => ({
    left: (i * 37) % 100,                    // spread deterministically across the width
    delay: Math.random() * 1.4,
    duration: 3 + Math.random() * 2,
    size: 5 + Math.random() * 5,
    color: COLORS[i % COLORS.length],
    drift: -50 + Math.random() * 100,
    spin: 360 + Math.random() * 540,
    round: i % 3 === 0,
  }));

export interface PopPiece {
  dx: number;        // px horizontal throw
  lift: number;      // px the fleck rises before gravity wins
  fall: number;      // px it ends below the origin
  size: number;
  color: string;
  spin: number;
  duration: number;
  round: boolean;
}

export const makePopPieces = (): PopPiece[] =>
  Array.from({ length: 18 }, (_, i) => {
    const angle = (i / 18) * Math.PI * 2 + Math.random() * 0.6; // even spread + jitter
    const distance = 60 + Math.random() * 110;
    return {
      dx: Math.cos(angle) * distance,
      lift: 40 + Math.random() * 100,
      // Gentle descent: the flecks drift down like paper, they don't drop like stones.
      fall: 50 + Math.random() * 80,
      size: 5 + Math.random() * 6,
      color: COLORS[i % COLORS.length],
      spin: -540 + Math.random() * 1080,
      // Snappy pop up (~a fifth of the flight), then the same unhurried float down as before.
      duration: 1.4 + Math.random() * 0.75,
      round: i % 3 === 0,
    };
  });
