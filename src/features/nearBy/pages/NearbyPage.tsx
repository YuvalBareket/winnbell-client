import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  InputBase,
  Chip,
  Button,
  Avatar,
  Stack,
  CircularProgress,
} from '@mui/material';
import {
  Search,
  MyLocation,
  Directions,
  CheckCircle,
  SearchOff,
  Storefront as StorefrontIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';

// Architecture Imports
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import BusinessMap from '../components/BusinessMap';
import type { RootState } from '../../../store/store';
import MapBusinessPopup from '../components/MapBusinessPopup';
import { useNearbyWithZoom } from '../hooks/useNearbyWithZoom';
import { BUSINESS_SECTORS } from '../../admin/data';

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const listItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.23, 1, 0.32, 1] as [number, number, number, number], delay: i * 0.05 },
  }),
};

const NearbyPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  // Use location_id as the state key to support multiple locations per business
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);

  // 1. Get Current Location (Updates Redux)
  const { refreshLocation } = useCurrentLocation();

  // 2. Pull Location and Fetch Data
  const { userLocation } = useSelector((state: RootState) => state.auth);
  const { locations, isLoading, isFetching, isError, onViewportChange } = useNearbyWithZoom();

  // 3. Find the specific location object for the popup
  const selectedLocation =
    locations.find((loc) => loc.location_id === selectedLocationId) || null;

  // 4. Filter locations based on search term and sector
  const filteredLocations = locations.filter((loc) => {
    const matchesSearch = loc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = !selectedSector || loc.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  return (
    <Box
      sx={{
        width: '100%',
        height: { xs: 'calc(100dvh - 60px)', md: '100dvh' },
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        overflow: 'hidden',
      }}
    >
      {/* 1. MAP SECTION */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: { xs: '40vh', sm: '45vh', md: '100%' },
          flex: { md: 1 },
          bgcolor: '#e3f2fd',
          flexShrink: 0,
        }}
      >
        <BusinessMap
          locations={filteredLocations}
          userLocation={userLocation}
          onBusinessClick={(id) => setSelectedLocationId(id)}
          onViewportChange={onViewportChange}
        />

        {/* Floating Search Bar */}
        <Box sx={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 10 }}>
          <Paper
            elevation={3}
            sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', borderRadius: 3, height: 48 }}
          >
            <IconButton sx={{ p: '10px' }}>
              <Search sx={{ color: 'text.secondary' }} />
            </IconButton>
            <InputBase
              sx={{ ml: 1, flex: 1, fontWeight: 600 }}
              placeholder='Search partners...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Paper>
        </Box>

        {/* Recenter Button */}
        <IconButton
          onClick={() => refreshLocation()}
          sx={{
            position: 'absolute',
            bottom: 25,
            right: 16,
            bgcolor: 'background.paper',
            boxShadow: 3,
            zIndex: 11,
            '&:hover': { bgcolor: 'background.paper' },
            '&:active': { transform: 'scale(0.93)', transition: 'transform 160ms ease-out' },
          }}
        >
          <MyLocation color='primary' />
        </IconButton>
      </Box>

      {/* 2. PARTNERS LIST */}
      <Paper
        elevation={0}
        sx={{
          flex: { xs: 1, md: '0 0 380px' },
          width: { md: '380px' },
          height: { md: '100%' },
          mt: { xs: -3, md: 0 },
          borderTopLeftRadius: { xs: 24, md: 0 },
          borderTopRightRadius: { xs: 24, md: 0 },
          position: 'relative',
          zIndex: 12,
          bgcolor: 'background.default',
          boxShadow: { xs: '0px -4px 20px rgba(0,0,0,0.05)', md: '-4px 0 20px rgba(0,0,0,0.05)' },
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, pb: 2 }}>
          <Typography variant='h6' sx={{ fontWeight: 700 }}>Partners List</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isFetching && !isLoading && <CircularProgress size={14} thickness={5} />}
            <Typography variant='subtitle2' color='primary' sx={{ fontWeight: 700 }}>
              {filteredLocations.length} Found
            </Typography>
          </Box>
        </Box>

        {/* Sector filter chips */}
        <Box sx={{ px: 2, pb: 1.5, display: 'flex', gap: 1, overflowX: 'auto', flexShrink: 0, '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
          <Chip
            label='All'
            size='small'
            onClick={() => setSelectedSector(null)}
            sx={{ fontWeight: 700, flexShrink: 0, height: 28, bgcolor: !selectedSector ? 'primary.main' : 'action.hover', color: !selectedSector ? 'white' : 'text.secondary', border: 'none' }}
          />
          {Object.entries(BUSINESS_SECTORS)
            .filter(([key]) => key !== 'Free')
            .map(([key, info]) => {
              const isActive = selectedSector === key;
              return (
                <Chip
                  key={key}
                  label={info.label}
                  size='small'
                  onClick={() => setSelectedSector(isActive ? null : key)}
                  sx={{ fontWeight: 700, flexShrink: 0, height: 28, bgcolor: isActive ? info.color : 'action.hover', color: isActive ? 'white' : 'text.secondary', border: 'none' }}
                />
              );
            })}
        </Box>

        <Stack
          spacing={2}
          sx={{
            px: 2,
            pb: { xs: 12, md: 3 },
            overflowY: 'auto',
            flex: 1,
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
          }}
        >
          {/* Initial load spinner — only when no data yet */}
          {isLoading && (
            <Box display='flex' justifyContent='center' p={4}><CircularProgress /></Box>
          )}

          {isError && !isLoading && (
            <Typography color='error' align='center' sx={{ p: 4 }}>Error loading nearby places.</Typography>
          )}

          {/* Empty state — no filter results */}
          {!isLoading && !isError && filteredLocations.length === 0 && (searchTerm.length > 0 || !!selectedSector) && (
            <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
              <SearchOff sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5 }} />
              <Typography variant='subtitle1' fontWeight={700} color='text.secondary'>
                No partners found
              </Typography>
              <Typography variant='body2' color='text.disabled' sx={{ mt: 0.5, mb: 2 }}>
                Try adjusting your search or sector filter.
              </Typography>
              <Button variant='outlined' size='small' sx={{ borderRadius: 2, fontWeight: 700 }} onClick={() => { setSearchTerm(''); setSelectedSector(null); }}>
                Clear Filters
              </Button>
            </Box>
          )}

          {/* Empty state — no nearby partners at all */}
          {!isLoading && !isError && filteredLocations.length === 0 && searchTerm.length === 0 && !selectedSector && (
            <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
              <StorefrontIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5 }} />
              <Typography variant='subtitle1' fontWeight={700} color='text.secondary'>
                No partners near you yet
              </Typography>
              <Typography variant='body2' color='text.disabled' sx={{ mt: 0.5 }}>
                Try zooming out on the map or check back later.
              </Typography>
            </Box>
          )}

          {filteredLocations.map((partner, index) => {
              const sectorInfo = BUSINESS_SECTORS[partner.sector] || BUSINESS_SECTORS.Retail;

              return (
                <motion.div key={partner.location_id} custom={index} variants={listItemVariants} initial="hidden" animate="visible">
                  <Paper
                    elevation={0}
                    onClick={() => setSelectedLocationId(partner.location_id)}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'transform 160ms ease-out, background-color 150ms ease-out, box-shadow 150ms ease-out',
                      '&:active': { transform: 'scale(0.97)' },
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.01)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
                    }}
                  >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      src={partner.logo_url ? `${import.meta.env.VITE_R2_PUBLIC_URL}/business-logos/${partner.logo_url}` : undefined}
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: sectorInfo.bgColor,
                        color: sectorInfo.color,
                        borderRadius: 3,
                        fontWeight: 700,
                        '& svg': { fontSize: 28 },
                      }}
                    >
                      {!partner.logo_url && sectorInfo.icon}
                    </Avatar>

                    <Box>
                      <Typography variant='subtitle1' sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        {partner.name}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Typography variant='caption' sx={{ fontWeight: 600, color: 'text.secondary' }}>
                          {userLocation
                            ? `${haversineKm(userLocation.latitude, userLocation.longitude, partner.latitude, partner.longitude).toFixed(1)} km away`
                            : sectorInfo.label}
                        </Typography>
                        <Chip
                          icon={<CheckCircle sx={{ fontSize: '12px !important' }} />}
                          label='Active'
                          size='small'
                          sx={{
                            height: 20,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            bgcolor: 'rgba(46, 125, 50, 0.1)',
                            color: 'success.main',
                            '& .MuiChip-icon': { color: 'success.main' },
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  <Button
                    variant='text'
                    sx={{ minWidth: 'auto', display: 'flex', flexDirection: 'column', gap: 0.5, p: 1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (partner.latitude && partner.longitude) {
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${partner.latitude},${partner.longitude}`;
                        window.open(url, '_blank');
                      }
                    }}
                  >
                    <Directions color='primary' />
                    <Typography variant='caption' sx={{ fontWeight: 700, color: 'primary.main', lineHeight: 1 }}>Go</Typography>
                  </Button>
                  </Paper>
                </motion.div>
              );
            })}
        </Stack>
      </Paper>

      {/* POPUP DRAWER */}
      <MapBusinessPopup
        location={selectedLocation}
        onClose={() => setSelectedLocationId(null)}
      />
    </Box>
  );
};

export default NearbyPage;