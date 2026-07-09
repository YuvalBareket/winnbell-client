import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { SECTOR_CONFIG, DEFAULT_SECTOR } from '../../../../shared/sectorConfig';
import { BORDER_LIGHT, BG_SUBTLE } from '../../../../shared/colors';

setOptions({ key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '', v: 'weekly' });
const mapsLib = importLibrary('maps');

// Default view before any address is chosen (Newark, DE - the company base).
const DEFAULT_CENTER = { lat: 39.6837, lng: -75.7497 };

type Location = {
  name: string;
  address: string;
  lat: number | null;
  lon: number | null;
  suite: string;
  phone: string;
};

type Props = {
  locations: Location[];
  activeIndex: number;
  sector: string | null | undefined;
};

// Same sector-config lookup the public nearby map uses, so setup pins match the live map.
function getSectorConfig(sector: string | null | undefined) {
  if (!sector) return DEFAULT_SECTOR;
  const key = sector.trim();
  return (
    SECTOR_CONFIG[key] ??
    SECTOR_CONFIG[key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()] ??
    DEFAULT_SECTOR
  );
}

// Teardrop pin with the business's sector icon (matches BusinessMap). The active location's
// pin is drawn a little larger so it stands out among multiple branches.
function makePinIcon(sector: string | null | undefined, active: boolean): google.maps.Icon {
  const { color, iconPath } = getSectorConfig(sector);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="46" viewBox="0 0 38 46">
    <path d="M19 1C9.61 1 2 8.61 2 18c0 13.25 17 27 17 27S36 31.25 36 18C36 8.61 28.39 1 19 1z" fill="${color}" stroke="white" stroke-width="1.5"/>
    <circle cx="19" cy="18" r="11" fill="white" opacity="0.93"/>
    <g transform="translate(11,10) scale(0.667)" fill="${color}"><path d="${iconPath}"/></g>
  </svg>`;
  const w = active ? 34 : 26;
  const h = active ? 41 : 32;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(w, h),
    anchor: new google.maps.Point(w / 2, h),
  };
}

/** Display-only map of the business's location pins. The address is entered in the form's
 *  Street address field (which sets the coordinates); this map just visualizes them. */
export default function LocationsMap({ locations, activeIndex, sector }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<number, google.maps.Marker>>(new Map());
  const [mapReady, setMapReady] = useState(false);

  // Initialize the map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;
    mapsLib.then(({ Map }) => {
      if (cancelled || !containerRef.current) return;
      mapRef.current = new Map(containerRef.current, {
        center: DEFAULT_CENTER,
        zoom: 11,
        disableDefaultUI: true,
        clickableIcons: false,
        gestureHandling: 'greedy',
      });
      setMapReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  // Fires the pin sync on real content changes: react-hook-form's watch() can return the SAME
  // array reference when a nested field mutates, so depending on `locations` alone misses updates.
  const locationsKey = locations.map((l) => `${l.lat},${l.lon},${l.name}`).join('|');

  // Sync the pins to the current locations and pan to the active one.
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const markers = markersRef.current;

    locations.forEach((loc, index) => {
      if (loc.lat == null || loc.lon == null) {
        const m = markers.get(index);
        if (m) { m.setMap(null); markers.delete(index); }
        return;
      }
      const pos = { lat: loc.lat, lng: loc.lon };
      let marker = markers.get(index);
      if (!marker) {
        marker = new google.maps.Marker({ position: pos, map, title: loc.name || `Location ${index + 1}` });
        markers.set(index, marker);
      } else {
        marker.setPosition(pos);
        marker.setTitle(loc.name || `Location ${index + 1}`);
      }
      marker.setIcon(makePinIcon(sector, index === activeIndex));
      marker.setZIndex(index === activeIndex ? 2 : 1);
    });

    // Drop markers for removed locations.
    const toRemove: number[] = [];
    markers.forEach((m, index) => { if (index >= locations.length) { m.setMap(null); toRemove.push(index); } });
    toRemove.forEach((i) => markers.delete(i));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- locationsKey stands in for `locations` (see note above)
  }, [locationsKey, activeIndex, mapReady, sector]);

  // Navigate the map to the active location whenever its coordinates change (e.g. you pick an
  // address in the form) or you switch which location is active. Keyed on the lat/lon primitives
  // so it fires reliably even when the locations array keeps the same reference.
  const activeLat = locations[activeIndex]?.lat ?? null;
  const activeLon = locations[activeIndex]?.lon ?? null;
  useEffect(() => {
    if (!mapReady || !mapRef.current || activeLat == null || activeLon == null) return;
    mapRef.current.panTo({ lat: activeLat, lng: activeLon });
    mapRef.current.setZoom(16);
  }, [mapReady, activeLat, activeLon]);

  return (
    <Box sx={{ position: 'relative', height: '100%', borderRadius: '16px', overflow: 'hidden', border: `1px solid ${BORDER_LIGHT}`, bgcolor: BG_SUBTLE }}>
      <Box ref={containerRef} sx={{ width: '100%', height: '100%' }} />
    </Box>
  );
}
