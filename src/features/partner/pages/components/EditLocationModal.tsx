import { useEffect } from 'react';
import {
  Dialog,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Close, LocationOn } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import AddressAutoComplete from '../../../../shared/components/AddressAutoComplete';
import { useUpdateLocation } from '../../hooks/useUpdateLocation';
import type { BusinessLocation, UpdateLocationInput } from '../../types/business.types';
import {
  GRADIENT_HERO,
  ALPHA_WHITE_15,
  ALPHA_WHITE_30,
} from '../../../../shared/colors';

interface Props {
  open: boolean;
  onClose: () => void;
  location: BusinessLocation | null;
}

interface FormValues {
  name: string;
  address: string;
  lat: number | null;
  lon: number | null;
}

const EditLocationModal = ({ open, onClose, location }: Props) => {
  const { mutate: updateLocation, isPending } = useUpdateLocation();

  const { control, handleSubmit, reset, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      name: '',
      address: '',
      lat: null,
      lon: null,
    },
  });

  useEffect(() => {
    if (location) {
      reset({
        name: location.name,
        address: location.address,
        lat: null,
        lon: null,
      });
    }
  }, [location, reset]);

  const addressValue = watch('address');

  const onSubmit = (values: FormValues) => {
    if (!location) return;

    const payload: UpdateLocationInput = {
      name: values.name,
      address: values.address,
      lat: values.lat ?? 0,
      lon: values.lon ?? 0,
    };

    updateLocation(
      { locationId: location.id, data: payload },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >
      {/* Gradient header */}
      <Box sx={{ background: GRADIENT_HERO, px: 3, pt: 2.5, pb: 3, color: 'white' }}>
        <Stack direction='row' alignItems='center' justifyContent='space-between'>
          <Stack direction='row' alignItems='center' spacing={1.5}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2,
              bgcolor: ALPHA_WHITE_15, border: `1px solid ${ALPHA_WHITE_30}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <LocationOn />
            </Box>
            <Box>
              <Typography variant='h6' fontWeight={800}>Edit Location</Typography>
              <Typography variant='body2' sx={{ opacity: 0.8 }}>Update branch details</Typography>
            </Box>
          </Stack>
          <IconButton size='small' onClick={onClose} sx={{ color: 'white', bgcolor: ALPHA_WHITE_15 }}>
            <Close fontSize='small' />
          </IconButton>
        </Stack>
      </Box>

      {/* Form */}
      <Stack spacing={2.5} component='form' onSubmit={handleSubmit(onSubmit)} sx={{ p: 3 }}>
        <Controller
          name='name'
          control={control}
          rules={{ required: 'Name is required' }}
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
          defaultValue={
            addressValue ? { label: addressValue, lat: null, lon: null } : null
          }
          onSelect={(option) => {
            setValue('address', option?.label ?? '');
            setValue('lat', option?.lat ?? null);
            setValue('lon', option?.lon ?? null);
          }}
        />

        <Stack direction='row' spacing={1.5} pt={1}>
          <Button
            variant='outlined'
            onClick={onClose}
            disabled={isPending}
            sx={{ flex: 1, borderRadius: 3, textTransform: 'none', fontWeight: 700, py: 1.5 }}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            variant='contained'
            disabled={isPending}
            startIcon={isPending ? <CircularProgress size={16} color='inherit' /> : null}
            sx={{ flex: 1, borderRadius: 3, textTransform: 'none', fontWeight: 800, py: 1.5 }}
          >
            {isPending ? 'Saving…' : 'Save'}
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  );
};

export default EditLocationModal;
