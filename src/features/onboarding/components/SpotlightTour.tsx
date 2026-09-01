import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Box, Button, Typography, alpha } from '@mui/material';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import ArrowUpwardRounded from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRounded from '@mui/icons-material/ArrowDownwardRounded';
import { PRIMARY_DEEP, PRIMARY_MAIN, GRADIENT_PRIMARY, TEXT_SECONDARY, ALPHA_WHITE_90 } from '../../../shared/colors';
import { SPRING_POP, SPRING_SNAPPY } from '../../../shared/motion';

/** Padding between the target's rect and the cutout edge. */
const CUTOUT_PAD = 8;
const TOOLTIP_WIDTH = 320;
const TOOLTIP_MARGIN = 12;
/** How long to keep polling for a step's target before skipping that step. */
const FIND_TIMEOUT_MS = 4000;
const FIND_INTERVAL_MS = 150;

type Rect = { top: number; left: number; width: number; height: number };

export interface TourStep {
  /** CSS selector for the element to highlight; the first VISIBLE match wins. */
  selector: string;
  title: string;
  body: string;
}

interface SpotlightTourProps {
  active: boolean;
  steps: TourStep[];
  /** completed=false means the user skipped out (Escape / Skip button). */
  onFinish: (completed: boolean) => void;
  /** Fired when a step's target is found and highlighted. */
  onStepShown?: (index: number) => void;
}

const isVisible = (el: Element): el is HTMLElement => {
  if (!(el instanceof HTMLElement)) return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 && el.offsetParent !== null;
};

/**
 * Multi-step spotlight tour over the LIVE screen: dims the page behind a rounded cutout that
 * glides from element to element, with a pulsing halo, a bouncing arrow, and a tooltip card
 * with a step counter. No fake screenshots, no separate pages - it points at the real UI.
 * The cutout tracks its element through scroll and resize (no body scroll lock).
 * Custom-built on framer-motion: the maintained tour libraries either lack React bindings
 * (driver.js) or are broken on React 19 (react-joyride), and this stays on brand motion.
 */
const SpotlightTour = ({ active, steps, onFinish, onStepShown }: SpotlightTourProps) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const targetRef = useRef<HTMLElement | null>(null);
  const ctaRef = useRef<HTMLButtonElement | null>(null);
  const tooltipBoxRef = useRef<HTMLDivElement | null>(null);
  // Measured after render so the placement math never guesses and cuts the card off-screen.
  const [tooltipH, setTooltipH] = useState(190);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const h = tooltipBoxRef.current?.offsetHeight;
    if (h && Math.abs(h - tooltipH) > 2) setTooltipH(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, rect, active]);

  const step = steps[stepIndex] as TourStep | undefined;
  const isLast = stepIndex === steps.length - 1;

  const advance = () => {
    if (isLast) onFinish(true);
    else setStepIndex((i) => i + 1);
  };

  // Whether any step actually rendered: completion analytics must not count a tour
  // whose targets all timed out and was therefore never seen.
  const anyShownRef = useRef(false);

  // Reset to the first step whenever the tour (re)activates.
  useEffect(() => {
    if (active) {
      setStepIndex(0);
      anyShownRef.current = false;
    }
  }, [active]);

  // Per step: find the target (retrying while animations mount it), scroll it into view,
  // then keep the measured rect in sync with scroll/resize until the step changes.
  useEffect(() => {
    if (!active || !step) return;

    let cancelled = false;
    let elapsed = 0;
    let settleTimer: number | undefined;

    const measure = () => {
      const el = targetRef.current;
      if (!el || cancelled) return;
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };

    const onFound = (el: HTMLElement) => {
      targetRef.current = el;
      // Scroll ONLY when the target is not already comfortably on screen: centering an
      // already-visible element makes the page jump right as the tour opens.
      const r = el.getBoundingClientRect();
      const comfortable = r.top >= 76 && r.bottom <= window.innerHeight - 96;
      let settleMs = 50;
      if (!comfortable) {
        el.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
        settleMs = reduceMotion ? 50 : 420;
      }
      // First paint after the scroll settles; scroll/resize listeners keep it honest after.
      // onStepShown waits for the same settle so analytics never count an off-screen step.
      settleTimer = window.setTimeout(() => {
        measure();
        if (cancelled) return;
        anyShownRef.current = true;
        onStepShown?.(stepIndex);
      }, settleMs);
      window.addEventListener('scroll', measure, { passive: true, capture: true });
      window.addEventListener('resize', measure, { passive: true });
    };

    const finder = window.setInterval(() => {
      elapsed += FIND_INTERVAL_MS;
      const el = Array.from(document.querySelectorAll(step.selector)).find(isVisible);
      if (el) {
        window.clearInterval(finder);
        onFound(el);
      } else if (elapsed >= FIND_TIMEOUT_MS) {
        // This step's target never appeared (risk-gated away, layout changed): skip it
        // rather than stalling the whole tour. Ending on a timeout only counts as
        // "completed" if the user actually saw at least one step.
        window.clearInterval(finder);
        if (stepIndex === steps.length - 1) onFinish(anyShownRef.current);
        else setStepIndex((i) => i + 1);
      }
    }, FIND_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(settleTimer);
      window.clearInterval(finder);
      window.removeEventListener('scroll', measure, { capture: true });
      window.removeEventListener('resize', measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, stepIndex]);

  // Escape always skips out - live from the moment the tour activates, even while the
  // first target is still being located.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onFinish(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Focus lands on the primary CTA when a step renders.
  useEffect(() => {
    if (!active || !rect) return;
    // preventScroll: focusing the CTA must not scroll the page under the spotlight.
    ctaRef.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, rect === null, stepIndex]);

  if (typeof document === 'undefined') return null;

  // Tooltip on whichever side of the target has more room, clamped fully inside the viewport.
  const vw = typeof window !== 'undefined' ? window.innerWidth : 0;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 0;

  // Cap the cutout to half the viewport: a tall target (e.g. the business list) must not
  // swallow the screen and leave the tooltip nowhere to go - highlight its top instead.
  const cutout = rect
    ? {
        top: rect.top - CUTOUT_PAD,
        left: rect.left - CUTOUT_PAD,
        width: rect.width + CUTOUT_PAD * 2,
        height: Math.min(rect.height + CUTOUT_PAD * 2, vh * 0.5),
      }
    : null;
  const arrowGap = 46;
  const spaceBelow = cutout ? vh - (cutout.top + cutout.height) : 0;
  const spaceAbove = cutout ? cutout.top : 0;
  const placeBelow = cutout ? spaceBelow >= tooltipH + arrowGap + TOOLTIP_MARGIN || spaceBelow >= spaceAbove : true;
  // top-positioned on BOTH sides, clamped, so the card can never render past a viewport edge.
  const tooltipTop = cutout
    ? Math.min(
        Math.max(placeBelow ? cutout.top + cutout.height + arrowGap : cutout.top - arrowGap - tooltipH, TOOLTIP_MARGIN),
        vh - tooltipH - TOOLTIP_MARGIN,
      )
    : TOOLTIP_MARGIN;
  const tooltipWidth = Math.min(TOOLTIP_WIDTH, vw - TOOLTIP_MARGIN * 2);
  const tooltipLeft = cutout
    ? Math.min(Math.max(cutout.left + cutout.width / 2 - tooltipWidth / 2, TOOLTIP_MARGIN), vw - tooltipWidth - TOOLTIP_MARGIN)
    : TOOLTIP_MARGIN;

  return createPortal(
    <AnimatePresence>
      {active && step && cutout && (
        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.18 } }}
          sx={{ position: 'fixed', inset: 0, zIndex: 1400 }}
          role='dialog'
          aria-modal='true'
          aria-label={step.title}
          aria-describedby='wb-tour-step-body'
        >
          {/* Click-catcher behind the cutout: swallows every tap on the dim so the page
              underneath stays untouchable. Only Next/Skip drive the tour. */}
          <Box sx={{ position: 'fixed', inset: 0 }} />

          {/* The cutout paints the dim via its giant box-shadow and GLIDES between targets.
              It also SHIELDS the highlighted element: nothing on the page is clickable until
              the tour ends (scrolling stays free). Taps land nowhere; only Next/Skip drive it. */}
          <Box
            component={motion.div}
            animate={{ top: cutout.top, left: cutout.left, width: cutout.width, height: cutout.height }}
            transition={SPRING_POP}
            sx={{
              position: 'fixed',
              top: cutout.top, left: cutout.left, width: cutout.width, height: cutout.height,
              borderRadius: '16px',
              boxShadow: `0 0 0 200vmax ${alpha(PRIMARY_DEEP, 0.72)}`,
            }}
          />

          {/* Pulsing halo hugging the cutout. */}
          <Box
            component={motion.div}
            animate={
              reduceMotion
                ? { top: cutout.top, left: cutout.left, width: cutout.width, height: cutout.height }
                : {
                    top: cutout.top, left: cutout.left, width: cutout.width, height: cutout.height,
                    scale: [1, 1.04, 1], opacity: [0.95, 0.55, 0.95],
                  }
            }
            transition={reduceMotion ? SPRING_POP : { scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' }, top: SPRING_POP, left: SPRING_POP, width: SPRING_POP, height: SPRING_POP }}
            sx={{
              position: 'fixed',
              top: cutout.top, left: cutout.left, width: cutout.width, height: cutout.height,
              borderRadius: '16px',
              border: `2.5px solid ${ALPHA_WHITE_90}`,
              pointerEvents: 'none',
            }}
          />

          {/* Bouncing arrow pointing at the target from the tooltip side. */}
          <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: placeBelow ? [0, -7, 0] : [0, 7, 0] }}
            transition={reduceMotion ? { duration: 0.2 } : { y: { duration: 1.1, repeat: Infinity, ease: 'easeInOut' }, opacity: { delay: 0.25 } }}
            sx={{
              position: 'fixed',
              left: cutout.left + cutout.width / 2 - 16,
              top: placeBelow ? cutout.top + cutout.height + 10 : cutout.top - arrowGap + 4,
              color: 'common.white',
              pointerEvents: 'none',
              display: 'flex',
            }}
          >
            {placeBelow ? <ArrowUpwardRounded sx={{ fontSize: 32 }} /> : <ArrowDownwardRounded sx={{ fontSize: 32 }} />}
          </Box>

          {/* Tooltip card - keyed by step so each one pops fresh while the cutout glides. */}
          <Box
            component={motion.div}
            ref={tooltipBoxRef}
            key={stepIndex}
            initial={{ opacity: 0, y: placeBelow ? 16 : -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...SPRING_POP, delay: 0.15 }}
            sx={{
              position: 'fixed',
              left: tooltipLeft,
              top: tooltipTop,
              width: tooltipWidth,
              bgcolor: 'background.paper',
              borderRadius: 3,
              p: 2.5,
              boxShadow: `0 12px 40px ${alpha(PRIMARY_DEEP, 0.45)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1, mb: 0.75 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: 'text.primary' }}>
                {step.title}
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: TEXT_SECONDARY, flexShrink: 0 }}>
                {stepIndex + 1} of {steps.length}
              </Typography>
            </Box>
            <Typography id='wb-tour-step-body' sx={{ fontSize: '0.875rem', lineHeight: 1.6, color: TEXT_SECONDARY, mb: 2 }}>
              {step.body}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center' }}>
              <motion.div whileTap={{ scale: 0.96, transition: SPRING_SNAPPY }} style={{ flex: 1 }}>
                <Button
                  ref={ctaRef}
                  fullWidth
                  onClick={advance}
                  sx={{
                    height: 44, borderRadius: 2, fontWeight: 800, textTransform: 'none', color: 'common.white',
                    background: GRADIENT_PRIMARY,
                    '&:hover': { background: GRADIENT_PRIMARY, filter: 'brightness(0.96)' },
                  }}
                >
                  {isLast ? 'Done' : 'Next'}
                </Button>
              </motion.div>
              {!isLast && (
                <Button
                  onClick={() => onFinish(false)}
                  sx={{ height: 44, borderRadius: 2, fontWeight: 700, textTransform: 'none', color: PRIMARY_MAIN, px: 1.5, flexShrink: 0 }}
                >
                  Skip
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default SpotlightTour;
