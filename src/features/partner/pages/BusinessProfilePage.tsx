import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Stack,
  InputAdornment,
  Container,
  IconButton,
  Paper,
  Divider,
} from '@mui/material';
import {
  Category,
  Description,
  AddLocation,
  Delete,
  Map,
  ArrowForward,
  Close,
  Storefront,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { BUSINESS_SECTORS } from '../../admin/data';
import type { BusinessSetupInput } from '../types/business.types';
import { useAppSelector } from '../../../store/hook';
import { selectCurrentUser } from '../../../store/selectors/authSelectors';
import AddressAutoComplete from '../../../shared/components/AddressAutoComplete';
import { useBusinessSetup } from '../hooks/useBusinessSetup';

const BusinessProfilePage = () => {
  const user = useAppSelector(selectCurrentUser);
  const navigate = useNavigate();

  const registrationSectors = Object.keys(BUSINESS_SECTORS).filter(
    (key) => key !== 'Free',
  );

  // 1. Setup Form with field array for locations
  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      businessName: user?.fullName || '',
      businessSector: '',
      description: '',
      terms_text: '',
      locations: [{ name: 'Main Branch', address: '', lat: null, lon: null }],
    },
  });
  // 2. This hook manages the dynamic list of addresses
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'locations',
  });

  const { mutate: setupBusiness, isPending } = useBusinessSetup();

  const onSubmit = (data: BusinessSetupInput) => {
    setupBusiness(data, {
      onError: (err: unknown) => {
        const message =
          err instanceof Error ? err.message : 'Setup failed';
        console.error('Setup failed:', message);
      },
    });
  };
  return (
    <Box sx={{ minHeight: '100vh', pb: 2 }}>
      <Container maxWidth='xs'>
        <Box sx={{ pt: 6, mb: 4, textAlign: 'center' }}>
          <Typography variant='h4' sx={{ fontWeight: 700, mb: 1 }}>
            Business Details
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Tell us about your business and where customers can find you.
          </Typography>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={4}>
            {/* --- SECTION 1: IDENTITY --- */}
            <Stack spacing={1.5}>
              <Controller
                name='businessName'
                control={control}
                rules={{ required: 'Required' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Business Name'
                    error={!!error}
                    placeholder='Your business name...'
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <Storefront color='action' fontSize='small' />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
              <Controller
                name='businessSector'
                control={control}
                rules={{ required: 'Required' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label='Industry'
                    error={!!error}
                  >
                    {registrationSectors.map((key) => (
                      <MenuItem key={key} value={key}>
                        {BUSINESS_SECTORS[key].label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />

              <Controller
                name='description'
                control={control}
                rules={{ required: 'Required' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    label='Tell us about you'
                    error={!!error}
                    placeholder='Describe what you offer...'
                  />
                )}
              />
              <Controller
                name='terms_text'
                control={control}
                rules={{ required: 'Required' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={1}
                    label='Your draw terms'
                    error={!!error}
                    placeholder='Describe how your costumers can get a ticket...'
                  />
                )}
              />
            </Stack>

            <Divider sx={{ my: 1 }} />

            {/* --- SECTION 2: LOCATIONS --- */}
            <Box>
              <Typography
                variant='h6'
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Map color='primary' fontSize='small' /> Store Locations
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                Add your business locations so users can see them on the map.
              </Typography>

              <Stack spacing={2}>
                {fields.map((item, index) => (
                  <Paper
                    key={item.id}
                    variant='outlined'
                    sx={{
                      p: 2,
                      borderRadius: 0.9,
                      position: 'relative',
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Stack spacing={2}>
                      <Controller
                        name={`locations.${index}.name` as const}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            size='small'
                            fullWidth
                            label='Branch Name (e.g. Downtown)'
                          />
                        )}
                      />
                      <Controller
                        name={`locations.${index}.address` as const}
                        control={control}
                        rules={{ required: 'Address is required' }}
                        render={({ field: { onChange, value } }) => (
                          <AddressAutoComplete
                            label='Full Address'
                            placeholder='Start typing...'
                            value={
                              value ? { label: value, lat: 0, lon: 0 } : null
                            }
                            onSelect={(selectedOption) => {
                              // 1. This updates the "address" field (what the user sees)
                              onChange(selectedOption?.label || '');

                              // 2. These manually update the lat/lon fields for this specific index
                              // because they aren't directly "wrapped" by this Controller
                              setValue(
                                `locations.${index}.lat`,
                                selectedOption?.lat || null,
                              );
                              setValue(
                                `locations.${index}.lon`,
                                selectedOption?.lon || null,
                              );
                            }}
                          />
                        )}
                      />
                    </Stack>

                    {fields.length > 1 && (
                      <IconButton
                        onClick={() => remove(index)}
                        sx={{ position: 'absolute', top: -4, right: -5 }}
                        color='error'
                        size='small'
                      >
                        <Close fontSize='small' />
                      </IconButton>
                    )}
                  </Paper>
                ))}
              </Stack>

              <Button
                startIcon={<AddLocation />}
                onClick={() => append({ name: '', address: '' })}
                sx={{ mt: 2, fontWeight: 700 }}
              >
                Add Another Location
              </Button>
            </Box>

            {/* --- SUBMIT --- */}
            <Button
              fullWidth
              size='large'
              variant='contained'
              type='submit'
              sx={{
                py: 2,
                borderRadius: 3,
                fontSize: '1.1rem',
                fontWeight: 700,
              }}
            >
              Complete Setup
            </Button>
          </Stack>
        </form>
      </Container>
    </Box>
  );
};

export default BusinessProfilePage;
