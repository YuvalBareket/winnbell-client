import React, { useState, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  LinearProgress,
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
  Stack,
  Alert,
  Snackbar,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Skeleton,
  useMediaQuery,
  useTheme,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PeopleIcon from '@mui/icons-material/People';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  useAdminBusinesses,
  useAllDraws,
  useOpenDraw,
  useCloseDraw,
  usePickWinner,
  useAdminOverview,
  useAdminUsers,
  useUpdateUserRole,
  useToggleUserActive,
  useDrawBusinesses,
} from '../hooks/useAdmin';
import CreateBusinessModal from './components/CreateBusinessModal';
import CreateDrawModal from './components/CreateDrawModal';
import GenerateTicketsModal from './components/GenerateTicketsModal';
import { BUSINESS_SECTORS } from '../data';
import {
  GRADIENT_HERO,
  BG_PAGE,
  ALPHA_WHITE_80,
} from '../../../shared/colors';

const STATUS_COLORS: Record<string, 'default' | 'warning' | 'primary' | 'success' | 'error'> = {
  upcoming: 'default',
  open: 'primary',
  closed: 'success',
};

const ROLE_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'error'> = {
  user: 'default',
  business: 'secondary',
  admin: 'error',
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <Box
      role='tabpanel'
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </Box>
  );
}

const DrawBusinessesPanel: React.FC<{ drawId: number }> = ({ drawId }) => {
  const { data, isLoading } = useDrawBusinesses(drawId);
  if (isLoading) return <Box sx={{ p: 2 }}><Skeleton variant='rectangular' height={60} /></Box>;
  if (!data?.length) return <Box sx={{ p: 2 }}><Typography variant='body2' color='text.secondary'>No businesses enrolled in this draw.</Typography></Box>;
  return (
    <Box sx={{ px: 3, pb: 2, bgcolor: BG_PAGE }}>
      <Typography variant='caption' fontWeight={700} color='text.secondary' sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>
        Participating Businesses ({data.length})
      </Typography>
      <Stack spacing={0.5}>
        {data.map((b) => (
          <Box key={b.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.75, px: 1.5, borderRadius: 1.5, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant='body2' fontWeight={600}>{b.name}</Typography>
            <Stack direction='row' spacing={2} alignItems='center'>
              <Typography variant='caption' color='text.secondary'>Fee: ${Number(b.fee_at_entry).toLocaleString()}</Typography>
              <Typography variant='caption' color='text.secondary'>Contribution: ${Number(b.contribution_amount).toLocaleString()}</Typography>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

const BusinessDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [tabValue, setTabValue] = useState(0);
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);
  const [isBizModalOpen, setIsBizModalOpen] = useState(false);
  const [isDrawModalOpen, setIsDrawModalOpen] = useState(false);

  // Dialog states for draw actions
  const [confirmOpen, setConfirmOpen] = useState<number | null>(null);
  const [confirmClose, setConfirmClose] = useState<number | null>(null);
  const [confirmPick, setConfirmPick] = useState<number | null>(null);
  const [winnerResult, setWinnerResult] = useState<{
    winnerName: string;
    ticketCode: string;
    businessName: string | null;
    locationName: string | null;
    prizePool: number;
  } | null>(null);

  // Users tab state
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userRoleDialogOpen, setUserRoleDialogOpen] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState('user');

  const [expandedDrawId, setExpandedDrawId] = useState<number | null>(null);
  const [snackError, setSnackError] = useState('');
  const [snackSuccess, setSnackSuccess] = useState('');

  // Queries
  const { data: overview, isLoading: loadingOverview } = useAdminOverview();
  const { data: businesses, isLoading: loadingBiz } = useAdminBusinesses();
  const { data: draws, isLoading: loadingDraws } = useAllDraws();
  const { data: users, isLoading: loadingUsers } = useAdminUsers();

  // Mutations
  const openDraw = useOpenDraw();
  const closeDraw = useCloseDraw();
  const pickWinner = usePickWinner();
  const updateUserRole = useUpdateUserRole();
  const toggleUserActive = useToggleUserActive();

  // Draw action handlers
  const handleOpenDraw = async () => {
    if (!confirmOpen) return;
    try {
      await openDraw.mutateAsync(confirmOpen);
      setSnackSuccess('Draw opened successfully');
    } catch (e: any) {
      setSnackError(e?.response?.data?.message ?? 'Failed to open draw');
    }
    setConfirmOpen(null);
  };

  const handleCloseDraw = async () => {
    if (!confirmClose) return;
    try {
      await closeDraw.mutateAsync(confirmClose);
      setSnackSuccess('Draw closed successfully');
    } catch (e: any) {
      setSnackError(e?.response?.data?.message ?? 'Failed to close draw');
    }
    setConfirmClose(null);
  };

  const handlePickWinner = async () => {
    if (!confirmPick) return;
    try {
      const { data } = await pickWinner.mutateAsync(confirmPick);
      setWinnerResult({
        winnerName: data.winnerName,
        ticketCode: data.ticketCode,
        businessName: data.businessName ?? null,
        locationName: data.locationName ?? null,
        prizePool: data.prizePool,
      });
    } catch (e: any) {
      setSnackError(e?.response?.data?.message ?? 'Failed to pick winner');
    }
    setConfirmPick(null);
  };

  // User role update handler
  const handleUpdateUserRole = async (userId: number) => {
    try {
      await updateUserRole.mutateAsync({ userId, role: selectedRole });
      setSnackSuccess('User role updated successfully');
    } catch (e: any) {
      setSnackError(e?.response?.data?.message ?? 'Failed to update user role');
    }
    setUserRoleDialogOpen(null);
  };

  // User active toggle handler
  const handleToggleUserActive = async (userId: number, currentStatus: boolean) => {
    try {
      await toggleUserActive.mutateAsync({ userId, is_active: !currentStatus });
      setSnackSuccess(
        `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      );
    } catch (e: any) {
      setSnackError(e?.response?.data?.message ?? 'Failed to update user status');
    }
  };

  // Filter users
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((u: any) => {
      const matchesSearch =
        u.full_name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearchQuery.toLowerCase());
      const matchesRole =
        userRoleFilter === 'all' || u.role.toLowerCase() === userRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, userSearchQuery, userRoleFilter]);

  // Get current open draw
  const currentOpenDraw = draws?.find((d) => d.status?.toUpperCase() === 'OPEN');

  const isLoading = loadingOverview || loadingBiz || loadingDraws || loadingUsers;

  if (isLoading) {
    return (
      <Box sx={{ mt: 4 }}>
        <Skeleton variant='rectangular' height={200} sx={{ mb: 3, borderRadius: 2 }} />
        <Skeleton variant='rectangular' height={400} />
      </Box>
    );
  }

  return (
    <>
      {/* Hero Header */}
      <Box
        sx={{
          background: GRADIENT_HERO,
          color: 'white',
          py: isMobile ? 3 : 5,
          px: 2,
          textAlign: 'center',
        }}
      >
        <Container maxWidth='lg'>
          <Typography
            variant={isMobile ? 'h5' : 'h3'}
            fontWeight={800}
            sx={{ mb: 1 }}
          >
            Admin Dashboard
          </Typography>
          <Typography
            variant={isMobile ? 'body2' : 'body1'}
            sx={{ opacity: ALPHA_WHITE_80 }}
          >
            Manage businesses, draws, users, and subscriptions
          </Typography>
        </Container>
      </Box>

      {/* Content area */}
      <Container maxWidth='lg' sx={{ mt: -2, pb: 6, position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {/* Tab navigation */}
          <Box
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              backgroundColor: BG_PAGE,
              overflowX: 'auto',
              overflowY: 'hidden',
            }}
          >
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              variant={isMobile ? 'scrollable' : 'standard'}
              scrollButtons={isMobile ? 'auto' : false}
            >
              <Tab label='Overview' />
              <Tab label='Users' />
              <Tab label='Businesses' />
              <Tab label='Draws' />
              <Tab label='Revenue' />
            </Tabs>
          </Box>

          {/* Tab content */}
          <Box sx={{ p: isMobile ? 2 : 4 }}>
            {/* TAB 0: OVERVIEW */}
            <TabPanel value={tabValue} index={0}>
              <Stack spacing={3}>
                {/* KPI Cards */}
                <Grid container spacing={isMobile ? 1.5 : 2}>
                  {/* Total Users */}
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                      <CardContent>
                        <Stack spacing={1} alignItems='flex-start'>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 40,
                              height: 40,
                              borderRadius: 1,
                              backgroundColor: '#e3f2fd',
                              color: '#1976d2',
                            }}
                          >
                            <PeopleIcon />
                          </Box>
                          <Typography variant='body2' color='text.secondary'>
                            Total Users
                          </Typography>
                          <Typography variant='h6' fontWeight={700}>
                            {overview?.users?.total_users ?? 0}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {overview?.users?.business_users ?? 0} businesses,{' '}
                            {overview?.users?.regular_users ?? 0} regular
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Active Businesses */}
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                      <CardContent>
                        <Stack spacing={1} alignItems='flex-start'>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 40,
                              height: 40,
                              borderRadius: 1,
                              backgroundColor: '#e8f5e9',
                              color: '#2e7d32',
                            }}
                          >
                            <StorefrontIcon />
                          </Box>
                          <Typography variant='body2' color='text.secondary'>
                            Active Businesses
                          </Typography>
                          <Typography variant='h6' fontWeight={700}>
                            {overview?.businesses?.active ?? 0}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            of {overview?.businesses?.total ?? 0} total
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Active Subscriptions */}
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                      <CardContent>
                        <Stack spacing={1} alignItems='flex-start'>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 40,
                              height: 40,
                              borderRadius: 1,
                              backgroundColor: '#f3e5f5',
                              color: '#7b1fa2',
                            }}
                          >
                            <CreditCardIcon />
                          </Box>
                          <Typography variant='body2' color='text.secondary'>
                            Active Subscriptions
                          </Typography>
                          <Typography variant='h6' fontWeight={700}>
                            {overview?.subscriptions?.active_subs ?? 0}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            ${Number(overview?.subscriptions?.total_fees ?? 0).toLocaleString()} monthly
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Current Draw Prize Pool */}
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                      <CardContent>
                        <Stack spacing={1} alignItems='flex-start'>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 40,
                              height: 40,
                              borderRadius: 1,
                              backgroundColor: '#fff3e0',
                              color: '#f57c00',
                            }}
                          >
                            <EmojiEventsIcon />
                          </Box>
                          <Typography variant='body2' color='text.secondary'>
                            Current Draw Prize
                          </Typography>
                          <Typography variant='h6' fontWeight={700}>
                            ${Number(overview?.currentDraw?.prize_pool ?? 0).toLocaleString()}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {overview?.currentDraw?.name ?? 'No active draw'}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Current Draw Card */}
                {currentOpenDraw ? (
                  <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                    <CardContent>
                      <Stack spacing={2}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                            gap: 2,
                          }}
                        >
                          <Box>
                            <Typography variant='h6' fontWeight={700}>
                              {currentOpenDraw.name}
                            </Typography>
                            <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                              Prize Pool: ${Number(currentOpenDraw.prize_amount ?? 0).toLocaleString()}
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                              Draw Date: {new Date(currentOpenDraw.draw_date).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Chip label='Open' color='primary' />
                        </Box>

                        {/* Ticket activation progress */}
                        <Box>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              mb: 1,
                            }}
                          >
                            <Typography variant='body2' fontWeight={500}>
                              Ticket Activation
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                              {overview?.currentDrawTickets?.activated ?? 0} /{' '}
                              {overview?.currentDrawTickets?.total_tickets ?? 0}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant='determinate'
                            value={
                              overview?.currentDrawTickets?.total_tickets
                                ? (overview.currentDrawTickets.activated /
                                  overview.currentDrawTickets.total_tickets) *
                                100
                                : 0
                            }
                            sx={{ height: 8, borderRadius: 1 }}
                          />
                          <Typography
                            variant='caption'
                            color='text.secondary'
                            sx={{ display: 'block', mt: 1 }}
                          >
                            {overview?.currentDrawTickets?.total_tickets
                              ? Math.round(
                                (overview.currentDrawTickets.activated /
                                  overview.currentDrawTickets.total_tickets) *
                                100
                              )
                              : 0}
                            % activated
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                ) : (
                  <Alert severity='info'>
                    No active draw. Create and open a draw in the <strong>Draws</strong> tab to start a raffle.
                  </Alert>
                )}
              </Stack>
            </TabPanel>

            {/* TAB 1: USERS */}
            <TabPanel value={tabValue} index={1}>
              <Stack spacing={3}>
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
                          <TableCell align='right'>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredUsers.map((user: any) => (
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
                                  —
                                </Typography>
                              )}
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
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
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
            </TabPanel>

            {/* TAB 2: BUSINESSES */}
            <TabPanel value={tabValue} index={2}>
              <Stack spacing={3}>
                <Box display='flex' justifyContent='flex-end'>
                  <Button
                    variant='contained'
                    startIcon={<AddIcon />}
                    onClick={() => setIsBizModalOpen(true)}
                  >
                    New Business
                  </Button>
                </Box>

                {isMobile ? (
                  <Stack spacing={2}>
                    {businesses?.map((biz) => {
                      const activationRate =
                        biz.total_tickets_created > 0
                          ? (biz.total_activated / biz.total_tickets_created) * 100
                          : 0;
                      const sectorData =
                        BUSINESS_SECTORS[biz.sector as keyof typeof BUSINESS_SECTORS];

                      return (
                        <Card
                          key={biz.id}
                          elevation={0}
                          sx={{ border: '1px solid', borderColor: 'divider' }}
                        >
                          <CardContent>
                            <Stack spacing={2}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1.5,
                                }}
                              >
                                {sectorData && (
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: 40,
                                      height: 40,
                                      borderRadius: 1,
                                      backgroundColor: sectorData.bgColor,
                                      color: sectorData.color,
                                    }}
                                  >
                                    {sectorData.icon}
                                  </Box>
                                )}
                                <Box flex={1}>
                                  <Typography variant='subtitle2' fontWeight={700}>
                                    {biz.name}
                                  </Typography>
                                  <Chip
                                    label={sectorData?.label || biz.sector}
                                    size='small'
                                    variant='outlined'
                                    sx={{ mt: 0.5 }}
                                  />
                                </Box>
                              </Box>

                              <Box>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    mb: 1,
                                  }}
                                >
                                  <Typography variant='body2' fontWeight={500}>
                                    Activation Rate
                                  </Typography>
                                  <Typography variant='body2' fontWeight={500}>
                                    {Math.round(activationRate)}%
                                  </Typography>
                                </Box>
                                <LinearProgress
                                  variant='determinate'
                                  value={activationRate}
                                  sx={{
                                    height: 8,
                                    borderRadius: 1,
                                    backgroundColor:
                                      activationRate > 60
                                        ? '#c8e6c9'
                                        : activationRate > 30
                                        ? '#ffe0b2'
                                        : '#ffcdd2',
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor:
                                        activationRate > 60
                                          ? '#2e7d32'
                                          : activationRate > 30
                                          ? '#f57c00'
                                          : '#c62828',
                                    },
                                  }}
                                />
                              </Box>

                              <Box
                                sx={{
                                  display: 'grid',
                                  gridTemplateColumns: '1fr 1fr',
                                  gap: 1,
                                }}
                              >
                                <Box>
                                  <Typography
                                    variant='caption'
                                    color='text.secondary'
                                  >
                                    Total Created
                                  </Typography>
                                  <Typography variant='body2' fontWeight={700}>
                                    {biz.total_tickets_created}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography
                                    variant='caption'
                                    color='text.secondary'
                                  >
                                    Activated
                                  </Typography>
                                  <Typography variant='body2' fontWeight={700}>
                                    {biz.total_activated}
                                  </Typography>
                                </Box>
                              </Box>

                              <Button
                                fullWidth
                                variant='outlined'
                                size='small'
                                onClick={() => setSelectedBusinessId(biz.id)}
                              >
                                Generate Tickets
                              </Button>
                            </Stack>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Stack>
                ) : (
                  <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{ border: '1px solid', borderColor: 'divider' }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: BG_PAGE }}>
                          <TableCell>Name</TableCell>
                          <TableCell>Sector</TableCell>
                          <TableCell align='center'>Total Created</TableCell>
                          <TableCell align='center'>Activated</TableCell>
                          <TableCell>Activation Rate</TableCell>
                          <TableCell align='right'>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {businesses?.map((biz) => {
                          const activationRate =
                            biz.total_tickets_created > 0
                              ? (biz.total_activated / biz.total_tickets_created) * 100
                              : 0;
                          const sectorData =
                            BUSINESS_SECTORS[
                              biz.sector as keyof typeof BUSINESS_SECTORS
                            ];

                          return (
                            <TableRow key={biz.id} hover>
                              <TableCell sx={{ fontWeight: 600 }}>{biz.name}</TableCell>
                              <TableCell>
                                <Chip
                                  icon={sectorData?.icon as any}
                                  label={sectorData?.label || biz.sector}
                                  size='small'
                                  variant='filled'
                                  sx={{
                                    backgroundColor: sectorData?.bgColor,
                                    color: sectorData?.color,
                                    fontWeight: 500,
                                  }}
                                />
                              </TableCell>
                              <TableCell align='center'>
                                {biz.total_tickets_created}
                              </TableCell>
                              <TableCell align='center'>
                                {biz.total_activated}
                              </TableCell>
                              <TableCell>
                                <Box sx={{ minWidth: 150 }}>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      mb: 0.5,
                                    }}
                                  >
                                    <Typography variant='caption' fontWeight={500}>
                                      {Math.round(activationRate)}%
                                    </Typography>
                                  </Box>
                                  <LinearProgress
                                    variant='determinate'
                                    value={activationRate}
                                    sx={{
                                      height: 6,
                                      borderRadius: 1,
                                      backgroundColor:
                                        activationRate > 60
                                          ? '#c8e6c9'
                                          : activationRate > 30
                                          ? '#ffe0b2'
                                          : '#ffcdd2',
                                      '& .MuiLinearProgress-bar': {
                                        backgroundColor:
                                          activationRate > 60
                                            ? '#2e7d32'
                                            : activationRate > 30
                                            ? '#f57c00'
                                            : '#c62828',
                                      },
                                    }}
                                  />
                                </Box>
                              </TableCell>
                              <TableCell align='right'>
                                <Button
                                  size='small'
                                  variant='outlined'
                                  onClick={() => setSelectedBusinessId(biz.id)}
                                >
                                  Generate
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Stack>
            </TabPanel>

            {/* TAB 3: DRAWS */}
            <TabPanel value={tabValue} index={3}>
              <Stack spacing={3}>
                <Box display='flex' justifyContent='flex-end'>
                  <Button
                    variant='contained'
                    startIcon={<AddIcon />}
                    onClick={() => setIsDrawModalOpen(true)}
                  >
                    New Draw
                  </Button>
                </Box>

                {isMobile ? (
                  <Stack spacing={2}>
                    {draws?.map((draw) => (
                      <Card key={draw.id} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                        <CardContent>
                          <Stack spacing={2}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Box>
                                <Typography variant='subtitle2' fontWeight={700}>{draw.name}</Typography>
                                <Typography variant='caption' color='text.secondary'>Prize: ${Number(draw.prize_amount ?? 0).toLocaleString()}</Typography>
                              </Box>
                              <IconButton size='small' onClick={() => setExpandedDrawId(expandedDrawId === draw.id ? null : draw.id)}>
                                {expandedDrawId === draw.id ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                              </IconButton>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Chip label={draw.status} size='small' color={STATUS_COLORS[draw.status?.toLowerCase()] ?? 'default'} />
                              <Typography variant='caption' sx={{ alignSelf: 'center', color: 'text.secondary' }}>
                                {new Date(draw.draw_date).toLocaleDateString()}
                              </Typography>
                              {draw.status?.toUpperCase() === 'CLOSED' && draw.winner_user_id && (
                                <Chip label='Winner Selected' size='small' color='success' />
                              )}
                            </Box>

                            {expandedDrawId === draw.id && <DrawBusinessesPanel drawId={draw.id} />}

                            <Stack direction='row' spacing={1} sx={{ flexWrap: 'wrap' }}>
                              {draw.status?.toUpperCase() === 'UPCOMING' && (
                                <Button size='small' variant='contained' color='success' startIcon={<LockOpenIcon />} onClick={() => setConfirmOpen(draw.id)} fullWidth>Open</Button>
                              )}
                              {draw.status?.toUpperCase() === 'OPEN' && (
                                <Button size='small' variant='outlined' color='warning' startIcon={<LockIcon />} onClick={() => setConfirmClose(draw.id)} fullWidth>Close</Button>
                              )}
                              {draw.status?.toUpperCase() === 'CLOSED' && !draw.winner_user_id && (
                                <Button size='small' variant='contained' color='secondary' startIcon={<EmojiEventsIcon />} onClick={() => setConfirmPick(draw.id)} fullWidth>Pick Winner</Button>
                              )}
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{ border: '1px solid', borderColor: 'divider' }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: BG_PAGE }}>
                          <TableCell>Name</TableCell>
                          <TableCell>Prize Pool</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align='right'>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {draws?.map((draw) => (
                          <React.Fragment key={draw.id}>
                            <TableRow
                              hover
                              sx={{ cursor: 'pointer', '& > *': { borderBottom: expandedDrawId === draw.id ? 'none' : undefined } }}
                              onClick={() => setExpandedDrawId(expandedDrawId === draw.id ? null : draw.id)}
                            >
                              <TableCell sx={{ fontWeight: 600 }}>
                                <Stack direction='row' alignItems='center' spacing={0.5}>
                                  <IconButton size='small' sx={{ p: 0.25 }}>
                                    {expandedDrawId === draw.id ? <KeyboardArrowUpIcon fontSize='small' /> : <KeyboardArrowDownIcon fontSize='small' />}
                                  </IconButton>
                                  {draw.name}
                                </Stack>
                              </TableCell>
                              <TableCell>${Number(draw.prize_amount ?? 0).toLocaleString()}</TableCell>
                              <TableCell>{new Date(draw.draw_date).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Chip label={draw.status} size='small' color={STATUS_COLORS[draw.status?.toLowerCase()] ?? 'default'} />
                              </TableCell>
                              <TableCell align='right' onClick={(e) => e.stopPropagation()}>
                                <Stack direction='row' spacing={1} justifyContent='flex-end'>
                                  {draw.status?.toUpperCase() === 'UPCOMING' && (
                                    <Button size='small' variant='contained' color='success' startIcon={<LockOpenIcon />} onClick={() => setConfirmOpen(draw.id)}>Open</Button>
                                  )}
                                  {draw.status?.toUpperCase() === 'OPEN' && (
                                    <Button size='small' variant='outlined' color='warning' startIcon={<LockIcon />} onClick={() => setConfirmClose(draw.id)}>Close</Button>
                                  )}
                                  {draw.status?.toUpperCase() === 'CLOSED' && !draw.winner_user_id && (
                                    <Button size='small' variant='contained' color='secondary' startIcon={<EmojiEventsIcon />} onClick={() => setConfirmPick(draw.id)}>Pick Winner</Button>
                                  )}
                                  {draw.status?.toUpperCase() === 'CLOSED' && draw.winner_user_id && (
                                    <Chip label='Winner Selected' size='small' color='success' />
                                  )}
                                </Stack>
                              </TableCell>
                            </TableRow>
                            {expandedDrawId === draw.id && (
                              <TableRow>
                                <TableCell colSpan={5} sx={{ p: 0 }}>
                                  <DrawBusinessesPanel drawId={draw.id} />
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Stack>
            </TabPanel>

            {/* TAB 4: REVENUE */}
            <TabPanel value={tabValue} index={4}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                    <CardContent>
                      <Stack spacing={1}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            backgroundColor: '#f3e5f5',
                            color: '#7b1fa2',
                          }}
                        >
                          <CreditCardIcon />
                        </Box>
                        <Typography variant='body2' color='text.secondary'>
                          Active Subscriptions
                        </Typography>
                        <Typography variant='h5' fontWeight={700}>
                          {overview?.subscriptions?.active_subs ?? 0}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                    <CardContent>
                      <Stack spacing={1}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            backgroundColor: '#c8e6c9',
                            color: '#2e7d32',
                          }}
                        >
                          <TrendingUpIcon />
                        </Box>
                        <Typography variant='body2' color='text.secondary'>
                          Monthly Revenue
                        </Typography>
                        <Typography variant='h5' fontWeight={700}>
                          ILS{' '}
                          {Number(
                            overview?.subscriptions?.total_fees ?? 0
                          ).toLocaleString()}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                    <CardContent>
                      <Stack spacing={1}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            backgroundColor: '#fff3e0',
                            color: '#f57c00',
                          }}
                        >
                          <EmojiEventsIcon />
                        </Box>
                        <Typography variant='body2' color='text.secondary'>
                          Prize Pool
                        </Typography>
                        <Typography variant='h5' fontWeight={700}>
                          ILS{' '}
                          {Number(
                            overview?.currentDraw?.prize_pool ?? 0
                          ).toLocaleString()}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                    <CardContent>
                      <Stack spacing={2}>
                        <Typography variant='h6' fontWeight={700}>
                          Revenue Model
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          Winnbell operates on a subscription model where each business pays a monthly
                          subscription fee. These fees are aggregated and form the prize pool for the
                          active raffle draw. As more businesses subscribe, the prize pool grows,
                          increasing the value of winning a ticket.
                        </Typography>
                        <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
                          <strong>Current Status:</strong> {overview?.subscriptions?.active_subs ?? 0} active
                          business subscriptions contributing ILS{' '}
                          {Number(overview?.subscriptions?.total_fees ?? 0).toLocaleString()} per month to
                          the draw pool.
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
          </Box>
        </Paper>
      </Container>

      {/* Modals */}
      <CreateBusinessModal
        open={isBizModalOpen}
        onClose={() => setIsBizModalOpen(false)}
      />
      <CreateDrawModal
        open={isDrawModalOpen}
        onClose={() => setIsDrawModalOpen(false)}
      />
      <GenerateTicketsModal
        open={!!selectedBusinessId}
        onClose={() => setSelectedBusinessId(null)}
        businessId={selectedBusinessId}
      />

      {/* Draw action confirmations */}
      <Dialog open={!!confirmOpen} onClose={() => setConfirmOpen(null)}>
        <DialogTitle>Open Draw?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Opening this draw will allow businesses to generate tickets and users to activate
            them. Make sure you're ready before proceeding.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(null)}>Cancel</Button>
          <Button
            variant='contained'
            color='success'
            onClick={handleOpenDraw}
            disabled={openDraw.isPending}
          >
            {openDraw.isPending ? 'Opening...' : 'Open Draw'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!confirmClose} onClose={() => setConfirmClose(null)}>
        <DialogTitle>Close Draw?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Closing this draw will prevent any new tickets from being counted. You can pick a
            winner after closing.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClose(null)}>Cancel</Button>
          <Button
            variant='contained'
            color='warning'
            onClick={handleCloseDraw}
            disabled={closeDraw.isPending}
          >
            {closeDraw.isPending ? 'Closing...' : 'Close Draw'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!confirmPick} onClose={() => setConfirmPick(null)}>
        <DialogTitle>Pick a Winner?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will randomly select a winner from all activated tickets in this draw. This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmPick(null)}>Cancel</Button>
          <Button
            variant='contained'
            color='secondary'
            onClick={handlePickWinner}
            disabled={pickWinner.isPending}
          >
            {pickWinner.isPending ? 'Picking...' : 'Pick Winner'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Winner result dialog */}
      <Dialog
        open={!!winnerResult}
        onClose={() => setWinnerResult(null)}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center' }}>
          <EmojiEventsIcon sx={{ fontSize: 48, color: 'warning.main', display: 'block', mx: 'auto', mb: 1 }} />
          Winner Selected
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1} textAlign='center'>
            <Typography variant='h6' fontWeight={800}>
              {winnerResult?.winnerName}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Winning ticket: <strong>{winnerResult?.ticketCode}</strong>
            </Typography>
            {winnerResult?.businessName && (
              <Typography variant='body2' color='text.secondary'>
                Business:{' '}
                <strong>
                  {winnerResult.businessName}
                  {winnerResult.locationName ? ` · ${winnerResult.locationName}` : ''}
                </strong>
              </Typography>
            )}
            <Typography variant='body2' color='text.secondary'>
              Prize pool:{' '}
              <strong>${Number(winnerResult?.prizePool ?? 0).toLocaleString()}</strong>
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            fullWidth
            variant='contained'
            onClick={() => setWinnerResult(null)}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars */}
      <Snackbar
        open={!!snackError}
        autoHideDuration={4000}
        onClose={() => setSnackError('')}
      >
        <Alert severity='error' onClose={() => setSnackError('')}>
          {snackError}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!snackSuccess}
        autoHideDuration={4000}
        onClose={() => setSnackSuccess('')}
      >
        <Alert severity='success' onClose={() => setSnackSuccess('')}>
          {snackSuccess}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BusinessDashboard;
