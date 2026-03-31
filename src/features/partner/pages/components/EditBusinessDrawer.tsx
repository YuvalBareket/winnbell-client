import { useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { BUSINESS_SECTORS } from '../../../admin/data';
import { useUpdateBusiness } from '../../hooks/useUpdateBusiness';
import type { UpdateBusinessInput } from '../../types/business.types';
import {
  GRADIENT_HERO,
  ALPHA_WHITE_15,
  ALPHA_WHITE_30,
  BORDER_LIGHT,
  PRIMARY_MAIN,
} from '../../../../shared/colors';

interface BusinessSnapshot {
  sector: string;
  description: string;
  terms_text: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  business: BusinessSnapshot | null;
}

const editableSectors = Object.keys(BUSINESS_SECTORS).filter((k) => k !== 'Free');

const EditBusinessDrawer = ({ open, onClose, business }: Props) => {
  const { mutate: updateBusiness, isPending } = useUpdateBusiness();

  const { control, handleSubmit, reset, watch, setValue } = useForm<UpdateBusinessInput>({
    defaultValues: {
      businessSector: '',
      description: '',
      terms_text: '',
    },
  });

  useEffect(() => {
    if (business) {
      reset({
        businessSector: business.sector,
        description: business.description,
        terms_text: business.terms_text,
      });
    }
  }, [business, reset]);

  const selectedSector = watch('businessSector');

  const onSubmit = (values: UpdateBusinessInput) => {
    updateBusiness(values, { onSuccess: onClose });
  };

  return (
    <Drawer
      anchor='bottom'
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '20px 20px 0 0',
          maxHeight: '90vh',
          overflow: 'hidden',
        },
      }}
    >
      {/* Gradient header */}
      <Box sx={{ background: GRADIENT_HERO, px: 3, pt: 2, pb: 3, color: 'white' }}>
        <Box sx={{ width: 40, height: 4, bgcolor: ALPHA_WHITE_30, borderRadius: 2, mx: 'auto', mb: 2.5 }} />
        <Stack direction='row' alignItems='flex-start' justifyContent='space-between'>
          <Box>
            <Typography variant='h6' fontWeight={800}>Business Settings</Typography>
            <Typography variant='body2' sx={{ opacity: 0.8, mt: 0.5 }}>
              Changes are visible to customers browsing your profile.
            </Typography>
          </Box>
          <IconButton size='small' onClick={onClose} sx={{ color: 'white', bgcolor: ALPHA_WHITE_15, mt: -0.5 }}>
            <Close fontSize='small' />
          </IconButton>
        </Stack>
      </Box>

      {/* Form body */}
      <Box sx={{ px: 3, pt: 3, pb: 5, overflowY: 'auto' }}>
        <Stack spacing={2.5} component='form' onSubmit={handleSubmit(onSubmit)}>

          {/* Sector chip picker */}
          <Controller
            name='businessSector'
            control={control}
            rules={{ required: 'Required' }}
            render={({ fieldState }) => (
              <Box>
                <Typography
                  variant='body2'
                  fontWeight={700}
                  color='text.secondary'
                  mb={1.5}
                  sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}
                >
                  Industry
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
                  {editableSectors.map((key) => {
                    const s = BUSINESS_SECTORS[key];
                    const active = selectedSector === key;
                    return (
                      <Paper
                        key={key}
                        elevation={0}
                        onClick={() => setValue('businessSector', key, { shouldValidate: true })}
                        sx={{
                          p: 1.5,
                          borderRadius: 3,
                          border: '2px solid',
                          borderColor: active ? PRIMARY_MAIN : BORDER_LIGHT,
                          bgcolor: active ? 'rgba(25,93,230,0.04)' : 'white',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s ease',
                          '&:hover': {
                            borderColor: active ? PRIMARY_MAIN : 'action.active',
                            bgcolor: active ? 'rgba(25,93,230,0.06)' : 'action.hover',
                          },
                        }}
                      >
                        <Box sx={{ fontSize: 24, color: active ? PRIMARY_MAIN : s.color, mb: 0.5 }}>
                          {s.icon}
                        </Box>
                        <Typography variant='caption' fontWeight={active ? 800 : 600} color={active ? 'primary.main' : 'text.secondary'}>
                          {s.label}
                        </Typography>
                      </Paper>
                    );
                  })}
                </Box>
                {fieldState.error && (
                  <Typography variant='caption' color='error' sx={{ mt: 0.5, display: 'block' }}>
                    {fieldState.error.message}
                  </Typography>
                )}
              </Box>
            )}
          />

          <Controller
            name='description'
            control={control}
            rules={{ required: 'Required' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                rows={3}
                label='About your business'
                placeholder='Describe what you offer...'
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' } }}
              />
            )}
          />

          <Stack direction='row' spacing={1.5} pt={1}>
            <Button
              fullWidth
              variant='outlined'
              onClick={onClose}
              disabled={isPending}
              sx={{ borderRadius: 3, fontWeight: 700, py: 1.5, textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              type='submit'
              variant='contained'
              disabled={isPending}
              startIcon={isPending ? <CircularProgress size={16} color='inherit' /> : null}
              sx={{ borderRadius: 3, fontWeight: 800, py: 1.5, textTransform: 'none' }}
            >
              {isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default EditBusinessDrawer;
