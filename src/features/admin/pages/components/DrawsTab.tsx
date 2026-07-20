import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  Tooltip,
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
  Skeleton,
  Divider,
  Select,
  MenuItem,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Collapse,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useOpenDraw,
  useCloseDraw,
  usePickWinner,
  useConfirmWinner,
  useReopenDraw,
  useDrawBusinesses,
  useDeleteDraw,
  useDuplicateDraw,
  useAddBusinessToDraw,
  useRemoveBusinessFromDraw,
  useAdminBusinesses,
  useDrawCandidate,
  useDrawRejectedWinners,
} from '../../hooks/useAdmin';
import { BG_PAGE } from '../../../../shared/colors';
import { apiErrorMessage } from '../../../../shared/utils/apiError';
import { BUSINESS_SECTORS } from '../../data';
import EditDrawModal from './EditDrawModal';

const STATUS_COLORS: Record<string, 'default' | 'warning' | 'primary' | 'success' | 'error'> = {
  upcoming: 'default',
  open: 'primary',
  closed: 'success',
};

const DrawBusinessesPanel: React.FC<{ drawId: number; drawStatus: string }> = ({ drawId, drawStatus }) => {
  const [filterSearch, setFilterSearch] = useState('');
  const [filterSearchDebounced, setFilterSearchDebounced] = useState('');
  const [filterSector, setFilterSector] = useState('');
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDrawBusinesses(drawId, filterSearchDebounced, filterSector);
  const addBiz = useAddBusinessToDraw();
  const removeBiz = useRemoveBusinessFromDraw();
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedBiz, setSelectedBiz] = useState<{ id: number; name: string } | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<{ id: number; name: string } | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Filter state is reset via key={draw.id} on the panel render site (2.16).

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filterDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFilterSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterSearch(e.target.value);
    if (filterDebounceRef.current) clearTimeout(filterDebounceRef.current);
    filterDebounceRef.current = setTimeout(() => {
      setFilterSearchDebounced(e.target.value);
    }, 300);
  };

  const handleSectorChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setFilterSector(e.target.value as string);
  };

  const handleInputChange = useCallback((_: React.SyntheticEvent, value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 300);
  }, []);

  const { data: bizPage } = useAdminBusinesses({ limit: 20, search: debouncedSearch });

  const allRows = data?.pages.flatMap((p) => p.rows) ?? [];
  const total = data?.pages[0]?.total ?? 0;
  const enrolledIds = new Set(allRows.map((b) => b.id));
  const bizRows = bizPage?.pages.flatMap((p) => p.rows) ?? [];
  const availableBiz = bizRows.filter((b: any) => !enrolledIds.has(b.id)).slice(0, 20);
  const canEdit = drawStatus?.toUpperCase() !== 'CLOSED';

  const handleAdd = async () => {
    if (!selectedBiz) return;
    await addBiz.mutateAsync({ drawId, businessId: selectedBiz.id });
    setSelectedBiz(null);
    setSearch('');
    setDebouncedSearch('');
    setAdding(false);
  };

  const handleRemoveConfirmed = async () => {
    if (!confirmRemove) return;
    await removeBiz.mutateAsync({ drawId, businessId: confirmRemove.id });
    setConfirmRemove(null);
  };

  if (isLoading) return <Box sx={{ p: 2 }}><Skeleton variant='rectangular' height={60} /></Box>;

  return (
    <Box sx={{ px: 3, pb: 2, bgcolor: BG_PAGE }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant='caption' fontWeight={700} color='text.secondary' sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Participating Businesses ({total})
        </Typography>
        {canEdit && (
          <Button size='small' startIcon={<AddIcon />} onClick={() => setAdding(!adding)} sx={{ fontSize: 12 }}>
            Add Business
          </Button>
        )}
      </Box>

      {/* Filter row */}
      <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
        <TextField
          size='small'
          placeholder='Search by name...'
          value={filterSearch}
          onChange={handleFilterSearchChange}
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: <InputAdornment position='start'><SearchIcon sx={{ fontSize: 16 }} /></InputAdornment>,
          }}
        />
        <Select
          size='small'
          value={filterSector}
          onChange={handleSectorChange as any}
          displayEmpty
          sx={{ minWidth: 130 }}
        >
          <MenuItem value=''>All Sectors</MenuItem>
          {Object.entries(BUSINESS_SECTORS).filter(([k]) => k !== 'Free').map(([key, val]) => (
            <MenuItem key={key} value={key}>{val.label}</MenuItem>
          ))}
        </Select>
      </Box>

      {canEdit && adding && (
        <Box sx={{ display: 'flex', gap: 1, mb: 1.5, alignItems: 'center' }}>
          <Autocomplete
            sx={{ flex: 1 }}
            size='small'
            options={availableBiz}
            getOptionLabel={(o: any) => o.name}
            filterOptions={(x) => x}
            inputValue={search}
            value={selectedBiz}
            onInputChange={handleInputChange}
            onChange={(_: React.SyntheticEvent, val: any) => setSelectedBiz(val)}
            noOptionsText={debouncedSearch ? 'No businesses found' : 'Type to search...'}
            renderInput={(params) => <TextField {...params} label='Search business' />}
          />
          <Button size='small' variant='contained' onClick={handleAdd} disabled={!selectedBiz || addBiz.isPending}>
            {addBiz.isPending ? 'Adding...' : 'Add'}
          </Button>
          <Button size='small' onClick={() => { setAdding(false); setSelectedBiz(null); setSearch(''); setDebouncedSearch(''); }}>Cancel</Button>
        </Box>
      )}

      {!allRows.length ? (
        <Typography variant='body2' color='text.secondary'>
          {filterSearchDebounced || filterSector ? 'No businesses match your filters.' : 'No businesses enrolled.'}
        </Typography>
      ) : (
        <Stack spacing={0.5}>
          {allRows.map((b) => (
            <Box key={b.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.75, px: 1.5, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant='body2' fontWeight={600}>{b.name}</Typography>
              {canEdit && (
                <IconButton size='small' color='error' onClick={() => setConfirmRemove({ id: b.id, name: b.name })} disabled={removeBiz.isPending}>
                  <DeleteIcon fontSize='small' />
                </IconButton>
              )}
            </Box>
          ))}
        </Stack>
      )}

      <div ref={sentinelRef} />
      {isFetchingNextPage && (
        <Box sx={{ pt: 1 }}><Skeleton variant='rectangular' height={36} /></Box>
      )}

      <Dialog open={!!confirmRemove} onClose={() => setConfirmRemove(null)} maxWidth='xs' fullWidth>
        <DialogTitle>Remove Business?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove <strong>{confirmRemove?.name}</strong> from this campaign? They will no longer be able to generate entries.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRemove(null)}>Cancel</Button>
          <Button variant='contained' color='error' onClick={handleRemoveConfirmed} disabled={removeBiz.isPending}>
            {removeBiz.isPending ? 'Removing...' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

interface Props {
  draws: any[] | undefined;
  isMobile: boolean;
  onSnackError: (msg: string) => void;
  onSnackSuccess: (msg: string) => void;
  onCreateDraw: () => void;
}

const SectionHeader: React.FC<{ label: string; count: number }> = ({ label, count }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
    <Typography variant='overline' fontWeight={700} color='text.secondary' sx={{ letterSpacing: 1 }}>
      {label}
    </Typography>
    <Chip label={count} size='small' sx={{ height: 18, fontSize: 11 }} />
    <Box flex={1}><Divider /></Box>
  </Box>
);

const DrawsTab: React.FC<Props> = ({ draws, isMobile, onSnackError, onSnackSuccess, onCreateDraw }) => {
  const [editDraw, setEditDraw] = useState<any | null>(null);
  const [confirmOpen, setConfirmOpen] = useState<number | null>(null);
  const [confirmClose, setConfirmClose] = useState<number | null>(null);
  const [confirmPick, setConfirmPick] = useState<{ id: number; entryCount: number } | null>(null);
  const [confirmReopen, setConfirmReopen] = useState<number | null>(null);
  const [reviewDrawId, setReviewDrawId] = useState<number | null>(null);
  const [reviewDismissed, setReviewDismissed] = useState(false);
  // Derived: auto-detect the first pending-review draw (winner picked but not confirmed).
  // reviewDismissed prevents the dialog from re-opening after the admin closes it without
  // confirming (e.g. to consult the history panel first). reviewDrawId (set by explicit
  // Verify Winner / Campaign Info buttons) always overrides auto-detection.
  const pendingReviewDraw = !reviewDismissed
    ? draws?.find((d: any) => d.winner_user_id && !d.winner_confirmed && d.status?.toUpperCase() === 'CLOSED') ?? null
    : null;
  const effectiveReviewDrawId = reviewDrawId ?? pendingReviewDraw?.id ?? null;
  const [penaltyChecked, setPenaltyChecked] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectedExpanded, setRejectedExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [expandedDrawId, setExpandedDrawId] = useState<number | null>(null);

  const openDraw = useOpenDraw();
  const closeDraw = useCloseDraw();
  const pickWinner = usePickWinner();
  const confirmWinnerMutation = useConfirmWinner();
  const reopenDraw = useReopenDraw();
  const deleteDraw = useDeleteDraw();
  const duplicateDraw = useDuplicateDraw();

  const { data: candidate, isLoading: candidateLoading } = useDrawCandidate(effectiveReviewDrawId);
  const { data: rejectedWinners } = useDrawRejectedWinners(effectiveReviewDrawId);

  const handleOpenDraw = async () => {
    if (!confirmOpen) return;
    try {
      await openDraw.mutateAsync(confirmOpen);
      onSnackSuccess('Campaign opened successfully');
    } catch (e: unknown) {
      onSnackError(apiErrorMessage(e, 'Failed to open campaign'));
    }
    setConfirmOpen(null);
  };

  const handleCloseDraw = async () => {
    if (!confirmClose) return;
    try {
      await closeDraw.mutateAsync(confirmClose);
      onSnackSuccess('Campaign closed successfully');
    } catch (e: unknown) {
      onSnackError(apiErrorMessage(e, 'Failed to close campaign'));
    }
    setConfirmClose(null);
  };

  const handleReopenDraw = async () => {
    if (!confirmReopen) return;
    try {
      await reopenDraw.mutateAsync(confirmReopen);
      onSnackSuccess('Campaign reopened successfully');
    } catch (e: unknown) {
      onSnackError(apiErrorMessage(e, 'Failed to reopen campaign'));
    }
    setConfirmReopen(null);
  };

  const handlePickWinner = async () => {
    if (!confirmPick) return;
    const drawId = confirmPick.id;
    setConfirmPick(null);
    try {
      await pickWinner.mutateAsync({ drawId });
      setReviewDismissed(false);
      setReviewDrawId(drawId);
    } catch (e: unknown) {
      onSnackError(apiErrorMessage(e, 'Failed to pick winner'));
    }
  };

  const handlePickAnother = async () => {
    if (!effectiveReviewDrawId) return;
    const reason = rejectReason.trim();
    if (!reason) { onSnackError('Please enter a reason for disqualifying this winner.'); return; }
    try {
      await pickWinner.mutateAsync({ drawId: effectiveReviewDrawId, applyPenalty: penaltyChecked, reason });
      setPenaltyChecked(false);
      setRejectReason('');
    } catch (e: unknown) {
      setReviewDrawId(null);
      setReviewDismissed(true);
      setRejectReason('');
      onSnackError(apiErrorMessage(e, 'Failed to pick another winner'));
    }
  };

  const handleVerifyWinner = async () => {
    if (!effectiveReviewDrawId) return;
    try {
      await confirmWinnerMutation.mutateAsync(effectiveReviewDrawId);
      setReviewDrawId(null);
      // Prevent the derived pendingReviewDraw from re-opening the dialog before the draws cache
      // reflects winner_confirmed = true (otherwise it briefly reopens with no candidate).
      setReviewDismissed(true);
      onSnackSuccess('Winner confirmed successfully');
    } catch (e: unknown) {
      onSnackError(apiErrorMessage(e, 'Failed to confirm winner'));
    }
  };

  const handleDeleteDraw = async () => {
    if (!confirmDelete) return;
    try {
      await deleteDraw.mutateAsync(confirmDelete);
      onSnackSuccess('Campaign deleted');
    } catch (e: unknown) {
      onSnackError(apiErrorMessage(e, 'Failed to delete campaign'));
    }
    setConfirmDelete(null);
  };

  const handleDuplicate = async (drawId: number) => {
    try {
      await duplicateDraw.mutateAsync(drawId);
      onSnackSuccess('Campaign duplicated as Upcoming');
    } catch (e: unknown) {
      onSnackError(apiErrorMessage(e, 'Failed to duplicate campaign'));
    }
  };

  const active = draws?.filter((d) => d.status?.toUpperCase() === 'OPEN') ?? [];
  // Upcoming reads soonest-first (the next campaign to open sits on top); the server
  // returns everything draw_date DESC, which is right for history but backwards here.
  const upcoming = (draws?.filter((d) => d.status?.toUpperCase() === 'UPCOMING') ?? [])
    .slice()
    .sort((a, b) => new Date(a.draw_date).getTime() - new Date(b.draw_date).getTime());
  const history = draws?.filter((d) => d.status?.toUpperCase() === 'CLOSED') ?? [];
  // A campaign can only be closed when there is an Upcoming campaign to take over: closing
  // atomically opens it, so the platform is never left without an open campaign. With none
  // upcoming, the Close action is disabled (the server also rejects it as a backstop).
  const hasUpcoming = upcoming.length > 0;

  const renderActions = (draw: any, inline = false) => (
    <Stack direction='row' gap={1} sx={{ flexWrap: 'wrap' }} justifyContent={inline ? 'flex-end' : undefined}>
      {draw.status?.toUpperCase() === 'UPCOMING' && (
        <Button size='small' variant='outlined' startIcon={<EditIcon />} onClick={(e) => { e.stopPropagation(); setEditDraw(draw); }} fullWidth={!inline}>Edit</Button>
      )}
      {draw.status?.toUpperCase() === 'UPCOMING' && (
        <Button size='small' variant='outlined' color='error' startIcon={<DeleteIcon />} onClick={(e) => { e.stopPropagation(); setConfirmDelete(draw.id); }} fullWidth={!inline}>Delete</Button>
      )}
      {draw.status?.toUpperCase() === 'UPCOMING' && (
        <Button size='small' variant='contained' color='success' startIcon={<LockOpenIcon />} onClick={(e) => { e.stopPropagation(); setConfirmOpen(draw.id); }} fullWidth={!inline}>Open</Button>
      )}
      {draw.status?.toUpperCase() === 'OPEN' && (
        hasUpcoming ? (
          <Button size='small' variant='outlined' color='warning' startIcon={<LockIcon />} onClick={(e) => { e.stopPropagation(); setConfirmClose(draw.id); }} fullWidth={!inline}>Close</Button>
        ) : (
          <Tooltip title='Create an upcoming campaign first. Closing opens the next campaign automatically, so there is always one open.'>
            <Box component='span' sx={{ width: inline ? 'auto' : '100%', display: inline ? 'inline-flex' : 'block' }}>
              <Button size='small' variant='outlined' color='warning' startIcon={<LockIcon />} disabled fullWidth={!inline}>Close</Button>
            </Box>
          </Tooltip>
        )
      )}
      {draw.status?.toUpperCase() === 'CLOSED' && !draw.winner_confirmed && !draw.winner_user_id && (
        <Button size='small' variant='contained' color='secondary' startIcon={<EmojiEventsIcon />} onClick={(e) => { e.stopPropagation(); setConfirmPick({ id: draw.id, entryCount: draw.entry_count ?? 0 }); }} fullWidth={!inline}>Pick Winner</Button>
      )}
      {draw.status?.toUpperCase() === 'CLOSED' && !draw.winner_confirmed && draw.winner_user_id && (
        <Button size='small' variant='contained' color='success' startIcon={<EmojiEventsIcon />} onClick={(e) => { e.stopPropagation(); setReviewDismissed(false); setReviewDrawId(draw.id); }} fullWidth={!inline}>Verify Winner</Button>
      )}
      {draw.status?.toUpperCase() === 'CLOSED' && !draw.winner_confirmed && (
        <Button size='small' variant='outlined' color='info' startIcon={<LockOpenIcon />} onClick={(e) => { e.stopPropagation(); setConfirmReopen(draw.id); }} fullWidth={!inline}>Reopen</Button>
      )}
      {draw.status?.toUpperCase() === 'CLOSED' && draw.winner_confirmed && (
        <>
          <Chip label='Winner Verified' size='small' color='success' />
          <Button size='small' variant='outlined' color='secondary' startIcon={<EmojiEventsIcon />} onClick={(e) => { e.stopPropagation(); setReviewDismissed(false); setReviewDrawId(draw.id); }} fullWidth={!inline}>Campaign Info</Button>
        </>
      )}
      <Button size='small' variant='outlined' startIcon={<ContentCopyIcon />} onClick={(e) => { e.stopPropagation(); handleDuplicate(draw.id); }} fullWidth={!inline} disabled={duplicateDraw.isPending}>
        Duplicate
      </Button>
    </Stack>
  );

  const renderTable = (rows: any[]) => (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 3 }}>
      <Table size='small'>
        <TableHead>
          <TableRow sx={{ backgroundColor: BG_PAGE }}>
            <TableCell>Name</TableCell>
            <TableCell>Prize Pool</TableCell>
            <TableCell>Period</TableCell>
            <TableCell align='center'>Entries</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align='right'>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((draw) => (
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
                <TableCell>
                  {draw.start_date ? `${new Date(draw.start_date).toLocaleDateString('en-US', { timeZone: 'America/New_York' })} - ` : ''}
                  {new Date(draw.draw_date).toLocaleDateString('en-US', { timeZone: 'America/New_York' })}
                </TableCell>
                <TableCell align='center'>
                  <Stack direction='row' alignItems='center' justifyContent='center' spacing={0.5}>
                    <ConfirmationNumberOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant='body2' fontWeight={600}>{(draw.entry_count ?? 0).toLocaleString()}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip label={draw.status} size='small' color={STATUS_COLORS[draw.status?.toLowerCase()] ?? 'default'} />
                </TableCell>
                <TableCell align='right' onClick={(e) => e.stopPropagation()}>
                  {renderActions(draw, true)}
                </TableCell>
              </TableRow>
              {expandedDrawId === draw.id && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ p: 0 }}>
                    <DrawBusinessesPanel key={draw.id} drawId={draw.id} drawStatus={draw.status} />
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderCards = (rows: any[]) => (
    <Stack spacing={2} sx={{ mb: 3 }}>
      {rows.map((draw) => (
        <Card key={draw.id} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant='subtitle2' fontWeight={700}>{draw.name}</Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Prize: ${Number(draw.prize_amount ?? 0).toLocaleString()} · {(draw.entry_count ?? 0).toLocaleString()} entries
                  </Typography>
                </Box>
                <IconButton size='small' onClick={() => setExpandedDrawId(expandedDrawId === draw.id ? null : draw.id)}>
                  {expandedDrawId === draw.id ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={draw.status} size='small' color={STATUS_COLORS[draw.status?.toLowerCase()] ?? 'default'} />
                <Typography variant='caption' sx={{ alignSelf: 'center', color: 'text.secondary' }}>
                  {draw.start_date ? `${new Date(draw.start_date).toLocaleDateString('en-US', { timeZone: 'America/New_York' })} - ` : ''}
                  {new Date(draw.draw_date).toLocaleDateString('en-US', { timeZone: 'America/New_York' })}
                </Typography>
              </Box>
              {expandedDrawId === draw.id && <DrawBusinessesPanel key={draw.id} drawId={draw.id} drawStatus={draw.status} />}
              {renderActions(draw)}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );

  return (
    <>
      <Stack spacing={0}>
        <Box display='flex' justifyContent='flex-end' mb={3}>
          <Button variant='contained' startIcon={<AddIcon />} onClick={onCreateDraw}>New Campaign</Button>
        </Box>

        {active.length > 0 && (
          <>
            <SectionHeader label='Active' count={active.length} />
            {isMobile ? renderCards(active) : renderTable(active)}
          </>
        )}

        {upcoming.length > 0 && (
          <>
            <SectionHeader label='Upcoming' count={upcoming.length} />
            {isMobile ? renderCards(upcoming) : renderTable(upcoming)}
          </>
        )}

        {history.length > 0 && (
          <>
            <SectionHeader label='History' count={history.length} />
            {isMobile ? renderCards(history) : renderTable(history)}
          </>
        )}

        {!draws?.length && (
          <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
            <Typography>No campaigns yet. Create one to get started.</Typography>
          </Box>
        )}
      </Stack>

      {/* Open confirmation */}
      <Dialog open={!!confirmOpen} onClose={() => setConfirmOpen(null)}>
        <DialogTitle>Open Campaign?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Opening this campaign will allow businesses to generate entries and users to activate them. Make sure you're ready before proceeding.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(null)}>Cancel</Button>
          <Button variant='contained' color='success' onClick={handleOpenDraw} disabled={openDraw.isPending}>
            {openDraw.isPending ? 'Opening...' : 'Open Campaign'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Close confirmation — deliberately heavy/red: closing is a major, hard-to-reverse action */}
      <Dialog
        open={!!confirmClose}
        onClose={() => setConfirmClose(null)}
        maxWidth='xs'
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, border: '2px solid', borderColor: 'error.main', overflow: 'hidden' } }}
      >
        <Box sx={{ bgcolor: 'error.main', color: 'white', px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <WarningAmberRoundedIcon sx={{ fontSize: 32 }} />
          <Typography variant='h6' fontWeight={800} sx={{ letterSpacing: '-0.2px' }}>Close this campaign?</Typography>
        </Box>
        <DialogContent sx={{ pt: 3 }}>
          <DialogContentText sx={{ color: 'text.primary', fontWeight: 600, mb: 1.5 }}>
            This will immediately end the current campaign and open the next upcoming one. It affects every business and entry in the draw, and is not easily reversed.
          </DialogContentText>
          <DialogContentText sx={{ color: 'error.main', fontWeight: 800, fontSize: '1.05rem' }}>
            Only continue if you are 100% sure.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant='outlined' onClick={() => setConfirmClose(null)} sx={{ fontWeight: 700, textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant='contained'
            color='error'
            startIcon={!closeDraw.isPending && <WarningAmberRoundedIcon />}
            onClick={handleCloseDraw}
            disabled={closeDraw.isPending}
            sx={{ fontWeight: 800, textTransform: 'none' }}
          >
            {closeDraw.isPending ? 'Closing...' : 'Yes, close the campaign'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pick winner pre-flight */}
      <Dialog open={!!confirmPick} onClose={() => setConfirmPick(null)} maxWidth='xs' fullWidth>
        <DialogTitle>Pick a Winner?</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <DialogContentText>
              This will randomly select one winner from all activated entries. This action cannot be undone.
            </DialogContentText>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
              <ConfirmationNumberOutlinedIcon color='primary' />
              <Box>
                <Typography variant='h6' fontWeight={800} lineHeight={1}>
                  {(confirmPick?.entryCount ?? 0).toLocaleString()}
                </Typography>
                <Typography variant='caption' color='text.secondary'>eligible entries in pool</Typography>
              </Box>
            </Box>
            {(confirmPick?.entryCount ?? 0) === 0 && (
              <DialogContentText color='error'>
                There are no eligible entries. You cannot pick a winner yet.
              </DialogContentText>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmPick(null)}>Cancel</Button>
          <Button
            variant='contained'
            color='secondary'
            onClick={handlePickWinner}
            disabled={pickWinner.isPending || (confirmPick?.entryCount ?? 0) === 0}
          >
            {pickWinner.isPending ? 'Picking...' : 'Pick Winner'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reopen confirmation */}
      <Dialog open={!!confirmReopen} onClose={() => setConfirmReopen(null)}>
        <DialogTitle>Reopen Campaign?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Reopening sets this campaign back to Open and reverts the campaign that opened when it was closed back to Upcoming, so there is still exactly one open campaign. This is only possible if no winner has been picked here and the reverted campaign has no entries yet.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmReopen(null)}>Cancel</Button>
          <Button variant='contained' color='info' onClick={handleReopenDraw} disabled={reopenDraw.isPending}>
            {reopenDraw.isPending ? 'Reopening...' : 'Reopen Campaign'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Candidate review */}
      <Dialog
        open={!!effectiveReviewDrawId}
        onClose={() => { setReviewDrawId(null); setReviewDismissed(true); setPenaltyChecked(false); setRejectedExpanded(false); setRejectReason(''); }}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction='row' alignItems='center' spacing={1}>
            <EmojiEventsIcon sx={{ color: 'warning.main' }} />
            <Typography variant='h6' fontWeight={700}>{candidate?.winnerConfirmed ? 'Campaign Record' : 'Review Candidate Winner'}</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers sx={{ px: 3, py: 2 }}>
          <AnimatePresence mode='wait'>
            {candidateLoading ? (
              <motion.div
                key='skeleton'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Stack spacing={1.5}>
                  <Skeleton variant='text' width='60%' height={32} />
                  <Skeleton variant='text' width='40%' />
                  <Skeleton variant='rectangular' height={64} sx={{ borderRadius: 2 }} />
                  <Skeleton variant='text' width='50%' />
                  <Skeleton variant='text' width='35%' />
                </Stack>
              </motion.div>
            ) : candidate ? (
              <motion.div
                key='content'
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <Stack spacing={2}>
                  {/* Winner identity */}
                  <Box>
                    <Typography variant='h6' fontWeight={800}>{candidate.winnerName}</Typography>
                    <Typography variant='body2' color='text.secondary'>{candidate.winnerEmail}</Typography>
                  </Box>

                  {/* Entry source chip */}
                  <Stack direction='row' spacing={1} flexWrap='wrap'>
                    <Chip
                      label={candidate.entrySource ?? 'unknown'}
                      size='small'
                      color={
                        candidate.entrySource === 'receipt' ? 'primary'
                        : candidate.entrySource === 'free' ? 'default'
                        : candidate.entrySource === 'promo' ? 'secondary'
                        : 'info'
                      }
                    />
                    {candidate.imageValidationStatus && (
                      <Chip
                        label={candidate.imageValidationStatus}
                        size='small'
                        color={
                          candidate.imageValidationStatus === 'passed' ? 'success'
                          : candidate.imageValidationStatus === 'pending' ? 'warning'
                          : 'error'
                        }
                      />
                    )}
                    {/* Risk score badge */}
                    <Chip
                      label={`Risk: ${candidate.userRiskScore ?? 0}`}
                      size='small'
                      color={
                        (candidate.userRiskScore ?? 0) >= 20 ? 'error'
                        : (candidate.userRiskScore ?? 0) >= 10 ? 'warning'
                        : 'success'
                      }
                      variant='outlined'
                    />
                  </Stack>

                  {/* Receipt details */}
                  {candidate.entrySource === 'receipt' && (
                    <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
                      <Stack spacing={0.75}>
                        {candidate.receiptIdentifier && (
                          <Typography variant='body2'>
                            <strong>Receipt ID:</strong> {candidate.receiptIdentifier}
                          </Typography>
                        )}
                        {candidate.transactionAmount != null && (
                          <Typography variant='body2'>
                            <strong>Amount:</strong> {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(candidate.transactionAmount)}
                          </Typography>
                        )}
                        {candidate.transactionDate && (
                          <Typography variant='body2'>
                            <strong>Date:</strong> {new Date(candidate.transactionDate).toLocaleDateString()}
                          </Typography>
                        )}
                        {candidate.receiptImageUrl && (
                          <Box>
                            <Typography variant='caption' color='text.secondary' display='block' mb={0.5}>Receipt image</Typography>
                            <Box
                              component='a'
                              href={candidate.receiptImageUrl}
                              target='_blank'
                              rel='noopener noreferrer'
                              sx={{ display: 'inline-block', borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider', cursor: 'pointer' }}
                            >
                              <Box
                                component='img'
                                src={candidate.receiptImageUrl}
                                alt='Receipt'
                                sx={{ display: 'block', width: 80, height: 80, objectFit: 'cover' }}
                              />
                            </Box>
                          </Box>
                        )}
                      </Stack>
                    </Box>
                  )}

                  {/* Business and prize */}
                  <Stack spacing={0.5}>
                    {candidate.businessName && (
                      <Typography variant='body2' color='text.secondary'>
                        <strong>Business:</strong> {candidate.businessName}{candidate.locationName ? ` - ${candidate.locationName}` : ''}
                      </Typography>
                    )}
                    {candidate.prizePool != null && (
                      <Typography variant='body2' color='text.secondary'>
                        <strong>Prize pool:</strong> {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(candidate.prizePool)}
                      </Typography>
                    )}
                  </Stack>

                  {/* Previously rejected */}
                  {rejectedWinners && rejectedWinners.length > 0 && (
                    <Box>
                      <Button
                        size='small'
                        variant='text'
                        color='inherit'
                        startIcon={rejectedExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        onClick={() => setRejectedExpanded((v) => !v)}
                        sx={{ px: 0, color: 'text.secondary', fontWeight: 600, fontSize: 12 }}
                      >
                        Previously Rejected ({rejectedWinners.length})
                      </Button>
                      <Collapse in={rejectedExpanded}>
                        <Stack spacing={1} sx={{ mt: 1 }}>
                          {rejectedWinners.map((rw) => (
                            <Box
                              key={rw.id}
                              sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}
                            >
                              <Stack spacing={0.5}>
                                <Stack direction='row' justifyContent='space-between' alignItems='center'>
                                  <Typography variant='body2' fontWeight={600}>{rw.userName}</Typography>
                                  <Typography
                                    variant='caption'
                                    fontWeight={700}
                                    sx={{ color: rw.riskPenalty > 0 ? 'error.main' : 'text.disabled' }}
                                  >
                                    {rw.riskPenalty > 0 ? `+${rw.riskPenalty}` : 'No penalty'}
                                  </Typography>
                                </Stack>
                                <Typography variant='caption' color='text.secondary'>
                                  {rw.ticketCode}{rw.entrySource ? ` - ${rw.entrySource}` : ''}
                                </Typography>
                                {rw.receiptIdentifier && (
                                  <Typography variant='caption' color='text.secondary'>
                                    Receipt: {rw.receiptIdentifier}
                                    {rw.transactionAmount != null ? ` - ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(rw.transactionAmount)}` : ''}
                                    {rw.transactionDate ? ` - ${new Date(rw.transactionDate).toLocaleDateString()}` : ''}
                                  </Typography>
                                )}
                                {rw.reason && (
                                  <Typography variant='caption' sx={{ color: 'text.primary', fontStyle: 'italic', borderLeft: '2px solid', borderColor: 'divider', pl: 1, mt: 0.25 }}>
                                    Reason: {rw.reason}
                                  </Typography>
                                )}
                                <Typography variant='caption' color='text.disabled'>
                                  Rejected {new Date(rw.rejectedAt).toLocaleString()}
                                </Typography>
                              </Stack>
                            </Box>
                          ))}
                        </Stack>
                      </Collapse>
                    </Box>
                  )}
                </Stack>
              </motion.div>
            ) : (
              <motion.div
                key='empty'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Typography variant='body2' color='text.secondary'>
                  A candidate winner has been selected. Verify to confirm or reject to pick another.
                </Typography>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
        <DialogActions sx={{ flexDirection: 'column', gap: 1, px: 3, pb: 2.5, pt: 2, alignItems: 'stretch' }}>
          {!candidate?.winnerConfirmed && (<>
          <Button
            fullWidth
            variant='contained'
            color='success'
            onClick={handleVerifyWinner}
            disabled={confirmWinnerMutation.isPending || candidateLoading}
          >
            {confirmWinnerMutation.isPending ? 'Confirming...' : 'Confirm Winner'}
          </Button>
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
            <TextField
              fullWidth
              size='small'
              multiline
              minRows={2}
              label='Reason for disqualification (required)'
              placeholder='e.g. Contacted the location; they confirmed no receipt matching this submission exists.'
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              sx={{ mb: 1.5 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  size='small'
                  checked={penaltyChecked}
                  onChange={(e) => setPenaltyChecked(e.target.checked)}
                  color='error'
                />
              }
              label={
                <Typography variant='body2'>Apply fraud penalty (+12 risk score)</Typography>
              }
              sx={{ m: 0 }}
            />
            <Button
              fullWidth
              variant='outlined'
              color='error'
              onClick={handlePickAnother}
              disabled={pickWinner.isPending || confirmWinnerMutation.isPending || candidateLoading || !rejectReason.trim()}
              sx={{ mt: 1 }}
            >
              {pickWinner.isPending ? 'Picking...' : 'Reject and Pick Next'}
            </Button>
          </Box>
          </>)}
          <Button
            fullWidth
            onClick={() => { setReviewDrawId(null); setReviewDismissed(true); setPenaltyChecked(false); setRejectedExpanded(false); setRejectReason(''); }}
            disabled={confirmWinnerMutation.isPending}
          >
            {candidate?.winnerConfirmed ? 'Close' : 'Cancel'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Delete Campaign?</DialogTitle>
        <DialogContent>
          <DialogContentText>This will permanently delete the campaign. This cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button variant='contained' color='error' onClick={handleDeleteDraw} disabled={deleteDraw.isPending}>
            {deleteDraw.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <EditDrawModal
        open={!!editDraw}
        draw={editDraw}
        onClose={() => setEditDraw(null)}
        onSuccess={() => onSnackSuccess('Campaign updated')}
        onError={onSnackError}
      />
    </>
  );
};

export default DrawsTab;
