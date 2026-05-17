import React from 'react';
import {
  Drawer, Box, Typography, Avatar, Button, Stack, Chip, IconButton, Divider,
  useMediaQuery, useTheme,
} from '@mui/material';
import {
  Directions, Close, CheckCircle, LocationOn, InfoOutlined,
  ReceiptLong, AttachMoney, LocalPhoneOutlined, LanguageOutlined,
  LocationOnOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { NearbyLocation } from '../types/nearBy.types';
import { BUSINESS_SECTORS } from '../../admin/data';
import { PRIMARY_MAIN } from '../../../shared/colors';

type Props = {
  location: NearbyLocation | null;
  onClose: () => void;
};

const MapBusinessPopup: React.FC<Props> = ({ location, onClose }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();

  const sectorInfo = location
    ? BUSINESS_SECTORS[location.sector] || BUSINESS_SECTORS.Retail
    : BUSINESS_SECTORS.Retail;

  const handleDirections = () => {
    if (!location) return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`,
      '_blank',
    );
  };

  const handleSubmitReceipt = () => {
    if (!location) return;
    onClose();
    navigate('/scan', { state: { preselectedBusinessId: location.id, preselectedLocation: location } });
  };

  return (
    <Drawer
      anchor={isDesktop ? 'right' : 'bottom'}
      open={!!location}
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
      {location && (
        <>
          {/* Drag handle -- mobile only */}
          {!isDesktop && (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 0.5, flexShrink: 0 }}>
              <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: 'divider' }} />
            </Box>
          )}

          {/* Close button */}
          <IconButton
            onClick={onClose}
            size='small'
            sx={{ position: 'absolute', top: isDesktop ? 16 : 20, right: 16, bgcolor: 'rgba(0,0,0,0.06)', zIndex: 1, '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' } }}
          >
            <Close fontSize='small' />
          </IconButton>

          {/* Hero banner */}
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
                variant='rounded'
                sx={{
                  width: 80, height: 80,
                  borderRadius: 3,
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
                  {location.name}
                </Typography>
                <Stack direction='row' spacing={0.75} flexWrap='wrap' useFlexGap>
                  <Chip
                    label={sectorInfo.label}
                    size='small'
                    sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700, bgcolor: `${sectorInfo.color}18`, color: sectorInfo.color, border: `1px solid ${sectorInfo.color}33` }}
                  />
                  <Chip
                    icon={<CheckCircle sx={{ fontSize: '11px !important', color: '#16a34a !important' }} />}
                    label='Active Partner'
                    size='small'
                    sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700, bgcolor: '#dcfce7', color: '#16a34a' }}
                  />
                  {location.distance_km != null && (
                    <Chip
                      icon={<LocationOn sx={{ fontSize: '11px !important', color: `${PRIMARY_MAIN} !important` }} />}
                      label={location.distance_km < 1 ? `${(location.distance_km * 1000).toFixed(0)} m` : `${location.distance_km.toFixed(1)} km`}
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
            {/* About / description */}
            {location.description && (
              <Box mb={2.5}>
                <Stack direction='row' spacing={1} alignItems='flex-start'>
                  <InfoOutlined sx={{ fontSize: 17, color: 'text.disabled', mt: 0.2, flexShrink: 0 }} />
                  <Typography variant='body2' color='text.secondary' lineHeight={1.65}>
                    {location.description}
                  </Typography>
                </Stack>
              </Box>
            )}

            {/* Address */}
            <Box mb={2.5}>
              <Stack direction='row' spacing={1} alignItems='flex-start'>
                <LocationOn sx={{ fontSize: 17, color: 'text.disabled', mt: 0.2, flexShrink: 0 }} />
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
            {location.phone && (
              <Box mb={2}>
                <Stack direction='row' spacing={1} alignItems='center'>
                  <LocalPhoneOutlined sx={{ fontSize: 17, color: 'text.disabled', flexShrink: 0 }} />
                  <Typography
                    component='a'
                    href={`tel:${location.phone}`}
                    variant='caption'
                    sx={{ color: PRIMARY_MAIN, fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    {location.phone}
                  </Typography>
                </Stack>
              </Box>
            )}

            {/* Website */}
            {location.website_url && (
              <Box mb={2}>
                <Stack direction='row' spacing={1} alignItems='center'>
                  <LanguageOutlined sx={{ fontSize: 17, color: 'text.disabled', flexShrink: 0 }} />
                  <Typography
                    component='a'
                    href={location.website_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    variant='caption'
                    sx={{ color: PRIMARY_MAIN, fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    {location.website_url.replace(/^https?:\/\//, '')}
                  </Typography>
                </Stack>
              </Box>
            )}

            {/* Other locations */}
            {location.other_locations && location.other_locations.length > 0 && (
              <Box mb={2.5}>
                <Stack direction='row' spacing={1} alignItems='flex-start'>
                  <LocationOnOutlined sx={{ fontSize: 17, color: 'text.disabled', mt: 0.2, flexShrink: 0 }} />
                  <Box>
                    <Typography variant='caption' fontWeight={700} color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>
                      Other locations
                    </Typography>
                    {location.other_locations.map((loc) => (
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
                borderRadius: 3,
                bgcolor: `${PRIMARY_MAIN}07`,
                border: `1.5px solid ${PRIMARY_MAIN}22`,
                mb: 2.5,
              }}
            >
              <Stack direction='row' spacing={1} alignItems='center' mb={1.25}>
                <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: PRIMARY_MAIN, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AttachMoney sx={{ fontSize: 17, color: 'white' }} />
                </Box>
                <Typography variant='body2' fontWeight={800} color='text.primary'>
                  How to earn entries
                </Typography>
              </Stack>

              {location.min_transaction_amount != null ? (
                <Stack spacing={0.75}>
                  <Typography variant='body2' color='text.secondary' lineHeight={1.6}>
                    {(() => { const amt = Number(location.min_transaction_amount); return (<>Every <strong style={{ color: '#111' }}>${Number.isInteger(amt) ? amt : amt.toFixed(2)}</strong> spent = <strong style={{ color: '#111' }}>1 entry</strong>.</>); })()}
                  </Typography>
                  {location.terms_text && (
                    <Typography variant='caption' color='text.disabled' lineHeight={1.5}>
                      {location.terms_text}
                    </Typography>
                  )}
                </Stack>
              ) : (
                <Typography variant='body2' color='text.secondary' lineHeight={1.6}>
                  {location.terms_text || 'Submit a receipt from this business to earn an entry in the campaign.'}
                </Typography>
              )}
            </Box>

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
            <Button
              fullWidth
              variant='contained'
              size='large'
              startIcon={<ReceiptLong />}
              onClick={handleSubmitReceipt}
              sx={{
                py: 1.6,
                borderRadius: 3,
                fontWeight: 800,
                fontSize: '0.95rem',
                bgcolor: PRIMARY_MAIN,
                boxShadow: `0 6px 20px ${PRIMARY_MAIN}40`,
                transition: 'transform 160ms ease-out, box-shadow 160ms ease-out',
                '&:hover': { bgcolor: PRIMARY_MAIN, filter: 'brightness(0.92)' },
                '&:active': { transform: 'scale(0.97)' },
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
                borderRadius: 3,
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
