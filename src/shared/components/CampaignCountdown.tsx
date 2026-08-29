import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { AccessTime } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formatDrawDate, nyMidnightUtcMs } from '../utils/date';
import {
  ACCENT_GOLD_LIGHT, ACCENT_GOLD_CREAM, ACCENT_GOLD_TEXT_AA,
  ALPHA_WHITE_15, ALPHA_WHITE_20, ALPHA_WHITE_80, TEXT_TERTIARY,
} from '../colors';

// ── Pre-campaign countdown ──────────────────────────────────────────────────────
// Ticks once a second toward midnight New York on the campaign's start date (the
// documented opening convention - NOT the raw stored timestamp, whose hour drifts).
// Null for a missing/invalid/past target, so a bad date can never render garbage -
// the block simply doesn't show. The interval stops itself once the target passes.
const useCountdown = (targetIso?: string | null) => {
  const [now, setNow] = useState(() => Date.now());
  const target = nyMidnightUtcMs(targetIso) ?? NaN;
  const live = Number.isFinite(target) && target > now;
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [live]);
  if (!live) return null;
  const diff = target - now;
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor(diff / 3_600_000) % 24,
    minutes: Math.floor(diff / 60_000) % 60,
    seconds: Math.floor(diff / 1_000) % 60,
  };
};

const pad2 = (n: number) => String(n).padStart(2, '0');

// Glassy gold countdown to a campaign's opening: white-glass tiles on a gradient
// band (onGradient), warm gold cream on light surfaces. Shared by the logged-out
// welcome pages (/join, /start) and the entry submission page's no-open-campaign
// state. Isolated component so the once-a-second tick re-renders only this block,
// never the whole page.
const CampaignCountdown = ({ opensAt, onGradient }: { opensAt: string; onGradient: boolean }) => {
  const countdown = useCountdown(opensAt);
  if (!countdown) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.16 }}>
      <Box sx={{ position: 'relative', zIndex: 1, mt: onGradient ? 2 : 2.25 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.25 }}>
          <AccessTime sx={{ fontSize: 13, color: onGradient ? ACCENT_GOLD_LIGHT : ACCENT_GOLD_TEXT_AA }} />
          <Typography sx={{ fontSize: { xs: '10.5px', md: '11px' }, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: onGradient ? ACCENT_GOLD_LIGHT : ACCENT_GOLD_TEXT_AA }}>
            Campaign opens {formatDrawDate(opensAt)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {(
            [
              [countdown.days, 'Days'],
              [countdown.hours, 'Hours'],
              [countdown.minutes, 'Min'],
              [countdown.seconds, 'Sec'],
            ] as const
          ).map(([value, unit], i) => (
            <motion.div
              key={unit}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 340, damping: 26, delay: 0.2 + i * 0.07 }}
            >
              <Box
                sx={{
                  minWidth: { xs: 58, md: 66 },
                  py: { xs: 1, md: 1.25 },
                  px: 0.5,
                  borderRadius: '14px',
                  textAlign: 'center',
                  bgcolor: onGradient ? ALPHA_WHITE_15 : ACCENT_GOLD_LIGHT,
                  border: `1px solid ${onGradient ? ALPHA_WHITE_20 : ACCENT_GOLD_CREAM}`,
                }}
              >
                <Typography sx={{ fontSize: { xs: '21px', md: '24px' }, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums', color: onGradient ? 'white' : ACCENT_GOLD_TEXT_AA }}>
                  {pad2(value)}
                </Typography>
                <Typography sx={{ mt: 0.5, fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: onGradient ? ALPHA_WHITE_80 : TEXT_TERTIARY }}>
                  {unit}
                </Typography>
              </Box>
            </motion.div>
          ))}
        </Box>
      </Box>
    </motion.div>
  );
};

export default CampaignCountdown;
