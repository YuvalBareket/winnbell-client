import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import {
  Search,
  LocationOn,
  Receipt,
  CheckCircleOutline,
  TrendingUp,
  PeopleAlt,
  Schedule,
  Groups,
  ConfirmationNumber,
  Autorenew,
  Download,
  QrCode2,
  CheckCircle,
} from '@mui/icons-material';
import {
  PRIMARY_MAIN,
  PRIMARY_TINT,
  PRIMARY_DEEP,
  PRIMARY_DARKER,
  BG_SUBTLE,
  BG_SURFACE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
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
  GRADIENT_PROGRESS_BAR,
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
  ALPHA_WHITE_80,
  ALPHA_BLACK_06,
} from '../../../shared/colors';
import { SECTOR_CONFIG } from '../../../shared/sectorConfig';
import { SPRING_POP, SPRING_BOUNCY, SPRING_JUMP } from '../../../shared/motion';
import PhoneShowcase, {
  type ScreenProps,
  type ShowcaseBeat,
  SectorGlyph,
  MapPin,
} from './PhoneShowcase';
import { DAYS_LEFT_LABEL, LAST_6_MONTHS } from './showcaseDates';
import { PosterBlueCanvas } from '../../marketing/components/PosterTemplates';
import { DESIGN_W, DESIGN_H } from '../../marketing/components/posterConstants';

// ─────────────────────────────────────────────────────────────────────────────
// BusinessHeroShowcase - the business landing's five-beat story loop, told with
// miniatures of the REAL owner pages: the Nearby map customers see you on, the
// Campaign Dashboard (KPIs + Recent entries feed), the campaign card, the
// Analytics page, and Marketing Materials. Layouts and copy mirror those pages.
// Frame/loop machinery lives in PhoneShowcase; this file is just the screens.
// ─────────────────────────────────────────────────────────────────────────────

// Shared story numbers, kept consistent across beats (MTD view):
// 342 entries from 127 customers, 342/1000 of the entry capacity used.

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

// ── Beat 1 · Customers find you on the Nearby map ─────────────────────────────

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

// ── Beat 2 · Campaign Dashboard: KPIs + Recent entries feed ───────────────────

const FEED_ROWS = [
  { title: 'RCP-48213', when: '2m ago', amount: '$45.00' },
  { title: 'RCP-48166', when: '1h ago', amount: '$32.50' },
  { title: 'RCP-48102', when: '3h ago', amount: '$27.00' },
];

function DashboardScreen({ reduced }: ScreenProps) {
  return (
    <Box sx={{ position: 'absolute', inset: 0, bgcolor: BG_SUBTLE, overflow: 'hidden' }}>
      <ScreenHeader title='Campaign Dashboard' subtitle='Monitor your active campaign and entries' />

      <Box sx={{ p: '10px 12px 0' }}>
        {/* Date range segments, MTD selected */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.3 }}>
          <Box sx={{ display: 'flex', gap: 0.5, mb: 1.1 }}>
            {(['Today', 'WTD', 'MTD'] as const).map((seg, i) => (
              <Box
                key={seg}
                sx={{
                  px: 1.1,
                  py: 0.35,
                  borderRadius: 999,
                  bgcolor: i === 2 ? TEXT_HEADING : BG_SURFACE,
                  border: i === 2 ? 'none' : `1px solid ${BORDER_SUBTLE}`,
                }}
              >
                <Box component='span' sx={{ fontSize: 9, fontWeight: 700, color: i === 2 ? 'white' : TEXT_TERTIARY }}>{seg}</Box>
              </Box>
            ))}
          </Box>
        </motion.div>

        {/* KPI cards: Entries / Revenue / Custmrs, like the real dashboard */}
        <Box sx={{ display: 'flex', gap: 0.8 }}>
          {(
            [
              { Icon: CheckCircleOutline, label: 'Entries', value: '342', bg: ALPHA_PRIMARY_10, fg: PRIMARY_MAIN },
              { Icon: TrendingUp, label: 'Revenue', value: '$4.2k', bg: ALPHA_GREEN_10, fg: STATUS_ACTIVATED_TEXT },
              { Icon: PeopleAlt, label: 'Custmrs', value: '127', bg: ALPHA_ORANGE_12, fg: STATUS_PENDING_TEXT },
            ] as const
          ).map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING_POP, delay: 0.4 + i * 0.12 }}
              style={{ flex: 1, padding: '9px 8px', borderRadius: 14, background: BG_SURFACE, border: `1px solid ${BORDER_SUBTLE}`, boxShadow: SHADOW_CARD }}
            >
              <Box sx={{ width: 24, height: 24, borderRadius: '8px', bgcolor: kpi.bg, display: 'grid', placeItems: 'center', mb: 0.6 }}>
                <kpi.Icon sx={{ fontSize: 14, color: kpi.fg }} />
              </Box>
              <Box sx={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: TEXT_TERTIARY }}>{kpi.label}</Box>
              <Box sx={{ mt: 0.2, fontSize: 16, fontWeight: 900, lineHeight: 1.1, color: TEXT_HEADING }}>{kpi.value}</Box>
            </motion.div>
          ))}
        </Box>

        {/* Recent entries feed */}
        <Box sx={{ mt: 1.4, mb: 0.8, fontSize: 11.5, fontWeight: 800, color: TEXT_HEADING }}>Recent entries</Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9 }}>
          {FEED_ROWS.map((row, i) => (
            <motion.div
              key={row.title}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: -14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ ...SPRING_POP, delay: 1.0 + i * 0.4 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: '9px 11px',
                borderRadius: 16,
                background: BG_SURFACE,
                border: `1px solid ${BORDER_SUBTLE}`,
                boxShadow: SHADOW_CARD,
              }}
            >
              <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: AVATAR_BLUE_BG, display: 'grid', placeItems: 'center', flex: 'none' }}>
                <Receipt sx={{ fontSize: 15, color: PRIMARY_MAIN }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box component='span' sx={{ fontSize: 10.5, fontWeight: 800, color: TEXT_PRIMARY, whiteSpace: 'nowrap' }}>{row.title}</Box>
                <Box sx={{ mt: 0.2, fontSize: 8.5, fontWeight: 500, color: TEXT_TERTIARY }}>{row.when}</Box>
              </Box>
              <Box component='span' sx={{ fontSize: 10.5, fontWeight: 800, color: TEXT_HEADING, flex: 'none' }}>{row.amount}</Box>
            </motion.div>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

// ── Beat 3 · The campaign card: prize, countdown, entry capacity ──────────────

function CampaignScreen({ reduced }: ScreenProps) {
  return (
    <Box sx={{ position: 'absolute', inset: 0, bgcolor: BG_SUBTLE, overflow: 'hidden' }}>
      <ScreenHeader title='Campaign Dashboard' subtitle='Monitor your active campaign and entries' />

      <Box sx={{ p: '12px 14px 0' }}>
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 26, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...SPRING_POP, delay: 0.25 }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 16,
            padding: '14px 14px 15px',
            background: GRADIENT_HERO,
            boxShadow: SHADOW_CARD_DEEP,
          }}
        >
          <ConfirmationNumber sx={{ position: 'absolute', right: 8, bottom: 6, fontSize: 52, color: 'white', opacity: 0.2, transform: 'rotate(12deg)' }} />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Box sx={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', whiteSpace: 'nowrap', color: ALPHA_WHITE_80 }}>Prize</Box>
              <Box sx={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 0.6, px: 1, py: 0.35, borderRadius: 50, bgcolor: ALPHA_WHITE_15, border: `1px solid ${ALPHA_WHITE_20}` }}>
                <Schedule sx={{ fontSize: 10, color: ACCENT_GOLD_LIGHT }} />
                <Box component='span' sx={{ fontSize: 7.5, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: ACCENT_GOLD_LIGHT }}>{DAYS_LEFT_LABEL}</Box>
              </Box>
            </Box>
            <Box
              sx={{
                mt: 0.3,
                fontSize: 34,
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
              }}
            >
              $$$
            </Box>
            <Box sx={{ mt: 1, fontSize: 9.5, fontWeight: 600, color: ALPHA_WHITE_80 }}>Sponsored and run by Winnbell</Box>
          </Box>
        </motion.div>
      </Box>

      {/* Entry capacity, like the campaign card's progress section */}
      <Box sx={{ p: '13px 16px 0' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, delay: 0.7 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 0.7 }}>
            <Box component='span' sx={{ fontSize: 10.5, fontWeight: 700, color: TEXT_SECONDARY }}>Entry capacity</Box>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.4 }}>
              <Box component='span' sx={{ fontSize: 15, fontWeight: 900, color: PRIMARY_MAIN }}>342</Box>
              <Box component='span' sx={{ fontSize: 10, fontWeight: 700, color: TEXT_SECONDARY }}>/ 1,000</Box>
            </Box>
          </Box>
        </motion.div>
        <Box sx={{ height: 7, borderRadius: 4, bgcolor: ALPHA_BLACK_06, overflow: 'hidden' }}>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={reduced ? { duration: 0.3, delay: 0.75 } : { ...SPRING_JUMP, delay: 0.8 }}
            style={{ height: '100%', width: '34%', transformOrigin: 'left', background: GRADIENT_PROGRESS_BAR }}
          />
        </Box>
      </Box>

      <Box sx={{ p: '14px 14px 0' }}>
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_POP, delay: 1.2 }}
        >
          <Box sx={{ display: 'flex', gap: 1.1, p: '12px 12px', borderRadius: '16px', bgcolor: BG_SURFACE, border: `1px solid ${BORDER_LIGHT}` }}>
            <CheckCircle sx={{ fontSize: 18, color: METRIC_GOOD, flex: 'none', mt: 0.1 }} />
            <Box sx={{ fontSize: 9.5, lineHeight: 1.6, color: TEXT_SECONDARY }}>
              Prize, official rules, entry validation, and winner selection are all handled by Winnbell. You take the credit.
            </Box>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
}

// ── Beat 4 · Analytics (Overview tab) ─────────────────────────────────────────

// Month-over-month growth story for the "Draw Sales Over Time" chart.
const BARS = [22, 30, 38, 48, 58, 70];

function AnalyticsScreen({ reduced }: ScreenProps) {
  return (
    <Box sx={{ position: 'absolute', inset: 0, bgcolor: BG_SUBTLE, overflow: 'hidden' }}>
      <ScreenHeader title='Analytics' subtitle='Understand your customers and growth' />

      <Box sx={{ p: '10px 12px 0' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.3 }}>
          <TabPills tabs={['Overview', 'New Customers', 'Engagement']} />
        </motion.div>

        {/* Overview KPI tiles, real labels + captions */}
        <Box sx={{ mt: 1.2, display: 'flex', gap: 0.8 }}>
          {(
            [
              { Icon: Groups, label: 'Customers', value: '127', caption: 'Different people who made a purchase' },
              { Icon: ConfirmationNumber, label: 'Total Entries', value: '342', caption: 'Entries in the selected period' },
              { Icon: Autorenew, label: 'Entries per Customer', value: '2.7', caption: 'Average entries per person' },
            ] as const
          ).map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING_POP, delay: 0.45 + i * 0.12 }}
              style={{ flex: 1, padding: '9px 8px', borderRadius: 14, background: BG_SURFACE, border: `1px solid ${BORDER_SUBTLE}`, boxShadow: SHADOW_CARD }}
            >
              <kpi.Icon sx={{ fontSize: 14, color: PRIMARY_MAIN, mb: 0.5 }} />
              <Box sx={{ fontSize: 7.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: TEXT_TERTIARY, lineHeight: 1.3 }}>{kpi.label}</Box>
              <Box sx={{ mt: 0.2, fontSize: 15, fontWeight: 900, lineHeight: 1.1, color: TEXT_HEADING }}>{kpi.value}</Box>
            </motion.div>
          ))}
        </Box>

        {/* "Customers & Entries" chart card */}
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_POP, delay: 0.75 }}
        >
          <Box sx={{ mt: 1.2, p: '12px 13px 10px', borderRadius: '16px', bgcolor: BG_SURFACE, border: `1px solid ${BORDER_SUBTLE}`, boxShadow: SHADOW_CARD }}>
            <Box sx={{ fontSize: 11.5, fontWeight: 800, color: TEXT_HEADING }}>Draw Sales Over Time</Box>
            <Box sx={{ mt: 0.2, mb: 1, fontSize: 8.5, fontWeight: 500, color: TEXT_TERTIARY }}>Revenue from purchases that qualified for entries</Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 80, px: 0.5 }}>
              {BARS.map((h, i) => (
                <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.6 }}>
                  <motion.div
                    initial={{ scaleY: reduced ? 1 : 0, opacity: reduced ? 0 : 1 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    transition={reduced ? { duration: 0.3, delay: 1.0 } : { ...SPRING_POP, delay: 1.0 + i * 0.11 }}
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

const BEATS: ShowcaseBeat[] = [
  { key: 'presence', caption: 'Customers find you on the map', duration: 4400, Screen: PresenceScreen },
  { key: 'dashboard', caption: 'Entries land in your dashboard', duration: 4800, Screen: DashboardScreen },
  // Longer beat: the "handled by Winnbell" note lands late and deserves reading time.
  { key: 'campaign', caption: 'Winnbell runs the monthly draw', duration: 6400, Screen: CampaignScreen },
  { key: 'analytics', caption: 'Track your customers and growth', duration: 4600, Screen: AnalyticsScreen },
  { key: 'marketing', caption: 'Marketing materials included', duration: 4400, Screen: MarketingScreen },
];

const BusinessHeroShowcase = () => (
  <PhoneShowcase
    beats={BEATS}
    srDescription='A quick look inside the business dashboard: your shop live on the Winnbell map, customer entries arriving on your campaign dashboard, the monthly cash draw Winnbell runs for you, your analytics, and ready-made marketing materials with QR posters.'
  />
);

export default BusinessHeroShowcase;
