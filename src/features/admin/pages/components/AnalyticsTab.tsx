import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  LinearProgress,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  TextField,
  InputAdornment,
  Autocomplete,
  CircularProgress,
  Skeleton,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer } from 'recharts';
import { useAdminAnalytics, useAdminBusinesses, useAllDraws, useCampaignComparison, useEntryVolume, useLocationBreakdown } from '../../hooks/useAdmin';
import { BG_PAGE, CHART_TEAL } from '../../../../shared/colors';
import { formatShortDay } from '../../../../shared/utils/date';
import GrowthDashboard from '../../components/GrowthDashboard';

interface Props {
  isMobile: boolean;
}

const AnalyticsTab: React.FC<Props> = ({ isMobile }) => {
  const [tabValue, setTabValue] = useState(0);
  const { data: draws } = useAllDraws();
  const [selectedBiz, setSelectedBiz] = useState<{ id: number; name: string } | null>(null);
  const [analyticsDrawFilter, setAnalyticsDrawFilter] = useState<number | null>(null);
  const [bizInput, setBizInput] = useState('');
  const [bizSearch, setBizSearch] = useState('');
  const bizDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [locationSearch, setLocationSearch] = useState('');
  const [locationSearchInput, setLocationSearchInput] = useState('');
  const locDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [locationPage, setLocationPage] = useState(0);
  const [locationRowsPerPage, setLocationRowsPerPage] = useState(25);

  // Search-as-you-type (debounced), matching the Business filter above. The old field only
  // committed on Enter, so typing appeared to do nothing.
  const handleLocationSearchChange = (value: string) => {
    setLocationSearchInput(value);
    if (locDebounceRef.current) clearTimeout(locDebounceRef.current);
    locDebounceRef.current = setTimeout(() => { setLocationSearch(value); setLocationPage(0); }, 300);
  };
  const clearLocationSearch = () => {
    if (locDebounceRef.current) clearTimeout(locDebounceRef.current);
    setLocationSearchInput('');
    setLocationSearch('');
    setLocationPage(0);
  };

  const analyticsBusinessFilter = selectedBiz?.id ?? null;
  const isFiltered = !!(analyticsBusinessFilter || analyticsDrawFilter);
  const { data: bizData, isLoading: bizLoading } = useAdminBusinesses({ limit: 20, search: bizSearch });
  const businesses = bizData?.pages[0]?.rows ?? [];
  // Always include currently selected business in options even if not in search results
  const bizOptions = selectedBiz && !businesses.find(b => b.id === selectedBiz.id)
    ? [selectedBiz, ...businesses]
    : businesses;

  const { data: analytics, isLoading: analyticsLoading } = useAdminAnalytics(analyticsBusinessFilter, analyticsDrawFilter);
  const { data: entryVolume } = useEntryVolume(analyticsDrawFilter, analyticsBusinessFilter);
  const { data: campaignComparison } = useCampaignComparison();
  const { data: locationData, isLoading: locationLoading } = useLocationBreakdown({
    businessId: analyticsBusinessFilter,
    search: locationSearch,
    page: locationPage + 1,
    limit: locationRowsPerPage,
  });

  return (
    <Stack spacing={3}>
      {/* Tabs */}
      <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
        <Tab label='Growth & North Star' />
        <Tab label='Deep Dive Analytics' />
      </Tabs>

      {tabValue === 0 ? (
        <GrowthDashboard />
      ) : (
        <>
          {/* Filters */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Autocomplete
          size='small'
          options={draws ?? []}
          getOptionLabel={(opt) => opt.name}
          value={(draws ?? []).find(d => d.id === analyticsDrawFilter) ?? null}
          onChange={(_, val) => { setAnalyticsDrawFilter(val?.id ?? null); setLocationPage(0); }}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          renderInput={(params) => <TextField {...params} label='Campaign' />}
          sx={{ minWidth: 200 }}
        />
        <Autocomplete
          size='small'
          options={bizOptions}
          getOptionLabel={(opt) => opt.name}
          value={selectedBiz}
          inputValue={bizInput}
          onInputChange={(_, value) => {
            setBizInput(value);
            if (bizDebounceRef.current) clearTimeout(bizDebounceRef.current);
            bizDebounceRef.current = setTimeout(() => setBizSearch(value), 300);
          }}
          onChange={(_, val) => { setSelectedBiz(val); setLocationPage(0); }}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          filterOptions={(x) => x}
          loading={bizLoading}
          renderInput={(params) => (
            <TextField
              {...params}
              label='Business'
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {bizLoading && <CircularProgress size={16} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          sx={{ minWidth: 200 }}
        />
        {(analyticsDrawFilter || analyticsBusinessFilter) && (
          <Chip
            label='Clear filters'
            size='small'
            onDelete={() => { setAnalyticsDrawFilter(null); setSelectedBiz(null); setBizInput(''); setBizSearch(''); setLocationPage(0); }}
          />
        )}
      </Box>

      {analyticsLoading ? (
        <Skeleton variant='rectangular' height={400} sx={{ borderRadius: 2 }} />
      ) : (
        <Stack spacing={3}>
          {/* Row 1: User Growth + Entry Source Mix side by side */}
          <Grid container spacing={2}>
            {/* User Growth - platform-wide, not affected by business filter */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant='subtitle1' fontWeight={700}>User Growth</Typography>
                    {isFiltered && (
                      <Tooltip title='Showing users who participated in the selected filters.' placement='top'>
                        <Chip icon={<FilterAltIcon sx={{ fontSize: '13px !important' }} />} label='Filtered' size='small' sx={{ fontSize: '0.68rem', height: 22, cursor: 'default', bgcolor: '#e3f2fd', color: '#1565c0' }} />
                      </Tooltip>
                    )}
                  </Box>
                  <Stack spacing={2}>
                    {[
                      { label: 'New This Week', value: analytics?.userGrowth?.new_this_week ?? 0, bg: '#e3f2fd', color: '#1976d2' },
                      { label: 'New This Month', value: analytics?.userGrowth?.new_this_month ?? 0, bg: '#e8f5e9', color: '#2e7d32' },
                      { label: 'Total Users', value: analytics?.userGrowth?.total ?? 0, bg: '#f3e5f5', color: '#7b1fa2' },
                    ].map((item) => (
                      <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant='body2' color='text.secondary'>{item.label}</Typography>
                        <Typography variant='body1' fontWeight={700} sx={{ color: item.color }}>{item.value.toLocaleString()}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Entry Source Mix */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant='subtitle1' fontWeight={700}>Entry Source Mix</Typography>
                      {isFiltered && (
                        <Tooltip title='Showing data for selected filters.' placement='top'>
                          <Chip icon={<FilterAltIcon sx={{ fontSize: '13px !important' }} />} label='Filtered' size='small' sx={{ fontSize: '0.68rem', height: 22, cursor: 'default', bgcolor: '#e3f2fd', color: '#1565c0' }} />
                        </Tooltip>
                      )}
                    </Box>
                    <Typography variant='caption' color='text.secondary'>
                      Total: {(analytics?.entrySourceMix?.total ?? 0).toLocaleString()} entries
                    </Typography>
                  </Box>
                  <Stack spacing={1.5}>
                    {[
                      { label: 'Receipt', key: 'receipt' as const, color: '#2e7d32' },
                      { label: 'Code (QR)', key: 'code' as const, color: '#1976d2' },
                      { label: 'Free / AMOE', key: 'free' as const, color: '#f57c00' },
                      { label: 'Promo', key: 'promo' as const, color: '#7b1fa2' },
                      { label: 'Referral', key: 'referral' as const, color: CHART_TEAL },
                    ].map((source) => {
                      const count = analytics?.entrySourceMix?.[source.key] ?? 0;
                      const total = analytics?.entrySourceMix?.total ?? 0;
                      const pct = total > 0 ? (count / total) * 100 : 0;
                      return (
                        <Box key={source.key}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant='body2' fontWeight={500}>{source.label}</Typography>
                            <Typography variant='body2' color='text.secondary'>{count.toLocaleString()} ({pct.toFixed(1)}%)</Typography>
                          </Box>
                          <LinearProgress
                            variant='determinate'
                            value={pct}
                            sx={{ height: 7, borderRadius: 1, backgroundColor: `${source.color}22`, '& .MuiLinearProgress-bar': { backgroundColor: source.color } }}
                          />
                        </Box>
                      );
                    })}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Row 2: AMOE + Validation + Fraud */}
          <Grid container spacing={2}>
            {/* AMOE - platform-wide */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant='subtitle1' fontWeight={700}>Free Weekly Entries (AMOE)</Typography>
                    {analyticsDrawFilter && (
                      <Tooltip title='Filtered by selected campaign.' placement='top'>
                        <Chip icon={<FilterAltIcon sx={{ fontSize: '13px !important' }} />} label='Filtered' size='small' sx={{ fontSize: '0.68rem', height: 22, cursor: 'default', bgcolor: '#e3f2fd', color: '#1565c0' }} />
                      </Tooltip>
                    )}
                  </Box>
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant='body2' color='text.secondary'>Free Entries</Typography>
                      <Chip label={(analytics?.entrySourceMix?.free ?? 0).toLocaleString()} size='small' color='success' />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant='body2' color='text.secondary'>Share of All Entries</Typography>
                      <Typography variant='body2' fontWeight={700} color='success.main'>
                        {analytics?.entrySourceMix?.total ? ((analytics.entrySourceMix.free / analytics.entrySourceMix.total) * 100).toFixed(1) : '0'}%
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant='body2' color='text.secondary'>Total Entries (all sources)</Typography>
                      <Typography variant='body2' fontWeight={700}>{(analytics?.entrySourceMix?.total ?? 0).toLocaleString()}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Validation */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant='subtitle1' fontWeight={700}>Validation</Typography>
                    {isFiltered && (
                      <Tooltip title='Showing data for selected filters.' placement='top'>
                        <Chip icon={<FilterAltIcon sx={{ fontSize: '13px !important' }} />} label='Filtered' size='small' sx={{ fontSize: '0.68rem', height: 22, cursor: 'default', bgcolor: '#e3f2fd', color: '#1565c0' }} />
                      </Tooltip>
                    )}
                  </Box>
                  <Stack spacing={2}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant='body2' fontWeight={500}>Acceptance Rate</Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {(() => {
                            const a = analytics?.validation?.accepted ?? 0;
                            const q = analytics?.validation?.quarantined ?? 0;
                            return (a + q) > 0 ? ((a / (a + q)) * 100).toFixed(1) : '0';
                          })()}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant='determinate'
                        value={(() => {
                          const a = analytics?.validation?.accepted ?? 0;
                          const q = analytics?.validation?.quarantined ?? 0;
                          return (a + q) > 0 ? (a / (a + q)) * 100 : 0;
                        })()}
                        sx={{ height: 7, borderRadius: 1 }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 3 }}>
                      <Box>
                        <Typography variant='caption' color='text.secondary'>Accepted</Typography>
                        <Typography variant='body1' fontWeight={700} color='success.main'>{(analytics?.validation?.accepted ?? 0).toLocaleString()}</Typography>
                      </Box>
                      <Box>
                        <Typography variant='caption' color='text.secondary'>Quarantined</Typography>
                        <Typography variant='body1' fontWeight={700} color='error.main'>{(analytics?.validation?.quarantined ?? 0).toLocaleString()}</Typography>
                      </Box>
                    </Box>
                    {(analytics?.validation?.quarantine_reasons?.length ?? 0) > 0 && (
                      <Stack spacing={0.5}>
                        <Typography variant='caption' color='text.secondary' fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Quarantine Reasons</Typography>
                        {analytics!.validation.quarantine_reasons.map((r) => {
                          const label: Record<string, string> = {
                            high_risk_user: 'High Risk User',
                            ocr_pending: 'OCR Pending',
                            ocr_validation_failed: 'OCR Failed',
                            shared_receipt_suspected: 'Duplicate Receipt',
                            ocr_error_pending_review: 'OCR Error',
                          };
                          return (
                            <Box key={r.reason} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant='body2' color='text.secondary'>{label[r.reason] ?? r.reason}</Typography>
                              <Typography variant='body2' fontWeight={600}>{r.count}</Typography>
                            </Box>
                          );
                        })}
                      </Stack>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Fraud & Risk - platform-wide */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant='subtitle1' fontWeight={700}>Fraud & Risk</Typography>
                    {isFiltered && (
                      <Tooltip title='Showing risk scores of users who participated in the selected filters.' placement='top'>
                        <Chip icon={<FilterAltIcon sx={{ fontSize: '13px !important' }} />} label='Filtered' size='small' sx={{ fontSize: '0.68rem', height: 22, cursor: 'default', bgcolor: '#e3f2fd', color: '#1565c0' }} />
                      </Tooltip>
                    )}
                  </Box>
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant='body2' fontWeight={500}>High Risk</Typography>
                        <Typography variant='caption' color='text.secondary'>Score ≥ 15 - throttled</Typography>
                      </Box>
                      <Chip label={(analytics?.fraud?.high_risk ?? 0).toLocaleString()} color='error' />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant='body2' fontWeight={500}>Medium Risk</Typography>
                        <Typography variant='caption' color='text.secondary'>Score 10–14 - image required</Typography>
                      </Box>
                      <Chip label={(analytics?.fraud?.medium_risk ?? 0).toLocaleString()} color='warning' />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant='body2' fontWeight={500}>Low Risk</Typography>
                        <Typography variant='caption' color='text.secondary'>Score &lt; 10 - clean</Typography>
                      </Box>
                      <Chip label={(analytics?.fraud?.low_risk ?? 0).toLocaleString()} color='success' />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Row 3: Repeat Behavior */}
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant='subtitle1' fontWeight={700}>Repeat Behavior</Typography>
                {isFiltered && (
                  <Tooltip title='Showing data for selected filters.' placement='top'>
                    <Chip icon={<FilterAltIcon sx={{ fontSize: '13px !important' }} />} label='Filtered' size='small' sx={{ fontSize: '0.68rem', height: 22, cursor: 'default', bgcolor: '#e3f2fd', color: '#1565c0' }} />
                  </Tooltip>
                )}
              </Box>
              <Grid container spacing={2}>
                {[
                  { label: 'Users who submitted', value: analytics?.repeatBehavior?.users_with_submissions ?? 0 },
                  { label: 'Avg submissions / user', value: (analytics?.repeatBehavior?.avg_submissions_per_user ?? 0).toFixed(1) },
                  { label: 'Users with 2+ submissions', value: analytics?.repeatBehavior?.users_2_plus ?? 0 },
                  { label: 'Multi-business users', value: analytics?.repeatBehavior?.multi_business_users ?? 0 },
                ].map((item) => (
                  <Grid key={item.label} size={{ xs: 6, md: 3 }}>
                    <Box>
                      <Typography variant='caption' color='text.secondary'>{item.label}</Typography>
                      <Typography variant='h6' fontWeight={700}>{typeof item.value === 'number' ? item.value.toLocaleString() : item.value}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Entry Volume Chart */}
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant='subtitle1' fontWeight={700} mb={2}>Entry Volume Over Time</Typography>
              {!entryVolume || entryVolume.length === 0 ? (
                <Box sx={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant='body2' color='text.secondary'>No data for selected filters.</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width='100%' height={200}>
                  <AreaChart data={entryVolume} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id='entryGrad' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='5%' stopColor='#1976d2' stopOpacity={0.25} />
                        <stop offset='95%' stopColor='#1976d2' stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                    <XAxis dataKey='date' tick={{ fontSize: 11 }} tickFormatter={(v) => formatShortDay(v)} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <RTooltip formatter={(v) => [Number(v).toLocaleString(), 'Entries']} labelFormatter={(l) => formatShortDay(String(l))} />
                    <Area type='monotone' dataKey='count' stroke='#1976d2' strokeWidth={2} fill='url(#entryGrad)' dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Campaign Comparison Table */}
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ pb: 0 }}>
              <Typography variant='subtitle1' fontWeight={700} mb={2}>Campaign Comparison</Typography>
            </CardContent>
            <TableContainer>
              <Table size='small'>
                <TableHead>
                  <TableRow sx={{ backgroundColor: BG_PAGE }}>
                    <TableCell>Campaign</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align='right'>Prize</TableCell>
                    <TableCell align='right'>Businesses</TableCell>
                    <TableCell align='right'>Entries</TableCell>
                    <TableCell align='right'>Quarantined</TableCell>
                    <TableCell align='right'>Acceptance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(campaignComparison ?? []).map((c) => {
                    const total = c.total_entries + c.quarantined;
                    const acceptRate = total > 0 ? ((c.total_entries / total) * 100).toFixed(1) : '—';
                    return (
                      <TableRow key={c.id} hover>
                        <TableCell sx={{ fontWeight: 600, maxWidth: 180 }}>
                          <Typography variant='body2' fontWeight={600} noWrap>{c.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={c.status} size='small' color={c.status === 'Open' ? 'primary' : c.status === 'Closed' ? 'success' : 'default'} />
                        </TableCell>
                        <TableCell>{new Date(c.draw_date).toLocaleDateString()}</TableCell>
                        <TableCell align='right'>${Number(c.prize_amount).toLocaleString()}</TableCell>
                        <TableCell align='right'>{c.business_count}</TableCell>
                        <TableCell align='right' sx={{ fontWeight: 700 }}>{c.total_entries.toLocaleString()}</TableCell>
                        <TableCell align='right' sx={{ color: c.quarantined > 0 ? 'error.main' : 'text.disabled' }}>
                          {c.quarantined > 0 ? c.quarantined : '—'}
                        </TableCell>
                        <TableCell align='right'>
                          <Typography variant='body2' color={parseFloat(acceptRate) > 90 ? 'success.main' : parseFloat(acceptRate) < 70 ? 'error.main' : 'text.primary'}>
                            {acceptRate}{acceptRate !== '—' ? '%' : ''}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {(campaignComparison ?? []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align='center' sx={{ py: 3, color: 'text.secondary' }}>No campaigns yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          {/* Row 4: Location Breakdown - paginated, server-side */}
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ pb: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant='subtitle1' fontWeight={700}>Entries by Location</Typography>
                <TextField
                  size='small'
                  placeholder='Search business or location…'
                  value={locationSearchInput}
                  onChange={(e) => handleLocationSearchChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      // Commit immediately on Enter (skip the debounce wait).
                      if (locDebounceRef.current) clearTimeout(locDebounceRef.current);
                      setLocationSearch(locationSearchInput);
                      setLocationPage(0);
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <SearchIcon fontSize='small' />
                      </InputAdornment>
                    ),
                    endAdornment: locationSearchInput && (
                      <InputAdornment position='end'>
                        <IconButton size='small' aria-label='Clear search' onClick={clearLocationSearch}>
                          <ClearIcon fontSize='small' />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 280 }}
                />
              </Box>
            </CardContent>
            <TableContainer>
              <Table size='small'>
                <TableHead>
                  <TableRow sx={{ backgroundColor: BG_PAGE }}>
                    <TableCell>Business</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell align='center'>Activated</TableCell>
                    <TableCell align='center'>Quarantined</TableCell>
                    {!isMobile && <TableCell align='center'>Receipts</TableCell>}
                    {!isMobile && <TableCell align='right'>Avg. Transaction</TableCell>}
                    {!isMobile && <TableCell align='right'>Cap Usage</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {locationLoading ? (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Skeleton variant='rectangular' height={200} />
                      </TableCell>
                    </TableRow>
                  ) : (locationData?.rows ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align='center' sx={{ py: 4 }}>
                        <Typography variant='body2' color='text.secondary'>No locations found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (locationData?.rows ?? []).map((loc) => {
                    const capPct = loc.entry_cap ? (loc.activated / loc.entry_cap) * 100 : null;
                    const capColor = capPct == null ? null : capPct > 80 ? '#c62828' : capPct > 50 ? '#f57c00' : '#2e7d32';
                    return (
                      <TableRow key={loc.location_id} hover>
                        <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{loc.business_name}</TableCell>
                        <TableCell>
                          <Typography variant='body2'>{loc.location_name}</Typography>
                          {loc.address && <Typography variant='caption' color='text.secondary' display='block'>{loc.address}</Typography>}
                        </TableCell>
                        <TableCell align='center'>
                          <Typography variant='body2' fontWeight={600} color='success.main'>{loc.activated.toLocaleString()}</Typography>
                        </TableCell>
                        <TableCell align='center'>
                          {loc.quarantined > 0
                            ? <Typography variant='body2' fontWeight={600} color='error.main'>{loc.quarantined}</Typography>
                            : <Typography variant='body2' color='text.disabled'>-</Typography>}
                        </TableCell>
                        {!isMobile && <TableCell align='center'>{loc.receipt_tickets.toLocaleString()}</TableCell>}
                        {!isMobile && (
                          <TableCell align='right'>
                            {loc.avg_transaction != null
                              ? `$${loc.avg_transaction.toFixed(2)}`
                              : <Typography variant='body2' color='text.disabled'>-</Typography>}
                          </TableCell>
                        )}
                        {!isMobile && (
                          <TableCell align='right'>
                            {capPct != null ? (
                              <Box sx={{ minWidth: 100, textAlign: 'right' }}>
                                <Typography variant='caption' fontWeight={600} sx={{ color: capColor ?? undefined }}>
                                  {loc.activated.toLocaleString()} / {loc.entry_cap!.toLocaleString()} ({capPct.toFixed(1)}%)
                                </Typography>
                                <LinearProgress
                                  variant='determinate'
                                  value={Math.min(capPct, 100)}
                                  sx={{ height: 4, borderRadius: 1, mt: 0.5, backgroundColor: `${capColor}22`, '& .MuiLinearProgress-bar': { backgroundColor: capColor ?? undefined } }}
                                />
                              </Box>
                            ) : (
                              <Typography variant='body2' color='text.disabled'>No cap</Typography>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component='div'
              count={locationData?.total ?? 0}
              page={locationPage}
              onPageChange={(_, p) => setLocationPage(p)}
              rowsPerPage={locationRowsPerPage}
              onRowsPerPageChange={(e) => { setLocationRowsPerPage(parseInt(e.target.value, 10)); setLocationPage(0); }}
              rowsPerPageOptions={[10, 25, 50, 100]}
            />
          </Card>
        </Stack>
      )}
        </>
      )}
    </Stack>
  );
};

export default AnalyticsTab;
