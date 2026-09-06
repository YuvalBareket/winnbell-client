import { useState } from 'react';
import { Box, Chip, Grid, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import {
  PersonAddAlt1Outlined, ReceiptLongOutlined, TaskAltOutlined, TimerOutlined, SmsOutlined,
  FilterAltOutlined, BlockOutlined, ShowChartOutlined, CloudOffOutlined, QrCode2Outlined,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip,
} from 'recharts';
import { useFunnelAnalytics } from '../../hooks/useAdmin';
import type { FunnelAnalytics } from '../../api/adminApi';
import { AdminCard, AdminCardSkeleton, SectionHeader, StatCard, StatCardSkeleton } from './adminUi';
import { staggerContainer, riseIn } from '../../../../shared/motion';
import {
  ALPHA_PRIMARY_10, PRIMARY_MAIN, TEXT_HEADING, TEXT_SECONDARY, TEXT_TERTIARY,
  CHART_BLUE, CHART_BLUE_TINT, CHART_GREEN, CHART_GREEN_TINT, CHART_GRID,
  CHART_PURPLE, CHART_PURPLE_TINT, CHART_TEAL, CHART_TEAL_TINT,
  METRIC_BAD, METRIC_BAD_TINT, BG_SUBTLE, BORDER_LIGHT,
} from '../../../../shared/colors';

// The two funnels, in step order. Counts come live from raw events (includes today).
const REG_STEPS: ReadonlyArray<readonly [key: string, label: string]> = [
  // Flyer-QR entry point. Only flyer scanners hit this step (direct and invite traffic
  // skips it), so later steps can legitimately exceed 100% of it.
  ['scan_landing_viewed', 'Scanned a flyer'],
  ['registration_page_viewed', 'Viewed sign-up'],
  ['registration_started', 'Started the form'],
  ['registration_submitted', 'Submitted the form'],
  ['account_created', 'Account created'],
  ['profile_setup_completed', 'Profile completed'],
];
const SUB_STEPS: ReadonlyArray<readonly [key: string, label: string]> = [
  ['submit_page_viewed', 'Opened submit page'],
  ['submit_business_selected', 'Picked a business'],
  ['submit_attempted', 'Submitted an entry'],
  ['submission_accepted', 'Entry accepted'],
];

// Admin-facing labels for the structured rejection reasons.
const REASON_LABELS: Record<string, string> = {
  below_threshold: 'Amount below minimum',
  receipt_too_old: 'Receipt older than 7 days',
  date_outside_campaign: 'Date outside campaign',
  duplicate_receipt: 'Duplicate receipt',
  receipt_contested: 'Receipt contested',
  image_required: 'Photo required',
  daily_limit_high_risk: 'Daily limit (high risk)',
  sequential_pattern: 'Suspicious ID pattern',
  location_cap_reached: 'Location out of entries',
  user_draw_cap_reached: 'User entry cap reached',
  weekly_limit_reached: 'Weekly limit reached',
  email_unverified: 'Email not verified',
  phone_unverified: 'Phone not verified',
  no_active_campaign: 'No active campaign',
  invalid_code: 'Invalid code',
  out_of_region: 'Outside allowed region',
  technical_error: 'Technical error',
  unknown_error: 'Other',
};

const fmtSeconds = (s: number | null | undefined): string => {
  if (s == null || !isFinite(s)) return '-';
  if (s < 60) return `${Math.round(s)}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${Math.round(s - m * 60)}s`;
};

const pct = (num: number, den: number): string => (den > 0 ? `${Math.round((num / den) * 100)}%` : '-');

/** One funnel as horizontal step bars: width = share of the first step, with the
 *  drop-off percentage annotated per step. */
const FunnelSteps = ({ steps, totals, color, tint }: {
  steps: ReadonlyArray<readonly [string, string]>;
  totals: Record<string, number>;
  color: string;
  tint: string;
}) => {
  const first = totals[steps[0][0]] ?? 0;
  return (
    <Stack spacing={1.25}>
      {steps.map(([key, label], i) => {
        const n = totals[key] ?? 0;
        // Clamped at 100: a step can outgrow the first one (direct sign-ups skip the
        // flyer-scan step), and an unclamped width would slide the fill off the track.
        const width = first > 0 ? Math.min(100, Math.max((n / first) * 100, n > 0 ? 4 : 0)) : 0;
        const prev = i > 0 ? (totals[steps[i - 1][0]] ?? 0) : n;
        return (
          <Box key={key}>
            <Stack direction='row' justifyContent='space-between' alignItems='baseline' sx={{ mb: 0.5 }}>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: TEXT_SECONDARY }}>{label}</Typography>
              <Typography sx={{ fontSize: '12.5px', fontWeight: 700, color: TEXT_HEADING }}>
                {n.toLocaleString()}
                {i > 0 && (
                  <Typography component='span' sx={{ fontSize: '11.5px', fontWeight: 600, color: TEXT_TERTIARY, ml: 0.75 }}>
                    {pct(n, prev)} of prev
                  </Typography>
                )}
              </Typography>
            </Stack>
            <Box sx={{ height: 22, borderRadius: '6px', bgcolor: tint, overflow: 'hidden' }}>
              {/* Full-width fill revealed via transform - same compositor-friendly recipe
                  as the campaign progress bar. */}
              <Box sx={{
                width: '100%', height: '100%', borderRadius: '6px', bgcolor: color,
                transform: `translateX(${width - 100}%)`, transition: 'transform 0.6s cubic-bezier(0.22,1,0.36,1)',
              }} />
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
};

const findTransition = (data: FunnelAnalytics | undefined, from: string, to: string) =>
  data?.transitions.find((t) => t.from_step === from && t.to_step === to);

const FunnelTab = () => {
  const [days, setDays] = useState(30);
  const { data, isLoading } = useFunnelAnalytics(days);

  const totals = data?.totals ?? {};
  // Distinct people per step (user id, or journey session pre-auth). The funnels and
  // ratio KPIs read these so one person opening a page five times still counts once.
  // Falls back to event counts on deploy skew (older API without `people`) - the
  // "counts people" captions hide in that window so the label never lies.
  const hasPeople = !!data?.people;
  const people = data?.people ?? totals;
  const hasData = Object.keys(totals).length > 0;
  const regTime = findTransition(data, 'registration_started', 'account_created');
  const otpRequested = people['otp_requested'] ?? 0;
  const otpVerified = people['otp_verified'] ?? 0;
  const rejected = totals['submission_rejected'] ?? 0;
  const accepted = totals['submission_accepted'] ?? 0;

  return (
    <motion.div variants={staggerContainer} initial='hidden' animate='visible'>
      {/* Range picker */}
      <motion.div variants={riseIn}>
        <Stack direction='row' spacing={1} sx={{ mb: 2.5 }}>
          {[7, 30, 90].map((d) => (
            <Chip
              key={d}
              label={`Last ${d} days`}
              onClick={() => setDays(d)}
              sx={{
                fontWeight: 700,
                bgcolor: days === d ? PRIMARY_MAIN : BG_SUBTLE,
                color: days === d ? 'white' : TEXT_SECONDARY,
                border: `1px solid ${days === d ? PRIMARY_MAIN : BORDER_LIGHT}`,
                '&:hover': { bgcolor: days === d ? PRIMARY_MAIN : BG_SUBTLE },
              }}
            />
          ))}
        </Stack>
      </motion.div>

      {/* KPI row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {isLoading
          ? Array.from({ length: 6 }, (_, i) => (
              <Grid size={{ xs: 6, md: 2 }} key={i}><StatCardSkeleton /></Grid>
            ))
          : (
            <>
              <Grid size={{ xs: 6, md: 2 }}>
                <StatCard icon={<PersonAddAlt1Outlined />} tint={CHART_BLUE_TINT} color={CHART_BLUE}
                  label='Accounts created' value={(totals['account_created'] ?? 0).toLocaleString()} />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <StatCard icon={<ReceiptLongOutlined />} tint={CHART_GREEN_TINT} color={CHART_GREEN}
                  label='Entries accepted' value={accepted.toLocaleString()} />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <StatCard icon={<TaskAltOutlined />} tint={CHART_PURPLE_TINT} color={CHART_PURPLE}
                  label='Sign-up completion' value={pct(people['account_created'] ?? 0, people['registration_started'] ?? 0)}
                  caption='People: started form to account' />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <StatCard icon={<TimerOutlined />} tint={ALPHA_PRIMARY_10} color={PRIMARY_MAIN}
                  label='Median sign-up time' value={fmtSeconds(regTime?.p50_s)}
                  caption='Updates nightly' />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <StatCard icon={<SmsOutlined />} tint={CHART_TEAL_TINT} color={CHART_TEAL}
                  label='Phone verify success' value={pct(otpVerified, otpRequested)}
                  caption={otpRequested > 0 ? `${otpVerified.toLocaleString()} of ${otpRequested.toLocaleString()} people` : 'No codes sent yet'} />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                {/* Receipt-photo uploads that failed after the automatic retry (client-reported,
                    stage convert or upload). A spike here = storage/network trouble users are
                    feeling before any entry ever reaches the server. */}
                <StatCard icon={<CloudOffOutlined />} tint={METRIC_BAD_TINT} color={METRIC_BAD}
                  label='Upload failures' value={(totals['submit_image_upload_failed'] ?? 0).toLocaleString()}
                  caption='Receipt photos that failed to upload' />
              </Grid>
            </>
          )}
      </Grid>

      {/* The headline: per-USER activation journey (people, not events). journey may be
          absent when the API is an older build (deploy skew) - render nothing, not a crash. */}
      <motion.div variants={riseIn}>
        {isLoading ? <AdminCardSkeleton height={230} sx={{ mb: 3 }} /> : data?.journey && (
          <AdminCard sx={{ p: 2.5, mb: 3 }}>
            <SectionHeader
              icon={<PersonAddAlt1Outlined />} tint={CHART_PURPLE_TINT} color={CHART_PURPLE}
              title='New user journey'
              action={
                <Typography sx={{ fontSize: '13px', fontWeight: 800, color: data.journey.accounts - data.journey.got_entry > 0 ? METRIC_BAD : TEXT_TERTIARY }}>
                  {data.journey.accounts - data.journey.got_entry} of {data.journey.accounts} new users never got an entry
                </Typography>
              }
            />
            <FunnelSteps
              steps={[['accounts', 'Created an account'], ['phone_verified', 'Verified phone'], ['tried_entry', 'Tried to enter'], ['got_entry', 'Got an entry']]}
              totals={data.journey as unknown as Record<string, number>}
              color={CHART_PURPLE} tint={CHART_PURPLE_TINT}
            />
            <Typography variant='caption' sx={{ color: TEXT_TERTIARY, display: 'block', mt: 1.5 }}>
              Counts people, not events - each user appears once per step they reached.
              Cohort: accounts created in the selected range.
            </Typography>
          </AdminCard>
        )}
      </motion.div>

      {/* The two funnels */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <motion.div variants={riseIn}>
            {isLoading ? <AdminCardSkeleton height={320} /> : (
              <AdminCard sx={{ p: 2.5, height: '100%' }}>
                <SectionHeader icon={<FilterAltOutlined />} tint={CHART_BLUE_TINT} color={CHART_BLUE} title='Registration funnel' />
                <FunnelSteps steps={REG_STEPS} totals={people} color={CHART_BLUE} tint={CHART_BLUE_TINT} />
                {hasPeople && (
                  <Typography variant='caption' sx={{ color: TEXT_TERTIARY, display: 'block', mt: 1.5 }}>
                    Counts people, not events - repeat visits by the same person count once per step.
                  </Typography>
                )}
              </AdminCard>
            )}
          </motion.div>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <motion.div variants={riseIn}>
            {isLoading ? <AdminCardSkeleton height={320} /> : (
              <AdminCard sx={{ p: 2.5, height: '100%' }}>
                <SectionHeader icon={<FilterAltOutlined />} tint={CHART_GREEN_TINT} color={CHART_GREEN} title='Entry funnel' />
                <FunnelSteps steps={SUB_STEPS} totals={people} color={CHART_GREEN} tint={CHART_GREEN_TINT} />
                {hasPeople && (
                  <Typography variant='caption' sx={{ color: TEXT_TERTIARY, display: 'block', mt: 1.5 }}>
                    Counts people, not events - repeat visits by the same person count once per step.
                    Entry accepted includes free and referral entries, which skip the form.
                  </Typography>
                )}
              </AdminCard>
            )}
          </motion.div>
        </Grid>
      </Grid>

      {/* Flyer scans by location: which physical QR flyers actually get scanned, and how
          many of those visitors turn into flyer-attributed signups. Hidden entirely on an
          older API build without flyerScans (deploy skew). */}
      <motion.div variants={riseIn}>
        {isLoading ? <AdminCardSkeleton height={220} sx={{ mb: 3 }} /> : data?.flyerScans && (
          <AdminCard sx={{ p: 2.5, mb: 3 }}>
            <SectionHeader icon={<QrCode2Outlined />} tint={CHART_TEAL_TINT} color={CHART_TEAL} title='Flyer scans by location' />
            {data.flyerScans.length > 0 ? (
              <>
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size='small' sx={{
                    '& th': { fontSize: '12px', fontWeight: 700, color: TEXT_TERTIARY, borderColor: BORDER_LIGHT, whiteSpace: 'nowrap' },
                    '& td': { fontSize: '13px', color: TEXT_SECONDARY, borderColor: BORDER_LIGHT },
                  }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Location</TableCell>
                        <TableCell align='right'>People scanned</TableCell>
                        <TableCell align='right'>Signed up</TableCell>
                        <TableCell align='right'>Scan to signup</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.flyerScans.map((row) => (
                        <TableRow key={row.location_id} hover>
                          <TableCell>
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: TEXT_HEADING }}>
                              {row.location_name || row.business_name}
                            </Typography>
                            {row.location_name && (
                              <Typography sx={{ fontSize: '11.5px', color: TEXT_TERTIARY }}>{row.business_name}</Typography>
                            )}
                          </TableCell>
                          <TableCell align='right' sx={{ fontWeight: 700, color: TEXT_HEADING }}>{row.visitors.toLocaleString()}</TableCell>
                          <TableCell align='right'>{row.signups.toLocaleString()}</TableCell>
                          <TableCell align='right' sx={{ fontWeight: 600 }}>{pct(row.signups, row.visitors)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
                <Typography variant='caption' sx={{ color: TEXT_TERTIARY, display: 'block', mt: 1.5 }}>
                  Counts people, not scans - the same person scanning a flyer twice counts once.
                  Signed up means accounts created through that location's flyer in the selected range.
                </Typography>
              </>
            ) : (
              <Typography variant='body2' sx={{ color: TEXT_TERTIARY, py: 6, textAlign: 'center' }}>
                No flyer scans in this range yet.
              </Typography>
            )}
          </AdminCard>
        )}
      </motion.div>

      {/* Trend + rejection reasons */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <motion.div variants={riseIn}>
            {isLoading ? <AdminCardSkeleton height={280} /> : (
              <AdminCard sx={{ p: 2.5, height: '100%' }}>
                <SectionHeader icon={<ShowChartOutlined />} tint={ALPHA_PRIMARY_10} color={PRIMARY_MAIN} title='Daily accounts & accepted entries' />
                {data && data.daily.length > 0 ? (
                  <Box sx={{ height: 220 }}>
                    <ResponsiveContainer width='100%' height='100%'>
                      <AreaChart data={data.daily} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                        <CartesianGrid stroke={CHART_GRID} vertical={false} />
                        <XAxis dataKey='day' tick={{ fontSize: 11, fill: TEXT_TERTIARY }}
                          tickFormatter={(d: string) => String(d).slice(5)} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: TEXT_TERTIARY }} axisLine={false} tickLine={false} />
                        <ChartTooltip labelFormatter={(d) => String(d).slice(0, 10)} />
                        <Area type='monotone' dataKey='accounts' name='Accounts' stroke={CHART_BLUE} fill={CHART_BLUE_TINT} strokeWidth={2} />
                        <Area type='monotone' dataKey='submissions' name='Accepted entries' stroke={CHART_GREEN} fill={CHART_GREEN_TINT} strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <Typography variant='body2' sx={{ color: TEXT_TERTIARY, py: 6, textAlign: 'center' }}>
                    No activity in this range yet.
                  </Typography>
                )}
              </AdminCard>
            )}
          </motion.div>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <motion.div variants={riseIn}>
            {isLoading ? <AdminCardSkeleton height={280} /> : (
              <AdminCard sx={{ p: 2.5, height: '100%' }}>
                <SectionHeader icon={<BlockOutlined />} tint={METRIC_BAD_TINT} color={METRIC_BAD} title='Why entries fail' />
                {data && data.rejectionReasons.length > 0 ? (
                  <Stack spacing={1.25}>
                    {data.rejectionReasons.slice(0, 8).map((r) => (
                      <Box key={r.reason}>
                        <Stack direction='row' justifyContent='space-between' sx={{ mb: 0.4 }}>
                          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: TEXT_SECONDARY }}>
                            {REASON_LABELS[r.reason] ?? r.reason}
                          </Typography>
                          <Typography sx={{ fontSize: '12.5px', fontWeight: 700, color: TEXT_HEADING }}>
                            {r.n.toLocaleString()}
                          </Typography>
                        </Stack>
                        <Box sx={{ height: 8, borderRadius: '4px', bgcolor: METRIC_BAD_TINT, overflow: 'hidden' }}>
                          <Box sx={{
                            width: '100%', height: '100%', borderRadius: '4px', bgcolor: METRIC_BAD, opacity: 0.75,
                            transform: `translateX(${(rejected > 0 ? Math.max((r.n / rejected) * 100, 3) : 0) - 100}%)`,
                            transition: 'transform 0.6s cubic-bezier(0.22,1,0.36,1)',
                          }} />
                        </Box>
                      </Box>
                    ))}
                    <Typography variant='caption' sx={{ color: TEXT_TERTIARY, pt: 0.5 }}>
                      {rejected.toLocaleString()} failed of {(rejected + accepted).toLocaleString()} attempts ({pct(rejected, rejected + accepted)})
                    </Typography>
                  </Stack>
                ) : (
                  <Typography variant='body2' sx={{ color: TEXT_TERTIARY, py: 6, textAlign: 'center' }}>
                    No failed submissions in this range.
                  </Typography>
                )}
              </AdminCard>
            )}
          </motion.div>
        </Grid>
      </Grid>

      {!isLoading && !hasData && (
        <Typography variant='body2' sx={{ color: TEXT_TERTIARY, mt: 3, textAlign: 'center' }}>
          No funnel data yet. Events start recording as users sign up and submit receipts;
          timing stats appear after the first nightly rollup.
        </Typography>
      )}
    </motion.div>
  );
};

export default FunnelTab;
