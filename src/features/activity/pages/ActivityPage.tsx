import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Paper, Stack, Skeleton, Alert, Chip, Button, ToggleButton, ToggleButtonGroup, Autocomplete, TextField,
} from '@mui/material';
import {
  ReceiptLongOutlined, AttachMoneyOutlined,
  FeedOutlined,
  RocketLaunch,
} from '@mui/icons-material';
import AppHeader from '../../../shared/components/AppHeader';
import AppMenuDrawer from '../../../shared/components/AppMenuDrawer';
import { useNavigate } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useAppSelector } from '../../../store/hook';
import { selectCurrentUser } from '../../../store/selectors/authSelectors';
import { useBusinessData } from '../../partner/hooks/useBusinessData';
import { fetchActivity, type DateRange, type ActivityItem } from '../api/activity.api';
import {
  GRADIENT_HERO, ALPHA_WHITE_15, ALPHA_WHITE_30, MOBILE_CONTENT_HEIGHT_NO_HEADER,
} from '../../../shared/colors';
import { formatCurrency, formatRelativeTime } from '../../../shared/utils/date';
import KpiCard from '../../stats/components/KpiCard';

const ActivityPage = () => {
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  const isLocationManager = !!user?.location_id;

  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<number | ''>('');
  const [dateRange, setDateRange] = useState<DateRange>('today');
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [pages, setPages] = useState<ActivityItem[][]>([]);

  const { data: bizData } = useBusinessData(true);
  const locations = bizData?.locations ?? []; // includes soft-deleted for historical filtering

  const locationIdForQuery = isLocationManager
    ? (user?.location_id ?? undefined)
    : (selectedLocation !== '' ? (selectedLocation as number) : undefined);

  const { data: activity, isLoading, isFetching, isError } = useQuery({
    queryKey: ['business', 'activity', locationIdForQuery, dateRange, cursor],
    queryFn: () => fetchActivity({ location_id: locationIdForQuery, date_range: dateRange, cursor }),
    placeholderData: keepPreviousData,
  });

  // Accumulate pages: cursor undefined = fresh load, cursor set = append page
  useEffect(() => {
    if (!activity?.items) return;
    if (cursor === undefined) {
      setPages([activity.items]);
    } else {
      setPages(prev => [...prev, activity.items!]);
    }
  }, [activity]);

  const resetFilters = () => {
    setCursor(undefined);
    setPages([]);
  };

  const handleLocationChange = (locId: number | '') => {
    setSelectedLocation(locId);
    resetFilters();
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    resetFilters();
  };

  // Show skeletons on filter/location changes (cursor=undefined), but not during "load more"
  const isRefreshing = isFetching && cursor === undefined;

  const displayItems = pages.flat();
  const nextCursor = activity?.next_cursor ?? null;

  const handleLoadMore = () => {
    if (nextCursor != null) setCursor(nextCursor);
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'receipt':
        return { color: 'primary', label: 'Receipt' };
      case 'free':
        return { color: 'success', label: 'Free' };
      case 'promo':
        return { color: 'warning', label: 'Promo' };
      default:
        return { color: 'default', label: source };
    }
  };


  const getPeriodLabel = (range: DateRange) => {
    switch (range) {
      case 'today':
        return 'Today';
      case '7d':
        return 'Last 7 Days';
      case '30d':
        return 'Last 30 Days';
      default:
        return 'Activity';
    }
  };

  return (
    <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT_NO_HEADER, md: '100dvh' }, pb: { xs: 12, md: 6 }, zoom: { xs: 0.9, md: 1 } }}>
      <AppHeader onMenuOpen={() => setMenuOpen(true)} />
      <AppMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Hero */}
      <Box sx={{ background: GRADIENT_HERO, pt: 3, pb: 10, px: 3, color: 'white', borderRadius: '0 0 32px 32px' }}>
        <Container maxWidth='lg'>
          <Stack direction='row' alignItems='center' spacing={2}>
            <Box sx={{ width: 52, height: 52, borderRadius: 2, bgcolor: ALPHA_WHITE_15, border: `1px solid ${ALPHA_WHITE_30}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ReceiptLongOutlined sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant='h5' fontWeight={800}>Receipt Activity</Typography>
              <Typography variant='body2' sx={{ opacity: 0.75 }}>
                Showing activity for {getPeriodLabel(dateRange)}
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth='lg' sx={{ mt: -6 }}>
        <Stack spacing={3}>

          {/* Not-live banner - business admin only, until subscribed */}
          {!isLocationManager && !bizData?.is_subscribed && bizData && (
            <Paper
              elevation={0}
              onClick={() => navigate('/subscribe')}
              sx={{
                p: 2,
                borderRadius: 2,

                bgcolor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                cursor: 'pointer',
              }}
            >
              <Stack direction='row' alignItems='center' spacing={1.5} minWidth={0}>
                <RocketLaunch sx={{ color: 'warning.main', fontSize: 22, flexShrink: 0 }} />
                <Box minWidth={0}>
                  <Typography variant='body2' fontWeight={700} color='warning.dark'>
                    Your business isn't live yet
                  </Typography>
                  <Typography variant='caption' color='text.secondary' sx={{ display: { xs: 'none', sm: 'block' } }}>
                    Customers can't find you until you subscribe - tap to get started.
                  </Typography>
                  <Typography variant='caption' color='text.secondary' sx={{ display: { xs: 'block', sm: 'none' } }}>
                    Tap to subscribe and go live
                  </Typography>
                </Box>
              </Stack>
              <Button
                size='small'
                variant='contained'
                onClick={(e) => { e.stopPropagation(); navigate('/subscribe'); }}
                sx={{ fontWeight: 800, flexShrink: 0, bgcolor: 'warning.main', '&:hover': { bgcolor: 'warning.dark' }, whiteSpace: 'nowrap' }}
              >
                Subscribe
              </Button>
            </Paper>
          )}

          {/* Filters */}
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: 'white' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
              {/* Location dropdown - only show if NOT a location manager */}
              {!isLocationManager && locations.length > 0 && (
                <Autocomplete
                  size='small'
                  options={locations}
                  getOptionLabel={(opt) => opt.is_active ? opt.name : `${opt.name} (removed)`}
                  value={locations.find(l => l.id === selectedLocation) ?? null}
                  onChange={(_, val) => handleLocationChange(val?.id ?? '')}
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                  renderInput={(params) => <TextField {...params} label='All locations' />}
                  sx={{ minWidth: 180 }}
                />
              )}

              {/* Date range toggle - styled with filled selected state */}
              <ToggleButtonGroup
                value={dateRange}
                exclusive
                onChange={(_e, newRange) => {
                  if (newRange !== null) handleDateRangeChange(newRange as DateRange);
                }}
                size='small'
                sx={{
                  height: 'fit-content',
                  '& .MuiToggleButton-root': {
                    border: '1px solid',
                    borderColor: 'divider',
                    color: 'text.secondary',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  },
                  '& .MuiToggleButton-root.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    borderColor: 'primary.main',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  },
                }}
              >
                <ToggleButton value='today' aria-label='today'>
                  Today
                </ToggleButton>
                <ToggleButton value='7d' aria-label='last 7 days'>
                  Last 7 Days
                </ToggleButton>
                <ToggleButton value='30d' aria-label='last 30 days'>
                  Last 30 Days
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Paper>

          {/* KPI cards - 2 cards, larger */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {isLoading || isRefreshing ? (
              <>
                <Skeleton variant='rounded' height={100} sx={{ flex: 1, borderRadius: 2 }} />
                <Skeleton variant='rounded' height={100} sx={{ flex: 1, borderRadius: 2 }} />
              </>
            ) : (
              <>
                <KpiCard
                  icon={<ReceiptLongOutlined sx={{ color: '#1976d2', fontSize: 22 }} />}
                  label='Receipts'
                  value={(activity?.summary.receipts_period ?? 0).toLocaleString()}
                  color='rgba(25,118,210,0.12)'
                />
                <KpiCard
                  icon={<AttachMoneyOutlined sx={{ color: '#388e3c', fontSize: 22 }} />}
                  label='Revenue'
                  value={formatCurrency(activity?.summary.revenue_period ?? 0)}
                  color='rgba(56,142,60,0.12)'
                />
              </>
            )}
          </Stack>

          {isError && <Alert severity='error' sx={{ borderRadius: 2 }}>Failed to load activity. Please try again.</Alert>}

          {/* Activity feed */}
          {isError ? null : isLoading || isRefreshing ? (
            <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: 'white' }}>
              <Box sx={{ px: 3, py: 1.5, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant='subtitle2' fontWeight={700} color='text.secondary' sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}>
                  Recent Activity
                </Typography>
              </Box>
              <Stack spacing={0}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Box key={i} sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}>
                    <Skeleton variant='rectangular' height={60} sx={{ borderRadius: 1 }} />
                  </Box>
                ))}
              </Stack>
            </Paper>
          ) : displayItems.length === 0 ? (
            <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <FeedOutlined sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant='body1' fontWeight={600} color='text.primary'>
                No receipt activity yet
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Activity will appear here when customers submit receipts at your locations.
              </Typography>
            </Paper>
          ) : (
            <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: 'white' }}>
              {/* Section header with live indicator */}
              <Box sx={{ px: 3, py: 1.5, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Stack direction='row' alignItems='center' spacing={1}>
                  <Typography variant='subtitle2' fontWeight={700} color='text.secondary' sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}>
                    Recent Activity
                  </Typography>
                  {dateRange === 'today' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: '#10b981',
                          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                          '@keyframes pulse': {
                            '0%, 100%': { opacity: 1 },
                            '50%': { opacity: 0.5 },
                          },
                        }}
                      />
                      <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.65rem' }}>
                        LIVE
                      </Typography>
                    </Box>
                  )}
                </Stack>
                <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.75rem' }}>
                  Amount
                </Typography>
              </Box>

              {/* Activity rows */}
              <Stack spacing={0}>
                {displayItems.map((item, idx) => {
                  const sourceBadge = getSourceBadgeColor(item.entry_source);

                  return (
                    <Box
                      key={item.ticket_id}
                      sx={{
                        px: 3,
                        py: 2,
                        borderBottom: idx === displayItems.length - 1 ? 'none' : '1px solid',
                        borderColor: 'divider',
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        gap: 2,
                        alignItems: 'center',
                        transition: 'bgcolor 0.2s ease',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      {/* Left: location, receipt ID, source chip */}
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant='body2' fontWeight={700} color='text.primary' sx={{ mb: 0.5 }}>
                          {item.location_name}
                        </Typography>
                        <Stack direction='row' alignItems='center' spacing={1} sx={{ minWidth: 0 }}>
                          <Chip
                            label={sourceBadge.label}
                            size='small'
                            variant='outlined'
                            color={sourceBadge.color as any}
                            sx={{ fontWeight: 600, height: 24 }}
                          />
                          {item.receipt_identifier_masked && (
                            <Typography variant='caption' color='text.secondary' sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.receipt_identifier_masked}
                            </Typography>
                          )}
                        </Stack>
                      </Box>

                      {/* Right: amount and timestamp */}
                      <Box sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <Typography variant='body2' fontWeight={700} color='text.primary' sx={{ mb: 0.25 }}>
                          {item.transaction_amount !== null ? formatCurrency(item.transaction_amount) : '-'}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {formatRelativeTime(item.created_at)}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>

              {/* Load more button */}
              {nextCursor !== null && (
                <Box sx={{ borderTop: '1px solid', borderColor: 'divider', p: 2, textAlign: 'center' }}>
                  <Button variant='outlined' onClick={handleLoadMore} fullWidth>
                    Load more
                  </Button>
                </Box>
              )}
            </Paper>
          )}

        </Stack>
      </Container>
    </Box>
  );
};

export default ActivityPage;
