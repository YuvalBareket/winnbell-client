import { useEffect, useRef, useState, type ReactElement } from 'react';
import { Box, ButtonBase } from '@mui/material';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';
import {
  BG_SUBTLE,
  SHADOW_CARD_DEEP,
  SHADOW_FLOAT,
  ALPHA_WHITE_15,
  ALPHA_WHITE_20,
  ALPHA_WHITE_30,
  ROLE_MANAGER_BG,
} from '../../../shared/colors';
import { SECTOR_CONFIG } from '../../../shared/sectorConfig';

// ─────────────────────────────────────────────────────────────────────────────
// PhoneShowcase - the landing pages' phone mockup running a story loop.
// Generic frame + beat machinery; each landing page supplies its own beats
// (HeroShowcase = consumer story, BusinessHeroShowcase = owner story).
// Beats are JS-driven (not one giant CSS timeline) so each screen re-runs its
// own framer-motion choreography on entry, the step dots are clickable, the
// loop pauses off-screen, and reduced-motion collapses everything to crossfades.
// ─────────────────────────────────────────────────────────────────────────────

export const PHONE_W = 280;
export const PHONE_H = 470;
export const SCREEN_W = PHONE_W - 18;
export const SCREEN_H = PHONE_H - 18;

export interface ScreenProps {
  reduced: boolean;
}

export interface ShowcaseBeat {
  key: string;
  caption: string;
  duration: number;
  Screen: (p: ScreenProps) => ReactElement;
}

/** Sector glyph straight from the shared sector config, so the mockups always match the real map pins. */
export const SectorGlyph = ({ sector, size, color }: { sector: string; size: number; color: string }) => (
  <svg width={size} height={size} viewBox='0 0 24 24' fill={color} aria-hidden>
    <path d={SECTOR_CONFIG[sector].iconPath} />
  </svg>
);

/** Teardrop map pin (matches BusinessMap's pin shape). */
export const MapPin = ({ sector, size, iconSize }: { sector: string; size: number; iconSize?: number }) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: '50% 50% 50% 3px',
      bgcolor: SECTOR_CONFIG[sector].color,
      border: '2px solid white',
      boxShadow: SHADOW_FLOAT,
      transform: 'rotate(-45deg)',
      display: 'grid',
      placeItems: 'center',
    }}
  >
    {iconSize ? (
      <Box sx={{ transform: 'rotate(45deg)', display: 'flex' }}>
        <SectorGlyph sector={sector} size={iconSize} color='white' />
      </Box>
    ) : null}
  </Box>
);

interface PhoneShowcaseProps {
  beats: ShowcaseBeat[];
  /** Static, non-rotating summary of the loop for screen readers. */
  srDescription: string;
}

const PhoneShowcase = ({ beats, srDescription }: PhoneShowcaseProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.25 });
  const reduced = !!useReducedMotion();
  const [beat, setBeat] = useState(0);

  // The loop only runs while on screen. Scrolling back restarts the current beat with a
  // fresh full duration; the dot's progress fill is keyed on inView too, so they stay in sync.
  // Under reduced motion the loop does not auto-advance at all (auto-rotating content is
  // hostile to vestibular users, and it keeps the a11y scanner's captures deterministic);
  // the step dots still switch beats on click, with a plain crossfade.
  useEffect(() => {
    if (!inView || reduced) return;
    const t = window.setTimeout(() => setBeat((b) => (b + 1) % beats.length), beats[beat].duration);
    return () => window.clearTimeout(t);
  }, [beat, inView, reduced, beats]);

  const goTo = (i: number) => {
    if (i !== beat) setBeat(i);
  };

  const { Screen } = beats[beat];

  return (
    <Box
      ref={rootRef}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        // Short desktop viewports (compact laptops): shrink the phone so the caption and
        // step dots below it still fit on screen. The screens are laid out for a fixed
        // 262x452 canvas, so this scales the rendered phone rather than reflowing it.
        '--wb-phone-scale': '1',
        '@media (min-width:900px) and (max-height:940px)': { '--wb-phone-scale': '0.94' },
        '@media (min-width:900px) and (max-height:820px)': { '--wb-phone-scale': '0.88' },
      }}
    >
      <Box sx={{ width: `calc(${PHONE_W}px * var(--wb-phone-scale))`, height: `calc(${PHONE_H}px * var(--wb-phone-scale))` }}>
        <motion.div
          animate={reduced ? undefined : { y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Box
            aria-hidden
            sx={{
              position: 'relative',
              textAlign: 'left',
              width: PHONE_W,
              height: PHONE_H,
              borderRadius: '38px',
              bgcolor: ROLE_MANAGER_BG,
              p: '9px',
              boxShadow: SHADOW_CARD_DEEP,
              flex: 'none',
              transform: 'scale(var(--wb-phone-scale))',
              transformOrigin: 'top center',
              ml: `calc((${PHONE_W}px * var(--wb-phone-scale) - ${PHONE_W}px) / 2)`,
            }}
          >
            <Box sx={{ position: 'relative', width: SCREEN_W, height: SCREEN_H, borderRadius: '30px', overflow: 'hidden', bgcolor: BG_SUBTLE }}>
              <AnimatePresence>
                <motion.div
                  key={beats[beat].key}
                  initial={{ x: reduced ? 0 : 44, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: reduced ? 0 : -44, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                  style={{ position: 'absolute', inset: 0 }}
                >
                  <Screen reduced={reduced} />
                </motion.div>
              </AnimatePresence>
            </Box>
          </Box>
        </motion.div>
      </Box>

      {/* Rotating step caption */}
      <Box aria-hidden sx={{ position: 'relative', mt: 3, height: 30, width: '100%' }}>
        <AnimatePresence>
          <motion.div
            key={beats[beat].key}
            initial={{ opacity: 0, y: reduced ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : -8 }}
            transition={{ duration: 0.35 }}
            style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
          >
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                bgcolor: ALPHA_WHITE_15,
                border: `1px solid ${ALPHA_WHITE_20}`,
                color: 'white',
                fontSize: 12,
                fontWeight: 800,
                display: 'grid',
                placeItems: 'center',
                flex: 'none',
              }}
            >
              {beat + 1}
            </Box>
            <Box component='span' sx={{ fontSize: { xs: 15, md: 16 }, fontWeight: 700, letterSpacing: '-0.015em', color: 'white', whiteSpace: 'nowrap' }}>
              {beats[beat].caption}
            </Box>
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Static description for screen readers; the animated phone and caption are decorative */}
      <Box
        component='p'
        sx={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap', m: 0 }}
      >
        {srDescription}
      </Box>

      {/* Step dots double as the beat timeline: the active pill fills over the beat's duration */}
      <Box sx={{ mt: 1.25, display: 'flex', gap: 0.25 }}>
        {beats.map((b, i) => (
          <ButtonBase
            key={b.key}
            aria-label={`Show step ${i + 1} of ${beats.length}: ${b.caption}`}
            aria-current={i === beat ? 'true' : undefined}
            onClick={() => goTo(i)}
            sx={{ px: 0.5, py: 1.25, borderRadius: 2 }}
          >
            <Box sx={{ position: 'relative', width: 26, height: 5, borderRadius: 3, overflow: 'hidden', bgcolor: ALPHA_WHITE_30 }}>
              {i === beat &&
                (reduced ? (
                  <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'white' }} />
                ) : (
                  <motion.div
                    key={`${beat}-${inView}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: beats[beat].duration / 1000, ease: 'linear' }}
                    style={{ position: 'absolute', inset: 0, background: 'white', transformOrigin: 'left' }}
                  />
                ))}
            </Box>
          </ButtonBase>
        ))}
      </Box>
    </Box>
  );
};

export default PhoneShowcase;
