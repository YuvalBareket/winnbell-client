import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Container,
  IconButton,
  Paper,
  Chip,
  LinearProgress,
  InputAdornment,
} from '@mui/material';
import {
  AddLocation,
  ArrowForward,
  ArrowBack,
  Close,
  Storefront,
  LocationOn,
  CheckCircle,
  ConfirmationNumber,
} from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { BUSINESS_SECTORS } from '../../admin/data';
import type { BusinessSetupInput } from '../types/business.types';
import { useAppSelector } from '../../../store/hook';
import { selectCurrentUser } from '../../../store/selectors/authSelectors';
import AddressAutoComplete from '../../../shared/components/AddressAutoComplete';
import { useBusinessSetup } from '../hooks/useBusinessSetup';
import {
  GRADIENT_HERO,
  ALPHA_WHITE_15,
  ALPHA_WHITE_20,
  ALPHA_WHITE_30,
  ALPHA_WHITE_10,
  BG_PAGE,
  BORDER_LIGHT,
  PRIMARY_MAIN,
} from '../../../shared/colors';

const STEPS = ['Business Info', 'Locations'];

const BusinessProfilePage = () => {
  const user = useAppSelector(selectCurrentUser);
  const [step, setStep] = useState(0);

  const registrationSectors = Object.keys(BUSINESS_SECTORS).filter((k) => k !== 'Free');

  const { control, handleSubmit, setValue, watch, trigger } = useForm({
    defaultValues: {
      businessName: user?.fullName || '',
      businessSector: '',
      description: '',
      terms_text: '',
      locations: [{ name: 'Main Branch', address: '', lat: null, lon: null }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'locations' });
  const { mutate: setupBusiness, isPending } = useBusinessSetup();

  const selectedSector = watch('businessSector');

  const onSubmit = (data: BusinessSetupInput) => {
    setupBusiness(data, {
      onError: (err: unknown) => {
        console.error('Setup failed:', err instanceof Error ? err.message : err);
      },
    });
  };

  const goNext = async () => {
    const valid = await trigger(['businessName', 'businessSector', 'description', 'terms_text']);
    if (valid) setStep(1);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>

      {/* ── Left panel (branding) ── */}
      <Box
        sx={{
          width: { xs: '100%', md: '42%' },
          background: GRADIENT_HERO,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          p: { xs: 4, md: 6 },
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          minHeight: { xs: 220, md: 'auto' },
        }}
      >
        {/* Decorative blobs */}
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', bgcolor: ALPHA_WHITE_15, filter: 'blur(60px)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: '50%', bgcolor: 'rgba(66,165,245,0.2)', filter: 'blur(50px)', pointerEvents: 'none' }} />

        {/* Logo */}
        <Stack direction='row' alignItems='center' spacing={1.5} mb={{ xs: 3, md: 5 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: ALPHA_WHITE_20, border: `1px solid ${ALPHA_WHITE_30}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ConfirmationNumber sx={{ fontSize: 24 }} />
          </Box>
          <Typography variant='h5' fontWeight={900} letterSpacing={-0.5}>Winnbell</Typography>
        </Stack>

        <Typography variant='h3' fontWeight={900} lineHeight={1.15} mb={2} sx={{ display: { xs: 'none', md: 'block' } }}>
          Set Up Your<br />Business
        </Typography>
        <Typography variant='body1' sx={{ opacity: 0.85, lineHeight: 1.7, maxWidth: 320, display: { xs: 'none', md: 'block' } }}>
          You are just a few steps away from appearing on the Winnbell map and issuing tickets to your customers.
        </Typography>

        {/* Step indicators */}
        <Stack spacing={1.5} sx={{ mt: { xs: 0, md: 5 }, display: { xs: 'none', md: 'flex' } }}>
          {STEPS.map((label, i) => (
            <Stack key={i} direction='row' alignItems='center' spacing={1.5}>
              <Box
                sx={{
                  width: 32, height: 32, borderRadius: '50%',
                  bgcolor: i < step ? 'rgba(255,255,255,0.9)' : i === step ? ALPHA_WHITE_30 : ALPHA_WHITE_10,
                  border: `2px solid ${i <= step ? 'rgba(255,255,255,0.9)' : ALPHA_WHITE_20}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
              >
                {i < step
                  ? <CheckCircle sx={{ fontSize: 18, color: PRIMARY_MAIN }} />
                  : <Typography variant='caption' fontWeight={800} sx={{ color: i === step ? 'white' : 'rgba(255,255,255,0.5)' }}>{i + 1}</Typography>
                }
              </Box>
              <Typography variant='body2' fontWeight={i === step ? 800 : 500} sx={{ opacity: i === step ? 1 : 0.6 }}>
                {label}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* ── Right panel (form) ── */}
      <Box
        sx={{
          flex: 1,
          bgcolor: BG_PAGE,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          p: { xs: 3, sm: 4, md: 6 },
          overflowY: 'auto',
        }}
      >
        <Container maxWidth='sm' disableGutters>

          {/* Mobile progress */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3 }}>
            <Stack direction='row' justifyContent='space-between' mb={1}>
              <Typography variant='caption' fontWeight={700} color='text.secondary'>
                Step {step + 1} of {STEPS.length}
              </Typography>
              <Typography variant='caption' fontWeight={700} color='primary.main'>
                {STEPS[step]}
              </Typography>
            </Stack>
            <LinearProgress
              variant='determinate'
              value={(step / (STEPS.length - 1)) * 100}
              sx={{ borderRadius: 2, height: 4 }}
            />
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>

            {/* ── STEP 1: Business Info ── */}
            {step === 0 && (
              <Stack spacing={3}>
                <Box>
                  <Typography variant='h5' fontWeight={800} color='text.primary' mb={0.5}>
                    Tell us about your business
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    This information will be visible to customers on the map.
                  </Typography>
                </Box>

                {/* Business Name */}
                <Controller
                  name='businessName'
                  control={control}
                  rules={{ required: 'Business name is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Business Name'
                      error={!!error}
                      helperText={error?.message}
                      placeholder="e.g. Joe's Coffee"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position='start'>
                            <Storefront sx={{ color: 'text.disabled', fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' } }}
                    />
                  )}
                />

                {/* Sector picker */}
                <Controller
                  name='businessSector'
                  control={control}
                  rules={{ required: 'Please select a sector' }}
                  render={({ fieldState: { error } }) => (
                    <Box>
                      <Typography variant='body2' fontWeight={700} color='text.secondary' mb={1.5} sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                        Industry
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
                        {registrationSectors.map((key) => {
                          const s = BUSINESS_SECTORS[key];
                          const active = selectedSector === key;
                          return (
                            <Paper
                              key={key}
                              elevation={0}
                              onClick={() => setValue('businessSector', key, { shouldValidate: true })}
                              sx={{
                                p: 2,
                                borderRadius: 3,
                                border: '2px solid',
                                borderColor: active ? PRIMARY_MAIN : BORDER_LIGHT,
                                bgcolor: active ? 'rgba(25,93,230,0.04)' : 'white',
                                cursor: 'pointer',
                                textAlign: 'center',
                                transition: 'all 0.15s ease',
                                '&:hover': { borderColor: active ? PRIMARY_MAIN : 'action.active', bgcolor: active ? 'rgba(25,93,230,0.06)' : 'action.hover' },
                              }}
                            >
                              <Box sx={{ fontSize: 28, color: active ? PRIMARY_MAIN : s.color, mb: 0.5 }}>
                                {s.icon}
                              </Box>
                              <Typography variant='caption' fontWeight={active ? 800 : 600} color={active ? 'primary.main' : 'text.secondary'}>
                                {s.label}
                              </Typography>
                            </Paper>
                          );
                        })}
                      </Box>
                      {error && (
                        <Typography variant='caption' color='error' sx={{ mt: 0.5, display: 'block' }}>
                          {error.message}
                        </Typography>
                      )}
                    </Box>
                  )}
                />

                {/* Description */}
                <Controller
                  name='description'
                  control={control}
                  rules={{ required: 'Description is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={3}
                      label='About your business'
                      error={!!error}
                      helperText={error?.message}
                      placeholder='Describe what you offer and what makes you special...'
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' } }}
                    />
                  )}
                />

                {/* Ticket terms */}
                <Controller
                  name='terms_text'
                  control={control}
                  rules={{ required: 'Draw terms are required' }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={2}
                      label='How customers earn tickets'
                      error={!!error}
                      helperText={error?.message || 'e.g. "Spend $20 or more to receive a ticket"'}
                      placeholder='Explain how a customer qualifies for a ticket...'
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' } }}
                    />
                  )}
                />

                <Button
                  fullWidth
                  size='large'
                  variant='contained'
                  endIcon={<ArrowForward />}
                  onClick={goNext}
                  sx={{ py: 1.75, borderRadius: 3, fontWeight: 800, fontSize: '1rem' }}
                >
                  Continue to Locations
                </Button>
              </Stack>
            )}

            {/* ── STEP 2: Locations ── */}
            {step === 1 && (
              <Stack spacing={3}>
                <Box>
                  <Typography variant='h5' fontWeight={800} color='text.primary' mb={0.5}>
                    Add your locations
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Each location will appear as a pin on the Winnbell map.
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  {fields.map((item, index) => (
                    <Paper
                      key={item.id}
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: BORDER_LIGHT,
                        bgcolor: 'white',
                        position: 'relative',
                      }}
                    >
                      <Stack direction='row' alignItems='center' justifyContent='space-between' mb={2}>
                        <Stack direction='row' alignItems='center' spacing={1}>
                          <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: 'rgba(25,93,230,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <LocationOn sx={{ fontSize: 16, color: 'primary.main' }} />
                          </Box>
                          <Typography variant='body2' fontWeight={700} color='text.secondary'>
                            Location {index + 1}
                          </Typography>
                        </Stack>
                        {fields.length > 1 && (
                          <IconButton size='small' onClick={() => remove(index)} sx={{ color: 'error.main' }}>
                            <Close fontSize='small' />
                          </IconButton>
                        )}
                      </Stack>

                      <Stack spacing={2}>
                        <Controller
                          name={`locations.${index}.name` as const}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              size='small'
                              fullWidth
                              label='Branch name'
                              placeholder='e.g. Downtown, Main Branch'
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                          )}
                        />
                        <Controller
                          name={`locations.${index}.address` as const}
                          control={control}
                          rules={{ required: 'Address is required' }}
                          render={({ field: { onChange, value } }) => (
                            <AddressAutoComplete
                              label='Full address'
                              placeholder='Start typing your address...'
                              value={value ? { label: value, lat: 0, lon: 0 } : null}
                              onSelect={(selected) => {
                                onChange(selected?.label || '');
                                setValue(`locations.${index}.lat`, selected?.lat || null);
                                setValue(`locations.${index}.lon`, selected?.lon || null);
                              }}
                            />
                          )}
                        />
                      </Stack>
                    </Paper>
                  ))}
                </Stack>

                <Button
                  variant='outlined'
                  startIcon={<AddLocation />}
                  onClick={() => append({ name: '', address: '', lat: null, lon: null })}
                  sx={{ borderRadius: 2, fontWeight: 700, alignSelf: 'flex-start' }}
                >
                  Add Another Location
                </Button>

                <Stack direction='row' spacing={2}>
                  <Button
                    size='large'
                    variant='outlined'
                    startIcon={<ArrowBack />}
                    onClick={() => setStep(0)}
                    sx={{ borderRadius: 3, fontWeight: 700, flex: 1 }}
                  >
                    Back
                  </Button>
                  <Button
                    size='large'
                    variant='contained'
                    type='submit'
                    disabled={isPending}
                    endIcon={isPending ? undefined : <CheckCircle />}
                    sx={{ borderRadius: 3, fontWeight: 800, flex: 2, py: 1.75 }}
                  >
                    {isPending ? <CircularProgress size={22} color='inherit' /> : 'Complete Setup'}
                  </Button>
                </Stack>

                <Typography variant='caption' color='text.disabled' textAlign='center'>
                  You can add or edit locations later from your business hub.
                </Typography>
              </Stack>
            )}

          </form>
        </Container>
      </Box>
    </Box>
  );
};

export default BusinessProfilePage;
