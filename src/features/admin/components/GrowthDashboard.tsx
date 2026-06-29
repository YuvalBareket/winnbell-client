import React from 'react';
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
import { useGrowthAnalytics } from '../hooks/useAdmin';
import {
  PRIMARY_MAIN,
  ACCENT_GOLD,
  STATUS_ACTIVATED_TEXT,
  TEXT_SECONDARY,
} from '../../../shared/colors';

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

interface NorthStarTileProps {
  label: string;
  value: string | number;
  isNull?: boolean;
  subtext?: string;
  trend?: number | null;
}

const NorthStarTile: React.FC<NorthStarTileProps> = ({
  label,
  value,
  isNull,
  subtext,
  trend,
}) => {
  const trendColor = trend == null ? TEXT_SECONDARY : trend >= 0 ? '#2e7d32' : '#c62828';
  const trendSign = trend == null ? '' : trend > 0 ? '+' : '';

  return (
    <motion.div variants={itemVariants}>
      <Card
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <CardContent>
          <Typography variant='caption' color='text.secondary' sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
            {label}
          </Typography>
          <Box sx={{ mt: 1, mb: subtext || trend !== undefined ? 1 : 0 }}>
            {isNull ? (
              <Typography variant='h6' color='text.secondary'>
                n/a
              </Typography>
            ) : (
              <Typography
                variant='h5'
                fontWeight={800}
                sx={{
                  background: `linear-gradient(135deg, ${PRIMARY_MAIN} 0%, #0f3a6b 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {value}
              </Typography>
            )}
          </Box>
          {subtext && (
            <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: trend !== undefined ? 0.5 : 0 }}>
              {subtext}
            </Typography>
          )}
          {trend !== undefined && trend != null && (
            <Typography variant='caption' sx={{ color: trendColor, fontWeight: 600 }}>
              {trendSign}{trend.toFixed(1)}%
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const GrowthDashboard: React.FC = () => {
  const { data, isLoading, error } = useGrowthAnalytics();

  if (isLoading) {
    return (
      <Stack spacing={3}>
        <Skeleton variant='rectangular' height={120} sx={{ borderRadius: 2 }} />
        <Skeleton variant='rectangular' height={400} sx={{ borderRadius: 2 }} />
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

  // Format currency
  const formatCurrency = (val: number) => {
    const absVal = Math.abs(val);
    if (absVal >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (absVal >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
    return `$${val.toLocaleString()}`;
  };

  // Revenue trend chart data
  const revenueTrendData = (data.revenue.trend || []).map((item) => ({
    ...item,
    drawDate: new Date(item.draw_date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }),
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

  return (
    <motion.div variants={containerVariants} initial='hidden' animate='visible'>
      <Stack spacing={3}>
        {/* North Star Band */}
        <motion.div variants={itemVariants}>
          <Typography variant='h6' fontWeight={800} sx={{ mb: 2, color: PRIMARY_MAIN }}>
            North Star Metrics
          </Typography>
        </motion.div>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
            <NorthStarTile
              label='Paying Businesses'
              value={data.northStar.paying_businesses}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
            <NorthStarTile
              label='New Paying (Mo.)'
              value={data.northStar.new_paying_this_month}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
            <NorthStarTile
              label='Total Users'
              value={data.northStar.total_users.toLocaleString()}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
            <NorthStarTile
              label='MAU'
              value={data.northStar.mau.toLocaleString()}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
            <NorthStarTile
              label='MRR'
              value={formatCurrency(data.northStar.mrr)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
            <NorthStarTile
              label='Business Churn'
              value={data.northStar.business_churn_pct.toFixed(1)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
            <NorthStarTile
              label='User Growth'
              value={data.northStar.user_growth_pct?.toFixed(1) || 'n/a'}
              isNull={data.northStar.user_growth_pct === null}
              trend={data.northStar.user_growth_pct}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
            <NorthStarTile
              label='Paying Biz Growth'
              value={data.northStar.paying_business_growth_pct?.toFixed(1) || 'n/a'}
              isNull={data.northStar.paying_business_growth_pct === null}
              trend={data.northStar.paying_business_growth_pct}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
            <NorthStarTile
              label='Avg Entries/User'
              value={data.northStar.avg_entries_per_active_user.toFixed(1)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
            <NorthStarTile
              label='Organic Users'
              value={data.northStar.pct_users_acquired_organically.toFixed(1)}
            />
          </Grid>
        </Grid>

        {/* Business Growth Section */}
        <motion.div variants={itemVariants}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant='subtitle1' fontWeight={700} sx={{ mb: 2 }}>
                Business Growth
              </Typography>
              <Grid container spacing={2}>
                {[
                  {
                    label: 'Total Businesses',
                    value: data.businessGrowth.total_businesses,
                  },
                  {
                    label: 'Paying Businesses',
                    value: data.businessGrowth.paying_businesses,
                  },
                  {
                    label: 'Founding Members',
                    value: data.businessGrowth.founding_members,
                  },
                  {
                    label: 'New This Month',
                    value: data.businessGrowth.new_businesses_this_month,
                  },
                  {
                    label: 'New Paying (Mo.)',
                    value: data.businessGrowth.new_paying_this_month,
                  },
                  {
                    label: 'Growth %',
                    value:
                      data.businessGrowth.business_growth_pct?.toFixed(1) || 'n/a',
                    isPercent: true,
                  },
                ].map((item) => (
                  <Grid key={item.label} size={{ xs: 6, md: 4, lg: 2 }}>
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        {item.label}
                      </Typography>
                      <Typography variant='h6' fontWeight={700}>
                        {item.value}
                        {(item as any).isPercent ? '%' : ''}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </motion.div>

        {/* User Growth & Retention */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6, lg: 6 }}>
            <motion.div variants={itemVariants}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant='subtitle1' fontWeight={700} sx={{ mb: 2 }}>
                    User Growth
                  </Typography>
                  <Stack spacing={2}>
                    {[
                      {
                        label: 'Total Users',
                        value: data.userGrowth.total_users.toLocaleString(),
                      },
                      {
                        label: 'New This Month',
                        value: data.userGrowth.new_this_month,
                      },
                      {
                        label: 'MAU',
                        value: data.userGrowth.mau.toLocaleString(),
                      },
                      {
                        label: 'WAU',
                        value: data.userGrowth.wau.toLocaleString(),
                      },
                      {
                        label: 'DAU',
                        value: data.userGrowth.dau.toLocaleString(),
                      },
                    ].map((item) => (
                      <Box
                        key={item.label}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography variant='body2' color='text.secondary'>
                          {item.label}
                        </Typography>
                        <Typography variant='body2' fontWeight={700}>
                          {item.value}
                        </Typography>
                      </Box>
                    ))}
                    <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Typography variant='caption' color='text.secondary' sx={{ mb: 1, display: 'block' }}>
                        Activity Ratios
                      </Typography>
                      {[
                        {
                          label: 'MAU / Total',
                          value: data.userGrowth.mau_over_total_pct.toFixed(1),
                        },
                        {
                          label: 'WAU / MAU',
                          value: data.userGrowth.wau_over_mau_pct.toFixed(1),
                        },
                        {
                          label: 'DAU / MAU',
                          value: data.userGrowth.dau_over_mau_pct.toFixed(1),
                        },
                      ].map((item) => (
                        <Box
                          key={item.label}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mb: 0.5,
                          }}
                        >
                          <Typography variant='caption' color='text.secondary'>
                            {item.label}
                          </Typography>
                          <Typography
                            variant='caption'
                            fontWeight={600}
                            sx={{ color: PRIMARY_MAIN }}
                          >
                            {item.value}%
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div variants={itemVariants}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant='subtitle1' fontWeight={700} sx={{ mb: 2 }}>
                    User Retention
                  </Typography>
                  <Stack spacing={2}>
                    {[
                      {
                        label: 'Month 1 Retention',
                        value: data.userRetention.m1_pct.toFixed(1),
                        eligible: data.userRetention.eligible_m1,
                      },
                      {
                        label: 'Month 2 Retention',
                        value: data.userRetention.m2_pct.toFixed(1),
                        eligible: data.userRetention.eligible_m2,
                      },
                      {
                        label: 'Month 3 Retention',
                        value: data.userRetention.m3_pct.toFixed(1),
                        eligible: data.userRetention.eligible_m3,
                      },
                    ].map((item) => (
                      <Box key={item.label}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mb: 0.5,
                          }}
                        >
                          <Typography variant='body2' color='text.secondary'>
                            {item.label}
                          </Typography>
                          <Typography variant='body2' fontWeight={700}>
                            {item.value}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant='determinate'
                          value={parseFloat(item.value)}
                          sx={{
                            height: 6,
                            borderRadius: 1,
                            backgroundColor: '#e3f2fd',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: PRIMARY_MAIN,
                            },
                          }}
                        />
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          sx={{ mt: 0.5, display: 'block' }}
                        >
                          Eligible: {item.eligible.toLocaleString()}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Business Retention */}
        <motion.div variants={itemVariants}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant='subtitle1' fontWeight={700} sx={{ mb: 2 }}>
                Business Retention
              </Typography>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ display: 'block', mb: 2 }}
              >
                Snapshot churn (cancelled / (cancelled + active)). Trend churn needs a subscription event log.
              </Typography>
              <Grid container spacing={2}>
                {[
                  {
                    label: 'Monthly Subscriptions',
                    value: data.businessRetention.monthly_subs,
                  },
                  {
                    label: 'Yearly Subscriptions',
                    value: data.businessRetention.yearly_subs,
                  },
                  {
                    label: 'Active Paying',
                    value: data.businessRetention.active_paying,
                  },
                  {
                    label: 'Cancelled',
                    value: data.businessRetention.cancelled,
                  },
                  {
                    label: 'Pending Cancel',
                    value: data.businessRetention.pending_cancel,
                  },
                  {
                    label: 'Churn %',
                    value: data.businessRetention.churn_pct.toFixed(1),
                    isPercent: true,
                  },
                  {
                    label: 'Active %',
                    value: data.businessRetention.active_paying_pct.toFixed(1),
                    isPercent: true,
                  },
                ].map((item) => (
                  <Grid key={item.label} size={{ xs: 6, md: 4, lg: 2 }}>
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        {item.label}
                      </Typography>
                      <Typography variant='h6' fontWeight={700}>
                        {item.value}
                        {item.isPercent ? '%' : ''}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </motion.div>

        {/* Engagement */}
        <motion.div variants={itemVariants}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant='subtitle1' fontWeight={700} sx={{ mb: 2 }}>
                Engagement & Activity
              </Typography>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ display: 'block', mb: 2 }}
              >
                Active = a user who submitted at least one entry in the window.
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={1.5}>
                    {[
                      {
                        label: 'Active Users',
                        value: data.engagement.active_users.toLocaleString(),
                      },
                      {
                        label: 'Total Entries',
                        value: data.engagement.total_entries.toLocaleString(),
                      },
                      {
                        label: 'Avg Entries/User',
                        value: data.engagement.avg_entries.toFixed(1),
                      },
                      {
                        label: 'Median Entries/User',
                        value: data.engagement.median_entries.toFixed(1),
                      },
                      {
                        label: 'Avg Businesses/User',
                        value: data.engagement.avg_businesses.toFixed(1),
                      },
                    ].map((item) => (
                      <Box
                        key={item.label}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography variant='body2' color='text.secondary'>
                          {item.label}
                        </Typography>
                        <Typography variant='body2' fontWeight={700}>
                          {item.value}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={1.5}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant='body2' color='text.secondary'>
                          Single Business Only
                        </Typography>
                        <Typography variant='body2' fontWeight={700}>
                          {data.engagement.single_business_pct.toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant='determinate'
                        value={data.engagement.single_business_pct}
                        sx={{
                          height: 6,
                          borderRadius: 1,
                          backgroundColor: '#f3e5f5',
                          '& .MuiLinearProgress-bar': { backgroundColor: '#7b1fa2' },
                        }}
                      />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant='body2' color='text.secondary'>
                          Multi-Business Users
                        </Typography>
                        <Typography variant='body2' fontWeight={700}>
                          {data.engagement.multi_business_pct.toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant='determinate'
                        value={data.engagement.multi_business_pct}
                        sx={{
                          height: 6,
                          borderRadius: 1,
                          backgroundColor: '#e3f2fd',
                          '& .MuiLinearProgress-bar': { backgroundColor: PRIMARY_MAIN },
                        }}
                      />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant='body2' color='text.secondary'>
                          Over 20 Entries
                        </Typography>
                        <Typography variant='body2' fontWeight={700}>
                          {data.engagement.over_20_pct.toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant='determinate'
                        value={data.engagement.over_20_pct}
                        sx={{
                          height: 6,
                          borderRadius: 1,
                          backgroundColor: '#e8f5e9',
                          '& .MuiLinearProgress-bar': { backgroundColor: STATUS_ACTIVATED_TEXT },
                        }}
                      />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant='body2' color='text.secondary'>
                          At 30 Entry Cap
                        </Typography>
                        <Typography variant='body2' fontWeight={700}>
                          {data.engagement.at_30_pct.toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant='determinate'
                        value={data.engagement.at_30_pct}
                        sx={{
                          height: 6,
                          borderRadius: 1,
                          backgroundColor: '#fff3e0',
                          '& .MuiLinearProgress-bar': { backgroundColor: '#e65100' },
                        }}
                      />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant='body2' color='text.secondary'>
                          AMOE Only
                        </Typography>
                        <Typography variant='body2' fontWeight={700}>
                          {data.engagement.amoe_only_pct.toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant='determinate'
                        value={data.engagement.amoe_only_pct}
                        sx={{
                          height: 6,
                          borderRadius: 1,
                          backgroundColor: '#f3e5f5',
                          '& .MuiLinearProgress-bar': { backgroundColor: '#7b1fa2' },
                        }}
                      />
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue Section */}
        <motion.div variants={itemVariants}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant='subtitle1' fontWeight={700} sx={{ mb: 2 }}>
                Revenue
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  { label: 'MRR', value: formatCurrency(data.revenue.mrr) },
                  { label: 'ARR', value: formatCurrency(data.revenue.arr) },
                  { label: 'This Month', value: formatCurrency(data.revenue.revenue_this_month) },
                  { label: 'Founding (Mo.)', value: formatCurrency(data.revenue.founding_this_month) },
                  { label: 'ARPB', value: formatCurrency(data.revenue.arpb) },
                  {
                    label: 'LTV Estimate',
                    value:
                      data.revenue.ltv_estimate !== null
                        ? formatCurrency(data.revenue.ltv_estimate)
                        : 'n/a',
                  },
                ].map((item) => (
                  <Grid key={item.label} size={{ xs: 6, md: 4, lg: 2 }}>
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        {item.label}
                      </Typography>
                      <Typography variant='h6' fontWeight={700}>
                        {item.value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              {data.revenue.ltv_estimate !== null && (
                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 2 }}>
                  Estimate (ARPB / churn).
                </Typography>
              )}
              {revenueTrendData.length > 0 && (
                <Box sx={{ height: 250, width: '100%' }}>
                  <ResponsiveContainer width='100%' height='100%'>
                    <LineChart
                      data={revenueTrendData}
                      margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                      <XAxis
                        dataKey='drawDate'
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        yAxisId='left'
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                      />
                      <YAxis
                        yAxisId='right'
                        orientation='right'
                        tick={{ fontSize: 11 }}
                      />
                      <RTooltip
                        formatter={(value, name) => {
                          if (name === 'Revenue (left)') {
                            return [formatCurrency(Number(value)), 'Revenue'];
                          }
                          return [Number(value), 'Businesses'];
                        }}
                      />
                      <Legend />
                      <Line
                        yAxisId='left'
                        type='monotone'
                        dataKey='revenue'
                        stroke={PRIMARY_MAIN}
                        strokeWidth={2}
                        dot={false}
                        name='Revenue (left)'
                      />
                      <Line
                        yAxisId='right'
                        type='monotone'
                        dataKey='businesses'
                        stroke={ACCENT_GOLD}
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

        {/* Fraud & Integrity */}
        <motion.div variants={itemVariants}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant='subtitle1' fontWeight={700} sx={{ mb: 2 }}>
                Fraud & Integrity
              </Typography>
              <Grid container spacing={2}>
                {[
                  {
                    label: 'Quarantined Entries',
                    value: data.fraud.quarantined_entries,
                  },
                  {
                    label: 'Rejected Winners',
                    value: data.fraud.rejected_winners,
                  },
                  {
                    label: 'Suspended Users',
                    value: data.fraud.suspended_users,
                  },
                  {
                    label: 'High Risk Users',
                    value: data.fraud.high_risk_users,
                  },
                  {
                    label: 'Threshold Probes',
                    value: data.fraud.threshold_probes,
                  },
                  {
                    label: 'Verifications (Mo.)',
                    value: data.fraud.verifications_this_month,
                  },
                  {
                    label: 'Entries (Mo.)',
                    value: data.fraud.entries_this_month,
                  },
                ].map((item) => (
                  <Grid key={item.label} size={{ xs: 6, md: 4, lg: 2 }}>
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        {item.label}
                      </Typography>
                      <Typography variant='h6' fontWeight={700}>
                        {item.value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </motion.div>

        {/* Geography */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6, lg: 6 }}>
            <motion.div variants={itemVariants}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant='subtitle1' fontWeight={700} sx={{ mb: 2 }}>
                    Top States
                  </Typography>
                  {topStates.length > 0 ? (
                    <Stack spacing={1.5}>
                      {topStates.map((state, idx) => (
                        <Box key={state.state}>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              mb: 0.5,
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography
                                variant='caption'
                                fontWeight={700}
                                sx={{
                                  minWidth: 20,
                                  color: PRIMARY_MAIN,
                                }}
                              >
                                {idx + 1}.
                              </Typography>
                              <Typography variant='body2' fontWeight={600}>
                                {state.state}
                              </Typography>
                            </Box>
                            <Typography variant='body2' color='text.secondary'>
                              {state.count.toLocaleString()}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant='determinate'
                            value={(state.count / topStates[0].count) * 100}
                            sx={{
                              height: 4,
                              borderRadius: 1,
                              backgroundColor: '#e3f2fd',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: PRIMARY_MAIN,
                              },
                            }}
                          />
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant='body2' color='text.secondary'>
                      No geographic data available.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div variants={itemVariants}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant='subtitle1' fontWeight={700} sx={{ mb: 2 }}>
                    Top Cities
                  </Typography>
                  {topCities.length > 0 ? (
                    <Stack spacing={1.5}>
                      {topCities.map((city, idx) => (
                        <Box key={city.city}>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              mb: 0.5,
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography
                                variant='caption'
                                fontWeight={700}
                                sx={{
                                  minWidth: 20,
                                  color: PRIMARY_MAIN,
                                }}
                              >
                                {idx + 1}.
                              </Typography>
                              <Typography variant='body2' fontWeight={600}>
                                {city.city}
                              </Typography>
                            </Box>
                            <Typography variant='body2' color='text.secondary'>
                              {city.count.toLocaleString()}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant='determinate'
                            value={(city.count / topCities[0].count) * 100}
                            sx={{
                              height: 4,
                              borderRadius: 1,
                              backgroundColor: '#e3f2fd',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: PRIMARY_MAIN,
                              },
                            }}
                          />
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant='body2' color='text.secondary'>
                      No geographic data available.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Acquisition Sources */}
        {acquisitionData.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography variant='subtitle1' fontWeight={700} sx={{ mb: 2 }}>
                  Acquisition by Source
                </Typography>
                <Box sx={{ height: 300, width: '100%' }}>
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart
                      data={acquisitionData}
                      margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
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
                        fill={PRIMARY_MAIN}
                        name='Users'
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </Stack>
    </motion.div>
  );
};

export default GrowthDashboard;
