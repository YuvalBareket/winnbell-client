import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
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
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import {
  useOpenDraw,
  useCloseDraw,
  usePickWinner,
  useReopenDraw,
  useDrawBusinesses,
  useDeleteDraw,
  useDuplicateDraw,
  useAddBusinessToDraw,
  useRemoveBusinessFromDraw,
  useAdminBusinesses,
} from '../../hooks/useAdmin';
import { BG_PAGE } from '../../../../shared/colors';
import EditDrawModal from './EditDrawModal';

const STATUS_COLORS: Record<string, 'default' | 'warning' | 'primary' | 'success' | 'error'> = {
  upcoming: 'default',
  open: 'primary',
  closed: 'success',
};

const DrawBusinessesPanel: React.FC<{ drawId: number; drawStatus: string }> = ({ drawId, drawStatus }) => {
  const { data, isLoading } = useDrawBusinesses(drawId);
  const addBiz = useAddBusinessToDraw();
  const removeBiz = useRemoveBusinessFromDraw();
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedBiz, setSelectedBiz] = useState<{ id: number; name: string } | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<{ id: number; name: string } | null>(null);

  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleInputChange = useCallback((_: React.SyntheticEvent, value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 300);
  }, []);

  const { data: bizPage } = useAdminBusinesses({ page: 1, limit: 20, search: debouncedSearch });

  const enrolledIds = new Set((data ?? []).map((b) => b.id));
  const availableBiz = (bizPage?.rows ?? []).filter((b: any) => !enrolledIds.has(b.id)).slice(0, 20);
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
          Participating Businesses ({data?.length ?? 0})
        </Typography>
        {canEdit && (
          <Button size='small' startIcon={<AddIcon />} onClick={() => setAdding(!adding)} sx={{ fontSize: 12 }}>
            Add Business
          </Button>
        )}
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

      {!data?.length ? (
        <Typography variant='body2' color='text.secondary'>No businesses enrolled.</Typography>
      ) : (
        <Stack spacing={0.5}>
          {data.map((b) => (
            <Box key={b.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.75, px: 1.5, borderRadius: 1.5, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
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
  const [winnerResult, setWinnerResult] = useState<{
    winnerName: string;
    ticketCode: string;
    businessName: string | null;
    locationName: string | null;
    prizePool: number;
  } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [expandedDrawId, setExpandedDrawId] = useState<number | null>(null);

  const openDraw = useOpenDraw();
  const closeDraw = useCloseDraw();
  const pickWinner = usePickWinner();
  const reopenDraw = useReopenDraw();
  const deleteDraw = useDeleteDraw();
  const duplicateDraw = useDuplicateDraw();

  const handleOpenDraw = async () => {
    if (!confirmOpen) return;
    try {
      await openDraw.mutateAsync(confirmOpen);
      onSnackSuccess('Campaign opened successfully');
    } catch (e: any) {
      onSnackError(e?.response?.data?.message ?? 'Failed to open campaign');
    }
    setConfirmOpen(null);
  };

  const handleCloseDraw = async () => {
    if (!confirmClose) return;
    try {
      await closeDraw.mutateAsync(confirmClose);
      onSnackSuccess('Campaign closed successfully');
    } catch (e: any) {
      onSnackError(e?.response?.data?.message ?? 'Failed to close campaign');
    }
    setConfirmClose(null);
  };

  const handleReopenDraw = async () => {
    if (!confirmReopen) return;
    try {
      await reopenDraw.mutateAsync(confirmReopen);
      onSnackSuccess('Campaign reopened successfully');
    } catch (e: any) {
      onSnackError(e?.response?.data?.message ?? 'Failed to reopen campaign');
    }
    setConfirmReopen(null);
  };

  const handlePickWinner = async () => {
    if (!confirmPick) return;
    try {
      const { data } = await pickWinner.mutateAsync(confirmPick.id);
      setWinnerResult({
        winnerName: data.winnerName,
        ticketCode: data.ticketCode,
        businessName: data.businessName ?? null,
        locationName: data.locationName ?? null,
        prizePool: data.prizePool,
      });
    } catch (e: any) {
      onSnackError(e?.response?.data?.message ?? 'Failed to pick winner');
    }
    setConfirmPick(null);
  };

  const handleDeleteDraw = async () => {
    if (!confirmDelete) return;
    try {
      await deleteDraw.mutateAsync(confirmDelete);
      onSnackSuccess('Campaign deleted');
    } catch (e: any) {
      onSnackError(e?.response?.data?.message ?? 'Failed to delete campaign');
    }
    setConfirmDelete(null);
  };

  const handleDuplicate = async (drawId: number) => {
    try {
      await duplicateDraw.mutateAsync(drawId);
      onSnackSuccess('Campaign duplicated as Upcoming');
    } catch (e: any) {
      onSnackError(e?.response?.data?.message ?? 'Failed to duplicate campaign');
    }
  };

  const active = draws?.filter((d) => d.status?.toUpperCase() === 'OPEN') ?? [];
  const upcoming = draws?.filter((d) => d.status?.toUpperCase() === 'UPCOMING') ?? [];
  const history = draws?.filter((d) => d.status?.toUpperCase() === 'CLOSED') ?? [];

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
        <Button size='small' variant='outlined' color='warning' startIcon={<LockIcon />} onClick={(e) => { e.stopPropagation(); setConfirmClose(draw.id); }} fullWidth={!inline}>Close</Button>
      )}
      {draw.status?.toUpperCase() === 'CLOSED' && !draw.winner_user_id && (
        <Button size='small' variant='contained' color='secondary' startIcon={<EmojiEventsIcon />} onClick={(e) => { e.stopPropagation(); setConfirmPick({ id: draw.id, entryCount: draw.entry_count ?? 0 }); }} fullWidth={!inline}>Pick Winner</Button>
      )}
      {draw.status?.toUpperCase() === 'CLOSED' && !draw.winner_user_id && (
        <Button size='small' variant='outlined' color='info' startIcon={<LockOpenIcon />} onClick={(e) => { e.stopPropagation(); setConfirmReopen(draw.id); }} fullWidth={!inline}>Reopen</Button>
      )}
      {draw.status?.toUpperCase() === 'CLOSED' && draw.winner_user_id && (
        <Chip label='Winner Selected' size='small' color='success' />
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
            <TableCell>Date</TableCell>
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
                <TableCell>{new Date(draw.draw_date).toLocaleDateString()}</TableCell>
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
                    <DrawBusinessesPanel drawId={draw.id} drawStatus={draw.status} />
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
                  {new Date(draw.draw_date).toLocaleDateString()}
                </Typography>
              </Box>
              {expandedDrawId === draw.id && <DrawBusinessesPanel drawId={draw.id} drawStatus={draw.status} />}
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

      {/* Close confirmation */}
      <Dialog open={!!confirmClose} onClose={() => setConfirmClose(null)}>
        <DialogTitle>Close Campaign?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Closing this campaign will prevent any new entries from being counted. You can pick a winner after closing.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClose(null)}>Cancel</Button>
          <Button variant='contained' color='warning' onClick={handleCloseDraw} disabled={closeDraw.isPending}>
            {closeDraw.isPending ? 'Closing...' : 'Close Campaign'}
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
            Reopening this campaign will set its status back to Open. Only allowed if no winner has been picked and no other campaign is currently open.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmReopen(null)}>Cancel</Button>
          <Button variant='contained' color='info' onClick={handleReopenDraw} disabled={reopenDraw.isPending}>
            {reopenDraw.isPending ? 'Reopening...' : 'Reopen Campaign'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Winner result */}
      <Dialog open={!!winnerResult} onClose={() => setWinnerResult(null)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>
          <EmojiEventsIcon sx={{ fontSize: 48, color: 'warning.main', display: 'block', mx: 'auto', mb: 1 }} />
          Winner Selected
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1} textAlign='center'>
            <Typography variant='h6' fontWeight={800}>{winnerResult?.winnerName}</Typography>
            <Typography variant='body2' color='text.secondary'>
              Winning entry: <strong>{winnerResult?.ticketCode}</strong>
            </Typography>
            {winnerResult?.businessName && (
              <Typography variant='body2' color='text.secondary'>
                Business: <strong>{winnerResult.businessName}{winnerResult.locationName ? ` · ${winnerResult.locationName}` : ''}</strong>
              </Typography>
            )}
            <Typography variant='body2' color='text.secondary'>
              Prize pool: <strong>${Number(winnerResult?.prizePool ?? 0).toLocaleString()}</strong>
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button fullWidth variant='contained' onClick={() => setWinnerResult(null)}>Done</Button>
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
