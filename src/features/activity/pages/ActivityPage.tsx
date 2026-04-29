import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Paper, Stack, MenuItem, Select,
  FormControl, InputLabel, Skeleton, Alert, Chip, Button, ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import {
  ReceiptLongOutlined, AttachMoneyOutlined, ConfirmationNumberOutlined,
  FeedOutlined, QrCodeScannerOutlined, CardGiftcardOutlined,
} from '@mui/icons-material';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
const formatRelativeTime = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
};
import { useAppSelector } from '../../../store/hook';
import { selectCurrentUser } from '../../../store/selectors/authSelectors';
import { useBusinessData } from '../../partner/hooks/useBusinessData';
import { fetchActivity, type DateRange, type ActivityItem } from '../api/activity.api';
import {
  BG_PAGE, GRADIENT_HERO, ALPHA_WHITE_15, ALPHA_WHITE_30, PRIMARY_MAIN,
} from '../../../shared/colors';
import { formatCurrency } from '../../../shared/utils/date';
import KpiCard from '../../stats/components/KpiCard';

const ActivityPage = () => {
  const user = useAppSelector(selectCurrentUser);
  const isLocationManager = !!user?.location_id;

  const [selectedLocation, setSelectedLocation] = useState<number | ''>('');
  const [dateRange, setDateRange] = useState<DateRange>('today');
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [pages, setPages] = useState<ActivityItem[][]>([]);

  const { data: bizData } = useBusinessData(true);
  const locations = bizData?.locations ?? [];

  const locationIdForQuery = isLocationManager
    ? (user?.location_id ?? undefined)
    : (selectedLocation !== '' ? (selectedLocation as number) : undefined);

  const { data: activity, isLoading, isError } = useQuery({
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

  const displayItems = pages.flat();
  const nextCursor = activity?.next_cursor ?? null;

  const handleLoadMore = () => {
    if (nextCursor != null) setCursor(nextCursor);
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'receipt':
        return { color: 'primary', label: 'Receipt' };
      case 'code':
        return { color: 'default', label: 'Code' };
      case 'free':
        return { color: 'success', label: 'Free' };
      case 'promo':
        return { color: 'warning', label: 'Promo' };
      default:
        return { color: 'default', label: source };
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'active') return { dot: '#10b981', text: 'Active', bg: '#ecfdf5', fg: '#065f46' };
    if (status === 'under_review') return { dot: '#f59e0b', text: 'Under Review', bg: '#fffbeb', fg: '#92400e' };
    return { dot: '#999', text: status, bg: '#f3f4f6', fg: '#6b7280' };
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'code':
        return <QrCodeScannerOutlined sx={{ fontSize: 18 }} />;
      case 'free':
      case 'promo':
        return <CardGiftcardOutlined sx={{ fontSize: 18 }} />;
      case 'receipt':
      default:
        return <ReceiptLongOutlined sx={{ fontSize: 18 }} />;
    }
  };

  const getAccentColor = (source: string) => {
    switch (source) {
      case 'receipt':
        return PRIMARY_MAIN;
      case 'code':
        return '#6b7280';
      case 'free':
      case 'promo':
        return '#10b981';
      default:
        return '#999';
    }
  };

  return (
    <Box sx={{ bgcolor: BG_PAGE, minHeight: '100vh', pb: { xs: 12, md: 6 } }}>

      {/* Hero */}
      <Box sx={{ background: GRADIENT_HERO, pt: 3, pb: 9, px: 3, color: 'white', borderRadius: '0 0 32px 32px' }}>
        <Container maxWidth='lg'>
          <Stack direction='row' alignItems='center' spacing={2}>
            <Box sx={{ width: 52, height: 52, borderRadius: 2, bgcolor: ALPHA_WHITE_15, border: `1px solid ${ALPHA_WHITE_30}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ReceiptLongOutlined sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant='h5' fontWeight={800}>Receipt Activity</Typography>
              <Typography variant='body2' sx={{ opacity: 0.75 }}>
                Real-time receipt and entry submissions
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth='lg' sx={{ mt: -5 }}>
        <Stack spacing={3}>

          {/* Filters — top priority */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
              {/* Location dropdown — only show if NOT a location manager */}
              {!isLocationManager && locations.length > 0 && (
                <FormControl size='small' sx={{ minWidth: 180 }}>
                  <InputLabel>All locations</InputLabel>
                  <Select value={selectedLocation} label='All locations' onChange={(e) => handleLocationChange(e.target.value as number | '')}>
                    <MenuItem value=''>All locations</MenuItem>
                    {locations.map((loc) => (
                      <MenuItem key={loc.id} value={loc.id}>{loc.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Date range toggle */}
              <ToggleButtonGroup
                value={dateRange}
                exclusive
                onChange={(_e, newRange) => {
                  if (newRange !== null) handleDateRangeChange(newRange as DateRange);
                }}
                size='small'
                sx={{ height: 'fit-content' }}
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
                <KpiCard
                  icon={<ReceiptLongOutlined sx={{ color: '#1976d2', fontSize: 22 }} />}
                  label='Receipts Today'
                  value={(activity?.summary.receipts_today ?? 0).toLocaleString()}
                  color='rgba(25,118,210,0.12)'
                />
                <KpiCard
                  icon={<AttachMoneyOutlined sx={{ color: '#388e3c', fontSize: 22 }} />}
                  label='Revenue Today'
                  value={formatCurrency(activity?.summary.revenue_today ?? 0)}
                  color='rgba(56,142,60,0.12)'
                />
                <KpiCard
                  icon={<ConfirmationNumberOutlined sx={{ color: '#7b1fa2', fontSize: 22 }} />}
                  label='Entries Issued'
                  value={(activity?.summary.entries_today ?? 0).toLocaleString()}
                  color='rgba(123,31,162,0.12)'
                />
              </>
            )}
          </Stack>

          {isError && <Alert severity='error' sx={{ borderRadius: 3 }}>Failed to load activity. Please try again.</Alert>}

          {/* Activity feed */}
          {isLoading ? (
            <Stack spacing={2}>
              <Skeleton variant='rounded' height={110} sx={{ borderRadius: 3 }} />
              <Skeleton variant='rounded' height={110} sx={{ borderRadius: 3 }} />
              <Skeleton variant='rounded' height={110} sx={{ borderRadius: 3 }} />
            </Stack>
          ) : displayItems.length === 0 ? (
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <FeedOutlined sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant='body1' fontWeight={600} color='text.primary'>
                No receipt activity yet
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Activity will appear here when customers submit receipts at your locations.
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={2.5}>
              {/* Section header with live indicator */}
              <Stack direction='row' alignItems='center' spacing={1} sx={{ px: 0.5 }}>
                <Typography variant='subtitle2' fontWeight={700} color='text.secondary' sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}>
                  Recent Activity
                </Typography>
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
              </Stack>

              {displayItems.map((item, idx) => {
                const sourceBadge = getSourceBadgeColor(item.entry_source);
                const statusColor = getStatusColor(item.status);
                const accentColor = getAccentColor(item.entry_source);
                const sourceIcon = getSourceIcon(item.entry_source);

                return (
                  <Paper
                    key={idx}
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 2.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderLeftWidth: 4,
                      borderLeftColor: accentColor,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2.5,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        borderColor: accentColor,
                        borderLeftColor: accentColor,
                      },
                    }}
                  >
                    {/* Left: source icon */}
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1.5,
                        bgcolor: accentColor + '12',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: accentColor,
                      }}
                    >
                      {sourceIcon}
                    </Box>

                    {/* Middle: main content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {/* Top row: location and amount */}
                      <Stack direction='row' justifyContent='space-between' alignItems='flex-start' sx={{ mb: 1 }}>
                        <Typography variant='body2' fontWeight={700} color='text.primary' sx={{ flex: 1 }}>
                          {item.location_name}
                        </Typography>
                        <Typography variant='h6' fontWeight={700} color='text.primary' sx={{ ml: 2, flexShrink: 0 }}>
                          {item.transaction_amount !== null ? formatCurrency(item.transaction_amount) : '—'}
                        </Typography>
                      </Stack>

                      {/* Bottom row: source + receipt ID, timestamp + status */}
                      <Stack direction='row' justifyContent='space-between' alignItems='center' spacing={2}>
                        <Stack direction='row' alignItems='center' spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                          <Chip
                            label={sourceBadge.label}
                            size='small'
                            variant='outlined'
                            color={sourceBadge.color as any}
                            sx={{ fontWeight: 600, height: 24 }}
                          />
                          {item.receipt_identifier_masked && (
                            <Typography variant='caption' color='text.secondary' sx={{ whiteSpace: 'nowrap' }}>
                              {item.receipt_identifier_masked}
                            </Typography>
                          )}
                        </Stack>

                        {/* Right: timestamp and status pill */}
                        <Stack direction='row' alignItems='center' spacing={1.5} sx={{ flexShrink: 0 }}>
                          <Typography variant='caption' color='text.secondary'>
                            {formatRelativeTime(item.created_at)}
                          </Typography>
                          <Box
                            sx={{
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              bgcolor: statusColor.bg,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                            }}
                          >
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                bgcolor: statusColor.dot,
                                flexShrink: 0,
                              }}
                            />
                            <Typography variant='caption' fontWeight={600} sx={{ color: statusColor.fg, fontSize: '0.7rem' }}>
                              {statusColor.text}
                            </Typography>
                          </Box>
                        </Stack>
                      </Stack>
                    </Box>
                  </Paper>
                );
              })}

              {/* Load more button */}
              {nextCursor !== null && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button variant='outlined' onClick={handleLoadMore}>
                    Load more
                  </Button>
                </Box>
              )}
            </Stack>
          )}

        </Stack>
      </Container>
    </Box>
  );
};

export default ActivityPage;
