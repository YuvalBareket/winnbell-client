import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  Alert,
} from '@mui/material';
import { useCreateDraw } from '../../hooks/useAdmin';
import { lastOfMonth } from '../../utils/drawDates';

const CreateDrawModal: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const mutation = useCreateDraw();
  const [formData, setFormData] = useState({
    name: '',
    prize_amount: '',
    start_date: '',
    draw_date: '',
  });

  const handleClose = () => {
    setFormData({ name: '', prize_amount: '', start_date: '', draw_date: '' });
    onClose();
  };

  // Compare against the NORMALISED draw day (last of the month) - the server moves the
  // draw there, so a start after the typed day but before month-end is still valid.
  const startAfterDraw = !!formData.start_date && !!formData.draw_date && formData.start_date >= lastOfMonth(formData.draw_date);

  const handleSubmit = () => {
    mutation.mutate(
      {
        name: formData.name,
        prize_amount: parseFloat(formData.prize_amount) || 0,
        draw_date: formData.draw_date,
        ...(formData.start_date ? { start_date: formData.start_date } : {}),
      },
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='xs' fullWidth>
      <DialogTitle>Create New Campaign</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Alert severity='info' sx={{ borderRadius: 2 }}>
            Set the prize amount directly. This is independent of business subscriptions.
          </Alert>
          <TextField
            label='Campaign Name (e.g. March 2026)'
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            label='Prize Amount ($)'
            type='number'
            fullWidth
            value={formData.prize_amount}
            onChange={(e) => setFormData({ ...formData, prize_amount: e.target.value })}
            helperText='The total prize amount for this campaign (e.g. 1000)'
            slotProps={{ htmlInput: { min: 1, step: 1 } }}
          />
          <TextField
            label='Start Date (optional)'
            type='date'
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            error={startAfterDraw}
            helperText={startAfterDraw ? 'Must be before the draw date' : 'Leave empty to start on the 1st of the campaign month'}
          />
          <TextField
            label='Draw Date'
            type='date'
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            value={formData.draw_date}
            onChange={(e) => setFormData({ ...formData, draw_date: e.target.value })}
            helperText='Moved to the last day of its month automatically'
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant='contained'
          onClick={handleSubmit}
          disabled={mutation.isPending || !formData.name || !formData.draw_date || !formData.prize_amount || startAfterDraw}
        >
          {mutation.isPending ? 'Saving...' : 'Create Campaign'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateDrawModal;
