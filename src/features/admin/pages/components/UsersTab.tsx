import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Alert,
  Chip,
  Button,
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
  IconButton,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GppBadIcon from '@mui/icons-material/GppBad';
import WarningIcon from '@mui/icons-material/Warning';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import {
  useUpdateUserRole,
  useToggleUserActive,
  useSetUserRisk,
} from '../../hooks/useAdmin';
import type { AdminUser } from '../../types/admin.types';
import { BG_PAGE } from '../../../../shared/colors';

const ROLE_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'error'> = {
  user: 'default',
  business: 'secondary',
  admin: 'error',
};

interface Props {
  users: AdminUser[] | undefined;
  isMobile: boolean;
  onSnackError: (msg: string) => void;
  onSnackSuccess: (msg: string) => void;
}

const UsersTab: React.FC<Props> = ({ users, isMobile, onSnackError, onSnackSuccess }) => {
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userRiskFilter, setUserRiskFilter] = useState('all');
  const [userRoleDialogOpen, setUserRoleDialogOpen] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState('user');
  const [riskConfirmUser, setRiskConfirmUser] = useState<{ id: number; name: string; action: 'disqualify' | 'clear' } | null>(null);

  const updateUserRole = useUpdateUserRole();
  const toggleUserActive = useToggleUserActive();
  const setUserRisk = useSetUserRisk();

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((u: AdminUser) => {
      const matchesSearch =
        u.full_name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearchQuery.toLowerCase());
      const matchesRole =
        userRoleFilter === 'all' || u.role.toLowerCase() === userRoleFilter;
      const matchesRisk =
        userRiskFilter === 'all' ||
        (userRiskFilter === 'high' && u.risk_score >= 20) ||
        (userRiskFilter === 'medium' && u.risk_score >= 10 && u.risk_score < 20) ||
        (userRiskFilter === 'low' && u.risk_score < 10);
      return matchesSearch && matchesRole && matchesRisk;
    });
  }, [users, userSearchQuery, userRoleFilter, userRiskFilter]);

  const handleUpdateUserRole = async (userId: number) => {
    try {
      await updateUserRole.mutateAsync({ userId, role: selectedRole });
      onSnackSuccess('User role updated successfully');
    } catch (e: any) {
      onSnackError(e?.response?.data?.message ?? 'Failed to update user role');
    }
    setUserRoleDialogOpen(null);
  };

  const handleToggleUserActive = async (userId: number, currentStatus: boolean) => {
    try {
      await toggleUserActive.mutateAsync({ userId, is_active: !currentStatus });
      onSnackSuccess(
        `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      );
    } catch (e: any) {
      onSnackError(e?.response?.data?.message ?? 'Failed to update user status');
    }
  };

  const handleConfirmRiskAction = async () => {
    if (!riskConfirmUser) return;
    const riskScore = riskConfirmUser.action === 'disqualify' ? 20 : 18;
    try {
      await setUserRisk.mutateAsync({ userId: riskConfirmUser.id, riskScore });
      onSnackSuccess(
        riskConfirmUser.action === 'disqualify'
          ? `${riskConfirmUser.name} has been disqualified`
          : `Flag cleared for ${riskConfirmUser.name}`,
      );
    } catch (e: any) {
      onSnackError(e?.response?.data?.message ?? 'Failed to update risk score');
    }
    setRiskConfirmUser(null);
  };

  return (
    <>
      <Stack spacing={3}>
        {/* Flagged users banner */}
        {(() => {
          const flaggedCount = (users ?? []).filter((u: AdminUser) => u.risk_score >= 20).length;
          return flaggedCount > 0 ? (
            <Alert severity='error'>
              <strong>{flaggedCount} {flaggedCount === 1 ? 'user' : 'users'} flagged for review</strong> - risk score &ge; 15. Their draw entries are quarantined.
            </Alert>
          ) : null;
        })()}

        {/* Search and filters */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <TextField
            placeholder='Search by name or email'
            size='small'
            value={userSearchQuery}
            onChange={(e) => setUserSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon fontSize='small' />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, minWidth: 250 }}
          />

          <Stack direction='row' spacing={1} sx={{ flexWrap: 'wrap' }}>
            {['all', 'user', 'business'].map((role: string) => (
              <Chip
                key={role}
                label={role.charAt(0).toUpperCase() + role.slice(1)}
                onClick={() => setUserRoleFilter(role)}
                variant={userRoleFilter === role ? 'filled' : 'outlined'}
                size='small'
              />
            ))}
          </Stack>
        </Box>

        {/* Risk filter chips */}
        <Stack direction='row' spacing={1} sx={{ flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'All' },
            { key: 'high', label: 'High Risk' },
            { key: 'medium', label: 'Medium Risk' },
            { key: 'low', label: 'Low Risk' },
          ].map((item) => (
            <Chip
              key={item.key}
              label={item.label}
              onClick={() => setUserRiskFilter(item.key)}
              variant={userRiskFilter === item.key ? 'filled' : 'outlined'}
              size='small'
              color={item.key === 'high' ? 'error' : item.key === 'medium' ? 'warning' : item.key === 'low' ? 'success' : 'default'}
            />
          ))}
        </Stack>

        {/* Users table / cards */}
        {isMobile ? (
          <Stack spacing={2}>
            {filteredUsers.map((user: any) => (
              <Card
                key={user.id}
                elevation={0}
                sx={{ border: '1px solid', borderColor: 'divider' }}
              >
                <CardContent>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant='subtitle2' fontWeight={700}>
                        {user.full_name}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {user.email}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={user.role}
                        size='small'
                        color={ROLE_COLORS[user.role.toLowerCase()] || 'default'}
                      />
                      <Chip
                        label={user.is_active ? 'Active' : 'Inactive'}
                        size='small'
                        variant={user.is_active ? 'filled' : 'outlined'}
                        color={user.is_active ? 'success' : 'default'}
                      />
                      {user.business_name && (
                        <Chip
                          label={user.business_name}
                          size='small'
                          variant='outlined'
                        />
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {user.role.toLowerCase() !== 'admin' && (
                        <Button
                          size='small'
                          variant='outlined'
                          startIcon={<EditIcon />}
                          onClick={() => {
                            setSelectedRole(user.role.toLowerCase());
                            setUserRoleDialogOpen(user.id);
                          }}
                        >
                          Change Role
                        </Button>
                      )}
                      <Tooltip
                        title={
                          user.is_active ? 'Deactivate user' : 'Activate user'
                        }
                      >
                        <IconButton
                          size='small'
                          color={user.is_active ? 'default' : 'error'}
                          onClick={() =>
                            handleToggleUserActive(user.id, user.is_active)
                          }
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
                  <TableCell align='right'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user: AdminUser) => {
                  const isDisqualified = user.risk_score >= 20;
                  const riskChipColor: 'error' | 'warning' | 'success' =
                    user.risk_score >= 20 ? 'error' : user.risk_score >= 10 ? 'warning' : 'success';
                  const riskLabel = user.risk_score >= 20 ? 'HIGH' : user.risk_score >= 10 ? 'MEDIUM' : 'LOW';
                  const RiskIcon = user.risk_score >= 20 ? GppBadIcon : user.risk_score >= 10 ? WarningIcon : VerifiedUserIcon;
                  return (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          size='small'
                          color={ROLE_COLORS[user.role.toLowerCase()] || 'default'}
                        />
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
                        {user.business_name ? (
                          <Typography variant='body2'>{user.business_name}</Typography>
                        ) : (
                          <Typography variant='body2' color='text.secondary'>
-
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack direction='row' spacing={0.5} alignItems='center'>
                          <Chip
                            icon={<RiskIcon />}
                            label={riskLabel}
                            size='small'
                            color={riskChipColor}
                          />
                          <Typography variant='caption' color='text.secondary'>
                            {user.risk_score}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align='right'>
                        <Stack direction='row' spacing={0.5} justifyContent='flex-end'>
                          {user.role.toLowerCase() !== 'admin' && (
                            <Tooltip title='Change role'>
                              <IconButton
                                size='small'
                                onClick={() => {
                                  setSelectedRole(user.role.toLowerCase());
                                  setUserRoleDialogOpen(user.id);
                                }}
                              >
                                <EditIcon fontSize='small' />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip
                            title={
                              user.is_active ? 'Deactivate' : 'Activate'
                            }
                          >
                            <IconButton
                              size='small'
                              color={user.is_active ? 'default' : 'error'}
                              onClick={() =>
                                handleToggleUserActive(user.id, user.is_active)
                              }
                            >
                              {user.is_active ? (
                                <CheckCircleIcon fontSize='small' />
                              ) : (
                                <BlockIcon fontSize='small' />
                              )}
                            </IconButton>
                          </Tooltip>
                          {!isDisqualified ? (
                            <Tooltip title='Disqualify user'>
                              <IconButton
                                size='small'
                                color='error'
                                onClick={() =>
                                  setRiskConfirmUser({ id: user.id, name: user.full_name, action: 'disqualify' })
                                }
                              >
                                <BlockIcon fontSize='small' />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title='Clear flag & restore entries'>
                              <IconButton
                                size='small'
                                color='success'
                                onClick={() =>
                                  setRiskConfirmUser({ id: user.id, name: user.full_name, action: 'clear' })
                                }
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

        {filteredUsers.length === 0 && (
          <Alert severity='info'>No users match your search criteria.</Alert>
        )}
      </Stack>

      {/* User role update dialog */}
      <Dialog
        open={!!userRoleDialogOpen}
        onClose={() => setUserRoleDialogOpen(null)}
      >
        <DialogTitle>Change User Role</DialogTitle>
        <DialogContent sx={{ minWidth: 300 }}>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                label='Role'
              >
                <MenuItem value='user'>User</MenuItem>
                <MenuItem value='business'>Business</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserRoleDialogOpen(null)}>Cancel</Button>
          <Button
            variant='contained'
            onClick={() =>
              userRoleDialogOpen && handleUpdateUserRole(userRoleDialogOpen)
            }
            disabled={updateUserRole.isPending}
          >
            {updateUserRole.isPending ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Risk action confirmation dialog */}
      <Dialog
        open={!!riskConfirmUser}
        onClose={() => setRiskConfirmUser(null)}
      >
        <DialogTitle>
          {riskConfirmUser?.action === 'disqualify' ? 'Disqualify User?' : 'Clear Flag?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {riskConfirmUser?.action === 'disqualify'
              ? `Disqualify ${riskConfirmUser.name}? This will quarantine all their current campaign entries. They can no longer submit until their score is cleared.`
              : `Clear flag for ${riskConfirmUser?.name}? This will restore their entries and set their risk score to 18 (on watch).`}
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
