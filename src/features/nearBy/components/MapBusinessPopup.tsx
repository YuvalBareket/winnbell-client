import React from 'react';
import { motion } from 'framer-motion';
import {
  Drawer, Box, Typography, Avatar, Button, Stack, Chip, IconButton, Divider,
  useMediaQuery, useTheme, Skeleton,
} from '@mui/material';
import {
  Directions, Close, LocationOn, InfoOutlined,
  ReceiptLong, AttachMoney, LocalPhoneOutlined, LanguageOutlined,
  LocationOnOutlined, CelebrationOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '../../../store/hook';
import { selectIsUnder21 } from '../../../store/selectors/authSelectors';
import { isAgeRestrictedSector } from '../../../shared/constants/entries';
import type { NearbyLocation, NearbyLocationDetail } from '../types/nearBy.types';
import { getLocationProfileById } from '../api/nearBy.api';
import { BUSINESS_SECTORS, UNKNOWN_SECTOR } from '../../admin/data';
import { PRIMARY_MAIN, GRADIENT_HERO } from '../../../shared/colors';
import { MAX_ENTRIES_PER_RECEIPT } from '../../../shared/constants/entries';
import { formatDistanceMiles, haversineKm } from '../../../shared/utils/distance';
import { safeHttpUrl } from '../../../shared/utils/url';
import { pressable, breathe } from '../../../shared/motion';

type Props = {
  locationId: number | null;
  basicInfo: NearbyLocation | null;
  onClose: () => void;
  userLocation?: { latitude: number; longitude: number } | null;
  /** When true the popup is shown as a read-only preview (business hub) — action buttons do nothing. */
  preview?: boolean;
  /** In preview mode, render this detail directly instead of fetching the public (participation-gated) endpoint. */
  previewDetail?: NearbyLocationDetail | null;
  /** Admin map "view as customer": FETCHES the live public profile exactly like a consumer,
      but the submit action is inert (the /scan route does not exist for admins). */
  adminView?: boolean;
};

const MapBusinessPopup: React.FC<Props> = ({ locationId, basicInfo, onClose, userLocation, preview = false, previewDetail = null, adminView = false }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();

  // Skip the public fetch in preview — that endpoint is subscription-gated and 404s for
  // businesses that aren't live yet. Use the detail the business hub already has instead.
  const { data: fetchedDetail, isLoading: fetchedLoading, isError: fetchError, refetch } = useQuery({
    queryKey: ['participating', 'location', locationId],
    queryFn: () => getLocationProfileById(locationId!),
    enabled: !preview && !!locationId,
    staleTime: 5 * 60_000,
  });

  const detail = preview ? (previewDetail ?? undefined) : fetchedDetail;
  const detailLoading = preview ? false : fetchedLoading;

  // Everything that must not ACT (navigate to /scan) when this popup is a look-only view.
  const actionsInert = preview || adminView;

  const location = detail || basicInfo;

  // The detail endpoint returns business_name/location_name/business_id (not name/id like
  // the list endpoint does), so normalize for display.
  const displayName = detail?.business_name || detail?.location_name || basicInfo?.name || '';
  const businessId = detail?.business_id ?? basicInfo?.id;

  // Never trust the business-supplied website field: only render it as a link if it is a real
  // http(s) URL (blocks javascript:/data: URIs that would run in a customer's browser).
  const safeWebsite = safeHttpUrl(detail?.website_url);

  // Only hide the submit action when the server explicitly says the business is not currently
  // participating (e.g. a past winner's profile). undefined (hub preview / basicInfo-only) keeps
  // the previous behavior so the map and preview are unaffected.
  const canSubmitReceipt = detail?.is_participating !== false;

  // Tobacco & liquor businesses: entries are 21+ only. The note shows for everyone;
  // the submit action is blocked only when the profile DOB confirms the user is under 21
  // (the server enforces the same rule at submission regardless).
  const isAgeRestricted = isAgeRestrictedSector(location?.sector);
  const isUnder21 = useAppSelector(selectIsUnder21);
  const blockedByAge = isAgeRestricted && isUnder21;

  // Profile-view analytics are recorded server-side when the location detail is fetched
  // (only for regular Users), so there is no client-side view logging here.

  const sectorInfo = location
    ? BUSINESS_SECTORS[location.sector] || UNKNOWN_SECTOR
    : UNKNOWN_SECTOR;

  const handleDirections = () => {
    if (!location) return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`,
      '_blank',
    );
  };

  const handleSubmitReceipt = () => {
    if (!location || actionsInert) return;
    onClose();
    navigate('/scan', { state: { preselectedBusinessId: businessId, preselectedLocation: detail || location } });
  };

  return (
    <Drawer
      anchor={isDesktop ? 'right' : 'bottom'}
      open={!!locationId}
      onClose={onClose}
      PaperProps={{
        sx: isDesktop
          ? {
              width: 400,
              borderTopLeftRadius: 20,
              borderBottomLeftRadius: 20,
              overflow: 'hidden',
              boxShadow: '-8px 0 40px rgba(0,0,0,0.14)',
              display: 'flex',
              flexDirection: 'column',
            }
          : {
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              maxHeight: '85vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            },
      }}
    >
      {/* Close button -- always visible */}
      <IconButton
        onClick={onClose}
        size='small'
        sx={{ position: 'absolute', top: isDesktop ? 16 : 20, right: 16, bgcolor: 'rgba(0,0,0,0.06)', zIndex: 1, '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' } }}
      >
        <Close fontSize='small' />
      </IconButton>

      {/* Loading skeleton -- shown when drawer is open but no location yet (detailLoading + no basicInfo) */}
      {!location && detailLoading && (
        <>
          {/* Skeleton hero banner */}
          <Box
            sx={{
              flexShrink: 0,
              px: 2.5,
              pt: 2.5,
              pb: 2.5,
              bgcolor: 'background.paper',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Stack direction='row' spacing={2} alignItems='flex-start'>
              <Skeleton
                variant='circular'
                width={80}
                height={80}
                sx={{ flexShrink: 0 }}
              />

              <Box flex={1} minWidth={0} pt={0.5}>
                <Skeleton variant='text' width='85%' height={28} sx={{ mb: 0.75 }} />
                <Stack direction='row' spacing={0.75} flexWrap='wrap' useFlexGap>
                  <Skeleton variant='rounded' width={70} height={22} />
                  <Skeleton variant='rounded' width={80} height={22} />
                  <Skeleton variant='rounded' width={75} height={22} />
                </Stack>
              </Box>
            </Stack>
          </Box>

          {/* Skeleton body */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              px: 2.5,
              pt: 2.5,
              pb: 2,
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
            }}
          >
            <Box>
              {/* Description skeleton */}
              <Stack direction='row' spacing={1} mb={2.5}>
                <Skeleton variant='circular' width={17} height={17} sx={{ flexShrink: 0, mt: 0.3 }} />
                <Box flex={1}>
                  <Skeleton variant='text' width='100%' height={18} />
                  <Skeleton variant='text' width='85%' height={18} />
                  <Skeleton variant='text' width='60%' height={18} />
                </Box>
              </Stack>
              {/* Address skeleton */}
              <Stack direction='row' spacing={1} mb={2.5}>
                <Skeleton variant='circular' width={17} height={17} sx={{ flexShrink: 0, mt: 0.3 }} />
                <Box flex={1}>
                  <Skeleton variant='text' width='90%' height={18} />
                  <Skeleton variant='text' width={100} height={16} />
                </Box>
              </Stack>
              {/* Phone skeleton */}
              <Stack direction='row' spacing={1} mb={2}>
                <Skeleton variant='circular' width={17} height={17} sx={{ flexShrink: 0 }} />
                <Skeleton variant='text' width={120} height={16} />
              </Stack>
              <Divider sx={{ mb: 2.5 }} />
              {/* How to earn skeleton */}
              <Skeleton variant='rounded' width='100%' height={100} sx={{ borderRadius: 2 }} />
            </Box>
          </Box>

          {/* Skeleton action buttons */}
          <Box
            sx={{
              flexShrink: 0,
              px: 2.5,
              pt: 1.5,
              pb: isDesktop ? 2.5 : 3,
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.25,
            }}
          >
            <Skeleton variant='rounded' width='100%' height={52} sx={{ borderRadius: 1 }} />
            <Skeleton variant='rounded' width='100%' height={52} sx={{ borderRadius: 1 }} />
          </Box>
        </>
      )}

      {/* Error state -- the fetch failed and there is no basic info to fall back to (e.g. a winner
          profile whose business is unavailable). Without this the drawer would render blank. */}
      {!location && !detailLoading && fetchError && (
        <Box sx={{ px: 3, py: 6, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
          <InfoOutlined sx={{ fontSize: 40, color: 'text.disabled' }} />
          <Typography variant='body2' color='text.secondary'>
            We couldn't load this business. Please try again.
          </Typography>
          <Button variant='outlined' size='small' onClick={() => refetch()} sx={{ fontWeight: 700, textTransform: 'none' }}>
            Try again
          </Button>
        </Box>
      )}

      {/* At capacity: the location cannot accept entries this campaign - render ONLY a
          celebratory notice (no business info at all; deliberate, so a full location is a
          moment of hype rather than a wall of greyed-out buttons). Never in preview. */}
      {location && !preview && detail?.cap_reached && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 20 }}
        >
          <Box sx={{ px: 3.5, py: 7, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 84, height: 84, borderRadius: '50%', background: GRADIENT_HERO, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 12px 28px ${PRIMARY_MAIN}45` }}>
              <CelebrationOutlined sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.01em' }}>
              This spot is buzzing!
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.7, maxWidth: 320 }}>
              All of this location's entries for the current campaign have been claimed.
              This location will be live again next campaign.
            </Typography>
            <Typography variant='caption' color='text.disabled' sx={{ mt: 0.5 }}>
              Plenty of other participating locations are ready on the map.
            </Typography>
          </Box>
        </motion.div>
      )}

      {/* Hero, body, and actions -- shows real content when location is available.
          No AnimatePresence: the Drawer's own slide transition covers the close; the
          entrance spring below covers the open. */}
        {location && (preview || !detail?.cap_reached) && (
          <>
            {/* Real hero banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 14, mass: 1 }}
            >
              <Box
                sx={{
                  flexShrink: 0,
                  px: 2.5,
                  pt: 2.5,
                  pb: 2.5,
                  background: `linear-gradient(145deg, ${sectorInfo.bgColor} 0%, ${sectorInfo.color}14 100%)`,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
            <Stack direction='row' spacing={2} alignItems='flex-start'>
              <Avatar
                alt=''
                src={location.logo_url ? `${import.meta.env.VITE_R2_PUBLIC_URL}/business-logos/${location.logo_url}` : undefined}
                sx={{
                  width: 80, height: 80,
                  borderRadius: '50%',
                  bgcolor: sectorInfo.bgColor,
                  color: sectorInfo.color,
                  border: `2px solid ${sectorInfo.color}40`,
                  flexShrink: 0,
                  '& svg': { fontSize: 38 },
                }}
              >
                {!location.logo_url && sectorInfo.icon}
              </Avatar>

              <Box flex={1} minWidth={0} pt={0.5}>
                <Typography variant='h6' fontWeight={800} sx={{ lineHeight: 1.25, mb: 0.75 }}>
                  {displayName}
                </Typography>
                <Stack direction='row' spacing={0.75} flexWrap='wrap' useFlexGap>
                  <Chip
                    label={sectorInfo.label}
                    size='small'
                    sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700, bgcolor: `${sectorInfo.color}18`, color: sectorInfo.color, border: `1px solid ${sectorInfo.color}33` }}
                  />
                  {detail?.cap_reached && (
                    <Chip
                      label='Entries Full'
                      size='small'
                      sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700, bgcolor: '#f3f4f6', color: '#6b7280' }}
                    />
                  )}
                  {userLocation && (
                    <Chip
                      icon={<LocationOn sx={{ fontSize: '11px !important', color: `${PRIMARY_MAIN} !important` }} />}
                      label={(() => {
                        const d = haversineKm(userLocation.latitude, userLocation.longitude, Number(location.latitude), Number(location.longitude));
                        return formatDistanceMiles(d);
                      })()}
                      size='small'
                      sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700, bgcolor: `${PRIMARY_MAIN}12`, color: PRIMARY_MAIN }}
                    />
                  )}
                </Stack>
              </Box>
            </Stack>
              </Box>
            </motion.div>

          {/* Scrollable body */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              px: 2.5,
              pt: 2.5,
              pb: 2,
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
            }}
          >
            {detailLoading ? (
              <Box>
                {/* Description skeleton */}
                <Stack direction='row' spacing={1} mb={2.5}>
                  <Skeleton variant='circular' width={17} height={17} sx={{ flexShrink: 0, mt: 0.3 }} />
                  <Box flex={1}>
                    <Skeleton variant='text' width='100%' height={18} />
                    <Skeleton variant='text' width='85%' height={18} />
                    <Skeleton variant='text' width='60%' height={18} />
                  </Box>
                </Stack>
                {/* Address skeleton */}
                <Stack direction='row' spacing={1} mb={2.5}>
                  <Skeleton variant='circular' width={17} height={17} sx={{ flexShrink: 0, mt: 0.3 }} />
                  <Box flex={1}>
                    <Skeleton variant='text' width='90%' height={18} />
                    <Skeleton variant='text' width={100} height={16} />
                  </Box>
                </Stack>
                {/* Phone skeleton */}
                <Stack direction='row' spacing={1} mb={2}>
                  <Skeleton variant='circular' width={17} height={17} sx={{ flexShrink: 0 }} />
                  <Skeleton variant='text' width={120} height={16} />
                </Stack>
                <Divider sx={{ mb: 2.5 }} />
                {/* How to earn skeleton */}
                <Skeleton variant='rounded' width='100%' height={100} sx={{ borderRadius: 2 }} />
              </Box>
            ) : (
              <>
                {/* About / description */}
                {detail?.description && (
                  <Box mb={2.5}>
                    <Stack direction='row' spacing={1} alignItems='flex-start'>
                      <Box sx={{ height: 23, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <InfoOutlined sx={{ fontSize: 17, color: 'text.disabled' }} />
                      </Box>
                      <Typography variant='body2' color='text.secondary' lineHeight={1.65}>
                        {detail.description}
                      </Typography>
                    </Stack>
                  </Box>
                )}

                {/* Address */}
                <Box mb={2.5}>
                  <Stack direction='row' spacing={1} alignItems='flex-start'>
                    <Box sx={{ height: 21, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                      <LocationOn sx={{ fontSize: 17, color: 'text.disabled' }} />
                    </Box>
                    <Box>
                      <Typography variant='body2' color='text.secondary' lineHeight={1.5}>
                        {location.address}
                      </Typography>
                      <Typography
                        variant='caption'
                        sx={{ color: PRIMARY_MAIN, fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                        onClick={handleDirections}
                      >
                        {'Get directions \u2192'}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                {/* Phone */}
                {detail?.phone && (
                  <Box mb={2}>
                    <Stack direction='row' spacing={1} alignItems='center'>
                      <Box sx={{ height: 18, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <LocalPhoneOutlined sx={{ fontSize: 17, color: 'text.disabled' }} />
                      </Box>
                      <Typography
                        component='a'
                        href={`tel:${detail.phone}`}
                        variant='caption'
                        sx={{ color: PRIMARY_MAIN, fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                      >
                        {detail.phone}
                      </Typography>
                    </Stack>
                  </Box>
                )}

                {/* Website - only rendered as a link when it is a valid http(s) URL, so a business
                    can never inject a javascript: URI that would execute in a customer's browser. */}
                {safeWebsite && (
                  <Box mb={2}>
                    <Stack direction='row' spacing={1} alignItems='center'>
                      <Box sx={{ height: 18, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <LanguageOutlined sx={{ fontSize: 17, color: 'text.disabled' }} />
                      </Box>
                      <Typography
                        component='a'
                        href={safeWebsite}
                        target='_blank'
                        rel='noopener noreferrer'
                        variant='caption'
                        sx={{ color: PRIMARY_MAIN, fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                      >
                        {safeWebsite.replace(/^https?:\/\//, '')}
                      </Typography>
                    </Stack>
                  </Box>
                )}

                {/* Other locations */}
                {detail?.other_locations && detail.other_locations.length > 0 && (
                  <Box mb={2.5}>
                    <Stack direction='row' spacing={1} alignItems='flex-start'>
                      <Box sx={{ height: 18, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <LocationOnOutlined sx={{ fontSize: 17, color: 'text.disabled' }} />
                      </Box>
                      <Box>
                        <Typography variant='caption' fontWeight={700} color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>
                          Other locations
                        </Typography>
                        {detail.other_locations.map((loc) => (
                          <Box key={loc.id} mb={0.5}>
                            <Typography variant='caption' color='text.primary' fontWeight={600} sx={{ display: 'block', lineHeight: 1.4 }}>
                              {loc.name}
                            </Typography>
                            <Typography variant='caption' color='text.disabled' sx={{ display: 'block', lineHeight: 1.4 }}>
                              {loc.address}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Stack>
                  </Box>
                )}

                <Divider sx={{ mb: 2.5 }} />

                {/* How to earn entries -- highlight box */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: `${PRIMARY_MAIN}07`,
                    border: `1.5px solid ${PRIMARY_MAIN}22`,
                    mb: 2.5,
                  }}
                >
                  <Stack direction='row' spacing={1} alignItems='center' mb={1.25}>
                    <Box sx={{ width: 28, height: 28, borderRadius: 2, bgcolor: PRIMARY_MAIN, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <AttachMoney sx={{ fontSize: 17, color: 'white' }} />
                    </Box>
                    <Typography variant='body2' fontWeight={800} color='text.primary'>
                      How to earn entries
                    </Typography>
                  </Stack>

                  <Stack spacing={0.75}>
                    <Typography variant='body2' color='text.secondary' lineHeight={1.6}>
                      {(() => { const amt = Number(detail?.min_transaction_amount); if (!Number.isFinite(amt) || amt <= 0) return null; return (<>Every <strong style={{ color: '#111' }}>${Number.isInteger(amt) ? amt : amt.toFixed(2)}</strong> spent before tax and tip = <strong style={{ color: '#111' }}>1 entry</strong>, up to <strong style={{ color: '#111' }}>{MAX_ENTRIES_PER_RECEIPT} entries</strong> per receipt.</>); })()}
                    </Typography>
                    {isAgeRestricted && (
                      <Typography variant='body2' fontWeight={700} color='text.primary' lineHeight={1.6}>
                        Entries at this business can be earned only by participants aged 21 or older.
                      </Typography>
                    )}
                    {detail?.terms_text && (
                      <Typography variant='caption' color='text.disabled' lineHeight={1.5}>
                        {detail.terms_text}
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </>
            )}
          </Box>

          {/* Sticky action buttons */}
          <Box
            sx={{
              flexShrink: 0,
              px: 2.5,
              pt: 1.5,
              pb: isDesktop ? 2.5 : 3,
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.25,
            }}
          >
            {canSubmitReceipt && (() => {
              const submitBlocked = !!detail?.cap_reached || blockedByAge;
              return (
              <>
                {detail?.cap_reached && (
                  <Typography variant='caption' color='text.disabled' textAlign='center' sx={{ mb: 0.25 }}>
                    This location has reached its entry limit for the current campaign.
                  </Typography>
                )}
                {blockedByAge && !detail?.cap_reached && (
                  <Typography variant='caption' color='text.disabled' textAlign='center' sx={{ mb: 0.25 }}>
                    Entries at this business are for participants aged 21 and older.
                  </Typography>
                )}
                <motion.div
                  {...pressable}
                  {...(submitBlocked || actionsInert ? {} : breathe)}
                >
                  <Button
                    fullWidth
                    variant='contained'
                    size='large'
                    startIcon={<ReceiptLong />}
                    onClick={submitBlocked || actionsInert ? undefined : handleSubmitReceipt}
                    sx={{
                      py: 1.6,
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      bgcolor: submitBlocked ? '#e5e7eb' : PRIMARY_MAIN,
                      boxShadow: submitBlocked ? 'none' : `0 6px 20px ${PRIMARY_MAIN}40`,
                      cursor: submitBlocked ? 'not-allowed' : 'pointer',
                      '&:hover': submitBlocked ? { bgcolor: '#e5e7eb' } : { bgcolor: PRIMARY_MAIN, filter: 'brightness(0.92)' },
                    }}
                  >
                    Submit a Receipt
                  </Button>
                </motion.div>
              </>
              );
            })()}
            <motion.div {...pressable}>
              <Button
                fullWidth
                variant='outlined'
                size='large'
                startIcon={<Directions />}
                onClick={handleDirections}
                sx={{
                  py: 1.4,
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  borderColor: 'divider',
                  color: 'text.secondary',
                  '&:hover': { borderColor: PRIMARY_MAIN, color: PRIMARY_MAIN, bgcolor: `${PRIMARY_MAIN}06` },
                }}
              >
                Get Directions
              </Button>
            </motion.div>
          </Box>
        </>
        )}
    </Drawer>
  );
};

export default MapBusinessPopup;
