import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Stack,
  Skeleton,
  Snackbar,
  Alert,
  Dialog,
} from '@mui/material';
import {
  AddBusiness,
  Warning,
  CreditCard,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import AppHeader from '../../../shared/components/AppHeader';
import AppMenuDrawer from '../../../shared/components/AppMenuDrawer';
import { useBusinessData } from '../hooks/useBusinessData';
import { useAddLocation } from '../hooks/useAddLocation';
import { useUpdateBusiness } from '../hooks/useUpdateBusiness';
import { useInviteManager, useRemoveManager } from '../hooks/useInviteManager';
import EditLocationModal from './components/EditLocationModal';
import EditBusinessDrawer from './components/EditBusinessDrawer';
import CampaignCard from './components/CampaignCard';
import LocationCard from './components/LocationCard';
import { useUploadBusinessLogo } from '../hooks/useUploadBusinessLogo';
import AddLocationDialog from './components/AddLocationDialog';
import InviteManagerDialog from './components/InviteManagerDialog';
import RemoveManagerDialog from './components/RemoveManagerDialog';
import BusinessHeroSection from './components/BusinessHeroSection';
import type { BusinessLocation } from '../types/business.types';
import { BUSINESS_SECTORS } from '../../admin/data';
import {
  BG_PAGE,
  ALPHA_WHITE_10,
  ALPHA_WHITE_15,
  GRADIENT_HERO,
} from '../../../shared/colors';

const BusinessHubPage = () => {
  const navigate = useNavigate();
  const { data: business, isLoading, isError } = useBusinessData(true);
  const { mutateAsync: generateInvite, isPending: isInviting } = useInviteManager();
  const { mutate: doRemoveManager, isPending: isRemoving } = useRemoveManager();
  const { mutate: doAddLocation, isPending: isAddingLocation } = useAddLocation();
  const { mutate: updateBusiness, isPending: isUpdatingTerms } = useUpdateBusiness();
  const { upload: uploadLogo, isUploading: isUploadingLogo, error: logoError, clearError: clearLogoError } = useUploadBusinessLogo();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingTerms, setEditingTerms] = useState(false);
  const [termsValue, setTermsValue] = useState('');
  const [editingLocation, setEditingLocation] = useState<BusinessLocation | null>(null);
  const [businessDrawerOpen, setBusinessDrawerOpen] = useState(false);
  const [addLocationOpen, setAddLocationOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [removeManagerLocationId, setRemoveManagerLocationId] = useState<number | null>(null);

  const handleAddLocation = (data: { name: string; address: string; lat: number; lon: number }) => {
    doAddLocation(
      { name: data.name, address: data.address, lat: data.lat, lon: data.lon },
      {
        onSuccess: () => {
          setAddLocationOpen(false);
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


  const handleRemoveManager = () => {
    if (!removeManagerLocationId) return;
    doRemoveManager(removeManagerLocationId, {
      onSuccess: () => {
        setRemoveManagerLocationId(null);
        setSnackbar({ open: true, message: 'Manager removed. Their account has been reset to a regular user.', severity: 'success' });
      },
      onError: () => {
        setRemoveManagerLocationId(null);
        setSnackbar({ open: true, message: 'Failed to remove manager. Try again.', severity: 'error' });
      },
    });
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
      <AppHeader onMenuOpen={() => setMenuOpen(true)} />
      <AppMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      <BusinessHeroSection
        business={business}
        onLogoClick={() => fileInputRef.current?.click()}
        isUploading={isUploadingLogo}
        logoFileInputRef={fileInputRef}
        onFileChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadLogo(file);
          e.target.value = '';
        }}
        onEditClick={() => setBusinessDrawerOpen(true)}
      />

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

          {/* Campaign card */}
          <CampaignCard
            business={business}
            editingTerms={editingTerms}
            setEditingTerms={setEditingTerms}
            termsValue={termsValue}
            setTermsValue={setTermsValue}
            updateBusiness={updateBusiness}
            isUpdatingTerms={isUpdatingTerms}
          />

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
                  <LocationCard
                    key={loc.id}
                    loc={loc}
                    onEdit={setEditingLocation}
                    onInvite={handleGenerateInvite}
                    onRemoveManager={setRemoveManagerLocationId}
                    isInviting={isInviting}
                  />
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

      <AddLocationDialog
        open={addLocationOpen}
        onClose={() => setAddLocationOpen(false)}
        onSubmit={handleAddLocation}
        isLoading={isAddingLocation}
      />

      <EditBusinessDrawer
        open={businessDrawerOpen}
        onClose={() => setBusinessDrawerOpen(false)}
        business={business}
      />

      <InviteManagerDialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        inviteUrl={inviteLink}
        onCopyLink={() => setSnackbar({ open: true, message: 'Link copied to clipboard!', severity: 'success' })}
      />

      <RemoveManagerDialog
        open={!!removeManagerLocationId}
        onClose={() => setRemoveManagerLocationId(null)}
        onConfirm={handleRemoveManager}
        isLoading={isRemoving}
      />

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
      <Snackbar
        open={!!logoError}
        autoHideDuration={4000}
        onClose={clearLogoError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity='error' variant='filled' onClose={clearLogoError} sx={{ width: '100%' }}>
          {logoError}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BusinessHubPage;
