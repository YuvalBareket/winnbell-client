// The detail block below the campaign deck on the Campaigns Hub: a hero winner card, a row of
// stat cards, and the official-rules footer. Restyled to the new design.
import { Box, Typography, Stack, Link } from '@mui/material';
import { motion } from 'framer-motion';
import {
  EmojiEvents, EmojiEventsOutlined, ConfirmationNumberOutlined, CalendarTodayOutlined,
  ArticleOutlined, HourglassEmptyOutlined,
} from '@mui/icons-material';
import type { IDrawResult } from '../types';
import { formatCurrency } from '../../../shared/utils/date';
import { goldShineSx } from './goldShine';
import {
  PRIMARY_MAIN, PRIMARY_DEEP, GOLD_TROPHY, ACCENT_GOLD, ACCENT_GOLD_LIGHT, ACCENT_GOLD_DARK,
  ALPHA_WHITE_10, ALPHA_WHITE_20, ALPHA_WHITE_70, ALPHA_WHITE_80,
  BG_SURFACE, BORDER_SUBTLE, TEXT_HEADING, TEXT_SECONDARY, TEXT_TERTIARY, CHART_GRID,
  ALPHA_PRIMARY_10, SHADOW_CARD,
  ALPHA_AMBER_08, ALPHA_AMBER_04, ALPHA_AMBER_12, ALPHA_AMBER_25,
} from '../../../shared/colors';

// Show the winner's first name only (keep the surname private, no trailing initials).
const winnerFirstName = (name?: string | null) => (name ? name.trim().split(/\s+/)[0] : 'A winner');

const StatCard = ({ icon, tint, iconColor, label, value, valueColor, hideOnMobile }: {
  icon: React.ReactNode; tint: string; iconColor: string; label: string; value: string; valueColor?: string; hideOnMobile?: boolean;
}) => (
  <Box sx={{ flex: 1, minWidth: 0, display: hideOnMobile ? { xs: 'none', md: 'flex' } : 'flex', alignItems: 'center', gap: 1.75, bgcolor: BG_SURFACE, border: `1px solid ${BORDER_SUBTLE}`, borderRadius: '16px', p: '16px 18px', boxShadow: SHADOW_CARD }}>
    <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: tint, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ color: TEXT_TERTIARY, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</Typography>
      <Typography noWrap sx={{ color: valueColor ?? TEXT_HEADING, fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15 }}>{value}</Typography>
    </Box>
  </Box>
);

export const DrawResultDetail = ({ draw, onLocationClick }: { draw: IDrawResult; onLocationClick?: (locationId: number) => void }) => {
  const isClosed = draw.status?.toLowerCase() === 'closed';
  const hasWinner = !!draw.winner_name;
  const winner = winnerFirstName(draw.winner_name);
  const prize = formatCurrency(draw.prize_amount);
  const drawDate = new Date(draw.closed_at ?? draw.draw_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <Stack spacing={1.75}>
      {/* Winner hero card */}
      {isClosed && hasWinner && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: '20px', p: { xs: 2.5, md: 3.5 }, background: `linear-gradient(135deg, ${PRIMARY_DEEP} 0%, ${PRIMARY_MAIN} 72%)`, color: '#fff', boxShadow: SHADOW_CARD }}>
            {/* Decorative orbs (radial fade - no hard edge) + confetti */}
            <Box sx={{ position: 'absolute', bottom: '-40%', left: '-8%', width: 240, height: 240, borderRadius: '50%', background: `radial-gradient(circle, ${ACCENT_GOLD}38 0%, ${ACCENT_GOLD}14 45%, transparent 70%)`, pointerEvents: 'none' }} />
            <Box sx={{ position: 'absolute', top: '-34%', right: '-4%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 45%, transparent 70%)', pointerEvents: 'none' }} />
            <Box sx={{ position: 'absolute', top: 22, right: '42%', width: 7, height: 7, borderRadius: '2px', bgcolor: GOLD_TROPHY, transform: 'rotate(20deg)', pointerEvents: 'none' }} />
            <Box sx={{ position: 'absolute', top: 40, right: '30%', width: 6, height: 6, borderRadius: '50%', bgcolor: ALPHA_WHITE_20, pointerEvents: 'none' }} />
            <Box sx={{ position: 'absolute', bottom: 26, left: '46%', width: 6, height: 10, borderRadius: '2px', bgcolor: `${ACCENT_GOLD_LIGHT}`, transform: 'rotate(-16deg)', opacity: 0.8, pointerEvents: 'none' }} />
            <Box sx={{ position: 'relative', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: { xs: 2, md: 3.5 }, textAlign: { xs: 'center', md: 'left' } }}>
              {/* Trophy - bright gold medallion */}
              <Box sx={{ width: { xs: 76, md: 96 }, height: { xs: 76, md: 96 }, borderRadius: '50%', background: `linear-gradient(150deg, ${ACCENT_GOLD_LIGHT} 0%, ${GOLD_TROPHY} 45%, ${ACCENT_GOLD} 100%)`, boxShadow: `0 14px 30px rgba(160,130,47,0.55), inset 0 2px 6px rgba(255,255,255,0.55)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <EmojiEvents sx={{ fontSize: { xs: 38, md: 48 }, color: '#fff', filter: 'drop-shadow(0 2px 3px rgba(120,90,20,0.45))' }} />
              </Box>
              {/* Winner text */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ color: GOLD_TROPHY, fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', mb: 0.5 }}>
                  Winner · {draw.name}
                </Typography>
                <Typography sx={{ fontSize: { xs: '1.55rem', md: '1.9rem' }, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                  {winner} won{' '}
                  <Box component='span' sx={{ ...goldShineSx }}>{prize}</Box>
                </Typography>
                <Typography sx={{ color: ALPHA_WHITE_80, fontSize: '0.9rem', fontWeight: 500, mt: 0.75 }}>
                  {draw.winner_business_name ? (
                    <>
                      Selected with{' '}
                      {onLocationClick && draw.winner_location_id ? (
                        <Link component='button' type='button' onClick={() => onLocationClick(draw.winner_location_id!)} underline='hover' sx={{ color: '#fff', fontWeight: 700, verticalAlign: 'baseline' }}>
                          {draw.winner_business_name}
                        </Link>
                      ) : (
                        <Box component='span' sx={{ fontWeight: 700, color: '#fff' }}>{draw.winner_business_name}</Box>
                      )}{' '}
                      receipt
                    </>
                  ) : 'Selected with a free weekly entry'}
                </Typography>
              </Box>
              {/* Winning entry code */}
              {draw.winning_ticket_code && (
                <Box sx={{ flexShrink: 0, bgcolor: ALPHA_WHITE_10, border: `1px solid ${ALPHA_WHITE_20}`, borderRadius: '16px', px: 3, py: 2, textAlign: 'center' }}>
                  <Typography sx={{ color: ALPHA_WHITE_70, fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', mb: 0.5 }}>Winning entry</Typography>
                  <Typography sx={{ color: GOLD_TROPHY, fontSize: '1.5rem', fontWeight: 900, letterSpacing: '0.16em', fontFamily: '"Courier New", monospace' }}>{draw.winning_ticket_code}</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </motion.div>
      )}

      {/* Verification in progress (closed, winner not yet announced) */}
      {isClosed && !hasWinner && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Box sx={{ display: 'flex', gap: 1.75, alignItems: 'flex-start', borderRadius: '16px', p: 2, background: `linear-gradient(135deg, ${ALPHA_AMBER_08} 0%, ${ALPHA_AMBER_04} 100%)`, border: `1px solid ${ALPHA_AMBER_25}` }}>
            <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: ALPHA_AMBER_12, color: ACCENT_GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <HourglassEmptyOutlined sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, color: ACCENT_GOLD_DARK, fontSize: '0.9rem', mb: 0.25 }}>Verification in progress</Typography>
              <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.78rem', lineHeight: 1.5 }}>
                A potential winner has been selected and is undergoing eligibility and fraud verification. We will announce the final winner soon.
              </Typography>
            </Box>
          </Box>
        </motion.div>
      )}

      {/* Stat cards */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}>
        <Stack direction='row' spacing={1.5}>
          {/* Total entries only matters for the live campaign - hidden on ended draws. */}
          {!isClosed && (
            <StatCard icon={<ConfirmationNumberOutlined sx={{ fontSize: 22 }} />} tint={ALPHA_PRIMARY_10} iconColor={PRIMARY_MAIN} label='Total Entries' value={draw.entry_count?.toLocaleString() ?? '0'} />
          )}
          <StatCard icon={<EmojiEventsOutlined sx={{ fontSize: 22 }} />} tint={ACCENT_GOLD_LIGHT} iconColor={ACCENT_GOLD_DARK} label={isClosed ? 'Prize Awarded' : 'Prize Pool'} value={prize} valueColor={ACCENT_GOLD_DARK} hideOnMobile={!isClosed} />
          <StatCard icon={<CalendarTodayOutlined sx={{ fontSize: 20 }} />} tint={CHART_GRID} iconColor={TEXT_TERTIARY} label='Draw Date' value={drawDate} />
        </Stack>
      </motion.div>

      {/* Official rules */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.12 }}>
        <Box sx={{ bgcolor: BG_SURFACE, border: `1px solid ${BORDER_SUBTLE}`, borderRadius: '16px', p: '14px 18px', boxShadow: SHADOW_CARD, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Typography sx={{ color: TEXT_TERTIARY, fontSize: '0.72rem', lineHeight: 1.6, flex: 1, minWidth: 200 }}>
            Campaign operated by Winnbell. No purchase necessary. A purchase will not increase chances of winning. Free entry method available on the platform. 18+. Void where prohibited.
          </Typography>
          <Link href={`/rules/${draw.id}`} underline='none' sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: '0.78rem', fontWeight: 700, color: PRIMARY_MAIN, flexShrink: 0, transition: 'gap 0.2s ease-in-out', '&:hover': { gap: 0.75 } }}>
            <ArticleOutlined sx={{ fontSize: 16 }} /> Official Rules
          </Link>
        </Box>
      </motion.div>
    </Stack>
  );
};
