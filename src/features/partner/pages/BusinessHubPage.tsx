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
  CircularProgress,
} from '@mui/material';
import {
  AddBusiness,
  Warning,
  CreditCard,
  PreviewOutlined,
  AccountBalanceWalletOutlined,
  ArrowForwardOutlined,
  MenuBookRounded,
  ArrowForwardRounded,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import {
  staggerContainer,
  popIn,
  riseIn,
  wiggle,
} from '../../../shared/motion';
import { useAppSelector } from '../../../store/hook';
import { selectIsLocationManager } from '../../../store/selectors/authSelectors';
import AppHeader from '../../../shared/components/AppHeader';
import BusinessHeroSection from './components/BusinessHeroSection';
import { useMenuDrawer } from '../../../shared/context/MenuDrawerContext';
import { useBusinessData } from '../hooks/useBusinessData';
import { useAddLocation } from '../hooks/useAddLocation';
import { useRemoveLocation } from '../hooks/useRemoveLocation';
import { useInviteManager, useRemoveManager } from '../hooks/useInviteManager';
import { useSubscription } from '../../../features/subscription/hooks/useSubscription';
import EditLocationModal from './components/EditLocationModal';
import EditBusinessDrawer from './components/EditBusinessDrawer';
import CampaignCard from './components/CampaignCard';
import LocationCard from './components/LocationCard';
import { TIER_MAP } from '../../subscription/pages/components/subscribeTiers';
import { useUploadBusinessLogo } from '../hooks/useUploadBusinessLogo';
import { useUpdateCampaignSettings } from '../hooks/useUpdateCampaignSettings';
import AddLocationDialog from './components/AddLocationDialog';
import InviteManagerDialog from './components/InviteManagerDialog';
import RemoveManagerDialog from './components/RemoveManagerDialog';
import LogoCropDialog from './components/LogoCropDialog';
import MapBusinessPopup from '../../nearBy/components/MapBusinessPopup';
import type { BusinessLocation } from '../types/business.types';
import type { NearbyLocation, NearbyLocationDetail } from '../../nearBy/types/nearBy.types';
import { apiErrorMessage } from '../../../shared/utils/apiError';
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
  ACCENT_GOLD_DARK,
  ACCENT_GOLD_LIGHT,
  PRIMARY_MAIN,
} from '../../../shared/colors';

const BusinessHubPage = () => {
  const navigate = useNavigate();
  const isManager = useAppSelector(selectIsLocationManager);
  const { data: business, isLoading, isError } = useBusinessData(true);
  const { data: subscription } = useSubscription();
  const { mutateAsync: generateInvite, isPending: isInviting } = useInviteManager();
  const { mutate: doRemoveManager, isPending: isRemoving } = useRemoveManager();
  const { mutate: doAddLocation, isPending: isAddingLocation } = useAddLocation();
  const { mutate: doRemoveLocation, isPending: isRemovingLocation } = useRemoveLocation();
  const { mutate: updateCampaignSettings, isPending: isUpdatingSettings } = useUpdateCampaignSettings();
  const { upload: uploadLogo, isUploading: isUploadingLogo, error: logoError, clearError: clearLogoError } = useUploadBusinessLogo();
  const { openMenu } = useMenuDrawer();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [editingLocation, setEditingLocation] = useState<BusinessLocation | null>(null);
  const [businessDrawerOpen, setBusinessDrawerOpen] = useState(false);
  const [addLocationOpen, setAddLocationOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [removeManagerLocationId, setRemoveManagerLocationId] = useState<number | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [removingLocation, setRemovingLocation] = useState<BusinessLocation | null>(null);

  // Live locations plus staged adds (created during a running campaign, going live at the
  // next open) — the owner must still see and manage a location they just added.
  const activeLocations = (business?.locations ?? []).filter((l) => l.is_active || l.activate_at_open);
  // What the NEXT campaign runs with: active minus scheduled removals plus scheduled adds.
  const nextCampaignLocationCount = (business?.locations ?? [])
    .filter((l) => (l.is_active && !l.deactivate_at_open) || l.activate_at_open).length;

  // Pricing for the add-location dialog is the NEXT campaign's plan: the staged tier wins
  // over the live one (e.g. a founding member's live 2,500 benefit is not their plan), and
  // the per-location rate comes from the tier price map — fee_at_entry is a TOTAL, not a rate.
  const nextCampaignTier = subscription?.pending_entries_per_location ?? subscription?.entries_per_location ?? null;
  const planSummary = subscription ? {
    feePerLocation: nextCampaignTier != null ? (TIER_MAP[nextCampaignTier] ?? 0) : 0,
    locationCount: nextCampaignLocationCount || (subscription.active_location_count ?? 0),
    billingInterval: subscription.billing_interval,
    hasStripeSubscription: !!subscription.stripe_subscription_id,
  } : null;
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleAddLocation = (data: { name: string; address: string; lat: number; lon: number; suite: string; phone: string }) => {
    doAddLocation(
      { name: data.name, address: data.address, lat: data.lat, lon: data.lon, suite: data.suite || null, phone: data.phone || null },
      {
        onSuccess: (res) => {
          setAddLocationOpen(false);
          setSnackbar({
            open: true,
            message: res?.stagedForNextCampaign
              ? 'Location added. It goes live when the next campaign opens.'
              : 'Location added and plan updated.',
            severity: 'success',
          });
        },
        onError: (err: unknown) => {
          setAddLocationOpen(false);
          setSnackbar({ open: true, message: apiErrorMessage(err, 'Failed to add location. Plan update may have failed.'), severity: 'error' });
        },
      },
    );
  };

  const handleConfirmRemoveLocation = () => {
    if (!removingLocation) return;
    const loc = removingLocation;
    // Keep the dialog open with a loading button until the request resolves,
    // then close it - avoids closing instantly and showing a blank load behind.
    doRemoveLocation(loc.id, {
      onSuccess: (res) => {
        setRemovingLocation(null);
        setSnackbar({
          open: true,
          message: res?.scheduledForNextCampaign
            ? 'Location removal scheduled. It keeps serving until the current campaign ends.'
            : 'Location removed and plan updated.',
          severity: 'success',
        });
      },
      onError: (err: unknown) => {
        setRemovingLocation(null);
        setSnackbar({ open: true, message: apiErrorMessage(err, 'Failed to remove location. Plan update may have failed.'), severity: 'error' });
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
      <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: 'var(--dvh100, 100dvh)' } }}>
        {/* Hero skeleton */}
        <Box sx={{ background: GRADIENT_HERO, pt: 3, pb: 9, px: 3 }}>
          <Container maxWidth='lg'>
            <Stack direction='row' alignItems='center' spacing={2}>
              <Skeleton variant='rounded' width={64} height={64} sx={{ borderRadius: 2, bgcolor: ALPHA_WHITE_15 }} />
              <Box flex={1}>
                <Skeleton variant='text' width={160} height={28} sx={{ bgcolor: ALPHA_WHITE_15 }} />
                <Skeleton variant='text' width={100} height={20} sx={{ bgcolor: ALPHA_WHITE_10 }} />
              </Box>
            </Stack>
          </Container>
        </Box>
        <Container maxWidth='lg' sx={{ mt: -5 }}>
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
      <Container maxWidth='lg' sx={{ mt: 10, textAlign: 'center' }}>
        <Typography color='error' variant='h6' fontWeight={700}>Failed to load business profile.</Typography>
        <Typography color='text.secondary' sx={{ mt: 1 }}>Check your connection and try again.</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: { xs: MOBILE_CONTENT_HEIGHT, md: 'var(--dvh100, 100dvh)' }, pb: { xs: 12, md: 6 } }}>
      <BusinessHeroSection
        business={business}
        header={<AppHeader onMenuOpen={openMenu} onGradient />}
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
        onEditClick={!isManager ? () => setBusinessDrawerOpen(true) : undefined}
      />

      <Container maxWidth='lg' sx={{ mt: -5 }}>
        <Stack
          spacing={3}
          component={motion.div}
          variants={staggerContainer}
          initial='hidden'
          animate='visible'
        >
          {/* Onboarding banner - shown when not yet subscribed */}
          <AnimatePresence>
            {!business.is_subscribed && (
              <motion.div key='onboarding-banner' variants={riseIn} exit={{ opacity: 0, y: -12, transition: { duration: 0.25 } }}>
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
                    <motion.span {...wiggle} style={{ display: 'flex', flexShrink: 0 }}>
                      <Warning sx={{ color: 'warning.main' }} />
                    </motion.span>
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
                  {!isManager && (
                    <Button
                      variant='contained'
                      size='small'
                      startIcon={<CreditCard sx={{ display: { xs: 'none', sm: 'inline-flex' } }} />}
                      onClick={() => navigate('/subscribe')}
                      sx={{ fontWeight: 800, flexShrink: 0, bgcolor: 'warning.main', '&:hover': { bgcolor: 'warning.dark' } }}
                    >
                      Start Campaign
                    </Button>
                  )}
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Profile preview + marketing links. Same row on desktop, stacked on mobile.
              Styled as clickable doc-cards matching the marketing page pattern. */}
          <motion.div variants={popIn}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              <Paper
                elevation={0}
                onClick={() => setPreviewOpen(true)}
                sx={{
                  minWidth: 0,
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.75,
                  px: 2,
                  py: 1.5,
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  '&:hover': {
                    borderColor: PRIMARY_MAIN,
                    boxShadow: `0 6px 18px -8px ${PRIMARY_MAIN}55`,
                    transform: 'translateY(-1px)',
                    '& .doc-arrow': { transform: 'translateX(3px)', color: PRIMARY_MAIN },
                  },
                  '&:active': { transform: 'scale(0.99)' },
                }}
              >
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: `${PRIMARY_MAIN}12`, color: PRIMARY_MAIN, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <PreviewOutlined sx={{ fontSize: 20 }} />
                </Box>
                <Stack sx={{ minWidth: 0, flex: 1 }}>
                  <Typography noWrap sx={{ fontSize: '0.875rem', fontWeight: 800 }}>Public Profile Preview</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: 1.4 }}>See how customers find you on the Winnbell map</Typography>
                </Stack>
                <ArrowForwardRounded className='doc-arrow' sx={{ fontSize: 18, color: 'text.disabled', flexShrink: 0, transition: 'all 0.18s ease' }} />
              </Paper>

              <Paper
                elevation={0}
                onClick={() => navigate('/marketing/guide')}
                sx={{
                  minWidth: 0,
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.75,
                  px: 2,
                  py: 1.5,
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  '&:hover': {
                    borderColor: ACCENT_GOLD_DARK,
                    boxShadow: `0 6px 18px -8px ${ACCENT_GOLD_DARK}55`,
                    transform: 'translateY(-1px)',
                    '& .doc-arrow': { transform: 'translateX(3px)', color: ACCENT_GOLD_DARK },
                  },
                  '&:active': { transform: 'scale(0.99)' },
                }}
              >
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: ACCENT_GOLD_LIGHT, color: ACCENT_GOLD_DARK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MenuBookRounded sx={{ fontSize: 20 }} />
                </Box>
                <Stack sx={{ minWidth: 0, flex: 1 }}>
                  <Typography noWrap sx={{ fontSize: '0.875rem', fontWeight: 800 }}>Get the Most Out of Winnbell</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: 1.4 }}>A read-through guide with everything you need to know</Typography>
                </Stack>
                <ArrowForwardRounded className='doc-arrow' sx={{ fontSize: 18, color: 'text.disabled', flexShrink: 0, transition: 'all 0.18s ease' }} />
              </Paper>
            </Box>
          </motion.div>

          {/* Campaign card */}
          <motion.div variants={riseIn}>
          <CampaignCard
            business={business}
            updateCampaignSettings={updateCampaignSettings}
            isUpdatingSettings={isUpdatingSettings}
          />
          </motion.div>

          {/* Branch Management */}
          <motion.div variants={riseIn}>
          <Box>
            <Stack direction='row' alignItems='center' justifyContent='space-between' spacing={1.5} mb={2}>
              <Typography
                variant='subtitle2'
                fontWeight={800}
                sx={{ ml: 0.5, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}
              >
                Branch Management
              </Typography>
              {activeLocations.length > 0 && !isManager && (
                <Button
                  size='small'
                  variant='outlined'
                  startIcon={<AddBusiness />}
                  onClick={() => setAddLocationOpen(true)}
                  sx={{ fontWeight: 700, textTransform: 'none' }}
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
                {!isManager && (
                  <Button
                    variant='contained'
                    onClick={() => setAddLocationOpen(true)}
                    sx={{ mt: 3, fontWeight: 800, textTransform: 'none', px: 4 }}
                  >
                    Add Location
                  </Button>
                )}
              </Paper>
            ) : (
              <Box sx={{ display: { xs: 'flex', md: 'grid' }, flexDirection: 'column', gridTemplateColumns: { md: '1fr 1fr' }, gap: 2 }}>
                {activeLocations.map((loc: BusinessLocation) => (
                  /* display:grid stretches the card to fill the wrapper, keeping the two
                     columns equal-height like when the card was the grid item itself */
                  <motion.div key={loc.id} variants={popIn} style={{ height: '100%', display: 'grid' }}>
                    <LocationCard
                      loc={loc}
                      onEdit={setEditingLocation}
                      onRemove={!isManager ? setRemovingLocation : undefined}
                      onInvite={handleGenerateInvite}
                      onRemoveManager={setRemoveManagerLocationId}
                      isInviting={isInviting}
                      isRemoving={isRemovingLocation}
                      isLastLocation={activeLocations.length === 1}
                    />
                  </motion.div>
                ))}
              </Box>
            )}
          </Box>
          </motion.div>
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
          key={cropSrc}
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

      <Dialog open={!!removingLocation} onClose={() => { if (!isRemovingLocation) setRemovingLocation(null); }} maxWidth='xs' fullWidth PaperProps={{ sx: { borderRadius: 1 } }}>
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
                    During a running campaign this location keeps serving until the campaign ends, then stops. Your remaining locations stay fully active, and billing adjusts from the next campaign.
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
          <Button onClick={() => setRemovingLocation(null)} disabled={isRemovingLocation} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button
            variant='contained'
            color='error'
            onClick={handleConfirmRemoveLocation}
            disabled={isRemovingLocation}
            startIcon={isRemovingLocation ? <CircularProgress size={16} color='inherit' /> : undefined}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            {isRemovingLocation ? 'Removing...' : 'Remove'}
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
        preview
        locationId={previewOpen && activeLocations.length > 0 ? activeLocations[0].id : null}
        basicInfo={previewOpen && activeLocations.length > 0 ? ({
          location_id: activeLocations[0].id,
          id: business.id,
          name: business.name,
          sector: business.sector as NearbyLocation['sector'],
          logo_url: business.logo_url,
          address: activeLocations[0].address,
          latitude: activeLocations[0].latitude ?? 0,
          longitude: activeLocations[0].longitude ?? 0,
        } satisfies NearbyLocation) : null}
        previewDetail={previewOpen && activeLocations.length > 0 ? ({
          location_id: activeLocations[0].id,
          id: business.id,
          business_id: business.id,
          name: business.name,
          business_name: business.name,
          location_name: activeLocations[0].name,
          sector: business.sector as NearbyLocation['sector'],
          logo_url: business.logo_url,
          address: activeLocations[0].address,
          latitude: activeLocations[0].latitude ?? 0,
          longitude: activeLocations[0].longitude ?? 0,
          description: business.description,
          terms_text: business.terms_text,
          receipt_example_image_url: business.receipt_example_image_url,
          min_transaction_amount: business.min_transaction_amount,
          pending_min_transaction_amount: business.pending_min_transaction_amount,
          website_url: business.website_url,
          phone: activeLocations[0].phone ?? null,
          other_locations: activeLocations.slice(1).map((l) => ({ id: l.id, name: l.name, address: l.address })),
          cap_reached: false,
        } satisfies NearbyLocationDetail) : null}
        onClose={() => setPreviewOpen(false)}
      />
    </Box>
  );
};

export default BusinessHubPage;
