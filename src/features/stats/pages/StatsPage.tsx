import { useState } from 'react';
import {
  Box, Container, Typography, Paper, Stack, MenuItem, Select,
  FormControl, InputLabel, Skeleton, Alert, Chip,
} from '@mui/material';
import {
  ReceiptLongOutlined, AttachMoneyOutlined, TrendingUpOutlined,
  BarChart as BarChartIcon, PeopleAltOutlined,
} from '@mui/icons-material';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { useAppSelector } from '../../../store/hook';
import { selectIsBusiness, selectIsLocationManager } from '../../../store/selectors/authSelectors';
import { useBusinessStats } from '../hooks/useBusinessStats';
import { useBusinessData } from '../../partner/hooks/useBusinessData';
import {
  BG_PAGE, GRADIENT_HERO, ALPHA_WHITE_15, ALPHA_WHITE_30, PRIMARY_MAIN, MOBILE_CONTENT_HEIGHT,
} from '../../../shared/colors';
import { formatMonth, formatCurrency, formatDateShort } from '../../../shared/utils/date';
import KpiCard from '../components/KpiCard';

// ─── Main Page ───────────────────────────────────────────────────────────────

const StatsPage = () => {
  const isBusiness = useAppSelector(selectIsBusiness);
  const isManager = useAppSelector(selectIsLocationManager);

  const [selectedLocation, setSelectedLocation] = useState<number | ''>('');
  const [selectedDraw, setSelectedDraw] = useState<number | ''>('');

  const { data: bizData } = useBusinessData(isBusiness);
  const { data: stats, isLoading, isError } = useBusinessStats(
    selectedLocation !== '' ? selectedLocation : undefined,
    selectedDraw !== '' ? selectedDraw : undefined,
  );

  const locations = bizData?.locations ?? [];
  const draws = stats?.draws ?? [];

  const formatDay = (d: string) => {
    const dt = new Date(d);
    return `${dt.getMonth() + 1}/${dt.getDate()}`;
  };

  return (
    <Box sx={{ bgcolor: BG_PAGE, minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: '100dvh' }, pb: { xs: 12, md: 6 } }}>

      {/* Hero */}
      <Box sx={{ background: GRADIENT_HERO, pt: 3, pb: 9, px: 3, color: 'white', borderRadius: '0 0 32px 32px' }}>
        <Container maxWidth='lg'>
          <Stack direction='row' alignItems='center' spacing={2}>
            <Box sx={{ width: 52, height: 52, borderRadius: 2, bgcolor: ALPHA_WHITE_15, border: `1px solid ${ALPHA_WHITE_30}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChartIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant='h5' fontWeight={800}>Statistics</Typography>
              <Typography variant='body2' sx={{ opacity: 0.75 }}>
                {isBusiness ? 'Business performance overview' : 'Branch performance overview'}
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth='lg' sx={{ mt: -5 }}>
        <Stack spacing={3}>

          {/* Filters */}
          {(isBusiness && locations.length > 1) || draws.length > 0 ? (
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                {isBusiness && locations.length > 1 && (
                  <FormControl size='small' sx={{ minWidth: 180 }}>
                    <InputLabel>All branches</InputLabel>
                    <Select value={selectedLocation} label='All branches' onChange={(e) => setSelectedLocation(e.target.value as number | '')}>
                      <MenuItem value=''>All branches</MenuItem>
                      {locations.map((loc) => (
                        <MenuItem key={loc.id} value={loc.id}>{loc.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                {draws.length > 0 && (
                  <FormControl size='small' sx={{ minWidth: 200 }}>
                    <InputLabel>All campaigns</InputLabel>
                    <Select value={selectedDraw} label='All campaigns' onChange={(e) => setSelectedDraw(e.target.value as number | '')}>
                      <MenuItem value=''>All campaigns</MenuItem>
                      {draws.map((d) => (
                        <MenuItem key={d.draw_id} value={d.draw_id}>
                          {d.draw_name} ({formatDateShort(d.draw_date)})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Stack>
            </Paper>
          ) : null}

          {isError && <Alert severity='error' sx={{ borderRadius: 3 }}>Failed to load statistics. Please try again.</Alert>}

          {/* KPI cards */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {isLoading ? (
              <>
                <Skeleton variant='rounded' height={88} sx={{ flex: 1, borderRadius: 3 }} />
                <Skeleton variant='rounded' height={88} sx={{ flex: 1, borderRadius: 3 }} />
                <Skeleton variant='rounded' height={88} sx={{ flex: 1, borderRadius: 3 }} />
              </>
            ) : (
              <>
                <KpiCard icon={<ReceiptLongOutlined sx={{ color: 'white', fontSize: 22 }} />} label='Total Entries' value={(stats?.summary.total_entries ?? 0).toLocaleString()} color='#1976d2' />
                <KpiCard icon={<AttachMoneyOutlined sx={{ color: 'white', fontSize: 22 }} />} label='Total Revenue' value={formatCurrency(stats?.summary.total_revenue ?? 0)} color='#10b981' />
                <KpiCard icon={<TrendingUpOutlined sx={{ color: 'white', fontSize: 22 }} />} label='Avg. Transaction' value={formatCurrency(stats?.summary.avg_transaction ?? 0)} color='#f59e0b' />
              </>
            )}
          </Stack>

          {/* Customer Growth */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction='row' justifyContent='space-between' alignItems='center' mb={0.5}>
              <Stack direction='row' alignItems='center' spacing={1}>
                <PeopleAltOutlined sx={{ fontSize: 20, color: PRIMARY_MAIN }} />
                <Typography variant='subtitle1' fontWeight={700}>Customer Growth</Typography>
              </Stack>
              <Chip label='Last 12 months' size='small' sx={{ fontWeight: 700 }} />
            </Stack>
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 2 }}>
              New customers reaching you through Winnbell each month
            </Typography>
            {isLoading ? <Skeleton variant='rounded' height={240} /> : (stats?.customer_growth?.length ?? 0) === 0 ? (
              <Box sx={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color='text.disabled'>No customer data yet</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width='100%' height={240}>
                <ComposedChart data={stats!.customer_growth.map(p => ({ ...p, month: formatMonth(p.month) }))} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                  <XAxis dataKey='month' tick={{ fontSize: 11 }} />
                  <YAxis yAxisId='left' tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis yAxisId='right' orientation='right' tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar yAxisId='left' dataKey='new_customers' fill='#818cf8' radius={[4, 4, 0, 0]} name='New Customers' />
                  <Line yAxisId='right' type='monotone' dataKey='total_customers' stroke='#10b981' strokeWidth={2.5} dot={false} name='Total Customers' />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </Paper>

          {/* Monthly distribution - bar chart */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
              <Typography variant='subtitle1' fontWeight={700}>Monthly Distribution</Typography>
              <Chip label='Last 12 months' size='small' sx={{ fontWeight: 700 }} />
            </Stack>
            {isLoading ? <Skeleton variant='rounded' height={220} /> : (stats?.monthly?.length ?? 0) === 0 ? (
              <Box sx={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color='text.disabled'>No data available</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width='100%' height={220}>
                <BarChart data={stats!.monthly.map(m => ({ ...m, month: formatMonth(m.month) }))} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                  <XAxis dataKey='month' tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey='entries' fill={PRIMARY_MAIN} radius={[4, 4, 0, 0]} name='Entries' />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>

          {/* 30-day trend - line chart */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
              <Typography variant='subtitle1' fontWeight={700}>30-Day Trend</Typography>
              <Chip label='Last 30 days' size='small' sx={{ fontWeight: 700 }} />
            </Stack>
            {isLoading ? <Skeleton variant='rounded' height={220} /> : (stats?.daily?.length ?? 0) === 0 ? (
              <Box sx={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color='text.disabled'>No entry activity in the last 30 days</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width='100%' height={220}>
                <LineChart data={stats!.daily.map(d => ({ ...d, date: formatDay(d.date) }))}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                  <XAxis dataKey='date' tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type='monotone' dataKey='entries' stroke={PRIMARY_MAIN} strokeWidth={2} dot={false} name='Entries' />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Paper>

          {/* Branch breakdown bar chart */}
          {(isBusiness || isManager) && (
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant='subtitle1' fontWeight={700} mb={2}>
                {isBusiness ? 'Entries by Branch' : 'Entry Breakdown'}
              </Typography>
              {isLoading ? <Skeleton variant='rounded' height={220} /> : (stats?.locations?.length ?? 0) === 0 ? (
                <Box sx={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color='text.disabled'>No branch data available</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width='100%' height={220}>
                  <BarChart data={stats!.locations} margin={{ left: -10 }}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                    <XAxis dataKey='location_name' tick={{ fontSize: 11 }} tickFormatter={(v: string) => v.length > 10 ? v.slice(0, 10) + '…' : v} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey='entries' fill={PRIMARY_MAIN} radius={[4, 4, 0, 0]} name='Entries' />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Paper>
          )}


        </Stack>
      </Container>
    </Box>
  );
};

export default StatsPage;
