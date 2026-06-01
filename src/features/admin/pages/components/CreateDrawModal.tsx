import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
} from '@mui/material';
import { useCreateDraw } from '../../hooks/useAdmin';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 420,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

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

  useEffect(() => {
    if (!open) setFormData({ name: '', prize_amount: '', draw_date: '' });
  }, [open]);

  const handleSubmit = () => {
    mutation.mutate(
      {
        name: formData.name,
        prize_amount: parseFloat(formData.prize_amount) || 0,
        draw_date: formData.draw_date,
      },
      {
        onSuccess: () => {
          onClose();
          setFormData({ name: '', prize_amount: '', draw_date: '' });
        },
      },
    );
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant='h6' mb={2} fontWeight={700}>
          Create New Campaign
        </Typography>
        <Alert severity='info' sx={{ mb: 2.5, borderRadius: 2 }}>
          Set the prize amount directly. This is independent of business subscriptions.
        </Alert>
        <Stack spacing={2}>
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
          <Box display='flex' justifyContent='flex-end' gap={1} mt={1}>
            <Button onClick={onClose} sx={{ borderRadius: 2 }}>Cancel</Button>
            <Button
              variant='contained'
              onClick={handleSubmit}
              disabled={mutation.isPending || !formData.name || !formData.draw_date || !formData.prize_amount}
              sx={{ borderRadius: 2 }}
            >
              {mutation.isPending ? 'Saving...' : 'Create Campaign'}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Modal>
  );
};

export default CreateDrawModal;
