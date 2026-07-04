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

// Architecture Imports
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import BusinessMap from '../components/BusinessMap';
import MapBusinessPopup from '../components/MapBusinessPopup';
import { useNearbyWithZoom } from '../hooks/useNearbyWithZoom';
import { useBusinessSearch } from '../hooks/useBusinessSearch';
import { BUSINESS_SECTORS, UNKNOWN_SECTOR } from '../../admin/data';
import { useMenuDrawer } from '../../../shared/context/MenuDrawerContext';
import { useAppSelector } from '../../../store/hook';
import { selectCurrentUser } from '../../../store/selectors/authSelectors';
import { getUserInitials } from '../../../shared/utils/string';
import { formatDistanceMiles } from '../../../shared/utils/distance';
import { GRADIENT_PRIMARY } from '../../../shared/colors';
import TapButton from '../../../shared/components/TapButton';
import { staggerContainer, pressable, pressableCard, pressableIcon, SPRING_POP } from '../../../shared/motion';

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Cascade list items with springy pop entrance - overrides popIn with per-item stagger delay
const listItemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.92 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...SPRING_POP, delay: i * 0.07 },
  }),
};

const NearbyPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [focusTarget, setFocusTarget] = useState<{ lat: number; lng: number } | null>(null);
  const { openMenu } = useMenuDrawer();

  // Debounce the search box so global search fires at most once per 400ms of typing.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

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
  const { userLocation } = useAppSelector((state) => state.auth);
  const { locations, isLoading, isFetching, isError, onViewportChange } = useNearbyWithZoom(selectedSector);

  // Global search drives the LIST (finds businesses ANYWHERE, not just the on-screen viewport);
  // the MAP keeps showing viewport-nearby markers and only moves when a result is tapped.
  const isSearching = debouncedSearch.trim().length >= 2;
  const { data: searchResults = [], isLoading: isSearchLoading, isError: isSearchError } = useBusinessSearch(debouncedSearch, isSearching);
  const filteredLocations = isSearching ? searchResults : locations;
  const listLoading = isSearching ? isSearchLoading : isLoading;
  const listError = isSearching ? isSearchError : isError;

  // 3. Find the specific location object for the popup - may come from nearby OR the search results.
  const selectedLocation =
    [...locations, ...searchResults].find((loc) => loc.location_id === selectedLocationId) || null;

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
          locations={locations}
          userLocation={userLocation}
          onBusinessClick={(id) => setSelectedLocationId(id)}
          onViewportChange={onViewportChange}
          focusLocation={focusTarget}
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

          {/* Avatar menu button - mobile only. Opens the shared app menu drawer. */}
          <IconButton
            onClick={openMenu}
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
          component={motion.button}
          onClick={() => refreshLocation()}
          {...pressableIcon}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.3 }}
          sx={{
            position: 'absolute',
            bottom: { xs: 34, md: 25 },
            right: 16,
            bgcolor: 'background.paper',
            boxShadow: 3,
            zIndex: 11,
            '&:hover': { bgcolor: 'background.paper' },
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

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, pt: { xs: 0, md: 2 }, pb: 1 }}>
          <Typography variant='h6' sx={{ fontWeight: 700 }}>Partners List</Typography>
          {isFetching && !isLoading && <CircularProgress size={14} thickness={5} />}
        </Box>

        {/* Filter bar */}
        <Box sx={{ px: 2, pt: 1, pb: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          {/* Sector chips */}
          <Box sx={{
            display: 'flex', gap: 0.75, overflowX: 'auto', pb: 1,
            scrollbarWidth: 'none',
            // Constrain the gesture to horizontal panning so a small vertical finger jitter
            // while tapping a chip isn't treated as a scroll (which cancels the click).
            touchAction: 'pan-x',
          }}>
            {[{ key: null, label: 'All', icon: null }, ...Object.entries(BUSINESS_SECTORS).filter(([k]) => k !== 'Free').map(([k, v]) => ({ key: k, label: v.label, icon: v.icon }))].map(({ key, label, icon }) => {
              const active = key === null ? !selectedSector : selectedSector === key;
              return (
                <motion.div
                  key={String(key)}
                  {...pressableCard}
                  style={{ flexShrink: 0 }}
                >
                  <TapButton
                    size='small'
                    onTap={() => setSelectedSector(key as string | null)}
                    startIcon={icon ? <Box sx={{ display: 'flex', '& svg': { fontSize: '13px !important' } }}>{icon as React.ReactElement}</Box> : undefined}
                    sx={{
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
                  </TapButton>
                </motion.div>
              );
            })}
          </Box>

        </Box>

        <Stack
          component={motion.div}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          spacing={1.5}
          sx={{
            px: 2,
            pt: 1.5,
            pb: { xs: 12, md: 3 },
            overflowY: 'auto',
            flex: 1,
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
            // Vertical-only scrolling so a horizontal finger jitter while tapping a card
            // isn't treated as a scroll (which would cancel the tap).
            touchAction: 'pan-y',
          }}
        >
          {/* Initial load spinner - only when no data yet */}
          {listLoading && (
            <Box display='flex' justifyContent='center' p={4}><CircularProgress /></Box>
          )}

          {listError && !listLoading && (
            <Typography color='error' align='center' sx={{ p: 4 }}>Error loading nearby places.</Typography>
          )}

          {/* Empty state - no filter results */}
          {!listLoading && !listError && filteredLocations.length === 0 && (searchTerm.length > 0 || !!selectedSector) && (
            <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
              <SearchOff sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5 }} />
              <Typography variant='subtitle1' fontWeight={700} color='text.secondary'>
                No partners found
              </Typography>
              <Typography variant='body2' color='text.disabled' sx={{ mt: 0.5, mb: 2 }}>
                Try adjusting your search or sector filter.
              </Typography>
              <motion.div {...pressable}>
                <Button
                  variant='outlined'
                  size='small'
                  sx={{ fontWeight: 700 }}
                  onClick={() => { setSearchTerm(''); setSelectedSector(null); }}
                >
                  Clear Filters
                </Button>
              </motion.div>
            </Box>
          )}

          {/* Empty state - no nearby partners at all */}
          {!listLoading && !listError && filteredLocations.length === 0 && searchTerm.length === 0 && !selectedSector && (
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
                <motion.div
                  key={partner.location_id}
                  custom={index}
                  variants={listItemVariants}
                  initial="hidden"
                  animate="visible"
                  {...pressableCard}
                >
                  <Paper
                    elevation={0}
                    onClick={() => {
                      setSelectedLocationId(partner.location_id);
                      // Fly the map to the tapped business (esp. useful for off-screen search hits).
                      if (partner.latitude && partner.longitude) {
                        setFocusTarget({ lat: partner.latitude, lng: partner.longitude });
                      }
                    }}
                    sx={{
                      p: 1.25,
                      borderRadius: '16px',
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      opacity: 1,
                      transition: 'background-color 150ms ease-out, box-shadow 150ms ease-out',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.01)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
                    }}
                  >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
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
                            ? `${formatDistanceMiles(haversineKm(userLocation.latitude, userLocation.longitude, partner.latitude, partner.longitude))} away`
                            : sectorInfo.label}
                        </Typography>
                        <Chip
                          icon={<CheckCircle sx={{ fontSize: '12px !important' }} />}
                          label='Partner'
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
        locationId={selectedLocationId}
        basicInfo={selectedLocation}
        onClose={() => setSelectedLocationId(null)}
        userLocation={userLocation}
      />
    </Box>
  );
};

export default NearbyPage;