import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Container,
  LinearProgress,
  Box,
  Chip,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useAdminBusinesses, useAllDraws, useOpenDraw, useCloseDraw, usePickWinner } from '../hooks/useAdmin';
import CreateBusinessModal from './components/CreateBusinessModal';
import CreateDrawModal from './components/CreateDrawModal';
import GenerateTicketsModal from './components/GenerateTicketsModal';

const STATUS_COLORS: Record<string, 'default' | 'warning' | 'primary' | 'success' | 'error'> = {
  upcoming: 'default',
  open: 'primary',
  closed: 'success',
};

const BusinessDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  // Queries
  const { data: businesses, isLoading: loadingBiz } = useAdminBusinesses();
  const { data: draws, isLoading: loadingDraws } = useAllDraws();

  const openDraw = useOpenDraw();
  const closeDraw = useCloseDraw();
  const pickWinner = usePickWinner();

  // Modal States
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);
  const [isBizModalOpen, setIsBizModalOpen] = useState(false);
  const [isDrawModalOpen, setIsDrawModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState<number | null>(null);
  const [confirmClose, setConfirmClose] = useState<number | null>(null);
  const [confirmPick, setConfirmPick] = useState<number | null>(null);
  const [winnerResult, setWinnerResult] = useState<{ winnerName: string; ticketCode: string; businessName: string | null; locationName: string | null; prizePool: number } | null>(null);
  const [snackError, setSnackError] = useState('');

  const handleOpenDraw = async () => {
    if (!confirmOpen) return;
    try {
      await openDraw.mutateAsync(confirmOpen);
    } catch (e: any) {
      setSnackError(e?.response?.data?.message ?? 'Failed to open draw');
    }
    setConfirmOpen(null);
  };

  const handleCloseDraw = async () => {
    if (!confirmClose) return;
    try {
      await closeDraw.mutateAsync(confirmClose);
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

  if (loadingBiz || loadingDraws) return <LinearProgress sx={{ mt: 5 }} />;

  return (
    <Container maxWidth='lg' sx={{ mt: 4 }}>
      <Typography variant='h4' fontWeight='bold' mb={3}>
        Admin Control Center
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
        >
          <Tab label='Businesses' />
          <Tab label='Raffle Draws' />
        </Tabs>
      </Box>

      {/* --- TAB 0: BUSINESSES --- */}
      {tabValue === 0 && (
        <>
          <Box display='flex' justifyContent='flex-end' mb={2}>
            <Button
              variant='contained'
              startIcon={<AddIcon />}
              onClick={() => setIsBizModalOpen(true)}
            >
              New Business
            </Button>
          </Box>
          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>
                    <strong>Name</strong>
                  </TableCell>
                  <TableCell align='center'>
                    <strong>Total Created</strong>
                  </TableCell>
                  <TableCell align='center'>
                    <strong>Activated</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Usage %</strong>
                  </TableCell>
                  <TableCell align='right'>
                    <strong>Actions</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {businesses?.map((b) => {
                  const usage =
                    b.total_tickets_created > 0
                      ? (b.total_activated / b.total_tickets_created) * 100
                      : 0;
                  return (
                    <TableRow key={b.id} hover>
                      <TableCell>{b.name}</TableCell>
                      <TableCell align='center'>
                        {b.total_tickets_created}
                      </TableCell>
                      <TableCell align='center'>{b.total_activated}</TableCell>
                      <TableCell sx={{ minWidth: 150 }}>
                        <LinearProgress variant='determinate' value={usage} />
                      </TableCell>
                      <TableCell align='right'>
                        <Button
                          size='small'
                          variant='outlined'
                          onClick={() => setSelectedBusinessId(b.id)}
                        >
                          Generate Tickets
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* --- TAB 1: DRAWS --- */}
      {tabValue === 1 && (
        <>
          <Box display='flex' justifyContent='flex-end' mb={2}>
            <Button
              variant='contained'
              color='secondary'
              startIcon={<AddIcon />}
              onClick={() => setIsDrawModalOpen(true)}
            >
              New Draw
            </Button>
          </Box>
          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell><strong>Draw Name</strong></TableCell>
                  <TableCell><strong>Prize Pool</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align='right'><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {draws?.map((d) => (
                  <TableRow key={d.id} hover>
                    <TableCell>{d.name}</TableCell>
                    <TableCell>${Number(d.prize_amount ?? 0).toLocaleString()}</TableCell>
                    <TableCell>{new Date(d.draw_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={d.status}
                        size='small'
                        color={STATUS_COLORS[d.status?.toLowerCase()] ?? 'default'}
                      />
                    </TableCell>
                    <TableCell align='right'>
                      <Stack direction='row' spacing={1} justifyContent='flex-end'>
                        {d.status?.toUpperCase() === 'UPCOMING' && (
                          <Button
                            size='small'
                            variant='contained'
                            color='success'
                            startIcon={<LockOpenIcon />}
                            onClick={() => setConfirmOpen(d.id)}
                          >
                            Open Draw
                          </Button>
                        )}
                        {d.status?.toUpperCase() === 'OPEN' && (
                          <Button
                            size='small'
                            variant='outlined'
                            color='warning'
                            startIcon={<LockIcon />}
                            onClick={() => setConfirmClose(d.id)}
                          >
                            Close Draw
                          </Button>
                        )}
                        {d.status?.toUpperCase() === 'CLOSED' && !d.winner_user_id && (
                          <Button
                            size='small'
                            variant='contained'
                            color='secondary'
                            startIcon={<EmojiEventsIcon />}
                            onClick={() => setConfirmPick(d.id)}
                          >
                            Pick Winner
                          </Button>
                        )}
                        {d.status?.toUpperCase() === 'CLOSED' && d.winner_user_id && (
                          <Chip label='Winner selected' size='small' color='success' />
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

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

      {/* Open Draw Confirmation */}
      <Dialog open={!!confirmOpen} onClose={() => setConfirmOpen(null)}>
        <DialogTitle>Open this draw?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Opening the draw will allow businesses to generate tickets and users to activate them. Make sure you're ready before proceeding.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(null)}>Cancel</Button>
          <Button variant='contained' color='success' onClick={handleOpenDraw} disabled={openDraw.isPending}>
            {openDraw.isPending ? 'Opening...' : 'Open Draw'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Close Draw Confirmation */}
      <Dialog open={!!confirmClose} onClose={() => setConfirmClose(null)}>
        <DialogTitle>Close this draw?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Closing the draw will prevent any new tickets from being counted. You can pick the winner after closing.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClose(null)}>Cancel</Button>
          <Button variant='contained' color='warning' onClick={handleCloseDraw} disabled={closeDraw.isPending}>
            {closeDraw.isPending ? 'Closing...' : 'Close Draw'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pick Winner Confirmation */}
      <Dialog open={!!confirmPick} onClose={() => setConfirmPick(null)}>
        <DialogTitle>Pick a winner?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will randomly select a winner from all activated tickets in this draw. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmPick(null)}>Cancel</Button>
          <Button variant='contained' color='secondary' onClick={handlePickWinner} disabled={pickWinner.isPending}>
            {pickWinner.isPending ? 'Picking...' : 'Pick Winner'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Winner Result */}
      <Dialog open={!!winnerResult} onClose={() => setWinnerResult(null)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>
          <EmojiEventsIcon sx={{ fontSize: 48, color: 'warning.main', display: 'block', mx: 'auto', mb: 1 }} />
          Winner Selected
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1} textAlign='center'>
            <Typography variant='h6' fontWeight={800}>{winnerResult?.winnerName}</Typography>
            <Typography variant='body2' color='text.secondary'>Winning ticket: <strong>{winnerResult?.ticketCode}</strong></Typography>
            {winnerResult?.businessName && (
              <Typography variant='body2' color='text.secondary'>
                Business: <strong>{winnerResult.businessName}{winnerResult.locationName ? ` · ${winnerResult.locationName}` : ''}</strong>
              </Typography>
            )}
            <Typography variant='body2' color='text.secondary'>Prize pool: <strong>${Number(winnerResult?.prizePool ?? 0).toLocaleString()}</strong></Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button fullWidth variant='contained' onClick={() => setWinnerResult(null)}>Done</Button>
        </DialogActions>
      </Dialog>

      {/* Error snackbar */}
      <Snackbar open={!!snackError} autoHideDuration={4000} onClose={() => setSnackError('')}>
        <Alert severity='error' onClose={() => setSnackError('')}>{snackError}</Alert>
      </Snackbar>
    </Container>
  );
};

export default BusinessDashboard;
