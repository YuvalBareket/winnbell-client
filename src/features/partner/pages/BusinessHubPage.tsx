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
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  AddBusiness,
  Warning,
  CreditCard,
  PreviewOutlined,
  AccountBalanceWalletOutlined,
  ArrowForwardOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import AppHeader from '../../../shared/components/AppHeader';
import AppMenuDrawer from '../../../shared/components/AppMenuDrawer';
import { useBusinessData } from '../hooks/useBusinessData';
import { useAddLocation } from '../hooks/useAddLocation';
import { useRemoveLocation } from '../hooks/useRemoveLocation';
import { useInviteManager, useRemoveManager } from '../hooks/useInviteManager';
import { useSubscription } from '../../../features/subscription/hooks/useSubscription';
import EditLocationModal from './components/EditLocationModal';
import EditBusinessDrawer from './components/EditBusinessDrawer';
import CampaignCard from './components/CampaignCard';
import LocationCard from './components/LocationCard';
import { useUploadBusinessLogo } from '../hooks/useUploadBusinessLogo';
import { useUpdateCampaignSettings } from '../hooks/useUpdateCampaignSettings';
import AddLocationDialog from './components/AddLocationDialog';
import InviteManagerDialog from './components/InviteManagerDialog';
import RemoveManagerDialog from './components/RemoveManagerDialog';
import BusinessHeroSection from './components/BusinessHeroSection';
import LogoCropDialog from './components/LogoCropDialog';
import MapBusinessPopup from '../../nearBy/components/MapBusinessPopup';
import type { BusinessLocation } from '../types/business.types';
import type { NearbyLocation } from '../../nearBy/types/nearBy.types';
import {
  ALPHA_WHITE_10,
  ALPHA_WHITE_15,
  GRADIENT_HERO,
  MOBILE_CONTENT_HEIGHT,
  STATUS_ACTIVATED_BG,
  STATUS_ACTIVATED_TEXT,
  ALPHA_GREEN_10,
  TEXT_SECONDARY,
  TEXT_TERTIARY,
  TEXT_HEADING,
} from '../../../shared/colors';

const BusinessHubPage = () => {
  const navigate = useNavigate();
  const { data: business, isLoading, isError } = useBusinessData(true);
  const { data: subscription } = useSubscription();
  const { mutateAsync: generateInvite, isPending: isInviting } = useInviteManager();
  const { mutate: doRemoveManager, isPending: isRemoving } = useRemoveManager();
  const { mutate: doAddLocation, isPending: isAddingLocation } = useAddLocation();
  const { mutate: doRemoveLocation, isPending: isRemovingLocation } = useRemoveLocation();
  const { mutate: updateCampaignSettings, isPending: isUpdatingSettings } = useUpdateCampaignSettings();
  const { upload: uploadLogo, isUploading: isUploadingLogo, error: logoError, clearError: clearLogoError } = useUploadBusinessLogo();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<BusinessLocation | null>(null);
  const [businessDrawerOpen, setBusinessDrawerOpen] = useState(false);
  const [addLocationOpen, setAddLocationOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [removeManagerLocationId, setRemoveManagerLocationId] = useState<number | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [removingLocation, setRemovingLocation] = useState<BusinessLocation | null>(null);

  const activeLocations = (business?.locations ?? []).filter((l) => l.is_active);

  const planSummary = subscription ? {
    feePerLocation: subscription.fee_at_entry ?? 0,
    locationCount: subscription.active_location_count ?? 0,
    billingInterval: subscription.billing_interval,
    hasStripeSubscription: !!subscription.stripe_subscription_id,
  } : null;
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleAddLocation = (data: { name: string; address: string; lat: number; lon: number }) => {
    doAddLocation(
      { name: data.name, address: data.address, lat: data.lat, lon: data.lon },
      {
        onSuccess: () => {
          setAddLocationOpen(false);
          setSnackbar({ open: true, message: 'Location added and plan updated.', severity: 'success' });
        },
        onError: (err: unknown) => {
          setAddLocationOpen(false);
          const msg = (err as any)?.response?.data?.message;
          setSnackbar({ open: true, message: msg || 'Failed to add location. Plan update may have failed.', severity: 'error' });
        },
      },
    );
  };

  const handleConfirmRemoveLocation = () => {
    if (!removingLocation) return;
    const loc = removingLocation;
    setRemovingLocation(null);
    doRemoveLocation(loc.id, {
      onSuccess: () => {
        setSnackbar({ open: true, message: 'Location removed and plan updated.', severity: 'success' });
      },
      onError: (err: unknown) => {
        const msg = (err as any)?.response?.data?.message;
        setSnackbar({ open: true, message: msg || 'Failed to remove location. Plan update may have failed.', severity: 'error' });
      },
    });
  };

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
      <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: '100dvh' } }}>
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
            <Skeleton variant='rounded' height={72} sx={{ borderRadius: 2 }} />
            <Skeleton variant='rounded' height={140} sx={{ borderRadius: 2 }} />
            <Skeleton variant='rounded' height={140} sx={{ borderRadius: 2 }} />
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

  return (
    <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: '100dvh' }, pb: { xs: 12, md: 6 } }}>
      <AppHeader onMenuOpen={() => setMenuOpen(true)} />
      <AppMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      <BusinessHeroSection
        business={business}
        onLogoClick={() => fileInputRef.current?.click()}
        isUploading={isUploadingLogo}
        logoFileInputRef={fileInputRef}
        onFileChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => setCropSrc(reader.result as string);
          reader.readAsDataURL(file);
          e.target.value = '';
        }}
        onEditClick={() => setBusinessDrawerOpen(true)}
      />

      <Container maxWidth='md' sx={{ mt: -5 }}>
        <Stack spacing={3}>
          {/* Onboarding banner - shown when not yet subscribed, desktop only */}
          {!business.is_subscribed && (
            <Paper
              elevation={3}
              sx={{
                display: 'flex',
                p: 2.5,
                borderRadius: 2,
                border: '1px solid #00000021',
                backgroundColor:'white',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Stack direction='row' alignItems='center' spacing={1.5} flex={1} minWidth={0}>
                <Warning sx={{ color: 'warning.main', flexShrink: 0 }} />
                <Box minWidth={0}>
                  <Typography variant='body2' fontWeight={700} color='warning.dark'>
                    Complete your onboarding
                  </Typography>
                  <Typography variant='caption' color='text.secondary' sx={{ display: { xs: 'none', sm: 'block' } }}>
                    Your business isn't live yet. Start a campaign to appear on the map and begin issuing entries.
                  </Typography>
                  <Typography variant='caption' color='text.secondary' sx={{ display: { xs: 'block', sm: 'none' } }}>
                    Start a campaign to go live on the map
                  </Typography>
                </Box>
              </Stack>
              <Button
                variant='contained'
                size='small'
                startIcon={<CreditCard sx={{ display: { xs: 'none', sm: 'inline-flex' } }} />}
                onClick={() => navigate('/subscribe')}
                sx={{ borderRadius: 2, fontWeight: 800, flexShrink: 0, bgcolor: 'warning.main', '&:hover': { bgcolor: 'warning.dark' } }}
              >
                Start Campaign
              </Button>
            </Paper>
          )}

          {/* Profile Preview button */}
          <Paper
            elevation={0}
            sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}
          >
            <Box>
              <Typography variant='body2' fontWeight={700}>Public Profile Preview</Typography>
              <Typography variant='caption' color='text.secondary'>See how customers find you on the Winnbell map</Typography>
            </Box>
            <Button
              variant='outlined'
              size='small'
              startIcon={<PreviewOutlined />}
              onClick={() => setPreviewOpen(true)}
              sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', flexShrink: 0 }}
            >
              Preview
            </Button>
          </Paper>

          {/* Campaign card */}
          <CampaignCard
            business={business}
            updateCampaignSettings={updateCampaignSettings}
            isUpdatingSettings={isUpdatingSettings}
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
              {activeLocations.length > 0 && (
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

            {activeLocations.length === 0 ? (
              <Paper
                elevation={0}
                sx={{ p: 4, borderRadius: 2, textAlign: 'center', border: '1px dashed', borderColor: 'divider' }}
              >
                <AddBusiness sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography variant='subtitle1' fontWeight={700} color='text.secondary'>No locations yet</Typography>
                <Typography variant='body2' color='text.disabled' sx={{ mt: 0.5 }}>
                  Add your first branch to start issuing entries.
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
                {activeLocations.map((loc: BusinessLocation) => (
                  <LocationCard
                    key={loc.id}
                    loc={loc}
                    onEdit={setEditingLocation}
                    onRemove={setRemovingLocation}
                    onInvite={handleGenerateInvite}
                    onRemoveManager={setRemoveManagerLocationId}
                    isInviting={isInviting}
                    isRemoving={isRemovingLocation}
                    isLastLocation={activeLocations.length === 1}
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
        planSummary={planSummary}
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

      {cropSrc && (
        <LogoCropDialog
          open={!!cropSrc}
          imageSrc={cropSrc}
          onClose={() => setCropSrc(null)}
          onConfirm={(file) => {
            setCropSrc(null);
            uploadLogo(file);
          }}
        />
      )}

      <RemoveManagerDialog
        open={!!removeManagerLocationId}
        onClose={() => setRemoveManagerLocationId(null)}
        onConfirm={handleRemoveManager}
        isLoading={isRemoving}
      />

      <Dialog open={!!removingLocation} onClose={() => setRemovingLocation(null)} maxWidth='xs' fullWidth PaperProps={{ sx: { borderRadius: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, pb: 0.5 }}>Remove Location</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <DialogContentText sx={{ fontSize: '0.88rem' }}>
              You are about to remove <strong>{removingLocation?.name}</strong>. This action cannot be undone.
            </DialogContentText>
            {planSummary?.hasStripeSubscription && planSummary.feePerLocation > 0 && (() => {
              const bUnit = planSummary.billingInterval === 'yearly' ? 'yr' : 'mo';
              const currentTotal = planSummary.feePerLocation * planSummary.locationCount;
              const newCount = Math.max(1, planSummary.locationCount - 1);
              const newTotal = planSummary.feePerLocation * newCount;
              const saving = currentTotal - newTotal;
              return (
                <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: STATUS_ACTIVATED_BG, border: `1px solid ${ALPHA_GREEN_10}` }}>
                  <Stack direction='row' alignItems='center' spacing={0.75} mb={0.75}>
                    <AccountBalanceWalletOutlined sx={{ fontSize: 15, color: STATUS_ACTIVATED_TEXT }} />
                    <Typography variant='caption' fontWeight={800} sx={{ color: STATUS_ACTIVATED_TEXT, textTransform: 'uppercase', letterSpacing: 0.8, fontSize: '0.62rem' }}>
                      Billing adjustment
                    </Typography>
                  </Stack>
                  <Typography variant='body2' sx={{ color: TEXT_SECONDARY, lineHeight: 1.6, mb: 1.5, fontSize: '0.8rem' }}>
                    Your remaining locations stay fully active with no change to their entry allocations. Your billing adjusts from the next cycle.
                  </Typography>
                  <Stack direction='row' alignItems='center' spacing={1}>
                    <Box sx={{ flex: 1, p: 1.5, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.03)', textAlign: 'center' }}>
                      <Typography variant='caption' sx={{ color: TEXT_TERTIARY, fontWeight: 600, display: 'block', mb: 0.25 }}>Current</Typography>
                      <Typography variant='body2' fontWeight={700} sx={{ color: TEXT_HEADING }}>
                        ${currentTotal.toLocaleString()}/{bUnit}
                      </Typography>
                      <Typography variant='caption' sx={{ color: TEXT_TERTIARY }}>
                        {planSummary.locationCount} location{planSummary.locationCount !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                    <ArrowForwardOutlined sx={{ fontSize: 16, color: TEXT_TERTIARY, flexShrink: 0 }} />
                    <Box sx={{ flex: 1, p: 1.5, borderRadius: 2, bgcolor: ALPHA_GREEN_10, textAlign: 'center' }}>
                      <Typography variant='caption' sx={{ color: STATUS_ACTIVATED_TEXT, fontWeight: 600, display: 'block', mb: 0.25 }}>After removal</Typography>
                      <Typography variant='body1' fontWeight={800} sx={{ color: STATUS_ACTIVATED_TEXT }}>
                        ${newTotal.toLocaleString()}/{bUnit}
                      </Typography>
                      {saving > 0 && (
                        <Typography variant='caption' sx={{ color: STATUS_ACTIVATED_TEXT, fontWeight: 700 }}>
                          saves ${saving.toLocaleString()}/{bUnit}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </Box>
              );
            })()}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRemovingLocation(null)} sx={{ borderRadius: 2, textTransform: 'none' }}>Cancel</Button>
          <Button
            variant='contained'
            color='error'
            onClick={handleConfirmRemoveLocation}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            Remove
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

      {/* Profile preview popup - shows business profile as users see it */}
      <MapBusinessPopup
        location={previewOpen && activeLocations.length > 0 ? ({
          location_id: activeLocations[0].id,
          id: business.id,
          name: business.name,
          sector: business.sector as NearbyLocation['sector'],
          description: business.description,
          terms_text: business.terms_text,
          logo_url: business.logo_url,
          receipt_example_image_url: business.receipt_example_image_url,
          min_transaction_amount: business.min_transaction_amount,
          website_url: business.website_url,
          phone: business.phone,
          address: activeLocations[0].address,
          latitude: 0,
          longitude: 0,
          distance_km: 0,
          other_locations: activeLocations.slice(1).map(l => ({ id: l.id, name: l.name, address: l.address })),
        } satisfies NearbyLocation) : null}
        onClose={() => setPreviewOpen(false)}
      />
    </Box>
  );
};

export default BusinessHubPage;
