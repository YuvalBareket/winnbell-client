import React, { useEffect } from 'react';
import {
  Drawer, Box, Typography, Avatar, Button, Stack, Chip, IconButton, Divider,
  useMediaQuery, useTheme, Skeleton,
} from '@mui/material';
import {
  Directions, Close, CheckCircle, LocationOn, InfoOutlined,
  ReceiptLong, AttachMoney, LocalPhoneOutlined, LanguageOutlined,
  LocationOnOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { NearbyLocation, NearbyLocationDetail } from '../types/nearBy.types';
import { getLocationDetail, logBusinessProfileView } from '../api/nearBy.api';
import { BUSINESS_SECTORS, UNKNOWN_SECTOR } from '../../admin/data';
import { PRIMARY_MAIN } from '../../../shared/colors';
import { MAX_ENTRIES_PER_RECEIPT } from '../../../shared/constants/entries';
import { formatDistanceMiles } from '../../../shared/utils/distance';

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type Props = {
  locationId: number | null;
  basicInfo: NearbyLocation | null;
  onClose: () => void;
  userLocation?: { latitude: number; longitude: number } | null;
  /** When true the popup is shown as a read-only preview (business hub) — action buttons do nothing. */
  preview?: boolean;
  /** In preview mode, render this detail directly instead of fetching the public (subscription-gated) endpoint. */
  previewDetail?: NearbyLocationDetail | null;
};

const MapBusinessPopup: React.FC<Props> = ({ locationId, basicInfo, onClose, userLocation, preview = false, previewDetail = null }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();

  // Skip the public fetch in preview — that endpoint is subscription-gated and 404s for
  // businesses that aren't live yet. Use the detail the business hub already has instead.
  const { data: fetchedDetail, isLoading: fetchedLoading } = useQuery({
    queryKey: ['participating', 'location', locationId],
    queryFn: () => getLocationDetail(locationId!),
    enabled: !preview && !!locationId,
    staleTime: 5 * 60_000,
  });

  const detail = preview ? (previewDetail ?? undefined) : fetchedDetail;
  const detailLoading = preview ? false : fetchedLoading;

  const location = detail || basicInfo;

  // The detail endpoint returns business_name/location_name/business_id (not name/id like
  // the list endpoint does), so normalize for display.
  const displayName = detail?.business_name || detail?.location_name || basicInfo?.name || '';
  const businessId = detail?.business_id ?? basicInfo?.id;

  // Acquisition analytics: log a profile view once the real (non-preview) profile loads. Uses the
  // authoritative business_id from the fetched detail (basicInfo.id is a LOCATION id). Server dedupes.
  useEffect(() => {
    const realBusinessId = detail?.business_id;
    if (!preview && typeof realBusinessId === 'number' && realBusinessId > 0) {
      logBusinessProfileView(realBusinessId, locationId);
    }
  }, [detail?.business_id, locationId, preview]);

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
    if (!location || preview) return;
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
      {/* Drag handle -- mobile only -- always visible */}
      {!isDesktop && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 0.5, flexShrink: 0 }}>
          <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: 'divider' }} />
        </Box>
      )}

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
              pt: isDesktop ? 2.5 : 1.5,
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

      {/* Hero, body, and actions -- shows real content when location is available */}
      {location && (
        <>
          {/* Real hero banner */}
          <Box
            sx={{
              flexShrink: 0,
              px: 2.5,
              pt: isDesktop ? 2.5 : 1.5,
              pb: 2.5,
              background: `linear-gradient(145deg, ${sectorInfo.bgColor} 0%, ${sectorInfo.color}14 100%)`,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Stack direction='row' spacing={2} alignItems='flex-start'>
              <Avatar
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
                  {detail?.cap_reached ? (
                    <Chip
                      label='Entries Full'
                      size='small'
                      sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700, bgcolor: '#f3f4f6', color: '#6b7280' }}
                    />
                  ) : (
                    <Chip
                      icon={<CheckCircle sx={{ fontSize: '11px !important', color: '#16a34a !important' }} />}
                      label='Active Partner'
                      size='small'
                      sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700, bgcolor: '#dcfce7', color: '#16a34a' }}
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

                {/* Website */}
                {detail?.website_url && (
                  <Box mb={2}>
                    <Stack direction='row' spacing={1} alignItems='center'>
                      <Box sx={{ height: 18, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <LanguageOutlined sx={{ fontSize: 17, color: 'text.disabled' }} />
                      </Box>
                      <Typography
                        component='a'
                        href={detail.website_url}
                        target='_blank'
                        rel='noopener noreferrer'
                        variant='caption'
                        sx={{ color: PRIMARY_MAIN, fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                      >
                        {detail.website_url.replace(/^https?:\/\//, '')}
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
                      {(() => { const amt = Number(detail?.min_transaction_amount); if (!Number.isFinite(amt) || amt <= 0) return null; return (<>Every <strong style={{ color: '#111' }}>${Number.isInteger(amt) ? amt : amt.toFixed(2)}</strong> spent = <strong style={{ color: '#111' }}>1 entry</strong>, up to <strong style={{ color: '#111' }}>{MAX_ENTRIES_PER_RECEIPT} entries</strong> per receipt.</>); })()}
                    </Typography>
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
            {detail?.cap_reached && (
              <Typography variant='caption' color='text.disabled' textAlign='center' sx={{ mb: 0.25 }}>
                This location has reached its entry limit for the current campaign.
              </Typography>
            )}
            <Button
              fullWidth
              variant='contained'
              size='large'
              startIcon={<ReceiptLong />}
              onClick={detail?.cap_reached || preview ? undefined : handleSubmitReceipt}
              sx={{
                py: 1.6,
                fontWeight: 800,
                fontSize: '0.95rem',
                bgcolor: detail?.cap_reached ? '#e5e7eb' : PRIMARY_MAIN,
                boxShadow: detail?.cap_reached ? 'none' : `0 6px 20px ${PRIMARY_MAIN}40`,
                cursor: detail?.cap_reached ? 'not-allowed' : 'pointer',
                transition: 'transform 160ms ease-out, box-shadow 160ms ease-out',
                '&:hover': detail?.cap_reached ? { bgcolor: '#e5e7eb' } : { bgcolor: PRIMARY_MAIN, filter: 'brightness(0.92)' },
                '&:active': detail?.cap_reached ? {} : { transform: 'scale(0.97)' },
              }}
            >
              Submit a Receipt
            </Button>
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
          </Box>
        </>
      )}
    </Drawer>
  );
};

export default MapBusinessPopup;
