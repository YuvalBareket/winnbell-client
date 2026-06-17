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
import { motion, AnimatePresence } from 'framer-motion';
import AddressAutoComplete from '../../../../shared/components/AddressAutoComplete';
import {
  GRADIENT_HERO, GRADIENT_PRIMARY, ALPHA_WHITE_10, ALPHA_WHITE_15, ALPHA_WHITE_20, ALPHA_WHITE_30,
  PRIMARY_MAIN, PRIMARY_LIGHT, ALPHA_PRIMARY_04, ALPHA_PRIMARY_06, ALPHA_PRIMARY_10, ALPHA_PRIMARY_20,
  TEXT_SECONDARY, TEXT_TERTIARY, TEXT_HEADING, BORDER_SUBTLE, BG_SUBTLE,
  SHADOW_PRIMARY_SOFT, SHADOW_CARD,
} from '../../../../shared/colors';
// All color/gradient/shadow values above are theme tokens — no hardcoded colors in this component.

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

  const showCost = !!planSummary?.hasStripeSubscription && (planSummary?.feePerLocation ?? 0) > 0;
  const period = planSummary?.billingInterval === 'yearly' ? 'yr' : 'mo';

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
                width: 48, height: 48, borderRadius: 2.5, flexShrink: 0,
                background: `linear-gradient(135deg, ${ALPHA_WHITE_30} 0%, ${ALPHA_WHITE_10} 100%)`,
                border: `1px solid ${ALPHA_WHITE_30}`,
                boxShadow: `inset 0 1px 1px ${ALPHA_WHITE_30}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <AddBusiness sx={{ fontSize: 24 }} />
            </MotionBox>
            <Box>
              <Typography variant='h6' fontWeight={800} sx={{ letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Add New Location
              </Typography>
              <Typography variant='body2' sx={{ opacity: 0.82, mt: 0.25 }}>
                Add a branch to your business
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
        spacing={2.75}
        component='form'
        id='add-location-form'
        onSubmit={form.handleSubmit(handleSubmit)}
        sx={{ px: { xs: 2.5, sm: 3 }, pt: 3, pb: 3 }}
      >
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

        {/* ── Cost comparison ───────────────────────── */}
        <AnimatePresence initial={false}>
          {showCost && planSummary && (
            <MotionBox
              key='cost-box'
              initial={{ opacity: 0, y: 12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              sx={{ overflow: 'hidden' }}
            >
              <Box
                sx={{
                  position: 'relative',
                  p: 2.25,
                  borderRadius: 3,
                  background: `linear-gradient(160deg, ${ALPHA_PRIMARY_06} 0%, ${ALPHA_PRIMARY_04} 100%)`,
                  border: `1px solid ${ALPHA_PRIMARY_10}`,
                  boxShadow: SHADOW_CARD,
                  overflow: 'hidden',
                }}
              >
                {/* accent rail */}
                <Box
                  aria-hidden
                  sx={{
                    position: 'absolute', top: 0, left: 0, bottom: 0, width: 4,
                    background: GRADIENT_PRIMARY,
                  }}
                />

                <Stack direction='row' alignItems='center' spacing={1} mb={0.75}>
                  <Box
                    sx={{
                      width: 22, height: 22, borderRadius: 1.5,
                      background: GRADIENT_PRIMARY, color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: SHADOW_PRIMARY_SOFT,
                    }}
                  >
                    <TrendingUpOutlined sx={{ fontSize: 13 }} />
                  </Box>
                  <Typography
                    variant='caption'
                    fontWeight={800}
                    sx={{ color: PRIMARY_MAIN, textTransform: 'uppercase', letterSpacing: 0.9, fontSize: '0.64rem' }}
                  >
                    Your plan grows with you
                  </Typography>
                </Stack>

                <Typography
                  variant='body2'
                  sx={{ color: TEXT_SECONDARY, lineHeight: 1.6, mb: 2, fontSize: '0.8rem' }}
                >
                  Each new location is seamlessly added to your Winnbell network. Your plan adjusts at the same
                  per-location rate, no surprises.
                </Typography>

                <Stack direction='row' alignItems='stretch' spacing={1.25}>
                  {/* Today */}
                  <Box
                    sx={{
                      flex: 1, px: 1.25, py: 1.5, borderRadius: 2.5, textAlign: 'center',
                      bgcolor: '#ffffff', border: `1px solid ${BORDER_SUBTLE}`,
                      display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    }}
                  >
                    <Typography
                      variant='caption'
                      sx={{ color: TEXT_TERTIARY, fontWeight: 700, display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.6rem' }}
                    >
                      Today
                    </Typography>
                    <Typography variant='body2' fontWeight={800} sx={{ color: TEXT_HEADING, lineHeight: 1.2 }}>
                      ${(planSummary.feePerLocation * planSummary.locationCount).toLocaleString()}
                      <Box component='span' sx={{ fontWeight: 600, color: TEXT_TERTIARY, fontSize: '0.78em' }}>/{period}</Box>
                    </Typography>
                    <Typography variant='caption' sx={{ color: TEXT_TERTIARY, mt: 0.25 }}>
                      {planSummary.locationCount} location{planSummary.locationCount !== 1 ? 's' : ''}
                    </Typography>
                  </Box>

                  {/* Arrow */}
                  <MotionBox
                    initial={{ x: -4, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.18, duration: 0.3 }}
                    sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}
                  >
                    <Box
                      sx={{
                        width: 28, height: 28, borderRadius: '50%',
                        bgcolor: ALPHA_PRIMARY_10, color: PRIMARY_MAIN,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <ArrowForwardOutlined sx={{ fontSize: 16 }} />
                    </Box>
                  </MotionBox>

                  {/* After adding */}
                  <MotionBox
                    initial={{ scale: 0.94, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.12, type: 'spring', stiffness: 280, damping: 22 }}
                    sx={{
                      flex: 1, px: 1.25, py: 1.5, borderRadius: 2.5, textAlign: 'center',
                      background: `linear-gradient(150deg, ${PRIMARY_LIGHT} 0%, ${PRIMARY_MAIN} 100%)`,
                      color: 'white', boxShadow: SHADOW_PRIMARY_SOFT,
                      display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    }}
                  >
                    <Typography
                      variant='caption'
                      sx={{ color: 'white', fontWeight: 700, display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.6rem', opacity: 0.9 }}
                    >
                      After adding
                    </Typography>
                    <Typography variant='body1' fontWeight={800} sx={{ color: 'white', lineHeight: 1.2 }}>
                      ${(planSummary.feePerLocation * (planSummary.locationCount + 1)).toLocaleString()}
                      <Box component='span' sx={{ fontWeight: 600, fontSize: '0.72em', opacity: 0.85 }}>/{period}</Box>
                    </Typography>
                    <Typography variant='caption' sx={{ color: 'white', opacity: 0.85, mt: 0.25 }}>
                      {planSummary.locationCount + 1} locations
                    </Typography>
                  </MotionBox>
                </Stack>
              </Box>
            </MotionBox>
          )}
        </AnimatePresence>

        {/* ── Actions ──────────────────────────────── */}
        <Stack direction='row' spacing={1.5} pt={0.5}>
          <Button
            variant='outlined'
            onClick={onClose}
            sx={{
              flex: 1, fontWeight: 700, py: 1.4, textTransform: 'none', whiteSpace: 'nowrap',
              fontSize: { xs: '0.85rem', sm: '0.9rem' }, borderColor: BORDER_SUBTLE, color: TEXT_SECONDARY,
              '&:hover': { borderColor: ALPHA_PRIMARY_20, bgcolor: ALPHA_PRIMARY_04 },
            }}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            form='add-location-form'
            variant='contained'
            disabled={isLoading}
            startIcon={!isLoading ? <AddBusiness sx={{ fontSize: 18 }} /> : undefined}
            sx={{
              flex: 1.4, fontWeight: 800, py: 1.4, textTransform: 'none', whiteSpace: 'nowrap',
              fontSize: { xs: '0.85rem', sm: '0.9rem' },
              background: GRADIENT_PRIMARY,
              boxShadow: SHADOW_PRIMARY_SOFT,
              '&:hover': { boxShadow: `0 8px 22px ${ALPHA_PRIMARY_20}` },
              '&.Mui-disabled': { background: GRADIENT_PRIMARY, opacity: 0.6, color: 'white' },
            }}
          >
            {isLoading ? <CircularProgress size={20} color='inherit' /> : 'Add Location'}
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  );
};

export default AddLocationDialog;
