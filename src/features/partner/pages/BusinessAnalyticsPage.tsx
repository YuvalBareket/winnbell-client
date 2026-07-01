import { useMemo, useState, type ReactNode } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Skeleton,
  Alert,
  Chip,
  Autocomplete,
  TextField,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Tabs,
  Tab,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QueryStatsOutlined,
  GroupsOutlined,
  ConfirmationNumberOutlined,
  AutorenewOutlined,
  PersonAddAlt1Outlined,
  TravelExploreOutlined,
  VisibilityOutlined,
  TrendingUpOutlined,
  LoyaltyOutlined,
  AttachMoneyOutlined,
  SellOutlined,
  ShoppingBagOutlined,
  ReceiptLongOutlined,
  WarningAmberOutlined,
  ShowChartOutlined,
  PieChartOutlineOutlined,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import AppHeader from '../../../shared/components/AppHeader';
import AppMenuDrawer from '../../../shared/components/AppMenuDrawer';
import { useAppSelector } from '../../../store/hook';
import {
  selectCurrentUser,
  selectIsBusiness,
  selectIsLocationManager,
} from '../../../store/selectors/authSelectors';
import { useBusinessData } from '../hooks/useBusinessData';
import { useAnalyticsSection } from '../hooks/useBusinessAnalytics';
import type { AnalyticsBucket } from '../api/analytics.api';
import type { BusinessLocation } from '../types/business.types';
import { formatCurrency, formatMonth } from '../../../shared/utils/date';
import {
  GRADIENT_HERO,
  ALPHA_WHITE_15,
  ALPHA_WHITE_30,
  MOBILE_CONTENT_HEIGHT,
  PRIMARY_MAIN,
  PRIMARY_LIGHT,
  ALPHA_PRIMARY_10,
  ALPHA_GREEN_10,
  STATUS_ACTIVATED_TEXT,
  ACCENT_GOLD_DARK,
  ACCENT_GOLD_LIGHT,
  AMBER_HOURGLASS,
  STATUS_PENDING_TEXT,
  TEXT_SECONDARY,
  SHADOW_CARD,
} from '../../../shared/colors';

// ─── Duration + range helpers ──────────────────────────────────────────────────

type DurationKey = 'month' | 'mtd' | '1m' | '3m' | '6m' | 'ytd' | '12m' | 'all';

const DURATION_TABS: { key: DurationKey; label: string }[] = [
  { key: 'month', label: 'Month' },
  { key: 'mtd', label: 'MTD' },
  { key: '1m', label: '1M' },
  { key: '3m', label: '3M' },
  { key: '6m', label: '6M' },
  { key: 'ytd', label: 'YTD' },
  { key: '12m', label: '12M' },
  { key: 'all', label: 'All' },
];

const monthsSpan = (from: Date, to: Date) =>
  (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());

interface ComputedRange {
  from: string;
  to: string;
  bucket: AnalyticsBucket;
  spanMonths: number;
}

const computeRange = (key: DurationKey, monthValue: string): ComputedRange => {
  const now = new Date();
  let from: Date;
  let to: Date = now;

  switch (key) {
    case 'month': {
      const [y, m] = monthValue.split('-').map(Number);
      from = new Date(y, m - 1, 1);
      to = new Date(y, m, 1);
      break;
    }
    case 'mtd':
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case '1m':
      from = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      break;
    case '3m':
      from = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      break;
    case '6m':
      from = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      break;
    case 'ytd':
      from = new Date(now.getFullYear(), 0, 1);
      break;
    case '12m':
      from = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
      break;
    case 'all':
      from = new Date(2020, 0, 1);
      break;
    default:
      from = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const span = monthsSpan(from, to);
  const bucket: AnalyticsBucket = span < 3 ? 'day' : 'month';
  return { from: from.toISOString(), to: to.toISOString(), bucket, spanMonths: span };
};

const formatBucketLabel = (b: string, granularity: AnalyticsBucket): string => {
  if (!b) return '';
  if (granularity === 'month') return formatMonth(b.slice(0, 7));
  const dt = new Date(b);
  if (Number.isNaN(dt.getTime())) return b;
  return `${dt.getMonth() + 1}/${dt.getDate()}`;
};

const formatPct = (v: number | null | undefined): string => {
  const n = Number(v) || 0;
  return `${Number.isInteger(n) ? n : n.toFixed(1)}%`;
};

const formatNum = (v: number | null | undefined): string => Number(v ?? 0).toLocaleString();

// ─── Category tabs ─────────────────────────────────────────────────────────────

type CategoryKey = 'overview' | 'acquisition' | 'engagement' | 'revenue';

const CATEGORY_TABS: { key: CategoryKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'acquisition', label: 'New Customers' },
  { key: 'engagement', label: 'Engagement' },
  { key: 'revenue', label: 'Sales' },
];

// ─── Animation variants ────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ─── Reusable presentation pieces ──────────────────────────────────────────────

interface StatTileProps {
  icon: ReactNode;
  label: string;
  value: string;
  tint: string;
  iconColor: string;
  caption?: string;
  sx?: object;
}

const StatTile = ({ icon, label, value, tint, iconColor, caption, sx }: StatTileProps) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 1.75, sm: 2.5 },
      borderRadius: 3,
      border: '1px solid',
      borderColor: 'divider',
      boxShadow: SHADOW_CARD,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: { xs: 1, sm: 1.25 },
      ...sx,
    }}
  >
    <Box
      sx={{
        width: { xs: 38, sm: 44 },
        height: { xs: 38, sm: 44 },
        borderRadius: 2,
        bgcolor: tint,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: iconColor,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography
        variant="caption"
        fontWeight={700}
        color="text.secondary"
        sx={{ textTransform: 'uppercase', letterSpacing: 0.4, fontSize: { xs: '0.62rem', sm: '0.68rem' }, display: 'block', lineHeight: 1.3 }}
      >
        {label}
      </Typography>
      <Typography fontWeight={800} sx={{ fontSize: { xs: '1.35rem', sm: '1.6rem' }, lineHeight: 1.2, letterSpacing: '-0.5px' }}>
        {value}
      </Typography>
      {caption && (
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.62rem', display: 'block', mt: 0.25, lineHeight: 1.4 }}>
          {caption}
        </Typography>
      )}
    </Box>
  </Paper>
);

const StatGrid = ({ children, cols }: { children: ReactNode; cols: number }) => (
  <Box
    sx={{
      display: 'grid',
      gap: { xs: 1.5, sm: 2 },
      gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: `repeat(${cols}, 1fr)` },
    }}
  >
    {children}
  </Box>
);

const StatGridSkeleton = ({ cols }: { cols: number }) => (
  <Box
    sx={{
      display: 'grid',
      gap: { xs: 1.5, sm: 2 },
      gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: `repeat(${cols}, 1fr)` },
    }}
  >
    {Array.from({ length: cols }).map((_, i) => (
      <Skeleton key={i} variant="rounded" height={120} sx={{ borderRadius: 3 }} />
    ))}
  </Box>
);

const ChartCard = ({
  title,
  subtitle,
  chip,
  children,
}: {
  title: string;
  subtitle?: string;
  chip?: ReactNode;
  children: ReactNode;
}) => (
  <Paper
    elevation={0}
    sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: SHADOW_CARD }}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
      <Box>
        <Typography variant="subtitle1" fontWeight={800} sx={{ letterSpacing: '-0.3px' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {chip}
    </Stack>
    {children}
  </Paper>
);

const EmptyChart = ({ height = 260, message }: { height?: number; message: string }) => (
  <Box
    sx={{
      height,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1,
      color: 'text.disabled',
    }}
  >
    <ShowChartOutlined sx={{ fontSize: 40 }} />
    <Typography variant="body2">{message}</Typography>
  </Box>
);

// Refreshing overlay shown when refetching after filter changes
const RefreshingOverlay = () => {
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.15 } },
    exit: { opacity: 0, transition: { duration: 0.25 } },
  };

  return (
    <motion.div
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'inherit',
        zIndex: 10,
        backdropFilter: 'blur(3px)',
      }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.25 }}>
          <CircularProgress size={40} thickness={3.5} />
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ letterSpacing: 0.2 }}>
            Refreshing...
          </Typography>
        </Box>
      </motion.div>
    </motion.div>
  );
};

// recharts injects active/payload/label — keep prop typing loose to avoid version churn
const ChartTooltip = (props: any) => {
  const { active, payload, label, money } = props;
  if (!active || !payload?.length) return null;
  return (
    <Box
      sx={{
        bgcolor: 'white',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        px: 1.5,
        py: 1,
        boxShadow: SHADOW_CARD,
      }}
    >
      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      <Stack spacing={0.5}>
        {payload.map((p: any) => (
          <Stack key={p.dataKey} direction="row" alignItems="center" spacing={1}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.color }} />
            <Typography variant="caption" color="text.secondary">
              {p.name}
            </Typography>
            <Typography variant="caption" fontWeight={700} sx={{ ml: 'auto', pl: 1.5 }}>
              {money ? formatCurrency(Number(p.value)) : formatNum(Number(p.value))}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};

const AXIS_TICK = { fontSize: 11, fill: TEXT_SECONDARY };
const CHART_HEIGHT = 260;

// ─── Main Page ─────────────────────────────────────────────────────────────────

const BusinessAnalyticsPage = () => {
  const user = useAppSelector(selectCurrentUser);
  const isBusiness = useAppSelector(selectIsBusiness);
  const isManager = useAppSelector(selectIsLocationManager);

  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<number | ''>('');
  const [duration, setDuration] = useState<DurationKey>('mtd');
  const [category, setCategory] = useState<CategoryKey>('overview');

  const monthOptions = useMemo(() => {
    const arr: { value: string; label: string }[] = [];
    const d = new Date();
    for (let i = 0; i < 18; i++) {
      const dt = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const value = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      arr.push({ value, label: dt.toLocaleString('default', { month: 'long', year: 'numeric' }) });
    }
    return arr;
  }, []);
  const [selectedMonth, setSelectedMonth] = useState<string>(monthOptions[0].value);

  const { from, to, bucket, spanMonths } = useMemo(
    () => computeRange(duration, selectedMonth),
    [duration, selectedMonth],
  );

  const { data: bizData } = useBusinessData(isBusiness);
  const activeLocations = (bizData?.locations ?? []).filter((l) => l.is_active) as BusinessLocation[];
  const showLocationFilter = isBusiness && activeLocations.length > 1;

  const locationIdForQuery = isManager
    ? (user?.location_id ?? undefined)
    : selectedLocation !== ''
      ? (selectedLocation as number)
      : undefined;

  // Per-section requests: only the active tab fetches. Each (category, filters) caches independently,
  // so switching tabs or durations loads just that section instead of the whole page.
  const queryParams = { locationId: locationIdForQuery, from, to, bucket };
  const overviewQ = useAnalyticsSection('overview', queryParams, category === 'overview');
  const acquisitionQ = useAnalyticsSection('acquisition', queryParams, category === 'acquisition');
  const engagementQ = useAnalyticsSection('engagement', queryParams, category === 'engagement');
  const revenueQ = useAnalyticsSection('revenue', queryParams, category === 'revenue');

  const activeQuery =
    category === 'overview' ? overviewQ
    : category === 'acquisition' ? acquisitionQ
    : category === 'engagement' ? engagementQ
    : revenueQ;
  const { isLoading, isError, refetch, isPlaceholderData } = activeQuery;

  // Plain (non-hook) label mapper — safe to call inside the per-category renderers.
  const withLabels = <T extends { bucket: string }>(rows: T[]) =>
    rows.map((s) => ({ ...s, label: formatBucketLabel(s.bucket, bucket) }));

  const rangeChipLabel = DURATION_TABS.find((d) => d.key === duration)?.label ?? '';

  // ── Category content renderers ────────────────────────────────────────────────

  const renderOverview = () => {
    const o = overviewQ.data;
    const seriesData = withLabels(o?.series ?? []);
    const newVal = o?.new_participants ?? 0;
    const returningVal = o?.returning_participants ?? 0;
    const cap = o?.entry_cap;
    const capPct = Math.min(Math.max(cap?.pct ?? 0, 0), 100);
    const capNearFull = capPct >= 90;
    const usePie = spanMonths < 1;
    const hasSplit = newVal + returningVal > 0;

    const pieData = [
      { name: 'First-Time', value: newVal, color: PRIMARY_MAIN },
      { name: 'Returning', value: returningVal, color: ACCENT_GOLD_DARK },
    ];
    const barData = [
      { name: 'First-Time', value: newVal, color: PRIMARY_MAIN },
      { name: 'Returning', value: returningVal, color: ACCENT_GOLD_DARK },
    ];

    return (
      <Stack spacing={{ xs: 2, sm: 3 }}>
        <motion.div variants={itemVariants}>
          <StatGrid cols={3}>
            <StatTile
              icon={<GroupsOutlined sx={{ fontSize: 22 }} />}
              label="Customers"
              value={formatNum(o?.total_participants)}
              tint={ALPHA_PRIMARY_10}
              iconColor={PRIMARY_MAIN}
              caption="Different people who made a purchase"
            />
            <StatTile
              icon={<ConfirmationNumberOutlined sx={{ fontSize: 22 }} />}
              label="Total Entries"
              value={formatNum(o?.total_entries)}
              tint={ALPHA_GREEN_10}
              iconColor={STATUS_ACTIVATED_TEXT}
              caption="All draw entries collected"
            />
            <StatTile
              icon={<AutorenewOutlined sx={{ fontSize: 22 }} />}
              label="Entries per Customer"
              value={Number(o?.avg_entries_per_participant ?? 0).toFixed(1)}
              tint={ACCENT_GOLD_LIGHT}
              iconColor={ACCENT_GOLD_DARK}
              caption="Average entries per person"
              sx={{ gridColumn: { xs: '1 / -1', md: 'auto' } }}
            />
          </StatGrid>
        </motion.div>

        <Box
          sx={{
            display: 'grid',
            gap: { xs: 2, sm: 3 },
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          }}
        >
          {/* New vs Returning */}
          <motion.div variants={itemVariants}>
            <ChartCard
              title="First-Time vs Returning"
              subtitle="New faces vs customers coming back"
              chip={
                <Chip
                  icon={usePie ? <PieChartOutlineOutlined sx={{ fontSize: 16 }} /> : <ShowChartOutlined sx={{ fontSize: 16 }} />}
                  label={rangeChipLabel}
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              }
            >
              {!hasSplit ? (
                <EmptyChart height={CHART_HEIGHT} message="No customers in this period" />
              ) : usePie ? (
                <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={92}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {pieData.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                  <BarChart data={barData} margin={{ left: -12, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                    <YAxis tick={AXIS_TICK} allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} content={<ChartTooltip />} />
                    <Bar dataKey="value" name="Customers" radius={[6, 6, 0, 0]} maxBarSize={90}>
                      {barData.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
              <Stack direction="row" spacing={3} justifyContent="center" sx={{ mt: 1 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight={800} color={PRIMARY_MAIN}>
                    {formatPct(o?.new_pct)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    First-Time
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight={800} sx={{ color: ACCENT_GOLD_DARK }}>
                    {formatPct(o?.returning_pct)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Returning
                  </Typography>
                </Box>
              </Stack>
            </ChartCard>
          </motion.div>

          {/* Entry Cap Utilization */}
          <motion.div variants={itemVariants}>
            <ChartCard title="Draw Capacity Used" subtitle="Entries issued against your cap">
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: CHART_HEIGHT }}>
                {(() => {
                  const showPerDraw = spanMonths >= 3 && (o?.draw_capacity?.length ?? 0) > 1;
                  const drawsToShow = showPerDraw ? [...(o?.draw_capacity ?? [])].reverse() : null;

                  if (showPerDraw && drawsToShow && drawsToShow.length > 0) {
                    // Per-draw list rendering for multi-draw ranges
                    return (
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2,
                          minHeight: CHART_HEIGHT,
                          maxHeight: CHART_HEIGHT,
                          overflowY: 'auto',
                          pr: 1,
                          '&::-webkit-scrollbar': {
                            width: '6px',
                          },
                          '&::-webkit-scrollbar-track': {
                            bgcolor: 'transparent',
                          },
                          '&::-webkit-scrollbar-thumb': {
                            bgcolor: 'action.hover',
                            borderRadius: '3px',
                          },
                        }}
                      >
                        <motion.div
                          variants={{
                            hidden: { opacity: 0 },
                            visible: {
                              opacity: 1,
                              transition: { staggerChildren: 0.06, delayChildren: 0 },
                            },
                          }}
                          initial="hidden"
                          animate="visible"
                          style={{
                            flexGrow: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: 16,
                          }}
                        >
                          {drawsToShow.map((draw) => {
                            const isNearFull = draw.pct >= 90;
                            const isCurrent = draw.status === 'Open';

                            return (
                              <motion.div
                                key={draw.draw_id}
                                variants={{
                                  hidden: { opacity: 0, x: -8 },
                                  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
                                }}
                              >
                                <Stack spacing={0.75}>
                                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Stack direction="row" alignItems="center" spacing={0.75}>
                                      <Typography variant="body2" fontWeight={700}>
                                        {draw.label}
                                      </Typography>
                                      {isCurrent && (
                                        <Chip
                                          label="Current"
                                          size="small"
                                          sx={{
                                            height: 20,
                                            fontSize: '0.65rem',
                                            fontWeight: 700,
                                            bgcolor: ALPHA_PRIMARY_10,
                                            color: PRIMARY_MAIN,
                                          }}
                                        />
                                      )}
                                    </Stack>
                                    <Stack direction="row" spacing={1} alignItems="baseline">
                                      <Typography
                                        variant="caption"
                                        fontWeight={700}
                                        sx={{ color: isNearFull ? STATUS_PENDING_TEXT : 'text.secondary' }}
                                      >
                                        {formatPct(draw.pct)}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        fontWeight={600}
                                        color="text.disabled"
                                        sx={{ minWidth: '60px', textAlign: 'right' }}
                                      >
                                        {formatNum(draw.used)} {draw.cap !== null ? `/ ${formatNum(draw.cap)}` : ''}
                                      </Typography>
                                    </Stack>
                                  </Stack>
                                  {draw.cap !== null ? (
                                    <LinearProgress
                                      variant="determinate"
                                      value={draw.pct}
                                      sx={{
                                        height: 10,
                                        borderRadius: 5,
                                        bgcolor: 'action.hover',
                                        '& .MuiLinearProgress-bar': {
                                          borderRadius: 5,
                                          backgroundColor: isNearFull ? AMBER_HOURGLASS : PRIMARY_MAIN,
                                        },
                                      }}
                                    />
                                  ) : (
                                    <Typography variant="caption" color="text.disabled">
                                      No cap for this draw
                                    </Typography>
                                  )}
                                </Stack>
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      </Box>
                    );
                  }

                  // Single-draw or no-cap fallback (original UI)
                  return cap?.cap == null ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: '-1px' }}>
                        {formatNum(cap?.used)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Entries issued. No cap set
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 1.5 }}>
                        <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.5px' }}>
                          {formatPct(capPct)}
                        </Typography>
                        <Typography variant="body2" fontWeight={700} color="text.secondary">
                          {formatNum(cap?.used)} / {formatNum(cap?.cap)}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={capPct}
                        sx={{
                          height: 14,
                          borderRadius: 7,
                          bgcolor: 'action.hover',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 7,
                            backgroundColor: capNearFull ? AMBER_HOURGLASS : PRIMARY_MAIN,
                          },
                        }}
                      />
                      {capNearFull && (
                        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 1.5 }}>
                          <WarningAmberOutlined sx={{ fontSize: 18, color: STATUS_PENDING_TEXT }} />
                          <Typography variant="caption" fontWeight={700} sx={{ color: STATUS_PENDING_TEXT }}>
                            Approaching your entry cap
                          </Typography>
                        </Stack>
                      )}
                    </>
                  );
                })()}
              </Box>
            </ChartCard>
          </motion.div>
        </Box>

        {/* Customers + entries over time */}
        <motion.div variants={itemVariants}>
          <ChartCard
            title="Customers & Entries"
            subtitle="Activity across the selected period"
            chip={<Chip label={rangeChipLabel} size="small" sx={{ fontWeight: 700 }} />}
          >
            {seriesData.length === 0 ? (
              <EmptyChart message="No activity in this period" />
            ) : (
              <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <ComposedChart data={seriesData} margin={{ left: -14, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} minTickGap={16} />
                  <YAxis tick={AXIS_TICK} allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="entries" name="Entries" fill={PRIMARY_LIGHT} radius={[5, 5, 0, 0]} maxBarSize={40} />
                  <Line
                    type="monotone"
                    dataKey="participants"
                    name="Customers"
                    stroke={PRIMARY_MAIN}
                    strokeWidth={2.5}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </motion.div>
      </Stack>
    );
  };

  const renderAcquisition = () => {
    const a = acquisitionQ.data;
    const acqData = withLabels(a?.acquisitionSeries ?? []);
    return (
      <Stack spacing={{ xs: 2, sm: 3 }}>
        <motion.div variants={itemVariants}>
          <StatGrid cols={4}>
            <StatTile
              icon={<PersonAddAlt1Outlined sx={{ fontSize: 22 }} />}
              label="Joined Winnbell via You"
              value={formatNum(a?.new_users_acquired)}
              tint={ALPHA_PRIMARY_10}
              iconColor={PRIMARY_MAIN}
              caption="First-timers you brought to the app"
            />
            <StatTile
              icon={<TravelExploreOutlined sx={{ fontSize: 22 }} />}
              label="New to Your Shop"
              value={formatNum(a?.business_discovery)}
              tint={ALPHA_GREEN_10}
              iconColor={STATUS_ACTIVATED_TEXT}
              caption="Already on Winnbell, new to you"
            />
            <StatTile
              icon={<VisibilityOutlined sx={{ fontSize: 22 }} />}
              label="Profile Views"
              value={formatNum(a?.profile_views)}
              tint={ACCENT_GOLD_LIGHT}
              iconColor={ACCENT_GOLD_DARK}
              caption="People who viewed your page"
            />
            <StatTile
              icon={<TrendingUpOutlined sx={{ fontSize: 22 }} />}
              label="Visit to Entry"
              value={formatPct(a?.conversion_pct)}
              tint={ALPHA_PRIMARY_10}
              iconColor={PRIMARY_MAIN}
              caption="Customers who viewed your page first"
            />
          </StatGrid>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ChartCard
            title="New Customers and Profile Views"
            subtitle="How customers are finding your business on Winnbell"
            chip={<Chip label={rangeChipLabel} size="small" sx={{ fontWeight: 700 }} />}
          >
            {acqData.length === 0 ? (
              <EmptyChart message="Discovery data will appear here as it accrues" />
            ) : (
              <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <BarChart data={acqData} margin={{ left: -14, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} minTickGap={16} />
                  <YAxis tick={AXIS_TICK} allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="profile_views" name="Profile Views" fill={PRIMARY_LIGHT} radius={[5, 5, 0, 0]} maxBarSize={36} />
                  <Bar dataKey="new_users" name="New Users" fill={ACCENT_GOLD_DARK} radius={[5, 5, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </motion.div>
      </Stack>
    );
  };

  const renderEngagement = () => {
    const e = engagementQ.data;
    const seriesData = withLabels(e?.series ?? []);
    return (
      <Stack spacing={{ xs: 2, sm: 3 }}>
        <motion.div variants={itemVariants}>
          <StatGrid cols={4}>
            <StatTile
              icon={<AutorenewOutlined sx={{ fontSize: 22 }} />}
              label="Repeat Rate"
              value={formatPct(e?.repeat_participation_pct)}
              tint={ALPHA_PRIMARY_10}
              iconColor={PRIMARY_MAIN}
              caption="Customers who made a purchase before"
            />
            <StatTile
              icon={<ConfirmationNumberOutlined sx={{ fontSize: 22 }} />}
              label="Entries per Customer"
              value={Number(e?.avg_entries_per_user ?? 0).toFixed(1)}
              tint={ALPHA_GREEN_10}
              iconColor={STATUS_ACTIVATED_TEXT}
              caption="Average entries per person"
            />
            <StatTile
              icon={<GroupsOutlined sx={{ fontSize: 22 }} />}
              label="Returning Customers"
              value={formatNum(e?.returning_participant_count)}
              tint={ACCENT_GOLD_LIGHT}
              iconColor={ACCENT_GOLD_DARK}
              caption="Came back from an earlier visit"
            />
            <StatTile
              icon={<LoyaltyOutlined sx={{ fontSize: 22 }} />}
              label="Regulars"
              value={formatNum(e?.loyal_customers)}
              tint={ALPHA_PRIMARY_10}
              iconColor={PRIMARY_MAIN}
              caption="Made 2+ purchases in 60 days"
            />
          </StatGrid>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ChartCard
            title="Customers Over Time"
            subtitle="Unique customers across the selected period"
            chip={<Chip label={rangeChipLabel} size="small" sx={{ fontWeight: 700 }} />}
          >
            {seriesData.length === 0 ? (
              <EmptyChart message="No customers in this period" />
            ) : (
              <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <AreaChart data={seriesData} margin={{ left: -14, right: 8 }}>
                  <defs>
                    <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PRIMARY_LIGHT} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={PRIMARY_LIGHT} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} minTickGap={16} />
                  <YAxis tick={AXIS_TICK} allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ stroke: PRIMARY_MAIN, strokeWidth: 1 }} content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="participants"
                    name="Customers"
                    stroke={PRIMARY_MAIN}
                    strokeWidth={2.5}
                    fill="url(#engGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </motion.div>
      </Stack>
    );
  };

  const renderRevenue = () => {
    const r = revenueQ.data;
    const seriesData = withLabels(r?.series ?? []);
    return (
      <Stack spacing={{ xs: 2, sm: 3 }}>
        <motion.div variants={itemVariants}>
          <StatGrid cols={4}>
            <StatTile
              icon={<AttachMoneyOutlined sx={{ fontSize: 22 }} />}
              label="Draw Sales"
              value={formatCurrency(r?.total_qualifying_revenue ?? 0)}
              tint={ALPHA_GREEN_10}
              iconColor={STATUS_ACTIVATED_TEXT}
              caption="Sales that earned draw entries"
            />
            <StatTile
              icon={<SellOutlined sx={{ fontSize: 22 }} />}
              label="Entry Minimum"
              value={formatCurrency(r?.threshold ?? 0)}
              tint={ALPHA_PRIMARY_10}
              iconColor={PRIMARY_MAIN}
              caption="Smallest purchase to earn an entry"
            />
            <StatTile
              icon={<ShoppingBagOutlined sx={{ fontSize: 22 }} />}
              label="Average Receipt"
              value={formatCurrency(r?.avg_purchase_amount ?? 0)}
              tint={ACCENT_GOLD_LIGHT}
              iconColor={ACCENT_GOLD_DARK}
              caption="Average qualifying purchase"
            />
            <StatTile
              icon={<ReceiptLongOutlined sx={{ fontSize: 22 }} />}
              label="Qualifying Receipts"
              value={formatNum(r?.qualifying_receipts ?? 0)}
              tint={ALPHA_PRIMARY_10}
              iconColor={PRIMARY_MAIN}
              caption="Purchases that earned an entry"
            />
          </StatGrid>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ChartCard
            title="Draw Sales Over Time"
            subtitle="Revenue from purchases that qualified for entries"
            chip={<Chip label={rangeChipLabel} size="small" sx={{ fontWeight: 700 }} />}
          >
            {seriesData.length === 0 ? (
              <EmptyChart message="No qualifying revenue in this period" />
            ) : (
              <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <AreaChart data={seriesData} margin={{ left: -4, right: 8 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={STATUS_ACTIVATED_TEXT} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={STATUS_ACTIVATED_TEXT} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} minTickGap={16} />
                  <YAxis
                    tick={AXIS_TICK}
                    axisLine={false}
                    tickLine={false}
                    width={64}
                    tickFormatter={(v: number) => formatCurrency(v)}
                  />
                  <Tooltip cursor={{ stroke: STATUS_ACTIVATED_TEXT, strokeWidth: 1 }} content={<ChartTooltip money />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke={STATUS_ACTIVATED_TEXT}
                    strokeWidth={2.5}
                    fill="url(#revGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </motion.div>
      </Stack>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      const cols = category === 'overview' ? 3 : 4;
      return (
        <Stack spacing={{ xs: 2, sm: 3 }}>
          <StatGridSkeleton cols={cols} />
          <Skeleton variant="rounded" height={320} sx={{ borderRadius: 3 }} />
        </Stack>
      );
    }

    // Only show the overlay while we're actually displaying stale PLACEHOLDER data for a filter
    // that hasn't loaded yet. A background refetch of already-correct data (isFetching) should
    // refresh silently, so the overlay never lingers over data that already matches the filters.
    const shouldShowRefreshing = isPlaceholderData && !isLoading;

    const content =
      category === 'overview' ? renderOverview()
      : category === 'acquisition' ? renderAcquisition()
      : category === 'engagement' ? renderEngagement()
      : category === 'revenue' ? renderRevenue()
      : null;

    return (
      <Box sx={{ position: 'relative' }}>
        <AnimatePresence>{shouldShowRefreshing && <RefreshingOverlay />}</AnimatePresence>
        <motion.div key={category} variants={containerVariants} initial="hidden" animate="visible">
          {content}
        </motion.div>
      </Box>
    );
  };

  return (
    <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: '100dvh' }, pb: { xs: 12, md: 6 } }}>
      <AppMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Hero */}
      <Box sx={{ background: GRADIENT_HERO, pt: { xs: 0, md: 3 }, pb: 10, color: 'white', borderRadius: '0 0 32px 32px' }}>
        <AppHeader onMenuOpen={() => setMenuOpen(true)} onGradient />
        <Container maxWidth="lg" sx={{ px: 3, pt: { xs: 1, md: 0 }, zoom: { xs: 0.9, md: 1 } }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 2,
                  bgcolor: ALPHA_WHITE_15,
                  border: `1px solid ${ALPHA_WHITE_30}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <QueryStatsOutlined sx={{ color: 'white', fontSize: 28 }} />
              </Box>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
              <Box>
                <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.5px' }}>
                  Analytics
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.75 }}>
                  {isBusiness ? 'Business performance insights' : 'Branch performance insights'}
                </Typography>
              </Box>
            </motion.div>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -6, zoom: { xs: 0.9, md: 1 } }}>
        <Stack spacing={{ xs: 2, sm: 3 }}>
          {/* Controls: location + duration */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Paper
              elevation={0}
              sx={{ p: { xs: 1.75, sm: 2 }, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: SHADOW_CARD }}
            >
              <Stack spacing={1.75}>
                {(showLocationFilter || duration === 'month') && (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    {showLocationFilter && (
                      <Autocomplete
                        size="small"
                        options={activeLocations}
                        getOptionLabel={(opt) => opt.name}
                        value={activeLocations.find((l) => l.id === selectedLocation) ?? null}
                        onChange={(_, val) => setSelectedLocation(val?.id ?? '')}
                        isOptionEqualToValue={(a, b) => a.id === b.id}
                        renderInput={(params) => <TextField {...params} label="All locations" />}
                        sx={{ minWidth: 200 }}
                      />
                    )}
                    {duration === 'month' && (
                      <TextField
                        select
                        size="small"
                        label="Select month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        sx={{ minWidth: 180 }}
                      >
                        {monthOptions.map((o) => (
                          <MenuItem key={o.value} value={o.value}>
                            {o.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  </Stack>
                )}

                <Box sx={{ overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
                  <ToggleButtonGroup
                    value={duration}
                    exclusive
                    onChange={(_e, val) => {
                      if (val !== null) setDuration(val as DurationKey);
                    }}
                    size="small"
                    sx={{
                      flexWrap: { xs: 'nowrap', md: 'wrap' },
                      gap: 1,
                      '& .MuiToggleButtonGroup-grouped': {
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: '999px !important',
                        px: 1.75,
                        color: 'text.secondary',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s ease',
                        '&:hover': { bgcolor: 'action.hover' },
                        '&.Mui-selected': {
                          bgcolor: 'primary.main',
                          color: 'white',
                          borderColor: 'primary.main',
                          fontWeight: 700,
                          '&:hover': { bgcolor: 'primary.dark' },
                        },
                      },
                    }}
                  >
                    {DURATION_TABS.map((d) => (
                      <ToggleButton key={d.key} value={d.key} aria-label={d.label}>
                        {d.label}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Box>
              </Stack>
            </Paper>
          </motion.div>

          {/* Category tabs */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
            <Paper
              elevation={0}
              sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: SHADOW_CARD, px: { xs: 0.5, sm: 1 } }}
            >
              <Tabs
                value={category}
                onChange={(_e, v) => setCategory(v as CategoryKey)}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{
                  minHeight: 48,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: { xs: '0.82rem', sm: '0.9rem' },
                    minHeight: 48,
                    color: TEXT_SECONDARY,
                    '&.Mui-selected': { color: PRIMARY_MAIN, fontWeight: 800 },
                  },
                  '& .MuiTabs-indicator': { height: 3, borderRadius: 3, backgroundColor: PRIMARY_MAIN },
                }}
              >
                {CATEGORY_TABS.map((c) => (
                  <Tab key={c.key} value={c.key} label={c.label} />
                ))}
              </Tabs>
            </Paper>
          </motion.div>

          {/* Error state */}
          {isError && !activeQuery.data ? (
            <Alert
              severity="error"
              sx={{ borderRadius: 2 }}
              action={
                <Typography
                  component="button"
                  onClick={() => refetch()}
                  sx={{
                    border: 'none',
                    bgcolor: 'transparent',
                    color: 'inherit',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}
                >
                  Retry
                </Typography>
              }
            >
              We could not load your analytics. Please try again.
            </Alert>
          ) : (
            renderContent()
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export default BusinessAnalyticsPage;
