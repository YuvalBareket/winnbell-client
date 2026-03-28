import { useState } from 'react';
import {
  Box, Container, Typography, Paper, Stack, MenuItem, Select,
  FormControl, InputLabel, Skeleton, Alert, Chip,
} from '@mui/material';
import {
  ConfirmationNumberOutlined, CheckCircleOutline, PercentOutlined,
  BarChart as BarChartIcon, EmojiEvents, CalendarToday,
} from '@mui/icons-material';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import { useAppSelector } from '../../../store/hook';
import { selectIsBusiness, selectIsLocationManager } from '../../../store/selectors/authSelectors';
import { useBusinessStats } from '../hooks/useBusinessStats';
import { useBusinessData } from '../../partner/hooks/useBusinessData';
import type { DrawDataPoint } from '../api/stats.api';
import {
  BG_PAGE, GRADIENT_HERO, ALPHA_WHITE_15, ALPHA_WHITE_30, PRIMARY_MAIN,
} from '../../../shared/colors';

const PIE_COLORS = ['#10b981', '#e2e8f0'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatMonth = (m: string) => {
  const [y, mo] = m.split('-');
  const d = new Date(Number(y), Number(mo) - 1);
  return d.toLocaleString('default', { month: 'short', year: '2-digit' });
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' });

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(n);

const activationRate = (issued: number, activated: number) =>
  issued > 0 ? Math.round((activated / issued) * 100) : 0;

// ─── KPI Card ────────────────────────────────────────────────────────────────

const KpiCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) => (
  <Paper elevation={0} sx={{ flex: 1, p: { xs: 2, sm: 2.5 }, borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
    <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {icon}
    </Box>
    <Box>
      <Typography variant='caption' fontWeight={700} color='text.secondary' sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Typography>
      <Typography variant='h5' fontWeight={800} lineHeight={1.2}>{value}</Typography>
    </Box>
  </Paper>
);

// ─── Draw performance card ────────────────────────────────────────────────────

const DrawCard = ({ draw, selected, onClick }: { draw: DrawDataPoint; selected: boolean; onClick: () => void }) => {
  const rate = activationRate(draw.issued, draw.activated);
  const isPast = new Date(draw.draw_date) < new Date();
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2.5, borderRadius: 3, cursor: 'pointer',
        border: '2px solid', borderColor: selected ? PRIMARY_MAIN : 'divider',
        bgcolor: selected ? `${PRIMARY_MAIN}08` : 'background.paper',
        transition: 'all 0.15s ease',
        '&:hover': { borderColor: PRIMARY_MAIN, bgcolor: `${PRIMARY_MAIN}05` },
      }}
    >
      <Stack direction='row' justifyContent='space-between' alignItems='flex-start' mb={1.5}>
        <Box flex={1} minWidth={0} pr={1}>
          <Typography variant='body2' fontWeight={700} noWrap color={selected ? 'primary.main' : 'text.primary'}>
            {draw.draw_name}
          </Typography>
          <Typography variant='h6' fontWeight={900} color={selected ? 'primary.main' : 'text.primary'} lineHeight={1.2}>
            {formatCurrency(draw.prize_amount)}
          </Typography>
        </Box>
        <Chip
          label={isPast ? 'Completed' : 'Active'}
          size='small'
          sx={{
            fontWeight: 700, fontSize: '0.65rem',
            bgcolor: isPast ? 'action.hover' : '#dcfce7',
            color: isPast ? 'text.secondary' : '#16a34a',
          }}
        />
      </Stack>
      <Stack direction='row' alignItems='center' spacing={0.5} mb={1.5}>
        <CalendarToday sx={{ fontSize: 13, color: 'text.disabled' }} />
        <Typography variant='caption' color='text.secondary' fontWeight={600}>
          {formatDate(draw.draw_date)}
        </Typography>
      </Stack>
      <Stack direction='row' spacing={2}>
        <Box>
          <Typography variant='caption' color='text.disabled' fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Issued</Typography>
          <Typography variant='subtitle2' fontWeight={800}>{draw.issued.toLocaleString()}</Typography>
        </Box>
        <Box>
          <Typography variant='caption' color='text.disabled' fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Activated</Typography>
          <Typography variant='subtitle2' fontWeight={800}>{draw.activated.toLocaleString()}</Typography>
        </Box>
        <Box>
          <Typography variant='caption' color='text.disabled' fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Rate</Typography>
          <Typography variant='subtitle2' fontWeight={800} color={rate >= 50 ? '#16a34a' : rate >= 25 ? '#d97706' : 'text.primary'}>
            {rate}%
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

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

  const selectedDrawInfo = draws.find(d => d.draw_id === selectedDraw);

  return (
    <Box sx={{ bgcolor: BG_PAGE, minHeight: '100vh', pb: { xs: 12, md: 6 } }}>

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
                    <InputLabel>All draws</InputLabel>
                    <Select value={selectedDraw} label='All draws' onChange={(e) => setSelectedDraw(e.target.value as number | '')}>
                      <MenuItem value=''>All draws</MenuItem>
                      {draws.map((d) => (
                        <MenuItem key={d.draw_id} value={d.draw_id}>
                          {d.draw_name} — {formatDate(d.draw_date)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Stack>
            </Paper>
          ) : null}

          {isError && <Alert severity='error' sx={{ borderRadius: 3 }}>Failed to load statistics. Please try again.</Alert>}

          {/* Selected draw info banner */}
          {selectedDrawInfo && (
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${PRIMARY_MAIN}33`, bgcolor: `${PRIMARY_MAIN}06`, display: 'flex', alignItems: 'center', gap: 2 }}>
              <EmojiEvents sx={{ color: PRIMARY_MAIN, fontSize: 28, flexShrink: 0 }} />
              <Box>
                <Typography variant='body2' fontWeight={700} color='primary.main'>{selectedDrawInfo.draw_name}</Typography>
                <Typography variant='caption' color='text.secondary'>
                  Prize: {formatCurrency(selectedDrawInfo.prize_amount)} · Draw date: {formatDate(selectedDrawInfo.draw_date)}
                </Typography>
              </Box>
              <Chip label='Filtered' size='small' color='primary' sx={{ ml: 'auto', fontWeight: 700 }} />
            </Paper>
          )}

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
                <KpiCard icon={<ConfirmationNumberOutlined sx={{ color: 'white', fontSize: 22 }} />} label='Total Issued' value={(stats?.summary.total_issued ?? 0).toLocaleString()} color={PRIMARY_MAIN} />
                <KpiCard icon={<CheckCircleOutline sx={{ color: 'white', fontSize: 22 }} />} label='Activated' value={(stats?.summary.total_activated ?? 0).toLocaleString()} color='#10b981' />
                <KpiCard icon={<PercentOutlined sx={{ color: 'white', fontSize: 22 }} />} label='Activation Rate' value={`${stats?.summary.activation_rate ?? 0}%`} color='#f59e0b' />
              </>
            )}
          </Stack>

          {/* Monthly distribution — bar chart */}
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
                  <Bar dataKey='issued' fill={PRIMARY_MAIN} radius={[4, 4, 0, 0]} name='Issued' />
                  <Bar dataKey='activated' fill='#10b981' radius={[4, 4, 0, 0]} name='Activated' />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>

          {/* 30-day trend — line chart */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
              <Typography variant='subtitle1' fontWeight={700}>30-Day Trend</Typography>
              <Chip label='Last 30 days' size='small' sx={{ fontWeight: 700 }} />
            </Stack>
            {isLoading ? <Skeleton variant='rounded' height={220} /> : (stats?.daily?.length ?? 0) === 0 ? (
              <Box sx={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color='text.disabled'>No ticket activity in the last 30 days</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width='100%' height={220}>
                <LineChart data={stats!.daily.map(d => ({ ...d, date: formatDay(d.date) }))}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                  <XAxis dataKey='date' tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type='monotone' dataKey='issued' stroke={PRIMARY_MAIN} strokeWidth={2} dot={false} name='Issued' />
                  <Line type='monotone' dataKey='activated' stroke='#10b981' strokeWidth={2} dot={false} name='Activated' />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Paper>

          {/* Draws performance */}
          {draws.length > 0 && (
            <Box>
              <Typography variant='subtitle2' fontWeight={800} color='text.secondary' sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
                Draws Performance
              </Typography>
              {isLoading ? (
                <Stack spacing={2}>
                  <Skeleton variant='rounded' height={120} sx={{ borderRadius: 3 }} />
                  <Skeleton variant='rounded' height={120} sx={{ borderRadius: 3 }} />
                </Stack>
              ) : (
                <Box sx={{ display: { xs: 'flex', md: 'grid' }, flexDirection: 'column', gridTemplateColumns: { md: '1fr 1fr' }, gap: 2 }}>
                  {draws.map(d => (
                    <DrawCard
                      key={d.draw_id}
                      draw={d}
                      selected={selectedDraw === d.draw_id}
                      onClick={() => setSelectedDraw(prev => prev === d.draw_id ? '' : d.draw_id)}
                    />
                  ))}
                </Box>
              )}
            </Box>
          )}

          {/* Branch breakdown bar chart */}
          {(isBusiness || isManager) && (
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant='subtitle1' fontWeight={700} mb={2}>
                {isBusiness ? 'Tickets by Branch' : 'Ticket Breakdown'}
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
                    <Bar dataKey='issued' fill={PRIMARY_MAIN} radius={[4, 4, 0, 0]} name='Issued' />
                    <Bar dataKey='activated' fill='#10b981' radius={[4, 4, 0, 0]} name='Activated' />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Paper>
          )}

          {/* Activation ratio donut */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant='subtitle1' fontWeight={700} mb={2}>Activation Ratio</Typography>
            {isLoading ? <Skeleton variant='rounded' height={200} /> : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 4 }, flexDirection: { xs: 'column', sm: 'row' } }}>
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Activated', value: stats?.summary.total_activated ?? 0 },
                        { name: 'Not activated', value: Math.max(0, (stats?.summary.total_issued ?? 0) - (stats?.summary.total_activated ?? 0)) },
                      ]}
                      cx='50%' cy='50%' innerRadius={50} outerRadius={80}
                      dataKey='value' startAngle={90} endAngle={-270}
                    >
                      {PIE_COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <Stack spacing={1.5}>
                  <Stack direction='row' alignItems='center' spacing={1}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#10b981' }} />
                    <Typography variant='body2' fontWeight={600}>Activated — {stats?.summary.total_activated ?? 0}</Typography>
                  </Stack>
                  <Stack direction='row' alignItems='center' spacing={1}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#e2e8f0' }} />
                    <Typography variant='body2' fontWeight={600}>
                      Not activated — {Math.max(0, (stats?.summary.total_issued ?? 0) - (stats?.summary.total_activated ?? 0))}
                    </Typography>
                  </Stack>
                  <Typography variant='h4' fontWeight={800}>{stats?.summary.activation_rate ?? 0}%</Typography>
                  <Typography variant='caption' color='text.secondary'>activation rate</Typography>
                </Stack>
              </Box>
            )}
          </Paper>

        </Stack>
      </Container>
    </Box>
  );
};

export default StatsPage;
