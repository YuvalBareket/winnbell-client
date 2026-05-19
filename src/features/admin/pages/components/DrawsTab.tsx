import React, { useState } from 'react';
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import {
  useOpenDraw,
  useCloseDraw,
  usePickWinner,
  useReopenDraw,
  useDrawBusinesses,
} from '../../hooks/useAdmin';
import { BG_PAGE } from '../../../../shared/colors';

const STATUS_COLORS: Record<string, 'default' | 'warning' | 'primary' | 'success' | 'error'> = {
  upcoming: 'default',
  open: 'primary',
  closed: 'success',
};

const DrawBusinessesPanel: React.FC<{ drawId: number }> = ({ drawId }) => {
  const { data, isLoading } = useDrawBusinesses(drawId);
  if (isLoading) return <Box sx={{ p: 2 }}><Skeleton variant='rectangular' height={60} /></Box>;
  if (!data?.length) return <Box sx={{ p: 2 }}><Typography variant='body2' color='text.secondary'>No businesses enrolled in this campaign.</Typography></Box>;
  return (
    <Box sx={{ px: 3, pb: 2, bgcolor: BG_PAGE }}>
      <Typography variant='caption' fontWeight={700} color='text.secondary' sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>
        Participating Businesses ({data.length})
      </Typography>
      <Stack spacing={0.5}>
        {data.map((b) => (
          <Box key={b.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.75, px: 1.5, borderRadius: 1.5, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant='body2' fontWeight={600}>{b.name}</Typography>
          </Box>
        ))}
      </Stack>
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

const DrawsTab: React.FC<Props> = ({ draws, isMobile, onSnackError, onSnackSuccess, onCreateDraw }) => {
  const [confirmOpen, setConfirmOpen] = useState<number | null>(null);
  const [confirmClose, setConfirmClose] = useState<number | null>(null);
  const [confirmPick, setConfirmPick] = useState<number | null>(null);
  const [confirmReopen, setConfirmReopen] = useState<number | null>(null);
  const [winnerResult, setWinnerResult] = useState<{
    winnerName: string;
    ticketCode: string;
    businessName: string | null;
    locationName: string | null;
    prizePool: number;
  } | null>(null);
  const [expandedDrawId, setExpandedDrawId] = useState<number | null>(null);

  const openDraw = useOpenDraw();
  const closeDraw = useCloseDraw();
  const pickWinner = usePickWinner();
  const reopenDraw = useReopenDraw();

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
      const { data } = await pickWinner.mutateAsync(confirmPick);
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

  return (
    <>
      <Stack spacing={3}>
        <Box display='flex' justifyContent='flex-end'>
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={onCreateDraw}
          >
            New Campaign
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
                      {draw.status?.toUpperCase() === 'CLOSED' && !draw.winner_user_id && (
                        <Button size='small' variant='outlined' color='info' startIcon={<LockOpenIcon />} onClick={() => setConfirmReopen(draw.id)} fullWidth>Reopen</Button>
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
                          {draw.status?.toUpperCase() === 'CLOSED' && !draw.winner_user_id && (
                            <Button size='small' variant='outlined' color='info' startIcon={<LockOpenIcon />} onClick={() => setConfirmReopen(draw.id)}>Reopen</Button>
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

      {/* Open campaign confirmation */}
      <Dialog open={!!confirmOpen} onClose={() => setConfirmOpen(null)}>
        <DialogTitle>Open Campaign?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Opening this campaign will allow businesses to generate entries and users to activate
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
            {openDraw.isPending ? 'Opening...' : 'Open Campaign'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Close campaign confirmation */}
      <Dialog open={!!confirmClose} onClose={() => setConfirmClose(null)}>
        <DialogTitle>Close Campaign?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Closing this campaign will prevent any new entries from being counted. You can pick a
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
            {closeDraw.isPending ? 'Closing...' : 'Close Campaign'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pick winner confirmation */}
      <Dialog open={!!confirmPick} onClose={() => setConfirmPick(null)}>
        <DialogTitle>Pick a Winner?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will randomly select a winner from all activated entries in this campaign. This
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

      {/* Reopen campaign confirmation */}
      <Dialog open={!!confirmReopen} onClose={() => setConfirmReopen(null)}>
        <DialogTitle>Reopen Campaign?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Reopening this campaign will set its status back to Open. This is only allowed if no
            winner has been picked and no other campaign is currently open.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmReopen(null)}>Cancel</Button>
          <Button
            variant='contained'
            color='info'
            onClick={handleReopenDraw}
            disabled={reopenDraw.isPending}
          >
            {reopenDraw.isPending ? 'Reopening...' : 'Reopen Campaign'}
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
              Winning entry: <strong>{winnerResult?.ticketCode}</strong>
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
    </>
  );
};

export default DrawsTab;
