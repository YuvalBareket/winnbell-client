import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Alert,
  Chip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableContainer,
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
  PRIMARY_MAIN,
} from '../../../../shared/colors';
import { riseIn, staggerContainer } from '../../../../shared/motion';
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
  const [riskConfirmUser, setRiskConfirmUser] = useState<{ id: number; name: string; action: 'disqualify' | 'clear' } | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAdminUsers({
    limit: 50,
    search: debouncedSearch,
    role,
    riskLevel,
  });

  const rows: AdminUser[] = data?.pages.flatMap((p) => p.rows) ?? [];

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

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

  const flaggedCount = rows.filter((u: AdminUser) => u.risk_score >= 20).length;
  const isEmpty = !isLoading && rows.length === 0;

  return (
    <>
      <Stack spacing={3}>
        {/* Flagged users banner */}
        {flaggedCount > 0 && (
          <Alert severity='error'>
            <strong>{flaggedCount} {flaggedCount === 1 ? 'user' : 'users'} flagged for review</strong>. Risk score &ge; 20. Their draw entries are quarantined.
          </Alert>
        )}

        {/* Search bar */}
        <TextField
          placeholder='Search by name or email'
          size='small'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
              onChange={(e) => setRole(e.target.value)}
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
              onChange={(e) => setRiskLevel(e.target.value)}
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

        {/* Users table / cards */}
        {isMobile ? (
          <motion.div variants={staggerContainer} initial='hidden' animate='visible'>
            <Stack spacing={2}>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} variant='rounded' height={140} />
                  ))
                : rows.map((user: AdminUser) => {
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
                                label={user.role}
                                size='small'
                                sx={{
                                  bgcolor: user.role === 'Business' ? PRIMARY_MAIN : 'default',
                                  color: user.role === 'Business' ? 'white' : 'default',
                                }}
                              />
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
                                Entries: <strong style={{ color: TEXT_HEADING }}>{user.entry_count > 0 ? user.entry_count : '—'}</strong>
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
                      <TableCell sx={{ fontWeight: 700, color: TEXT_TERTIARY, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em' }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: TEXT_TERTIARY, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: TEXT_TERTIARY, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em' }}>Business</TableCell>
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
                            {Array.from({ length: 9 }).map((__, j) => (
                              <TableCell key={j}><Skeleton variant='text' /></TableCell>
                            ))}
                          </TableRow>
                        ))
                      : rows.map((user: AdminUser) => {
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
                                  label={user.role}
                                  size='small'
                                  sx={{
                                    bgcolor: user.role === 'Business' ? PRIMARY_MAIN : 'default',
                                    color: user.role === 'Business' ? 'white' : 'default',
                                  }}
                                />
                              </TableCell>
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
                                {user.business_name
                                  ? <Typography variant='body2'>{user.business_name}</Typography>
                                  : <Typography variant='body2' sx={{ color: TEXT_TERTIARY }}>-</Typography>}
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
                                <Typography variant='body2'>{user.entry_count > 0 ? user.entry_count : '—'}</Typography>
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
            </AdminCard>
          </motion.div>
        )}

        {isEmpty && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant='h6' gutterBottom>No users found</Typography>
            <Typography variant='body2' color='text.secondary'>Try adjusting your search or filters.</Typography>
          </Box>
        )}

        {/* Infinite scroll sentinel */}
        <Box ref={sentinelRef} sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
          {isFetchingNextPage && <CircularProgress size={24} />}
        </Box>
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
