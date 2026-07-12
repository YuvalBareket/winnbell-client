import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useUpdateDraw } from '../../hooks/useAdmin';
import { apiErrorMessage } from '../../../../shared/utils/apiError';
import type { Draw } from '../../types/admin.types';

interface Props {
  open: boolean;
  draw: Draw | null;
  onClose: () => void;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

interface FormValues {
  name: string;
  prize_amount: string;
  draw_date: string;
}

const EditDrawModal: React.FC<Props> = ({ open, draw, onClose, onSuccess, onError }) => {
  const updateDraw = useUpdateDraw();

  // `values` reactively resets the form whenever `draw` changes (RHF v7 pattern).
  // This replaces the reset-in-effect pattern which caused a one-frame stale display on open.
  const { control, handleSubmit, formState: { isDirty } } = useForm<FormValues>({
    values: draw
      ? { name: draw.name, prize_amount: String(draw.prize_amount), draw_date: draw.draw_date.slice(0, 10) }
      : { name: '', prize_amount: '', draw_date: '' },
    // A background refetch of the entity must never wipe what the user is typing.
    resetOptions: { keepDirtyValues: true },
  });

  const onSubmit = async (values: FormValues) => {
    if (!draw) return;
    const payload: { name?: string; prize_amount?: number; draw_date?: string } = {};
    if (values.name.trim() !== draw.name) payload.name = values.name.trim();
    if (Number(values.prize_amount) !== Number(draw.prize_amount)) payload.prize_amount = Number(values.prize_amount);
    if (values.draw_date !== draw.draw_date.slice(0, 10)) payload.draw_date = values.draw_date;

    try {
      await updateDraw.mutateAsync({ drawId: draw.id, data: payload });
      onSuccess();
      onClose();
    } catch (e: unknown) {
      onError(apiErrorMessage(e, 'Failed to update campaign'));
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth>
      <DialogTitle>Edit Campaign</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Controller
            name='name'
            control={control}
            rules={{ required: 'Name is required', validate: (v) => !!v.trim() || 'Name is required' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label='Campaign Name'
                fullWidth
                size='small'
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name='prize_amount'
            control={control}
            rules={{
              required: 'Prize amount is required',
              validate: (v) => Number(v) > 0 || 'Must be greater than 0',
            }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label='Prize Amount ($)'
                type='number'
                fullWidth
                size='small'
                inputProps={{ min: 1 }}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name='draw_date'
            control={control}
            rules={{ required: 'Draw date is required', validate: (v) => v >= today || 'Date must be today or later' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label='Draw Date'
                type='date'
                fullWidth
                size='small'
                inputProps={{ min: today }}
                InputLabelProps={{ shrink: true }}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant='contained'
          onClick={handleSubmit(onSubmit)}
          disabled={updateDraw.isPending || !isDirty}
        >
          {updateDraw.isPending ? <CircularProgress size={20} color='inherit' /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditDrawModal;
