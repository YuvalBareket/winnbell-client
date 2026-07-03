// Winnbell motion language - shared framer-motion presets for the whole app.
//
// Grounded in micro-interaction research (2025 best practices):
//  - Tap feedback must land within ~100ms: springs with high stiffness, no delays.
//  - Meaningful motion lives in the 200-500ms band; longer reads as sluggish.
//  - Peripheral vision is drawn to motion: at most ONE looping "attractor" per page,
//    reserved for the page's single most important action. Everything else is
//    reactive (responds to the user) so the page never feels noisy.
//  - Celebration moments (success, rewards) may overshoot playfully; navigation and
//    layout motion should settle quickly with minimal bounce.
//
// Usage: spread the preset objects onto motion.* elements, or use the variants with
// a parent stagger container. Keep page-specific tweaks in the page, not here.

import type { Transition, Variants } from 'framer-motion';

// ── Springs ────────────────────────────────────────────────────────────────────

/** Fast, confident spring for taps and small state changes (settles < 300ms). */
export const SPRING_SNAPPY: Transition = { type: 'spring', stiffness: 500, damping: 30, mass: 0.8 };

/** Standard spring for entrances - a touch of overshoot so items "pop" into place. */
export const SPRING_POP: Transition = { type: 'spring', stiffness: 260, damping: 20, mass: 0.9 };

/** Playful spring for celebration moments - visible bounce, still settles quickly. */
export const SPRING_BOUNCY: Transition = { type: 'spring', stiffness: 300, damping: 14, mass: 1 };

/**
 * The signature "jump": strongly underdamped, so the value overshoots its target by
 * ~15-20%, swings back under, and settles. Used for hero numbers and progress fills
 * (user-approved feel on the My Entries counter). Slower than SPRING_BOUNCY - the
 * whole landing takes ~1.5s, which is the point: you watch it happen.
 */
export const SPRING_JUMP: Transition = { type: 'spring', stiffness: 55, damping: 7, mass: 1 };

// ── Entrance variants (use with a stagger container) ──────────────────────────

/** Parent container: staggers children 70ms apart. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

/** Child: pops up and into place with a spring overshoot. The workhorse entrance. */
export const popIn: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.92 },
  visible: { opacity: 1, y: 0, scale: 1, transition: SPRING_POP },
};

/**
 * Child: springs up WITHOUT scale - REQUIRED for full-width page sections.
 * Scale variants (popIn/dropIn/heroPop) momentarily overshoot above 1, which makes a
 * full-width section wider than the viewport; the mobile browser then rescales the whole
 * page (a visible zoom-in/out flash). Use riseIn for anything that spans the page width,
 * and keep the scale variants for small elements (cards, icons, buttons).
 */
export const riseIn: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: SPRING_POP },
};

/** Child: drops in from above - good for heroes and headers. */
export const dropIn: Variants = {
  hidden: { opacity: 0, y: -28, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: SPRING_POP },
};

/** Child: slides in from the side - good for horizontally arranged rows. */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: SPRING_POP },
};
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: SPRING_POP },
};

/** Hero number / prize amount: scales up from small with a celebratory bounce. */
export const heroPop: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1, transition: SPRING_BOUNCY },
};

// ── Interactive (gesture) props ────────────────────────────────────────────────
// Spread these onto motion elements: <motion.div {...pressable}>

// Gesture transitions are INLINE (inside whileHover/whileTap) rather than a top-level
// `transition` prop, so spreading a pressable together with a looping attractor
// ({...breathe} {...pressable}) can never overwrite the attractor's repeating transition.

/** Primary buttons and big CTAs: grow slightly on hover, squash on press. */
export const pressable = {
  whileHover: { scale: 1.04, transition: SPRING_SNAPPY },
  whileTap: { scale: 0.94, transition: SPRING_SNAPPY },
} as const;

/** Cards and list rows: subtler press so lists feel solid, not springy-toy. */
export const pressableCard = {
  whileTap: { scale: 0.97, transition: SPRING_SNAPPY },
} as const;

/** Icon buttons: squash harder + tiny tilt for a tactile, playful feel. */
export const pressableIcon = {
  whileTap: { scale: 0.85, rotate: -6, transition: SPRING_SNAPPY },
} as const;

// ── Looping attractors (max ONE per page) ─────────────────────────────────────

/**
 * Soft breathing pulse for the page's single most important action.
 * Subtle scale so it catches peripheral vision without being annoying.
 */
export const breathe = {
  animate: { scale: [1, 1.045, 1] },
  transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' as const },
};

/** Attention wiggle - short rotation shake, for badges or "new" indicators. */
export const wiggle = {
  animate: { rotate: [0, -8, 8, -5, 5, 0] },
  transition: { duration: 0.6, repeat: Infinity, repeatDelay: 3.5, ease: 'easeInOut' as const },
};
