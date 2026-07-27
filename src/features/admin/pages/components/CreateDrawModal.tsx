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
  Box,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useCreateDraw } from '../../hooks/useAdmin';
import { lastOfMonth } from '../../utils/drawDates';
import {
  PRIMARY_MAIN, PRIMARY_TINT, GRADIENT_CTA, SHADOW_PRIMARY_SOFT, TEXT_HEADING, TEXT_SECONDARY,
  BORDER_LIGHT,
} from '../../../../shared/colors';
import { IconTile } from './adminUi';

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
    <Dialog open={open} onClose={handleClose} maxWidth='xs' fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconTile icon={<AddIcon />} tint={PRIMARY_TINT} color={PRIMARY_MAIN} size={36} />
          <Box>
            <Typography variant='h6' sx={{ fontWeight: 800, color: TEXT_HEADING, lineHeight: 1.2 }}>Create Campaign</Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2.5}>
          <Alert severity='info' sx={{ borderRadius: 2, border: `1px solid ${BORDER_LIGHT}` }}>
            Set the prize amount directly. This is independent of business subscriptions.
          </Alert>
          <TextField
            label='Campaign Name (e.g. March 2026)'
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            slotProps={{ input: { sx: { borderRadius: '12px' } } }}
          />
          <TextField
            label='Prize Amount ($)'
            type='number'
            fullWidth
            value={formData.prize_amount}
            onChange={(e) => setFormData({ ...formData, prize_amount: e.target.value })}
            helperText='The total prize amount for this campaign (e.g. 1000)'
            slotProps={{ htmlInput: { min: 1, step: 1 }, input: { sx: { borderRadius: '12px' } } }}
          />
          <TextField
            label='Start Date (optional)'
            type='date'
            fullWidth
            slotProps={{ inputLabel: { shrink: true }, input: { sx: { borderRadius: '12px' } } }}
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            error={startAfterDraw}
            helperText={startAfterDraw ? 'Must be before the draw date' : 'Leave empty to start on the 1st of the campaign month'}
          />
          <TextField
            label='Draw Date'
            type='date'
            fullWidth
            slotProps={{ inputLabel: { shrink: true }, input: { sx: { borderRadius: '12px' } } }}
            value={formData.draw_date}
            onChange={(e) => setFormData({ ...formData, draw_date: e.target.value })}
            helperText='Moved to the last day of its month automatically'
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ gap: 1, px: 3, pb: 2.5, pt: 1.5 }}>
        <Button onClick={handleClose} sx={{ color: TEXT_SECONDARY, textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
        <Button
          variant='contained'
          onClick={handleSubmit}
          disabled={mutation.isPending || !formData.name || !formData.draw_date || !formData.prize_amount || startAfterDraw}
          sx={{
            background: GRADIENT_CTA,
            borderRadius: '12px',
            fontWeight: 700,
            textTransform: 'none',
            boxShadow: SHADOW_PRIMARY_SOFT,
          }}
        >
          {mutation.isPending ? 'Saving...' : 'Create Campaign'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateDrawModal;
