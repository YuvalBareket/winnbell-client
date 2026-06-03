import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  InputBase,
  Button,
  Avatar,
  Stack,
  CircularProgress,
  Chip,
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
import { BUSINESS_SECTORS, UNKNOWN_SECTOR } from '../../admin/data';
import AppMenuDrawer from '../../../shared/components/AppMenuDrawer';
import { useAppSelector } from '../../../store/hook';
import { selectCurrentUser } from '../../../store/selectors/authSelectors';
import { getUserInitials } from '../../../shared/utils/string';
import { GRADIENT_PRIMARY } from '../../../shared/colors';

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
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const user = useAppSelector(selectCurrentUser);
  const initials = getUserInitials(user?.fullName);

  const SNAP_PERCENTS = [28, 50, 75];
  const getSnapPx = (p: number) => (p / 100) * window.innerHeight;

  // Motion value drives height — no React re-renders during drag
  const sheetHeightMv = useMotionValue(getSnapPx(50));
  const mapHeightMv = useTransform(sheetHeightMv, (h) => window.innerHeight - h);

  const dragHandleRef = useRef<HTMLDivElement>(null);
  const dragStartYRef = useRef(0);
  const dragStartHeightRef = useRef(0);

  useEffect(() => {
    const el = dragHandleRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      dragStartYRef.current = e.touches[0].clientY;
      dragStartHeightRef.current = sheetHeightMv.get();
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // Non-passive — prevents browser overscroll/stretch
      const delta = dragStartYRef.current - e.touches[0].clientY;
      const next = Math.max(getSnapPx(20), Math.min(getSnapPx(85), dragStartHeightRef.current + delta));
      sheetHeightMv.set(next);
    };

    const onTouchEnd = () => {
      const current = sheetHeightMv.get();
      const snapsPx = SNAP_PERCENTS.map(getSnapPx);
      const nearest = snapsPx.reduce((a, b) => (Math.abs(b - current) < Math.abs(a - current) ? b : a));
      animate(sheetHeightMv, nearest, { type: 'spring', stiffness: 500, damping: 45 });
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  // 1. Get Current Location (Updates Redux)
  const { refreshLocation } = useCurrentLocation();

  // 2. Pull Location and Fetch Data
  const { userLocation } = useSelector((state: RootState) => state.auth);
  const { locations, isLoading, isFetching, isError, onViewportChange } = useNearbyWithZoom(selectedSector, searchTerm);

  // 3. Find the specific location object for the popup
  const selectedLocation =
    locations.find((loc) => loc.location_id === selectedLocationId) || null;

  const filteredLocations = locations;

  return (
    <Box
      sx={{
        width: '100%',
        height: { xs: '100dvh', md: '100dvh' },
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        overflow: 'hidden',
      }}
    >
      {/* 1. MAP SECTION */}
      <Box
        component={motion.div}
        style={{ height: mapHeightMv } as unknown as React.CSSProperties}
        sx={{
          position: 'relative',
          width: '100%',
          flex: { md: 1 },
          bgcolor: '#e3f2fd',
          flexShrink: { md: 0 },
          // On desktop, override the motion value height so flexbox takes control
          '@media (min-width: 900px)': { height: '100% !important' },
        }}
      >
        <BusinessMap
          locations={filteredLocations}
          userLocation={userLocation}
          onBusinessClick={(id) => setSelectedLocationId(id)}
          onViewportChange={onViewportChange}
        />

        {/* Floating Search Bar */}
        <Box sx={{ position: 'absolute', top: 7, left: 20, right: 20, zIndex: 10, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Paper
            elevation={3}
            sx={{ flex: 1, p: '2px 4px', display: 'flex', alignItems: 'center', borderRadius: 4, height: 48 }}
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

          {/* Avatar menu button - mobile only */}
          <IconButton
            onClick={() => setMenuOpen(true)}
            sx={{
              display: { xs: 'flex', md: 'none' },
              p: 0,
              flexShrink: 0,
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                background: GRADIENT_PRIMARY,
                color: 'white',
                fontWeight: 800,
                fontSize: 13,
                borderRadius: '12px',
                boxShadow: 2,
              }}
            >
              {initials}
            </Avatar>
          </IconButton>
        </Box>

        {/* Recenter Button */}
        <IconButton
          onClick={() => refreshLocation()}
          sx={{
            position: 'absolute',
            bottom: { xs: 34, md: 25 },
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
        component={motion.div}
        elevation={0}
        style={{ height: sheetHeightMv } as unknown as React.CSSProperties}
        sx={{
          flex: { md: '0 0 380px' },
          width: { md: '380px' },
          mt: { xs: '-24px', md: 0 },
          // On desktop, override the motion value height so flexbox takes control
          '@media (min-width: 900px)': { height: '100% !important' },
          borderTopLeftRadius: { xs: 24, md: 0 },
          borderTopRightRadius: { xs: 24, md: 0 },
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          position: 'relative',
          zIndex: 12,
          bgcolor: 'background.default',
          boxShadow: { xs: '0px -4px 20px rgba(0,0,0,0.05)', md: '-4px 0 20px rgba(0,0,0,0.05)' },
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Drag handle - mobile only */}
        <Box
          ref={dragHandleRef}
          sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', alignItems: 'center', pt: 2, pb: 1.5, cursor: 'grab', flexShrink: 0, touchAction: 'none' }}
        >
          <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: 'divider' }} />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, pt: { xs: 0, md: 2 }, pb: 1.5 }}>
          <Typography variant='h6' sx={{ fontWeight: 700 }}>Partners List</Typography>
          {isFetching && !isLoading && <CircularProgress size={14} thickness={5} />}
        </Box>

        {/* Filter bar */}
        <Box sx={{ px: 2, pt: 1, pb: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          {/* Sector chips */}
          <Box sx={{
            display: 'flex', gap: 0.75, overflowX: 'auto', pb: 1,
            scrollbarWidth: 'none',
          }}>
            {[{ key: null, label: 'All', icon: null }, ...Object.entries(BUSINESS_SECTORS).filter(([k]) => k !== 'Free').map(([k, v]) => ({ key: k, label: v.label, icon: v.icon }))].map(({ key, label, icon }) => {
              const active = key === null ? !selectedSector : selectedSector === key;
              return (
                <Button
                  key={String(key)}
                  size='small'
                  onClick={() => setSelectedSector(key as string | null)}
                  startIcon={icon ? <Box sx={{ display: 'flex', '& svg': { fontSize: '13px !important' } }}>{icon as React.ReactElement}</Box> : undefined}
                  sx={{
                    flexShrink: 0,
                    height: 26,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    px: 1.25,
                    minWidth: 'unset',
                    bgcolor: active ? 'primary.main' : 'transparent',
                    color: active ? 'white' : 'text.secondary',
                    border: '1px solid',
                    borderColor: active ? 'primary.main' : 'divider',
                    '& .MuiButton-startIcon': { mr: icon ? '4px' : 0, ml: 0 },
                  }}
                >
                  {label}
                </Button>
              );
            })}
          </Box>

        </Box>

        <Stack
          spacing={1.5}
          sx={{
            px: 2,
            pt: 1.5,
            pb: { xs: 12, md: 3 },
            overflowY: 'auto',
            flex: 1,
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
          }}
        >
          {/* Initial load spinner - only when no data yet */}
          {isLoading && (
            <Box display='flex' justifyContent='center' p={4}><CircularProgress /></Box>
          )}

          {isError && !isLoading && (
            <Typography color='error' align='center' sx={{ p: 4 }}>Error loading nearby places.</Typography>
          )}

          {/* Empty state - no filter results */}
          {!isLoading && !isError && filteredLocations.length === 0 && (searchTerm.length > 0 || !!selectedSector) && (
            <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
              <SearchOff sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5 }} />
              <Typography variant='subtitle1' fontWeight={700} color='text.secondary'>
                No partners found
              </Typography>
              <Typography variant='body2' color='text.disabled' sx={{ mt: 0.5, mb: 2 }}>
                Try adjusting your search or sector filter.
              </Typography>
              <Button variant='outlined' size='small' sx={{ fontWeight: 700 }} onClick={() => { setSearchTerm(''); setSelectedSector(null); }}>
                Clear Filters
              </Button>
            </Box>
          )}

          {/* Empty state - no nearby partners at all */}
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
              const sectorInfo = BUSINESS_SECTORS[partner.sector] || UNKNOWN_SECTOR;

              return (
                <motion.div key={partner.location_id} custom={index} variants={listItemVariants} initial="hidden" animate="visible">
                  <Paper
                    elevation={0}
                    onClick={() => setSelectedLocationId(partner.location_id)}
                    sx={{
                      p: 1.25,
                      borderRadius: 6,
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      opacity: partner.cap_reached ? 0.6 : 1,
                      transition: 'transform 160ms ease-out, background-color 150ms ease-out, box-shadow 150ms ease-out',
                      '&:active': { transform: 'scale(0.97)' },
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.01)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
                    }}
                  >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      src={partner.logo_url ? `${import.meta.env.VITE_R2_PUBLIC_URL}/business-logos/${partner.logo_url}` : undefined}
                      sx={{
                        width: 42,
                        height: 42,
                        bgcolor: sectorInfo.bgColor,
                        color: sectorInfo.color,
                        borderRadius: '50%',
                        fontWeight: 700,
                        '& svg': { fontSize: 20 },
                      }}
                    >
                      {!partner.logo_url && sectorInfo.icon}
                    </Avatar>

                    <Box>
                      <Typography variant='body2' sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        {partner.name}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Typography variant='caption' sx={{ fontWeight: 600, color: 'text.secondary' }}>
                          {userLocation
                            ? `${haversineKm(userLocation.latitude, userLocation.longitude, partner.latitude, partner.longitude).toFixed(1)} km away`
                            : sectorInfo.label}
                        </Typography>
                        {partner.cap_reached ? (
                          <Chip
                            label='Entries Full'
                            size='small'
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              bgcolor: 'rgba(0,0,0,0.06)',
                              color: 'text.disabled',
                            }}
                          />
                        ) : (
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
                        )}
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
        userLocation={userLocation}
      />

      {/* Mobile menu drawer */}
      <AppMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </Box>
  );
};

export default NearbyPage;