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

const CreateDrawModal: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const mutation = useCreateDraw();
  const [formData, setFormData] = useState({
    name: '',
    prize_amount: '',
    draw_date: '',
  });

  const handleClose = () => {
    setFormData({ name: '', prize_amount: '', draw_date: '' });
    onClose();
  };

  const handleSubmit = () => {
    mutation.mutate(
      {
        name: formData.name,
        prize_amount: parseFloat(formData.prize_amount) || 0,
        draw_date: formData.draw_date,
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
            label='Campaign Date'
            type='date'
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            value={formData.draw_date}
            onChange={(e) => setFormData({ ...formData, draw_date: e.target.value })}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant='contained'
          onClick={handleSubmit}
          disabled={mutation.isPending || !formData.name || !formData.draw_date || !formData.prize_amount}
        >
          {mutation.isPending ? 'Saving...' : 'Create Campaign'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateDrawModal;
