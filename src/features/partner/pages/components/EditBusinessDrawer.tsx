import {
  Drawer,
  Dialog,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Close, LanguageOutlined, StorefrontOutlined } from '@mui/icons-material';
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
  name: string;
  legal_name?: string | null;
  sector: string;
  description: string;
  terms_text: string;
  website_url?: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  business: BusinessSnapshot | null;
}

const editableSectors = Object.keys(BUSINESS_SECTORS).filter((k) => k !== 'Free');

const EditBusinessDrawer = ({ open, onClose, business }: Props) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { mutate: updateBusiness, isPending } = useUpdateBusiness();

  // `values` reactively resets the form when `business` changes (RHF v7 pattern).
  // Replaces the reset-in-effect pattern which caused a one-frame stale display on open.
  const { control, handleSubmit, watch, setValue } = useForm<UpdateBusinessInput>({
    values: business
      ? {
          businessName: business.name,
          businessSector: business.sector,
          description: business.description,
          legal_name: business.legal_name ?? '',
          terms_text: business.terms_text,
          website_url: business.website_url ?? '',
        }
      : { businessName: '', businessSector: '', description: '', legal_name: '', terms_text: '', website_url: '' },
    // A background refetch of the entity must never wipe what the user is typing.
    resetOptions: { keepDirtyValues: true },
  });

  const selectedSector = watch('businessSector');

  const onSubmit = (values: UpdateBusinessInput) => {
    updateBusiness(values, { onSuccess: onClose });
  };

  const content = (
    <>
      {/* Gradient header */}
      <Box sx={{ background: GRADIENT_HERO, px: 3, pt: isDesktop ? 2.5 : 2, pb: 2.5, color: 'white' }}>
        {/* Drag handle - only meaningful on the bottom sheet */}
        {!isDesktop && (
          <Box sx={{ width: 40, height: 4, bgcolor: ALPHA_WHITE_30, borderRadius: 2, mx: 'auto', mb: 2.5 }} />
        )}
        <Stack direction='row' alignItems='flex-start' justifyContent='space-between'>
          <Box>
            <Typography fontWeight={800} sx={{ fontSize: '1.05rem' }}>Business Settings</Typography>
            <Typography sx={{ opacity: 0.8, mt: 0.5, fontSize: '0.8rem' }}>
              Changes are visible to customers browsing your profile.
            </Typography>
          </Box>
          <IconButton size='small' onClick={onClose} sx={{ color: 'white', bgcolor: ALPHA_WHITE_15, mt: -0.5 }}>
            <Close fontSize='small' />
          </IconButton>
        </Stack>
      </Box>

      {/* Form body */}
      <Box sx={{ px: 3, pt: 2.5, pb: 3.5, overflowY: 'auto' }}>
        <Stack spacing={2} component='form' onSubmit={handleSubmit(onSubmit)}>

          {/* Business name + industry share a row on desktop; stacked on mobile. */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
              {/* Business name - the public name shown to customers */}
              <Typography
                variant='body2'
                fontWeight={700}
                color='text.secondary'
                mb={1}
                sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}
              >
                Business name
              </Typography>
              <Controller
                name='businessName'
                control={control}
                rules={{ required: 'Business name is required' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size='small'
                    placeholder="e.g. Joe's Coffee"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <StorefrontOutlined sx={{ color: PRIMARY_MAIN, fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    }}
                    // Label is an external caption above, so name the input for a11y / testing.
                    inputProps={{ 'aria-label': 'Business name' }}
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: '10px' } }}
                  />
                )}
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
          {/* Sector picker: compact dropdown on desktop (the expanding grid took over the
              dialog there); mobile keeps the tap-friendly pill + grid. */}
          <Controller
            name='businessSector'
            control={control}
            rules={{ required: 'Required' }}
            render={({ field, fieldState }) => (
              <Box>
                <Typography
                  variant='body2'
                  fontWeight={700}
                  color='text.secondary'
                  mb={1}
                  sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}
                >
                  Industry
                </Typography>
                {isDesktop ? (
                  <Select
                    {...field}
                    fullWidth
                    displayEmpty
                    error={!!fieldState.error}
                    renderValue={(key: string) => {
                      const s = key ? BUSINESS_SECTORS[key] : null;
                      if (!s) {
                        return <Typography variant='body2' color='text.disabled'>Select industry</Typography>;
                      }
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                          <Box sx={{ display: 'flex', fontSize: 19, color: s.color }}>{s.icon}</Box>
                          <Typography variant='body2' fontWeight={700}>{s.label}</Typography>
                        </Box>
                      );
                    }}
                    MenuProps={{ PaperProps: { sx: { maxHeight: 360, borderRadius: '10px' } } }}
                    sx={{
                      height: 40, // match the Business name TextField (outlined, small)
                      bgcolor: 'white',
                      borderRadius: '10px',
                    }}
                  >
                    {editableSectors.map((key) => {
                      const s = BUSINESS_SECTORS[key];
                      return (
                        <MenuItem key={key} value={key} sx={{ py: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <Box sx={{ display: 'flex', fontSize: 19, color: s.color }}>{s.icon}</Box>
                            <Typography variant='body2' fontWeight={600}>{s.label}</Typography>
                          </Box>
                        </MenuItem>
                      );
                    })}
                  </Select>
                ) : (
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
                          height: 40, // match the Business name TextField (outlined, small)
                          px: 1.75,
                          borderRadius: '10px',
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
                          <Typography variant='body2' fontWeight={700} color='primary.main'>
                            {BUSINESS_SECTORS[selectedSector].label}
                          </Typography>
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
                                  borderRadius: '10px',
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
                )}
                {fieldState.error && (
                  <Typography variant='caption' color='error' sx={{ mt: 0.5, display: 'block' }}>
                    {fieldState.error.message}
                  </Typography>
                )}
              </Box>
            )}
          />
            </Box>
          </Box>

          {/* Legal name - the registered entity name; admin-facing, never shown to customers */}
          <Box>
            <Typography
              variant='body2'
              fontWeight={700}
              color='text.secondary'
              mb={1}
              sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}
            >
              Business legal name
            </Typography>
            <Controller
              name='legal_name'
              control={control}
              rules={{ required: 'Business legal name is required' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  fullWidth
                  size='small'
                  placeholder='Registered legal entity name'
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message ?? 'As registered with the state. Never shown to customers.'}
                  inputProps={{ 'aria-label': 'Business legal name' }}
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: '10px' } }}
                />
              )}
            />
          </Box>

          <Controller
            name='description'
            control={control}
            rules={{ required: 'Required' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                size='small'
                multiline
                rows={3}
                label='About your business'
                placeholder='Describe what you offer...'
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: '10px' } }}
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
                size='small'
                label='Website'
                placeholder='https://yourbusiness.com'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <LanguageOutlined sx={{ color: 'text.disabled', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: '10px' } }}
              />
            )}
          />

          <Stack direction='row' spacing={1.5} pt={1}>
            <Button
              fullWidth
              variant='outlined'
              onClick={onClose}
              disabled={isPending}
              sx={{ fontWeight: 700, py: 1.1, textTransform: 'none', borderRadius: '10px' }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              type='submit'
              variant='contained'
              disabled={isPending}
              startIcon={isPending ? <CircularProgress size={16} color='inherit' /> : null}
              sx={{ fontWeight: 800, py: 1.1, textTransform: 'none', borderRadius: '10px' }}
            >
              {isPending ? 'Saving\u2026' : 'Save Changes'}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </>
  );

  // Desktop: centered dialog (a bottom sheet looks out of place on wide screens).
  // Mobile: bottom drawer.
  if (isDesktop) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '10px',
            overflow: 'hidden',
          },
        }}
      >
        {content}
      </Dialog>
    );
  }

  return (
    <Drawer
      anchor='bottom'
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '10px 10px 0 0',
          maxHeight: '90vh',
          overflow: 'hidden',
        },
      }}
    >
      {content}
    </Drawer>
  );
};

export default EditBusinessDrawer;
