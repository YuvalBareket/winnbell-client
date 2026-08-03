import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
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
  CircularProgress,
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
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DownloadIcon from '@mui/icons-material/Download';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useOpenDraw,
  useCloseDraw,
  usePickWinner,
  useExtendDrawOrder,
  useConfirmWinner,
  useReopenDraw,
  useSetDrawPrizeRevealed,
  useDrawBusinesses,
  useDeleteDraw,
  useDuplicateDraw,
  useAddBusinessToDraw,
  useRemoveBusinessFromDraw,
  useSetBusinessParticipation,
  useAdminBusinesses,
  useDrawCandidate,
  useDrawRejectedWinners,
  useDrawWinnerOrder,
} from '../../hooks/useAdmin';
import { downloadDrawRulesPdf } from '../../api/adminApi';
import {
  BG_PAGE, PRIMARY_MAIN,
  STATUS_ACTIVATED_BG, STATUS_ACTIVATED_TEXT, STATUS_PENDING_BG, STATUS_PENDING_TEXT,
  TEXT_HEADING, TEXT_SECONDARY, TEXT_TERTIARY, ERROR_BG_TINT, ERROR_BORDER_TINT,
  ERROR_MAIN, BG_ROW_SUBTLE, BORDER_SUBTLE, ALPHA_BLACK_06,
  ACCENT_GOLD_LIGHT, ACCENT_GOLD_CREAM, ACCENT_GOLD_DARK, ACCENT_GOLD, GOLD_INK,
  GRADIENT_HERO, ALPHA_WHITE_15, ALPHA_WHITE_80, GOLD_TROPHY,
  BG_SURFACE, BORDER_LIGHT, GRADIENT_SUCCESS_GREEN, ERROR_BORDER_LIGHT, ERROR_HOVER_BG,
  METRIC_WARN, METRIC_WARN_TINT,
} from '../../../../shared/colors';
import { staggerContainer, popIn } from '../../../../shared/motion';
import { AdminCard, IconTile } from './adminUi';
import { apiErrorMessage } from '../../../../shared/utils/apiError';
import { BUSINESS_SECTORS } from '../../data';
import EditDrawModal from './EditDrawModal';

const getStatusChipProps = (status: string) => {
  const s = status?.toLowerCase() ?? '';
  if (s === 'open') return { bg: PRIMARY_MAIN, text: 'white', color: 'primary' as const };
  if (s === 'closed') return { bg: STATUS_ACTIVATED_BG, text: STATUS_ACTIVATED_TEXT, color: 'success' as const };
  return { bg: STATUS_PENDING_BG, text: STATUS_PENDING_TEXT, color: 'default' as const };
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
  const setPauseBiz = useSetBusinessParticipation();
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedBiz, setSelectedBiz] = useState<{ id: number; name: string } | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<{ id: number; name: string } | null>(null);
  const [confirmPause, setConfirmPause] = useState<{ id: number; name: string } | null>(null);
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

  // Non-participating search: the server excludes businesses already in this draw
  // (excludeDrawId), so the results are complete and need no client-side filtering.
  // Only fetch while the add box is open.
  const { data: bizPage, isFetching: isBizFetching } = useAdminBusinesses({
    limit: 20,
    search: debouncedSearch,
    excludeDrawId: drawId,
    enabled: adding,
  });

  const allRows = data?.pages.flatMap((p) => p.rows) ?? [];
  const total = data?.pages[0]?.total ?? 0;
  const availableBiz = bizPage?.pages.flatMap((p) => p.rows) ?? [];
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

  const handlePauseConfirmed = async () => {
    if (!confirmPause) return;
    await setPauseBiz.mutateAsync({ drawId, businessId: confirmPause.id, paused: true });
    setConfirmPause(null);
  };

  const handleReinstate = async (businessId: number) => {
    await setPauseBiz.mutateAsync({ drawId, businessId, paused: false });
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
            isOptionEqualToValue={(o: { id: number }, v: { id: number }) => o.id === v.id}
            inputValue={search}
            value={selectedBiz}
            onInputChange={handleInputChange}
            onChange={(_: React.SyntheticEvent, val: any) => setSelectedBiz(val)}
            loading={isBizFetching}
            noOptionsText={
              isBizFetching ? 'Searching...' : debouncedSearch ? 'No non-participating businesses found' : 'Type a business name to search'
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label='Search business'
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isBizFetching ? <CircularProgress color='inherit' size={16} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
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
            <Box key={b.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.75, px: 1.5, borderRadius: 2, bgcolor: b.is_paused ? METRIC_WARN_TINT : BG_ROW_SUBTLE, border: `1px solid ${BORDER_SUBTLE}`, opacity: b.is_paused ? 0.7 : 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                <Typography variant='body2' fontWeight={600} sx={{ color: TEXT_HEADING }}>{b.name}</Typography>
                {b.is_paused && (
                  <Chip label='Paused' size='small' sx={{ bgcolor: METRIC_WARN, color: 'white', fontWeight: 700, fontSize: 11 }} />
                )}
              </Box>
              {canEdit && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {drawStatus?.toUpperCase() === 'OPEN' && (
                    <>
                      {/* All buttons disable while any mutation runs (double-fire guard), but the
                          spinner shows only on the ROW being acted on (mutation variables). */}
                      {b.is_paused ? (
                        <Button size='small' variant='contained' sx={{ fontWeight: 600, textTransform: 'none', fontSize: 11 }} onClick={() => handleReinstate(b.id)} disabled={setPauseBiz.isPending}>
                          {setPauseBiz.isPending && setPauseBiz.variables?.businessId === b.id ? <CircularProgress size={14} sx={{ mr: 0.5 }} /> : null}
                          Reinstate
                        </Button>
                      ) : (
                        <Button size='small' variant='outlined' sx={{ fontWeight: 600, textTransform: 'none', fontSize: 11, borderColor: METRIC_WARN, color: METRIC_WARN, '&:hover': { bgcolor: METRIC_WARN_TINT } }} onClick={() => setConfirmPause({ id: b.id, name: b.name })} disabled={setPauseBiz.isPending}>
                          {setPauseBiz.isPending && setPauseBiz.variables?.businessId === b.id ? <CircularProgress size={14} sx={{ mr: 0.5 }} /> : null}
                          Pause
                        </Button>
                      )}
                    </>
                  )}
                  {drawStatus?.toUpperCase() !== 'OPEN' && (
                    <IconButton size='small' color='error' onClick={() => setConfirmRemove({ id: b.id, name: b.name })} disabled={removeBiz.isPending}>
                      <DeleteIcon fontSize='small' />
                    </IconButton>
                  )}
                </Box>
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

      <Dialog open={!!confirmPause} onClose={() => setConfirmPause(null)} maxWidth='xs' fullWidth>
        <DialogTitle>Pause participation?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This hides the business from the map and stops new entries. Entries already earned by customers stay valid and can still win. You can reinstate it any time.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmPause(null)}>Cancel</Button>
          <Button variant='contained' onClick={handlePauseConfirmed} disabled={setPauseBiz.isPending} sx={{ bgcolor: METRIC_WARN, '&:hover': { bgcolor: METRIC_WARN, opacity: 0.9 }, color: 'white' }}>
            {setPauseBiz.isPending ? 'Pausing...' : 'Pause Business'}
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

const SectionHeaderRow: React.FC<{ label: string; count: number }> = ({ label, count }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
    <Typography variant='overline' fontWeight={700} sx={{ color: TEXT_TERTIARY, letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.75rem' }}>
      {label}
    </Typography>
    <Chip label={count} size='small' sx={{ height: 18, fontSize: 11 }} />
    <Box flex={1}><Divider /></Box>
  </Box>
);

// Label / value row for the winner-review evidence cards.
const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <Stack direction='row' alignItems='baseline' justifyContent='space-between' spacing={2}>
    <Typography variant='caption' sx={{ color: TEXT_TERTIARY, fontWeight: 600, flexShrink: 0 }}>{label}</Typography>
    <Typography variant='body2' sx={{ color: TEXT_HEADING, fontWeight: 600, textAlign: 'right', minWidth: 0 }}>{value}</Typography>
  </Stack>
);

// Small uppercase caption that titles a card in the winner-review dialog.
const CardLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography variant='caption' sx={{ color: TEXT_TERTIARY, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
    {children}
  </Typography>
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
  // Second-step "are you sure?" gate before confirming or rejecting a winner.
  const [confirmDecision, setConfirmDecision] = useState<null | 'confirm' | 'reject'>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [expandedDrawId, setExpandedDrawId] = useState<number | null>(null);
  // Draw order card: tracks which row is expanded (position value), and defaults current to open
  const [expandedOrderPosition, setExpandedOrderPosition] = useState<number | null>(null);

  const openDraw = useOpenDraw();
  const closeDraw = useCloseDraw();
  const pickWinner = usePickWinner();
  const extendOrder = useExtendDrawOrder();
  const confirmWinnerMutation = useConfirmWinner();
  const reopenDraw = useReopenDraw();
  const deleteDraw = useDeleteDraw();
  const duplicateDraw = useDuplicateDraw();
  const [downloadingRulesId, setDownloadingRulesId] = useState<number | null>(null);
  const setPrizeRevealed = useSetDrawPrizeRevealed();

  const { data: candidate, isLoading: candidateLoading } = useDrawCandidate(effectiveReviewDrawId);
  const { data: rejectedWinners } = useDrawRejectedWinners(effectiveReviewDrawId);
  const { data: drawOrder } = useDrawWinnerOrder(effectiveReviewDrawId);
  // A drawn list exists but no candidate: every stored entry was rejected or became
  // ineligible. The decision card offers the explicit Draw More Entries action.
  const orderExhausted = !candidateLoading && !candidate && (drawOrder?.total ?? 0) > 0 && !drawOrder?.winnerConfirmed;

  // Auto-expand the active entry in the draw order (the candidate under review, or the
  // confirmed winner in the Campaign Record view). Keyed on the POSITION (not the entries
  // array ref) so a background refetch never re-opens a row the admin collapsed; it only
  // fires when validation actually advances to a new candidate.
  const currentOrderPosition = drawOrder?.entries.find((e) => e.status === 'current' || e.status === 'confirmed')?.position ?? null;
  useEffect(() => {
    if (currentOrderPosition !== null) setExpandedOrderPosition(currentOrderPosition);
  }, [effectiveReviewDrawId, currentOrderPosition]);

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
    // Keep the pre-flight dialog open (showing its "Picking..." button state) while the winner is
    // selected server-side, then hand off to the review dialog. Closing it before the await left a
    // blank gap with no loading feedback until the review dialog popped open.
    try {
      await pickWinner.mutateAsync({ drawId });
      setReviewDismissed(false);
      setReviewDrawId(drawId);
    } catch (e: unknown) {
      onSnackError(apiErrorMessage(e, 'Failed to pick winner'));
    } finally {
      setConfirmPick(null);
    }
  };

  const handlePickAnother = async () => {
    if (!effectiveReviewDrawId) return;
    const reason = rejectReason.trim();
    if (!reason) { onSnackError('Please enter a reason for disqualifying this winner.'); return; }
    try {
      const res = await pickWinner.mutateAsync({ drawId: effectiveReviewDrawId, applyPenalty: penaltyChecked, reason });
      setPenaltyChecked(false);
      setRejectReason('');
      // The rejection was recorded but the drawn list has no eligible entry left. Keep the
      // dialog open: the decision card switches to the Draw More Entries panel, and drawing
      // the next batch stays an explicit admin action.
      if (res.data?.exhausted) {
        onSnackSuccess('Rejection recorded. The drawn list is now exhausted.');
      }
    } catch (e: unknown) {
      setReviewDrawId(null);
      setReviewDismissed(true);
      setRejectReason('');
      setExpandedOrderPosition(null);
      onSnackError(apiErrorMessage(e, 'Failed to pick another winner'));
    }
  };

  const handleDrawMoreEntries = async () => {
    if (!effectiveReviewDrawId) return;
    try {
      await extendOrder.mutateAsync(effectiveReviewDrawId);
      onSnackSuccess('New entries drawn and added to the list.');
    } catch (e: unknown) {
      onSnackError(apiErrorMessage(e, 'Failed to draw more entries'));
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
      setExpandedOrderPosition(null);
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

  const handleDownloadRules = async (draw: { id: number; name?: string }) => {
    setDownloadingRulesId(draw.id);
    try {
      const response = await downloadDrawRulesPdf(draw.id);
      // Use the server's month-year filename (Content-Disposition) so the local file
      // matches the R2 archive name exactly.
      const disposition = String(response.headers?.['content-disposition'] ?? '');
      const serverName = disposition.match(/filename="([^"]+)"/)?.[1];
      const url = URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = serverName ?? `winnbell-official-rules-${String(draw.name ?? 'campaign').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      onSnackError(apiErrorMessage(e, 'Failed to download the rules PDF'));
    } finally {
      setDownloadingRulesId(null);
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
      {draw.status?.toUpperCase() === 'UPCOMING' && (
        // Prize teaser: the public hub hides an upcoming campaign's prize ($???) until revealed.
        <Button
          size='small'
          variant={draw.prize_revealed ? 'contained' : 'outlined'}
          color='secondary'
          startIcon={draw.prize_revealed ? <VisibilityIcon /> : <VisibilityOffIcon />}
          onClick={async (e) => {
            e.stopPropagation();
            try {
              await setPrizeRevealed.mutateAsync({ drawId: draw.id, revealed: !draw.prize_revealed });
              onSnackSuccess(!draw.prize_revealed ? 'Prize is now visible to users' : 'Prize hidden until you reveal it');
            } catch (err: unknown) {
              onSnackError(apiErrorMessage(err, 'Failed to update prize reveal'));
            }
          }}
          fullWidth={!inline}
        >
          {draw.prize_revealed ? 'Prize Shown' : 'Reveal Prize'}
        </Button>
      )}
      {draw.status?.toUpperCase() === 'OPEN' && (
        hasUpcoming ? (
          <Button size='small' startIcon={<LockIcon />} onClick={(e) => { e.stopPropagation(); setConfirmClose(draw.id); }} fullWidth={!inline} sx={{ color: ERROR_MAIN, borderColor: ERROR_BORDER_TINT, border: `1px solid ${ERROR_BORDER_TINT}`, backgroundColor: ERROR_BG_TINT, '&:hover': { backgroundColor: ERROR_BG_TINT, borderColor: ERROR_MAIN }, fontWeight: 700, textTransform: 'none' }}>Close</Button>
        ) : (
          <Tooltip title='Create an upcoming campaign first. Closing opens the next campaign automatically, so there is always one open.'>
            <Box component='span' sx={{ width: inline ? 'auto' : '100%', display: inline ? 'inline-flex' : 'block' }}>
              <Button size='small' startIcon={<LockIcon />} disabled fullWidth={!inline} sx={{ color: ERROR_MAIN, borderColor: ERROR_BORDER_TINT, border: `1px solid ${ERROR_BORDER_TINT}`, backgroundColor: ERROR_BG_TINT, fontWeight: 700, textTransform: 'none' }}>Close</Button>
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
      <Tooltip title='Download the Official Rules PDF for this campaign (same document the legal archive stores at close).'>
        <Button size='small' variant='outlined' startIcon={downloadingRulesId === draw.id ? <CircularProgress size={14} /> : <DownloadIcon />} onClick={(e) => { e.stopPropagation(); handleDownloadRules(draw); }} fullWidth={!inline} disabled={downloadingRulesId === draw.id}>
          Rules PDF
        </Button>
      </Tooltip>
    </Stack>
  );

  const renderTable = (rows: any[]) => (
    <AdminCard sx={{ mb: 3, overflow: 'visible' }}>
      <TableContainer sx={{ maxWidth: '100%' }}>
        <Table size='small'>
          <TableHead>
            <TableRow sx={{ backgroundColor: BG_ROW_SUBTLE }}>
              <TableCell sx={{ color: TEXT_TERTIARY, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Name</TableCell>
              <TableCell sx={{ color: TEXT_TERTIARY, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Prize</TableCell>
              <TableCell sx={{ color: TEXT_TERTIARY, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Period</TableCell>
              <TableCell align='center' sx={{ color: TEXT_TERTIARY, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Entries</TableCell>
              <TableCell sx={{ color: TEXT_TERTIARY, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Status</TableCell>
              <TableCell align='right' sx={{ color: TEXT_TERTIARY, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((draw) => (
              <React.Fragment key={draw.id}>
                <TableRow
                  hover
                  sx={{ cursor: 'pointer', '&:hover': { backgroundColor: BG_ROW_SUBTLE }, '& > *': { borderBottom: expandedDrawId === draw.id ? 'none' : `1px solid ${BORDER_SUBTLE}` } }}
                  onClick={() => setExpandedDrawId(expandedDrawId === draw.id ? null : draw.id)}
                >
                  <TableCell sx={{ fontWeight: 600, color: TEXT_HEADING }}>
                    <Stack direction='row' alignItems='center' spacing={0.5}>
                      <IconButton size='small' sx={{ p: 0.25 }}>
                        {expandedDrawId === draw.id ? <KeyboardArrowUpIcon fontSize='small' /> : <KeyboardArrowDownIcon fontSize='small' />}
                      </IconButton>
                      {draw.name}
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: TEXT_HEADING }}>${Number(draw.prize_amount ?? 0).toLocaleString()}</TableCell>
                  <TableCell sx={{ color: TEXT_SECONDARY }}>
                    {draw.start_date ? `${new Date(draw.start_date).toLocaleDateString('en-US', { timeZone: 'America/New_York' })} - ` : ''}
                    {new Date(draw.draw_date).toLocaleDateString('en-US', { timeZone: 'America/New_York' })}
                  </TableCell>
                  <TableCell align='center'>
                    <Stack direction='row' alignItems='center' justifyContent='center' spacing={0.5}>
                      <ConfirmationNumberOutlinedIcon sx={{ fontSize: 14, color: TEXT_SECONDARY }} />
                      <Typography variant='body2' fontWeight={600} sx={{ color: TEXT_HEADING }}>{(draw.entry_count ?? 0).toLocaleString()}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const props = getStatusChipProps(draw.status);
                      return (
                        <Chip
                          label={draw.status}
                          size='small'
                          sx={{
                            backgroundColor: props.bg,
                            color: props.text,
                            fontWeight: 700,
                            borderRadius: '8px',
                          }}
                        />
                      );
                    })()}
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
    </AdminCard>
  );

  const renderCards = (rows: any[]) => (
    <motion.div variants={staggerContainer} initial='hidden' animate='visible' style={{ marginBottom: 24 }}>
      <Stack spacing={2}>
        {rows.map((draw) => (
          <motion.div key={draw.id} variants={popIn}>
            <AdminCard hover>
              <CardContent>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant='subtitle2' fontWeight={700} sx={{ color: TEXT_HEADING }}>{draw.name}</Typography>
                      <Typography variant='caption' sx={{ color: TEXT_SECONDARY }}>
                        Prize: ${Number(draw.prize_amount ?? 0).toLocaleString()} · {(draw.entry_count ?? 0).toLocaleString()} entries
                      </Typography>
                    </Box>
                    <IconButton size='small' onClick={() => setExpandedDrawId(expandedDrawId === draw.id ? null : draw.id)}>
                      {expandedDrawId === draw.id ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {(() => {
                      const props = getStatusChipProps(draw.status);
                      return (
                        <Chip
                          label={draw.status}
                          size='small'
                          sx={{
                            backgroundColor: props.bg,
                            color: props.text,
                            fontWeight: 700,
                            borderRadius: '8px',
                          }}
                        />
                      );
                    })()}
                    <Typography variant='caption' sx={{ alignSelf: 'center', color: TEXT_SECONDARY }}>
                      {draw.start_date ? `${new Date(draw.start_date).toLocaleDateString('en-US', { timeZone: 'America/New_York' })} - ` : ''}
                      {new Date(draw.draw_date).toLocaleDateString('en-US', { timeZone: 'America/New_York' })}
                    </Typography>
                  </Box>
                  {expandedDrawId === draw.id && <DrawBusinessesPanel key={draw.id} drawId={draw.id} drawStatus={draw.status} />}
                  {renderActions(draw)}
                </Stack>
              </CardContent>
            </AdminCard>
          </motion.div>
        ))}
      </Stack>
    </motion.div>
  );

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 20, mass: 0.9 }}>
        <Stack spacing={0}>
          <Box display='flex' justifyContent='flex-end' mb={3}>
            <Button variant='contained' startIcon={<AddIcon />} onClick={onCreateDraw} sx={{ fontWeight: 700, textTransform: 'none' }}>New Campaign</Button>
          </Box>

          {active.length > 0 && (
            <>
              <SectionHeaderRow label='Active' count={active.length} />
              {isMobile ? renderCards(active) : renderTable(active)}
            </>
          )}

          {upcoming.length > 0 && (
            <>
              <SectionHeaderRow label='Upcoming' count={upcoming.length} />
              {isMobile ? renderCards(upcoming) : renderTable(upcoming)}
            </>
          )}

          {history.length > 0 && (
            <>
              <SectionHeaderRow label='History' count={history.length} />
              {isMobile ? renderCards(history) : renderTable(history)}
            </>
          )}

          {!draws?.length && (
            <Box sx={{ textAlign: 'center', py: 6, color: TEXT_SECONDARY }}>
              <Typography>No campaigns yet. Create one to get started.</Typography>
            </Box>
          )}
        </Stack>
      </motion.div>

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
      <Dialog open={!!confirmPick} onClose={() => { if (!pickWinner.isPending) setConfirmPick(null); }} maxWidth='xs' fullWidth>
        <DialogTitle>Pick a Winner?</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <DialogContentText>
              This locks in a random order of all eligible entries and selects the first as the candidate winner. If a candidate is rejected, the next entry in that order becomes the candidate. The order is drawn once and cannot be redrawn.
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
          <Button onClick={() => setConfirmPick(null)} disabled={pickWinner.isPending}>Cancel</Button>
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
        onClose={() => { setReviewDrawId(null); setReviewDismissed(true); setPenaltyChecked(false); setRejectedExpanded(false); setRejectReason(''); setExpandedOrderPosition(null); }}
        maxWidth='md'
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '20px', overflow: 'hidden' } } }}
      >
        {/* Gradient header band - matches the app hero language (glow orb, white text).
            flexShrink 0: the Dialog paper is a flex column, and when the (tall) order list
            pushes it to max height the header would otherwise be vertically squeezed and
            its text clipped - only the scrollable DialogContent may shrink. */}
        <Box sx={{ position: 'relative', overflow: 'hidden', flexShrink: 0, background: GRADIENT_HERO, color: 'white', px: 3, py: 2.5 }}>
          <Box sx={{ position: 'absolute', top: -90, right: -70, width: 240, height: 240, borderRadius: '50%', background: `radial-gradient(circle, ${ALPHA_WHITE_15} 0%, transparent 68%)`, pointerEvents: 'none' }} />
          <Stack direction='row' alignItems='center' spacing={1.75} sx={{ position: 'relative' }}>
            <IconTile icon={<EmojiEventsIcon />} tint={ALPHA_WHITE_15} color={GOLD_TROPHY} size={46} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant='h6' fontWeight={800} sx={{ letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                {candidate?.winnerConfirmed ? 'Campaign Record' : 'Review Candidate Winner'}
              </Typography>
              <Typography variant='body2' sx={{ color: ALPHA_WHITE_80 }}>
                {candidate?.winnerConfirmed ? 'This winner has been confirmed.'
                  : orderExhausted ? 'The drawn list is exhausted. Draw more entries to continue.'
                  : 'Verify the candidate, then confirm or move to the next entry in the draw order.'}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <DialogContent dividers sx={{ px: 3, py: 2.5, bgcolor: BG_ROW_SUBTLE }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems='flex-start'>

            {/* LEFT - draw order entry list (when available) or legacy candidate details */}
            <Box sx={{ flex: { md: 1.5 }, width: '100%', minWidth: 0 }}>
              {drawOrder && drawOrder.total > 0 ? (
                /* NEW: Entry list in draw order */
                <AdminCard sx={{ p: 2 }}>
                  <CardLabel>Draw Order</CardLabel>
                  <Typography variant='caption' sx={{ color: TEXT_TERTIARY, display: 'block', mt: 0.5, mb: 1.5 }}>
                    {drawOrder.total} entries in the drawn order
                  </Typography>
                  <Stack spacing={0.75}>
                    {drawOrder.entries.map((entry, index) => {
                      const isExpanded = expandedOrderPosition === entry.position;
                      const isCurrent = entry.status === 'current';
                      const isConfirmed = entry.status === 'confirmed';
                      const isRejected = entry.status === 'rejected';
                      const isSkipped = entry.status === 'skipped';
                      const isLocked = entry.status === 'locked';
                      // Current/confirmed rows expand to the full candidate details; rejected
                      // rows expand to their own record (who they were and why they fell).
                      // Skipped and locked rows stay closed.
                      const isClickable = isCurrent || isConfirmed || isRejected;

                      let statusBg = BG_ROW_SUBTLE;
                      let statusText = TEXT_SECONDARY;
                      let statusLabel = 'Locked';

                      if (isCurrent) {
                        statusBg = ACCENT_GOLD_CREAM;
                        statusText = ACCENT_GOLD_DARK;
                        statusLabel = 'Reviewing now';
                      } else if (isConfirmed) {
                        statusBg = STATUS_ACTIVATED_BG;
                        statusText = STATUS_ACTIVATED_TEXT;
                        statusLabel = 'Confirmed winner';
                      } else if (isRejected) {
                        statusBg = ERROR_BG_TINT;
                        statusText = ERROR_MAIN;
                        statusLabel = 'Rejected';
                      } else if (isSkipped) {
                        statusBg = BG_ROW_SUBTLE;
                        statusText = TEXT_SECONDARY;
                        statusLabel = 'No longer eligible';
                      }

                      return (
                        <motion.div
                          key={entry.position}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(index * 0.03, 0.3) }}
                        >
                          <Box sx={{ opacity: isLocked ? 0.55 : 1 }}>
                            <Box
                              onClick={() => isClickable && setExpandedOrderPosition(isExpanded ? null : entry.position)}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.25,
                                p: 1.25,
                                borderRadius: '12px',
                                border: `1px solid ${isCurrent ? ACCENT_GOLD : BORDER_SUBTLE}`,
                                bgcolor: statusBg,
                                cursor: isClickable ? 'pointer' : 'default',
                                transition: isClickable ? 'all 0.2s ease' : 'none',
                                '&:hover': isClickable ? { opacity: 0.9, borderColor: isCurrent ? ACCENT_GOLD_DARK : BORDER_SUBTLE } : {},
                              }}
                            >
                              {/* Circular position badge */}
                              <Box
                                sx={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  bgcolor: isCurrent ? ACCENT_GOLD : ALPHA_BLACK_06,
                                  color: isCurrent ? GOLD_INK : TEXT_SECONDARY,
                                  flexShrink: 0,
                                }}
                              >
                                {isLocked ? (
                                  <LockIcon sx={{ fontSize: 13, color: TEXT_TERTIARY }} />
                                ) : (
                                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, lineHeight: 1 }}>
                                    {entry.position}
                                  </Typography>
                                )}
                              </Box>

                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Stack direction='row' alignItems='center' justifyContent='space-between' spacing={1}>
                                  {/* Ticket code as primary text */}
                                  <Typography
                                    sx={{
                                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                                      fontWeight: 700,
                                      fontSize: '0.8rem',
                                      color: isLocked ? TEXT_TERTIARY : statusText,
                                      wordBreak: 'break-all',
                                      minWidth: 0,
                                    }}
                                  >
                                    {entry.ticketCode ?? (isLocked ? 'Hidden until reached' : 'Unknown')}
                                  </Typography>
                                  <Chip
                                    label={statusLabel}
                                    size='small'
                                    sx={{
                                      height: 18,
                                      fontSize: '0.65rem',
                                      fontWeight: 700,
                                      bgcolor: isCurrent ? ACCENT_GOLD : isConfirmed ? STATUS_ACTIVATED_BG : isRejected ? ERROR_BG_TINT : 'transparent',
                                      color: isCurrent ? ACCENT_GOLD_DARK : isConfirmed ? STATUS_ACTIVATED_TEXT : isRejected ? ERROR_MAIN : TEXT_SECONDARY,
                                      border: isCurrent || isConfirmed || isRejected ? 'none' : `1px solid ${BORDER_SUBTLE}`,
                                      flexShrink: 0,
                                    }}
                                  />
                                </Stack>
                              </Box>
                            </Box>

                            {/* Expansion - rejected rows show their own record; current/confirmed
                                rows show the full candidate detail blocks */}
                            <Collapse in={isExpanded && isClickable}>
                              <Box sx={{ mt: 1 }}>
                                {isRejected ? (
                                  <AdminCard sx={{ p: 2 }}>
                                    <CardLabel>Rejected Entry</CardLabel>
                                    <Stack spacing={1} sx={{ mt: 1 }}>
                                      {entry.userName && (
                                        <InfoRow label='Name' value={entry.userName} />
                                      )}
                                      {entry.userEmail && (
                                        <InfoRow label='Email' value={entry.userEmail} />
                                      )}
                                      {entry.entrySource && (
                                        <InfoRow label='Source' value={entry.entrySource === 'free' ? 'weekly' : entry.entrySource} />
                                      )}
                                      {entry.riskScore != null && (
                                        <InfoRow
                                          label='Risk score'
                                          value={
                                            <Chip
                                              label={entry.riskScore}
                                              size='small'
                                              variant='outlined'
                                              color={
                                                entry.riskScore >= 20 ? 'error'
                                                : entry.riskScore >= 10 ? 'warning'
                                                : 'success'
                                              }
                                            />
                                          }
                                        />
                                      )}
                                      {entry.rejectedReason && (
                                        <Box sx={{ pt: 1, borderTop: `1px solid ${BORDER_SUBTLE}` }}>
                                          <Typography variant='caption' sx={{ color: TEXT_TERTIARY, fontWeight: 600 }}>
                                            Rejection Reason
                                          </Typography>
                                          <Typography variant='caption' sx={{ color: TEXT_SECONDARY, display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                                            {entry.rejectedReason}
                                          </Typography>
                                        </Box>
                                      )}
                                      {entry.rejectedAt && (
                                        <Typography variant='caption' sx={{ color: TEXT_TERTIARY }}>
                                          Rejected {new Date(entry.rejectedAt).toLocaleString('en-US')}
                                        </Typography>
                                      )}
                                    </Stack>
                                  </AdminCard>
                                ) : candidateLoading ? (
                                  <Stack spacing={1.5}>
                                    <Skeleton variant='rectangular' height={104} sx={{ borderRadius: '16px' }} />
                                    <Skeleton variant='rectangular' height={120} sx={{ borderRadius: '15px' }} />
                                    <Skeleton variant='rectangular' height={90} sx={{ borderRadius: '15px' }} />
                                  </Stack>
                                ) : candidate ? (
                                  <Stack spacing={1.5}>
                                    {/* Gold hero code box */}
                                    {candidate.ticketCode && (
                                      <Box
                                        sx={{
                                          borderRadius: '16px',
                                          border: `1px solid ${ACCENT_GOLD}`,
                                          background: `linear-gradient(135deg, ${ACCENT_GOLD_LIGHT} 0%, ${ACCENT_GOLD_CREAM} 100%)`,
                                          px: 2.5,
                                          py: 2.25,
                                          textAlign: 'center',
                                        }}
                                      >
                                        <Typography
                                          variant='caption'
                                          sx={{ color: ACCENT_GOLD_DARK, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}
                                        >
                                          Winning Entry Code
                                        </Typography>
                                        <Typography
                                          sx={{
                                            mt: 0.5,
                                            color: GOLD_INK,
                                            fontWeight: 800,
                                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                                            fontSize: { xs: 32, sm: 40 },
                                            lineHeight: 1.05,
                                            letterSpacing: '0.06em',
                                            wordBreak: 'break-all',
                                          }}
                                        >
                                          {candidate.ticketCode}
                                        </Typography>
                                      </Box>
                                    )}

                                    {/* Winner identity card */}
                                    <AdminCard sx={{ p: 2 }}>
                                      <CardLabel>Winner</CardLabel>
                                      <Typography variant='h6' fontWeight={800} sx={{ color: TEXT_HEADING, mt: 0.5, lineHeight: 1.2 }}>{candidate.winnerName}</Typography>
                                      <Typography variant='body2' sx={{ color: TEXT_SECONDARY, wordBreak: 'break-word' }}>{candidate.winnerEmail}</Typography>
                                      <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap sx={{ mt: 1.5 }}>
                                        <Chip
                                          label={candidate.entrySource === 'free' ? 'weekly' : (candidate.entrySource ?? 'unknown')}
                                          size='small'
                                          color={
                                            candidate.entrySource === 'receipt' ? 'primary'
                                            : candidate.entrySource === 'free' ? 'default'
                                            : candidate.entrySource === 'promo' ? 'secondary'
                                            : 'info'
                                          }
                                        />
                                        {candidate.imageValidationStatus && candidate.imageValidationStatus !== 'not_required' && (
                                          <Chip
                                            label={
                                              candidate.imageValidationStatus === 'passed' ? 'Image verified'
                                              : candidate.imageValidationStatus === 'pending' ? 'Image pending'
                                              : 'Image failed'
                                            }
                                            size='small'
                                            color={
                                              candidate.imageValidationStatus === 'passed' ? 'success'
                                              : candidate.imageValidationStatus === 'pending' ? 'warning'
                                              : 'error'
                                            }
                                          />
                                        )}
                                        <Chip
                                          label={`Risk: ${candidate.riskScore ?? 0}`}
                                          size='small'
                                          color={
                                            (candidate.riskScore ?? 0) >= 20 ? 'error'
                                            : (candidate.riskScore ?? 0) >= 10 ? 'warning'
                                            : 'success'
                                          }
                                          variant='outlined'
                                        />
                                      </Stack>
                                    </AdminCard>

                                    {/* Campaign card */}
                                    {(candidate.businessName || candidate.prizePool != null) && (
                                      <AdminCard sx={{ p: 2 }}>
                                        <CardLabel>Campaign</CardLabel>
                                        <Stack spacing={1} sx={{ mt: 1 }}>
                                          {candidate.businessName && (
                                            <InfoRow label='Business' value={`${candidate.businessName}${candidate.locationName ? ` - ${candidate.locationName}` : ''}`} />
                                          )}
                                          {candidate.prizePool != null && (
                                            <InfoRow label='Prize pool' value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(candidate.prizePool)} />
                                          )}
                                        </Stack>
                                      </AdminCard>
                                    )}

                                    {/* Receipt card */}
                                    {candidate.entrySource === 'receipt' && (
                                      <AdminCard sx={{ p: 2 }}>
                                        <CardLabel>Receipt</CardLabel>
                                        <Stack spacing={1} sx={{ mt: 1 }}>
                                          {candidate.receiptIdentifier && (
                                            <InfoRow label='Receipt ID' value={candidate.receiptIdentifier} />
                                          )}
                                          {candidate.transactionAmount != null && (
                                            <InfoRow label='Amount' value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(candidate.transactionAmount)} />
                                          )}
                                          {candidate.transactionDate && (
                                            <InfoRow label='Date' value={new Date(candidate.transactionDate).toLocaleDateString('en-US')} />
                                          )}
                                          {candidate.receiptImageUrl && (
                                            <Box sx={{ pt: 0.5 }}>
                                              <Box
                                                component='a'
                                                href={candidate.receiptImageUrl}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                sx={{ display: 'inline-block', borderRadius: '12px', overflow: 'hidden', border: `1px solid ${BORDER_LIGHT}`, cursor: 'pointer' }}
                                              >
                                                <Box
                                                  component='img'
                                                  src={candidate.receiptImageUrl}
                                                  alt='Receipt'
                                                  sx={{ display: 'block', width: 96, height: 96, objectFit: 'cover' }}
                                                />
                                              </Box>
                                            </Box>
                                          )}
                                        </Stack>
                                      </AdminCard>
                                    )}
                                  </Stack>
                                ) : (
                                  <Typography variant='body2' sx={{ color: TEXT_SECONDARY }}>
                                    A candidate winner has been selected. Verify to confirm or reject to pick another.
                                  </Typography>
                                )}
                              </Box>
                            </Collapse>
                          </Box>
                        </motion.div>
                      );
                    })}
                  </Stack>

                  {/* Footer caption */}
                  {drawOrder.lockedRemaining > 0 && (
                    <Box sx={{ mt: 1.5, pt: 1, borderTop: `1px solid ${BORDER_SUBTLE}` }}>
                      <Typography variant='caption' sx={{ color: TEXT_TERTIARY, display: 'block' }}>
                        +{drawOrder.lockedRemaining} more entries
                      </Typography>
                    </Box>
                  )}
                </AdminCard>
              ) : (
                /* FALLBACK: legacy candidate details when no draw order */
                <AnimatePresence mode='wait'>
                  {candidateLoading ? (
                    <motion.div
                      key='skeleton'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Stack spacing={2}>
                        <Skeleton variant='rectangular' height={104} sx={{ borderRadius: '16px' }} />
                        <Skeleton variant='rectangular' height={120} sx={{ borderRadius: '15px' }} />
                        <Skeleton variant='rectangular' height={90} sx={{ borderRadius: '15px' }} />
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
                        {candidate.ticketCode && (
                          <Box
                            sx={{
                              borderRadius: '16px',
                              border: `1px solid ${ACCENT_GOLD}`,
                              background: `linear-gradient(135deg, ${ACCENT_GOLD_LIGHT} 0%, ${ACCENT_GOLD_CREAM} 100%)`,
                              px: 2.5,
                              py: 2.25,
                              textAlign: 'center',
                            }}
                          >
                            <Typography
                              variant='caption'
                              sx={{ color: ACCENT_GOLD_DARK, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}
                            >
                              Winning Entry Code
                            </Typography>
                            <Typography
                              sx={{
                                mt: 0.5,
                                color: GOLD_INK,
                                fontWeight: 800,
                                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                                fontSize: { xs: 32, sm: 40 },
                                lineHeight: 1.05,
                                letterSpacing: '0.06em',
                                wordBreak: 'break-all',
                              }}
                            >
                              {candidate.ticketCode}
                            </Typography>
                          </Box>
                        )}

                        <AdminCard sx={{ p: 2 }}>
                          <CardLabel>Winner</CardLabel>
                          <Typography variant='h6' fontWeight={800} sx={{ color: TEXT_HEADING, mt: 0.5, lineHeight: 1.2 }}>{candidate.winnerName}</Typography>
                          <Typography variant='body2' sx={{ color: TEXT_SECONDARY, wordBreak: 'break-word' }}>{candidate.winnerEmail}</Typography>
                          <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap sx={{ mt: 1.5 }}>
                            <Chip
                              label={candidate.entrySource === 'free' ? 'weekly' : (candidate.entrySource ?? 'unknown')}
                              size='small'
                              color={
                                candidate.entrySource === 'receipt' ? 'primary'
                                : candidate.entrySource === 'free' ? 'default'
                                : candidate.entrySource === 'promo' ? 'secondary'
                                : 'info'
                              }
                            />
                            {candidate.imageValidationStatus && candidate.imageValidationStatus !== 'not_required' && (
                              <Chip
                                label={
                                  candidate.imageValidationStatus === 'passed' ? 'Image verified'
                                  : candidate.imageValidationStatus === 'pending' ? 'Image pending'
                                  : 'Image failed'
                                }
                                size='small'
                                color={
                                  candidate.imageValidationStatus === 'passed' ? 'success'
                                  : candidate.imageValidationStatus === 'pending' ? 'warning'
                                  : 'error'
                                }
                              />
                            )}
                            <Chip
                              label={`Risk: ${candidate.riskScore ?? 0}`}
                              size='small'
                              color={
                                (candidate.riskScore ?? 0) >= 20 ? 'error'
                                : (candidate.riskScore ?? 0) >= 10 ? 'warning'
                                : 'success'
                              }
                              variant='outlined'
                            />
                            {candidate.queuePosition != null && candidate.queueTotal != null && (
                              <Chip
                                label={`Draw order: ${candidate.queuePosition} of ${candidate.queueTotal}`}
                                size='small'
                                variant='outlined'
                              />
                            )}
                          </Stack>
                        </AdminCard>

                        {(candidate.businessName || candidate.prizePool != null) && (
                          <AdminCard sx={{ p: 2 }}>
                            <CardLabel>Campaign</CardLabel>
                            <Stack spacing={1} sx={{ mt: 1 }}>
                              {candidate.businessName && (
                                <InfoRow label='Business' value={`${candidate.businessName}${candidate.locationName ? ` - ${candidate.locationName}` : ''}`} />
                              )}
                              {candidate.prizePool != null && (
                                <InfoRow label='Prize pool' value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(candidate.prizePool)} />
                              )}
                            </Stack>
                          </AdminCard>
                        )}

                        {candidate.entrySource === 'receipt' && (
                          <AdminCard sx={{ p: 2 }}>
                            <CardLabel>Receipt</CardLabel>
                            <Stack spacing={1} sx={{ mt: 1 }}>
                              {candidate.receiptIdentifier && (
                                <InfoRow label='Receipt ID' value={candidate.receiptIdentifier} />
                              )}
                              {candidate.transactionAmount != null && (
                                <InfoRow label='Amount' value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(candidate.transactionAmount)} />
                              )}
                              {candidate.transactionDate && (
                                <InfoRow label='Date' value={new Date(candidate.transactionDate).toLocaleDateString('en-US')} />
                              )}
                              {candidate.receiptImageUrl && (
                                <Box sx={{ pt: 0.5 }}>
                                  <Box
                                    component='a'
                                    href={candidate.receiptImageUrl}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    sx={{ display: 'inline-block', borderRadius: '12px', overflow: 'hidden', border: `1px solid ${BORDER_LIGHT}`, cursor: 'pointer' }}
                                  >
                                    <Box
                                      component='img'
                                      src={candidate.receiptImageUrl}
                                      alt='Receipt'
                                      sx={{ display: 'block', width: 96, height: 96, objectFit: 'cover' }}
                                    />
                                  </Box>
                                </Box>
                              )}
                            </Stack>
                          </AdminCard>
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
                      <Typography variant='body2' sx={{ color: TEXT_SECONDARY }}>
                        A candidate winner has been selected. Verify to confirm or reject to pick another.
                      </Typography>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </Box>

            {/* RIGHT - decision and previously rejected. Draw Order card removed (now in left column). */}
            <Box sx={{ flex: { md: 1 }, width: '100%', minWidth: 0 }}>
              <Stack spacing={2}>
              <AdminCard sx={{ p: 2 }}>
                <CardLabel>{candidate?.winnerConfirmed ? 'Status' : 'Decision'}</CardLabel>
                <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                  {candidate?.winnerConfirmed && (
                    <Box sx={{ borderRadius: '12px', bgcolor: STATUS_ACTIVATED_BG, p: 1.5 }}>
                      <Typography variant='body2' sx={{ fontWeight: 800, color: STATUS_ACTIVATED_TEXT }}>
                        Winner confirmed
                      </Typography>
                      {candidate.confirmedAt && (
                        <Typography variant='caption' sx={{ color: TEXT_SECONDARY, display: 'block', mt: 0.5 }}>
                          {new Date(candidate.confirmedAt).toLocaleString('en-US')}
                          {candidate.confirmedByName ? ` by ${candidate.confirmedByName}` : ''}
                        </Typography>
                      )}
                    </Box>
                  )}
                  {/* Exhausted list: every drawn entry was resolved and no candidate remains.
                      Drawing the next batch is an explicit admin action, never automatic. */}
                  {orderExhausted && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                      <Box sx={{ borderRadius: '12px', bgcolor: BG_ROW_SUBTLE, border: `1px solid ${BORDER_SUBTLE}`, p: 1.5, mb: 1.5 }}>
                        <Typography variant='body2' sx={{ fontWeight: 800, color: TEXT_HEADING }}>
                          Drawn list exhausted
                        </Typography>
                        <Typography variant='caption' sx={{ color: TEXT_SECONDARY, display: 'block', mt: 0.5 }}>
                          Every entry in the drawn list has been rejected or is no longer eligible. You can draw the next random batch. New entries are added to the bottom of the list; the existing list is never redrawn.
                        </Typography>
                      </Box>
                      <Button
                        fullWidth
                        variant='contained'
                        color='secondary'
                        onClick={handleDrawMoreEntries}
                        disabled={extendOrder.isPending}
                        sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, py: 1.1 }}
                      >
                        {extendOrder.isPending ? 'Drawing...' : 'Draw More Entries'}
                      </Button>
                    </motion.div>
                  )}
                  {!candidate?.winnerConfirmed && !orderExhausted && (<>
                    <Button
                      fullWidth
                      variant='contained'
                      onClick={() => setConfirmDecision('confirm')}
                      disabled={confirmWinnerMutation.isPending || candidateLoading}
                      sx={{
                        background: GRADIENT_SUCCESS_GREEN,
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 700,
                        py: 1.1,
                        '&.Mui-disabled': { opacity: 0.6, color: 'white' },
                      }}
                    >
                      {confirmWinnerMutation.isPending ? 'Confirming...' : 'Confirm Winner'}
                    </Button>

                    <Box sx={{ borderRadius: '12px', border: `1px solid ${ERROR_BORDER_LIGHT}`, bgcolor: ERROR_HOVER_BG, p: 1.5 }}>
                      <Typography variant='caption' sx={{ color: ERROR_MAIN, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        Reject this winner
                      </Typography>
                      <TextField
                        fullWidth
                        size='small'
                        multiline
                        minRows={2}
                        label='Reason for disqualification (required)'
                        placeholder='e.g. Contacted the location; they confirmed no receipt matching this submission exists.'
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        sx={{ mt: 1.25, mb: 1, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: BG_SURFACE } }}
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
                        label={<Typography variant='body2'>Apply fraud penalty (+12 risk score)</Typography>}
                        sx={{ m: 0 }}
                      />
                      <Button
                        fullWidth
                        variant='outlined'
                        color='error'
                        onClick={() => setConfirmDecision('reject')}
                        disabled={pickWinner.isPending || confirmWinnerMutation.isPending || candidateLoading || !rejectReason.trim()}
                        sx={{ mt: 1, borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
                      >
                        {pickWinner.isPending ? 'Picking...' : 'Reject and Pick Next'}
                      </Button>
                    </Box>
                  </>)}
                  <Button
                    fullWidth
                    onClick={() => { setReviewDrawId(null); setReviewDismissed(true); setPenaltyChecked(false); setRejectedExpanded(false); setRejectReason(''); setExpandedOrderPosition(null); }}
                    disabled={confirmWinnerMutation.isPending}
                    sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, color: TEXT_SECONDARY }}
                  >
                    {candidate?.winnerConfirmed ? 'Close' : 'Cancel'}
                  </Button>
                </Stack>
              </AdminCard>

              {/* Previously rejected */}
              {rejectedWinners && rejectedWinners.length > 0 && (
                <AdminCard sx={{ p: 2 }}>
                  <Button
                    size='small'
                    variant='text'
                    color='inherit'
                    startIcon={rejectedExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    onClick={() => setRejectedExpanded((v) => !v)}
                    sx={{ px: 0, color: TEXT_SECONDARY, fontWeight: 700, fontSize: 12 }}
                  >
                    Previously Rejected ({rejectedWinners.length})
                  </Button>
                  <Collapse in={rejectedExpanded}>
                    <Stack spacing={1} sx={{ mt: 1 }}>
                      {rejectedWinners.map((rw) => (
                        <Box
                          key={rw.id}
                          sx={{ p: 1.5, borderRadius: '12px', border: `1px solid ${BORDER_SUBTLE}`, bgcolor: BG_ROW_SUBTLE }}
                        >
                          <Stack spacing={0.5}>
                            <Stack direction='row' justifyContent='space-between' alignItems='center'>
                              <Typography variant='body2' fontWeight={700} sx={{ color: TEXT_HEADING }}>{rw.userName}</Typography>
                              <Typography
                                variant='caption'
                                fontWeight={700}
                                sx={{ color: rw.riskPenalty > 0 ? ERROR_MAIN : TEXT_TERTIARY }}
                              >
                                {rw.riskPenalty > 0 ? `+${rw.riskPenalty}` : 'No penalty'}
                              </Typography>
                            </Stack>
                            <Typography variant='caption' sx={{ color: TEXT_SECONDARY }}>
                              {rw.ticketCode}{rw.entrySource ? ` - ${rw.entrySource === 'free' ? 'weekly' : rw.entrySource}` : ''}
                            </Typography>
                            {rw.receiptIdentifier && (
                              <Typography variant='caption' sx={{ color: TEXT_SECONDARY }}>
                                Receipt: {rw.receiptIdentifier}
                                {rw.transactionAmount != null ? ` - ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(rw.transactionAmount)}` : ''}
                                {rw.transactionDate ? ` - ${new Date(rw.transactionDate).toLocaleDateString('en-US')}` : ''}
                              </Typography>
                            )}
                            {rw.reason && (
                              <Typography variant='caption' sx={{ color: TEXT_HEADING, fontStyle: 'italic', borderLeft: `2px solid ${BORDER_SUBTLE}`, pl: 1, mt: 0.25 }}>
                                Reason: {rw.reason}
                              </Typography>
                            )}
                            <Typography variant='caption' sx={{ color: TEXT_TERTIARY }}>
                              Rejected {new Date(rw.rejectedAt).toLocaleString('en-US')}{rw.rejectedByName ? ` by ${rw.rejectedByName}` : ''}
                            </Typography>
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  </Collapse>
                </AdminCard>
              )}
              </Stack>
            </Box>

          </Stack>
        </DialogContent>
      </Dialog>

      {/* Confirm / reject winner - final "are you sure?" gate */}
      <Dialog
        open={!!confirmDecision}
        onClose={() => setConfirmDecision(null)}
        maxWidth='xs'
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '20px' } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: TEXT_HEADING }}>
          {confirmDecision === 'reject' ? 'Reject this winner?' : 'Confirm this winner?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: TEXT_SECONDARY }}>
            {confirmDecision === 'reject' ? (
              <>
                This disqualifies{candidate?.winnerName ? ` ${candidate.winnerName}` : ' the current candidate'} and immediately draws another eligible entry.
                {penaltyChecked ? ' A fraud penalty of +12 risk will be applied.' : ''} This cannot be undone.
              </>
            ) : (
              <>
                This finalizes{candidate?.winnerName ? ` ${candidate.winnerName}` : ' the current candidate'} as the winner of this campaign. This cannot be undone.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setConfirmDecision(null)}
            disabled={confirmWinnerMutation.isPending || pickWinner.isPending}
            sx={{ textTransform: 'none', fontWeight: 700, color: TEXT_SECONDARY }}
          >
            Cancel
          </Button>
          {confirmDecision === 'reject' ? (
            <Button
              variant='contained'
              color='error'
              onClick={async () => { await handlePickAnother(); setConfirmDecision(null); }}
              disabled={pickWinner.isPending || confirmWinnerMutation.isPending}
              sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
            >
              {pickWinner.isPending ? 'Rejecting...' : 'Reject and Pick Next'}
            </Button>
          ) : (
            <Button
              variant='contained'
              onClick={async () => { await handleVerifyWinner(); setConfirmDecision(null); }}
              disabled={confirmWinnerMutation.isPending || pickWinner.isPending}
              sx={{ background: GRADIENT_SUCCESS_GREEN, borderRadius: '12px', textTransform: 'none', fontWeight: 700, '&.Mui-disabled': { opacity: 0.6, color: 'white' } }}
            >
              {confirmWinnerMutation.isPending ? 'Confirming...' : 'Confirm Winner'}
            </Button>
          )}
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
