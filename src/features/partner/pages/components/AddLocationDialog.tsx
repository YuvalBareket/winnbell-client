import React from 'react';
import {
  Dialog,
  Box,
  Stack,
  Typography,
  IconButton,
  Button,
  TextField,
  CircularProgress,
} from '@mui/material';
import { AddBusiness, Close } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import AddressAutoComplete from '../../../../shared/components/AddressAutoComplete';
import { GRADIENT_HERO, ALPHA_WHITE_15, ALPHA_WHITE_30 } from '../../../../shared/colors';

interface AddLocationFormValues {
  name: string;
  address: string;
  lat: number | null;
  lon: number | null;
}

interface AddLocationDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; address: string; lat: number; lon: number }) => void;
  isLoading: boolean;
}

const AddLocationDialog: React.FC<AddLocationDialogProps> = ({
  open,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const form = useForm<AddLocationFormValues>({
    defaultValues: { name: '', address: '', lat: null, lon: null },
  });

  const handleSubmit = (values: AddLocationFormValues) => {
    if (!values.lat || !values.lon) return;
    onSubmit({
      name: values.name,
      address: values.address,
      lat: values.lat,
      lon: values.lon,
    });
    form.reset();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
      <Box sx={{ background: GRADIENT_HERO, px: 3, pt: 2.5, pb: 3, color: 'white' }}>
        <Stack direction='row' alignItems='center' justifyContent='space-between'>
          <Stack direction='row' alignItems='center' spacing={1.5}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2,
              bgcolor: ALPHA_WHITE_15, border: `1px solid ${ALPHA_WHITE_30}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AddBusiness />
            </Box>
            <Box>
              <Typography variant='h6' fontWeight={800}>Add New Location</Typography>
              <Typography variant='body2' sx={{ opacity: 0.8 }}>Add a branch to your business</Typography>
            </Box>
          </Stack>
          <IconButton size='small' onClick={onClose} sx={{ color: 'white', bgcolor: ALPHA_WHITE_15 }}>
            <Close fontSize='small' />
          </IconButton>
        </Stack>
      </Box>
      <Stack spacing={2.5} component='form' id='add-location-form' onSubmit={form.handleSubmit(handleSubmit)} sx={{ p: 3 }}>
        <Controller
          name='name'
          control={form.control}
          rules={{ required: 'Branch name is required' }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label='Branch Name'
              fullWidth
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' } }}
            />
          )}
        />
        <AddressAutoComplete
          label='Address'
          defaultValue={null}
          onSelect={(option) => {
            form.setValue('address', option?.label ?? '');
            form.setValue('lat', option?.lat ?? null);
            form.setValue('lon', option?.lon ?? null);
          }}
        />
        <Stack direction='row' spacing={1.5} pt={1}>
          <Button
            variant='outlined'
            onClick={onClose}
            sx={{ flex: 1, borderRadius: 3, fontWeight: 700, py: 1.5, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            form='add-location-form'
            variant='contained'
            disabled={isLoading}
            sx={{ flex: 1, borderRadius: 3, fontWeight: 800, py: 1.5, textTransform: 'none' }}
          >
            {isLoading ? <CircularProgress size={20} color='inherit' /> : 'Add Location'}
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  );
};

export default AddLocationDialog;
