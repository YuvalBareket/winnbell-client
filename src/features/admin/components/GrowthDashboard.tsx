import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  Skeleton,
  Alert,
  LinearProgress,
  Tooltip,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import { InfoOutlined, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useGrowthAnalytics } from '../hooks/useAdmin';
import {
  PRIMARY_MAIN,
  PRIMARY_DEEP,
  TEXT_SECONDARY,
  TEXT_TERTIARY,
  BORDER_LIGHT,
  METRIC_GOOD,
  METRIC_GOOD_TINT,
  METRIC_WARN,
  METRIC_BAD,
  METRIC_BAD_TINT,
  METRIC_NEUTRAL,
  CHART_GRID,
  CHART_BLUE,
  CHART_BLUE_TINT,
  CHART_GREEN,
  CHART_ORANGE,
  CHART_TEAL,
  CHART_TEAL_TINT,
} from '../../../shared/colors';
import { formatShortDay, formatCompactCurrency } from '../../../shared/utils/date';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// ─────────────────────────────────────────────────────────────────
// InfoLabel: jargon + tooltip
// ─────────────────────────────────────────────────────────────────
interface InfoLabelProps {
  label: string;
  tooltip: string;
}

const InfoLabel: React.FC<InfoLabelProps> = ({ label, tooltip }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
    <Typography variant='caption' fontWeight={600} color='text.secondary'>
      {label}
    </Typography>
    <Tooltip title={tooltip} placement='top' arrow>
      <InfoOutlined sx={{ fontSize: 14, color: TEXT_TERTIARY, cursor: 'help' }} />
    </Tooltip>
  </Box>
);

// ─────────────────────────────────────────────────────────────────
// TrendChip: directional indicator with semantic coloring
// ─────────────────────────────────────────────────────────────────
interface TrendChipProps {
  value: number | null;
  goodDirection: 'up' | 'down';
  suffix?: string;
}

const TrendChip: React.FC<TrendChipProps> = ({ value, goodDirection, suffix = '%' }) => {
  if (value === null) {
    return (
      <Chip
        label='n/a'
        size='small'
        variant='outlined'
        sx={{ borderColor: TEXT_TERTIARY, color: TEXT_SECONDARY, fontWeight: 600 }}
      />
    );
  }

  const isPositive = value >= 0;
  const isGood = (goodDirection === 'up' && isPositive) || (goodDirection === 'down' && !isPositive);
  const color = isGood ? METRIC_GOOD : METRIC_BAD;
  const bgcolor = isGood ? METRIC_GOOD_TINT : METRIC_BAD_TINT;
  const arrow = isPositive ? '▲' : '▼';

  return (
    <Chip
      label={`${arrow} ${Math.abs(value).toFixed(1)}${suffix}`}
      size='small'
      sx={{
        backgroundColor: bgcolor,
        color,
        fontWeight: 600,
        border: 'none',
      }}
    />
  );
};

// ─────────────────────────────────────────────────────────────────
// HeroKpi: large, prominent card for key metrics
// ─────────────────────────────────────────────────────────────────
interface HeroKpiProps {
  label: string | React.ReactNode;
  value: string | number;
  subtext?: string;
  trend?: React.ReactNode;
  tooltip?: string;
  valueColor?: string;
}

const HeroKpi: React.FC<HeroKpiProps> = ({ label, value, subtext, trend, tooltip, valueColor }) => {
  const content = (
    <motion.div variants={itemVariants}>
      <Card
        elevation={0}
        sx={{
          border: `1px solid ${BORDER_LIGHT}`,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <CardContent>
          {typeof label === 'string' ? (
            <Typography variant='caption' fontWeight={600} color='text.secondary' sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>
              {label}
            </Typography>
          ) : (
            <Box sx={{ mb: 1 }}>{label}</Box>
          )}
          <Typography variant='h4' fontWeight={800} sx={{ color: valueColor ?? PRIMARY_DEEP, mb: subtext || trend ? 1 : 0 }}>
            {value}
          </Typography>
          {subtext && (
            <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: trend ? 0.5 : 0, lineHeight: 1.4 }}>
              {subtext}
            </Typography>
          )}
          {trend && <Box sx={{ mt: 0.5 }}>{trend}</Box>}
        </CardContent>
      </Card>
    </motion.div>
  );

  if (tooltip) {
    return <Tooltip title={tooltip}>{content}</Tooltip>;
  }
  return content;
};

// ─────────────────────────────────────────────────────────────────
// Section: titled wrapper with description
// ─────────────────────────────────────────────────────────────────
interface SectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, description, children }) => (
  <motion.div variants={itemVariants}>
    <Box>
      <Typography variant='h6' fontWeight={800} sx={{ mb: 0.5, color: PRIMARY_MAIN }}>
        {title}
      </Typography>
      {description && (
        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 2 }}>
          {description}
        </Typography>
      )}
      {children}
    </Box>
  </motion.div>
);

const GrowthDashboard: React.FC = () => {
  const { data, isLoading, error } = useGrowthAnalytics();
  const [fraudOpen, setFraudOpen] = useState(false);

  if (isLoading) {
    return (
      <Stack spacing={3}>
        <Skeleton variant='rectangular' height={200} sx={{ borderRadius: 2 }} />
        <Skeleton variant='rectangular' height={300} sx={{ borderRadius: 2 }} />
        <Skeleton variant='rectangular' height={300} sx={{ borderRadius: 2 }} />
      </Stack>
    );
  }

  if (error || !data) {
    return (
      <Alert severity='error'>
        Failed to load growth analytics. Please try again later.
      </Alert>
    );
  }

  // Revenue trend chart data
  const revenueTrendData = (data.revenue.trend || []).map((item) => ({
    ...item,
    drawDate: formatShortDay(item.draw_date),
  }));

  // Acquisition sources for chart
  const acquisitionData = (data.acquisition.by_source || []).map((item) => ({
    name: item.source,
    value: item.count,
    pct: item.pct,
  }));

  // Top states/cities
  const topStates = (data.geo.by_state || []).slice(0, 8);
  const topCities = (data.geo.by_city || []).slice(0, 8);

  // Helper: format locale number
  const fmt = (n: number) => n.toLocaleString();

  // Helper: low-data muting for retention
  const isLowDataRetention = (eligible: number) => eligible < 20;

  // Helper: low-data muting for churn
  const isLowDataChurn = () => (data.businessRetention.active_paying + data.businessRetention.cancelled) < 20;

  // Churn is a LEVEL (share of paying businesses cancelled), so color it by health band rather
  // than a direction arrow: low is good (green), moderate is caution, high is bad.
  const churnColor = (pct: number) => (pct < 5 ? METRIC_GOOD : pct < 15 ? METRIC_WARN : METRIC_BAD);

  return (
    <motion.div variants={containerVariants} initial='hidden' animate='visible'>
      <Stack spacing={3}>
        {/* A. At a Glance - 6 KPIs */}
        <Section
          title='At a Glance'
          description='Your health at a glance. Everything below explains these six numbers.'
        >
          <Grid container spacing={2}>
            {/* 1. Monthly Revenue (MRR) */}
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
              <HeroKpi
                label={<InfoLabel label='Monthly Revenue' tooltip='The predictable money businesses pay you every month through subscriptions.' />}
                value={formatCompactCurrency(data.northStar.mrr)}
                subtext={`ARR ${formatCompactCurrency(data.revenue.arr)}`}
              />
            </Grid>

            {/* 2. Paying Businesses (with month-over-month growth folded in as the trend) */}
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
              <HeroKpi
                label={<InfoLabel label='Paying Businesses' tooltip='Businesses on an active paid subscription right now. The trend shows growth versus last month.' />}
                value={fmt(data.northStar.paying_businesses)}
                subtext={`+${data.northStar.new_paying_this_month} new this month`}
                trend={<TrendChip value={data.northStar.paying_business_growth_pct} goodDirection='up' />}
              />
            </Grid>

            {/* 3. Active Players (MAU) (with user growth folded in as the trend) */}
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
              <HeroKpi
                label={<InfoLabel label='Active Players' tooltip='Monthly Active Users. Players who entered at least one draw in the last 30 days. The trend shows growth versus last month.' />}
                value={fmt(data.northStar.mau)}
                subtext={`of ${fmt(data.northStar.total_users)} total`}
                trend={<TrendChip value={data.northStar.user_growth_pct} goodDirection='up' />}
              />
            </Grid>

            {/* 4. Business Churn - a LEVEL (share cancelled), not a change: colored by health, no arrow. */}
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
              <HeroKpi
                label={<InfoLabel label='Business Churn' tooltip='Share of paying businesses that have cancelled. Lower is better.' />}
                value={`${data.northStar.business_churn_pct.toFixed(1)}%`}
                valueColor={isLowDataChurn() ? METRIC_NEUTRAL : churnColor(data.northStar.business_churn_pct)}
                subtext={isLowDataChurn() ? 'Of paying businesses. Early data.' : 'Of paying businesses cancelled.'}
              />
            </Grid>

            {/* 5. Avg Tickets per Player */}
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
              <HeroKpi
                label={<InfoLabel label='Avg Tickets per Player' tooltip='Typical number of tickets an active player collects.' />}
                value={data.northStar.avg_entries_per_active_user.toFixed(1)}
                subtext='Per active player'
              />
            </Grid>

            {/* 6. Organic Players */}
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
              <HeroKpi
                label={<InfoLabel label='Organic Players' tooltip='Share of players who found you on their own, not via a paid or referred channel. Higher is cheaper growth.' />}
                value={`${data.northStar.pct_users_acquired_organically.toFixed(1)}%`}
                subtext='Found you on their own'
              />
            </Grid>
          </Grid>
        </Section>

        {/* B. Revenue Strip + Chart */}
        <Section
          title='Revenue'
          description='How much businesses pay you and how it is trending.'
        >
          <motion.div variants={itemVariants}>
            <Card elevation={0} sx={{ border: `1px solid ${BORDER_LIGHT}` }}>
              <CardContent>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {[
                    { label: 'MRR', value: formatCompactCurrency(data.revenue.mrr), tooltip: 'The predictable money businesses pay you every month through subscriptions.' },
                    { label: 'ARR', value: formatCompactCurrency(data.revenue.arr), tooltip: 'MRR multiplied by 12. Your yearly run rate if nothing changed.' },
                    { label: 'This Month', value: formatCompactCurrency(data.revenue.revenue_this_month), tooltip: 'Actual subscription money collected so far this calendar month.' },
                    { label: 'Founding (Mo.)', value: formatCompactCurrency(data.revenue.founding_this_month), tooltip: 'Revenue this month from discounted founding-member businesses.' },
                    { label: 'ARPB', value: formatCompactCurrency(data.revenue.arpb), tooltip: 'Average Revenue Per Business. Monthly revenue divided by paying businesses.' },
                    {
                      label: 'LTV Estimate',
                      value: data.revenue.ltv_estimate !== null ? formatCompactCurrency(data.revenue.ltv_estimate) : 'n/a',
                      tooltip: 'The rough total money one business pays you over its whole lifetime, before it cancels.',
                    },
                  ].map((item) => (
                    <Grid key={item.label} size={{ xs: 6, md: 4, lg: 2 }}>
                      <Box>
                        <Tooltip title={item.tooltip} placement='top' arrow>
                          <Typography variant='caption' fontWeight={600} color='text.secondary' sx={{ cursor: 'help', display: 'block', mb: 0.5 }}>
                            {item.label}
                          </Typography>
                        </Tooltip>
                        <Typography variant='h6' fontWeight={700} sx={{ color: PRIMARY_DEEP }}>
                          {item.value}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                {revenueTrendData.length > 0 && (
                  <Box sx={{ height: 250, width: '100%' }}>
                    <ResponsiveContainer width='100%' height='100%'>
                      <LineChart
                        data={revenueTrendData}
                        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray='3 3' stroke={CHART_GRID} />
                        <XAxis dataKey='drawDate' tick={{ fontSize: 11 }} />
                        <YAxis
                          yAxisId='left'
                          tick={{ fontSize: 11 }}
                          tickFormatter={formatCompactCurrency}
                        />
                        <YAxis
                          yAxisId='right'
                          orientation='right'
                          tick={{ fontSize: 11 }}
                        />
                        <RTooltip
                          formatter={(value, name) => {
                            if (name === 'Revenue (left)') {
                              return [formatCompactCurrency(Number(value)), 'Revenue'];
                            }
                            return [Number(value), 'Businesses'];
                          }}
                        />
                        <Legend />
                        <Line
                          yAxisId='left'
                          type='monotone'
                          dataKey='revenue'
                          stroke={CHART_BLUE}
                          strokeWidth={2}
                          dot={false}
                          name='Revenue (left)'
                        />
                        <Line
                          yAxisId='right'
                          type='monotone'
                          dataKey='businesses'
                          stroke={CHART_ORANGE}
                          strokeWidth={2}
                          dot={false}
                          name='Businesses (right)'
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Section>

        {/* C. Businesses: Growth + Retention */}
        <Section
          title='Businesses'
          description='Who is paying, who is joining, who is leaving.'
        >
          <Stack spacing={2}>
            {/* Growth sub-block */}
            <motion.div variants={itemVariants}>
              <Card elevation={0} sx={{ border: `1px solid ${BORDER_LIGHT}` }}>
                <CardContent>
                  <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 2, color: PRIMARY_MAIN }}>
                    Growth
                  </Typography>
                  <Grid container spacing={2}>
                    {[
                      { label: 'Total Businesses', value: fmt(data.businessGrowth.total_businesses), tooltip: 'Every business account, paying or not.' },
                      { label: 'Paying Businesses', value: fmt(data.businessGrowth.paying_businesses), tooltip: 'Businesses on an active paid subscription right now.' },
                      { label: 'Founding Members', value: fmt(data.businessGrowth.founding_members), tooltip: 'Early businesses on the discounted founding plan.' },
                      { label: 'New This Month', value: fmt(data.businessGrowth.new_businesses_this_month), tooltip: 'New business accounts created this calendar month.' },
                      { label: 'New Paying', value: fmt(data.businessGrowth.new_paying_this_month), tooltip: 'Businesses that started a paid subscription this month.' },
                      {
                        label: 'Growth %',
                        value:
                          data.businessGrowth.business_growth_pct !== null
                            ? `${data.businessGrowth.business_growth_pct.toFixed(1)}%`
                            : 'n/a',
                        tooltip: 'How much the total business count grew versus last month.',
                      },
                    ].map((item) => (
                      <Grid key={item.label} size={{ xs: 6, md: 4, lg: 2 }}>
                        <Box>
                          <Tooltip title={item.tooltip} placement='top' arrow>
                            <Typography variant='caption' fontWeight={600} color='text.secondary' sx={{ cursor: 'help', display: 'block', mb: 0.5 }}>
                              {item.label}
                            </Typography>
                          </Tooltip>
                          <Typography variant='h6' fontWeight={700} sx={{ color: PRIMARY_DEEP }}>
                            {item.value}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </motion.div>

            {/* Retention sub-block */}
            <motion.div variants={itemVariants}>
              <Card elevation={0} sx={{ border: `1px solid ${BORDER_LIGHT}` }}>
                <CardContent>
                  <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 1, color: PRIMARY_MAIN }}>
                    Retention
                  </Typography>
                  <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 2 }}>
                    Snapshot churn (cancelled / (cancelled + active)). Trend churn needs a subscription event log.
                  </Typography>
                  <Grid container spacing={2}>
                    {[
                      { label: 'Monthly Subscriptions', value: fmt(data.businessRetention.monthly_subs), tooltip: 'Businesses billed monthly.' },
                      { label: 'Yearly Subscriptions', value: fmt(data.businessRetention.yearly_subs), tooltip: 'Businesses billed annually.' },
                      { label: 'Active Paying', value: fmt(data.businessRetention.active_paying), tooltip: 'Businesses currently paying and in good standing.' },
                      { label: 'Pending Cancel', value: fmt(data.businessRetention.pending_cancel), tooltip: 'Businesses that asked to cancel but are still paid through period end.' },
                      { label: 'Cancelled', value: fmt(data.businessRetention.cancelled), tooltip: 'Businesses that fully stopped paying.' },
                      {
                        label: 'Churn %',
                        value: `${data.businessRetention.churn_pct.toFixed(1)}%`,
                        tooltip: 'Share of paying businesses that have cancelled. Lower is better.',
                      },
                      {
                        label: 'Active %',
                        value: `${data.businessRetention.active_paying_pct.toFixed(1)}%`,
                        tooltip: 'Share of businesses actively paying. Higher is better.',
                      },
                    ].map((item) => (
                      <Grid key={item.label} size={{ xs: 6, md: 4, lg: 2 }}>
                        <Box>
                          <Tooltip title={item.tooltip} placement='top' arrow>
                            <Typography variant='caption' fontWeight={600} color='text.secondary' sx={{ cursor: 'help', display: 'block', mb: 0.5 }}>
                              {item.label}
                            </Typography>
                          </Tooltip>
                          <Typography variant='h6' fontWeight={700} sx={{ color: PRIMARY_DEEP }}>
                            {item.value}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </motion.div>
          </Stack>
        </Section>

        {/* D. Players: Growth + Stickiness + Retention + Engagement */}
        <Section
          title='Players'
          description='How many people play, how sticky they are, and how deeply they engage.'
        >
          <Stack spacing={2}>
            {/* Growth sub-block */}
            <motion.div variants={itemVariants}>
              <Card elevation={0} sx={{ border: `1px solid ${BORDER_LIGHT}` }}>
                <CardContent>
                  <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 2, color: PRIMARY_MAIN }}>
                    Growth
                  </Typography>
                  <Grid container spacing={2}>
                    {[
                      { label: 'Total Players', value: fmt(data.userGrowth.total_users), tooltip: 'Every player account ever created.' },
                      { label: 'New This Month', value: fmt(data.userGrowth.new_this_month), tooltip: 'New player accounts created this calendar month.' },
                      { label: 'MAU', value: fmt(data.userGrowth.mau), tooltip: 'Monthly Active Users. Players who entered at least one draw in the last 30 days.' },
                      { label: 'WAU', value: fmt(data.userGrowth.wau), tooltip: 'Weekly Active Users. Same idea, last 7 days.' },
                      { label: 'DAU', value: fmt(data.userGrowth.dau), tooltip: 'Daily Active Users. Same idea, today.' },
                    ].map((item) => (
                      <Grid key={item.label} size={{ xs: 6, md: 4, lg: 2 }}>
                        <Box>
                          <Tooltip title={item.tooltip} placement='top' arrow>
                            <Typography variant='caption' fontWeight={600} color='text.secondary' sx={{ cursor: 'help', display: 'block', mb: 0.5 }}>
                              {item.label}
                            </Typography>
                          </Tooltip>
                          <Typography variant='h6' fontWeight={700} sx={{ color: PRIMARY_DEEP }}>
                            {item.value}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </motion.div>

            {/* Stickiness sub-block (low visual weight) */}
            <motion.div variants={itemVariants}>
              <Card elevation={0} sx={{ border: `1px solid ${BORDER_LIGHT}`, opacity: 0.85 }}>
                <CardContent>
                  <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 2, color: TEXT_SECONDARY }}>
                    Stickiness
                  </Typography>
                  <Stack spacing={1}>
                    {[
                      { label: 'MAU / Total', value: data.userGrowth.mau_over_total_pct.toFixed(1), tooltip: 'What share of all your players were active this month. Higher means a livelier base.' },
                      { label: 'WAU / MAU', value: data.userGrowth.wau_over_mau_pct.toFixed(1), tooltip: 'Stickiness. Of your monthly players, how many come back weekly.' },
                      { label: 'DAU / MAU', value: data.userGrowth.dau_over_mau_pct.toFixed(1), tooltip: 'Stickiness. Of your monthly players, how many show up daily.' },
                    ].map((item) => (
                      <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Tooltip title={item.tooltip} placement='top' arrow>
                          <Typography variant='caption' color='text.secondary' sx={{ cursor: 'help' }}>
                            {item.label}
                          </Typography>
                        </Tooltip>
                        <Typography variant='caption' fontWeight={600} sx={{ color: METRIC_NEUTRAL }}>
                          {item.value}%
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>

            {/* Retention sub-block */}
            <motion.div variants={itemVariants}>
              <Card elevation={0} sx={{ border: `1px solid ${BORDER_LIGHT}` }}>
                <CardContent>
                  <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 2, color: PRIMARY_MAIN }}>
                    Retention
                  </Typography>
                  <Stack spacing={2}>
                    {[
                      { label: 'Month 1', value: data.userRetention.m1_pct, eligible: data.userRetention.eligible_m1, tooltip: 'Of players who joined 1 month ago, the share still active today. Higher is better.' },
                      { label: 'Month 2', value: data.userRetention.m2_pct, eligible: data.userRetention.eligible_m2, tooltip: 'Of players who joined 2 months ago, the share still active today. Higher is better.' },
                      { label: 'Month 3', value: data.userRetention.m3_pct, eligible: data.userRetention.eligible_m3, tooltip: 'Of players who joined 3 months ago, the share still active today. Higher is better.' },
                    ].map((item) => {
                      const isLowData = isLowDataRetention(item.eligible);
                      const color = isLowData ? TEXT_SECONDARY : METRIC_GOOD;
                      return (
                        <Box key={item.label}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Tooltip title={item.tooltip} placement='top' arrow>
                              <Typography variant='caption' fontWeight={600} color='text.secondary' sx={{ cursor: 'help' }}>
                                {item.label} Retention
                              </Typography>
                            </Tooltip>
                            <Typography variant='caption' fontWeight={700} sx={{ color }}>
                              {item.value.toFixed(1)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant='determinate'
                            value={Math.min(Math.max(item.value, 0), 100)}
                            sx={{
                              height: 6,
                              borderRadius: 1,
                              backgroundColor: isLowData ? 'rgba(0,0,0,0.06)' : METRIC_GOOD_TINT,
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: isLowData ? TEXT_SECONDARY : METRIC_GOOD,
                              },
                            }}
                          />
                          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.5 }}>
                            Eligible: {fmt(item.eligible)}
                            {isLowData ? ' - early data' : ''}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>

            {/* Engagement sub-block (lowest visual weight) */}
            <motion.div variants={itemVariants}>
              <Card elevation={0} sx={{ border: `1px solid ${BORDER_LIGHT}`, opacity: 0.8 }}>
                <CardContent>
                  <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 2, color: TEXT_SECONDARY }}>
                    Engagement
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack spacing={1.5}>
                        {[
                          { label: 'Active Users', value: fmt(data.engagement.active_users), tooltip: 'Players who submitted at least one ticket in the window.' },
                          { label: 'Total Tickets', value: fmt(data.engagement.total_entries), tooltip: 'All tickets issued and activated.' },
                          { label: 'Avg Tickets/Player', value: data.engagement.avg_entries.toFixed(1), tooltip: 'Typical number of tickets a player collects.' },
                          { label: 'Median', value: data.engagement.median_entries.toFixed(1), tooltip: 'Median ignores a few super-users.' },
                          { label: 'Avg Businesses/Player', value: data.engagement.avg_businesses.toFixed(1), tooltip: 'How many different businesses a typical player engages with.' },
                        ].map((item) => (
                          <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Tooltip title={item.tooltip} placement='top' arrow>
                              <Typography variant='caption' color='text.secondary' sx={{ cursor: 'help' }}>
                                {item.label}
                              </Typography>
                            </Tooltip>
                            <Typography variant='caption' fontWeight={600} sx={{ color: TEXT_SECONDARY }}>
                              {item.value}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack spacing={1.5}>
                        {[
                          { pct: data.engagement.single_business_pct, label: 'Single Business Only', tooltip: 'Share of players who only ever engaged with one business.' },
                          { pct: data.engagement.multi_business_pct, label: 'Multi-Business Users', tooltip: 'Share of players active across two or more businesses. Higher shows network effect.', color: CHART_BLUE },
                          { pct: data.engagement.over_20_pct, label: 'Over 20 Entries', tooltip: 'Share of players who collected more than 20 tickets. Your power users.', color: CHART_GREEN },
                          { pct: data.engagement.at_30_pct, label: 'At 30 Entry Cap', tooltip: 'Share of players who hit the 30-ticket ceiling.' },
                          { pct: data.engagement.amoe_only_pct, label: 'AMOE Only', tooltip: 'Share of players who only used the weekly entry.' },
                        ].map((item) => (
                          <Box key={item.label}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Tooltip title={item.tooltip} placement='top' arrow>
                                <Typography variant='caption' color='text.secondary' sx={{ cursor: 'help' }}>
                                  {item.label}
                                </Typography>
                              </Tooltip>
                              <Typography variant='caption' fontWeight={600} sx={{ color: METRIC_NEUTRAL }}>
                                {item.pct.toFixed(1)}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant='determinate'
                              value={Math.min(Math.max(item.pct, 0), 100)}
                              sx={{
                                height: 4,
                                borderRadius: 1,
                                backgroundColor: item.color ? `${item.color}18` : 'rgba(0,0,0,0.06)',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: item.color || TEXT_SECONDARY,
                                },
                              }}
                            />
                          </Box>
                        ))}
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </motion.div>
          </Stack>
        </Section>

        {/* E. Where Players Come From */}
        {acquisitionData.length > 0 && (
          <Section
            title='Where Players Come From'
            description='Where your users came from. Organic is the cheapest growth.'
          >
            <motion.div variants={itemVariants}>
              <Card elevation={0} sx={{ border: `1px solid ${BORDER_LIGHT}` }}>
                <CardContent>
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant='subtitle2' fontWeight={700} sx={{ color: PRIMARY_DEEP }}>
                      Organic Users
                    </Typography>
                    <Typography variant='h6' fontWeight={800} sx={{ color: PRIMARY_MAIN }}>
                      {data.northStar.pct_users_acquired_organically.toFixed(1)}%
                    </Typography>
                  </Box>
                  <Box sx={{ height: 300, width: '100%' }}>
                    <ResponsiveContainer width='100%' height='100%'>
                      <BarChart
                        data={acquisitionData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray='3 3' stroke={CHART_GRID} />
                        <XAxis
                          dataKey='name'
                          tick={{ fontSize: 11 }}
                          angle={-45}
                          textAnchor='end'
                          height={80}
                        />
                        <YAxis tick={{ fontSize: 11 }} />
                        <RTooltip
                          formatter={(value) => [
                            Number(value).toLocaleString(),
                            'Count',
                          ]}
                        />
                        <Bar
                          dataKey='value'
                          fill={CHART_BLUE}
                          name='Players'
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Section>
        )}

        {/* F. Geography - lower visual weight */}
        {(topStates.length > 0 || topCities.length > 0) && (
          <Section title='Geography'>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <motion.div variants={itemVariants}>
                  <Card elevation={0} sx={{ border: `1px solid ${BORDER_LIGHT}`, opacity: 0.85 }}>
                    <CardContent>
                      <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 2, color: TEXT_SECONDARY }}>
                        Top States
                      </Typography>
                      {topStates.length > 0 ? (
                        <Stack spacing={1.5}>
                          {topStates.map((state, idx) => (
                            <Box key={state.state}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant='caption' fontWeight={700} sx={{ minWidth: 20, color: PRIMARY_MAIN }}>
                                    {idx + 1}.
                                  </Typography>
                                  <Typography variant='body2' fontWeight={600}>
                                    {state.state}
                                  </Typography>
                                </Box>
                                <Typography variant='caption' color='text.secondary'>
                                  {fmt(state.count)}
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant='determinate'
                                value={Math.min(Math.max((state.count / topStates[0].count) * 100, 0), 100)}
                                sx={{
                                  height: 4,
                                  borderRadius: 1,
                                  backgroundColor: CHART_BLUE_TINT,
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: CHART_BLUE,
                                  },
                                }}
                              />
                            </Box>
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant='body2' color='text.secondary'>
                          No data yet.
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <motion.div variants={itemVariants}>
                  <Card elevation={0} sx={{ border: `1px solid ${BORDER_LIGHT}`, opacity: 0.85 }}>
                    <CardContent>
                      <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 2, color: TEXT_SECONDARY }}>
                        Top Cities
                      </Typography>
                      {topCities.length > 0 ? (
                        <Stack spacing={1.5}>
                          {topCities.map((city, idx) => (
                            <Box key={city.city}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant='caption' fontWeight={700} sx={{ minWidth: 20, color: PRIMARY_MAIN }}>
                                    {idx + 1}.
                                  </Typography>
                                  <Typography variant='body2' fontWeight={600}>
                                    {city.city}
                                  </Typography>
                                </Box>
                                <Typography variant='caption' color='text.secondary'>
                                  {fmt(city.count)}
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant='determinate'
                                value={Math.min(Math.max((city.count / topCities[0].count) * 100, 0), 100)}
                                sx={{
                                  height: 4,
                                  borderRadius: 1,
                                  backgroundColor: CHART_TEAL_TINT,
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: CHART_TEAL,
                                  },
                                }}
                              />
                            </Box>
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant='body2' color='text.secondary'>
                          No data yet.
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>
          </Section>
        )}

        {/* G. Trust & Safety - Accordion, collapsed by default, neutral coloring */}
        <motion.div variants={itemVariants}>
          <Accordion
            expanded={fraudOpen}
            onChange={() => setFraudOpen(!fraudOpen)}
            elevation={0}
            sx={{
              border: `1px solid ${BORDER_LIGHT}`,
              '&.Mui-expanded': {
                margin: 0,
              },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6' fontWeight={800} sx={{ color: METRIC_NEUTRAL }}>
                Trust & Safety
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Box sx={{ width: '100%' }}>
                <Grid container spacing={2}>
                  {[
                    {
                      label: 'Quarantined Entries',
                      value: data.fraud.quarantined_entries,
                      tooltip: 'Entries held for review by the anti-fraud system.',
                      concern: true,
                    },
                    {
                      label: 'Rejected Winners',
                      value: data.fraud.rejected_winners,
                      tooltip: 'Drawn winners disqualified during verification.',
                      concern: true,
                    },
                    {
                      label: 'Suspended Users',
                      value: data.fraud.suspended_users,
                      tooltip: 'Accounts blocked for abuse.',
                      concern: true,
                    },
                    {
                      label: 'High Risk Users',
                      value: data.fraud.high_risk_users,
                      tooltip: 'Accounts the risk engine flags as suspicious.',
                      concern: true,
                    },
                    {
                      label: 'Threshold Probes',
                      value: data.fraud.threshold_probes,
                      tooltip: 'Suspected attempts to game the receipt-amount threshold.',
                      concern: true,
                    },
                    {
                      label: 'Verifications (Mo.)',
                      value: data.fraud.verifications_this_month,
                      tooltip: 'Winner verifications completed this month.',
                      concern: false,
                    },
                    {
                      label: 'Entries (Mo.)',
                      value: data.fraud.entries_this_month,
                      tooltip: 'Total tickets issued this month.',
                      concern: false,
                    },
                  ].map((item) => {
                    return (
                      <Grid key={item.label} size={{ xs: 6, md: 4, lg: 2 }}>
                        <Box>
                          <Tooltip title={item.tooltip} placement='top' arrow>
                            <Typography variant='caption' fontWeight={600} color='text.secondary' sx={{ cursor: 'help', display: 'block', mb: 0.5 }}>
                              {item.label}
                            </Typography>
                          </Tooltip>
                          <Typography variant='h6' fontWeight={700} sx={{ color: item.concern && item.value > 0 ? METRIC_WARN : METRIC_NEUTRAL }}>
                            {item.value}
                          </Typography>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>

                {data.fraud.quarantined_entries === 0
                  && data.fraud.rejected_winners === 0
                  && data.fraud.suspended_users === 0
                  && data.fraud.high_risk_users === 0
                  && data.fraud.threshold_probes === 0 && (
                  <Box sx={{ mt: 2, p: 1.5, backgroundColor: METRIC_GOOD_TINT, borderRadius: 1 }}>
                    <Typography variant='body2' sx={{ color: METRIC_GOOD, fontWeight: 600 }}>
                      All clear - no flags this period.
                    </Typography>
                  </Box>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        </motion.div>
      </Stack>
    </motion.div>
  );
};

export default GrowthDashboard;
