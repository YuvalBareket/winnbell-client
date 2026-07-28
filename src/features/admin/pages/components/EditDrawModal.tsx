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
  Box,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useForm, Controller } from 'react-hook-form';
import { useUpdateDraw } from '../../hooks/useAdmin';
import AppDatePicker from '../../../../shared/components/AppDatePicker';
import { apiErrorMessage } from '../../../../shared/utils/apiError';
import { firstOfMonth, lastOfMonth } from '../../utils/drawDates';
import type { Draw } from '../../types/admin.types';
import {
  PRIMARY_MAIN, PRIMARY_TINT, GRADIENT_CTA, SHADOW_PRIMARY_SOFT, TEXT_HEADING, TEXT_SECONDARY,
} from '../../../../shared/colors';
import { IconTile } from './adminUi';

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
  start_date: string;
  draw_date: string;
}

const EditDrawModal: React.FC<Props> = ({ open, draw, onClose, onSuccess, onError }) => {
  const updateDraw = useUpdateDraw();

  // `values` reactively resets the form whenever `draw` changes (RHF v7 pattern).
  // This replaces the reset-in-effect pattern which caused a one-frame stale display on open.
  const { control, handleSubmit, getValues, setValue, trigger, formState: { isDirty } } = useForm<FormValues>({
    values: draw
      ? { name: draw.name, prize_amount: String(draw.prize_amount), start_date: draw.start_date?.slice(0, 10) ?? '', draw_date: draw.draw_date.slice(0, 10) }
      : { name: '', prize_amount: '', start_date: '', draw_date: '' },
    // A background refetch of the entity must never wipe what the user is typing.
    resetOptions: { keepDirtyValues: true },
  });

  const onSubmit = async (values: FormValues) => {
    if (!draw) return;
    const payload: { name?: string; prize_amount?: number; start_date?: string; draw_date?: string } = {};
    if (values.name.trim() !== draw.name) payload.name = values.name.trim();
    if (Number(values.prize_amount) !== Number(draw.prize_amount)) payload.prize_amount = Number(values.prize_amount);
    if (values.draw_date !== draw.draw_date.slice(0, 10)) payload.draw_date = values.draw_date;
    // WYSIWYG: whenever the draw date moves, send the start the admin is LOOKING at,
    // so the server never silently re-derives a different one behind the form.
    if (values.start_date && (payload.draw_date !== undefined || values.start_date !== (draw.start_date?.slice(0, 10) ?? ''))) {
      payload.start_date = values.start_date;
    }

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
    <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconTile icon={<EditIcon />} tint={PRIMARY_TINT} color={PRIMARY_MAIN} size={36} />
          <Box>
            <Typography variant='h6' sx={{ fontWeight: 800, color: TEXT_HEADING, lineHeight: 1.2 }}>Edit Campaign</Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2.5}>
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
                slotProps={{ input: { sx: { borderRadius: '12px' } } }}
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
                slotProps={{ htmlInput: { min: 1 }, input: { sx: { borderRadius: '12px' } } }}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name='start_date'
            control={control}
            // The server normalises the draw to the LAST day of its month - compare
            // against that boundary, not the raw day typed in the draw field.
            rules={{ validate: (v) => !v || v < lastOfMonth(getValues('draw_date')) || 'Must be before the draw date' }}
            render={({ field, fieldState }) => (
              <AppDatePicker
                label='Start Date'
                size='small'
                value={field.value}
                onChange={field.onChange}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                sx={{ '& .MuiPickersOutlinedInput-root': { borderRadius: '12px' } }}
              />
            )}
          />
          <Controller
            name='draw_date'
            control={control}
            rules={{ required: 'Draw date is required', validate: (v) => v >= today || 'Date must be today or later' }}
            render={({ field, fieldState }) => (
              <AppDatePicker
                label='Draw Date'
                size='small'
                minDate={today}
                sx={{ '& .MuiPickersOutlinedInput-root': { borderRadius: '12px' } }}
                value={field.value}
                onChange={(v) => {
                  const prev = field.value;
                  field.onChange(v);
                  // A start that was just the default (1st of the old draw month) keeps
                  // tracking the default when the month moves; a custom start stays put.
                  if (getValues('start_date') === firstOfMonth(prev)) {
                    setValue('start_date', firstOfMonth(v), { shouldDirty: true });
                  }
                  // Re-check the start against the new draw month either way.
                  void trigger('start_date');
                }}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ gap: 1, px: 3, pb: 2.5, pt: 1.5 }}>
        <Button onClick={onClose} sx={{ color: TEXT_SECONDARY, textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={updateDraw.isPending || !isDirty}
          sx={{
            background: GRADIENT_CTA,
            color: 'white',
            borderRadius: '12px',
            fontWeight: 700,
            textTransform: 'none',
            boxShadow: SHADOW_PRIMARY_SOFT,
          }}
        >
          {updateDraw.isPending ? <CircularProgress size={20} color='inherit' /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditDrawModal;
