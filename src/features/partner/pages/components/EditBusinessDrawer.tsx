import { useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  MenuItem,
  Divider,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { BUSINESS_SECTORS } from '../../../admin/data';
import { useUpdateBusiness } from '../../hooks/useUpdateBusiness';
import type { UpdateBusinessInput } from '../../types/business.types';

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

  const { control, handleSubmit, reset } = useForm<UpdateBusinessInput>({
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
          borderRadius: '16px 16px 0 0',
          maxHeight: '85vh',
        },
      }}
    >
      <Box sx={{ px: 3, pt: 3, pb: 5 }}>
        {/* Handle bar */}
        <Box
          sx={{
            width: 40,
            height: 4,
            bgcolor: 'divider',
            borderRadius: 2,
            mx: 'auto',
            mb: 3,
          }}
        />

        <Stack direction='row' alignItems='center' justifyContent='space-between' mb={1}>
          <Typography variant='h6' fontWeight={700}>
            Business Settings
          </Typography>
          <IconButton size='small' onClick={onClose}>
            <Close fontSize='small' />
          </IconButton>
        </Stack>

        <Typography variant='body2' color='text.secondary' mb={3}>
          Changes are visible to customers browsing your profile.
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Stack
          spacing={2.5}
          component='form'
          onSubmit={handleSubmit(onSubmit)}
        >
          <Controller
            name='businessSector'
            control={control}
            rules={{ required: 'Required' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                fullWidth
                label='Industry'
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              >
                {editableSectors.map((key) => (
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
              />
            )}
          />

          <Controller
            name='terms_text'
            control={control}
            rules={{ required: 'Required' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                rows={2}
                label='Draw terms'
                placeholder='How can customers earn a ticket?'
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Stack direction='row' spacing={1.5} pt={1}>
            <Button
              fullWidth
              variant='outlined'
              onClick={onClose}
              disabled={isPending}
              sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700 }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              type='submit'
              variant='contained'
              disabled={isPending}
              startIcon={
                isPending ? <CircularProgress size={16} color='inherit' /> : null
              }
              sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700 }}
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
