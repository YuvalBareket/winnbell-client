import { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import type { NearbyLocation } from '../types/nearBy.types';
import type { ViewportBounds } from '../hooks/useNearbyWithZoom';
import { SECTOR_CONFIG, DEFAULT_SECTOR } from '../../../shared/sectorConfig';
import { PRIMARY_MAIN } from '../../../shared/colors';
import { spreadOffsets, type PixelOffset } from '../../../shared/mapPinSpread';

setOptions({
  key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '',
  v: 'weekly',
});

// Hides Google POIs, transit icons, and road icons — only works without mapId
const CLEAN_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
];

function getSectorConfig(sector: string | null | undefined) {
  if (!sector) return DEFAULT_SECTOR;
  const key = sector.trim();
  // exact match first, then try title-case normalisation
  return (
    SECTOR_CONFIG[key] ??
    SECTOR_CONFIG[key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()] ??
    DEFAULT_SECTOR
  );
}

// Teardrop pin: sector-colored fill, white ring, white glyph. Holds on real tiles
// where a white-bodied pin washes out.
const PIN_BODY = 'M19 1C9.61 1 2 8.61 2 18c0 13.25 17 27 17 27S36 31.25 36 18C36 8.61 28.39 1 19 1z';

function makePinSvg(sector: string | null | undefined): string {
  const { color, iconPath } = getSectorConfig(sector);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="46" viewBox="0 0 38 46">
    <path d="${PIN_BODY}" fill="${color}" stroke="white" stroke-width="2.5"/>
    <g transform="translate(9,8) scale(0.833)" fill="white">
      <path d="${iconPath}"/>
    </g>
  </svg>`;
}

// `offset` (overlapping-pin spread) shifts the RENDERED icon in screen pixels while the
// marker keeps its true geographic position - anchor moves opposite the image.
function makePinIcon(sector: string | null | undefined, offset?: PixelOffset): google.maps.Icon {
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(makePinSvg(sector))}`,
    scaledSize: new google.maps.Size(30, 36),
    anchor: new google.maps.Point(15 - (offset?.dx ?? 0), 36 - (offset?.dy ?? 0)),
  };
}

// Selected pin: grows and gains a sector-tinted halo behind the head. The halo is
// baked into the SVG (Marker icons cannot layer), so the canvas is a 120px square
// with the pin tip at (60,110) and the head centered at (60,72).
function makeSelectedPinSvg(sector: string | null | undefined): string {
  const { color, iconPath } = getSectorConfig(sector);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
    <circle cx="60" cy="72" r="46" fill="${color}" opacity="0.16"/>
    <g transform="translate(33.4,47) scale(1.4)">
      <path d="${PIN_BODY}" fill="${color}" stroke="white" stroke-width="2.5"/>
      <g transform="translate(9,8) scale(0.833)" fill="white">
        <path d="${iconPath}"/>
      </g>
    </g>
  </svg>`;
}

function makeSelectedPinIcon(sector: string | null | undefined, offset?: PixelOffset): google.maps.Icon {
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(makeSelectedPinSvg(sector))}`,
    scaledSize: new google.maps.Size(96, 96),
    anchor: new google.maps.Point(48 - (offset?.dx ?? 0), 88 - (offset?.dy ?? 0)),
  };
}

const mapsLib = importLibrary('maps');

type Props = {
  locations: NearbyLocation[];
  onBusinessClick?: (locationId: number, loc: NearbyLocation) => void;
  userLocation?: { latitude: number; longitude: number } | null;
  onViewportChange?: (bounds: ViewportBounds) => void;
  /** When set (and changed), fly the map to this point. Used by search: tapping a result flies
   *  the map there, which shifts the viewport and lets the normal nearby fetch drop its marker. */
  focusLocation?: { lat: number; lng: number } | null;
  /** Currently selected location: its pin grows with a tinted halo, the rest dim. */
  selectedLocationId?: number | null;
};

function getViewportBounds(map: google.maps.Map): ViewportBounds | null {
  const bounds = map.getBounds();
  if (!bounds) return null;
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  return { minLat: sw.lat(), maxLat: ne.lat(), minLng: sw.lng(), maxLng: ne.lng() };
}

export default function BusinessMap({ locations, onBusinessClick, userLocation, onViewportChange, focusLocation, selectedLocationId }: Props) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersByLocRef = useRef<Map<number, google.maps.Marker>>(new Map());
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const onViewportChangeRef = useRef(onViewportChange);
  onViewportChangeRef.current = onViewportChange;
  const onBusinessClickRef = useRef(onBusinessClick);
  onBusinessClickRef.current = onBusinessClick;
  const [mapReady, setMapReady] = useState(false);
  // Suppresses duplicate idle events during programmatic moves (panTo/setZoom)
  const idleDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Last applied selection - lets the selection effect skip no-op passes
  const prevSelectedRef = useRef<number | null>(null);
  // Overlapping-pin pixel offsets by location id (see mapPinSpread.ts). Written by the
  // marker-sync effect, read by the selection effect so icon swaps keep the offset.
  const pinOffsetsRef = useRef<Map<number, PixelOffset>>(new Map());

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    mapsLib.then(({ Map }) => {
      if (cancelled || !containerRef.current) return;

      const map = new Map(containerRef.current, {
        // Fort Lauderdale: last-resort default, shown only until (or unless) a real
        // location arrives - browser geolocation first, IP-derived approximation second.
        center: { lat: 26.1224, lng: -80.1373 },
        zoom: 12,
        styles: CLEAN_STYLES,
        disableDefaultUI: true,
        clickableIcons: false,
      });

      mapRef.current = map;
      setMapReady(true);

      map.addListener('idle', () => {
        // Debounce rapid idle fires (e.g. setCenter + setZoom triggering two events)
        if (idleDebounceRef.current) clearTimeout(idleDebounceRef.current);
        idleDebounceRef.current = setTimeout(() => {
          const b = getViewportBounds(map);
          if (b) onViewportChangeRef.current?.(b);
        }, 80);
      });

    });

    return () => {
      cancelled = true;
      if (idleDebounceRef.current) clearTimeout(idleDebounceRef.current);
      markersByLocRef.current.forEach((m) => m.setMap(null));
      markersByLocRef.current.clear();
      userMarkerRef.current?.setMap(null);
      userMarkerRef.current = null;
      mapRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Sync business markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    // Overlapping-pin spread: pixel offsets baked into icon anchors (screen-space, so
    // separation is zoom-constant with ZERO work during gestures - fully smooth).
    const prevOffsets = pinOffsetsRef.current;
    const offsets = spreadOffsets(
      (locations ?? []).map((l) => ({ id: l.location_id, lat: Number(l.latitude), lng: Number(l.longitude) })),
    );
    pinOffsetsRef.current = offsets;

    const nextIds = new Set<number>();
    locations?.forEach((loc) => {
      const id = loc.location_id;
      nextIds.add(id);
      if (!markersByLocRef.current.has(id)) {
        const marker = new google.maps.Marker({
          map,
          position: { lat: Number(loc.latitude), lng: Number(loc.longitude) },
          icon: makePinIcon(loc.sector, offsets.get(id)),
          title: loc.name,
          cursor: 'pointer',
        });
        // Pass the location object up too, so the popup always has data to show even if the
        // viewport-nearby list has since refetched and dropped this location.
        marker.addListener('click', () => onBusinessClickRef.current?.(id, loc));
        markersByLocRef.current.set(id, marker);
      } else {
        // Group membership can change as the viewport refetches (a neighbor scrolls in or
        // out) - re-icon ONLY markers whose offset actually changed, so quiet refetches
        // never redraw the whole pin set.
        const prev = prevOffsets.get(id);
        const next = offsets.get(id);
        if (prev?.dx !== next?.dx || prev?.dy !== next?.dy) {
          markersByLocRef.current.get(id)!.setIcon(makePinIcon(loc.sector, next));
        }
      }
    });
    markersByLocRef.current.forEach((marker, id) => {
      if (!nextIds.has(id)) {
        marker.setMap(null);
        markersByLocRef.current.delete(id);
      }
    });
  }, [locations, mapReady]);

  // Selection treatment: the selected pin grows with a halo and rises above the rest,
  // which drop to 55% opacity. Runs after the marker-sync effect so newly created
  // markers (e.g. after a viewport refetch) pick up the current selection state too.
  useEffect(() => {
    if (!mapReady) return;
    // Markers are created in their normal state, so with no selection now and none
    // before there is nothing to restore - skip re-iconing 30 pins on every refetch.
    if (selectedLocationId == null && prevSelectedRef.current == null) return;
    prevSelectedRef.current = selectedLocationId ?? null;
    const sectorById = new Map(locations.map((loc) => [loc.location_id, loc.sector]));
    markersByLocRef.current.forEach((marker, id) => {
      const sector = sectorById.get(id);
      // Preserve the overlapping-pin offset through icon swaps.
      const offset = pinOffsetsRef.current.get(id);
      if (selectedLocationId == null) {
        marker.setIcon(makePinIcon(sector, offset));
        marker.setOpacity(1);
        marker.setZIndex(undefined as unknown as number);
      } else if (id === selectedLocationId) {
        marker.setIcon(makeSelectedPinIcon(sector, offset));
        marker.setOpacity(1);
        marker.setZIndex(1000);
      } else {
        marker.setIcon(makePinIcon(sector, offset));
        marker.setOpacity(0.55);
        marker.setZIndex(undefined as unknown as number);
      }
    });
  }, [selectedLocationId, locations, mapReady]);

  // User location marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation || !mapReady) return;

    const pos = { lat: Number(userLocation.latitude), lng: Number(userLocation.longitude) };

    if (userMarkerRef.current) {
      userMarkerRef.current.setPosition(pos);
    } else {
      const userSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
        <circle cx="11" cy="11" r="10" fill="${PRIMARY_MAIN}" opacity="0.25"/>
        <circle cx="11" cy="11" r="6" fill="${PRIMARY_MAIN}" stroke="white" stroke-width="2.5"/>
      </svg>`;
      userMarkerRef.current = new google.maps.Marker({
        map,
        position: pos,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(userSvg)}`,
          scaledSize: new google.maps.Size(22, 22),
          anchor: new google.maps.Point(11, 11),
        },
        title: 'Your location',
        zIndex: 999,
      });
    }

    // Use setCenter + setZoom (no animation) to trigger only a single idle event.
    // Zoom 12 = district scale (user request 2026-08-17: 14 landed too close in) -
    // shows the wider area's businesses on first load; the 30-row response cap
    // bounds the payload regardless of viewport size.
    map.setCenter(pos);
    map.setZoom(11);
  }, [userLocation, mapReady]);

  // Fly to a searched business. panTo animates; the resulting idle fires onViewportChange, so the
  // normal nearby fetch pulls in that area (and its marker) for the new viewport.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !focusLocation) return;
    map.panTo({ lat: Number(focusLocation.lat), lng: Number(focusLocation.lng) });
    map.setZoom(15);
  }, [focusLocation, mapReady]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%', borderRadius: '8px' }} />;
}
