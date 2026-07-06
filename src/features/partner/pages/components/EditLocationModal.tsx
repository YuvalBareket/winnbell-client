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
  FormHelperText,
  InputAdornment,
} from '@mui/material';
import { Close, LocationOn, PhoneOutlined } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import AddressAutoComplete from '../../../../shared/components/AddressAutoComplete';
import { useUpdateLocation } from '../../hooks/useUpdateLocation';
import type { BusinessLocation, UpdateLocationInput } from '../../types/business.types';
import {
  GRADIENT_HERO, GRADIENT_PRIMARY,
  ALPHA_WHITE_10, ALPHA_WHITE_15, ALPHA_WHITE_20, ALPHA_WHITE_30,
  PRIMARY_MAIN, ALPHA_PRIMARY_04, ALPHA_PRIMARY_06, ALPHA_PRIMARY_20,
  TEXT_SECONDARY, TEXT_TERTIARY, BORDER_SUBTLE, BG_SUBTLE,
  SHADOW_PRIMARY_SOFT,
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
  suite: string;
  phone: string;
}

const MotionBox = motion(Box);

// Refined premium TextField styling shared across fields
const fieldSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: BG_SUBTLE,
    transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
    '& fieldset': {
      borderColor: BORDER_SUBTLE,
      transition: 'border-color 0.2s ease',
    },
    '&:hover': {
      bgcolor: '#ffffff',
      '& fieldset': { borderColor: ALPHA_PRIMARY_20 },
    },
    '&.Mui-focused': {
      bgcolor: '#ffffff',
      boxShadow: `0 0 0 4px ${ALPHA_PRIMARY_06}`,
      '& fieldset': { borderColor: PRIMARY_MAIN, borderWidth: 1.5 },
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 600,
    '&.Mui-focused': { color: PRIMARY_MAIN, fontWeight: 700 },
  },
} as const;

const EditLocationModal = ({ open, onClose, location }: Props) => {
  const { mutate: updateLocation, isPending } = useUpdateLocation();

  const form = useForm<FormValues>({
    defaultValues: {
      name: '',
      address: '',
      lat: null,
      lon: null,
      suite: '',
      phone: '',
    },
  });

  const addressError = form.formState.errors.address?.message;
  const watchedAddress = form.watch('address');
  const watchedLat = form.watch('lat');
  const watchedLon = form.watch('lon');

  useEffect(() => {
    if (location) {
      form.reset({
        name: location.name,
        address: location.address,
        lat: location.latitude ?? null,
        lon: location.longitude ?? null,
        suite: location.suite ?? '',
        phone: location.phone ?? '',
      });
    }
  }, [location, form]);

  const onSubmit = (values: FormValues) => {
    if (!location) return;
    if (values.lat === null || values.lon === null) {
      form.setError('address', { message: 'Please select an address from the suggestions' });
      return;
    }

    const payload: UpdateLocationInput = {
      name: values.name,
      address: values.address,
      lat: values.lat,
      lon: values.lon,
      suite: values.suite || null,
      phone: values.phone || null,
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
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden', m: { xs: 1.5, sm: 4 } } }}
    >
      {/* ── Hero header ─────────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          background: GRADIENT_HERO,
          px: { xs: 2.5, sm: 3 },
          pt: 3,
          pb: 3.25,
          color: 'white',
          overflow: 'hidden',
        }}
      >
        {/* decorative glow orbs */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute', top: -60, right: -40, width: 180, height: 180,
            borderRadius: '50%', bgcolor: ALPHA_WHITE_10, filter: 'blur(8px)', pointerEvents: 'none',
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: 'absolute', bottom: -70, left: -30, width: 140, height: 140,
            borderRadius: '50%', bgcolor: ALPHA_WHITE_10, filter: 'blur(6px)', pointerEvents: 'none',
          }}
        />
        <Stack direction='row' alignItems='flex-start' justifyContent='space-between' sx={{ position: 'relative' }}>
          <Stack direction='row' alignItems='center' spacing={1.75}>
            <MotionBox
              initial={{ scale: 0.8, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 20 }}
              sx={{
                width: 40, height: 40, borderRadius: 2, flexShrink: 0,
                background: `linear-gradient(135deg, ${ALPHA_WHITE_30} 0%, ${ALPHA_WHITE_10} 100%)`,
                border: `1px solid ${ALPHA_WHITE_30}`,
                boxShadow: `inset 0 1px 1px ${ALPHA_WHITE_30}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <LocationOn sx={{ fontSize: 20 }} />
            </MotionBox>
            <Box>
              <Typography fontWeight={800} sx={{ fontSize: '1.05rem', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
                Edit Location
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', opacity: 0.82, mt: 0.25 }}>
                Update branch details
              </Typography>
            </Box>
          </Stack>
          <IconButton
            size='small'
            onClick={onClose}
            sx={{
              color: 'white', bgcolor: ALPHA_WHITE_15, border: `1px solid ${ALPHA_WHITE_20}`,
              transition: 'background-color 0.15s ease',
              '&:hover': { bgcolor: ALPHA_WHITE_30 },
            }}
          >
            <Close fontSize='small' />
          </IconButton>
        </Stack>
      </Box>

      {/* ── Form body ───────────────────────────────── */}
      <Stack
        spacing={2.25}
        component='form'
        id='edit-location-form'
        onSubmit={form.handleSubmit(onSubmit)}
        sx={{ px: { xs: 2.5, sm: 3 }, pt: 3.25, pb: 3.25 }}
      >
        {/* Location Details Group */}
        <Stack spacing={2}>
          <Controller
            name='name'
            control={form.control}
            rules={{ required: 'Branch name is required' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label='Branch Name'
                placeholder='e.g. Downtown Flagship'
                fullWidth
                size='small'
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                sx={fieldSx}
              />
            )}
          />

          <Box>
            <Box sx={fieldSx}>
              <AddressAutoComplete
                label='Address'
                size='small'
                value={watchedAddress && watchedLat !== null && watchedLon !== null
                  ? { label: watchedAddress, lat: watchedLat, lon: watchedLon }
                  : null}
                onSelect={(option) => {
                  form.setValue('address', option?.label ?? '');
                  form.setValue('lat', option?.lat ?? null);
                  form.setValue('lon', option?.lon ?? null);
                  if (option?.lat) form.clearErrors('address');
                }}
              />
            </Box>
            {addressError && (
              <FormHelperText error sx={{ ml: 1.75, mt: 0.5, fontWeight: 600 }}>
                {addressError}
              </FormHelperText>
            )}
          </Box>
        </Stack>

        {/* ── Suite + phone ───────────────────────────── */}
        <Stack direction='row' spacing={1.5}>
          <Controller
            name='suite'
            control={form.control}
            render={({ field }) => (
              <TextField {...field} label='Suite / unit (optional)' fullWidth size='small' sx={fieldSx} />
            )}
          />
          <Controller
            name='phone'
            control={form.control}
            render={({ field }) => (
              <TextField
                {...field}
                label='Phone'
                placeholder='(302) 555-0142'
                fullWidth
                size='small'
                InputProps={{ startAdornment: (<InputAdornment position='start'><PhoneOutlined sx={{ color: TEXT_TERTIARY, fontSize: 18 }} /></InputAdornment>) }}
                sx={fieldSx}
              />
            )}
          />
        </Stack>

        {/* ── Actions ──────────────────────────────── */}
        <Stack direction='row' spacing={1.5} pt={1.25}>
          <Button
            variant='outlined'
            onClick={onClose}
            disabled={isPending}
            sx={{
              flex: 1, fontWeight: 700, py: 1.4, textTransform: 'none', whiteSpace: 'nowrap',
              fontSize: { xs: '0.85rem', sm: '0.9rem' }, borderColor: BORDER_SUBTLE, color: TEXT_SECONDARY,
              transition: 'all 0.2s ease',
              '&:hover': { borderColor: PRIMARY_MAIN, color: PRIMARY_MAIN, bgcolor: ALPHA_PRIMARY_04 },
            }}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            form='edit-location-form'
            variant='contained'
            disabled={isPending}
            startIcon={!isPending ? <LocationOn sx={{ fontSize: 18 }} /> : undefined}
            sx={{
              flex: 1.4, fontWeight: 800, py: 1.4, textTransform: 'none', whiteSpace: 'nowrap',
              fontSize: { xs: '0.85rem', sm: '0.9rem' },
              background: GRADIENT_PRIMARY,
              boxShadow: SHADOW_PRIMARY_SOFT,
              '&:hover': { boxShadow: `0 8px 22px ${ALPHA_PRIMARY_20}` },
              '&.Mui-disabled': { background: GRADIENT_PRIMARY, opacity: 0.6, color: 'white' },
            }}
          >
            {isPending ? <CircularProgress size={20} color='inherit' /> : 'Save'}
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  );
};

export default EditLocationModal;
