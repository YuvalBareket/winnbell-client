import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  TextField,
  InputAdornment,
  Skeleton,
  IconButton,
  Tooltip,
  Button,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import StorefrontIcon from '@mui/icons-material/Storefront';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BUSINESS_SECTORS } from '../../data';
import {
  PRIMARY_MAIN, PRIMARY_TINT, BG_ROW_SUBTLE, TEXT_TERTIARY, TEXT_HEADING,
  BORDER_SUBTLE, STATUS_ACTIVATED_BG, STATUS_ACTIVATED_TEXT, STATUS_PENDING_BG, STATUS_PENDING_TEXT,
  METRIC_BAD_TINT, METRIC_BAD, METRIC_WARN_TINT, METRIC_WARN, METRIC_GOOD_TINT, METRIC_GOOD,
  TEXT_SECONDARY,
} from '../../../../shared/colors';
import { riseIn, staggerContainer, popIn } from '../../../../shared/motion';
import { AdminCard } from './adminUi';
import { useAdminBusinesses, useHealthSummary } from '../../hooks/useAdmin';
import { useDebounce } from '../../../../shared/hooks/useDebounce';
import { formatRelativeTime } from '../../../../shared/utils/date';
import BusinessDetailDrawer from './BusinessDetailDrawer';

interface Props {
  isMobile: boolean;
}

const SUB_COLOR: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'default' }> = {
  Active: { label: 'Active', color: 'success' },
  Trialing: { label: 'Trial', color: 'warning' },
  Past_Due: { label: 'Past Due', color: 'error' },
  Cancelled: { label: 'Cancelled', color: 'error' },
  Incomplete: { label: 'Incomplete', color: 'default' },
};

const FLAG_TO_LABEL: Record<string, string> = {
  billing_issue: 'Billing issue',
  setup_gap: 'Setup incomplete',
  no_recent_entries: 'No entries in 7 days',
  low_engagement: 'Low customer engagement',
};

const LIMIT = 25;

const FILTER_TYPES = [
  {
    key: 'next_ready',
    label: 'Next campaign',
    tipTitle: 'Next campaign',
    tipLines: [
      'Businesses that will be enrolled automatically the moment the next campaign opens.',
      'Requires: active or trial subscription, paid period covering today, not paused, not skipping.',
      'Uses the exact same rule as the real enrollment, so this number is what will actually happen.',
    ],
  },
  {
    key: 'attention',
    label: 'Needs attention',
    tipTitle: 'Needs attention',
    tipLines: [
      'Every business with at least one warning.',
      'Your daily starting point.',
      'Click to see them all, worst first.',
    ],
  },
  {
    key: 'no_recent_entries',
    label: 'No recent entries',
    tipTitle: 'No recent entries',
    tipLines: [
      'In the live campaign, but zero entries in the last 7 days.',
      'Usually the flyer is not displayed or staff are not mentioning it.',
      'Worth a call. New campaigns get a 7 day grace period.',
    ],
  },
  {
    key: 'low_engagement',
    label: 'Low engagement',
    tipTitle: 'Low engagement',
    tipLines: [
      'Very little real engagement from customers.',
      'Examples: 2 or fewer customers, nobody comes back, or many profile views with almost no entries.',
      'Customers may not understand how to enter.',
    ],
  },
  {
    key: 'billing',
    label: 'Billing issues',
    tipTitle: 'Billing issues',
    tipLines: [
      'Subscription payment is past due or incomplete.',
      'If it stays unpaid, they drop out of the next campaign.',
    ],
  },
  {
    key: 'setup',
    label: 'Setup gaps',
    tipTitle: 'Setup gaps',
    tipLines: [
      'Subscribed, but something is missing.',
      'No receipt example, no active locations, or not enrolled in the live campaign.',
      'They are paying but cannot receive entries.',
    ],
  },
] as const;

// Structured tooltip body: bold title + short spaced lines. Long single-string tooltips
// render as one cramped paragraph; this keeps each point on its own line.
const tipContent = (title: string, lines: readonly string[]) => (
  <Box sx={{ p: 0.5, maxWidth: 260 }}>
    <Typography sx={{ fontWeight: 700, fontSize: 12.5, mb: 0.75 }}>{title}</Typography>
    <Stack spacing={0.75}>
      {lines.map((line, i) => (
        <Typography key={i} sx={{ fontSize: 12, lineHeight: 1.45 }}>{line}</Typography>
      ))}
    </Stack>
  </Box>
);

type FilterKey = typeof FILTER_TYPES[number]['key'];

const BusinessesTab: React.FC<Props> = ({ isMobile }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey | null>(null);
  const [selectedBizId, setSelectedBizId] = useState<number | null>(null);
  const debouncedSearch = useDebounce(search, 400);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const { data: summary, isLoading: summaryLoading } = useHealthSummary();

  const {
    data,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAdminBusinesses({ limit: LIMIT, search: debouncedSearch, filter: activeFilter || undefined });

  // Refetch overlay: keepPreviousData shows the STALE list while a new filter/search loads,
  // which reads as "the click did nothing". Blur + spinner make the refresh visible.
  // Initial load keeps its skeletons; mobile next-page fetch keeps its own bottom spinner.
  const isRefreshing = isFetching && !isLoading && !isFetchingNextPage;

  // Infinite scroll for mobile: observe sentinel element
  useEffect(() => {
    if (!isMobile) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isMobile, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // For desktop: fetch the target page if it hasn't been loaded yet
  const handlePageChange = useCallback(
    (_e: unknown, newPage: number) => {
      setPage(newPage);
      const pagesLoaded = data?.pages.length ?? 0;
      if (newPage + 1 > pagesLoaded && hasNextPage) {
        fetchNextPage();
      }
    },
    [data?.pages.length, hasNextPage, fetchNextPage],
  );

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  }, []);

  const subChip = (status: string | null) => {
    if (!status) return (
      <Chip
        label='None'
        size='small'
        sx={{
          bgcolor: METRIC_BAD_TINT,
          color: METRIC_BAD,
          fontWeight: 700,
          borderRadius: '8px',
        }}
      />
    );
    let bgColor = METRIC_BAD_TINT;
    let textColor = METRIC_BAD;
    if (status === 'Active') {
      bgColor = STATUS_ACTIVATED_BG;
      textColor = STATUS_ACTIVATED_TEXT;
    } else if (status === 'Trialing') {
      bgColor = STATUS_PENDING_BG;
      textColor = STATUS_PENDING_TEXT;
    }
    const cfg = SUB_COLOR[status] ?? { label: status, color: 'default' as const };
    return (
      <Chip
        label={cfg.label}
        size='small'
        sx={{
          bgcolor: bgColor,
          color: textColor,
          fontWeight: 700,
          borderRadius: '8px',
        }}
      />
    );
  };

  const healthBadge = (health: string | undefined, flags: string[] | undefined) => {
    if (!health) return null;
    let bgColor = 'transparent';
    let textColor = TEXT_SECONDARY;
    if (health === 'at_risk') {
      bgColor = METRIC_BAD_TINT;
      textColor = METRIC_BAD;
    } else if (health === 'watch') {
      bgColor = METRIC_WARN_TINT;
      textColor = METRIC_WARN;
    } else if (health === 'good') {
      bgColor = METRIC_GOOD_TINT;
      textColor = METRIC_GOOD;
    }

    // Good badges get an explainer too - the column header promises "hover a badge for
    // the exact reasons", so a silent badge would feel broken.
    const flagLabels = (flags ?? []).map((f) => FLAG_TO_LABEL[f] || f);
    const tipLines = flagLabels.length > 0 ? flagLabels : ['No warnings. Entries flowing normally.'];

    const label = health === 'at_risk' ? 'At risk' : health === 'watch' ? 'Watch' : 'Good';

    return (
      <Tooltip title={tipContent('Why', tipLines)} enterTouchDelay={50} leaveTouchDelay={4000} arrow>
        <Chip
          label={label}
          size='small'
          sx={{
            bgcolor: bgColor,
            color: textColor,
            fontWeight: 700,
            borderRadius: '8px',
            cursor: 'help',
          }}
        />
      </Tooltip>
    );
  };

  // Desktop: show only the current page's rows
  const desktopRows = data?.pages[page]?.rows ?? [];
  const total = data?.pages[0]?.total ?? 0;

  // Mobile: accumulate all fetched rows
  const mobileRows = data?.pages.flatMap((p) => p.rows) ?? [];

  return (
    <motion.div initial='hidden' animate='visible' variants={riseIn}>
    <Stack spacing={3}>
      {/* Health Strip */}
      <motion.div variants={staggerContainer} initial='hidden' animate='visible'>
        <Stack spacing={1.5}>
          <Typography variant='subtitle2' sx={{ fontWeight: 700, color: TEXT_HEADING, fontSize: '0.875rem' }}>
            Business Health
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {summaryLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <motion.div key={i} variants={popIn}>
                  <Skeleton variant='rounded' width={120} height={48} />
                </motion.div>
              ))
            ) : (
              FILTER_TYPES.map((filter) => {
                const count = summary ? (summary[filter.key as keyof typeof summary] as number) || 0 : 0;
                const isActive = activeFilter === filter.key;
                const isMuted = count === 0;
                // Card accent: green = positive enrollment forecast, red = urgent, amber = watch.
                const accent = filter.key === 'next_ready'
                  ? { main: METRIC_GOOD, tint: METRIC_GOOD_TINT }
                  : (filter.key === 'attention' || filter.key === 'billing' || filter.key === 'setup')
                  ? { main: METRIC_BAD, tint: METRIC_BAD_TINT }
                  : { main: METRIC_WARN, tint: METRIC_WARN_TINT };
                // "Next campaign" reads as ready-out-of-total; warning cards show a plain count.
                const countLabel = filter.key === 'next_ready'
                  ? `(${count} / ${summary?.total ?? 0})`
                  : count > 0 ? `(${count})` : '';

                return (
                  <motion.div key={filter.key} variants={popIn}>
                    <Tooltip title={tipContent(filter.tipTitle, filter.tipLines)} enterTouchDelay={50} leaveTouchDelay={4000} arrow>
                    <Button
                      variant='outlined'
                      onClick={() => {
                        if (isMuted) return; // zero-count cards only explain themselves, no filtering
                        setActiveFilter(isActive ? null : filter.key);
                        setPage(0);
                      }}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        px: 1.5,
                        py: 1,
                        borderRadius: '10px',
                        borderColor: isActive ? accent.main : 'transparent',
                        bgcolor: isActive ? accent.tint : (isMuted ? BG_ROW_SUBTLE : 'transparent'),
                        color: isActive ? accent.main : (isMuted ? TEXT_TERTIARY : TEXT_HEADING),
                        border: isActive ? `2px solid` : 'none',
                        '&:hover': {
                          borderColor: isActive ? accent.main : undefined,
                          bgcolor: isActive ? accent.tint : (isMuted ? BG_ROW_SUBTLE : 'transparent'),
                        },
                        // Keep pointer events ON even at zero count so the explainer tooltip
                        // still opens; the onClick guard above prevents filtering to nothing.
                        cursor: isMuted ? 'default' : 'pointer',
                        opacity: isMuted ? 0.5 : 1,
                      }}
                    >
                      {filter.label} {countLabel}
                    </Button>
                    </Tooltip>
                  </motion.div>
                );
              })
            )}
          </Box>
        </Stack>
      </motion.div>

      <Box display='flex' justifyContent='space-between' alignItems='center' flexWrap='wrap' gap={1}>
        <TextField
          size='small'
          placeholder='Search name or owner...'
          value={search}
          onChange={handleSearch}
          InputProps={{ startAdornment: <InputAdornment position='start'><SearchIcon fontSize='small' /></InputAdornment> }}
          sx={{
            width: { xs: '100%', sm: 280 },
            '& .MuiOutlinedInput-root': { borderRadius: '12px' },
          }}
        />
      </Box>

      <Box sx={{ position: 'relative' }}>
      <Box sx={{ filter: isRefreshing ? 'blur(3px)' : 'none', pointerEvents: isRefreshing ? 'none' : 'auto', transition: 'filter 0.2s ease' }}>
      {isMobile ? (
        <Stack spacing={2}>
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} variant='rounded' height={90} />)
            : mobileRows.map((biz) => {
                const sectorData = BUSINESS_SECTORS[biz.sector as keyof typeof BUSINESS_SECTORS];
                return (
                  <motion.div key={biz.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
                    <Box sx={{ cursor: 'pointer' }} onClick={() => setSelectedBizId(biz.id)}>
                      <AdminCard sx={{ cursor: 'pointer' }} hover>
                        <Box sx={{ p: 2 }}>
                          <Stack spacing={1.5}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box
                                sx={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  width: 40, height: 40, borderRadius: '12px',
                                  bgcolor: PRIMARY_TINT, color: PRIMARY_MAIN,
                                }}
                              >
                                {sectorData?.icon || <StorefrontIcon />}
                              </Box>
                              <Box flex={1} minWidth={0}>
                                <Typography variant='subtitle2' fontWeight={800} noWrap sx={{ color: TEXT_HEADING }}>{biz.name}</Typography>
                                <Typography variant='caption' sx={{ color: TEXT_TERTIARY }} noWrap>
                                  {biz.owner_name ?? biz.owner_email ?? '-'}
                                </Typography>
                              </Box>
                              <Tooltip title='View dashboard'>
                                <IconButton
                                  size='small'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/admin/businesses/${biz.id}/view`);
                                  }}
                                  sx={{ color: PRIMARY_MAIN }}
                                >
                                  <OpenInNewIcon fontSize='small' />
                                </IconButton>
                              </Tooltip>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                              {healthBadge(biz.health, biz.flags)}
                              {subChip(biz.subscription_status)}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                              <Box>
                                {/* total_activated is ALL-TIME; the label must say so - the desktop
                                    table's numbers are current-campaign scoped. */}
                                <Typography variant='h6' fontWeight={800} sx={{ color: TEXT_HEADING }}>{biz.total_activated}</Typography>
                                <Typography variant='caption' sx={{ color: TEXT_TERTIARY }}>total entries</Typography>
                              </Box>
                              <Box>
                                <Typography variant='h6' fontWeight={800} sx={{ color: TEXT_HEADING }}>{biz.location_count}</Typography>
                                <Typography variant='caption' sx={{ color: TEXT_TERTIARY }}>locations</Typography>
                              </Box>
                            </Box>
                            {biz.last_entry_at && (
                              <Typography variant='caption' sx={{ color: TEXT_TERTIARY }}>
                                Last entry: {formatRelativeTime(biz.last_entry_at)}
                              </Typography>
                            )}
                          </Stack>
                        </Box>
                      </AdminCard>
                    </Box>
                  </motion.div>
                );
              })}
          {isFetchingNextPage &&
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={`more-${i}`} variant='rounded' height={90} />)}
          <div ref={sentinelRef} />
        </Stack>
      ) : (
        <AdminCard sx={{ overflow: 'hidden' }}>
          <Table size='small'>
            <TableHead>
              <TableRow sx={{ bgcolor: BG_ROW_SUBTLE }}>
                <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: TEXT_TERTIARY, fontSize: 12 }}>Business</TableCell>
                <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: TEXT_TERTIARY, fontSize: 12 }}>Owner</TableCell>
                <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: TEXT_TERTIARY, fontSize: 12 }}>Subscription</TableCell>
                <TableCell align='center' sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: TEXT_TERTIARY, fontSize: 12 }}>
                  <Tooltip
                    title={tipContent('Health', [
                      'At risk: billing problem or no entries in 7 days. Act today.',
                      'Watch: setup gap or weak engagement. Worth a look.',
                      'Good: entries flowing normally.',
                      'Hover a badge for the exact reasons.',
                    ])}
                    enterTouchDelay={50} leaveTouchDelay={4000} arrow
                  >
                    <Box component='span' sx={{ cursor: 'help', borderBottom: '1px dotted', borderColor: TEXT_TERTIARY }}>Health</Box>
                  </Tooltip>
                </TableCell>
                <TableCell align='center' sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: TEXT_TERTIARY, fontSize: 12 }}>
                  <Tooltip
                    title={tipContent('Last Entry', [
                      'When this business last received a customer entry in the live campaign.',
                      'None means no entries yet this campaign, or no campaign is open.',
                      'Turns red when the last entry is more than 7 days old.',
                    ])}
                    enterTouchDelay={50} leaveTouchDelay={4000} arrow
                  >
                    <Box component='span' sx={{ cursor: 'help', borderBottom: '1px dotted', borderColor: TEXT_TERTIARY }}>Last Entry</Box>
                  </Tooltip>
                </TableCell>
                <TableCell align='center' sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: TEXT_TERTIARY, fontSize: 12 }}>
                  <Tooltip
                    title={tipContent('Customers', [
                      'Different people who entered during the live campaign.',
                      'Shows 0 between campaigns.',
                      'Many entries from 1 or 2 people is not real engagement.',
                    ])}
                    enterTouchDelay={50} leaveTouchDelay={4000} arrow
                  >
                    <Box component='span' sx={{ cursor: 'help', borderBottom: '1px dotted', borderColor: TEXT_TERTIARY }}>Customers</Box>
                  </Tooltip>
                </TableCell>
                <TableCell align='center' sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: TEXT_TERTIARY, fontSize: 12 }}>
                  <Tooltip
                    title={tipContent('Cap Used', [
                      'Share of the entry capacity they pay for that customers actually used this campaign.',
                      'Very low near campaign end means they are not getting value and may cancel.',
                    ])}
                    enterTouchDelay={50} leaveTouchDelay={4000} arrow
                  >
                    <Box component='span' sx={{ cursor: 'help', borderBottom: '1px dotted', borderColor: TEXT_TERTIARY }}>Cap Used</Box>
                  </Tooltip>
                </TableCell>
                <TableCell align='center' sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: TEXT_TERTIARY, fontSize: 12 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i} sx={{ '&:hover': { bgcolor: BG_ROW_SUBTLE } }}>
                      {Array.from({ length: 9 }).map((__, j) => (
                        <TableCell key={j}><Skeleton /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : desktopRows.map((biz, idx) => {
                    const sectorData = BUSINESS_SECTORS[biz.sector as keyof typeof BUSINESS_SECTORS];
                    return (
                      <TableRow
                        key={biz.id}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { bgcolor: BG_ROW_SUBTLE },
                          borderBottom: idx < desktopRows.length - 1 ? `1px solid ${BORDER_SUBTLE}` : 'none',
                        }}
                        onClick={() => setSelectedBizId(biz.id)}
                      >
                        <TableCell sx={{ fontWeight: 600, maxWidth: 180 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '12px', bgcolor: PRIMARY_TINT, color: PRIMARY_MAIN }}>
                              {sectorData?.icon || <StorefrontIcon sx={{ fontSize: 20 }} />}
                            </Box>
                            <Typography variant='body2' fontWeight={600} noWrap>{biz.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 140 }}>
                          <Typography variant='body2' noWrap>{biz.owner_name ?? '-'}</Typography>
                          <Typography variant='caption' sx={{ color: TEXT_TERTIARY }} noWrap>{biz.owner_email ?? ''}</Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 100 }}>{subChip(biz.subscription_status)}</TableCell>
                        <TableCell align='center' sx={{ maxWidth: 100 }}>
                          {healthBadge(biz.health, biz.flags)}
                        </TableCell>
                        <TableCell align='center' sx={{ fontSize: '0.875rem', color: biz.last_entry_at && biz.enrolled && new Date().getTime() - new Date(biz.last_entry_at).getTime() > 7 * 24 * 60 * 60 * 1000 ? METRIC_BAD : TEXT_TERTIARY }}>
                          {biz.last_entry_at ? formatRelativeTime(biz.last_entry_at) : 'None'}
                        </TableCell>
                        <TableCell align='center' sx={{ fontSize: '0.875rem', color: TEXT_HEADING }}>
                          {biz.unique_customers ?? '-'}
                        </TableCell>
                        <TableCell align='center' sx={{ fontSize: '0.875rem', color: TEXT_TERTIARY }}>
                          {/* 0% is meaningful (paying for capacity nobody uses) - only a missing/zero
                              cap renders the placeholder. */}
                          {biz.total_cap
                            ? `${Math.round(((biz.entries_current ?? 0) / biz.total_cap) * 100)}%`
                            : '-'}
                        </TableCell>
                        <TableCell align='center'>
                          <Tooltip title='View dashboard'>
                            <IconButton
                              size='small'
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/businesses/${biz.id}/view`);
                              }}
                              sx={{ color: PRIMARY_MAIN }}
                            >
                              <OpenInNewIcon fontSize='small' />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              {!isLoading && desktopRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align='center' sx={{ py: 4, color: TEXT_TERTIARY }}>
                    No businesses found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            component='div'
            count={total}
            page={page}
            rowsPerPage={LIMIT}
            rowsPerPageOptions={[LIMIT]}
            onPageChange={handlePageChange}
            sx={{ borderTop: `1px solid ${BORDER_SUBTLE}` }}
          />
        </AdminCard>
      )}
      </Box>
      {isRefreshing && (
        <Box sx={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={36} thickness={4} />
        </Box>
      )}
      </Box>
    </Stack>

    <BusinessDetailDrawer businessId={selectedBizId} onClose={() => setSelectedBizId(null)} />
    </motion.div>
  );
};

export default BusinessesTab;
