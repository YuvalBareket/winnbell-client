import { useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import AddressAutoComplete from '../../../../shared/components/AddressAutoComplete';
import { useUpdateLocation } from '../../hooks/useUpdateLocation';
import type { BusinessLocation, UpdateLocationInput } from '../../types/business.types';

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 460,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

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
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant='h6' fontWeight={700} mb={3}>
          Edit Location
        </Typography>

        <Stack spacing={2.5} component='form' onSubmit={handleSubmit(onSubmit)}>
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

          <Stack direction='row' spacing={1.5} justifyContent='flex-end' pt={1}>
            <Button
              variant='outlined'
              onClick={onClose}
              disabled={isPending}
              sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700 }}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              variant='contained'
              disabled={isPending}
              startIcon={isPending ? <CircularProgress size={16} color='inherit' /> : null}
              sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700 }}
            >
              {isPending ? 'Saving…' : 'Save'}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
};

export default EditLocationModal;
