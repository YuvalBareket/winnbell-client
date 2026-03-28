import React from 'react';
import {
  Drawer, Box, Typography, Avatar, Button, Stack, Chip, IconButton, Divider,
  useMediaQuery, useTheme,
} from '@mui/material';
import {
  Directions, Close, CheckCircle, LocationOn, InfoOutlined,
} from '@mui/icons-material';
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

  if (!location) return null;

  const sectorInfo = BUSINESS_SECTORS[location.sector] || BUSINESS_SECTORS.Retail;

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <Drawer
      anchor={isDesktop ? 'right' : 'bottom'}
      open={!!location}
      onClose={onClose}
      PaperProps={{
        sx: isDesktop
          ? {
              width: 360,
              borderTopLeftRadius: 20,
              borderBottomLeftRadius: 20,
              overflow: 'hidden',
              boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
            }
          : {
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              maxHeight: '70vh',
              overflow: 'hidden',
            },
      }}
    >
      {/* Drag handle — mobile only */}
      {!isDesktop && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 0.5 }}>
          <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: 'divider' }} />
        </Box>
      )}

      {/* Close button */}
      <IconButton
        onClick={onClose}
        size='small'
        sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'action.hover', zIndex: 1 }}
      >
        <Close fontSize='small' />
      </IconButton>

      {/* Hero header */}
      <Box
        sx={{
          mx: 2,
          mb: 0,
          mt: 1,
          borderRadius: 4,
          background: `linear-gradient(135deg, ${sectorInfo.bgColor} 0%, ${sectorInfo.color}18 100%)`,
          border: `1px solid ${sectorInfo.color}22`,
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Avatar
          src={location.logo_url ?? undefined}
          variant='rounded'
          sx={{
            width: 72,
            height: 72,
            borderRadius: 3,
            bgcolor: sectorInfo.bgColor,
            color: sectorInfo.color,
            border: `2px solid ${sectorInfo.color}33`,
            fontSize: 32,
            fontWeight: 900,
            flexShrink: 0,
            '& svg': { fontSize: 34 },
          }}
        >
          {location.logo_url ? null : sectorInfo.icon}
        </Avatar>

        <Box flex={1} minWidth={0}>
          <Typography variant='h6' fontWeight={800} noWrap sx={{ lineHeight: 1.2, mb: 0.5 }}>
            {location.name}
          </Typography>

          <Stack direction='row' spacing={0.75} flexWrap='wrap' useFlexGap>
            <Chip
              label={sectorInfo.label}
              size='small'
              sx={{
                height: 20, fontSize: '0.65rem', fontWeight: 700,
                bgcolor: `${sectorInfo.color}18`,
                color: sectorInfo.color,
                border: `1px solid ${sectorInfo.color}33`,
              }}
            />
            <Chip
              icon={<CheckCircle sx={{ fontSize: '11px !important', color: '#16a34a !important' }} />}
              label='Active Partner'
              size='small'
              sx={{
                height: 20, fontSize: '0.65rem', fontWeight: 700,
                bgcolor: '#dcfce7', color: '#16a34a',
              }}
            />
            {location.distance_km != null && (
              <Chip
                icon={<LocationOn sx={{ fontSize: '11px !important', color: `${PRIMARY_MAIN} !important` }} />}
                label={`${location.distance_km.toFixed(1)} km`}
                size='small'
                sx={{
                  height: 20, fontSize: '0.65rem', fontWeight: 700,
                  bgcolor: `${PRIMARY_MAIN}12`, color: PRIMARY_MAIN,
                }}
              />
            )}
          </Stack>
        </Box>
      </Box>

      {/* Scrollable body */}
      <Box sx={{ overflowY: 'auto', px: 2, pt: 2, pb: 3, '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>

        {/* Address */}
        <Stack direction='row' alignItems='flex-start' spacing={1} mb={2}>
          <LocationOn sx={{ fontSize: 18, color: 'text.disabled', mt: 0.25, flexShrink: 0 }} />
          <Typography variant='body2' color='text.secondary' fontWeight={500} lineHeight={1.5}>
            {location.address}
          </Typography>
        </Stack>

        {/* Description / terms */}
        {(location.description || location.terms_text) && (
          <>
            <Divider sx={{ mb: 2 }} />
            <Stack direction='row' alignItems='flex-start' spacing={1}>
              <InfoOutlined sx={{ fontSize: 18, color: 'text.disabled', mt: 0.25, flexShrink: 0 }} />
              <Typography variant='body2' color='text.secondary' lineHeight={1.6}>
                {location.description || location.terms_text}
              </Typography>
            </Stack>
          </>
        )}

        {/* Terms text (if description and terms are both present) */}
        {location.description && location.terms_text && (
          <Box
            sx={{
              mt: 2, p: 2, borderRadius: 3,
              bgcolor: `${PRIMARY_MAIN}06`,
              border: `1px solid ${PRIMARY_MAIN}20`,
            }}
          >
            <Typography variant='caption' fontWeight={700} color='primary.main' sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.5 }}>
              How to earn tickets
            </Typography>
            <Typography variant='body2' color='text.secondary' lineHeight={1.6}>
              {location.terms_text}
            </Typography>
          </Box>
        )}

        {/* CTA */}
        <Button
          fullWidth
          variant='contained'
          size='large'
          startIcon={<Directions />}
          onClick={handleDirections}
          sx={{
            mt: 3,
            py: 1.75,
            borderRadius: 3,
            fontWeight: 800,
            fontSize: '0.95rem',
            boxShadow: `0 8px 20px ${PRIMARY_MAIN}33`,
          }}
        >
          Get Directions
        </Button>
      </Box>
    </Drawer>
  );
};

export default MapBusinessPopup;
