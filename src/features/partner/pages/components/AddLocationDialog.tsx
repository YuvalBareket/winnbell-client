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
  FormHelperText,
} from '@mui/material';
import { AddBusiness, Close, TrendingUpOutlined, ArrowForwardOutlined } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import AddressAutoComplete from '../../../../shared/components/AddressAutoComplete';
import {
  GRADIENT_HERO, ALPHA_WHITE_15, ALPHA_WHITE_30,
  PRIMARY_MAIN, ALPHA_PRIMARY_04, ALPHA_PRIMARY_10,
  TEXT_SECONDARY, TEXT_TERTIARY, TEXT_HEADING,
} from '../../../../shared/colors';

interface AddLocationFormValues {
  name: string;
  address: string;
  lat: number | null;
  lon: number | null;
}

interface PlanSummary {
  feePerLocation: number;
  locationCount: number;
  billingInterval: 'monthly' | 'yearly';
  hasStripeSubscription: boolean;
}

interface AddLocationDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; address: string; lat: number; lon: number }) => void;
  isLoading: boolean;
  planSummary?: PlanSummary | null;
}

const AddLocationDialog: React.FC<AddLocationDialogProps> = ({
  open,
  onClose,
  onSubmit,
  isLoading,
  planSummary,
}) => {
  const form = useForm<AddLocationFormValues>({
    defaultValues: { name: '', address: '', lat: null, lon: null },
  });
  const addressError = form.formState.errors.address?.message;

  const handleSubmit = (values: AddLocationFormValues) => {
    if (values.lat === null || values.lon === null) {
      form.setError('address', { message: 'Please select an address from the suggestions' });
      return;
    }
    onSubmit({
      name: values.name,
      address: values.address,
      lat: values.lat,
      lon: values.lon,
    });
    form.reset();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth PaperProps={{ sx: { borderRadius: 2, overflow: 'hidden' } }}>
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
        <Box>
          <AddressAutoComplete
            label='Address'
            onSelect={(option) => {
              form.setValue('address', option?.label ?? '');
              form.setValue('lat', option?.lat ?? null);
              form.setValue('lon', option?.lon ?? null);
              if (option?.lat) form.clearErrors('address');
            }}
          />
          {addressError && (
            <FormHelperText error sx={{ ml: 1.5 }}>{addressError}</FormHelperText>
          )}
        </Box>
        {planSummary?.hasStripeSubscription && planSummary.feePerLocation > 0 && (
          <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: ALPHA_PRIMARY_04, border: `1px solid ${ALPHA_PRIMARY_10}` }}>
            <Stack direction='row' alignItems='center' spacing={0.75} mb={0.75}>
              <TrendingUpOutlined sx={{ fontSize: 15, color: PRIMARY_MAIN }} />
              <Typography variant='caption' fontWeight={800} sx={{ color: PRIMARY_MAIN, textTransform: 'uppercase', letterSpacing: 0.8, fontSize: '0.62rem' }}>
                Your plan grows with you
              </Typography>
            </Stack>
            <Typography variant='body2' sx={{ color: TEXT_SECONDARY, lineHeight: 1.6, mb: 1.5, fontSize: '0.8rem' }}>
              Each new location is seamlessly added to your Winnbell network. Your plan adjusts at the same per-location rate, no surprises.
            </Typography>
            <Stack direction='row' alignItems='center' spacing={1}>
              <Box sx={{ flex: 1, p: 1.5, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.03)', textAlign: 'center' }}>
                <Typography variant='caption' sx={{ color: TEXT_TERTIARY, fontWeight: 600, display: 'block', mb: 0.25 }}>Today</Typography>
                <Typography variant='body2' fontWeight={700} sx={{ color: TEXT_HEADING }}>
                  ${(planSummary.feePerLocation * planSummary.locationCount).toLocaleString()}/{planSummary.billingInterval === 'yearly' ? 'yr' : 'mo'}
                </Typography>
                <Typography variant='caption' sx={{ color: TEXT_TERTIARY }}>
                  {planSummary.locationCount} location{planSummary.locationCount !== 1 ? 's' : ''}
                </Typography>
              </Box>
              <ArrowForwardOutlined sx={{ fontSize: 16, color: TEXT_TERTIARY, flexShrink: 0 }} />
              <Box sx={{ flex: 1, p: 1.5, borderRadius: 2, bgcolor: ALPHA_PRIMARY_10, textAlign: 'center' }}>
                <Typography variant='caption' sx={{ color: PRIMARY_MAIN, fontWeight: 600, display: 'block', mb: 0.25 }}>After adding</Typography>
                <Typography variant='body1' fontWeight={800} sx={{ color: PRIMARY_MAIN }}>
                  ${(planSummary.feePerLocation * (planSummary.locationCount + 1)).toLocaleString()}/{planSummary.billingInterval === 'yearly' ? 'yr' : 'mo'}
                </Typography>
                <Typography variant='caption' sx={{ color: TEXT_SECONDARY }}>
                  {planSummary.locationCount + 1} locations
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}
        <Stack direction='row' spacing={1.5} pt={1}>
          <Button
            variant='outlined'
            onClick={onClose}
            sx={{ flex: 1, borderRadius: 2, fontWeight: 700, py: 1.5, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            form='add-location-form'
            variant='contained'
            disabled={isLoading}
            sx={{ flex: 1, borderRadius: 2, fontWeight: 800, py: 1.5, textTransform: 'none' }}
          >
            {isLoading ? <CircularProgress size={20} color='inherit' /> : 'Add Location'}
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  );
};

export default AddLocationDialog;
