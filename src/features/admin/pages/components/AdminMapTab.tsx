import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import {
  Box,
  Card,
  Stack,
  Typography,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import { SECTOR_CONFIG, DEFAULT_SECTOR } from '../../../../shared/sectorConfig';
import { spreadOffsets, type PixelOffset } from '../../../../shared/mapPinSpread';
import {
  BG_PAGE,
  BORDER_LIGHT,
  STATUS_ACTIVATED_BG,
  STATUS_ACTIVATED_TEXT,
  STATUS_PENDING_TEXT,
  NEUTRAL_INACTIVE_ICON,
  TEXT_HEADING,
  TEXT_SECONDARY,
  TEXT_TERTIARY_AA,
  BG_ROW_SUBTLE,
  ERROR_BG_TINT,
  ERROR_MAIN,
  METRIC_WARN,
  METRIC_WARN_TINT,
  GRADIENT_PRIMARY,
} from '../../../../shared/colors';
import { useAdminMapLocations, type AdminMapLocation } from '../../hooks/useAdmin';
import MapBusinessPopup from '../../../nearBy/components/MapBusinessPopup';

setOptions({
  key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '',
  v: 'weekly',
});

const CLEAN_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
];

function getSectorConfig(sector: string | null | undefined) {
  if (!sector) return DEFAULT_SECTOR;
  const key = sector.trim();
  return (
    SECTOR_CONFIG[key] ??
    SECTOR_CONFIG[key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()] ??
    DEFAULT_SECTOR
  );
}

function makePinSvg(sector: string | null | undefined, isInactive: boolean, isPaused: boolean): string {
  const { color, iconPath } = getSectorConfig(sector);
  const fillColor = isInactive ? NEUTRAL_INACTIVE_ICON : color;
  const overlay = isPaused ? `<circle cx="19" cy="18" r="13" fill="none" stroke="${METRIC_WARN}" stroke-width="2.5" opacity="0.8"/>` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="46" viewBox="0 0 38 46">
    <path d="M19 1C9.61 1 2 8.61 2 18c0 13.25 17 27 17 27S36 31.25 36 18C36 8.61 28.39 1 19 1z" fill="${fillColor}" stroke="white" stroke-width="1.5" opacity="${isInactive ? 0.45 : 1}"/>
    <circle cx="19" cy="18" r="11" fill="white" opacity="${isInactive ? 0.5 : 0.93}"/>
    <g transform="translate(11,10) scale(0.667)" fill="${fillColor}">
      <path d="${iconPath}"/>
    </g>
    ${overlay}
  </svg>`;
}

// `offset` (overlapping-pin spread) shifts the RENDERED icon in screen pixels while the
// marker keeps its true geographic position - anchor moves opposite the image.
function makePinIcon(sector: string | null | undefined, isInactive: boolean, isPaused: boolean, offset?: PixelOffset): google.maps.Icon {
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(makePinSvg(sector, isInactive, isPaused))}`,
    scaledSize: new google.maps.Size(26, 32),
    anchor: new google.maps.Point(13 - (offset?.dx ?? 0), 32 - (offset?.dy ?? 0)),
  };
}

const mapsLib = importLibrary('maps');

type ViewportBounds = { minLat: number; maxLat: number; minLng: number; maxLng: number };

export default function AdminMapTab() {
  const navigate = useNavigate();
  const mapRef = useRef<google.maps.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersByLocRef = useRef<Map<number, google.maps.Marker>>(new Map());
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const infoWindowContentRef = useRef<AdminMapLocation | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [bounds, setBounds] = useState<ViewportBounds | null>(null);
  // "View business" opens the location's PUBLIC profile drawer, as customers see it.
  const [profileLocationId, setProfileLocationId] = useState<number | null>(null);
  const idleDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: locations = [], isLoading } = useAdminMapLocations(bounds);

  // Define showInfoWindow before it's used in marker click handlers
  const showInfoWindow = useCallback((map: google.maps.Map, marker: google.maps.Marker, location: AdminMapLocation) => {
    if (!infoWindowRef.current) {
      // disableAutoPan: opening the popup must never move the map - the admin is scanning a
      // fixed area and a re-center on every pin click loses their place (user-requested).
      infoWindowRef.current = new google.maps.InfoWindow({ disableAutoPan: true });
    }

    const sectorConfig = getSectorConfig(location.sector);
    const statusChips: Array<{ label: string; color: 'success' | 'warning' | 'default' | 'error' }> = [];

    if (location.is_paused) {
      statusChips.push({ label: 'Paused', color: 'warning' });
    } else if (!location.location_active) {
      statusChips.push({ label: 'Inactive location', color: 'error' });
    } else if (location.is_participating) {
      statusChips.push({ label: 'Participating', color: 'success' });
    } else {
      statusChips.push({ label: 'Not in campaign', color: 'default' });
    }

    const content = `
      <div style="
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        padding: 12px;
        max-width: 280px;
        color: ${TEXT_HEADING};
      ">
        <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">
          ${escapeHtml(location.business_name || 'Unknown')}
        </div>
        <div style="font-size: 12px; color: ${TEXT_SECONDARY}; margin-bottom: 8px;">
          <div>${escapeHtml(location.location_name || 'N/A')}</div>
          <div style="font-size: 11px; color: ${TEXT_TERTIARY_AA};">${escapeHtml(location.address || '')}</div>
        </div>

        <div style="
          display: inline-block;
          background-color: ${sectorConfig.bgColor};
          color: ${sectorConfig.color};
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 8px;
        ">
          ${escapeHtml(location.sector || 'Other')}
        </div>

        <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px;">
          ${statusChips.map((chip) => {
            const colorMap = {
              success: { bg: STATUS_ACTIVATED_BG, text: STATUS_ACTIVATED_TEXT },
              warning: { bg: METRIC_WARN_TINT, text: METRIC_WARN },
              error: { bg: ERROR_BG_TINT, text: ERROR_MAIN },
              default: { bg: BG_ROW_SUBTLE, text: TEXT_SECONDARY },
            };
            const colors = colorMap[chip.color];
            return `
              <span style="
                background-color: ${colors.bg};
                color: ${colors.text};
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 600;
              ">
                ${escapeHtml(chip.label)}
              </span>
            `;
          }).join('')}
        </div>

        ${location.subscription_status ? `
          <div style="font-size: 11px; color: ${TEXT_TERTIARY_AA}; margin-bottom: 8px;">
            Subscription: ${escapeHtml(location.subscription_status)}
          </div>
        ` : ''}

        <div style="font-size: 12px; margin-bottom: 8px;">
          <strong>${location.entries_current}</strong> entries this campaign
        </div>

        <button onclick="window.adminMapViewProfile?.(${location.location_id})" style="
          background: ${GRADIENT_PRIMARY};
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
        ">
          View business
        </button>
        <button onclick="window.adminMapViewBusiness?.(${location.business_id})" style="
          background: transparent;
          color: ${TEXT_SECONDARY};
          border: none;
          padding: 6px 0 0;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          text-decoration: underline;
        ">
          Open admin dashboard
        </button>
      </div>
    `;

    infoWindowRef.current.setContent(content);
    infoWindowRef.current.open(map, marker);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    mapsLib.then(({ Map }) => {
      if (cancelled || !containerRef.current) return;

      const map = new Map(containerRef.current, {
        center: { lat: 25.76, lng: -80.19 },
        zoom: 11,
        styles: CLEAN_STYLES,
        disableDefaultUI: true,
        clickableIcons: false,
      });

      mapRef.current = map;
      setMapReady(true);

      map.addListener('idle', () => {
        if (idleDebounceRef.current) clearTimeout(idleDebounceRef.current);
        idleDebounceRef.current = setTimeout(() => {
          const mapBounds = map.getBounds();
          if (mapBounds) {
            const sw = mapBounds.getSouthWest();
            const ne = mapBounds.getNorthEast();
            setBounds({
              minLat: sw.lat(),
              maxLat: ne.lat(),
              minLng: sw.lng(),
              maxLng: ne.lng(),
            });
          }
        }, 80);
      });
    }).catch((err) => {
      // Missing/invalid Maps API key or a blocked SDK load must not fail silently into a
      // blank gray box - surface it for diagnosis.
      console.error('[AdminMapTab] Google Maps failed to load:', err);
    });

    return () => {
      cancelled = true;
      if (idleDebounceRef.current) clearTimeout(idleDebounceRef.current);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const markersRef = markersByLocRef.current;
      markersRef.forEach((m) => m.setMap(null));
      markersRef.clear();
      infoWindowRef.current?.close();
      mapRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Sync business markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !locations) return;

    // Overlapping-pin spread: pixel offsets baked into icon anchors (screen-space, so
    // separation is zoom-constant with zero work during gestures - fully smooth).
    const offsets = spreadOffsets(
      locations.map((l) => ({ id: l.location_id, lat: Number(l.latitude), lng: Number(l.longitude) })),
    );

    const markersRef = markersByLocRef.current;
    const nextIds = new Set<number>();
    locations.forEach((loc) => {
      const id = loc.location_id;
      nextIds.add(id);

      const isInactive = !loc.location_active;
      const isPaused = loc.is_paused;

      if (!markersRef.has(id)) {
        const marker = new google.maps.Marker({
          map,
          position: { lat: Number(loc.latitude), lng: Number(loc.longitude) },
          icon: makePinIcon(loc.sector, isInactive, isPaused, offsets.get(id)),
          title: loc.location_name || loc.business_name,
          cursor: 'pointer',
        });

        marker.addListener('click', () => {
          infoWindowContentRef.current = loc;
          showInfoWindow(map, marker, loc);
        });

        markersRef.set(id, marker);
      } else {
        // Refresh EXISTING markers too: a location whose status changed server-side (paused,
        // deactivated, moved) must not keep its stale icon/position, and the click handler
        // must close over the FRESH row or the popup shows outdated data.
        const existing = markersRef.get(id)!;
        existing.setIcon(makePinIcon(loc.sector, isInactive, isPaused, offsets.get(id)));
        existing.setPosition({ lat: Number(loc.latitude), lng: Number(loc.longitude) });
        existing.setTitle(loc.location_name || loc.business_name);
        google.maps.event.clearListeners(existing, 'click');
        existing.addListener('click', () => {
          infoWindowContentRef.current = loc;
          showInfoWindow(map, existing, loc);
        });
      }
    });

    markersRef.forEach((marker, id) => {
      if (!nextIds.has(id)) {
        marker.setMap(null);
        markersRef.delete(id);
      }
    });
  }, [locations, mapReady, showInfoWindow]);

  // Expose the InfoWindow button handlers. "View business" opens the PUBLIC location
  // profile drawer (MapBusinessPopup in adminView mode) - exactly what a customer sees
  // when tapping this pin on the consumer map; "Open admin dashboard" keeps the old
  // admin business view a click away.
  useEffect(() => {
    const windowObj = window as unknown as Record<string, unknown>;
    windowObj.adminMapViewBusiness = (businessId: number) => {
      navigate(`/admin/businesses/${businessId}/view`);
    };
    windowObj.adminMapViewProfile = (locationId: number) => {
      setProfileLocationId(locationId);
    };

    return () => {
      delete windowObj.adminMapViewBusiness;
      delete windowObj.adminMapViewProfile;
    };
  }, [navigate]);

  const isAtMax = locations.length === 30;
  // Full overlay before the first data exists: pre-bounds (query disabled) or first fetch
  // in flight. `locations` defaults to [] so a falsy check would never fire.
  const loadingOrNoData = !bounds || (isLoading && locations.length === 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Card
        sx={{
          borderRadius: '16px',
          border: `1px solid ${BORDER_LIGHT}`,
          height: 'calc(100vh - 260px)',
          minHeight: 480,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: BG_PAGE,
        }}
      >
        {loadingOrNoData && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.8)',
              zIndex: 10,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {isLoading && (locations?.length ?? 0) > 0 && (
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9 }}>
            <LinearProgress />
          </Box>
        )}

        <div ref={containerRef} style={{ width: '100%', height: '100%', borderRadius: '8px' }} />
      </Card>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          sx={{
            borderRadius: '12px',
            border: `1px solid ${BORDER_LIGHT}`,
            backgroundColor: BG_PAGE,
          }}
        >
          <Box sx={{ p: 2 }}>
            <Stack direction='row' spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: STATUS_ACTIVATED_TEXT,
                  }}
                />
                <Typography variant='body2' color='text.secondary'>
                  Participating
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: STATUS_PENDING_TEXT,
                  }}
                />
                <Typography variant='body2' color='text.secondary'>
                  Paused
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: NEUTRAL_INACTIVE_ICON,
                  }}
                />
                <Typography variant='body2' color='text.secondary'>
                  Inactive
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Typography variant='body2' color='text.secondary' sx={{ px: 0.5 }}>
          Showing {locations ? locations.length : 0} location{locations && locations.length !== 1 ? 's' : ''} in view
          {isAtMax && ' (max 30) - zoom in to see more'}
        </Typography>
      </motion.div>

      {/* The public location profile, rendered by the SAME component customers get on the
          consumer map - fetched live, with the submit action inert for admins. */}
      <MapBusinessPopup
        locationId={profileLocationId}
        basicInfo={null}
        onClose={() => setProfileLocationId(null)}
        adminView
      />
    </Box>
  );
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
