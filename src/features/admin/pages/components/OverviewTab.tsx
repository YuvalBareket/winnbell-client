import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Stack,
  LinearProgress,
  Chip,
  useMediaQuery,
  useTheme,
  Button,
} from '@mui/material';
import { motion } from 'framer-motion';
import PeopleIcon from '@mui/icons-material/People';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { AdminCard, StatCard, IconTile, StatCardSkeleton, AdminCardSkeleton } from './adminUi';
import {
  PRIMARY_MAIN, PRIMARY_TINT,
  ALPHA_GREEN_10, METRIC_GOOD,
  CHART_PURPLE_TINT, CHART_PURPLE,
  ACCENT_GOLD_LIGHT, ACCENT_GOLD_DARK,
  GRADIENT_DRAW_CARD,
  ALPHA_WHITE_15, ALPHA_WHITE_20,
  TEXT_SECONDARY, TEXT_HEADING,
  GOLD_SOFT,
  AMBER_HOURGLASS,
  ALPHA_AMBER_12,
  STATUS_PENDING_BG,
} from '../../../../shared/colors';
import { staggerContainer, riseIn } from '../../../../shared/motion';

interface Props {
  overview: any;
  currentOpenDraw: any;
  overviewLoading?: boolean;
  drawsLoading?: boolean;
}

const OverviewTab: React.FC<Props> = ({ overview, currentOpenDraw, overviewLoading, drawsLoading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Skeleton mirror of the loaded layout - KPI grid, campaign hero, revenue card.
  // Without it the tab rendered fake zeros and a false "No active campaign" while loading.
  if (overviewLoading) {
    return (
      <Stack spacing={3}>
        <Grid container spacing={isMobile ? 1.5 : 2}>
          {[0, 1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 6, sm: 6, md: 3 }}>
              <StatCardSkeleton />
            </Grid>
          ))}
        </Grid>
        <AdminCardSkeleton height={280} />
        <AdminCardSkeleton height={96} />
      </Stack>
    );
  }

  const flaggedUsers = overview?.attention?.flagged_users ?? 0;
  const hasAttention = flaggedUsers > 0;

  const daysUntilDraw = currentOpenDraw?.draw_date
    ? Math.max(0, Math.ceil((new Date(currentOpenDraw.draw_date).getTime() - Date.now()) / 86_400_000))
    : null;

  return (
    <Stack spacing={3}>
      {/* Attention Required - styled as AdminCard with left accent */}
      {hasAttention && (
        <motion.div variants={riseIn} initial='hidden' animate='visible'>
          <AdminCard sx={{ borderLeft: `4px solid ${STATUS_PENDING_BG}`, pl: 2 }}>
            <Stack direction='row' alignItems='center' spacing={2} sx={{ py: 2, pr: 2 }}>
              <Box sx={{ flexShrink: 0 }}>
                <IconTile icon={<WarningAmberIcon />} tint={ALPHA_AMBER_12} color={AMBER_HOURGLASS} size={48} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant='body2' fontWeight={700} sx={{ color: TEXT_HEADING }}>
                  {flaggedUsers} high-risk user{flaggedUsers !== 1 ? 's' : ''} need review
                </Typography>
                <Typography variant='caption' sx={{ color: TEXT_SECONDARY, display: 'block', mt: 0.5 }}>
                  Risk score ≥ 20
                </Typography>
              </Box>
              <Box sx={{ flexShrink: 0 }}>
                <Button
                  size='small'
                  href='/admin/users'
                  sx={{
                    fontWeight: 700,
                    textTransform: 'none',
                    color: PRIMARY_MAIN,
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Review
                </Button>
              </Box>
            </Stack>
          </AdminCard>
        </motion.div>
      )}

      {/* KPI Cards - wrap in motion stagger container */}
      <motion.div variants={staggerContainer} initial='hidden' animate='visible'>
        <Grid container spacing={isMobile ? 1.5 : 2}>
          {/* Total Users */}
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <StatCard
              icon={<PeopleIcon />}
              tint={PRIMARY_TINT}
              color={PRIMARY_MAIN}
              label='Total Users'
              value={overview?.users?.total_users ?? 0}
              caption={`+ ${overview?.users?.business_users ?? 0} businesses, ${overview?.users?.manager_users ?? 0} managers`}
            />
          </Grid>

          {/* Active Businesses */}
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <StatCard
              icon={<StorefrontIcon />}
              tint={ALPHA_GREEN_10}
              color={METRIC_GOOD}
              label='Active Businesses'
              value={overview?.businesses?.total ?? 0}
              caption={`${overview?.businesses?.active ?? 0} subscribed`}
            />
          </Grid>

          {/* Active Subscriptions */}
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <StatCard
              icon={<CreditCardIcon />}
              tint={CHART_PURPLE_TINT}
              color={CHART_PURPLE}
              label='Active Subscriptions'
              value={overview?.subscriptions?.active_subs ?? 0}
              caption={`$${Number(overview?.subscriptions?.total_fees ?? 0).toLocaleString()}/mo`}
            />
          </Grid>

          {/* Current Draw Prize Pool */}
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <StatCard
              icon={<EmojiEventsIcon />}
              tint={ACCENT_GOLD_LIGHT}
              color={ACCENT_GOLD_DARK}
              label='Current Campaign Prize'
              value={`$${Number(overview?.currentDraw?.prize_pool ?? 0).toLocaleString()}`}
              caption={overview?.currentDraw?.name ?? 'No active campaign'}
            />
          </Grid>
        </Grid>
      </motion.div>

      {/* Current Draw Card - gradient hero with glow orb */}
      {currentOpenDraw && (
        <motion.div variants={riseIn} initial='hidden' animate='visible'>
          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              background: GRADIENT_DRAW_CARD,
              borderRadius: '15px',
              p: 3,
              color: 'white',
            }}
          >
            {/* Glow orb - radial gradient, not filter:blur */}
            <Box
              sx={{
                position: 'absolute',
                top: -80,
                right: -80,
                width: 280,
                height: 280,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${ALPHA_WHITE_15} 0%, transparent 68%)`,
                pointerEvents: 'none',
              }}
            />

            <Stack spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
              {/* Campaign name and meta */}
              <Box>
                <Typography variant='h5' fontWeight={700} sx={{ letterSpacing: '-0.02em', mb: 1 }}>
                  {currentOpenDraw.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Typography variant='body2' sx={{ opacity: 0.9 }}>
                    Draw Date: {new Date(currentOpenDraw.draw_date).toLocaleDateString('en-US')}
                  </Typography>
                  {daysUntilDraw !== null && (
                    <Chip
                      label={daysUntilDraw === 0 ? 'Draw today!' : `${daysUntilDraw}d left`}
                      size='small'
                      sx={{
                        bgcolor: ALPHA_WHITE_20,
                        border: `1px solid ${ALPHA_WHITE_20}`,
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  )}
                  <Chip
                    label='Open'
                    size='small'
                    sx={{
                      bgcolor: ALPHA_WHITE_20,
                      border: `1px solid ${ALPHA_WHITE_20}`,
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>

              {/* Prize amount - gold emphasis */}
              <Box>
                <Typography variant='body2' sx={{ opacity: 0.85, mb: 0.5 }}>
                  Prize Pool
                </Typography>
                <Typography
                  variant='h4'
                  fontWeight={800}
                  sx={{
                    background: `linear-gradient(90deg, ${GOLD_SOFT}, white)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-0.02em',
                  }}
                >
                  ${Number(currentOpenDraw.prize_amount ?? 0).toLocaleString()}
                </Typography>
              </Box>

              {/* Entry activation progress */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant='body2' fontWeight={600}>
                    Entry Activation
                  </Typography>
                  <Typography variant='body2' sx={{ opacity: 0.85 }}>
                    {overview?.currentDrawTickets?.activated ?? 0} / {overview?.currentDrawTickets?.total_tickets ?? 0}
                  </Typography>
                </Box>
                <LinearProgress
                  variant='determinate'
                  value={
                    overview?.currentDrawTickets?.total_tickets
                      ? (overview.currentDrawTickets.activated / overview.currentDrawTickets.total_tickets) * 100
                      : 0
                  }
                  sx={{
                    height: 6,
                    borderRadius: 1,
                    bgcolor: ALPHA_WHITE_20,
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'white',
                    },
                  }}
                />
                <Typography variant='caption' sx={{ display: 'block', mt: 0.75, opacity: 0.8 }}>
                  {overview?.currentDrawTickets?.total_tickets
                    ? Math.round((overview.currentDrawTickets.activated / overview.currentDrawTickets.total_tickets) * 100)
                    : 0}
                  % activated
                </Typography>
              </Box>
            </Stack>
          </Box>
        </motion.div>
      )}

      {/* Campaign hero placeholder while the draws list is still loading */}
      {!currentOpenDraw && drawsLoading && <AdminCardSkeleton height={280} />}

      {/* No active campaign state - animated in. Gated on the draws fetch so it can
          never flash "No active campaign" while the list is still on the wire. */}
      {!currentOpenDraw && !drawsLoading && (
        <motion.div variants={riseIn} initial='hidden' animate='visible'>
          <AdminCard sx={{ bgcolor: STATUS_PENDING_BG, borderColor: 'transparent' }}>
            <Stack spacing={1.5} sx={{ py: 2 }}>
              <Typography variant='subtitle2' fontWeight={700} sx={{ color: TEXT_HEADING }}>
                No active campaign
              </Typography>
              <Typography variant='body2' sx={{ color: TEXT_SECONDARY }}>
                Create and open a campaign in the Campaigns tab to start a raffle.
              </Typography>
            </Stack>
          </AdminCard>
        </motion.div>
      )}

      {/* Revenue Model - quiet card */}
      <motion.div variants={riseIn} initial='hidden' animate='visible'>
        <AdminCard>
          <Stack spacing={1} sx={{ p: 2.25 }}>
            <Typography variant='subtitle2' fontWeight={700} sx={{ color: TEXT_HEADING }}>
              Revenue Model
            </Typography>
            <Typography variant='body2' sx={{ color: TEXT_SECONDARY }}>
              Businesses pay a monthly subscription fee to participate in campaigns. Currently <strong>{overview?.subscriptions?.active_subs ?? 0} active subscriptions</strong> generating <strong>${Number(overview?.subscriptions?.total_fees ?? 0).toLocaleString()}/mo</strong>.
            </Typography>
          </Stack>
        </AdminCard>
      </motion.div>

    </Stack>
  );
};

export default OverviewTab;
