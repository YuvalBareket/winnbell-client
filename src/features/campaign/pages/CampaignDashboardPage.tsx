import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Skeleton,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Autocomplete,
  TextField,
  CircularProgress,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { motion } from 'framer-motion';
import { staggerContainer, popIn, riseIn } from '../../../shared/motion';
import {
  CampaignOutlined,
  TrendingUpOutlined,
  CheckCircleOutlineOutlined,
  PeopleAltOutlined,
  ScheduleOutlined,
  KeyboardArrowDownRounded,
  KeyboardArrowLeftRounded,
  KeyboardArrowRightRounded,
  PlaceOutlined,
  ReceiptOutlined,
  CardGiftcardOutlined,
} from '@mui/icons-material';
import AppPageHero from '../../../shared/components/AppPageHero';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../store/hook';
import { selectCurrentUser, selectIsBusiness, selectIsLocationManager, selectBusinessIsActive } from '../../../store/selectors/authSelectors';
import { useBusinessData } from '../../partner/hooks/useBusinessData';
import { useCampaignHeader, useCampaignKpis, useCampaignEntries, useCampaigns } from '../hooks/useCampaignData';
import { useSubscription } from '../../subscription/hooks/useSubscription';
import DrawPreparationView from '../../tickets/components/DrawPreparationView';
import {
  MOBILE_CONTENT_HEIGHT,
  TEXT_HEADING,
  TEXT_SECONDARY,
  TEXT_TERTIARY,
  BORDER_SUBTLE,
  BORDER_LIGHT,
  BG_SUBTLE,
  CHART_GRID,
  PRIMARY_MAIN,
  ACCENT_GOLD_DARK,
  STATUS_ACTIVATED_TEXT,
  STATUS_PENDING_TEXT,
  GRADIENT_GOLD_PRIZE,
  GRADIENT_PROGRESS_BAR,
  ALPHA_PRIMARY_10,
  ALPHA_GREEN_10,
  ALPHA_ORANGE_12,
  AVATAR_BLUE_BG,
  BORDER_RECEIPT,
  BORDER_APPROVED,
  BORDER_REVIEW,
  BORDER_PROMO,
  SHADOW_CARD,
} from '../../../shared/colors';
import { formatCurrency, formatRelativeTime } from '../../../shared/utils/date';
import type { BusinessLocation } from '../../partner/types/business.types';


// Compact revenue for the tight mobile KPI card (e.g. $4.8k); full currency on desktop.
const compactCurrency = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : formatCurrency(n);

// Source badge (Receipt / Weekly / Promo) colours - text + light border, matching the design.
// 'free' stays the internal source value; the label avoids "free" so no entry kind reads as paid.
const sourceBadge = (source: string) => {
  switch (source.toLowerCase()) {
    case 'receipt':
      return { label: 'Receipt', color: PRIMARY_MAIN, border: BORDER_RECEIPT };
    case 'free':
      return { label: 'Weekly', color: STATUS_ACTIVATED_TEXT, border: BORDER_APPROVED };
    case 'promo':
      return { label: 'Promo', color: ACCENT_GOLD_DARK, border: BORDER_PROMO };
    default:
      return { label: source, color: TEXT_SECONDARY, border: BORDER_LIGHT };
  }
};

const CampaignDashboardPage = () => {
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  const isBusiness = useAppSelector(selectIsBusiness);
  const isManager = useAppSelector(selectIsLocationManager);

  const [selectedLocation, setSelectedLocation] = useState<number | ''>('');
  const [dateRange, setDateRange] = useState<'today' | 'wtd' | 'mtd'>('today');
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [campaignAnchor, setCampaignAnchor] = useState<HTMLElement | null>(null);
  const [locationAnchor, setLocationAnchor] = useState<HTMLElement | null>(null);
  // Desktop entries are paginated (one page at a time via Back/Next); mobile keeps infinite scroll.
  const [entriesPage, setEntriesPage] = useState(0);
  const entriesTopRef = useRef<HTMLDivElement | null>(null);

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
    // The feed shows the SAME period the KPI toggle selects (live campaign only - past
    // campaigns have no toggle and show their full history).
  } = useCampaignEntries(locationIdForQuery, campaignIdForQuery, isCurrentCampaign ? dateRange : undefined);

  const loadedPages = entriesData?.pages ?? [];
  const allEntries = loadedPages.flatMap((p) => p.items);
  // Entries are paginated (one page at a time via Back/Next) on every viewport.
  const displayEntries = loadedPages[entriesPage]?.items ?? [];
  const canGoBack = entriesPage > 0;
  const canGoNext = entriesPage < loadedPages.length - 1 || hasNextPage;

  // Any filter change gives the entries query a fresh cache entry that starts at page 0,
  // so the page cursor must snap back to the first page too (incl. the period toggle).
  useEffect(() => {
    setEntriesPage(0);
  }, [locationIdForQuery, campaignIdForQuery, dateRange]);

  // Bring the top of the entries card back into view when the page changes, so a new page
  // always starts from its first row instead of wherever the last page was scrolled to.
  const scrollEntriesToTop = () =>
    entriesTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const goToNextPage = async () => {
    if (entriesPage < loadedPages.length - 1) {
      setEntriesPage((p) => p + 1);
    } else if (hasNextPage && !isFetchingNextPage) {
      // fetchNextPage resolves once the page is appended, so advancing after it is safe.
      await fetchNextPage();
      setEntriesPage((p) => p + 1);
    }
    scrollEntriesToTop();
  };
  const goToPrevPage = () => {
    setEntriesPage((p) => Math.max(0, p - 1));
    scrollEntriesToTop();
  };

  // No campaign state
  const noCampaign = !headerData?.has_campaign;

  const hasReceiptExample = !!bizData?.receipt_example_image_url;
  // An owner who skipped the receipt example during subscribe is still enrolled and active
  // (they paid), but keeps seeing the preparation view instead of the dashboard until they
  // add it. Managers are not gated - they cannot upload the receipt example.
  const ownerMissingReceipt = isBusiness && !!bizData && !hasReceiptExample;

  // A business with no campaigns yet (just subscribed, waiting for the next draw to open, or
  // not subscribed at all) sees the preparation / "getting ready" view instead of an empty dashboard.
  if (!campaignsLoading && (campaigns.length === 0 || ownerMissingReceipt)) {
    return (
      <DrawPreparationView
        subscription={subscription ?? undefined}
        hasDescription={hasDescription}
        hasLocations={hasLocations}
        hasReceiptExample={hasReceiptExample}
        minSpend={bizData?.min_transaction_amount ?? null}
        inActiveCampaign={campaigns.length > 0}
        isDesktop={isDesktop}
        isManager={isManager}
        isSubscribed={businessIsActive}
      />
    );
  }

  // Campaign selector, location filter, date-range toggle. On DESKTOP they go into the page
  // header card (actions slot); on MOBILE they stay in the body above the KPIs (the mobile hero
  // is a gradient band where these white controls would look out of place).
  const headerControls = noCampaign ? null : (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }} sx={{ width: { xs: '100%', sm: 'auto' } }}>
      {campaigns.length > 1 && (
        <Autocomplete
          size="small"
          options={campaigns}
          getOptionLabel={(opt) => `${opt.name}${opt.is_current ? ' (Current)' : ''}`}
          value={selectedCampaign}
          onChange={(_, val) => setSelectedCampaignId(val?.draw_id ?? null)}
          isOptionEqualToValue={(a, b) => a.draw_id === b.draw_id}
          renderInput={(params) => <TextField {...params} label="Campaign" />}
          sx={{ minWidth: 190 }}
        />
      )}
      {isBusiness && locations.length > 0 && (
        <Autocomplete
          size="small"
          options={locations}
          getOptionLabel={(opt) => opt.name}
          value={locations.find((l) => l.id === selectedLocation) ?? null}
          onChange={(_, val) => setSelectedLocation(val?.id ?? '')}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          renderInput={(params) => <TextField {...params} label="All locations" />}
          sx={{ minWidth: 170 }}
        />
      )}
      {isCurrentCampaign && (
        <ToggleButtonGroup
          value={dateRange}
          exclusive
          onChange={(_e, newRange) => { if (newRange !== null) setDateRange(newRange as 'today' | 'wtd' | 'mtd'); }}
          size="small"
          sx={{
            height: 'fit-content',
            '& .MuiToggleButton-root': {
              border: '1px solid', borderColor: 'divider', color: 'text.secondary',
              transition: 'all 0.2s ease', '&:hover': { bgcolor: 'action.hover' },
            },
            '& .MuiToggleButton-root.Mui-selected': {
              bgcolor: 'primary.main', color: 'white', borderColor: 'primary.main', fontWeight: 600,
              '&:hover': { bgcolor: 'primary.dark' },
            },
          }}
        >
          <ToggleButton value="today" aria-label="today">Today</ToggleButton>
          <ToggleButton value="wtd" aria-label="week to date">WTD</ToggleButton>
          <ToggleButton value="mtd" aria-label="month to date">MTD</ToggleButton>
        </ToggleButtonGroup>
      )}
    </Stack>
  );

  // Mobile controls: clean white pills (campaign + location) over a full-width segmented
  // date toggle, matching the design. Desktop keeps the labelled inputs in the hero.
  const showCampaignPill = campaigns.length > 1;
  const showLocationPill = isBusiness && locations.length > 0;
  const selectedLocationName = locations.find((l) => l.id === selectedLocation)?.name ?? 'All locations';
  const pillSx = {
    flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.75,
    bgcolor: 'white', border: `1px solid ${BORDER_SUBTLE}`, borderRadius: '11px', px: 1.5, py: '10px',
    fontSize: '12.5px', fontWeight: 700, color: TEXT_HEADING, cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
  } as const;

  const mobileControls = noCampaign ? null : (
    <Stack spacing={1.25}>
      {(showCampaignPill || showLocationPill) && (
        <Stack direction="row" spacing={1}>
          {showCampaignPill && (
            <Box onClick={(e) => setCampaignAnchor(e.currentTarget)} sx={pillSx}>
              <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedCampaign?.name ?? 'Campaign'}
              </Box>
              <KeyboardArrowDownRounded sx={{ fontSize: 17, color: TEXT_TERTIARY, flexShrink: 0 }} />
            </Box>
          )}
          {showLocationPill && (
            <Box onClick={(e) => setLocationAnchor(e.currentTarget)} sx={pillSx}>
              <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                <PlaceOutlined sx={{ fontSize: 16, color: TEXT_TERTIARY, flexShrink: 0 }} />
                <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedLocationName}</Box>
              </Box>
              <KeyboardArrowDownRounded sx={{ fontSize: 17, color: TEXT_TERTIARY, flexShrink: 0 }} />
            </Box>
          )}
        </Stack>
      )}

      {isCurrentCampaign && (
        <Box sx={{ display: 'flex', bgcolor: 'white', border: `1px solid ${BORDER_SUBTLE}`, borderRadius: '11px', overflow: 'hidden' }}>
          {(['today', 'wtd', 'mtd'] as const).map((r) => (
            <Box
              key={r}
              onClick={() => setDateRange(r)}
              sx={{
                flex: 1, textAlign: 'center', py: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                bgcolor: dateRange === r ? PRIMARY_MAIN : 'transparent',
                color: dateRange === r ? 'white' : TEXT_SECONDARY,
                transition: 'background-color 0.15s ease', WebkitTapHighlightColor: 'transparent',
              }}
            >
              {r === 'today' ? 'Today' : r.toUpperCase()}
            </Box>
          ))}
        </Box>
      )}

      <Menu anchorEl={campaignAnchor} open={!!campaignAnchor} onClose={() => setCampaignAnchor(null)}>
        {campaigns.map((c) => (
          <MenuItem
            key={c.draw_id}
            selected={c.draw_id === selectedCampaign?.draw_id}
            onClick={() => { setSelectedCampaignId(c.draw_id); setCampaignAnchor(null); }}
            sx={{ fontSize: '13px', fontWeight: 600 }}
          >
            {c.name}{c.is_current ? ' (Current)' : ''}
          </MenuItem>
        ))}
      </Menu>
      <Menu anchorEl={locationAnchor} open={!!locationAnchor} onClose={() => setLocationAnchor(null)}>
        <MenuItem selected={selectedLocation === ''} onClick={() => { setSelectedLocation(''); setLocationAnchor(null); }} sx={{ fontSize: '13px', fontWeight: 600 }}>
          All locations
        </MenuItem>
        {locations.map((l) => (
          <MenuItem
            key={l.id}
            selected={l.id === selectedLocation}
            onClick={() => { setSelectedLocation(l.id); setLocationAnchor(null); }}
            sx={{ fontSize: '13px', fontWeight: 600 }}
          >
            {l.name}
          </MenuItem>
        ))}
      </Menu>
    </Stack>
  );

  // ── KPI tiles ────────────────────────────────────────────────
  const kpiTiles = kpiData
    ? [
        { label: 'Entries', mobileLabel: 'Entries', value: kpiData.entries.toLocaleString(), mobileValue: kpiData.entries.toLocaleString(), Icon: CheckCircleOutlineOutlined, tint: ALPHA_PRIMARY_10, iconColor: PRIMARY_MAIN },
        { label: 'Revenue', mobileLabel: 'Revenue', value: formatCurrency(kpiData.revenue), mobileValue: compactCurrency(kpiData.revenue), Icon: TrendingUpOutlined, tint: ALPHA_GREEN_10, iconColor: STATUS_ACTIVATED_TEXT },
        { label: 'Customers', mobileLabel: 'Custmrs', value: kpiData.customers.toLocaleString(), mobileValue: kpiData.customers.toLocaleString(), Icon: PeopleAltOutlined, tint: ALPHA_ORANGE_12, iconColor: STATUS_PENDING_TEXT },
      ]
    : [];

  const kpiSection = (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: { xs: 1.25, md: 2 } }}>
      {isKpiLoading || !kpiData
        ? [0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" sx={{ height: { xs: 92, md: 88 }, borderRadius: { xs: '14px', md: '16px' } }} />)
        : kpiTiles.map((k) => (
            <Box
              key={k.label}
              sx={{
                bgcolor: 'white',
                border: `1px solid ${BORDER_SUBTLE}`,
                borderRadius: { xs: '14px', md: '16px' },
                p: { xs: '12px 13px', md: '20px' },
                boxShadow: SHADOW_CARD,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'flex-start', md: 'center' },
                gap: { xs: 1, md: 1.875 },
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  width: { xs: 30, md: 48 },
                  height: { xs: 30, md: 48 },
                  borderRadius: { xs: '9px', md: '13px' },
                  bgcolor: k.tint,
                  color: k.iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <k.Icon sx={{ fontSize: { xs: 16, md: 24 } }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: { xs: '9.5px', md: '12px' }, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', color: TEXT_TERTIARY, lineHeight: 1.2 }}>
                  {isDesktop ? k.label : k.mobileLabel}
                </Typography>
                <Typography sx={{ fontSize: { xs: '20px', md: '28px' }, fontWeight: 800, letterSpacing: '-0.02em', color: TEXT_HEADING, mt: '2px', whiteSpace: 'nowrap' }}>
                  {isDesktop ? k.value : k.mobileValue}
                </Typography>
              </Box>
            </Box>
          ))}
    </Box>
  );

  // ── Days-left pill (shared) ──────────────────────────────────
  const dr = headerData?.days_remaining;
  const daysLeftPill = dr != null ? (
    <Box
      sx={{
        display: 'inline-flex', alignItems: 'center', gap: 0.75, flexShrink: 0,
        bgcolor: BG_SUBTLE, borderRadius: '9px', px: 1.5, py: 0.875,
        fontSize: { xs: '11.5px', md: '13px' }, fontWeight: 700, color: TEXT_SECONDARY, whiteSpace: 'nowrap',
      }}
    >
      <ScheduleOutlined sx={{ fontSize: { xs: 13, md: 15 } }} />
      {dr === 0 ? 'Ends today' : `${dr} day${dr !== 1 ? 's' : ''} left`}
    </Box>
  ) : null;

  const capPct = headerData?.entry_cap
    ? Math.min(100, Math.round((headerData.entries_used / headerData.entry_cap) * 1000) / 10)
    : 0;

  // ── Campaign card (loaded) ───────────────────────────────────
  const campaignCard = (
    <Box sx={{ bgcolor: 'white', border: `1px solid ${BORDER_SUBTLE}`, borderRadius: '18px', p: { xs: 2, md: 3 }, boxShadow: SHADOW_CARD }}>
      {/* Title + (mobile) days-left pill */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: { xs: 1.5, md: 2.25 } }}>
        <Typography sx={{ fontSize: { xs: '15px', md: '17px' }, fontWeight: 800, color: TEXT_HEADING, letterSpacing: '-0.01em', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {headerData?.campaign_name || 'Campaign'}
        </Typography>
        {!isDesktop && daysLeftPill}
      </Stack>

      {/* Prize + (desktop) days-left pill */}
      <Stack direction="row" alignItems="flex-end" justifyContent="space-between" spacing={1.5} sx={{ mb: { xs: 1.75, md: 2.75 } }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: TEXT_TERTIARY, mb: 0.5 }}>
            Prize
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '30px', md: '34px' }, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05,
              background: GRADIENT_GOLD_PRIZE, backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}
          >
            {formatCurrency(headerData?.prize_amount ?? 0)}
          </Typography>
        </Box>
        {isDesktop && daysLeftPill}
      </Stack>

      {/* Entry capacity */}
      {headerData?.entry_cap != null && (
        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.125 }}>
            <Typography sx={{ fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: TEXT_TERTIARY }}>
              Entry capacity
            </Typography>
            <Typography sx={{ fontSize: '13px', fontWeight: 800, color: TEXT_HEADING }}>
              {headerData.entries_used} / {headerData.entry_cap}
            </Typography>
          </Stack>
          <Box sx={{ height: { xs: 9, md: 10 }, borderRadius: '6px', bgcolor: CHART_GRID, overflow: 'hidden' }}>
            <Box sx={{ width: `${capPct}%`, height: '100%', borderRadius: '6px', background: GRADIENT_PROGRESS_BAR, transition: 'width 0.5s ease' }} />
          </Box>
        </Box>
      )}

      {/* Threshold + draw date (desktop only, matching the design) */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Box sx={{ height: '1px', bgcolor: BG_SUBTLE, my: 2 }} />
        <Stack spacing={1.5}>
          {bizData?.min_transaction_amount != null && bizData.min_transaction_amount !== 0 && (
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: TEXT_SECONDARY }}>Threshold per entry</Typography>
              <Typography sx={{ fontSize: '13px', fontWeight: 800, color: TEXT_HEADING }}>{formatCurrency(bizData.min_transaction_amount)}</Typography>
            </Stack>
          )}
          {headerData?.start_date && (
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: TEXT_SECONDARY }}>Started</Typography>
              <Typography sx={{ fontSize: '13px', fontWeight: 800, color: TEXT_HEADING }}>
                {new Date(headerData.start_date).toLocaleDateString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric', year: 'numeric' })}
              </Typography>
            </Stack>
          )}
          {headerData?.draw_date && (
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: TEXT_SECONDARY }}>Draws on</Typography>
              <Typography sx={{ fontSize: '13px', fontWeight: 800, color: TEXT_HEADING }}>
                {new Date(headerData.draw_date).toLocaleDateString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric', year: 'numeric' })}
              </Typography>
            </Stack>
          )}
        </Stack>
      </Box>
    </Box>
  );

  const cardSkeleton = (
    <Box sx={{ bgcolor: 'white', border: `1px solid ${BORDER_SUBTLE}`, borderRadius: '18px', p: 3, boxShadow: SHADOW_CARD }}>
      <Stack spacing={2}>
        <Skeleton variant="text" width="55%" height={26} />
        <Stack spacing={1}>
          <Skeleton variant="text" width="25%" height={16} />
          <Skeleton variant="text" width="45%" height={40} />
        </Stack>
        <Stack spacing={1}>
          <Skeleton variant="text" width="40%" height={16} />
          <Skeleton variant="rounded" height={10} sx={{ borderRadius: '6px' }} />
        </Stack>
      </Stack>
    </Box>
  );

  // ── Entries feed ─────────────────────────────────────────────
  // Only surface which location an entry came from when viewing all locations of a multi-branch
  // business (redundant when a single location is filtered, or for a location manager).
  const showEntryLocation = !isManager && selectedLocation === '' && locations.length > 1;

  const entriesFeed = (
    <>
      {/* Scroll anchor: Back/Next paging scrolls this into view so a new page starts at the top.
          scrollMarginTop keeps the anchor clear of the page header. */}
      <Box ref={entriesTopRef} sx={{ scrollMarginTop: { xs: 72, md: 88 } }} />
      {/* Mobile shows a section label above the card; desktop puts the header inside the card. */}
      {!isDesktop && (
        <Typography sx={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: TEXT_TERTIARY, mb: 1.25 }}>
          Recent entries
        </Typography>
      )}
      <Box sx={{ bgcolor: 'white', border: `1px solid ${BORDER_SUBTLE}`, borderRadius: { xs: '16px', md: '18px' }, overflow: 'hidden', boxShadow: SHADOW_CARD }}>
        {isDesktop && (
          <Box sx={{ px: '22px', py: '15px', borderBottom: `1px solid ${CHART_GRID}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: TEXT_SECONDARY }}>Recent entries</Typography>
          </Box>
        )}

        {isEntriesLoading ? (
          <Stack>
            {[0, 1, 2, 3, 4].map((i) => (
              <Box key={i} sx={{ px: { xs: '14px', md: '22px' }, py: { xs: '12px', md: '16px' }, borderBottom: i === 4 ? 'none' : `1px solid ${BG_SUBTLE}` }}>
                <Skeleton variant="rounded" height={44} sx={{ borderRadius: '10px' }} />
              </Box>
            ))}
          </Stack>
        ) : allEntries.length === 0 ? (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <CampaignOutlined sx={{ fontSize: 44, color: 'text.disabled', mb: 1.5 }} />
            <Typography sx={{ fontSize: '15px', fontWeight: 700, color: TEXT_HEADING }}>No entries yet</Typography>
            <Typography sx={{ fontSize: '13px', color: TEXT_TERTIARY, mt: 0.5 }}>Entries from customers will appear here.</Typography>
          </Box>
        ) : (
          <Box>
            {displayEntries.map((entry, idx) => {
              const badge = sourceBadge(entry.entry_source);
              // Only the exception is labeled: normal entries carry no status chip, an
              // entry under review shows the (business-safe) "Under review" tag.
              const isUnderReview = entry.status === 'under_review';
              // The feed identifies the submission (receipt id), never the customer.
              const title = entry.receipt_identifier ?? `${badge.label} entry`;
              const RowIcon = entry.entry_source === 'receipt' ? ReceiptOutlined : CardGiftcardOutlined;
              const last = idx === displayEntries.length - 1;

              return (
                <motion.div key={entry.ticket_id} variants={popIn} initial="hidden" animate="visible">
                  {/* Desktop row */}
                  <Box sx={{ display: { xs: 'none', md: 'grid' }, gridTemplateColumns: '40px minmax(0,1fr) 110px', gap: 2, alignItems: 'center', px: '22px', py: '16px', borderBottom: last ? 'none' : `1px solid ${BG_SUBTLE}` }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: AVATAR_BLUE_BG, color: PRIMARY_MAIN, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RowIcon sx={{ fontSize: 20 }} /></Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: '14px', fontWeight: 700, color: TEXT_HEADING, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</Typography>
                        {isUnderReview && (
                          <Box component="span" sx={{ fontSize: '10px', fontWeight: 700, color: STATUS_PENDING_TEXT, border: `1px solid ${BORDER_REVIEW}`, borderRadius: '6px', px: '7px', py: '1px', whiteSpace: 'nowrap', flexShrink: 0 }}>Under review</Box>
                        )}
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: '3px', minWidth: 0 }}>
                        <Box component="span" sx={{ fontSize: '10.5px', fontWeight: 700, color: badge.color, border: `1px solid ${badge.border}`, borderRadius: '6px', px: '7px', py: '1px', flexShrink: 0 }}>{badge.label}</Box>
                        {entry.entry_count > 1 && (
                          <Box component="span" sx={{ fontSize: '11px', fontWeight: 700, color: TEXT_SECONDARY, flexShrink: 0 }}>{`×${entry.entry_count} entries`}</Box>
                        )}
                        <Typography sx={{ fontSize: '12px', color: TEXT_TERTIARY, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {formatRelativeTime(entry.created_at)}{showEntryLocation ? ` · ${entry.location_name}` : ''}
                        </Typography>
                      </Stack>
                    </Box>
                    <Typography sx={{ fontSize: '14px', fontWeight: 800, color: entry.transaction_amount !== null ? PRIMARY_MAIN : TEXT_TERTIARY, textAlign: 'right' }}>
                      {entry.transaction_amount !== null ? formatCurrency(entry.transaction_amount) : '-'}
                    </Typography>
                  </Box>

                  {/* Mobile row */}
                  <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.375, px: '14px', py: '12px', borderBottom: last ? 'none' : `1px solid ${BG_SUBTLE}` }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: AVATAR_BLUE_BG, color: PRIMARY_MAIN, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><RowIcon sx={{ fontSize: 18 }} /></Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: '13.5px', fontWeight: 700, color: TEXT_HEADING, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</Typography>
                        {isUnderReview && (
                          <Box component="span" sx={{ fontSize: '8.5px', fontWeight: 700, color: STATUS_PENDING_TEXT, border: `1px solid ${BORDER_REVIEW}`, borderRadius: '5px', px: '5px', py: '1px', whiteSpace: 'nowrap', flexShrink: 0 }}>Under review</Box>
                        )}
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.875} sx={{ mt: '2px', minWidth: 0 }}>
                        <Box component="span" sx={{ fontSize: '9.5px', fontWeight: 700, color: badge.color, border: `1px solid ${badge.border}`, borderRadius: '5px', px: '6px', py: '1px', flexShrink: 0 }}>{badge.label}</Box>
                        {entry.entry_count > 1 && (
                          <Box component="span" sx={{ fontSize: '10px', fontWeight: 700, color: TEXT_SECONDARY, flexShrink: 0 }}>{`×${entry.entry_count}`}</Box>
                        )}
                        <Typography sx={{ fontSize: '11px', color: TEXT_TERTIARY, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formatRelativeTime(entry.created_at)}{showEntryLocation ? ` · ${entry.location_name}` : ''}</Typography>
                      </Stack>
                    </Box>
                    <Typography sx={{ fontSize: '13.5px', fontWeight: 800, color: entry.transaction_amount !== null ? PRIMARY_MAIN : TEXT_TERTIARY, textAlign: 'right', flexShrink: 0 }}>
                      {entry.transaction_amount !== null ? formatCurrency(entry.transaction_amount) : '-'}
                    </Typography>
                  </Box>
                </motion.div>
              );
            })}

            {/* Explicit Back / Next paging on every viewport (no infinite scroll) */}
            {(canGoBack || canGoNext) && (
              <Box sx={{ px: { xs: '14px', md: '22px' }, py: '13px', borderTop: `1px solid ${CHART_GRID}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: TEXT_TERTIARY }}>Page {entriesPage + 1}</Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={!canGoBack}
                    onClick={goToPrevPage}
                    startIcon={<KeyboardArrowLeftRounded />}
                    sx={{ textTransform: 'none', fontWeight: 700, borderColor: BORDER_SUBTLE, color: TEXT_SECONDARY }}
                  >
                    Back
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={!canGoNext || isFetchingNextPage}
                    onClick={goToNextPage}
                    endIcon={isFetchingNextPage ? <CircularProgress size={14} color="inherit" /> : <KeyboardArrowRightRounded />}
                    sx={{ textTransform: 'none', fontWeight: 700, borderColor: BORDER_SUBTLE, color: TEXT_SECONDARY }}
                  >
                    Next
                  </Button>
                </Stack>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </>
  );

  // ── No campaign empty state ──────────────────────────────────
  const noCampaignCard = (
    <Box sx={{ bgcolor: 'white', border: `1px solid ${BORDER_SUBTLE}`, borderRadius: '18px', p: 4, boxShadow: SHADOW_CARD, textAlign: 'center' }}>
      <CampaignOutlined sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
      <Typography sx={{ fontSize: '18px', fontWeight: 800, color: TEXT_HEADING, mb: 1 }}>No active campaign</Typography>
      <Typography sx={{ fontSize: '14px', color: TEXT_SECONDARY, mb: 3 }}>Start a campaign to begin issuing entries to customers.</Typography>
      {isBusiness && (
        <Button variant="contained" onClick={() => navigate('/subscribe')} sx={{ fontWeight: 700, textTransform: 'none' }}>
          Start Campaign
        </Button>
      )}
    </Box>
  );

  return (
    <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: 'var(--dvh100, 100dvh)' }, pb: { xs: 12, md: 6 } }}>
      <AppPageHero
        title='Campaign Dashboard'
        subtitle='Monitor your active campaign and entries'
        actions={isDesktop ? headerControls : undefined}
      />

      {/* zoom stays on the content only (not the header), so the hero renders full-size. */}
      <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 2.5 }, zoom: { xs: 0.9, md: 0.85 } }}>
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          <Stack spacing={{ xs: 2, md: 2.5 }}>
            {/* Mobile controls sit above the KPIs (custom pills; desktop uses the hero inputs). */}
            {!isDesktop && mobileControls && (
              <motion.div variants={riseIn}>{mobileControls}</motion.div>
            )}

            {/* KPIs */}
            {!noCampaign && <motion.div variants={riseIn}>{kpiSection}</motion.div>}

            {/* Campaign card + entries feed (two columns on desktop) */}
            {noCampaign ? (
              <motion.div variants={popIn}>{isHeaderLoading ? cardSkeleton : noCampaignCard}</motion.div>
            ) : (
              // minmax(0,1fr): a plain 1fr track sizes to the entries feed's nowrap min-content and overflows the mobile viewport
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: '380px minmax(0, 1fr)' }, gap: { xs: 2, md: 2.5 }, alignItems: 'start' }}>
                <motion.div variants={popIn}>{isHeaderLoading ? cardSkeleton : campaignCard}</motion.div>
                <motion.div variants={riseIn}>{entriesFeed}</motion.div>
              </Box>
            )}
          </Stack>
        </motion.div>
      </Container>
    </Box>
  );
};

export default CampaignDashboardPage;
