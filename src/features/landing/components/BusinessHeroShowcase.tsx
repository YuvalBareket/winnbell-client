import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { motion, animate } from 'framer-motion';
import {
  Search,
  LocationOn,
  Receipt,
  CheckCircleOutline,
  TrendingUp,
  PeopleAlt,
  ConfirmationNumber,
  Download,
  QrCode2,
  CheckCircle,
  EmojiEvents,
} from '@mui/icons-material';
import {
  PRIMARY_MAIN,
  PRIMARY_TINT,
  PRIMARY_DEEP,
  PRIMARY_DARKER,
  BG_SUBTLE,
  BG_SURFACE,
  TEXT_PRIMARY,
  TEXT_HEADING,
  TEXT_TERTIARY,
  BORDER_LIGHT,
  BORDER_SUBTLE,
  BORDER_RECEIPT,
  AVATAR_BLUE_BG,
  STATUS_ACTIVATED_BG,
  STATUS_ACTIVATED_TEXT,
  STATUS_PENDING_TEXT,
  METRIC_GOOD,
  ACCENT_GOLD,
  ACCENT_GOLD_LIGHT,
  ACCENT_GOLD_CREAM,
  GOLD_TROPHY,
  GRADIENT_HERO,
  GRADIENT_POST_NAVY,
  GRADIENT_POST_LIGHT,
  SHADOW_CARD,
  SHADOW_CARD_DEEP,
  SHADOW_FLOAT,
  SHADOW_PRIMARY_MEDIUM,
  SHADOW_PRIMARY_SOFT,
  ALPHA_PRIMARY_10,
  ALPHA_GREEN_10,
  ALPHA_ORANGE_12,
  ALPHA_WHITE_15,
  ALPHA_WHITE_20,
  ALPHA_WHITE_30,
  ALPHA_WHITE_80,
  ALPHA_BLACK_06,
} from '../../../shared/colors';
import { SECTOR_CONFIG } from '../../../shared/sectorConfig';
import { SPRING_POP, SPRING_BOUNCY } from '../../../shared/motion';
import PhoneShowcase, {
  type ScreenProps,
  type ShowcaseBeat,
  SectorGlyph,
  MapPin,
} from './PhoneShowcase';
import { LAST_6_MONTHS } from './showcaseDates';
import { PosterBlueCanvas } from '../../marketing/components/PosterTemplates';
import { DESIGN_W, DESIGN_H } from '../../marketing/components/posterConstants';

// ─────────────────────────────────────────────────────────────────────────────
// BusinessHeroShowcase - the business landing's five-beat story loop, ordered
// as the owner's questions arrive: what is this (a purchase becomes a cash-draw
// entry that could win a big prize, at no cost or effort to you), who runs it
// (Winnbell, item by ticking item), then what it gets you (found on the map,
// sales climbing) and how you launch (ready-made marketing materials).
// Beats 3-5 are miniatures of the REAL owner pages; beats 1-2 are explainers.
// Frame/loop machinery lives in PhoneShowcase; this file is just the screens.
// ─────────────────────────────────────────────────────────────────────────────

// Shared story numbers, kept consistent across beats (MTD view):
// 342 entries from 127 customers, 342/1000 of the entry capacity used.

/** The campaign card's shimmering gold prize figure. */
const GOLD_SHIMMER_SX = {
  fontWeight: 900,
  lineHeight: 1,
  letterSpacing: '-0.02em',
  background: `linear-gradient(90deg, ${ACCENT_GOLD} 0%, ${GOLD_TROPHY} 25%, ${ACCENT_GOLD_LIGHT} 50%, ${GOLD_TROPHY} 75%, ${ACCENT_GOLD} 100%)`,
  backgroundSize: '200% auto',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  animation: 'wbGoldShimmer 3s linear infinite',
  '@keyframes wbGoldShimmer': {
    '0%': { backgroundPosition: '0% center' },
    '100%': { backgroundPosition: '200% center' },
  },
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
} as const;

/** Number that counts up to its value once the beat starts; sits at the value under reduced motion. */
function CountUp({ to, delay, reduced, render }: { to: number; delay: number; reduced: boolean; render: (v: number) => string }) {
  const [value, setValue] = useState(reduced ? to : 0);
  useEffect(() => {
    if (reduced) return;
    const controls = animate(0, to, { delay, duration: 1.1, ease: [0.16, 1, 0.3, 1], onUpdate: setValue });
    return () => controls.stop();
  }, [to, delay, reduced]);
  return <>{render(value)}</>;
}

/** Small in-app page header used by the dashboard-style screens. */
const ScreenHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <Box sx={{ position: 'relative', overflow: 'hidden', background: GRADIENT_HERO, borderRadius: '0 0 20px 20px', p: '12px 14px 14px' }}>
    <Box sx={{ position: 'absolute', top: -60, right: -40, width: 150, height: 150, borderRadius: '50%', background: `radial-gradient(circle, ${ALPHA_WHITE_15} 0%, transparent 68%)` }} />
    <Box sx={{ position: 'relative', fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em', color: 'white' }}>{title}</Box>
    <Box sx={{ position: 'relative', mt: 0.3, fontSize: 9.5, fontWeight: 500, color: ALPHA_WHITE_80 }}>{subtitle}</Box>
  </Box>
);

/** Tab pill row, like the app's scrollable category tabs (first tab active). */
const TabPills = ({ tabs }: { tabs: string[] }) => (
  <Box sx={{ display: 'flex', gap: 0.75, overflow: 'hidden' }}>
    {tabs.map((tab, i) => (
      <Box
        key={tab}
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: 26,
          px: 1.4,
          borderRadius: 999,
          flex: 'none',
          bgcolor: i === 0 ? TEXT_HEADING : BG_SURFACE,
          border: i === 0 ? 'none' : `1px solid ${BORDER_SUBTLE}`,
        }}
      >
        <Box component='span' sx={{ fontSize: 10, fontWeight: 700, color: i === 0 ? 'white' : TEXT_PRIMARY, whiteSpace: 'nowrap' }}>
          {tab}
        </Box>
      </Box>
    ))}
  </Box>
);

// ── Beat 1 · The concept: a purchase at your shop becomes a cash-draw entry ───

// Gold flecks raining once the draw card lands (positions spread over the 262px screen).
const CONCEPT_FLECKS = [
  { left: 18, dx: -14, spin: 380, w: 5, h: 5, color: GOLD_TROPHY, delay: 0 },
  { left: 64, dx: 8, spin: 520, w: 7, h: 12, color: ACCENT_GOLD, delay: 0.3 },
  { left: 116, dx: -6, spin: 640, w: 5.5, h: 9, color: ACCENT_GOLD_LIGHT, delay: 0.55 },
  { left: 158, dx: 12, spin: 450, w: 8, h: 8, color: 'white', delay: 0.15 },
  { left: 206, dx: -10, spin: 700, w: 6, h: 10, color: GOLD_TROPHY, delay: 0.45 },
  { left: 242, dx: -4, spin: 560, w: 7, h: 12, color: ACCENT_GOLD, delay: 0.7 },
];

// The flip happens at FLIP seconds: the receipt has left the stage by then and
// the golden ticket takes its place, so only one object ever holds the screen.
// Paced for a first-time viewer who has never heard of Winnbell: the three-line
// headline and the receipt hold for ~4.5s of reading time before anything
// transforms.
const FLIP = 4.5;

function ConceptScreen({ reduced }: ScreenProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: GRADIENT_HERO,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: '0 20px',
        textAlign: 'center',
      }}
    >
      {!reduced &&
        CONCEPT_FLECKS.map((f, i) => (
          <motion.div
            key={i}
            initial={{ y: -18, x: 0, rotate: 0, opacity: 0 }}
            animate={{ y: 480, x: f.dx, rotate: f.spin, opacity: [0, 1, 1, 0.9] }}
            transition={{ delay: FLIP + 0.5 + f.delay, duration: 2.2, ease: 'easeIn' }}
            style={{ position: 'absolute', top: 0, left: f.left, width: f.w, height: f.h, borderRadius: f.w === f.h ? '50%' : 1.5, background: f.color }}
          />
        ))}

      {/* Soft radial glows, like the app's hero bands */}
      <Box sx={{ position: 'absolute', top: -70, right: -50, width: 210, height: 210, borderRadius: '50%', background: `radial-gradient(circle, ${ALPHA_WHITE_15} 0%, transparent 66%)` }} />
      <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 190, height: 190, borderRadius: '50%', background: `radial-gradient(circle, ${ALPHA_WHITE_15} 0%, transparent 66%)` }} />

      {/* The story headline holds the whole beat; the last line lands with the ticket flip */}
      <Box sx={{ position: 'relative', width: '100%', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.4 }}>
          <Box sx={{ fontSize: 13, fontWeight: 800, letterSpacing: '-0.015em', lineHeight: 1.45, color: 'white' }}>
            What if your customers' entries
            <br />
            could win them a <Box component='span' sx={{ color: ACCENT_GOLD_LIGHT }}>big cash prize</Box>
          </Box>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: FLIP + 0.15, duration: 0.45 }}>
          <Box sx={{ mt: 0.4, fontSize: 11.5, fontWeight: 700, letterSpacing: '-0.01em', color: ALPHA_WHITE_80 }}>
            Without you having to fund or operate it
          </Box>
        </motion.div>
      </Box>

      {/* The stage: receipt flips into the draw entry card */}
      <Box sx={{ position: 'relative', mt: 2, width: 200, height: 200, zIndex: 1 }} style={{ perspective: 900 }}>
        {/* Gold halo warming up behind the entry card */}
        {!reduced && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: FLIP + 0.1, duration: 0.9 }}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 250,
              height: 250,
              margin: '-125px 0 0 -125px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${GOLD_TROPHY}40 0%, transparent 62%)`,
            }}
          />
        )}

        {/* Paper receipt from your shop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={
            reduced
              ? { opacity: [0, 1, 1, 0] }
              : { opacity: [0, 1, 1, 0], y: [26, 0, 0, 0], scale: [0.92, 1, 1, 1], rotateY: [0, 0, 0, 90] }
          }
          transition={{ delay: 0.35, duration: FLIP - 0.35 + 0.2, times: [0, 0.16, 0.86, 1], ease: 'easeInOut' }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <Box sx={{ mx: 'auto', width: 172 }}>
            <Box sx={{ borderRadius: '14px 14px 0 0', bgcolor: BG_SURFACE, boxShadow: SHADOW_FLOAT, p: '13px 15px 11px', textAlign: 'left' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.9, mb: 1.3 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: '10px', bgcolor: SECTOR_CONFIG.Coffee.bgColor, display: 'grid', placeItems: 'center', flex: 'none' }}>
                  <SectorGlyph sector='Coffee' size={16} color={SECTOR_CONFIG.Coffee.color} />
                </Box>
                <Box>
                  <Box sx={{ fontSize: 11.5, fontWeight: 800, lineHeight: 1.2, color: TEXT_PRIMARY }}>Bella's Coffee</Box>
                  <Box sx={{ fontSize: 8.5, fontWeight: 600, color: TEXT_TERTIARY }}>120 Main St · 9:41 AM</Box>
                </Box>
              </Box>
              {(
                [
                  { w: 62, p: 20 },
                  { w: 44, p: 16 },
                  { w: 52, p: 18 },
                ] as const
              ).map((row, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.9 }}>
                  <Box sx={{ height: 6, width: `${row.w}%`, borderRadius: 3, bgcolor: ALPHA_BLACK_06 }} />
                  <Box sx={{ height: 6, width: row.p, borderRadius: 3, bgcolor: ALPHA_BLACK_06 }} />
                </Box>
              ))}
              <Box sx={{ my: 1.1, borderTop: `2px dashed ${ALPHA_BLACK_06}` }} />
              <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <Box component='span' sx={{ fontSize: 10, fontWeight: 700, color: TEXT_TERTIARY }}>Total</Box>
                <Box component='span' sx={{ fontSize: 15, fontWeight: 900, color: TEXT_HEADING }}>$30.00</Box>
              </Box>
            </Box>
            {/* Torn receipt edge */}
            <Box
              sx={{
                height: 7,
                backgroundImage: `linear-gradient(135deg, ${BG_SURFACE} 50%, transparent 50%), linear-gradient(225deg, ${BG_SURFACE} 50%, transparent 50%)`,
                backgroundSize: '11px 7px',
                backgroundRepeat: 'repeat-x',
              }}
            />
          </Box>
        </motion.div>

        {/* The draw entry card it turns into - the app's own campaign card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={reduced ? { opacity: 1 } : { opacity: [0, 1], rotateY: [-90, 0], scale: [0.96, 1] }}
          transition={{ delay: FLIP + 0.05, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}
        >
          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              mx: 'auto',
              width: 200,
              borderRadius: '18px',
              p: '14px 15px 13px',
              background: GRADIENT_HERO,
              border: `1px solid ${ALPHA_WHITE_20}`,
              boxShadow: SHADOW_CARD_DEEP,
              textAlign: 'left',
            }}
          >
            <ConfirmationNumber sx={{ position: 'absolute', right: 6, bottom: 4, fontSize: 56, color: 'white', opacity: 0.14, transform: 'rotate(12deg)' }} />
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Box sx={{ fontSize: 8.5, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', whiteSpace: 'nowrap', color: ALPHA_WHITE_80 }}>Cash Prize Draw</Box>
                <Box sx={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 0.6, px: 1, py: 0.35, borderRadius: 50, bgcolor: ALPHA_WHITE_15, border: `1px solid ${ALPHA_WHITE_20}` }}>
                  <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: GOLD_TROPHY }} />
                  <Box component='span' sx={{ fontSize: 7.5, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: ACCENT_GOLD_LIGHT }}>Live now</Box>
                </Box>
              </Box>
              <Box sx={{ ...GOLD_SHIMMER_SX, mt: 0.5, fontSize: 40 }}>$$$</Box>
              <Box sx={{ my: 1.2, borderTop: `2px dashed ${ALPHA_WHITE_30}` }} />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box component='span' sx={{ fontSize: 8.5, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: ALPHA_WHITE_80 }}>Entry</Box>
                <Box component='span' sx={{ fontFamily: 'monospace', fontSize: 12.5, fontWeight: 900, letterSpacing: '0.2em', color: ACCENT_GOLD_LIGHT }}>8KD2QP</Box>
              </Box>
            </Box>
          </Box>
        </motion.div>
      </Box>

      {/* The customer's payoff moment, straight out of the entry success screen */}
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...SPRING_BOUNCY, delay: FLIP + 0.7 }}
        style={{ marginTop: 18 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.9, px: 2, py: 1, borderRadius: 999, bgcolor: 'white', boxShadow: SHADOW_FLOAT }}>
          <EmojiEvents sx={{ fontSize: 17, color: GOLD_TROPHY }} />
          <Box component='span' sx={{ fontSize: 12, fontWeight: 800, color: TEXT_HEADING }}>You're in! Good luck</Box>
        </Box>
      </motion.div>
    </Box>
  );
}

// ── Beat 3 · Customers find you on the Nearby map ─────────────────────────────

function PresenceScreen({ reduced }: ScreenProps) {
  return (
    <Box sx={{ position: 'absolute', inset: 0, bgcolor: BG_SUBTLE, overflow: 'hidden' }}>
      {/* Stylized street grid */}
      <Box sx={{ position: 'absolute', top: 115, left: -30, width: 340, height: 16, bgcolor: BG_SURFACE, transform: 'rotate(-6deg)' }} />
      <Box sx={{ position: 'absolute', top: 240, left: -40, width: 360, height: 13, bgcolor: BG_SURFACE, transform: 'rotate(4deg)' }} />
      <Box sx={{ position: 'absolute', top: -20, left: 70, width: 14, height: 400, bgcolor: BG_SURFACE, transform: 'rotate(7deg)' }} />
      <Box sx={{ position: 'absolute', top: -20, left: 192, width: 11, height: 400, bgcolor: BG_SURFACE, transform: 'rotate(-5deg)' }} />
      <Box sx={{ position: 'absolute', top: 145, left: 128, width: 78, height: 60, borderRadius: '11px', bgcolor: STATUS_ACTIVATED_BG }} />
      <Box sx={{ position: 'absolute', top: 92, left: 22, width: 62, height: 48, borderRadius: '11px', bgcolor: PRIMARY_TINT }} />

      {/* Neighbors stay small; your pin is the star */}
      {(
        [
          { sector: 'Grocery', top: 96, left: 40 },
          { sector: 'Bakery', top: 196, left: 200 },
        ] as const
      ).map((pin, i) => (
        <motion.div
          key={pin.sector}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.6 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...SPRING_POP, delay: 0.45 + i * 0.15 }}
          style={{ position: 'absolute', top: pin.top, left: pin.left }}
        >
          <MapPin sector={pin.sector} size={24} />
        </motion.div>
      ))}

      <Box sx={{ position: 'absolute', top: 138, left: 104 }}>
        {!reduced && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ scale: [0.55, 1.9], opacity: [0.5, 0] }}
            transition={{ duration: 1.8, delay: 1.3, repeat: Infinity, repeatDelay: 0.5, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 100,
              height: 100,
              margin: '-50px 0 0 -50px',
              borderRadius: '50%',
              background: `${SECTOR_CONFIG.Coffee.color}66`,
            }}
          />
        )}
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: -24, scale: 0.7 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...SPRING_BOUNCY, delay: 0.8 }}
        >
          <MapPin sector='Coffee' size={46} iconSize={22} />
        </motion.div>
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...SPRING_POP, delay: 1.15 }}
          style={{
            position: 'absolute',
            left: '50%',
            top: -40,
            transform: 'translateX(-50%)',
            padding: '6px 11px',
            borderRadius: 10,
            background: TEXT_HEADING,
            boxShadow: SHADOW_FLOAT,
            whiteSpace: 'nowrap',
          }}
        >
          <Box component='span' sx={{ fontSize: 11, fontWeight: 800, color: 'white' }}>
            That's you
          </Box>
        </motion.div>
      </Box>

      {/* Search bar, exactly as shoppers see it */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.35 }}
        style={{ position: 'absolute', top: 12, left: 10, right: 10 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: 40, px: 1.5, borderRadius: '14px', bgcolor: BG_SURFACE, boxShadow: SHADOW_CARD }}>
          <Search sx={{ fontSize: 16, color: TEXT_TERTIARY }} />
          <Box sx={{ flex: 1, fontSize: 11.5, fontWeight: 500, color: TEXT_TERTIARY }}>Search partners near you</Box>
          <LocationOn sx={{ fontSize: 16, color: PRIMARY_MAIN }} />
        </Box>
      </motion.div>

      {/* Bottom sheet with your listing highlighted, like the real Nearby list */}
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 70 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_POP, delay: 0.6 }}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          background: BG_SURFACE,
          borderRadius: '20px 20px 0 0',
          boxShadow: SHADOW_FLOAT,
          padding: '8px 12px 12px',
        }}
      >
        <Box sx={{ width: 34, height: 4, borderRadius: 2, bgcolor: BORDER_LIGHT, mx: 'auto', mb: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 0.9 }}>
          <Box component='span' sx={{ fontSize: 13, fontWeight: 800, letterSpacing: '-0.02em', color: TEXT_HEADING }}>14 partners nearby</Box>
          <Box component='span' sx={{ fontSize: 10, fontWeight: 700, color: TEXT_TERTIARY }}>Closest first</Box>
        </Box>
        <motion.div
          initial={{ borderColor: BORDER_SUBTLE }}
          animate={{ borderColor: PRIMARY_MAIN }}
          transition={{ delay: 1.7, duration: 0.35 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            padding: '9px 10px',
            borderRadius: 16,
            background: BG_SURFACE,
            border: '1.5px solid',
            boxShadow: SHADOW_PRIMARY_SOFT,
          }}
        >
          <Box sx={{ width: 36, height: 36, borderRadius: '12px', bgcolor: SECTOR_CONFIG.Coffee.bgColor, display: 'grid', placeItems: 'center', flex: 'none' }}>
            <SectorGlyph sector='Coffee' size={19} color={SECTOR_CONFIG.Coffee.color} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ fontSize: 11.5, fontWeight: 800, color: TEXT_PRIMARY }}>Bella's Coffee</Box>
            <Box sx={{ mt: 0.4, display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 0.7, py: 0.2, borderRadius: '6px', bgcolor: SECTOR_CONFIG.Coffee.bgColor }}>
                <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: SECTOR_CONFIG.Coffee.color }} />
                <Box component='span' sx={{ fontSize: 8.5, fontWeight: 800, color: TEXT_HEADING }}>Coffee</Box>
              </Box>
              <Box component='span' sx={{ px: 0.7, py: 0.2, borderRadius: '6px', bgcolor: PRIMARY_TINT, fontSize: 8.5, fontWeight: 800, color: PRIMARY_MAIN }}>0.2 mi</Box>
            </Box>
          </Box>
        </motion.div>
      </motion.div>
    </Box>
  );
}

// ── Beat 4 · Growth: dashboard KPIs counting up, live feed, rising sales ──────

const FEED_ROWS = [
  { title: 'RCP-48213', when: '2m ago', amount: '$45.00' },
  { title: 'RCP-48166', when: '1h ago', amount: '$32.50' },
];

// Month-over-month growth story for the "Draw Sales Over Time" chart.
const BARS = [18, 24, 31, 39, 47, 56];

function GrowthScreen({ reduced }: ScreenProps) {
  return (
    <Box sx={{ position: 'absolute', inset: 0, bgcolor: BG_SUBTLE, overflow: 'hidden' }}>
      <ScreenHeader title='Campaign Dashboard' subtitle='Monitor your active campaign and entries' />

      <Box sx={{ p: '8px 12px 0' }}>
        {/* KPI cards: Entries / Revenue / Custmrs, like the real dashboard, counting up */}
        <Box sx={{ display: 'flex', gap: 0.8 }}>
          {(
            [
              { Icon: CheckCircleOutline, label: 'Entries', to: 342, render: (v: number) => `${Math.round(v)}`, bg: ALPHA_PRIMARY_10, fg: PRIMARY_MAIN },
              { Icon: TrendingUp, label: 'Revenue', to: 4.2, render: (v: number) => `$${v.toFixed(1)}k`, bg: ALPHA_GREEN_10, fg: STATUS_ACTIVATED_TEXT },
              { Icon: PeopleAlt, label: 'Custmrs', to: 127, render: (v: number) => `${Math.round(v)}`, bg: ALPHA_ORANGE_12, fg: STATUS_PENDING_TEXT },
            ] as const
          ).map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING_POP, delay: 0.35 + i * 0.12 }}
              style={{ flex: 1, padding: '9px 8px', borderRadius: 14, background: BG_SURFACE, border: `1px solid ${BORDER_SUBTLE}`, boxShadow: SHADOW_CARD }}
            >
              <Box sx={{ width: 24, height: 24, borderRadius: '8px', bgcolor: kpi.bg, display: 'grid', placeItems: 'center', mb: 0.6 }}>
                <kpi.Icon sx={{ fontSize: 14, color: kpi.fg }} />
              </Box>
              <Box sx={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: TEXT_TERTIARY }}>{kpi.label}</Box>
              <Box sx={{ mt: 0.2, fontSize: 16, fontWeight: 900, lineHeight: 1.1, color: TEXT_HEADING }}>
                <CountUp to={kpi.to} delay={0.5 + i * 0.12} reduced={reduced} render={kpi.render} />
              </Box>
            </motion.div>
          ))}
        </Box>

        {/* Recent entries feed, arriving live */}
        <Box sx={{ mt: 1.2, mb: 0.7, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box component='span' sx={{ fontSize: 11.5, fontWeight: 800, color: TEXT_HEADING }}>Recent entries</Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <motion.div
              animate={reduced ? undefined : { opacity: [1, 0.35, 1], scale: [1, 0.75, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: 6, height: 6, borderRadius: '50%', background: METRIC_GOOD }}
            />
            <Box component='span' sx={{ fontSize: 9, fontWeight: 700, color: TEXT_TERTIARY }}>Live</Box>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
          {FEED_ROWS.map((row, i) => (
            <motion.div
              key={row.title}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: -14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ ...SPRING_POP, delay: 1.05 + i * 0.4 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: '8px 11px',
                borderRadius: 16,
                background: BG_SURFACE,
                border: `1px solid ${BORDER_SUBTLE}`,
                boxShadow: SHADOW_CARD,
              }}
            >
              <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: AVATAR_BLUE_BG, display: 'grid', placeItems: 'center', flex: 'none' }}>
                <Receipt sx={{ fontSize: 14, color: PRIMARY_MAIN }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box component='span' sx={{ fontSize: 10.5, fontWeight: 800, color: TEXT_PRIMARY, whiteSpace: 'nowrap' }}>{row.title}</Box>
                <Box sx={{ mt: 0.1, fontSize: 8.5, fontWeight: 500, color: TEXT_TERTIARY }}>{row.when}</Box>
              </Box>
              <Box component='span' sx={{ fontSize: 10.5, fontWeight: 800, color: TEXT_HEADING, flex: 'none' }}>{row.amount}</Box>
            </motion.div>
          ))}
        </Box>

        {/* "Draw Sales Over Time" chart, folded in from the Analytics page */}
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_POP, delay: 1.7 }}
        >
          <Box sx={{ mt: 1.2, p: '10px 13px 8px', borderRadius: '16px', bgcolor: BG_SURFACE, border: `1px solid ${BORDER_SUBTLE}`, boxShadow: SHADOW_CARD }}>
            <Box sx={{ fontSize: 11.5, fontWeight: 800, color: TEXT_HEADING }}>Draw Sales Over Time</Box>
            <Box sx={{ mt: 0.2, mb: 0.8, fontSize: 8.5, fontWeight: 500, color: TEXT_TERTIARY }}>Revenue from qualifying purchases</Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 66, px: 0.5 }}>
              {BARS.map((h, i) => (
                <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                  <motion.div
                    initial={{ scaleY: reduced ? 1 : 0, opacity: reduced ? 0 : 1 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    transition={reduced ? { duration: 0.3, delay: 1.9 } : { ...SPRING_POP, delay: 1.9 + i * 0.11 }}
                    style={{
                      width: 22,
                      height: h,
                      borderRadius: 6,
                      transformOrigin: 'bottom',
                      background: i === BARS.length - 1 ? PRIMARY_MAIN : PRIMARY_TINT,
                      border: i === BARS.length - 1 ? 'none' : `1px solid ${BORDER_RECEIPT}`,
                    }}
                  />
                  <Box component='span' sx={{ fontSize: 7.5, fontWeight: 700, color: TEXT_TERTIARY }}>{LAST_6_MONTHS[i]}</Box>
                </Box>
              ))}
            </Box>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
}

// ── Beat 2 · Winnbell runs the campaign: the checklist ticks itself ───────────

const HANDLED_ITEMS = [
  'Prize funding',
  'Official rules and compliance',
  'Entry validation',
  'Campaign operations',
  'Winner selection & fulfilment',
];

// Each row's check lands on its own beat, one after another.
const tickAt = (i: number) => 1.15 + i * 0.7;

function HandledScreen({ reduced }: ScreenProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: GRADIENT_HERO,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        p: '0 16px',
      }}
    >
      {/* Soft radial glows, like the app's hero bands */}
      <Box sx={{ position: 'absolute', top: -70, right: -50, width: 210, height: 210, borderRadius: '50%', background: `radial-gradient(circle, ${ALPHA_WHITE_15} 0%, transparent 66%)` }} />
      <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 190, height: 190, borderRadius: '50%', background: `radial-gradient(circle, ${ALPHA_WHITE_15} 0%, transparent 66%)` }} />

      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_POP, delay: 0.25 }}
        style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginBottom: 16 }}
      >
        <Box sx={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.015em', lineHeight: 1.35, color: 'white' }}>
          Winnbell runs the campaign,
          <br />
          <Box component='span' sx={{ color: ACCENT_GOLD_LIGHT }}>you take the credit</Box>
        </Box>
      </motion.div>

      <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {HANDLED_ITEMS.map((item, i) => (
          <motion.div
            key={item}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_POP, delay: 0.4 + i * 0.1 }}
          >
            {/* The row nudges as its check lands */}
            <motion.div
              animate={reduced ? undefined : { scale: [1, 1, 1.03, 1] }}
              transition={{ delay: tickAt(i), duration: 0.35, times: [0, 0.01, 0.5, 1] }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 14,
                background: BG_SURFACE,
                boxShadow: SHADOW_CARD,
              }}
            >
              <Box sx={{ position: 'relative', width: 22, height: 22, flex: 'none' }}>
                <Box sx={{ position: 'absolute', inset: 1, borderRadius: '50%', border: `2px solid ${BORDER_LIGHT}` }} />
                {reduced ? (
                  <CheckCircle sx={{ position: 'absolute', inset: 0, fontSize: 22, color: METRIC_GOOD }} />
                ) : (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ ...SPRING_BOUNCY, delay: tickAt(i) }}
                    style={{ position: 'absolute', inset: 0 }}
                  >
                    <CheckCircle sx={{ fontSize: 22, color: METRIC_GOOD }} />
                  </motion.div>
                )}
              </Box>
              <Box component='span' sx={{ fontSize: 11, fontWeight: 800, color: TEXT_PRIMARY }}>{item}</Box>
            </motion.div>
          </motion.div>
        ))}
      </Box>
    </Box>
  );
}

// ── Beat 5 · Marketing Materials (QR Posters tab) ─────────────────────────────

// The mini flyer is the REAL poster component (PosterBlueCanvas, the approved
// 1414x2000 design) rendered through a scale() wrapper, so it always matches
// whatever the current flyer looks like.
const MINI_POSTER_W = 128;
const MINI_POSTER_H = Math.round(MINI_POSTER_W * (DESIGN_H / DESIGN_W)); // 181
const MINI_POSTER_SCALE = MINI_POSTER_W / DESIGN_W;

// The four real poster colorways (blue selected), as swatches.
const COLORWAY_SWATCHES = [
  `linear-gradient(168deg, ${PRIMARY_DEEP} 0%, ${PRIMARY_MAIN} 46%, ${PRIMARY_DARKER} 100%)`,
  GRADIENT_POST_NAVY,
  `linear-gradient(168deg, ${ACCENT_GOLD_LIGHT} 0%, ${ACCENT_GOLD_CREAM} 100%)`,
  GRADIENT_POST_LIGHT,
];

function MarketingScreen({ reduced }: ScreenProps) {
  return (
    <Box sx={{ position: 'absolute', inset: 0, bgcolor: BG_SUBTLE, overflow: 'hidden' }}>
      <ScreenHeader title='Marketing Materials' subtitle='Ready-made materials to promote your campaign' />

      <Box sx={{ p: '10px 12px 0', display: 'flex', flexDirection: 'column', gap: 1.1 }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.3 }}>
          <TabPills tabs={['QR Posters', 'Social Assets', 'Staff Scripts']} />
        </motion.div>

        <Box sx={{ display: 'flex', gap: 1.4, alignItems: 'stretch' }}>
          {/* The real flyer, miniaturized */}
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 22, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...SPRING_POP, delay: 0.5 }}
            style={{ flex: 'none' }}
          >
            <Box sx={{ width: MINI_POSTER_W, height: MINI_POSTER_H, borderRadius: '10px', overflow: 'hidden', boxShadow: SHADOW_FLOAT }}>
              <Box sx={{ width: DESIGN_W, height: DESIGN_H, transform: `scale(${MINI_POSTER_SCALE})`, transformOrigin: 'top left' }}>
                <PosterBlueCanvas businessName="Bella's Coffee" scanUrl='https://www.winnbell.com/start' minAmountLabel='$20' />
              </Box>
            </Box>
          </motion.div>

          {/* Right column: colorway swatches, like the real template picker */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.8, pt: 0.4 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.7 }}>
              <Box sx={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: TEXT_TERTIARY }}>Colorway</Box>
            </motion.div>
            {COLORWAY_SWATCHES.map((bg, i) => (
              <motion.div
                key={i}
                initial={reduced ? { opacity: 0 } : { opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...SPRING_POP, delay: 0.75 + i * 0.1 }}
              >
                <Box
                  sx={{
                    height: 26,
                    borderRadius: '8px',
                    background: bg,
                    border: i === 0 ? `2px solid ${PRIMARY_MAIN}` : `1px solid ${BORDER_LIGHT}`,
                    boxShadow: i === 0 ? SHADOW_PRIMARY_SOFT : 'none',
                  }}
                />
              </motion.div>
            ))}
          </Box>
        </Box>

        {/* Partner window sticker, also real */}
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_POP, delay: 1.15 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: '9px 12px', borderRadius: '16px', bgcolor: BG_SURFACE, border: `1px solid ${BORDER_SUBTLE}` }}>
            <Box sx={{ width: 30, height: 30, borderRadius: '10px', bgcolor: PRIMARY_TINT, display: 'grid', placeItems: 'center', flex: 'none' }}>
              <QrCode2 sx={{ fontSize: 16, color: PRIMARY_MAIN }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ fontSize: 10.5, fontWeight: 800, color: TEXT_PRIMARY }}>Partner sticker</Box>
              <Box sx={{ mt: 0.1, fontSize: 8.5, fontWeight: 500, color: TEXT_TERTIARY }}>For your window or counter</Box>
            </Box>
            <Download sx={{ fontSize: 14, color: TEXT_TERTIARY, flex: 'none' }} />
          </Box>
        </motion.div>

        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ ...SPRING_BOUNCY, delay: 1.35 }}
        >
          <motion.div
            animate={reduced ? undefined : { scale: [1, 1, 0.95, 1] }}
            transition={{ delay: 2.2, duration: 0.4, times: [0, 0.1, 0.5, 1] }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              height: 40,
              borderRadius: 20,
              background: PRIMARY_MAIN,
              boxShadow: SHADOW_PRIMARY_MEDIUM,
            }}
          >
            <Download sx={{ fontSize: 16, color: 'white' }} />
            <Box component='span' sx={{ fontSize: 12.5, fontWeight: 800, color: 'white' }}>Download PDF</Box>
          </motion.div>
        </motion.div>
      </Box>
    </Box>
  );
}

// ── The business showcase ─────────────────────────────────────────────────────

// Pacing note: durations assume a cold viewer who has never heard of Winnbell -
// every beat gets extra dwell time after its choreography settles.
const BEATS: ShowcaseBeat[] = [
  // Comprehension first: the concept beat decodes everything that follows.
  { key: 'concept', caption: 'Your customers enter to win real cash', duration: 10500, Screen: ConceptScreen },
  { key: 'handled', caption: 'Winnbell runs it, you take the credit', duration: 6600, Screen: HandledScreen },
  { key: 'presence', caption: 'Get discovered by new customers', duration: 5400, Screen: PresenceScreen },
  { key: 'growth', caption: 'Watch sales and customers climb', duration: 6600, Screen: GrowthScreen },
  { key: 'marketing', caption: 'Easy to launch with our marketing materials', duration: 5000, Screen: MarketingScreen },
];

const BusinessHeroShowcase = () => (
  <PhoneShowcase
    beats={BEATS}
    srDescription='A quick look at Winnbell for business owners: a qualifying purchase at your shop becomes an entry that could win your customer a big cash prize, without you funding or operating anything. Winnbell handles prize funding, official rules and compliance, entry validation, campaign operations, and winner selection. New customers discover your shop on the Winnbell map, entries and sales climb on your campaign dashboard, and ready-made marketing materials make it easy to launch.'
  />
);

export default BusinessHeroShowcase;
