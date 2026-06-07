import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
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
  Paper,
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
import {
  useAdminUsers,
  useToggleUserActive,
  useSetUserRisk,
} from '../../hooks/useAdmin';
import type { AdminUser } from '../../types/admin.types';
import { BG_PAGE } from '../../../../shared/colors';
import UserDetailDrawer from './UserDetailDrawer';

const ROLE_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'error'> = {
  user: 'default',
  business: 'secondary',
  admin: 'error',
};

function formatLastActive(value: string | null): string {
  if (!value) return 'Never';
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffHours < 24) return 'Today';
  return date.toLocaleDateString();
}

interface Props {
  isMobile: boolean;
  onSnackError: (msg: string) => void;
  onSnackSuccess: (msg: string) => void;
}

const UsersTab: React.FC<Props> = ({ isMobile, onSnackError, onSnackSuccess }) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [role, setRole] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [riskConfirmUser, setRiskConfirmUser] = useState<{ id: number; name: string; action: 'disqualify' | 'clear' } | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

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
            <strong>{flaggedCount} {flaggedCount === 1 ? 'user' : 'users'} flagged for review</strong> — risk score &ge; 20. Their draw entries are quarantined.
          </Alert>
        )}

        {/* Search bar */}
        <TextField
          placeholder='Search by name or email…'
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
          sx={{ maxWidth: 480 }}
        />

        {/* Filter dropdowns */}
        <Stack direction='row' spacing={2} sx={{ flexWrap: 'wrap' }}>
          <FormControl size='small' sx={{ minWidth: 140 }}>
            <InputLabel>Role</InputLabel>
            <Select value={role} label='Role' onChange={(e) => setRole(e.target.value)}>
              <MenuItem value=''>All Roles</MenuItem>
              <MenuItem value='user'>User</MenuItem>
              <MenuItem value='business'>Business</MenuItem>
            </Select>
          </FormControl>

          <FormControl size='small' sx={{ minWidth: 160 }}>
            <InputLabel>Risk</InputLabel>
            <Select value={riskLevel} label='Risk' onChange={(e) => setRiskLevel(e.target.value)}>
              <MenuItem value=''>All Risk</MenuItem>
              <MenuItem value='high'>High (&ge;20)</MenuItem>
              <MenuItem value='medium'>Medium (10-19)</MenuItem>
              <MenuItem value='low'>Low (&lt;10)</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Users table / cards */}
        {isMobile ? (
          <Stack spacing={2}>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} variant='rounded' height={140} />
                ))
              : rows.map((user: AdminUser) => (
                  <Card
                    key={user.id}
                    elevation={0}
                    sx={{ border: '1px solid', borderColor: 'divider', cursor: 'pointer' }}
                    onClick={() => setSelectedUserId(user.id)}
                  >
                    <CardContent>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant='subtitle2' fontWeight={700}>{user.full_name}</Typography>
                          <Typography variant='caption' color='text.secondary'>{user.email}</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip label={user.role} size='small' color={ROLE_COLORS[user.role.toLowerCase()] || 'default'} />
                          <Chip
                            label={user.is_active ? 'Active' : 'Inactive'}
                            size='small'
                            variant={user.is_active ? 'filled' : 'outlined'}
                            color={user.is_active ? 'success' : 'default'}
                          />
                          {user.business_name && (
                            <Chip label={user.business_name} size='small' variant='outlined' />
                          )}
                        </Box>

                        <Stack direction='row' spacing={2}>
                          <Typography variant='caption' color='text.secondary'>
                            Entries: <strong>{user.entry_count > 0 ? user.entry_count : '—'}</strong>
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            Last active: <strong>{formatLastActive(user.last_active_at)}</strong>
                          </Typography>
                        </Stack>

                        <Box sx={{ display: 'flex', gap: 1 }} onClick={(e) => e.stopPropagation()}>
                          <Tooltip title={user.is_active ? 'Deactivate user' : 'Activate user'}>
                            <IconButton
                              size='small'
                              color={user.is_active ? 'default' : 'error'}
                              onClick={() => handleToggleUserActive(user.id, user.is_active)}
                            >
                              {user.is_active ? <CheckCircleIcon /> : <BlockIcon />}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
          </Stack>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: BG_PAGE }}>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Business</TableCell>
                  <TableCell>Risk</TableCell>
                  <TableCell align='right'>Entries</TableCell>
                  <TableCell>Last Active</TableCell>
                  <TableCell align='right'>Actions</TableCell>
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
                      const riskChipColor: 'error' | 'warning' | 'success' =
                        user.risk_score >= 20 ? 'error' : user.risk_score >= 10 ? 'warning' : 'success';
                      const riskLabel = user.risk_score >= 20 ? 'HIGH' : user.risk_score >= 10 ? 'MEDIUM' : 'LOW';
                      const RiskIcon = user.risk_score >= 20 ? GppBadIcon : user.risk_score >= 10 ? WarningIcon : VerifiedUserIcon;
                      return (
                        <TableRow key={user.id} hover sx={{ cursor: 'pointer' }} onClick={() => setSelectedUserId(user.id)}>
                          <TableCell>{user.full_name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Chip label={user.role} size='small' color={ROLE_COLORS[user.role.toLowerCase()] || 'default'} />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={user.is_active ? 'Active' : 'Inactive'}
                              size='small'
                              variant={user.is_active ? 'filled' : 'outlined'}
                              color={user.is_active ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            {user.business_name
                              ? <Typography variant='body2'>{user.business_name}</Typography>
                              : <Typography variant='body2' color='text.secondary'>-</Typography>}
                          </TableCell>
                          <TableCell>
                            <Stack direction='row' spacing={0.5} alignItems='center'>
                              <Chip icon={<RiskIcon />} label={riskLabel} size='small' color={riskChipColor} />
                              <Typography variant='caption' color='text.secondary'>{user.risk_score}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align='right'>
                            <Typography variant='body2'>{user.entry_count > 0 ? user.entry_count : '—'}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant='body2' color='text.secondary'>{formatLastActive(user.last_active_at)}</Typography>
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
