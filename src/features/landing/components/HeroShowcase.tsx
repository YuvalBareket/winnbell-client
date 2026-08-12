import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import {
  Search,
  LocationOn,
  CalendarMonth,
  EmojiEvents,
  ConfirmationNumber,
  AccessTime,
  Star,
  CardGiftcard,
} from '@mui/icons-material';
import {
  PRIMARY_MAIN,
  PRIMARY_TINT,
  BG_SUBTLE,
  BG_SURFACE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_HEADING,
  TEXT_TERTIARY,
  BORDER_LIGHT,
  BORDER_SUBTLE,
  STATUS_ACTIVATED_BG,
  STATUS_ACTIVATED_TEXT,
  SUCCESS_GREEN_TEXT_AA,
  ACCENT_GOLD,
  ACCENT_GOLD_LIGHT,
  GOLD_TROPHY,
  GRADIENT_HERO,
  GRADIENT_SUCCESS,
  GRADIENT_PROGRESS_BAR,
  SHADOW_CARD,
  SHADOW_CARD_DEEP,
  SHADOW_FLOAT,
  SHADOW_PRIMARY_MEDIUM,
  SHADOW_PRIMARY_SOFT,
  ALPHA_BLACK_06,
  ALPHA_PRIMARY_06,
  ALPHA_WHITE_10,
  ALPHA_WHITE_15,
  ALPHA_WHITE_20,
  ALPHA_WHITE_30,
  ALPHA_WHITE_70,
  ALPHA_WHITE_80,
} from '../../../shared/colors';
import { SECTOR_CONFIG } from '../../../shared/sectorConfig';
import { SPRING_POP, SPRING_BOUNCY, SPRING_JUMP } from '../../../shared/motion';
import PhoneShowcase, {
  type ScreenProps,
  type ShowcaseBeat,
  SCREEN_H,
  SectorGlyph,
  MapPin,
} from './PhoneShowcase';
import { shortDate, TODAY, DAYS_AGO_3, RECEIPT_DATE, CAMPAIGN_ENDS } from './showcaseDates';

// ─────────────────────────────────────────────────────────────────────────────
// HeroShowcase - the consumer landing's five-beat story loop:
// find a shop → submit a receipt → entry success → all entries → weekly entry.
// Frame/loop machinery lives in PhoneShowcase; this file is just the screens.
// ─────────────────────────────────────────────────────────────────────────────

// ── Beat 1 · Nearby map ───────────────────────────────────────────────────────

function MapScreen({ reduced }: ScreenProps) {
  return (
    <Box sx={{ position: 'absolute', inset: 0, bgcolor: BG_SUBTLE, overflow: 'hidden' }}>
      {/* Stylized street grid */}
      <Box sx={{ position: 'absolute', top: 120, left: -30, width: 340, height: 16, bgcolor: BG_SURFACE, transform: 'rotate(-6deg)' }} />
      <Box sx={{ position: 'absolute', top: 250, left: -40, width: 360, height: 13, bgcolor: BG_SURFACE, transform: 'rotate(4deg)' }} />
      <Box sx={{ position: 'absolute', top: -20, left: 70, width: 14, height: 400, bgcolor: BG_SURFACE, transform: 'rotate(7deg)' }} />
      <Box sx={{ position: 'absolute', top: -20, left: 192, width: 11, height: 400, bgcolor: BG_SURFACE, transform: 'rotate(-5deg)' }} />
      <Box sx={{ position: 'absolute', top: 150, left: 120, width: 78, height: 60, borderRadius: '11px', bgcolor: STATUS_ACTIVATED_BG }} />
      <Box sx={{ position: 'absolute', top: 96, left: 22, width: 62, height: 48, borderRadius: '11px', bgcolor: PRIMARY_TINT }} />

      {/* Neighboring pins drop in first */}
      {(
        [
          { sector: 'Grocery', top: 100, left: 38 },
          { sector: 'Retail', top: 186, left: 196 },
          { sector: 'Bakery', top: 196, left: 52 },
        ] as const
      ).map((pin, i) => (
        <motion.div
          key={pin.sector}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.6 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...SPRING_POP, delay: 0.5 + i * 0.15 }}
          style={{ position: 'absolute', top: pin.top, left: pin.left }}
        >
          <MapPin sector={pin.sector} size={26} />
        </motion.div>
      ))}

      {/* The featured coffee shop pin, with sonar pulse + name label */}
      <Box sx={{ position: 'absolute', top: 140, left: 104 }}>
        {!reduced && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ scale: [0.55, 1.9], opacity: [0.5, 0] }}
            transition={{ duration: 1.8, delay: 1.5, repeat: Infinity, repeatDelay: 0.5, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 96,
              height: 96,
              margin: '-48px 0 0 -48px',
              borderRadius: '50%',
              background: `${SECTOR_CONFIG.Coffee.color}66`,
            }}
          />
        )}
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: -24, scale: 0.7 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...SPRING_BOUNCY, delay: 0.95 }}
        >
          <MapPin sector='Coffee' size={42} iconSize={20} />
        </motion.div>
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...SPRING_POP, delay: 1.3 }}
          style={{
            position: 'absolute',
            left: '50%',
            top: -38,
            transform: 'translateX(-50%)',
            padding: '6px 11px',
            borderRadius: 10,
            background: BG_SURFACE,
            boxShadow: SHADOW_FLOAT,
            whiteSpace: 'nowrap',
          }}
        >
          <Box component='span' sx={{ fontSize: 11, fontWeight: 800, color: TEXT_HEADING }}>
            Bella's Coffee
          </Box>
        </motion.div>
      </Box>

      {/* Search bar */}
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

      {/* Bottom sheet with sector filters + nearby partners (chips live in the list card, like the real page) */}
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 70 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_POP, delay: 0.6 }}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 208,
          background: BG_SURFACE,
          borderRadius: '20px 20px 0 0',
          boxShadow: SHADOW_FLOAT,
          padding: '8px 12px 0',
        }}
      >
        <Box sx={{ width: 34, height: 4, borderRadius: 2, bgcolor: BORDER_LIGHT, mx: 'auto', mb: 1 }} />
        <Box sx={{ display: 'flex', gap: 0.75, overflow: 'hidden', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, height: 26, px: 1.4, borderRadius: 999, bgcolor: TEXT_HEADING, flex: 'none' }}>
            <Box component='span' sx={{ fontSize: 10.5, fontWeight: 700, color: 'white' }}>All</Box>
            <Box component='span' sx={{ px: 0.6, py: 0.1, borderRadius: 999, bgcolor: ALPHA_WHITE_20, fontSize: 9, fontWeight: 800, color: 'white' }}>14</Box>
          </Box>
          {(['Coffee', 'Grocery'] as const).map((sector) => (
            <Box key={sector} sx={{ display: 'flex', alignItems: 'center', gap: 0.6, height: 26, px: 1.4, borderRadius: 999, bgcolor: BG_SURFACE, border: `1px solid ${BORDER_SUBTLE}`, flex: 'none' }}>
              <Box component='span' sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: SECTOR_CONFIG[sector].color }} />
              <Box component='span' sx={{ fontSize: 10.5, fontWeight: 700, color: TEXT_PRIMARY }}>{sector}</Box>
            </Box>
          ))}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 0.9 }}>
          <Box component='span' sx={{ fontSize: 13, fontWeight: 800, letterSpacing: '-0.02em', color: TEXT_HEADING }}>14 partners nearby</Box>
          <Box component='span' sx={{ fontSize: 10, fontWeight: 700, color: TEXT_TERTIARY }}>Closest first</Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9 }}>
          {/* Bella's row lights up as the "selected" shop right before the receipt beat */}
          <motion.div
            initial={{ borderColor: BORDER_SUBTLE }}
            animate={{ borderColor: PRIMARY_MAIN }}
            transition={{ delay: 1.9, duration: 0.35 }}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1, p: '9px 10px', borderRadius: '16px', bgcolor: BG_SURFACE, border: `1px solid ${BORDER_SUBTLE}` }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '12px', bgcolor: SECTOR_CONFIG.Grocery.bgColor, display: 'grid', placeItems: 'center', flex: 'none' }}>
              <SectorGlyph sector='Grocery' size={19} color={SECTOR_CONFIG.Grocery.color} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ fontSize: 11.5, fontWeight: 800, color: TEXT_PRIMARY }}>Green Grocer</Box>
              <Box sx={{ mt: 0.4, display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 0.7, py: 0.2, borderRadius: '6px', bgcolor: SECTOR_CONFIG.Grocery.bgColor }}>
                  <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: SECTOR_CONFIG.Grocery.color }} />
                  <Box component='span' sx={{ fontSize: 8.5, fontWeight: 800, color: TEXT_HEADING }}>Grocery</Box>
                </Box>
                <Box component='span' sx={{ px: 0.7, py: 0.2, borderRadius: '6px', bgcolor: PRIMARY_TINT, fontSize: 8.5, fontWeight: 800, color: PRIMARY_MAIN }}>0.4 mi</Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
}

// ── Beat 2 · Receipt form filling itself in ──────────────────────────────────

/** One character at a time, like someone typing. Collapses to a plain fade under reduced motion. */
const TypedText = ({ text, delay, reduced, sx }: { text: string; delay: number; reduced: boolean; sx: object }) => (
  <Box component='span' sx={sx}>
    {text.split('').map((ch, i) => (
      <motion.span
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? delay : delay + i * 0.055, duration: 0.08 }}
      >
        {ch}
      </motion.span>
    ))}
  </Box>
);

function ReceiptScreen({ reduced }: ScreenProps) {
  const fieldStyle = {
    position: 'relative' as const,
    height: 44,
    border: '1.5px solid',
    borderRadius: 14,
    background: BG_SURFACE,
    padding: '0 12px',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  };
  const labelSx = {
    position: 'absolute',
    top: -7,
    left: 11,
    px: 0.6,
    bgcolor: BG_SUBTLE,
    fontSize: 9.5,
    fontWeight: 600,
    color: TEXT_TERTIARY,
  };

  return (
    <Box sx={{ position: 'absolute', inset: 0, bgcolor: BG_SUBTLE }}>
      <Box sx={{ height: 64, background: GRADIENT_HERO, borderRadius: '0 0 20px 20px', p: '12px 14px 0' }}>
        <Box sx={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.01em', color: 'white' }}>Submit receipt</Box>
        <Box sx={{ mt: 0.3, fontSize: 10.5, fontWeight: 500, color: ALPHA_WHITE_70 }}>Step 2 of 2 · Receipt details</Box>
      </Box>

      <Box sx={{ p: '14px 14px 0', display: 'flex', flexDirection: 'column', gap: 1.75 }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.35 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1, p: '10px 11px', borderRadius: '16px', bgcolor: BG_SURFACE, border: `1px solid ${BORDER_SUBTLE}` }}>
            <Box sx={{ width: 30, height: 30, borderRadius: '10px', bgcolor: SECTOR_CONFIG.Coffee.bgColor, display: 'grid', placeItems: 'center', flex: 'none' }}>
              <SectorGlyph sector='Coffee' size={17} color={SECTOR_CONFIG.Coffee.color} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ fontSize: 11.5, fontWeight: 800, color: TEXT_PRIMARY }}>Bella's Coffee</Box>
              <Box sx={{ fontSize: 10, fontWeight: 600, color: TEXT_TERTIARY }}>120 Main St</Box>
            </Box>
            <Box component='span' sx={{ fontSize: 10, fontWeight: 700, color: PRIMARY_MAIN, flex: 'none' }}>Change</Box>
          </Box>
        </motion.div>

        <motion.div
          initial={{ borderColor: BORDER_LIGHT }}
          animate={reduced ? { borderColor: BORDER_LIGHT } : { borderColor: [BORDER_LIGHT, PRIMARY_MAIN, PRIMARY_MAIN, BORDER_LIGHT] }}
          transition={{ delay: 0.6, duration: 1.5, times: [0, 0.1, 0.8, 1] }}
          style={fieldStyle}
        >
          <Box sx={labelSx}>Receipt / Transaction ID</Box>
          <TypedText text='RCP-48213' delay={0.85} reduced={reduced} sx={{ fontSize: 13, fontWeight: 600, color: TEXT_PRIMARY }} />
        </motion.div>

        <motion.div
          initial={{ borderColor: BORDER_LIGHT }}
          animate={reduced ? { borderColor: BORDER_LIGHT } : { borderColor: [BORDER_LIGHT, PRIMARY_MAIN, PRIMARY_MAIN, BORDER_LIGHT] }}
          transition={{ delay: 1.9, duration: 1.3, times: [0, 0.12, 0.78, 1] }}
          style={fieldStyle}
        >
          <Box sx={labelSx}>Amount spent</Box>
          <Box component='span' sx={{ fontSize: 13, fontWeight: 700, color: TEXT_TERTIARY }}>$</Box>
          <TypedText text='30.00' delay={2.15} reduced={reduced} sx={{ fontSize: 13, fontWeight: 600, color: TEXT_PRIMARY }} />
        </motion.div>

        <Box sx={{ ...fieldStyle, borderColor: BORDER_LIGHT, justifyContent: 'space-between' }}>
          <Box sx={labelSx}>Purchase date</Box>
          <Box component='span' sx={{ fontSize: 13, fontWeight: 500, color: TEXT_PRIMARY }}>{RECEIPT_DATE}</Box>
          <CalendarMonth sx={{ fontSize: 16, color: TEXT_TERTIARY }} />
        </Box>

        {/* Button wakes up once the form is "complete", then presses itself */}
        <motion.div initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} transition={{ delay: 2.95, duration: 0.3 }}>
          <motion.div
            animate={reduced ? undefined : { scale: [1, 1, 0.95, 1] }}
            transition={{ delay: 3.45, duration: 0.4, times: [0, 0.1, 0.5, 1] }}
            style={{
              marginTop: 2,
              height: 44,
              borderRadius: 14,
              background: PRIMARY_MAIN,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: SHADOW_PRIMARY_MEDIUM,
            }}
          >
            <Box component='span' sx={{ fontSize: 13, fontWeight: 800, color: 'white' }}>Submit & get my entries</Box>
          </motion.div>
        </motion.div>
      </Box>
    </Box>
  );
}

// ── Beat 3 · Entry success, straight out of EntrySuccessDialog ───────────────

const FLECKS = [
  { left: 8, dx: -20, spin: 360, w: 5, h: 5, color: GOLD_TROPHY, delay: 0 },
  { left: 97, dx: -8, spin: 460, w: 7.5, h: 13, color: ACCENT_GOLD, delay: 0.35 },
  { left: 186, dx: 3, spin: 550, w: 5.5, h: 9, color: ACCENT_GOLD_LIGHT, delay: 0.7 },
  { left: 34, dx: 15, spin: 650, w: 8, h: 8, color: 'white', delay: 1.05 },
  { left: 123, dx: -14, spin: 750, w: 6, h: 10, color: GOLD_TROPHY, delay: 0.2 },
  { left: 212, dx: -2, spin: 845, w: 8.5, h: 14, color: ACCENT_GOLD, delay: 0.55 },
  { left: 61, dx: 10, spin: 400, w: 6, h: 6, color: ACCENT_GOLD_LIGHT, delay: 0.9 },
  { left: 150, dx: -19, spin: 500, w: 9, h: 15, color: 'white', delay: 0.1 },
  { left: 238, dx: -7, spin: 595, w: 6.5, h: 11, color: GOLD_TROPHY, delay: 0.42 },
  { left: 87, dx: 4, spin: 690, w: 9, h: 9, color: ACCENT_GOLD, delay: 0.75 },
  { left: 176, dx: 16, spin: 790, w: 7, h: 12, color: ACCENT_GOLD_LIGHT, delay: 1.15 },
  { left: 25, dx: -12, spin: 885, w: 9.5, h: 16, color: 'white', delay: 0.28 },
];

function SuccessScreen({ reduced }: ScreenProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: GRADIENT_SUCCESS,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: '16px 18px',
        textAlign: 'center',
      }}
    >
      {!reduced &&
        FLECKS.map((f, i) => (
          <motion.div
            key={i}
            initial={{ y: -18, x: 0, rotate: 0, opacity: 0 }}
            animate={{ y: SCREEN_H + 30, x: f.dx, rotate: f.spin, opacity: [0, 1, 1, 0.9] }}
            transition={{ delay: 0.3 + f.delay, duration: 2.1, ease: 'easeIn' }}
            style={{
              position: 'absolute',
              top: 0,
              left: f.left,
              width: f.w,
              height: f.h,
              borderRadius: f.w === f.h ? '50%' : 1.5,
              background: f.color,
            }}
          />
        ))}

      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...SPRING_BOUNCY, delay: 0.2 }}
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: ALPHA_WHITE_15,
          border: `2px solid ${ALPHA_WHITE_30}`,
          display: 'grid',
          placeItems: 'center',
          marginBottom: 14,
        }}
      >
        <EmojiEvents sx={{ fontSize: 38, color: GOLD_TROPHY }} />
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.45 }}>
        <Box sx={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', color: 'white' }}>You're In!</Box>
        <Box sx={{ mt: 0.6, fontSize: 11.5, fontWeight: 500, lineHeight: 1.6, color: ALPHA_WHITE_80 }}>
          Your entry is in this month's draw.
          <br />
          Good luck!
        </Box>
      </motion.div>

      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.82 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...SPRING_POP, delay: 0.7 }}
        style={{
          marginTop: 13,
          padding: '10px 22px',
          borderRadius: 9,
          background: ALPHA_WHITE_10,
          border: `1px solid ${ALPHA_WHITE_20}`,
        }}
      >
        <Box sx={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: ALPHA_WHITE_70 }}>Entry Code</Box>
        <Box sx={{ mt: 0.4, fontFamily: 'monospace', fontSize: 19, fontWeight: 900, letterSpacing: '0.24em', color: 'white' }}>8KD2QP</Box>
      </motion.div>

      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.95 }}
        style={{ marginTop: 15, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9 }}
      >
        <Box sx={{ height: 38, px: 2.5, borderRadius: '8px', bgcolor: 'white', display: 'flex', alignItems: 'center', gap: 0.9 }}>
          <ConfirmationNumber sx={{ fontSize: 16, color: PRIMARY_MAIN }} />
          <Box component='span' sx={{ fontSize: 12, fontWeight: 800, color: PRIMARY_MAIN }}>View My Entries</Box>
        </Box>
        <Box component='span' sx={{ fontSize: 11, fontWeight: 700, color: ALPHA_WHITE_70 }}>Submit Another Receipt</Box>
      </motion.div>
    </Box>
  );
}

// ── Beat 4 · My Entries with the live campaign card ───────────────────────────

function EntriesScreen({ reduced }: ScreenProps) {
  return (
    <Box sx={{ position: 'absolute', inset: 0, bgcolor: BG_SUBTLE, overflow: 'hidden' }}>
      <Box sx={{ position: 'relative', overflow: 'hidden', background: GRADIENT_HERO, borderRadius: '0 0 20px 20px', p: '12px 14px 14px' }}>
        <Box sx={{ position: 'absolute', top: -60, right: -40, width: 150, height: 150, borderRadius: '50%', background: `radial-gradient(circle, ${ALPHA_WHITE_15} 0%, transparent 68%)` }} />
        <Box sx={{ position: 'relative', fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', color: 'white' }}>My Entries</Box>
        <Box sx={{ position: 'relative', mt: 0.3, fontSize: 10, fontWeight: 500, color: ALPHA_WHITE_80 }}>All your entries in one place</Box>
      </Box>

      <Box sx={{ p: '10px 14px 0' }}>
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 26, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...SPRING_POP, delay: 0.25 }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 16,
            padding: '12px 14px 12px',
            background: GRADIENT_HERO,
            boxShadow: SHADOW_CARD_DEEP,
          }}
        >
          <ConfirmationNumber sx={{ position: 'absolute', right: 8, bottom: 6, fontSize: 52, color: 'white', opacity: 0.2, transform: 'rotate(12deg)' }} />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Box sx={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', whiteSpace: 'nowrap', color: ALPHA_WHITE_80 }}>Monthly Cash Draw</Box>
              <Box sx={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 0.6, px: 1, py: 0.35, borderRadius: 50, bgcolor: ALPHA_WHITE_15, border: `1px solid ${ALPHA_WHITE_20}` }}>
                <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: GOLD_TROPHY }} />
                <Box component='span' sx={{ fontSize: 7.5, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: ACCENT_GOLD_LIGHT }}>Live now</Box>
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
            <Box sx={{ mt: 1.2, display: 'inline-flex', alignItems: 'center', gap: 0.7, px: 1.3, py: 0.6, borderRadius: 50, bgcolor: ALPHA_WHITE_15, border: `1px solid ${ALPHA_WHITE_20}` }}>
              <AccessTime sx={{ fontSize: 12, color: 'white' }} />
              <Box component='span' sx={{ fontSize: 9.5, fontWeight: 600, color: 'white' }}>{CAMPAIGN_ENDS}</Box>
            </Box>
          </Box>
        </motion.div>
      </Box>

      <Box sx={{ p: '10px 16px 7px' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, delay: 0.65 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 0.9 }}>
            <Box>
              <Box sx={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: TEXT_TERTIARY }}>Your Entries</Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.6 }}>
                <Box component='span' sx={{ fontSize: 30, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.03em', color: PRIMARY_MAIN }}>14</Box>
                <Box component='span' sx={{ fontSize: 12, fontWeight: 700, color: TEXT_SECONDARY }}>/ 30</Box>
              </Box>
            </Box>
            <Box component='span' sx={{ fontSize: 9.5, fontWeight: 700, color: PRIMARY_MAIN, pb: 0.4 }}>16 slots left</Box>
          </Box>
        </motion.div>
        <Box sx={{ height: 7, borderRadius: 4, bgcolor: ALPHA_BLACK_06, overflow: 'hidden' }}>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={reduced ? { duration: 0.3, delay: 0.8 } : { ...SPRING_JUMP, delay: 0.85 }}
            style={{ height: '100%', width: '46.7%', transformOrigin: 'left', background: GRADIENT_PROGRESS_BAR }}
          />
        </Box>
      </Box>

      <Box sx={{ px: 1.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {(
          [
            { sector: 'Coffee', name: "Bella's Coffee", meta: `120 Main St · ${shortDate(TODAY)} · 9:41 AM`, code: '8KD2QP' },
            { sector: 'Grocery', name: 'Green Grocer', meta: `Market Square · ${shortDate(DAYS_AGO_3)} · 5:12 PM`, code: '4RM7XN' },
            { sector: null, name: 'Weekly entry', meta: `Winnbell · ${shortDate(DAYS_AGO_3)} · 11:05 AM`, code: 'W9XK4T' },
          ] as const
        ).map((row, i) => (
          <motion.div
            key={row.code}
            initial={reduced ? { opacity: 0 } : { opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...SPRING_POP, delay: 1.0 + i * 0.15 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              padding: '8px 12px',
              borderRadius: 34,
              background: BG_SURFACE,
              border: `1px solid ${BORDER_SUBTLE}`,
              boxShadow: SHADOW_CARD,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1, minWidth: 0 }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  bgcolor: row.sector ? SECTOR_CONFIG[row.sector].bgColor : STATUS_ACTIVATED_BG,
                  display: 'grid',
                  placeItems: 'center',
                  flex: 'none',
                }}
              >
                {row.sector ? (
                  <SectorGlyph sector={row.sector} size={19} color={SECTOR_CONFIG[row.sector].color} />
                ) : (
                  <CardGiftcard sx={{ fontSize: 17, color: STATUS_ACTIVATED_TEXT }} />
                )}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ fontSize: 11.5, fontWeight: 700, lineHeight: 1.25, color: TEXT_HEADING, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.name}</Box>
                <Box sx={{ mt: 0.3, fontSize: 9, fontWeight: 500, color: TEXT_SECONDARY, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.meta}</Box>
              </Box>
            </Box>
            <Box sx={{ flex: 'none', fontFamily: 'monospace', fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', lineHeight: 1, color: PRIMARY_MAIN }}>{row.code}</Box>
          </motion.div>
        ))}
      </Box>
    </Box>
  );
}

// ── Beat 5 · Weekly entry, no purchase necessary ──────────────────────────────

function WeeklyScreen({ reduced }: ScreenProps) {
  const rise = (delay: number) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { ...SPRING_POP, delay },
  });

  return (
    <Box sx={{ position: 'absolute', inset: 0, bgcolor: BG_SUBTLE, overflow: 'hidden' }}>
      <Box sx={{ position: 'relative', overflow: 'hidden', background: GRADIENT_HERO, borderRadius: '0 0 20px 20px', p: '12px 14px 14px' }}>
        <Box sx={{ position: 'absolute', top: -60, right: -40, width: 150, height: 150, borderRadius: '50%', background: `radial-gradient(circle, ${ALPHA_WHITE_15} 0%, transparent 68%)` }} />
        <Box sx={{ position: 'relative', fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', color: 'white' }}>Weekly entry</Box>
        <Box sx={{ position: 'relative', mt: 0.3, fontSize: 10, fontWeight: 500, color: ALPHA_WHITE_80 }}>One entry, every week. On us.</Box>
      </Box>

      <Box sx={{ p: '14px 14px 0', display: 'flex', flexDirection: 'column', gap: 1.1 }}>
        <motion.div {...rise(0.25)}>
          <Box sx={{ p: '14px 12px', borderRadius: '24px', bgcolor: BG_SURFACE, border: `1px solid ${BORDER_LIGHT}`, textAlign: 'center' }}>
            <Box sx={{ fontSize: 9.5, lineHeight: 1.6, color: TEXT_SECONDARY }}>
              Winnbell gives every member one entry each week. It resets every Sunday.
            </Box>
          </Box>
        </motion.div>

        <motion.div {...rise(0.4)}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: '11px 12px', borderRadius: '24px', bgcolor: BG_SURFACE, border: `1px solid ${BORDER_LIGHT}` }}>
            <Box sx={{ width: 34, height: 34, borderRadius: '11px', bgcolor: ALPHA_PRIMARY_06, display: 'grid', placeItems: 'center', flex: 'none' }}>
              <CalendarMonth sx={{ fontSize: 19, color: PRIMARY_MAIN }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: TEXT_SECONDARY }}>Availability</Box>
              <Box sx={{ mt: 0.15, fontSize: 13, fontWeight: 800, color: SUCCESS_GREEN_TEXT_AA }}>Available now</Box>
            </Box>
          </Box>
        </motion.div>

        <motion.div {...rise(0.55)}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: '11px 12px', borderRadius: '24px', bgcolor: BG_SURFACE, border: `1px solid ${BORDER_LIGHT}` }}>
            <Box component='span' sx={{ fontSize: 10.5, fontWeight: 600, color: TEXT_SECONDARY }}>Weekly entries used</Box>
            <Box component='span' sx={{ fontSize: 12, fontWeight: 800, color: TEXT_HEADING }}>0 / 1</Box>
          </Box>
        </motion.div>

        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ ...SPRING_BOUNCY, delay: 0.8 }}
        >
          <motion.div
            animate={reduced ? undefined : { scale: [1, 1, 0.95, 1] }}
            transition={{ delay: 1.8, duration: 0.4, times: [0, 0.1, 0.5, 1] }}
            style={{
              marginTop: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              height: 42,
              borderRadius: 20,
              background: PRIMARY_MAIN,
              boxShadow: SHADOW_PRIMARY_MEDIUM,
            }}
          >
            <Star sx={{ fontSize: 17, color: 'white' }} />
            <Box component='span' sx={{ fontSize: 12.5, fontWeight: 800, color: 'white' }}>Claim my weekly entry</Box>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, delay: 1.0 }}>
          <Box sx={{ textAlign: 'center', fontSize: 8.5, color: TEXT_SECONDARY }}>No purchase necessary. One per member per week.</Box>
        </motion.div>
      </Box>
    </Box>
  );
}

// ── The consumer showcase ─────────────────────────────────────────────────────

const BEATS: ShowcaseBeat[] = [
  { key: 'map', caption: 'Find a shop near you', duration: 4400, Screen: MapScreen },
  { key: 'receipt', caption: 'Add your receipt', duration: 4800, Screen: ReceiptScreen },
  { key: 'success', caption: "You're in, with your code", duration: 4400, Screen: SuccessScreen },
  { key: 'entries', caption: 'All your entries in one place', duration: 4400, Screen: EntriesScreen },
  { key: 'weekly', caption: 'Or claim your weekly entry', duration: 4200, Screen: WeeklyScreen },
];

const HeroShowcase = () => (
  <PhoneShowcase
    beats={BEATS}
    srDescription='A quick look inside the app: find a participating shop near you, add your receipt, get your entry code, see all your entries in one place, or claim your weekly entry.'
  />
);

export default HeroShowcase;
