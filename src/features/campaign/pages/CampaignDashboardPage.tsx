import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Skeleton,
  Chip,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Autocomplete,
  TextField,
  LinearProgress,
  CircularProgress,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  CampaignOutlined,
  TrendingUpOutlined,
  CheckCircleOutlineOutlined,
  Schedule,
} from '@mui/icons-material';
import AppHeader from '../../../shared/components/AppHeader';
import AppMenuDrawer from '../../../shared/components/AppMenuDrawer';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../store/hook';
import { selectCurrentUser, selectIsBusiness, selectIsLocationManager, selectBusinessIsActive } from '../../../store/selectors/authSelectors';
import { useBusinessData } from '../../partner/hooks/useBusinessData';
import { useCampaignHeader, useCampaignKpis, useCampaignEntries, useCampaigns } from '../hooks/useCampaignData';
import { useSubscription } from '../../subscription/hooks/useSubscription';
import DrawPreparationView from '../../tickets/components/DrawPreparationView';
import {
  GRADIENT_HERO,
  ALPHA_WHITE_15,
  ALPHA_WHITE_30,
  MOBILE_CONTENT_HEIGHT_NO_HEADER,
  TEXT_SECONDARY,
  SHADOW_CARD,
} from '../../../shared/colors';
import { formatCurrency, formatRelativeTime } from '../../../shared/utils/date';
import KpiCard from '../../stats/components/KpiCard';
import type { BusinessLocation } from '../../partner/types/business.types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const CampaignDashboardPage = () => {
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  const isBusiness = useAppSelector(selectIsBusiness);
  const isManager = useAppSelector(selectIsLocationManager);

  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<number | ''>('');
  const [dateRange, setDateRange] = useState<'today' | 'wtd' | 'mtd'>('today');
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const { data: bizData } = useBusinessData(true);
  const locations = (bizData?.locations ?? []).filter((l) => l.is_active) as BusinessLocation[];

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const businessIsActive = useAppSelector(selectBusinessIsActive);
  const { data: subscription } = useSubscription(isBusiness);
  const hasDescription = !!(bizData?.description?.trim());
  const hasLocations = (bizData?.locations?.length ?? 0) > 0;

  const { data: campaignsData, isLoading: campaignsLoading } = useCampaigns();
  const campaigns = campaignsData ?? [];
  const selectedCampaign = campaigns.find(c => c.draw_id === selectedCampaignId) ?? campaigns.find(c => c.is_current) ?? campaigns[0] ?? null;
  const campaignIdForQuery = selectedCampaign?.draw_id;
  const isCurrentCampaign = selectedCampaign?.is_current ?? true;

  // Determine the location_id to use for queries
  const locationIdForQuery = isManager
    ? (user?.location_id ?? undefined)
    : (selectedLocation !== '' ? (selectedLocation as number) : undefined);

  // Queries
  const { data: headerData, isLoading: isHeaderLoading } = useCampaignHeader(locationIdForQuery, campaignIdForQuery, true);
  const { data: kpiData, isLoading: isKpiLoading } = useCampaignKpis(dateRange, locationIdForQuery, isCurrentCampaign ? undefined : campaignIdForQuery, true);
  const {
    data: entriesData,
    isLoading: isEntriesLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useCampaignEntries(locationIdForQuery, campaignIdForQuery);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage && !isEntriesLoading) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, isEntriesLoading, fetchNextPage]);

  const displayEntries = entriesData?.pages.flatMap((p) => p.items) ?? [];

  const getSourceChipColor = (source: string) => {
    switch (source.toLowerCase()) {
      case 'receipt':
        return { color: 'primary' as const, label: 'Receipt' };
      case 'free':
        return { color: 'success' as const, label: 'Free' };
      case 'promo':
        return { color: 'warning' as const, label: 'Promo' };
      default:
        return { color: 'default' as const, label: source };
    }
  };

  // No campaign state
  const noCampaign = !headerData?.has_campaign;

  // A business with no campaigns yet (just subscribed, waiting for the next draw to open, or
  // not subscribed at all) sees the preparation / "getting ready" view instead of an empty dashboard.
  if (!campaignsLoading && campaigns.length === 0) {
    return (
      <DrawPreparationView
        subscription={subscription ?? undefined}
        hasDescription={hasDescription}
        hasLocations={hasLocations}
        isDesktop={isDesktop}
        isManager={isManager}
        isSubscribed={businessIsActive}
      />
    );
  }

  return (
    <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT_NO_HEADER, md: '100dvh' }, pb: { xs: 12, md: 6 } }}>
      <AppMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Hero */}
      <Box sx={{ background: GRADIENT_HERO, pt: { xs: 0, md: 3 }, pb: 10, color: 'white', borderRadius: '0 0 32px 32px' }}>
        <AppHeader onMenuOpen={() => setMenuOpen(true)} onGradient />
        <Container maxWidth="lg" sx={{ px: 3, pt: 1, zoom: { xs: 0.9, md: 0.85 } }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
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
                <CampaignOutlined sx={{ color: 'white', fontSize: 28 }} />
              </Box>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Box>
                <Typography variant="h5" fontWeight={800}>
                  Campaign Dashboard
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.75 }}>
                  Monitor your active campaign and entries
                </Typography>
              </Box>
            </motion.div>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -6, zoom: { xs: 0.9, md: 0.85 } }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <Stack spacing={3}>
            {/* KPIs Section */}
            {!noCampaign && (
              <motion.div variants={itemVariants}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: 'white', border: '1px solid', borderColor: 'divider' }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                    {/* Campaign selector */}
                    {campaigns.length > 1 && (
                      <Autocomplete
                        size="small"
                        options={campaigns}
                        getOptionLabel={(opt) => `${opt.name}${opt.is_current ? ' (Current)' : ''}`}
                        value={selectedCampaign}
                        onChange={(_, val) => setSelectedCampaignId(val?.draw_id ?? null)}
                        isOptionEqualToValue={(a, b) => a.draw_id === b.draw_id}
                        renderInput={(params) => <TextField {...params} label="Campaign" />}
                        sx={{ minWidth: 200 }}
                      />
                    )}

                    {/* Location filter for owners */}
                    {isBusiness && locations.length > 0 && (
                      <Autocomplete
                        size="small"
                        options={locations}
                        getOptionLabel={(opt) => opt.name}
                        value={locations.find((l) => l.id === selectedLocation) ?? null}
                        onChange={(_, val) => setSelectedLocation(val?.id ?? '')}
                        isOptionEqualToValue={(a, b) => a.id === b.id}
                        renderInput={(params) => <TextField {...params} label="All locations" />}
                        sx={{ minWidth: 180 }}
                      />
                    )}

                    {/* Date range toggle — only for the current (Open) campaign */}
                    {isCurrentCampaign && (
                      <ToggleButtonGroup
                        value={dateRange}
                        exclusive
                        onChange={(_e, newRange) => {
                          if (newRange !== null) setDateRange(newRange as any);
                        }}
                        size="small"
                        sx={{
                          height: 'fit-content',
                          ml: 'auto',
                          '& .MuiToggleButton-root': {
                            border: '1px solid',
                            borderColor: 'divider',
                            color: 'text.secondary',
                            transition: 'all 0.2s ease',
                            '&:hover': { bgcolor: 'action.hover' },
                          },
                          '& .MuiToggleButton-root.Mui-selected': {
                            bgcolor: 'primary.main',
                            color: 'white',
                            borderColor: 'primary.main',
                            fontWeight: 600,
                            '&:hover': { bgcolor: 'primary.dark' },
                          },
                        }}
                      >
                        <ToggleButton value="today" aria-label="today">
                          Today
                        </ToggleButton>
                        <ToggleButton value="wtd" aria-label="week to date">
                          WTD
                        </ToggleButton>
                        <ToggleButton value="mtd" aria-label="month to date">
                          MTD
                        </ToggleButton>
                      </ToggleButtonGroup>
                    )}
                  </Stack>

                  {/* KPI Cards */}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                    {isKpiLoading ? (
                      <>
                        <Skeleton variant="rounded" height={100} sx={{ flex: 1, borderRadius: 2 }} />
                        <Skeleton variant="rounded" height={100} sx={{ flex: 1, borderRadius: 2 }} />
                        <Skeleton variant="rounded" height={100} sx={{ flex: 1, borderRadius: 2 }} />
                      </>
                    ) : kpiData ? (
                      <>
                        <KpiCard
                          icon={<CheckCircleOutlineOutlined sx={{ color: '#1976d2', fontSize: 22 }} />}
                          label="Entries"
                          value={kpiData.entries.toLocaleString()}
                          color="rgba(25,118,210,0.12)"
                        />
                        <KpiCard
                          icon={<TrendingUpOutlined sx={{ color: '#388e3c', fontSize: 22 }} />}
                          label="Revenue"
                          value={formatCurrency(kpiData.revenue)}
                          color="rgba(56,142,60,0.12)"
                        />
                        <KpiCard
                          icon={<CampaignOutlined sx={{ color: '#f57c00', fontSize: 22 }} />}
                          label="Customers"
                          value={kpiData.customers.toLocaleString()}
                          color="rgba(245,124,0,0.12)"
                        />
                      </>
                    ) : null}
                  </Stack>
                </Paper>
              </motion.div>
            )}

            {/* Campaign Card */}
            <motion.div variants={itemVariants}>
              {isHeaderLoading ? (
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    width: '100%',
                    p: 3,
                    mb: 4,
                    bgcolor: 'white',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: SHADOW_CARD,
                  }}
                >
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Skeleton variant="text" width="35%" height={24} />
                      <Skeleton variant="rounded" width={100} height={28} />
                    </Stack>
                    <Stack spacing={1}>
                      <Skeleton variant="text" width="20%" height={16} />
                      <Skeleton variant="text" width="25%" height={32} />
                    </Stack>
                    <Stack spacing={1}>
                      <Skeleton variant="text" width="30%" height={16} />
                      <Skeleton variant="rounded" height={10} />
                      <Skeleton variant="text" width="40%" height={14} />
                    </Stack>
                  </Stack>
                </Paper>
              ) : noCampaign ? (
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    width: '100%',
                    p: 4,
                    mb: 4,
                    bgcolor: 'white',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: SHADOW_CARD,
                    textAlign: 'center',
                  }}
                >
                  <CampaignOutlined sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1, color: 'text.primary' }}>
                    No active campaign
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                    Start a campaign to begin issuing entries to customers.
                  </Typography>
                  {isBusiness && (
                    <Button
                      variant="contained"
                      onClick={() => navigate('/subscribe')}
                      sx={{
                        fontWeight: 700,
                        textTransform: 'none',
                      }}
                    >
                      Start Campaign
                    </Button>
                  )}
                </Paper>
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    width: '100%',
                    p: 3,
                    mb: 4,
                    bgcolor: 'white',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: SHADOW_CARD,
                  }}
                >
                  <Stack spacing={2.5}>
                    {/* Top row: Campaign name + Status pill */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: 'text.primary' }}
                      >
                        {headerData?.campaign_name || 'Campaign'}
                      </Typography>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.75,
                          bgcolor: headerData?.status === 'Open' ? 'primary.main' : 'action.disabledBackground',
                          color: headerData?.status === 'Open' ? 'white' : 'text.secondary',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 12,
                          fontSize: '0.85rem',
                          fontWeight: 600,
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: headerData?.status === 'Open' ? 'white' : 'text.disabled',
                          }}
                        />
                        {headerData?.status === 'Open' ? 'Active' : 'Ended'}
                      </Box>
                    </Stack>

                    {/* Prize row */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={1}>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 600, color: TEXT_SECONDARY, display: 'block', mb: 0.5 }}
                        >
                          Prize
                        </Typography>
                        <Typography
                          sx={{ fontWeight: 700, fontSize: '1.75rem', color: 'primary.main' }}
                        >
                          {formatCurrency(headerData?.prize_amount ?? 0)}
                        </Typography>
                      </Box>
                      {headerData?.days_remaining !== null && (
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.75,
                            bgcolor: 'action.hover',
                            px: 1.5,
                            py: 0.75,
                            borderRadius: 1,
                            fontSize: '0.875rem',
                            color: 'text.secondary',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <Schedule sx={{ fontSize: 16 }} />
                          {headerData.days_remaining === 0
                            ? 'Ends today'
                            : `${headerData.days_remaining} day${headerData.days_remaining !== 1 ? 's' : ''} left`}
                        </Box>
                      )}
                    </Stack>

                    {/* Entry Capacity Section */}
                    {headerData?.entry_cap !== null && (
                      <Box sx={{ pt: 1 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 600, color: TEXT_SECONDARY }}
                          >
                            Entry Capacity
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 700, color: 'text.primary' }}
                          >
                            {headerData.entries_used} / {headerData.entry_cap}
                          </Typography>
                        </Stack>
                        <Box sx={{ mb: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={(headerData.entries_used / headerData.entry_cap) * 100}
                            sx={{
                              height: 10,
                              borderRadius: 5,
                              bgcolor: 'action.disabled',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 5,
                                backgroundColor: headerData.cap_reached ? 'warning.main' : 'primary.main',
                              },
                            }}
                          />
                        </Box>
                        {headerData?.cap_reached && (
                          <Chip
                            label="Capacity reached"
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 600, color: 'text.secondary' }}
                          />
                        )}
                      </Box>
                    )}
                  </Stack>
                </Paper>
              )}
            </motion.div>

            {/* Entries Feed */}
            {!noCampaign && (
              <motion.div variants={itemVariants}>
                <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: 'white', border: '1px solid', borderColor: 'divider' }}>
                  {/* Header */}
                  <Box sx={{ px: 3, py: 1.5, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Typography variant="subtitle2" fontWeight={700} color={TEXT_SECONDARY} sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}>
                        Recent Entries
                      </Typography>
                    </Stack>
                  </Box>

                  {/* Loading state */}
                  {isEntriesLoading ? (
                    <Stack spacing={0}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Box key={i} sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}>
                          <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
                        </Box>
                      ))}
                    </Stack>
                  ) : displayEntries.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <CampaignOutlined sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="body1" fontWeight={600} color="text.primary">
                        No entries yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Entries from customers will appear here
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={0}>
                      {displayEntries.map((entry, idx) => {
                        const sourceBadge = getSourceChipColor(entry.entry_source);
                        const isUnderReview = entry.status === 'under_review';
                        const customerInitial = entry.customer_masked.charAt(0).toUpperCase();

                        return (
                          <motion.div
                            key={entry.ticket_id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Box
                              sx={{
                                px: 3,
                                py: 2.5,
                                borderBottom: idx === displayEntries.length - 1 ? 'none' : '1px solid',
                                borderColor: 'divider',
                                transition: 'bgcolor 0.2s ease',
                                '&:hover': {
                                  bgcolor: 'action.hover',
                                },
                              }}
                            >
                              {/* Mobile layout */}
                              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                                  <Avatar
                                    sx={{
                                      width: 36,
                                      height: 36,
                                      bgcolor: 'primary.light',
                                      color: 'primary.main',
                                      fontWeight: 700,
                                      fontSize: '0.875rem',
                                      flexShrink: 0,
                                    }}
                                  >
                                    {customerInitial}
                                  </Avatar>
                                  <Box flex={1} minWidth={0}>
                                    <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ mb: 0.25 }}>
                                      {entry.customer_masked}
                                    </Typography>
                                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                                      <Chip
                                        label={sourceBadge.label}
                                        size="small"
                                        variant="outlined"
                                        color={sourceBadge.color}
                                        sx={{ fontWeight: 600, height: 22, fontSize: '0.7rem' }}
                                      />
                                      <Typography variant="caption" color="text.secondary">
                                        {formatRelativeTime(entry.created_at)}
                                      </Typography>
                                    </Stack>
                                  </Box>
                                  <Box sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                    {entry.transaction_amount !== null && (
                                      <Typography variant="body2" fontWeight={700} color="primary.main">
                                        {formatCurrency(entry.transaction_amount)}
                                      </Typography>
                                    )}
                                  </Box>
                                </Stack>

                                {/* Status */}
                                <Box sx={{ mt: 1 }}>
                                  {isUnderReview ? (
                                    <Chip
                                      label="Under review"
                                      size="small"
                                      variant="outlined"
                                      color="warning"
                                      sx={{ fontWeight: 600, height: 22 }}
                                    />
                                  ) : (
                                    <Chip
                                      label="Approved"
                                      size="small"
                                      variant="outlined"
                                      color="success"
                                      sx={{ fontWeight: 600, height: 22 }}
                                    />
                                  )}
                                </Box>
                              </Box>

                              {/* Desktop layout */}
                              <Box sx={{ display: { xs: 'none', md: 'grid' }, gridTemplateColumns: '40px minmax(0, 1fr) 120px 130px', gap: 2, alignItems: 'center' }}>
                                <Avatar
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    bgcolor: 'primary.light',
                                    color: 'primary.main',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                  }}
                                >
                                  {customerInitial}
                                </Avatar>

                                <Box minWidth={0}>
                                  <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', mb: 0.25 }}>
                                    {entry.customer_masked}
                                  </Typography>
                                  <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flexWrap: 'wrap' }}>
                                    <Chip
                                      label={sourceBadge.label}
                                      size="small"
                                      variant="outlined"
                                      color={sourceBadge.color}
                                      sx={{ fontWeight: 600, height: 22, fontSize: '0.7rem' }}
                                    />
                                    <Typography variant="caption" color="text.secondary">
                                      {formatRelativeTime(entry.created_at)}
                                    </Typography>
                                    {!isManager && (
                                      <Typography variant="caption" color="text.secondary">
                                        · {entry.location_name}
                                      </Typography>
                                    )}
                                  </Stack>
                                </Box>

                                {entry.transaction_amount !== null ? (
                                  <Typography variant="body2" fontWeight={700} color="primary.main" sx={{ textAlign: 'right' }}>
                                    {formatCurrency(entry.transaction_amount)}
                                  </Typography>
                                ) : (
                                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'right' }}>
                                    —
                                  </Typography>
                                )}

                                <Box>
                                  {isUnderReview ? (
                                    <Chip
                                      label="Under review"
                                      size="small"
                                      variant="outlined"
                                      color="warning"
                                      sx={{ fontWeight: 600, height: 24 }}
                                    />
                                  ) : (
                                    <Chip
                                      label="Approved"
                                      size="small"
                                      variant="outlined"
                                      color="success"
                                      sx={{ fontWeight: 600, height: 24 }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            </Box>
                          </motion.div>
                        );
                      })}
                    </Stack>
                  )}

                  {/* Load more observer target */}
                  {hasNextPage && <Box ref={observerTarget} sx={{ py: 2, textAlign: 'center' }}>
                    {isFetchingNextPage && <CircularProgress size={32} />}
                  </Box>}
                </Paper>
              </motion.div>
            )}
          </Stack>
        </motion.div>
      </Container>
    </Box>
  );
};

export default CampaignDashboardPage;
