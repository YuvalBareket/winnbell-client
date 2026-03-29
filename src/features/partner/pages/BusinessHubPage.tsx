import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Avatar,
  Button,
  Stack,
  Chip,
  Divider,
  IconButton,
  Skeleton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  Storefront,
  LocationOn,
  Groups,
  Settings,
  Share,
  Verified,
  ChevronRight,
  ReceiptLong,
  Edit,
  AddBusiness,
  Warning,
  CreditCard,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useBusinessData } from '../hooks/useBusinessData';
import { useAddLocation } from '../hooks/useAddLocation';
import { BUSINESS_SECTORS } from '../../admin/data';
import { useInviteManager } from '../hooks/useInviteManager';
import EditLocationModal from './components/EditLocationModal';
import EditBusinessDrawer from './components/EditBusinessDrawer';
import AddressAutoComplete from '../../../shared/components/AddressAutoComplete';
import type { BusinessLocation, UpdateLocationInput } from '../types/business.types';
import {
  BG_PAGE,
  GRADIENT_HERO,
  ALPHA_WHITE_10,
  ALPHA_WHITE_15,
  ALPHA_WHITE_20,
  ALPHA_WHITE_30,
  VERIFIED_BLUE,
} from '../../../shared/colors';

interface AddLocationFormValues {
  name: string;
  address: string;
  lat: number | null;
  lon: number | null;
}

const BusinessHubPage = () => {
  const navigate = useNavigate();
  const { data: business, isLoading, isError } = useBusinessData(true);
  const { mutateAsync: generateInvite, isPending: isInviting } = useInviteManager();
  const { mutate: doAddLocation, isPending: isAddingLocation } = useAddLocation();
  const [editingLocation, setEditingLocation] = useState<BusinessLocation | null>(null);
  const [businessDrawerOpen, setBusinessDrawerOpen] = useState(false);
  const [addLocationOpen, setAddLocationOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  const addLocationForm = useForm<AddLocationFormValues>({
    defaultValues: { name: '', address: '', lat: null, lon: null },
  });

  const handleAddLocation = (values: AddLocationFormValues) => {
    if (!values.lat || !values.lon) return;
    doAddLocation(
      { name: values.name, address: values.address, lat: values.lat, lon: values.lon },
      {
        onSuccess: () => {
          setAddLocationOpen(false);
          addLocationForm.reset();
        },
      },
    );
  };
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleGenerateInvite = async (locId: number) => {
    try {
      const data = await generateInvite(locId);
      setInviteLink(data.inviteLink);
      setInviteDialogOpen(true);
    } catch {
      setSnackbar({ open: true, message: 'Failed to generate invite link. Try again.', severity: 'error' });
    }
  };

  const handleCopyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setSnackbar({ open: true, message: 'Link copied to clipboard!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to copy link.', severity: 'error' });
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ bgcolor: BG_PAGE, minHeight: '100vh' }}>
        {/* Hero skeleton */}
        <Box sx={{ background: GRADIENT_HERO, pt: 3, pb: 9, px: 3 }}>
          <Container maxWidth='md'>
            <Stack direction='row' alignItems='center' spacing={2}>
              <Skeleton variant='rounded' width={64} height={64} sx={{ borderRadius: 2, bgcolor: ALPHA_WHITE_15 }} />
              <Box flex={1}>
                <Skeleton variant='text' width={160} height={28} sx={{ bgcolor: ALPHA_WHITE_15 }} />
                <Skeleton variant='text' width={100} height={20} sx={{ bgcolor: ALPHA_WHITE_10 }} />
              </Box>
            </Stack>
          </Container>
        </Box>
        <Container maxWidth='md' sx={{ mt: -5 }}>
          <Stack spacing={3}>
            <Skeleton variant='rounded' height={72} sx={{ borderRadius: 3 }} />
            <Skeleton variant='rounded' height={140} sx={{ borderRadius: 3 }} />
            <Skeleton variant='rounded' height={140} sx={{ borderRadius: 3 }} />
          </Stack>
        </Container>
      </Box>
    );
  }

  if (isError || !business) {
    return (
      <Container maxWidth='md' sx={{ mt: 10, textAlign: 'center' }}>
        <Typography color='error' variant='h6' fontWeight={700}>Failed to load business profile.</Typography>
        <Typography color='text.secondary' sx={{ mt: 1 }}>Check your connection and try again.</Typography>
      </Container>
    );
  }

  const sectorUI = BUSINESS_SECTORS[business.sector] || BUSINESS_SECTORS.Retail;

  return (
    <Box sx={{ bgcolor: BG_PAGE, minHeight: '100vh', pb: { xs: 12, md: 6 } }}>
      {/* Hero */}
      <Box
        sx={{
          background: GRADIENT_HERO,
          pt: 3,
          pb: 9,
          px: 3,
          color: 'white',
          borderRadius: '0 0 32px 32px',
        }}
      >
        <Container maxWidth='md'>
          <Stack direction='row' alignItems='center' justifyContent='space-between'>
            <Stack direction='row' alignItems='center' spacing={2}>
              <Avatar
                variant='square'
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: ALPHA_WHITE_15,
                  color: 'white',
                  fontWeight: 900,
                  fontSize: 28,
                  borderRadius: 2,
                  border: `1px solid ${ALPHA_WHITE_30}`,
                }}
              >
                {business.name[0]}
              </Avatar>
              <Box>
                <Typography
                  variant='h5'
                  fontWeight={800}
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  {business.name}
                  <Verified sx={{ fontSize: 20, color: VERIFIED_BLUE }} />
                </Typography>
                <Stack direction='row' spacing={1} mt={0.5}>
                  <Chip
                    label={sectorUI.label}
                    size='small'
                    sx={{ bgcolor: ALPHA_WHITE_15, color: 'white', fontWeight: 700, borderRadius: 2 }}
                  />
                  {business.is_active ? (
                    <Chip label='Active Partner' size='small' color='success' sx={{ fontWeight: 700, borderRadius: 2 }} />
                  ) : (
                    <Chip label='Pending Activation' size='small' sx={{ fontWeight: 700, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                  )}
                </Stack>
              </Box>
            </Stack>
            <IconButton
              onClick={() => setBusinessDrawerOpen(true)}
              sx={{ color: 'white', border: `1px solid ${ALPHA_WHITE_20}`, borderRadius: 2 }}
            >
              <Settings />
            </IconButton>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth='md' sx={{ mt: -5 }}>
        <Stack spacing={3}>
          {/* Onboarding banner — shown when not yet subscribed */}
          {!business.is_active && (
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'warning.main',
                bgcolor: 'rgba(237,108,2,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Stack direction='row' alignItems='center' spacing={1.5} flex={1} minWidth={0}>
                <Warning sx={{ color: 'warning.main', flexShrink: 0 }} />
                <Box>
                  <Typography variant='body2' fontWeight={700} color='warning.dark'>
                    Complete your onboarding
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Your business isn't live yet. Subscribe to appear on the map and start issuing tickets.
                  </Typography>
                </Box>
              </Stack>
              <Button
                variant='contained'
                size='small'
                startIcon={<CreditCard />}
                onClick={() => navigate('/subscribe')}
                sx={{ borderRadius: 2, fontWeight: 800, flexShrink: 0, bgcolor: 'warning.main', '&:hover': { bgcolor: 'warning.dark' } }}
              >
                Subscribe Now
              </Button>
            </Paper>
          )}

          {/* Subscription card */}
          <Paper
            elevation={0}
            sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}
          >
            <Stack direction='row' alignItems='center' gap={2}>
              <Box
                sx={{
                  width: 44, height: 44, borderRadius: 2,
                  bgcolor: business.subscription_status === 'Active' ? 'primary.main' : 'action.disabledBackground',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
              >
                <ReceiptLong sx={{ color: business.subscription_status === 'Active' ? 'white' : 'text.disabled', fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant='caption' fontWeight={700} color='text.secondary' sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Subscription Plan
                </Typography>
                <Typography variant='body1' fontWeight={700}>
                  {business.subscription_status ? 'Partner Monthly Plan' : 'No active subscription'}
                </Typography>
                {business.current_period_end && (
                  <Typography variant='caption' color='text.secondary'>
                    {business.cancel_at_period_end
                      ? `Cancels on ${new Date(business.current_period_end).toLocaleDateString()}`
                      : `Renews ${new Date(business.current_period_end).toLocaleDateString()}`}
                  </Typography>
                )}
              </Box>
            </Stack>
            <Stack direction='row' alignItems='center' spacing={1}>
              <Chip
                label={business.subscription_status ?? 'Inactive'}
                size='small'
                sx={{
                  fontWeight: 700,
                  bgcolor: business.subscription_status === 'Active'
                    ? 'rgba(46,125,50,0.1)'
                    : business.subscription_status === 'Past_Due'
                    ? 'rgba(237,108,2,0.1)'
                    : 'action.hover',
                  color: business.subscription_status === 'Active'
                    ? 'success.main'
                    : business.subscription_status === 'Past_Due'
                    ? 'warning.main'
                    : 'text.secondary',
                }}
              />
              {business.subscription_status && (
                <IconButton size='small' onClick={() => navigate('/subscription/manage')}>
                  <ChevronRight fontSize='small' />
                </IconButton>
              )}
            </Stack>
          </Paper>

          {/* Branch Management */}
          <Box>
            <Stack direction='row' alignItems='center' justifyContent='space-between' mb={2}>
              <Typography
                variant='subtitle2'
                fontWeight={800}
                sx={{ ml: 0.5, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}
              >
                Branch Management
              </Typography>
              {business.locations.length > 0 && (
                <Button
                  size='small'
                  variant='outlined'
                  startIcon={<AddBusiness />}
                  onClick={() => setAddLocationOpen(true)}
                  sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                >
                  Add Location
                </Button>
              )}
            </Stack>

            {business.locations.length === 0 ? (
              <Paper
                elevation={0}
                sx={{ p: 4, borderRadius: 3, textAlign: 'center', border: '1px dashed', borderColor: 'divider' }}
              >
                <AddBusiness sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography variant='subtitle1' fontWeight={700} color='text.secondary'>No locations yet</Typography>
                <Typography variant='body2' color='text.disabled' sx={{ mt: 0.5 }}>
                  Add your first branch to start issuing tickets.
                </Typography>
                <Button
                  variant='contained'
                  onClick={() => setAddLocationOpen(true)}
                  sx={{ mt: 3, borderRadius: 2, fontWeight: 800, textTransform: 'none', px: 4 }}
                >
                  Add Location
                </Button>
              </Paper>
            ) : (
              <Box sx={{ display: { xs: 'flex', md: 'grid' }, flexDirection: 'column', gridTemplateColumns: { md: '1fr 1fr' }, gap: 2 }}>
                {business.locations.map((loc: BusinessLocation) => (
                  <Paper
                    key={loc.id}
                    elevation={0}
                    sx={{ p: 2.5, borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}
                  >
                    <Stack direction='row' justifyContent='space-between' alignItems='flex-start'>
                      <Box flex={1} minWidth={0}>
                        <Typography variant='h6' fontWeight={700}>{loc.name}</Typography>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}
                        >
                          <LocationOn sx={{ fontSize: 16, flexShrink: 0 }} />
                          {loc.address}
                        </Typography>
                      </Box>
                      <Stack direction='row' alignItems='center' ml={1}>
                        <IconButton sx={{ width: 44, height: 44 }} onClick={() => setEditingLocation(loc)} aria-label='Edit location'>
                          <Edit fontSize='small' />
                        </IconButton>
                        <IconButton sx={{ width: 44, height: 44 }} onClick={() => navigate('/scan')} aria-label='Generate tickets'>
                          <ChevronRight />
                        </IconButton>
                      </Stack>
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Stack direction='row' justifyContent='space-between' alignItems='center'>
                      <Stack direction='row' spacing={1} alignItems='center'>
                        <Groups
                          sx={{ fontSize: 20, color: loc.manager_id ? 'success.main' : 'text.disabled' }}
                        />
                        <Typography
                          variant='body2'
                          fontWeight={700}
                          color={loc.manager_id ? 'text.primary' : 'text.disabled'}
                        >
                          {loc.manager_name || (loc.manager_id ? 'Manager Assigned' : 'Unassigned')}
                        </Typography>
                      </Stack>
                      {!loc.manager_id && (
                        <Button
                          variant='outlined'
                          size='small'
                          startIcon={<Share />}
                          disabled={isInviting}
                          onClick={() => handleGenerateInvite(loc.id)}
                          sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none', px: 2 }}
                        >
                          {isInviting ? 'Generating...' : 'Invite Manager'}
                        </Button>
                      )}
                    </Stack>
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        </Stack>
      </Container>

      <EditLocationModal
        open={!!editingLocation}
        onClose={() => setEditingLocation(null)}
        location={editingLocation}
      />

      {/* Add Location Dialog */}
      <Dialog open={addLocationOpen} onClose={() => setAddLocationOpen(false)} maxWidth='sm' fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Add New Location</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2.5} component='form' id='add-location-form' onSubmit={addLocationForm.handleSubmit(handleAddLocation)}>
            <Controller
              name='name'
              control={addLocationForm.control}
              rules={{ required: 'Branch name is required' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label='Branch Name'
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  sx={{ mt: 1 }}
                />
              )}
            />
            <AddressAutoComplete
              label='Address'
              defaultValue={null}
              onSelect={(option) => {
                addLocationForm.setValue('address', option?.label ?? '');
                addLocationForm.setValue('lat', option?.lat ?? null);
                addLocationForm.setValue('lon', option?.lon ?? null);
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setAddLocationOpen(false)} sx={{ borderRadius: 2, fontWeight: 700 }}>Cancel</Button>
          <Button
            type='submit'
            form='add-location-form'
            variant='contained'
            disabled={isAddingLocation}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            {isAddingLocation ? <CircularProgress size={20} color='inherit' /> : 'Add Location'}
          </Button>
        </DialogActions>
      </Dialog>

      <EditBusinessDrawer
        open={businessDrawerOpen}
        onClose={() => setBusinessDrawerOpen(false)}
        business={business}
      />

      <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Manager Invite Link</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            Share this link with the manager to invite them:
          </Typography>
          <TextField
            fullWidth
            value={inviteLink}
            InputProps={{ readOnly: true }}
            variant='outlined'
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <Typography variant='caption' color='text.secondary'>
            They can use this link to set up their account and manage your location.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ gap: 1, p: 2 }}>
          <Button onClick={() => setInviteDialogOpen(false)} sx={{ borderRadius: 2 }}>
            Close
          </Button>
          <Button
            variant='contained'
            onClick={handleCopyInviteLink}
            sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none' }}
          >
            Copy Link
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          variant='filled'
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BusinessHubPage;
