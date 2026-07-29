import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Chip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableContainer,
  TablePagination,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
  Tooltip,
  Skeleton,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GppBadIcon from '@mui/icons-material/GppBad';
import WarningIcon from '@mui/icons-material/Warning';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { motion } from 'framer-motion';
import {
  useAdminUsers,
  useToggleUserActive,
  useSetUserRisk,
  useUserAnalyticsSummary,
} from '../../hooks/useAdmin';
import { useDebounce } from '../../../../shared/hooks/useDebounce';
import type { AdminUser } from '../../types/admin.types';
import {
  BG_ROW_SUBTLE,
  BORDER_LIGHT,
  BORDER_SUBTLE,
  TEXT_TERTIARY,
  TEXT_HEADING,
  STATUS_ACTIVATED_BG,
  STATUS_ACTIVATED_TEXT,
  METRIC_BAD_TINT,
  METRIC_BAD,
  METRIC_GOOD_TINT,
  METRIC_GOOD,
  METRIC_WARN_TINT,
  METRIC_WARN,
} from '../../../../shared/colors';
import { riseIn, staggerContainer, popIn } from '../../../../shared/motion';
import { AdminCard } from './adminUi';
import UserDetailDrawer from './UserDetailDrawer';

function formatLastActive(value: string | null): string {
  if (!value) return 'Never';
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffHours < 24) return 'Today';
  return date.toLocaleDateString('en-US');
}

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

const LIMIT = 25;

interface Props {
  isMobile: boolean;
  onSnackError: (msg: string) => void;
  onSnackSuccess: (msg: string) => void;
}

const UsersTab: React.FC<Props> = ({ isMobile, onSnackError, onSnackSuccess }) => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [role, setRole] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [segment, setSegment] = useState<string>('');
  const [page, setPage] = useState(0);
  const [riskConfirmUser, setRiskConfirmUser] = useState<{ id: number; name: string; action: 'disqualify' | 'clear' } | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const { data: summary, isLoading: summaryLoading } = useUserAnalyticsSummary();

  const {
    data,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAdminUsers({
    limit: LIMIT,
    search: debouncedSearch,
    role,
    riskLevel,
    segment: segment || undefined,
  });

  // Refetch overlay: keepPreviousData shows the STALE list while a new filter/segment/search
  // loads, which reads as "the click did nothing". Blur + spinner make the refresh visible.
  const isRefreshing = isFetching && !isLoading && !isFetchingNextPage;

  // Desktop: one page at a time via Back/Next. Mobile: accumulate for infinite scroll.
  const desktopRows: AdminUser[] = data?.pages[page]?.rows ?? [];
  const mobileRows: AdminUser[] = data?.pages.flatMap((p) => p.rows) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  const handlePageChange = useCallback(
    (_e: unknown, newPage: number) => {
      setPage(newPage);
      const pagesLoaded = data?.pages.length ?? 0;
      if (newPage + 1 > pagesLoaded && hasNextPage) fetchNextPage();
    },
    [data?.pages.length, hasNextPage, fetchNextPage],
  );

  // Mobile-only infinite scroll.
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    if (!isMobile) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver as IntersectionObserverCallback, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [isMobile, handleObserver]);

  const toggleUserActive = useToggleUserActive();
  const setUserRisk = useSetUserRisk();

  const handleToggleUserActive = async (userId: number, currentStatus: boolean) => {
    try {
      await toggleUserActive.mutateAsync({ userId, is_active: !currentStatus });
      onSnackSuccess(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to update user status';
      onSnackError((e as any)?.response?.data?.message ?? msg);
    }
  };

  const handleConfirmRiskAction = async () => {
    if (!riskConfirmUser) return;
    const riskScore = riskConfirmUser.action === 'disqualify' ? 20 : 19;
    try {
      await setUserRisk.mutateAsync({ userId: riskConfirmUser.id, riskScore });
      onSnackSuccess(
        riskConfirmUser.action === 'disqualify'
          ? `${riskConfirmUser.name} has been disqualified`
          : `Flag cleared for ${riskConfirmUser.name}`,
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to update risk score';
      onSnackError((e as any)?.response?.data?.message ?? msg);
    }
    setRiskConfirmUser(null);
  };

  const isEmpty = !isLoading && (isMobile ? mobileRows.length : desktopRows.length) === 0;

  type SegmentKey = 'high_risk' | 'medium_risk' | 'suspended' | 'unverified' | 'new_7d' | 'active_30d';

  const SEGMENT_FILTERS: Array<{
    key: SegmentKey;
    label: string;
    tipTitle: string;
    tipLines: readonly string[];
  }> = [
    {
      key: 'high_risk',
      label: 'High risk',
      tipTitle: 'High risk',
      tipLines: [
        'Risk score 20 or higher.',
        'Entries are shadow-excluded from draws.',
        'Review for fraud.',
      ],
    },
    {
      key: 'medium_risk',
      label: 'Medium risk',
      tipTitle: 'Medium risk',
      tipLines: [
        'Risk score 10 to 19.',
        'Image required on entries. Monitor.',
      ],
    },
    {
      key: 'suspended',
      label: 'Suspended',
      tipTitle: 'Suspended',
      tipLines: [
        'Account deactivated.',
        'Cannot log in or enter.',
      ],
    },
    {
      key: 'unverified',
      label: 'Unverified',
      tipTitle: 'Unverified',
      tipLines: [
        'User has not verified their phone.',
        'They cannot enter draws until they do.',
        'A spike can signal bot signups.',
      ],
    },
    {
      key: 'new_7d',
      label: 'New this week',
      tipTitle: 'New this week',
      tipLines: [
        'Signed up in the last 7 days.',
        'Watch for sudden spikes (bot waves).',
      ],
    },
    {
      key: 'active_30d',
      label: 'Active this month',
      tipTitle: 'Active this month',
      tipLines: [
        'Submitted at least one entry in the last 30 days.',
        'Your genuinely engaged users.',
      ],
    },
  ];

  return (
    <>
      <Stack spacing={3}>
        {/* User Triage Analytics Strip */}
        <motion.div variants={staggerContainer} initial='hidden' animate='visible'>
          <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant='subtitle2' sx={{ fontWeight: 700, color: TEXT_HEADING, fontSize: '0.875rem' }}>
                User Triage
              </Typography>
              {summary && (
                <Typography variant='caption' sx={{ color: TEXT_TERTIARY, fontSize: '0.75rem' }}>
                  Total: {summary.total} (Users {summary.users} / Businesses {summary.businesses})
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {summaryLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <motion.div key={i} variants={popIn}>
                    <Skeleton variant='rounded' width={120} height={48} />
                  </motion.div>
                ))
              ) : (
                SEGMENT_FILTERS.map((filter) => {
                  const count = summary ? (summary[filter.key as keyof typeof summary] as number) || 0 : 0;
                  const isActive = segment === filter.key;
                  const isMuted = count === 0;
                  const accent = filter.key === 'active_30d'
                    ? { main: METRIC_GOOD, tint: METRIC_GOOD_TINT }
                    : filter.key === 'high_risk' || filter.key === 'suspended'
                    ? { main: METRIC_BAD, tint: METRIC_BAD_TINT }
                    : { main: METRIC_WARN, tint: METRIC_WARN_TINT };
                  const countLabel = count > 0 ? `(${count})` : '';

                  return (
                    <motion.div key={filter.key} variants={popIn}>
                      <Tooltip title={tipContent(filter.tipTitle, filter.tipLines)} enterTouchDelay={50} leaveTouchDelay={4000} arrow>
                        <Button
                          variant='outlined'
                          onClick={() => {
                            if (isMuted) return;
                            setSegment(isActive ? '' : filter.key);
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
                            border: isActive ? '2px solid' : 'none',
                            '&:hover': {
                              borderColor: isActive ? accent.main : undefined,
                              bgcolor: isActive ? accent.tint : (isMuted ? BG_ROW_SUBTLE : 'transparent'),
                            },
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

        {/* Search bar */}
        <TextField
          placeholder='Search by name or email'
          size='small'
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon fontSize='small' />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: 480,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              borderColor: BORDER_LIGHT,
            },
          }}
        />

        {/* Filter dropdowns */}
        <Stack direction='row' spacing={2} sx={{ flexWrap: 'wrap' }}>
          <FormControl size='small' sx={{ minWidth: 140 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={role}
              label='Role'
              onChange={(e) => { setRole(e.target.value); setPage(0); }}
              sx={{
                borderRadius: '12px',
                '& .MuiOutlinedInput-root': {
                  borderColor: BORDER_LIGHT,
                },
              }}
            >
              <MenuItem value=''>All Roles</MenuItem>
              <MenuItem value='user'>User</MenuItem>
              <MenuItem value='business'>Business</MenuItem>
            </Select>
          </FormControl>

          <FormControl size='small' sx={{ minWidth: 160 }}>
            <InputLabel>Risk</InputLabel>
            <Select
              value={riskLevel}
              label='Risk'
              onChange={(e) => { setRiskLevel(e.target.value); setPage(0); }}
              sx={{
                borderRadius: '12px',
                '& .MuiOutlinedInput-root': {
                  borderColor: BORDER_LIGHT,
                },
              }}
            >
              <MenuItem value=''>All Risk</MenuItem>
              <MenuItem value='high'>High (≥20)</MenuItem>
              <MenuItem value='medium'>Medium (10-19)</MenuItem>
              <MenuItem value='low'>Low (&lt;10)</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Users table / cards - blurred while a filter/search refetch is in flight */}
        <Box sx={{ position: 'relative' }}>
        <Box sx={{ filter: isRefreshing ? 'blur(3px)' : 'none', pointerEvents: isRefreshing ? 'none' : 'auto', transition: 'filter 0.2s ease' }}>
        {isMobile ? (
          <motion.div variants={staggerContainer} initial='hidden' animate='visible'>
            <Stack spacing={2}>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} variant='rounded' height={140} />
                  ))
                : mobileRows.map((user: AdminUser) => {
                    const isDisqualified = user.risk_score >= 20;
                    const riskBgColor = user.risk_score >= 20 ? METRIC_BAD_TINT : user.risk_score >= 10 ? METRIC_WARN_TINT : METRIC_GOOD_TINT;
                    const riskTextColor = user.risk_score >= 20 ? METRIC_BAD : user.risk_score >= 10 ? METRIC_WARN : METRIC_GOOD;
                    const riskLabel = user.risk_score >= 20 ? 'HIGH' : user.risk_score >= 10 ? 'MEDIUM' : 'LOW';
                    const RiskIcon = user.risk_score >= 20 ? GppBadIcon : user.risk_score >= 10 ? WarningIcon : VerifiedUserIcon;
                    return (
                      <motion.div key={user.id} variants={riseIn}>
                        <AdminCard
                          sx={{ cursor: 'pointer' }}
                          hover
                        >
                          <Stack
                            spacing={2}
                            sx={{ p: 2 }}
                            onClick={() => setSelectedUserId(user.id)}
                          >
                            <Box>
                              <Typography variant='subtitle2' fontWeight={700} sx={{ color: TEXT_HEADING }}>
                                {user.full_name}
                              </Typography>
                              <Typography variant='caption' sx={{ color: TEXT_TERTIARY }}>
                                {user.email}
                              </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                              <Chip
                                label={user.is_active ? 'Active' : 'Inactive'}
                                size='small'
                                sx={{
                                  bgcolor: user.is_active ? STATUS_ACTIVATED_BG : 'transparent',
                                  color: user.is_active ? STATUS_ACTIVATED_TEXT : TEXT_TERTIARY,
                                  border: user.is_active ? 'none' : `1px solid ${BORDER_SUBTLE}`,
                                  fontWeight: 700,
                                  borderRadius: '8px',
                                }}
                              />
                              <Chip
                                icon={<RiskIcon sx={{ fontSize: 14 }} />}
                                label={riskLabel}
                                size='small'
                                sx={{
                                  bgcolor: riskBgColor,
                                  color: riskTextColor,
                                  fontWeight: 700,
                                  borderRadius: '8px',
                                  border: 'none',
                                }}
                              />
                            </Box>

                            <Stack direction='row' spacing={2}>
                              <Typography variant='caption' sx={{ color: TEXT_TERTIARY }}>
                                Entries: <strong style={{ color: TEXT_HEADING }}>{user.entry_count > 0 ? user.entry_count : '-'}</strong>
                              </Typography>
                              <Typography variant='caption' sx={{ color: TEXT_TERTIARY }}>
                                Last: <strong style={{ color: TEXT_HEADING }}>{formatLastActive(user.last_active_at)}</strong>
                              </Typography>
                            </Stack>

                            <Box sx={{ display: 'flex', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
                              <Tooltip title={user.is_active ? 'Deactivate user' : 'Activate user'}>
                                <IconButton
                                  size='small'
                                  color={user.is_active ? 'default' : 'error'}
                                  onClick={() => handleToggleUserActive(user.id, user.is_active)}
                                >
                                  {user.is_active ? <CheckCircleIcon fontSize='small' /> : <BlockIcon fontSize='small' />}
                                </IconButton>
                              </Tooltip>
                              {!isDisqualified ? (
                                <Tooltip title='Disqualify user'>
                                  <IconButton
                                    size='small'
                                    color='error'
                                    onClick={() => setRiskConfirmUser({ id: user.id, name: user.full_name, action: 'disqualify' })}
                                  >
                                    <BlockIcon fontSize='small' />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Tooltip title='Clear flag & restore entries'>
                                  <IconButton
                                    size='small'
                                    color='success'
                                    onClick={() => setRiskConfirmUser({ id: user.id, name: user.full_name, action: 'clear' })}
                                  >
                                    <CheckCircleIcon fontSize='small' />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </Stack>
                        </AdminCard>
                      </motion.div>
                    );
                  })}
            </Stack>
          </motion.div>
        ) : (
          <motion.div variants={riseIn}>
            <AdminCard sx={{ overflow: 'hidden' }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: BG_ROW_SUBTLE }}>
                      <TableCell sx={{ fontWeight: 700, color: TEXT_TERTIARY, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: TEXT_TERTIARY, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em' }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: TEXT_TERTIARY, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: TEXT_TERTIARY, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em' }}>Risk</TableCell>
                      <TableCell align='right' sx={{ fontWeight: 700, color: TEXT_TERTIARY, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em' }}>Entries</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: TEXT_TERTIARY, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em' }}>Last Active</TableCell>
                      <TableCell align='right' sx={{ fontWeight: 700, color: TEXT_TERTIARY, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {isLoading
                      ? Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            {Array.from({ length: 7 }).map((__, j) => (
                              <TableCell key={j}><Skeleton variant='text' /></TableCell>
                            ))}
                          </TableRow>
                        ))
                      : desktopRows.map((user: AdminUser) => {
                          const isDisqualified = user.risk_score >= 20;
                          const riskBgColor = user.risk_score >= 20 ? METRIC_BAD_TINT : user.risk_score >= 10 ? METRIC_WARN_TINT : METRIC_GOOD_TINT;
                          const riskTextColor = user.risk_score >= 20 ? METRIC_BAD : user.risk_score >= 10 ? METRIC_WARN : METRIC_GOOD;
                          const riskLabel = user.risk_score >= 20 ? 'HIGH' : user.risk_score >= 10 ? 'MEDIUM' : 'LOW';
                          const RiskIcon = user.risk_score >= 20 ? GppBadIcon : user.risk_score >= 10 ? WarningIcon : VerifiedUserIcon;
                          return (
                            <TableRow
                              key={user.id}
                              hover
                              sx={{
                                cursor: 'pointer',
                                '&:hover': { bgcolor: BG_ROW_SUBTLE },
                                borderBottom: `1px solid ${BORDER_SUBTLE}`,
                              }}
                              onClick={() => setSelectedUserId(user.id)}
                            >
                              <TableCell sx={{ fontWeight: 600 }}>
                                {user.full_name}
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Chip
                                  label={user.is_active ? 'Active' : 'Inactive'}
                                  size='small'
                                  sx={{
                                    bgcolor: user.is_active ? STATUS_ACTIVATED_BG : 'transparent',
                                    color: user.is_active ? STATUS_ACTIVATED_TEXT : TEXT_TERTIARY,
                                    border: user.is_active ? 'none' : `1px solid ${BORDER_SUBTLE}`,
                                    fontWeight: 700,
                                    borderRadius: '8px',
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Stack direction='row' spacing={0.5} alignItems='center'>
                                  <Chip
                                    icon={<RiskIcon sx={{ fontSize: 14 }} />}
                                    label={riskLabel}
                                    size='small'
                                    sx={{
                                      bgcolor: riskBgColor,
                                      color: riskTextColor,
                                      fontWeight: 700,
                                      borderRadius: '8px',
                                      border: 'none',
                                    }}
                                  />
                                  <Typography variant='caption' sx={{ color: TEXT_TERTIARY }}>{user.risk_score}</Typography>
                                </Stack>
                              </TableCell>
                              <TableCell align='right'>
                                <Typography variant='body2'>{user.entry_count > 0 ? user.entry_count : '-'}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant='body2' sx={{ color: TEXT_TERTIARY }}>{formatLastActive(user.last_active_at)}</Typography>
                              </TableCell>
                              <TableCell align='right' onClick={(e) => e.stopPropagation()}>
                                <Stack direction='row' spacing={0.5} justifyContent='flex-end'>
                                  <Tooltip title={user.is_active ? 'Deactivate' : 'Activate'}>
                                    <IconButton
                                      size='small'
                                      color={user.is_active ? 'default' : 'error'}
                                      onClick={() => handleToggleUserActive(user.id, user.is_active)}
                                    >
                                      {user.is_active ? <CheckCircleIcon fontSize='small' /> : <BlockIcon fontSize='small' />}
                                    </IconButton>
                                  </Tooltip>
                                  {!isDisqualified ? (
                                    <Tooltip title='Disqualify user'>
                                      <IconButton
                                        size='small'
                                        color='error'
                                        onClick={() => setRiskConfirmUser({ id: user.id, name: user.full_name, action: 'disqualify' })}
                                      >
                                        <BlockIcon fontSize='small' />
                                      </IconButton>
                                    </Tooltip>
                                  ) : (
                                    <Tooltip title='Clear flag & restore entries'>
                                      <IconButton
                                        size='small'
                                        color='success'
                                        onClick={() => setRiskConfirmUser({ id: user.id, name: user.full_name, action: 'clear' })}
                                      >
                                        <CheckCircleIcon fontSize='small' />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Stack>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                  </TableBody>
                </Table>
              </TableContainer>
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
          </motion.div>
        )}

        {isEmpty && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant='h6' gutterBottom>No users found</Typography>
            <Typography variant='body2' color='text.secondary'>Try adjusting your search or filters.</Typography>
          </Box>
        )}
        </Box>
        {isRefreshing && (
          <Box sx={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress size={36} thickness={4} />
          </Box>
        )}
        </Box>

        {/* Infinite scroll sentinel (mobile only; desktop uses pagination) */}
        {isMobile && (
          <Box ref={sentinelRef} sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
            {isFetchingNextPage && <CircularProgress size={24} />}
          </Box>
        )}
      </Stack>

      <UserDetailDrawer userId={selectedUserId} onClose={() => setSelectedUserId(null)} />

      {/* Risk action confirmation dialog */}
      <Dialog open={!!riskConfirmUser} onClose={() => setRiskConfirmUser(null)}>
        <DialogTitle>
          {riskConfirmUser?.action === 'disqualify' ? 'Disqualify User?' : 'Clear Flag?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {riskConfirmUser?.action === 'disqualify'
              ? `Disqualify ${riskConfirmUser.name}? This will quarantine all their current campaign entries. They can no longer submit until their score is cleared.`
              : `Clear flag for ${riskConfirmUser?.name}? This will restore their quarantined entries and lower their risk score to 19 (below the high-risk threshold).`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRiskConfirmUser(null)}>Cancel</Button>
          <Button
            variant='contained'
            color={riskConfirmUser?.action === 'disqualify' ? 'error' : 'success'}
            onClick={handleConfirmRiskAction}
            disabled={setUserRisk.isPending}
          >
            {setUserRisk.isPending
              ? 'Updating...'
              : riskConfirmUser?.action === 'disqualify'
              ? 'Disqualify'
              : 'Clear Flag'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UsersTab;
