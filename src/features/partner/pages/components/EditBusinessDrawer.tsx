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
  InputAdornment,
} from '@mui/material';
import { Close, LocalPhoneOutlined, LanguageOutlined } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
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
  phone?: string | null;
  website_url?: string | null;
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
      phone: '',
      website_url: '',
    },
  });

  useEffect(() => {
    if (business) {
      reset({
        businessSector: business.sector,
        description: business.description,
        terms_text: business.terms_text,
        phone: business.phone ?? '',
        website_url: business.website_url ?? '',
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

          {/* Sector picker with shrink animation */}
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
                <AnimatePresence mode='wait'>
                  {selectedSector && BUSINESS_SECTORS[selectedSector] ? (
                    <motion.div
                      key='selected'
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: '2px solid',
                          borderColor: PRIMARY_MAIN,
                          bgcolor: 'rgba(25,93,230,0.04)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <motion.div
                            initial={{ scale: 0.5, rotate: -15 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 18 }}
                            style={{ fontSize: 26, color: PRIMARY_MAIN, lineHeight: 1 }}
                          >
                            {BUSINESS_SECTORS[selectedSector].icon}
                          </motion.div>
                          <Box>
                            <Typography variant='body2' fontWeight={700} color='primary.main'>
                              {BUSINESS_SECTORS[selectedSector].label}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              Selected industry
                            </Typography>
                          </Box>
                        </Box>
                        <Typography
                          variant='caption'
                          fontWeight={600}
                          color='primary.main'
                          onClick={() => setValue('businessSector', '', { shouldValidate: false })}
                          sx={{ cursor: 'pointer', textDecoration: 'underline', flexShrink: 0 }}
                        >
                          Change
                        </Typography>
                      </Paper>
                    </motion.div>
                  ) : (
                    <motion.div
                      key='grid'
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
                        {editableSectors.map((key, i) => {
                          const s = BUSINESS_SECTORS[key];
                          return (
                            <motion.div
                              key={key}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.03, duration: 0.18, ease: 'easeOut' }}
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.96 }}
                            >
                              <Paper
                                elevation={0}
                                onClick={() => setValue('businessSector', key, { shouldValidate: true })}
                                sx={{
                                  p: 1.5,
                                  borderRadius: 2,
                                  border: '2px solid',
                                  borderColor: BORDER_LIGHT,
                                  bgcolor: 'white',
                                  cursor: 'pointer',
                                  textAlign: 'center',
                                  transition: 'all 0.15s ease',
                                  '&:hover': {
                                    borderColor: 'action.active',
                                    bgcolor: 'action.hover',
                                  },
                                }}
                              >
                                <Box sx={{ fontSize: 24, color: s.color, mb: 0.5 }}>
                                  {s.icon}
                                </Box>
                                <Typography variant='caption' fontWeight={600} color='text.secondary'>
                                  {s.label}
                                </Typography>
                              </Paper>
                            </motion.div>
                          );
                        })}
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
              />
            )}
          />

          {/* Phone */}
          <Controller
            name='phone'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Phone number'
                placeholder='(555) 123-4567'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <LocalPhoneOutlined sx={{ color: 'text.disabled', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
              />
            )}
          />

          {/* Website */}
          <Controller
            name='website_url'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Website'
                placeholder='https://yourbusiness.com'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <LanguageOutlined sx={{ color: 'text.disabled', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
              />
            )}
          />

          <Stack direction='row' spacing={1.5} pt={1}>
            <Button
              fullWidth
              variant='outlined'
              onClick={onClose}
              disabled={isPending}
              sx={{ fontWeight: 700, py: 1.5, textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              type='submit'
              variant='contained'
              disabled={isPending}
              startIcon={isPending ? <CircularProgress size={16} color='inherit' /> : null}
              sx={{ fontWeight: 800, py: 1.5, textTransform: 'none' }}
            >
              {isPending ? 'Saving\u2026' : 'Save Changes'}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default EditBusinessDrawer;
